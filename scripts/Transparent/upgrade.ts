import {ethers,upgrades}from "hardhat";
import { contracts } from "../../typechain-types";
import '@openzeppelin/contracts/build/ProxyAdmin.json';
async function main() {
    const LogicContractV2 = await ethers.getContractFactory("LogicContractV2");
    console.log("Upgrading to LogicContractV2...");

    const proxyAddress = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";
    await upgrades.upgradeProxy(proxyAddress, LogicContractV2);

    console.log("LogicContract upgraded to V2");

    // deploy imple V1
    const [deployer] = await ethers.getSigners();
    const logicV1 = await ethers.deployContract('TestLogicV1')
    let data = logicV1.interface.encodeFunctionData('initialize', [])
    let transparent = await ethers.deployContract('TransparentUpgradeableProxy', [logicV1.target, deployer.address, data])
    // tuong tac voi proxy
    // anyone -> transparent -> d-call
    // anyOne -> proxyAdmin -> transparent -> msg.data == upgradeToAndCall ? upgrade : revert 
    transparent = await ethers.getContractAt('TestLogicV1', transparent.target)
    upgrades.erc1967.getAdminAddress(transparent.target)
    proxyAdmin = await ethers.getContractAt('TestProxyAdmin', '0xCafac3dD18aC6c6e92c921884f9E4176737C052c')
    /**
     * from: deployer
     * to: transparent proxy
     * data: value1()
     */
    await transparent.value1();

    // upgradeV2 
    const logicV2 = await ethers.deployContract('TestLogicV2')

    // Chi upgrade
    data = '0x'

    // Upgrade + call setValue

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
