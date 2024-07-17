// contracts/HelloWorld.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract NFT721 is ERC721, Ownable {
    
    uint256 _tokenIdCounter;
    mapping(address => bool) _hasMinterRoles;
    constructor(address owner, string memory name, string memory symbol) ERC721(name, symbol) Ownable(owner){

    }
    modifier hasMinterRole {
        require(_hasMinterRoles[msg.sender]);
        _;
    }

    function setMinterRole(address minter, bool hasRole) external onlyOwner {
        _hasMinterRoles[minter] = hasRole;
    }

    function mint(address to) external hasMinterRole {
        _mint(to, _tokenIdCounter++);
    }
}

contract Auction is Ownable { 
    address public erc721;
    uint public _endblock;
    address public bestBider;
    uint public bestValue;
    constructor(address cn) Ownable(msg.sender){
        erc721 = cn;
        _startNew();
    }

    // start new 
    /**
     * reset best bid
     * reset best value
     */
    event StartNew(uint256 blockStart, uint256 blockEnd);
    function _startNew() internal {
        _endblock = block.number+10;
        bestBider = address(0);
        bestValue = 0;

        emit StartNew(block.number, _endblock);
    }
    /**
     * 
     */
    modifier bidable(){
        require(block.number<_endblock,"Session ended");
        require(msg.value>bestValue, "There is a higher bid");
        _;
    }

    event Bid(address bidder, uint256 value, uint256 biddedAt);
    function bid() external payable bidable{
        payable(bestBider).transfer(bestValue);
        bestBider = _msgSender();
        bestValue = msg.value;

        emit Bid(msg.sender, msg.value, block.timestamp);
    }
    modifier claimable(){
        require(block.number>=_endblock, "Round is not ended");
        require(msg.sender == bestBider|| (bestBider==address(0)&& msg.sender==owner()), "You are not winner");
        _;
    }

    function claim() external claimable {
        // check claimable 
        // check msg.sender

        NFT721(erc721).mint(msg.sender);
        _startNew();
    }

    /**
     * 
     */
    function withdraw() external onlyOwner{
        uint amount = address(this).balance - bestValue;
        require(amount>0,"Withdraw fail");
        payable(owner()).transfer(amount);
    }
}

/**
 * Contract
 * owner 
 * user1 
 * user2 
 * 
 * user1.bid(5)
 *  + balance contract: 5
 *  + balance user1: -5
 * 
 * user2.bid(8)
 *  + balance contract: 13
 *  + balance user2: -8
 *  + balance user1: +5 
 *  + balance contract: 8
 * 
 * user2.claim()
 *  + mint NFT 
 *  + best value = 0
 * - withdraw: 
 */

// contract Auction is ERC721,Ownable {

//     uint _tokenCounter;
//     uint _endblock;// endblock[tokenid] = number of ending block
//     address bestBider;
//     uint public bestValue;
//     mapping(address => uint) pendingReturn;
//     constructor(address owner, string memory name, string memory symbol) ERC721(name, symbol) Ownable(owner){
//         console.log("msg.sender",msg.sender);
//        _tokenCounter = 0;
//        _startnew();
//     }

//     modifier bidable() {
//         require(block.number < _endblock, "end bid");
//         _;
//     }

//     /**
//      * - require:
//      *  + block.number > endBlock
//      *  + msg.sender == bestbidder | msg.sender == owner
//      * 
//      * - bestBidder == address(0):
//      *   + Xoa (msg.sender).approve(address(0), _tokenIdCounter, msg.sender)
//      * - msg.sender == bidder | msg.sender == owner:
//      *   + transfer ETH -> owner
//      *   + transfer NFT token -> bestBidder
//      * 
//      * - Start new 
//      */
//     function claim() external {
//         require(block.number >= _endblock, "Round not end yet");
//         require(_msgSender() == bestBider || _msgSender() == owner(), "You are not related to this transaction");
//         // owner claim 
//         if (bestBider == address(0)){
//             //no one bid, delete approval of contract
//             _approve(address(0),_tokenCounter,msg.sender);
//         } else {
//             // send ETH from contract
//             address oldowner = owner();
//             transferFrom(oldowner, bestBider, _tokenCounter);
//             payable(oldowner).transfer(bestValue);
//         }
//         _startnew();
//     }

//     function bid() public payable bidable{
//         require(msg.value > bestValue, "There is a higher bid");
//         if (bestBider != address(0)){
//             pendingReturn[bestBider] +=bestValue;
//         }
//         bestBider = msg.sender;
//         bestValue = msg.value;

//     }

//     function withdraw() public returns(bool){
//         uint amount = pendingReturn[msg.sender];
//         require(amount>0,"You have withdraw all");
//         if (!payable(msg.sender).send(amount)){
//             return false;
//         }
//         pendingReturn[msg.sender]=0;
//         return true;
//     }
//     function _startnew() private{
//         // Set new block ending
//         // Only called by constructor or claimer (who win the auction)
//        _tokenCounter+=1;
//        _mint(owner(),_tokenCounter);
//         console.log("Start new round");
//         _endblock = block.number + 3;
//         bestBider = address(0);
//         bestValue = 0;
//         _approve(address(this),_tokenCounter,address(0),false);
//     }

//     function message() public pure returns(string memory){
//         return "Deploy successfully";
//     }
//     function getBlockNumber() public view returns(uint,uint){
//         return (block.number,_endblock);
//     }
// }
