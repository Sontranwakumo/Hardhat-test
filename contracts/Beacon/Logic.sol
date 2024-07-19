// contracts/HelloWorld.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract LogicV1 {
    uint256 public value;

    function setValue(uint256 _value) public {
        value = _value;
    }
}

contract LogicV2 {
    uint256 public value;

    function setValue(uint256 _value) public {
        value = _value*2;
    }
}
