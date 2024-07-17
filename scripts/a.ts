import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();
// scripts/deploy.js
// init harhdat node
const ctadress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

async function main() {
    await ownable();
}
async function check_owner() {
    const [deployer,user1] = await ethers.getSigners();
    const contract = await ethers.getContractAt("MyToken",ctadress,deployer);
    console.log("Owner Balances: ",await contract.balanceOf(deployer));
    console.log(await contract.message());
}

async function mint() {
    const mint_value = ethers.parseUnits("52442",9);
    const [deployer,user1] = await ethers.getSigners();
    const contract = await ethers.getContractAt("MyToken",ctadress,deployer);
    const mint_tx = await contract.mint(user1,mint_value);
    await mint_tx.wait();
    const user1blc = await contract.balanceOf(user1);
    console.log("User1's balance: ",user1blc);
    // oke
}

async function transferAtoB() {
    const [deployer,A,B] = await ethers.getSigners();
    const contract = await ethers.getContractAt("MyToken",ctadress,A);
    const trans_value = ethers.parseUnits("100",await contract.decimals());
    const tx = await contract.transfer(B,trans_value);
    await tx.wait();
    console.log("A:",await contract.balanceOf(A));
    console.log("B:",await contract.balanceOf(B));
}

async function approve_and_checkAllowance() {
    const [deployer,A,B] = await ethers.getSigners();
    const contract = await ethers.getContractAt("MyToken",ctadress,A);
    const appr_value = ethers.parseUnits("50",await contract.decimals());
    const tx = await contract.approve(B,appr_value);
    await tx.wait();
    const val = await contract.allowance(A,B);// A is owner, B is spender
    console.log("Allowance: ",val);
}

async function transferFromAtoB() {
    const [deployer,A,B] = await ethers.getSigners();
    const contract = await ethers.getContractAt("MyToken",ctadress,A);
    const transF_value = ethers.parseUnits("50",await contract.decimals());
    const tx1 = await contract.approve(A,transF_value);
    await tx1.wait();
    const tx = await contract.transferFrom(A,B,transF_value);
    await tx.wait(0);
    // A send from A to B
    console.log("A:",await contract.balanceOf(A));
    console.log("B:",await contract.balanceOf(B));
}

async function transferFromAtoB_2() {
    // Transfer from A to B 50 token but B is sender.
    const [deployer,A,B] = await ethers.getSigners();
    const contract = await ethers.getContractAt("MyToken",ctadress,A);
    const transF_value = ethers.parseUnits("50",await contract.decimals());
    const tx1 = await contract.approve(B,transF_value);
    await tx1.wait();

    const contractB = await ethers.getContractAt("MyToken",ctadress,B);
    const tx = await contractB.transferFrom(A,B,transF_value);
    await tx.wait(0);
    // B send from A to B
    console.log("A:",await contractB.balanceOf(A));
    console.log("B:",await contractB.balanceOf(B));
}

async function burn() {
    // A burn his wallet himself
    const [deployer,A,B] = await ethers.getSigners();
    const contract = await ethers.getContractAt("MyToken",ctadress,A);
    const burn_val = ethers.parseUnits("10",await contract.decimals());
    const tx = await contract["burn(uint256)"](burn_val);
    await tx.wait();
    console.log("A:",await contract.balanceOf(A));
    
}

async function ownable() {
    //demo that just owner can burn
    const [deployer,A,B] = await ethers.getSigners();
    const contract = await ethers.getContractAt("MyToken",ctadress);
    const burn_val = ethers.parseUnits("10",await contract.decimals());
    let tx = await contract["burn(address,uint256)"](A,burn_val);await tx.wait()// success
    tx = await contract["burn(address,uint256)"](B,burn_val);await tx.wait()// success

    const contractB = await ethers.getContractAt("MyToken",ctadress,A);// now A is msg.sender
    try{
        tx = await contractB["burn(address,uint256)"](B,burn_val);await tx.wait();// fail
    }catch(error){
        console.log(error);
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
