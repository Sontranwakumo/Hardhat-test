import { ethers } from "hardhat";
import * as dotenv from "dotenv"; dotenv.config({path:"./.env"});

/*

NFT1155: 0x5FbDB2315678afecb367f032d93F642f64180aa3
NFT721: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
Market: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
user1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8

*/


async function main() {

    // deploy nft1155A
    const [deployer, user1, user2] = await ethers.getSigners();
    const NFT1155A = await ethers.getContractFactory("NFT1155A");
    const nft1155A = await NFT1155A.deploy("localhost");
    console.log("NFT1155A deployed to address:", nft1155A.target);
    
    const NFT721B = await ethers.getContractFactory("NFT721B");
    const nft721B = await NFT721B.deploy(deployer.address,"NFT721","NFT");
    console.log("NFT721B deployed to address:", nft721B.target);

    const Market = await ethers.getContractFactory("Market");
    const market = await Market.deploy();
    console.log("Auction deployed to address:", market.target);

    // const blocknum = await deployer.provider.getBlockNumber();
    // const block = await deployer.provider.getBlock(blocknum);
    // const time = block?.timestamp;
    // console.log(blocknum);
    // console.log(time)

    nft721B.mint(user1);
    // await nft721.setMinterRole(auction.target,true);
    // const hashTopics = ethers.id('Transfer(address,address,uint256)')
    // const filter = {
    //     fromBlock: '0x1361c77',
    //     toBlock: '0x1361ca9',
    //     topics: [
    //         hashTopics
    //     ]
    // }
    // await auction.connect(user1).bid({value: 1})
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
