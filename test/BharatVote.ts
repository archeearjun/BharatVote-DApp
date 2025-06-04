import { expect } from "chai";
import { ethers } from "hardhat";

describe("BharatVote", () => {
  let vote: any;
  let admin: any;
  let alice: any;

  beforeEach(async () => {
    [admin, alice] = await ethers.getSigners();
    const BV = await ethers.getContractFactory("BharatVote");
    vote = await BV.connect(admin).deploy();
    await vote.waitForDeployment();
  });

  it("allows admin to add candidate and emits event", async () => {
    await expect(vote.connect(admin).addCandidate("Alice"))
      .to.emit(vote, "CandidateAdded")
      .withArgs(0, "Alice");

    expect(await vote.candidateCount()).to.equal(1);
  });

  it("blocks non-admin from adding candidate", async () => {
    await expect(
      vote.connect(alice).addCandidate("Bob")
    ).to.be.revertedWith("Not admin");
  });

  it("still blocks double-voting", async () => {
    const commit = ethers.keccak256(ethers.toUtf8Bytes("hash1"));
    await vote.connect(alice).commitVote(commit);

    await expect(
      vote.connect(alice).commitVote(commit)
    ).to.be.revertedWith("Already voted");
  });
});
