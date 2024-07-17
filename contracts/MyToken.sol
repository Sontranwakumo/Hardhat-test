// contracts/HelloWorld.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract MyToken is ERC20,Ownable {
    constructor(address owner, string memory name, string memory symbol) ERC20(name, symbol) Ownable(owner){
        console.log("msg.sender",msg.sender);
        _mint(owner,10**6*10**decimals());
    }
    function decimals() public pure override returns(uint8){
        return 9;
    }
    function mint(address to, uint value) public onlyOwner{
        _mint(to,value);
    }
    function burn(address to, uint value) public onlyOwner{
        _burn(to,value);
    }
    function burn(uint value) public{
        _burn(msg.sender, value);
    }
    function message() public pure returns(string memory){
        return "Deploy successfully";
    }
}
