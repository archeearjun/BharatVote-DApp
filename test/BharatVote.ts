import { expect } from "chai";
import { ethers } from "hardhat";
import { MerkleTree } from "merkletreejs";
import { keccak256, solidityPackedKeccak256, zeroPadValue } from "ethers";
import type { BharatVote } from "../typechain-types";
import type { ElectionFactory } from "../typechain-types";

describe("BharatVote", () => {
  let vote: BharatVote;
  let electionFactory: ElectionFactory;
  let admin: any;
  let voter1: any;
  let voter2: any;
  let voter3: any;
  let merkleTree: MerkleTree;
  let merkleRoot: string;
  
  const COMMIT_PHASE = 0;
  const REVEAL_PHASE = 1;
  const FINISH_PHASE = 2;

  // Helper function to create Merkle tree
  const createMerkleTree = (addresses: string[]) => {
    const keccak256Hasher = (data: any) => {
      if (typeof data === 'string') {
        return Buffer.from(solidityPackedKeccak256(['address'], [data.toLowerCase()]).substring(2), 'hex');
      } else if (Buffer.isBuffer(data)) {
        return Buffer.from(keccak256(data).substring(2), 'hex');
      }
      throw new Error("Invalid data type for keccak256Hasher");
    };

    const leaves = addresses.map(addr => keccak256Hasher(addr.toLowerCase()));
    return new MerkleTree(leaves, keccak256Hasher, { sortLeaves: true, sortPairs: true });
  };

  beforeEach(async () => {
    [admin, voter1, voter2, voter3] = await ethers.getSigners();
    
    // Create Merkle tree for eligible voters
    const eligibleVoters = [voter1.address, voter2.address];
    merkleTree = createMerkleTree(eligibleVoters);
    merkleRoot = '0x' + merkleTree.getRoot().toString('hex');
    
    // Deploy implementation + factory, then create an initialized clone election.
    // `BharatVote` is designed for Clones + `initialize(...)` (constructor disables initializers),
    // so direct deployment is not usable for tests that require an admin.
    const BV = await ethers.getContractFactory("BharatVote", admin);
    const implementation = (await BV.deploy()) as BharatVote;
    await implementation.waitForDeployment();

    const Factory = await ethers.getContractFactory("ElectionFactory", admin);
    electionFactory = (await Factory.deploy(await implementation.getAddress())) as ElectionFactory;
    await electionFactory.waitForDeployment();

    const createTx = await electionFactory.connect(admin).createElection("Test Election");
    const receipt = await createTx.wait();
    const created = receipt?.logs
      .map((log) => {
        try {
          return electionFactory.interface.parseLog(log as any);
        } catch {
          return null;
        }
      })
      .find((parsed) => parsed?.name === "ElectionCreated");

    if (!created) {
      throw new Error("ElectionCreated event not found");
    }

    vote = BV.attach(created.args.election) as BharatVote;
    
    // Set Merkle root
    await vote.connect(admin).setMerkleRoot(merkleRoot);
  });

  describe("Deployment", () => {
    it("should set the correct admin", async () => {
      expect(await vote.admin()).to.equal(admin.address);
    });

    it("should start in commit phase", async () => {
      expect(await vote.phase()).to.equal(COMMIT_PHASE);
    });

    it("should have zero candidates initially", async () => {
      expect(await vote.candidateCount()).to.equal(0);
    });
  });

  describe("Candidate Management", () => {
    it("allows admin to add candidate and emits event", async () => {
      await expect(vote.connect(admin).addCandidate("Alice"))
        .to.emit(vote, "CandidateAdded")
        .withArgs(0, "Alice");

      expect(await vote.candidateCount()).to.equal(1);
      
      const candidates = await vote.getCandidates();
      expect(candidates[0].name).to.equal("Alice");
      expect(candidates[0].isActive).to.be.true;
    });

    it("blocks non-admin from adding candidate", async () => {
      await expect(
        vote.connect(voter1).addCandidate("Bob")
      ).to.be.revertedWithCustomError(vote, "NotAdmin");
    });

    it("allows admin to deactivate candidate", async () => {
      await vote.connect(admin).addCandidate("Alice");
      await vote.connect(admin).removeCandidate(0);
      
      const candidates = await vote.getCandidates();
      expect(candidates[0].isActive).to.be.false;
    });

    it("blocks adding candidate with empty name", async () => {
      await expect(
        vote.connect(admin).addCandidate("")
      ).to.be.revertedWithCustomError(vote, "InvalidNameLength");
    });
  });

  describe("Phase Management", () => {
    it("allows admin to advance to reveal phase", async () => {
      await expect(vote.connect(admin).startReveal())
        .to.emit(vote, "PhaseChanged")
        .withArgs(REVEAL_PHASE);
      
      expect(await vote.phase()).to.equal(REVEAL_PHASE);
    });

    it("allows admin to advance to finish phase", async () => {
      await vote.connect(admin).startReveal(); // To reveal
      await vote.connect(admin).finishElection(); // To finish
      
      expect(await vote.phase()).to.equal(FINISH_PHASE);
    });

    it("blocks non-admin from advancing phase", async () => {
      await expect(
        vote.connect(voter1).startReveal()
      ).to.be.revertedWithCustomError(vote, "NotAdmin");
    });

    it("blocks phase advancement in wrong order", async () => {
      await expect(
        vote.connect(admin).finishElection() // Can't finish without reveal
      ).to.be.revertedWithCustomError(vote, "WrongPhase");
    });
  });

  describe("Voting Process", () => {
    let candidateId: number;
    let salt: string;
    let commitHash: string;
    let proof: string[];

    beforeEach(async () => {
      // Add a candidate
      await vote.connect(admin).addCandidate("Alice");
      candidateId = 0;
      salt = "mysecret";
      
      // Generate commit hash using the same method as the contract
      const saltBytes32 = zeroPadValue(ethers.toUtf8Bytes(salt), 32);
      commitHash = keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["uint256", "bytes32"], 
          [candidateId, saltBytes32]
        )
      );
      
      // Generate Merkle proof for voter1
      const hashedAddress = Buffer.from(
        solidityPackedKeccak256(['address'], [voter1.address.toLowerCase()]).substring(2), 
        'hex'
      );
      const proofElements = merkleTree.getProof(hashedAddress);
      proof = proofElements.map(x => '0x' + x.data.toString('hex'));
    });

    it("allows eligible voter to commit vote", async () => {
      await expect(vote.connect(voter1).commitVote(commitHash, proof))
        .to.emit(vote, "VoteCommitted")
        .withArgs(voter1.address, commitHash);
    });

    it("blocks ineligible voter from committing", async () => {
      // voter3 is not in the Merkle tree
      await expect(
        vote.connect(voter3).commitVote(commitHash, proof)
      ).to.be.revertedWithCustomError(vote, "NotEligible");
    });

    it("blocks double voting", async () => {
      await vote.connect(voter1).commitVote(commitHash, proof);
      
      await expect(
        vote.connect(voter1).commitVote(commitHash, proof)
      ).to.be.revertedWithCustomError(vote, "AlreadyCommitted");
    });

    it("blocks committing empty hash", async () => {
      await expect(
        vote.connect(voter1).commitVote(ethers.ZeroHash, proof)
      ).to.be.revertedWithCustomError(vote, "EmptyHash");
    });

    it("allows vote revealing in reveal phase", async () => {
      // Commit vote
      await vote.connect(voter1).commitVote(commitHash, proof);
      
      // Advance to reveal phase
      await vote.connect(admin).startReveal();
      
      // Reveal vote
      const saltBytes32 = zeroPadValue(ethers.toUtf8Bytes(salt), 32);
      await expect(vote.connect(voter1).revealVote(candidateId, saltBytes32))
        .to.emit(vote, "VoteRevealed")
        .withArgs(voter1.address, candidateId);
    });

    it("blocks revealing with wrong salt", async () => {
      await vote.connect(voter1).commitVote(commitHash, proof);
      await vote.connect(admin).startReveal();
      
      const wrongSalt = zeroPadValue(ethers.toUtf8Bytes("wrongsalt"), 32);
      await expect(
        vote.connect(voter1).revealVote(candidateId, wrongSalt)
      ).to.be.revertedWithCustomError(vote, "HashMismatch");
    });

    it("blocks revealing in wrong phase", async () => {
      await vote.connect(voter1).commitVote(commitHash, proof);
      
      const saltBytes32 = zeroPadValue(ethers.toUtf8Bytes(salt), 32);
      await expect(
        vote.connect(voter1).revealVote(candidateId, saltBytes32)
      ).to.be.revertedWithCustomError(vote, "WrongPhase");
    });

    it("blocks revealing without commit", async () => {
      await vote.connect(admin).startReveal();
      
      const saltBytes32 = zeroPadValue(ethers.toUtf8Bytes(salt), 32);
      await expect(
        vote.connect(voter1).revealVote(candidateId, saltBytes32)
      ).to.be.revertedWithCustomError(vote, "NoCommit");
    });
  });

  describe("Vote Tallying", () => {
    beforeEach(async () => {
      // Add candidates
      await vote.connect(admin).addCandidate("Alice");
      await vote.connect(admin).addCandidate("Bob");
    });

    it("correctly tallies votes", async () => {
      // Both voters vote for Alice (candidate 0)
      const candidateId = 0;
      const salt1 = "secret1";
      const salt2 = "secret2";
      
      // Generate commits
      const commit1 = keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["uint256", "bytes32"], 
          [candidateId, zeroPadValue(ethers.toUtf8Bytes(salt1), 32)]
        )
      );
      const commit2 = keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["uint256", "bytes32"], 
          [candidateId, zeroPadValue(ethers.toUtf8Bytes(salt2), 32)]
        )
      );
      
      // Generate proofs
      const proof1 = merkleTree.getProof(
        Buffer.from(solidityPackedKeccak256(['address'], [voter1.address.toLowerCase()]).substring(2), 'hex')
      ).map(x => '0x' + x.data.toString('hex'));
      
      const proof2 = merkleTree.getProof(
        Buffer.from(solidityPackedKeccak256(['address'], [voter2.address.toLowerCase()]).substring(2), 'hex')
      ).map(x => '0x' + x.data.toString('hex'));
      
      // Commit votes
      await vote.connect(voter1).commitVote(commit1, proof1);
      await vote.connect(voter2).commitVote(commit2, proof2);
      
      // Advance to reveal phase
      await vote.connect(admin).startReveal();
      
      // Reveal votes
      await vote.connect(voter1).revealVote(candidateId, zeroPadValue(ethers.toUtf8Bytes(salt1), 32));
      await vote.connect(voter2).revealVote(candidateId, zeroPadValue(ethers.toUtf8Bytes(salt2), 32));
      
      // Check vote count using the correct function name
      expect(await vote.getVotes(candidateId)).to.equal(2);
      expect(await vote.getVotes(1)).to.equal(0); // Bob has 0 votes
    });

    it("returns correct tally array", async () => {
      // Add one more candidate for testing
      await vote.connect(admin).addCandidate("Charlie");
      
      const candidateId = 1; // Vote for Bob
      const salt1 = "secret1";
      
      const commit1 = keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["uint256", "bytes32"], 
          [candidateId, zeroPadValue(ethers.toUtf8Bytes(salt1), 32)]
        )
      );
      
      const proof1 = merkleTree.getProof(
        Buffer.from(solidityPackedKeccak256(['address'], [voter1.address.toLowerCase()]).substring(2), 'hex')
      ).map(x => '0x' + x.data.toString('hex'));
      
      await vote.connect(voter1).commitVote(commit1, proof1);
      await vote.connect(admin).startReveal();
      await vote.connect(voter1).revealVote(candidateId, zeroPadValue(ethers.toUtf8Bytes(salt1), 32));
      
      const tally = await vote.getTally();
      expect(tally[0]).to.equal(0); // Alice: 0 votes
      expect(tally[1]).to.equal(1); // Bob: 1 vote
      expect(tally[2]).to.equal(0); // Charlie: 0 votes
    });
  });

  describe("Voter Status Tracking", () => {
    beforeEach(async () => {
      await vote.connect(admin).addCandidate("Alice");
    });

    it("tracks voter commit and reveal status", async () => {
      const candidateId = 0;
      const salt = "mysecret";
      
      const commitHash = keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["uint256", "bytes32"], 
          [candidateId, zeroPadValue(ethers.toUtf8Bytes(salt), 32)]
        )
      );
      
      const proof = merkleTree.getProof(
        Buffer.from(solidityPackedKeccak256(['address'], [voter1.address.toLowerCase()]).substring(2), 'hex')
      ).map(x => '0x' + x.data.toString('hex'));
      
      // Initial status
      let [committed, revealed] = await vote.getVoterStatus(voter1.address);
      expect(committed).to.be.false;
      expect(revealed).to.be.false;
      
      // After commit
      await vote.connect(voter1).commitVote(commitHash, proof);
      [committed, revealed] = await vote.getVoterStatus(voter1.address);
      expect(committed).to.be.true;
      expect(revealed).to.be.false;
      
      // After reveal
      await vote.connect(admin).startReveal();
      await vote.connect(voter1).revealVote(candidateId, zeroPadValue(ethers.toUtf8Bytes(salt), 32));
      [committed, revealed] = await vote.getVoterStatus(voter1.address);
      expect(committed).to.be.true;
      expect(revealed).to.be.true;
    });
  });

  describe("Gas Usage", () => {
    it("should use reasonable gas for voting operations", async () => {
      await vote.connect(admin).addCandidate("Alice");
      
      const candidateId = 0;
      const salt = "mysecret";
      const commitHash = keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["uint256", "bytes32"], 
          [candidateId, zeroPadValue(ethers.toUtf8Bytes(salt), 32)]
        )
      );
      
      const hashedAddress = Buffer.from(
        solidityPackedKeccak256(['address'], [voter1.address.toLowerCase()]).substring(2), 
        'hex'
      );
      const proof = merkleTree.getProof(hashedAddress).map(x => '0x' + x.data.toString('hex'));
      
      const tx = await vote.connect(voter1).commitVote(commitHash, proof);
      const receipt = await tx.wait();
      
      console.log(`Commit vote gas used: ${receipt?.gasUsed}`);
      expect(Number(receipt?.gasUsed)).to.be.lessThan(150000);
    });
  });

  describe("Election Reset", () => {
    it("allows admin to reset election after completion", async () => {
      await vote.connect(admin).addCandidate("Alice");
      
      // Complete an election cycle
      await vote.connect(admin).startReveal();
      await vote.connect(admin).finishElection();
      
      // Reset should work
      await expect(vote.connect(admin).resetElection())
        .to.emit(vote, "ElectionReset");
      
      expect(await vote.phase()).to.equal(COMMIT_PHASE);
    });

    it("blocks reset before election is finished", async () => {
      await expect(
        vote.connect(admin).resetElection()
      ).to.be.revertedWithCustomError(vote, "CanOnlyResetAfterFinish");
    });
  });
});
