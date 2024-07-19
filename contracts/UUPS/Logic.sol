// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
// import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";


// contract LogicContract is Initializable,UUPSUpgradeable {
//     uint256 public value;

//     function initialize(uint256 _value) public initializer {
//         value = _value;
//     }

//     function setValue(uint256 _value) public {
//         value = _value;
//     }
//     function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

// }

// contract LogicContractV2 is Initializable {
//     uint256 public value;

//     function initialize(uint256 _value) public initializer {
//         value = _value*2;
//     }

//     function setValue(uint256 _value) public {
//         value = _value*2;
//     }
// }
