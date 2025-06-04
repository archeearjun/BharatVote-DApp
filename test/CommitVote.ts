import { expect } from "chai";
import { ethers } from "hardhat";

describe("CommitVote", () => {
  it("blocks a second vote from the same address", async () => {
    const [voter] = await ethers.getSigners();
    const CommitVote = await ethers.getContractFactory("CommitVote");
    const cv = await CommitVote.deploy();
    await cv.waitForDeployment();

    // 1st vote should succeed
    const commit1 = ethers.keccak256(ethers.toUtf8Bytes("first"));
    await cv.connect(voter).commitVote(commit1);

    // 2nd vote must revert
    const commit2 = ethers.keccak256(ethers.toUtf8Bytes("second"));
    await expect(cv.connect(voter).commitVote(commit2))
      .to.be.revertedWith("Already voted");
  });
});
