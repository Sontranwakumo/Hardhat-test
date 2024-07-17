import {ethers} from 'hardhat';
import {HardhatEthersSigner} from '@nomicfoundation/hardhat-ethers/signers'
import { Auction, NFT721 } from '../typechain-types';
import {expect} from 'chai';
const {
    loadFixture, time, mine
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

  describe("NFT721", function () {
    let NFT721;
    let nft:NFT721;
    let deployer:HardhatEthersSigner;
    let addr1:HardhatEthersSigner;
    let addr2:HardhatEthersSigner;
  
    beforeEach(async function () {
      [deployer, addr1, addr2] = await ethers.getSigners();
      NFT721 = await ethers.getContractFactory("NFT721");
      nft = await NFT721.deploy(deployer.address,"NFT721","NFT");
      
    });
  
    it("Should set the right owner", async function () {
      expect(await nft.owner()).to.equal(deployer.address);
    });
  
    it("Should allow owner to set minter role", async function () {
      expect(await nft.connect(deployer).setMinterRole(addr1.address, true)).to.be.not.reverted;
    });
  
    it("Should not allow non-owner to set minter role", async function () {
        await expect(nft.connect(addr1).setMinterRole(addr1.address, true)).to.be.reverted;
    });
  
    it("Should allow minter to mint", async function () {
      await nft.connect(deployer).setMinterRole(addr1.address, true);
      await nft.connect(addr1).mint(addr2.address);
      await expect(nft.connect(addr1).mint(addr2.address)).to.be.not.reverted;
      expect(await nft.ownerOf(0)).to.equal(addr2.address);
    });
    it("Should not allow non-minter to mint", async function () {
      await expect(nft.connect(addr1).mint(addr2.address)).to.be.reverted;
    });
  });

describe('Auction contracts', () => {
async function deployNFT721() {
    const [deployer] = await ethers.getSigners();
    const nft721 = await ethers.deployContract('NFT721', [deployer.address, 'asd', 'asd']);
    return nft721;
}

async function deployAuction(nft721Address: string) {
    const auction = await ethers.deployContract('Auction', [nft721Address]);
    return auction;
}

async function deploy() {
    const erc721 = await deployNFT721();
    const auction = await deployAuction(erc721.target as string);
    // set minter role 
    await erc721.setMinterRole(auction.target, true);
    return {auction, erc721};
}

let erc721, auction: Auction;
let deployer: HardhatEthersSigner;
let user1: HardhatEthersSigner;
let user2: HardhatEthersSigner;
let signers: HardhatEthersSigner[];
    before(async() => {
        ([deployer, user1, user2, ...signers] = await ethers.getSigners());
    })
    beforeEach(async() => {
        ({erc721, auction} = await loadFixture(deploy));
        console.log("init2")
    })
    // test 
    describe('Bid ', () => {
        describe('bid sucess', () => {
            it('should emit event', async() => {
                await expect(auction.connect(user1).bid({value: 1})).to.be.not.reverted;
                await expect(auction.connect(user1).bid({value: 2})).to.be.emit(auction, 'Bid').withArgs(user1.address, 2, anyValue);
                await expect(auction.connect(user1).bid({value: 1})).to.be.revertedWith(/.*higher.*/)
            })
        })
        describe('bid fail', () => {
            it('bid low value should fail', async() => {
                await expect(auction.connect(user1).bid({value:2})).to.be.not.reverted;
                await expect(auction.connect(user2).bid({value:1})).to.be.revertedWith("There is a higher bid");
            })
            it('bid when session ended', async() => {
                await mine(20);
                await expect(auction.connect(user2).bid({value:1})).to.be.revertedWith("Session ended");
            })
        })
        
    })
    describe('Claim',()=>{
        describe('claim success', () => {
            it('should allow winner to claim after auction ends', async () => {
              await auction.connect(user1).bid({ value: ethers.parseEther("1") });
              // Tạo block mới để áp dụng thay đổi thời gian
              await time.increase(1200);
              await mine(20);
              await expect(auction.connect(user1).claim()).to.be.not.reverted;
            });
            it('owner claim',async () => {
                // Tạo block mới để áp dụng thay đổi thời gian
                await time.increase(1200);
                await mine(20);
                await expect(auction.connect(deployer).claim()).to.be.not.reverted;
            });
          });
      
          describe('claim fail', () => {
            it('should fail when session not ended', async () => {
              await auction.connect(user1).bid({ value: ethers.parseEther("1") });
              await expect(auction.connect(user1).claim()).to.be.revertedWith("Round is not ended");
            });
      
            it('should fail when not the winner', async () => {
              await auction.connect(user1).bid({ value: ethers.parseEther("1") });
            
              await mine(20);
      
              await expect(auction.connect(signers[2]).claim()).to.be.revertedWith("You are not winner");
            });
          });
    });
    describe('Withdraw',()=>{
        beforeEach(async function(){
            await auction.connect(user1).bid({ value: ethers.parseEther("1")});
            console.log("init");
            mine(20);
        });
        describe('withdraw successful',async()=>{
            it('withdraw fail when amount less than 0',async()=>{
                await auction.connect(user1).claim();
                await expect(auction.connect(deployer).withdraw()).to.be.not.reverted;
            })
        });
        describe('witdraw fail',()=>{
            it('withdraw fail when amount less than 0',async()=>{
                // await expect(auction.connect(deployer).withdraw()).to.be.not.reverted;
                await expect(auction.connect(deployer).withdraw()).to.be.revertedWith("Withdraw fail");
                
            })
            it('not owner',async()=>{
                await auction.connect(user1).claim();
                await expect(auction.connect(user2).withdraw()).to.be.reverted;
            });
        });
    });
})