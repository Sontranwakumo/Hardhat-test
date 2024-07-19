// pragma solidity ^0.8.24;
// import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
// import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
// contract UpgradeableV1 is ERC1967Proxy, UUPSUpgradeable {
//  string public x;
//  string public y;

//  function _authorizeUpgrade(address implement) internal virtual override {
//     // require(msg.sender == Son)
//  }
//  constructor(address implement, bytes memory data) ERC1967Proxy(implement, data) {

//  }

//  function test(address cn) external virtual  {
//     // V1 -> V2 + data = 0x9cad652400000000000000000000000000000005
//     UpgradeableV2(cn).testB(5);
//     cn.call(abi.encodeWithSignature('testB(uint256)', 5));
//     // cn.call(id('testB(uint256)', 5))
//  }
// }

// contract UpgradeableV2 {
// uint256 public testValue;

// function setTestValue() external {
//     testValue = 5;
// }

// function test(address cn) external override virtual {
//     // super.test(cn);
//     //qlwkenqlwen
// }
// function testB(uint256 value) external {
//     // msg.sender = V1
//     x = value;
// }
// }