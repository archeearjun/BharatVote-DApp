// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BharatVote
 * @dev Commit-reveal based voting system with Merkle proof voter eligibility
 */
contract BharatVote {
    // Custom errors
    error NotAdmin();
    error WrongPhase();
    error InvalidCandidateId();
    error InactiveCandidate();
    error AlreadyCommitted();
    error AlreadyRevealed();
    error EmptyHash();
    error NotEligible();
    error NoCommit();
    error HashMismatch();
    error InvalidNameLength();
    error CanOnlyResetAfterFinish();

    address public immutable admin;

    // Removed enum Phase, using uint8 for phase management
    uint8 public phase = 0; // 0: Commit, 1: Reveal, 2: Finished

    struct Candidate {
        uint256 id;
        string name;
        bool isActive;
    }

    Candidate[] public candidates;

    bytes32 public merkleRoot;

    mapping(address => bytes32) public commits;
    mapping(address => bool) public hasCommitted;
    mapping(address => bool) public hasRevealed;
    mapping(uint256 => uint256) public tally;

    address[] private voters; // Used to reset state

    /* ───── Events ───── */
    event CandidateAdded(uint256 id, string name);
    event CandidateRemoved(uint256 id);
    event VoteCommitted(address indexed voter, bytes32 commit);
    event VoteRevealed(address indexed voter, uint256 choice);
    event PhaseChanged(uint8 newPhase); // Emitting uint8 instead of Phase enum
    event TallyFinalized(uint256[] finalTally);
    event ElectionReset();
    event AllCandidatesCleared();

    /* ───── Modifiers ───── */
    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAdmin();
        _;
    }

    modifier onlyPhase(uint8 p) {
        if (phase != p) revert WrongPhase();
        _;
    }

    modifier validCandidateId(uint256 _id) {
        if (_id >= candidates.length) revert InvalidCandidateId();
        if (!candidates[_id].isActive) revert InactiveCandidate();
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    // Functions will be implemented in Week 2-3
    // This is the foundation structure only
}

