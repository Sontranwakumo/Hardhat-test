import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import { EthersError} from "ethers";
dotenv.config();
// scripts/deploy.js
// init harhdat node
const nftadress = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";
const ctadress = "0x610178dA211FEF7D417bC0e6FeD39F05609AD788";

async function check_owner() {
    const [deployer,user1] = await ethers.getSigners();
    const contract = await ethers.getContractAt("NFT721",ctadress,deployer);
    console.log("Owner Balances: ",await contract.balanceOf(deployer));
}

async function bid(userid: number,value: number) {
    // bid on value (eth)
    const cvalue = ethers.parseEther(value.toString());
    const users = await ethers.getSigners();
    const user = users[userid];
    const contract = await ethers.getContractAt("Auction",ctadress,user);
    try{

        let tx = await contract.bid({
            value: cvalue
        });
        await tx.wait();
        
    }catch(error){
        const etherserr = error as EthersError;
        console.log(etherserr.message);
    }
    const NFTct = await ethers.getContractAt("NFT721",nftadress,user);
    console.log("Owner NFT: ", await NFTct.balanceOf(user));
    console.log("Owner ETH balance: ",(await user.provider.getBalance(user.address)));
}

async function claim(userid: number) {
    // only Old owner and new Owner can call this function
    const users = await ethers.getSigners(); const user = users[userid];
    try{
        const contract = await ethers.getContractAt("Auction",ctadress,user);
        const tx = await contract.claim();
        await tx.wait();
        const NFTct = await ethers.getContractAt("NFT721",nftadress,user);
        console.log("Owner NFT: ", await NFTct.balanceOf(user));
    }catch(error){
        console.log("You are not related to the transactions");
    }
}
async function getInformation() {
    const users = await ethers.getSigners();const user = users[0];
    const contract = await ethers.getContractAt("Auction",ctadress,users[0]);
    const blocknum = await user.provider.getBlockNumber();
    console.log("Block number: ", blocknum);
    console.log("Block ending: ",await contract._endblock());
    console.log("BestBider ", await contract.bestBider());
    for(let i: number = 0; i<20; i++){
        if (users[i].address==await contract.bestBider()){console.log(i); break;}
    }
    console.log("Bestvalue ", await contract.bestValue());
    for (let i: number = 0; i<20; i++){
        async function getBalance() {
            const adr = users[i]
            const ct = await ethers.getContractAt("NFT721",nftadress);
            const val = await ct.balanceOf(adr);
            if (val>0){
                console.log(`User${i} have ${val} tokens`);
            }
        }
        await getBalance();
    }
}
async function main() {
    //await bid(2,2);
    // await bid(1,3);
    //awati bid(3,4);
    await claim(3);
    console.log("---------");
    await getInformation();
}
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
