import { ethers } from "hardhat";
import * as dotenv from "dotenv"; dotenv.config({path:"./.env"});


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
