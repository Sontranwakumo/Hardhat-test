// contracts/HelloWorld.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";


enum TokenType {
    ERC721,
    ERC1155
}
struct OfferInfo {
    // information of an auction
    address publisher;
    TokenType tokenType;
    address tokenAddress;
    uint tokenID;
    uint256 tokenCount;
    uint256 endTime;
    address bestBidder;
    uint bestValue;
    bool isClose;
}

contract Market is Ownable,ERC721Holder, ERC1155Holder{
    mapping(address => uint256) nonces;
    mapping(address => mapping(uint256 => OfferInfo)) public offerInfos; //publisher, nonces -> offerinfo
    mapping(address => uint256) pendingWithdraw;

    constructor() Ownable(msg.sender) {}

    function publish(
        address nft_address,
        uint256 tokenID,
        TokenType tokentype,
        uint256 tokenCount,
        uint256 minCost,
        uint256 endTime
    ) public {
        //update nonces
        uint256 nonce = nonces[msg.sender]++;
        offerInfos[msg.sender][nonce] = OfferInfo({
            publisher: msg.sender,
            tokenType: tokentype,
            tokenAddress: nft_address,
            tokenCount: tokenCount,
            tokenID: tokenID,
            endTime: endTime,
            bestValue: minCost,
            bestBidder: msg.sender,
            isClose: false
        });
        //transferOwnership of NFT
        if (tokentype == TokenType.ERC721) {
            IERC721(nft_address).safeTransferFrom(
                msg.sender,
                address(this),
                tokenID
            );
        } else {
            IERC1155(nft_address).safeTransferFrom(
                msg.sender,
                address(this),
                tokenID,
                tokenCount,
                ""
            );
        }
    }

    function withdraw() public {
        // Withdraw when oldOwner sold the NFT
        // Or when bidder lose the auction
        uint256 amount = pendingWithdraw[msg.sender];
        require(amount > 0, "No funds to withdraw");
        pendingWithdraw[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    function claim(address publisher, uint256 nonce) public {
        // if msg.sender is winner of offer, he could claim his token
        OfferInfo storage offer = offerInfos[publisher][nonce];
        require(!offer.isClose, "Offer is already closed");
        require(block.timestamp > offer.endTime, "Auction not ended");
        require(msg.sender == offer.bestBidder, "Not the highest bidder");

        offer.isClose = true;

        if (offer.tokenType == TokenType.ERC721) {
            IERC721(offer.tokenAddress).safeTransferFrom(
                address(this),
                msg.sender,
                offer.tokenID
            );
        } else{
            IERC1155(offer.tokenAddress).safeTransferFrom(
                address(this),
                msg.sender,
                offer.tokenID,
                offer.tokenCount,
                ""
            );
        }

        pendingWithdraw[offer.publisher] += offer.bestValue;
    }

    function Bid(address publisher, uint256 nonce) public payable {
        // Bid for an offer with parameter
        OfferInfo storage offer = offerInfos[publisher][nonce];
        require(offer.publisher != address(0), "Offer does not exist");
        require(!offer.isClose, "Offer is already closed");
        require(block.timestamp <= offer.endTime, "Auction ended");
        require(msg.value > offer.bestValue, "Bid too low");

        if (offer.bestBidder != offer.publisher) {// nếu đã có người bid rồi
            pendingWithdraw[offer.bestBidder] += offer.bestValue;
        }
        offer.bestValue = msg.value;
        offer.bestBidder = msg.sender;
    }

    function destroy(address publisher, uint256 nonce) public onlyOwner {
        // Owner could destroy an Auction, return NFT to owner and return ETH
        OfferInfo storage offer = offerInfos[publisher][nonce];
        require(offer.publisher != address(0), "Offer is not exist");
        require(!offer.isClose, "Offer is already closed");

        offer.isClose = true;

        if (offer.tokenType == TokenType.ERC721) {
            IERC721(offer.tokenAddress).safeTransferFrom(
                address(this),
                offer.publisher,
                offer.tokenID
            );
        } else{
            IERC1155(offer.tokenAddress).safeTransferFrom(
                address(this),
                offer.publisher,
                offer.tokenID,
                offer.tokenCount,
                ""
            );
        }

        if (offer.bestBidder != offer.publisher) {
            // pendingWithdraw[offer.bestBidder] += offer.bestValue;
            payable(offer.bestBidder).transfer(offer.bestValue);
        }
    }
}
