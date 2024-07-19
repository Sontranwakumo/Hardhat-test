pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";
// import "./Beacon.sol";

contract Beacon is Ownable{
    address public implementation;

    constructor(address _implementation) Ownable(msg.sender) {
        implementation = _implementation;
    }

    function updateImplementation(address _newImplementation) public onlyOwner {
        implementation = _newImplementation;
    }
}

contract BeaconProxy {
    address public beacon;

    constructor(address _beacon) {
        beacon = _beacon;
    }

    fallback() external payable {
        address impl = Beacon(beacon).implementation();
        require(impl != address(0), "Implementation contract not set");

        assembly {
            let ptr := mload(0x40)
            calldatacopy(ptr, 0, calldatasize())
            let result := delegatecall(gas(), impl, ptr, calldatasize(), 0, 0)
            let size := returndatasize()
            returndatacopy(ptr, 0, size)
            switch result
            case 0 { revert(ptr, size) }
            default { return(ptr, size) }
        }
    }
}