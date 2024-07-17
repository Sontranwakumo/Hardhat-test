// contracts/HelloWorld.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

/**
 * contract NFT {
 *
 *  NFT.connect(ownerNFT).approve(marketplace, tokenID)
 *
 * marketPlace.connect(ownerNFT).publish(NFT, tokenId)
 *  + NFT.connect(marketPlace).transferFrom(owerNFT, marketPlace, tokenId);
 *  +
 * }
 */
contract NFT1155A is ERC1155, Ownable {
    uint256 _tokenIdCounter;
    
    constructor(
        string memory uri
    ) ERC1155(uri) Ownable(msg.sender) {}

    function mint(address to, uint256 value) external onlyOwner {
        _mint(to,_tokenIdCounter++,value,"");
    }
}

contract NFT721B is ERC721, Ownable {
    uint _tokenIdCounter;

    constructor(
        address owner,
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) Ownable(owner) {}

    function mint(address to) external onlyOwner {
        _mint(to, _tokenIdCounter++);
    }
    // _transfer from
}

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
    uint256 endblock;
    uint minValue;
    address bestBidder;
    uint bestValue;
    bool isClose;
}

contract Market is Ownable {

    mapping(address => uint256) nonces;
    mapping(address => mapping(uint256 => OfferInfo)) offerInfos;//publisher, nonces -> offerinfo
    mapping(address => uint256) pendingWithdraw;

    constructor() Ownable(msg.sender) {

    }

    function publish(address nft_address, uint256 tokenID, TokenType tokentype,uint256 tokenCount, uint256 minCost) public {
        //update nonces
        uint256 nonce = nonces[msg.sender]++;
        offerInfos[msg.sender][nonce] = OfferInfo({
            publisher: msg.sender,
            tokenType: tokentype,
            tokenAddress: nft_address,
            tokenCount: tokenCount,
            tokenID: tokenID,
            endblock: block.number + 10,
            minValue: minCost,
            bestValue: 0,
            bestBidder: address(0),
            isClose: false
        });
        //transferOwnership of NFT
        if (tokentype == TokenType.ERC721) {
            IERC721(nft_address).safeTransferFrom(msg.sender, address(this), tokenID);
        } else if (tokentype == TokenType.ERC1155) {
            IERC1155(nft_address).safeTransferFrom(msg.sender, address(this), tokenID, tokenCount, "");
        }
    }
    function withdraw() public{
        // Withdraw when oldOwner sold the NFT
        // Or when bidder lose the auction
        uint256 amount = pendingWithdraw[msg.sender];
        require(amount > 0, "No funds to withdraw");
        pendingWithdraw[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    function claim(address publisher, uint256 nonce) public{
        // if msg.sender is winner of offer, he could claim his token
        OfferInfo storage offer = offerInfos[publisher][nonce];
        require(block.number > offer.endblock, "Auction not ended");
        require(msg.sender == offer.bestBidder, "Not the highest bidder");
        require(!offer.isClose, "Offer is already closed");

        offer.isClose = true;

        if (offer.tokenType == TokenType.ERC721) {
            IERC721(offer.tokenAddress).safeTransferFrom(address(this), msg.sender, offer.tokenID);
        } else if (offer.tokenType == TokenType.ERC1155) {
            IERC1155(offer.tokenAddress).safeTransferFrom(address(this), msg.sender, offer.tokenID, offer.tokenCount, "");
        }

        pendingWithdraw[offer.publisher] += offer.bestValue;
    }

    function Bid(address publisher, uint256 nonce) public payable{
        // Bid for an offer with parameter
        OfferInfo storage offer = offerInfos[publisher][nonce];
        require(block.number <= offer.endblock, "Auction ended");
        require(msg.value > offer.bestValue && msg.value >= offer.minValue, "Bid too low");
        require(!offer.isClose,"Auction ended");

        if (offer.bestBidder != address(0)) {
            pendingWithdraw[offer.bestBidder] += offer.bestValue;
        }

        offer.bestValue = msg.value;
        offer.bestBidder = msg.sender;
    }
    function destroy(address publisher, uint256 nonce) public onlyOwner{
        // Owner could destroy an Auction, return NFT to owner and return ETH
        OfferInfo storage offer = offerInfos[publisher][nonce];
        require(!offer.isClose, "Offer is already closed");

        offer.isClose = true;

        if (offer.tokenType == TokenType.ERC721) {
            IERC721(offer.tokenAddress).safeTransferFrom(address(this), offer.publisher, offer.tokenID);
        } else if (offer.tokenType == TokenType.ERC1155) {
            IERC1155(offer.tokenAddress).safeTransferFrom(address(this), offer.publisher, offer.tokenID, 1, "");
        }

        if (offer.bestBidder != address(0)) {
            pendingWithdraw[offer.bestBidder] += offer.bestValue;
        }
    }

}
