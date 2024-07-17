import { ethers } from "hardhat";
import * as dotenv from "dotenv"; dotenv.config({path:"./.env"});


async function main() {
    const [deployer, user1, user2] = await ethers.getSigners();
    const NFT721 = await ethers.getContractFactory("NFT721");
    const nft721 = await NFT721.deploy(deployer.address,"NFT721","NFT");
    console.log("NFT721 deployed to address:", nft721.target);

    const Auction = await ethers.getContractFactory("Auction");
    const auction = await Auction.deploy(nft721.target
    );
    console.log("Auction deployed to address:", auction.target);

    
    await nft721.setMinterRole(auction.target,true);
    // await auction.connect(user1).bid({value: 1})
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
