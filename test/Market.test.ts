import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { NFT1155A, NFT721B, Market, contracts } from "../typechain-types";
import {
  loadFixture,
  time,
  mine,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("Check NFT", () => {
  describe("NFT1155A", function () {
    let nft1155A: NFT1155A;
    let owner: any;
    let user1: any, user2: any;

    beforeEach(async function () {
      async function deploy() {
        [owner, user1, user2] = await ethers.getSigners();
        const NFT1155A = await ethers.getContractFactory("NFT1155A", owner);
        nft1155A = await NFT1155A.deploy("localhost");
        console.log("NFT1155A deployed to address:", nft1155A.target);
      }
      await loadFixture(deploy);
    });

    it("Should allow owner to mint", async function () {
      await nft1155A.mint(user1.address, 1, 100);
      const balance = await nft1155A.balanceOf(user1.address, 1);
      expect(balance).to.equal(100);
    });

    it("Should not allow non-owner to mint", async function () {
      await expect(nft1155A.connect(user1).mint(user1.address, 1, 100)).to.be
        .reverted;
    });
  });

  describe("NFT721B", function () {
    let NFT721B: any;
    let nft721B: any;
    let owner: any;
    let user1: any;
    let user2: any;

    beforeEach(async function () {
      [owner, user1, user2] = await ethers.getSigners();
      NFT721B = await ethers.getContractFactory("NFT721B");
      nft721B = await NFT721B.deploy(owner.address, "NFT721", "NFT");
    });

    it("Should allow owner to mint", async function () {
      await nft721B.mint(user1.address);
      const ownerOfToken = await nft721B.ownerOf(0);
      expect(ownerOfToken).to.equal(user1.address);
      // console.log( await nft721B.balanceOf(user1.address));
      expect((await nft721B.balanceOf(user1.address)) > 0).to.be.true;
    });

    it("Should not allow non-owner to mint", async function () {
      await expect(nft721B.connect(user1).mint(user1.address)).to.be.reverted;
    });
  });
});

describe("Check Market", () => {
  let deployer: any;
  let user1: any;
  let user2: any, user3: any;
  let nft1155A: NFT1155A, nft721B: NFT721B;
  let market: Market;
  let timestamp: any;
  const TokenType = {
    ERC721: 0,
    ERC1155: 1,
  };
  async function deploy() {
    [deployer, user1, user2, user3] = await ethers.getSigners();
    const NFT1155A = await ethers.getContractFactory("NFT1155A");
    nft1155A = await NFT1155A.deploy("localhost");
    console.log("NFT1155A deployed to address:", nft1155A.target);
    const NFT721B = await ethers.getContractFactory("NFT721B");
    nft721B = await NFT721B.deploy(deployer.address, "NFT721", "NFT");
    console.log("NFT721B deployed to address:", nft721B.target);
    const Market = await ethers.getContractFactory("Market");
    market = await Market.deploy();
    console.log("Auction deployed to address:", market.target);
    const block = await user1.provider.getBlock(
      await user1.provider.getBlockNumber()
    );
    timestamp = block.timestamp;
    await nft721B.mint(user1);
    await nft721B.mint(user1);
    nft721B.connect(user1).setApprovalForAll(market.target, true);
    await nft1155A.mint(user2, 0, 100);
    await nft1155A.mint(user2, 1, 100);
    await nft1155A.connect(user2).setApprovalForAll(market.target, true);
    console.log("Balance of user1: ", await nft721B.balanceOf(user1.address));
    await nft1155A.mint(user3, 0, 100);
    await nft721B.mint(user3);
  }
  async function SimuPublish() {
    // user1 publish token 712, id 0, mincost 100, endtime +20
    await market
      .connect(user1)
      .publish(nft721B.target, 0, TokenType.ERC721, 1, 100, timestamp + 20);
    await market
      .connect(user2)
      .publish(nft1155A.target, 0, TokenType.ERC1155, 1, 100, timestamp + 20);
  }
  async function SimuBid() {
    const contract = market.connect(user3);
    await contract.Bid(user1.address, 0, { value: 110 });
    await contract.Bid(user2.address, 0, { value: 110 });
  }
  async function SimuClaim() {
    const contract = market.connect(user3);
    await contract.claim(user1, 0);
    await contract.claim(user2, 0);
  }
  async function SimuWithdraw() {
    await market.connect(user1).withdraw();
  }
  beforeEach(async function () {
    await loadFixture(deploy);
  });
  describe("Check publish", () => {
    //Đã deploy và mint, user1 và 2 publish
    async function TestPublish721(user: any) {
      const contract = market.connect(user);
      await expect(
        contract.publish(
          nft721B.target,
          1,
          TokenType.ERC721,
          1,
          100,
          timestamp + 20
        )
      ).to.be.not.reverted;
    }
    async function TestPublish1155(user: any) {
      const contract = market.connect(user);
      await expect(
        contract.publish(
          nft1155A.target,
          1,
          TokenType.ERC1155,
          1,
          100,
          timestamp + 20
        )
      ).to.be.not.reverted;
    }
    describe("Publish Success", () => {
      it("721", async () => {
        TestPublish721(user1);
      });
      it("1155", async () => {
        TestPublish1155(user2);
      });
    });
    describe("Publish Fail", () => {
      it("721", async () => {
        const contract = market.connect(user3);
        await expect(
          contract.publish(
            nft721B.target,
            0,
            TokenType.ERC721,
            1,
            100,
            timestamp + 20
          )
        ).to.be.reverted;
      });
      it("1155", async () => {
        const contract = market.connect(user3);
        await expect(
          contract.publish(
            nft1155A.target,
            1,
            TokenType.ERC1155,
            1,
            100,
            timestamp + 20
          )
        ).to.be.reverted;
      });
    });
  });
  describe("Check Bid", () => {
    // Đã deploy, user 1, 2 đã publish
    beforeEach(async () => {
      // giả sử đã có user1 và 2 đã publish key của họ
      await loadFixture(SimuPublish);
    });
    describe("Bid Success", () => {
      it("Higher than minCost", async () => {
        await expect(
          market.connect(user3).Bid(user1.address, 0, { value: 102 })
        ).to.be.not.reverted;
        const offer = await market.offerInfos(user1.address, 0);
        expect(offer.bestValue).to.equal(102);
        expect(offer.bestBidder).to.equal(user3.address);
      });
      it("Higher than previous", async () => {
        await expect(
          market.connect(user3).Bid(user1.address, 0, { value: 102 })
        ).to.be.not.reverted;
        await expect(
          market.connect(user2).Bid(user1.address, 0, { value: 202 })
        ).to.be.not.reverted;
        const offer = await market.offerInfos(user1.address, 0);
        expect(offer.bestValue).to.equal(202);
        expect(offer.bestBidder).to.equal(user2.address);
      });
    });
    describe("Bid Failures", () => {
      it("Offer not exist", async () => {
        await expect(
          market.connect(user2).Bid(user1.address, 20, { value: 99 })
        ).to.be.revertedWith("Offer does not exist");
      });

      it("Lower bid", async () => {
        await market.connect(user3).Bid(user1.address, 0, { value: 110 });
        await expect(
          market.connect(user2).Bid(user1.address, 0, { value: 99 })
        ).to.be.revertedWith("Bid too low");
      });

      it("Ended session", async () => {
        await time.increase(100);
        await expect(
          market.connect(user3).Bid(user1.address, 0, { value: 110 })
        ).to.be.revertedWith("Auction ended");
      });

      it("Should revert if auction is already closed", async () => {
        await market.connect(user3).Bid(user1.address, 0, { value: 110 });
        await time.increase(100);
        await market.connect(user3).claim(user1.address, 0);
        await expect(
          market.connect(user2).Bid(user1.address, 0, { value: 120 })
        ).to.be.revertedWith("Offer is already closed");
      });
    });
  });

  describe("Check Claim", () => {
    beforeEach(async () => {
      await loadFixture(SimuPublish);
      await loadFixture(SimuBid);
    });
    it("Claim success with highest bidder 721", async () => {
      await time.increase(100);
      await expect(market.connect(user3).claim(user1.address, 0)).to.be.not
        .reverted;
      expect(await nft721B.ownerOf(0)).to.equal(user3.address);
      const offer = await market.offerInfos(user1.address, 0);
      expect(offer.isClose).to.be.true;
    });
    it("Claim success with highest bidder 1155", async () => {
      await time.increase(100);
      const beforclaim = await nft1155A.balanceOf(user3.address, 0);
      await expect(market.connect(user3).claim(user2.address, 0)).to.be.not
        .reverted;
      const offer = await market.offerInfos(user2.address, 0);
      console.log(beforclaim);
      console.log(offer.tokenCount);
      console.log(await nft1155A.balanceOf(user3.address, 0));
      expect(
        (await nft1155A.balanceOf(user3.address, 0)) - beforclaim
      ).to.equal(offer.tokenCount);
      expect(offer.isClose).to.be.true;
    });

    it("Fail cause session not ended", async () => {
      await expect(
        market.connect(user3).claim(user1.address, 0)
      ).to.be.revertedWith("Auction not ended");
    });

    it("Is not the highest bider", async () => {
      await time.increase(100);
      await expect(
        market.connect(user2).claim(user1.address, 0)
      ).to.be.revertedWith("Not the highest bidder");
    });

    it("Session is closed", async () => {
      await time.increase(100);
      await market.connect(user3).claim(user1.address, 0);
      await expect(
        market.connect(user3).claim(user1.address, 0)
      ).to.be.revertedWith("Offer is already closed");
    });
  });
  describe("Check Withdraw", () => {
    beforeEach(async function () {
      await loadFixture(SimuPublish);
      await loadFixture(SimuBid);
      await time.increase(100);
      await loadFixture(SimuClaim);
    });
    it("Should allow the publisher to withdraw the funds after auction ends", async () => {
      const offer1 = await market.offerInfos(user1.address, 0);
      const offer2 = await market.offerInfos(user2.address, 0);
      await expect(market.connect(user1).withdraw()).to.be.changeEtherBalance(
        user1.address,
        110
      );
      await expect(market.connect(user2).withdraw()).to.be.changeEtherBalances(
        [user2.address, market.target],
        [110, -110]
      );
    });

    it("Should revert if there are no funds to withdraw", async () => {
      await expect(market.connect(user3).withdraw()).to.be.revertedWith(
        "No funds to withdraw"
      );
    });
  });
  describe("Check Destroy", () => {
    it("Owner destroy successfully (no one bid)", async () => {
      // token về quyền sở hữu cũ
      SimuPublish();
      await expect(market.connect(deployer).destroy(user1.address, 0)).to.be.not
        .reverted;
      expect(await nft721B.ownerOf(0)).to.equal(user1.address);
      const updatedOffer1 = await market.offerInfos(user1.address, 0);
      expect(updatedOffer1.isClose).to.be.true;
      await expect(market.connect(deployer).destroy(user2.address, 0)).to.be.not
        .reverted;
      const updatedOffer2 = await market.offerInfos(user2.address, 0);
      expect(updatedOffer2.isClose).to.be.true;
    });
    describe("At least one bid", () => {
      beforeEach(async function () {
        await loadFixture(SimuPublish);
        await loadFixture(SimuBid);
      });
      it("Owner destroy successfully", async () => {
        // token về quyền sở hữu cũ
        // người cược được quyền nhận lại tiền (withdraw)
        const offer1 = await market.offerInfos(user1.address, 0);
        const offer2 = await market.offerInfos(user2.address, 0);
        const ethU3 = await ethers.provider.getBalance(user3.address);
        await expect(market.connect(deployer).destroy(user1.address, 0)).to.be
          .not.reverted;
        expect(await nft721B.ownerOf(0)).to.equal(user1.address);
        const updatedOffer1 = await market.offerInfos(user1.address, 0);
        expect(updatedOffer1.isClose).to.be.true;
        await expect(market.connect(deployer).destroy(user2.address, 0)).to.be
          .not.reverted;
        const updatedOffer2 = await market.offerInfos(user2.address, 0);
        expect(updatedOffer2.isClose).to.be.true;
        const AfterU3 = await ethers.provider.getBalance(user3.address);
        expect(AfterU3 - ethU3).to.equal(offer2.bestValue + offer1.bestValue);
      });
      it("Offer not exist", async () => {
        await expect(
          market.connect(deployer).destroy(user1.address, 10)
        ).to.be.revertedWith("Offer is not exist");
      });
      it("Revert when closed", async () => {
        await market.connect(deployer).destroy(user1.address, 0);
        await expect(
          market.connect(deployer).destroy(user1.address, 0)
        ).to.be.revertedWith("Offer is already closed");
      });

      it("Revert not ownable", async () => {
        await expect(market.connect(user1).destroy(user1.address, 0)).to.be
          .reverted;
      });
    });
  });
});
