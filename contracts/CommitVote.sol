// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * Commit-only skeleton:
 *  - Voter sends a hash(commit) once.
 *  - Any second attempt reverts with "Already voted".
 *  - No candidates or reveal yet; we'll add later.
 */
contract CommitVote {
    mapping(address => bool) public hasVoted;
    mapping(address => bytes32) public commits;

    event VoteCommitted(address indexed voter, bytes32 commit);

    function commitVote(bytes32 _commit) external {
        require(!hasVoted[msg.sender], "Already voted");
        commits[msg.sender] = _commit;
        hasVoted[msg.sender] = true;
        emit VoteCommitted(msg.sender, _commit);
    }
}
