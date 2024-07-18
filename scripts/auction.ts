import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import { EthersError} from "ethers";
dotenv.config();
// scripts/deploy.js
// init harhdat node
const nftadress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
const ctadress = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";

async function check_owner() {
    const [deployer,user1] = await ethers.getSigners();
    const contract = await ethers.getContractAt("NFT721B",ctadress,deployer);
    console.log("Owner Balances: ",await contract.balanceOf(deployer));
}
async function main() {
    console.log("---------");
    await getInformation();
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
    const contract = await ethers.getContractAt("Market",ctadress,users[0]);
    const blocknum = await user.provider.getBlockNumber();
    const block = await user.provider.getBlock(blocknum);
    const time = await block?.timestamp;
    console.log("Block number: ", blocknum);
    console.log("Timestamp: ",time);
}
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
