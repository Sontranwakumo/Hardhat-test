pragma solidity ^0.8.0;
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

contract TestLogicV1 is Initializable{
    uint256 public value1;
    
    function initialize() initializer public {
        value1 = 1;
    }

    function setValue(uint256 _value) public virtual {
        value1 = _value;
    }
}

contract TestLogicV2 is TestLogicV1 {
    uint256 public value2;

    function setValue(uint256 _value) public virtual override {
        value2 = _value;
    }
}

contract TestProxyAdmin is ProxyAdmin {

    constructor(address initialOwner) ProxyAdmin(initialOwner) {
    }
}

contract TestUpgradeableTransparent is TransparentUpgradeableProxy {
    constructor(address _logic, address initialOwner, bytes memory _data) payable TransparentUpgradeableProxy(_logic, initialOwner, _data) {
    }
}