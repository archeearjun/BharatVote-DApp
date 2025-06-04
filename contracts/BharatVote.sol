// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * BharatVote - Phase-1 slice
 *  - Admin can add candidates (name only for now).
 *  - Voters commit once; double-vote blocked.
 *  - Events emitted for front-end / audit listeners.
 */
contract BharatVote {
    /* ─────────────────── Storage ─────────────────── */
    address public immutable admin;          // deployer = election admin

    struct Candidate {
        uint256 id;
        string  name;
    }
    Candidate[] public candidates;           // dynamic array

    mapping(address => bool)    public hasVoted;
    mapping(address => bytes32) public commits;

    /* ─────────────────── Events ─────────────────── */
    event CandidateAdded(uint256 id, string name);
    event VoteCommitted(address indexed voter, bytes32 commit);

    /* ─────────────────── Constructor ─────────────── */
    constructor() {
        admin = msg.sender;                  // whoever deploys is admin
    }

    /* ─────────────────── Modifiers ──────────────── */
    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    /* ─────────────────── Admin Function ─────────── */
    function addCandidate(string calldata _name) external onlyAdmin {
        uint256 newId = candidates.length;
        candidates.push(Candidate(newId, _name));
        emit CandidateAdded(newId, _name);
    }

    /* ─────────────────── Voting Function ────────── */
    function commitVote(bytes32 _commit) external {
        require(!hasVoted[msg.sender], "Already voted");
        commits[msg.sender] = _commit;
        hasVoted[msg.sender] = true;
        emit VoteCommitted(msg.sender, _commit);
    }

    /* ───────────── Helper: total candidates ─────── */
    function candidateCount() external view returns (uint256) {
        return candidates.length;
    }
}
