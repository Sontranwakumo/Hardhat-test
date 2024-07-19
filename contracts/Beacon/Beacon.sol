// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";

contract Beacon is Ownable{
    address public implementation;

    constructor(address _implementation) Ownable(msg.sender) {
        implementation = _implementation;
    }

    function updateImplementation(address _newImplementation) public onlyOwner {
        implementation = _newImplementation;
    }
}
