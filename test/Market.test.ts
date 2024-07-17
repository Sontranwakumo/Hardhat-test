import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { Auction, NFT721 } from "../typechain-types";
import { expect } from "chai";
const {
  loadFixture,
  time,
  mine,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
describe.only("Exercise 3",()=>{
  describe("NFT1155A", function () {
    let NFT1155A: any;
    let nft1155A: any;
    let owner: any;
    let user1: any,user2:any;
    
    beforeEach(async function () {
      [owner, user1, user2] = await ethers.getSigners();
      NFT1155A = await ethers.getContractFactory("NFT1155A");
      nft1155A = await NFT1155A.deploy("localhost");
      console.log("NFT1155A deployed to address:", nft1155A.target);
      
    });
    
    it("Should allow owner to mint", async function () {
      await nft1155A.mint(user1.address, 100);
      const balance = await nft1155A.balanceOf(user1.address, 0);
      expect(balance).to.equal(100);
    });
    
    it("Should not allow non-owner to mint", async function () {
      await expect(
        nft1155A.connect(user1).mint(user1.address, 100)
      ).to.be.reverted;
    });
  });
  
  describe("NFT721B", function () {
    let NFT721B: any;
    let nft721B: any;
    let owner: any;
    let user1: any;
    let user2: any;
    
    beforeEach(async function () {
      [owner, user1,user2] = await ethers.getSigners();
      NFT721B = await ethers.getContractFactory("NFT721B");
      nft721B = await NFT721B.deploy(owner.address,"NFT721","NFT");
    });
    
    it("Should allow owner to mint", async function () {
      await nft721B.mint(user1.address);
      const ownerOfToken = await nft721B.ownerOf(0);
      expect(ownerOfToken).to.equal(user1.address);
    });
    
    it("Should not allow non-owner to mint", async function () {
      await expect(nft721B.connect(user1).mint(user1.address)).to.be.reverted;
    });
  });
});