import { ethers } from "hardhat";
import * as dotenv from "dotenv";import { proxy } from "../../typechain-types/@openzeppelin/contracts";
 dotenv.config({path:"./.env"});

let logic1:any;

async function main() {
    const [deployer, user1, user2] = await ethers.getSigners();
    const LogicContract = await ethers.getContractFactory("LogicContract");
    const logicContract = await LogicContract.deploy();
    logic1 = logicContract.target;
    console.log("LogicContract deployed to:", logicContract.target);

    await logicContract.setValue(100);
    console.log(await logicContract.value());
    const ProxyAdmin = await ethers.getContractFactory("MyAdmin");
    const proxyAdmin = await ProxyAdmin.deploy();
    console.log("ProxyAdmin deployed to:", proxyAdmin.target);

    const data = logicContract.interface.encodeFunctionData("initialize", [100]);
    const MyTransparentProxy = await ethers.getContractFactory("MyTransparentPX");
    const myTransparentProxy = await MyTransparentProxy.deploy(logicContract.target, proxyAdmin.target,data);
    console.log("MyTransparentProxy deployed to:", myTransparentProxy.target);

    // myTransparentProxy.setValue(200);
}
/** */

async function upgrade(){
    const [deployer, user1, user2] = await ethers.getSigners();
    const LogicContract = await ethers.getContractFactory("LogicContractV2");
    const proxyAddress = logic1;

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
