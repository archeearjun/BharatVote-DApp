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

    /* ───── Admin Controls ───── */

    function setMerkleRoot(bytes32 _root) external onlyAdmin {
        merkleRoot = _root;
    }

    function addCandidate(string calldata _name)
        external
        onlyAdmin
        onlyPhase(0) // 0: Commit
    {
        if (bytes(_name).length == 0 || bytes(_name).length > 100) revert InvalidNameLength();
        uint256 id = candidates.length;
        candidates.push(Candidate(id, _name, true));
        emit CandidateAdded(id, _name);
    }

    function removeCandidate(uint256 _id)
        external
        onlyAdmin
        onlyPhase(0) // 0: Commit
        validCandidateId(_id)
    {
        candidates[_id].isActive = false;
        emit CandidateRemoved(_id);
    }

    function startReveal() external onlyAdmin onlyPhase(0) {
        phase = 1; // 1: Reveal
        emit PhaseChanged(phase);
    }

    function finishElection() external onlyAdmin onlyPhase(1) {
        phase = 2; // 2: Finished
        emit PhaseChanged(phase);
        emit TallyFinalized(getTally());
    }

    function resetElection() external onlyAdmin {
        if (phase != 2) revert CanOnlyResetAfterFinish(); // 2: Finished

        // Reset candidates
        for (uint i = 0; i < candidates.length; i++) {
            candidates[i].isActive = true;
            tally[i] = 0;
        }

        // Reset voter states
        for (uint i = 0; i < voters.length; i++) {
            address v = voters[i];
            commits[v] = bytes32(0);
            hasCommitted[v] = false;
            hasRevealed[v] = false;
        }

        delete voters;
        phase = 0; // 0: Commit

        emit ElectionReset();
        emit PhaseChanged(phase);
    }

    // Emergency reset function - can be called from any phase
    function emergencyReset() external onlyAdmin {
        // Reset candidates
        for (uint i = 0; i < candidates.length; i++) {
            candidates[i].isActive = true;
            tally[i] = 0;
        }

        // Reset voter states
        for (uint i = 0; i < voters.length; i++) {
            address v = voters[i];
            commits[v] = bytes32(0);
            hasCommitted[v] = false;
            hasRevealed[v] = false;
        }

        delete voters;
        phase = 0; // 0: Commit

        emit ElectionReset();
        emit PhaseChanged(phase);
    }

    function clearAllCandidates() external onlyAdmin onlyPhase(2) {
        // Capture current candidate count before clearing
        uint256 count = candidates.length;
        // Remove all candidate entries
        delete candidates;
        // Reset tallies for each old candidate index
        for (uint256 i = 0; i < count; i++) {
            delete tally[i];
        }
        emit AllCandidatesCleared();
    }

    /* ───── Voting ───── */

    // slither-disable-next-line reentrancy-events
    function commitVote(bytes32 _commit, bytes32[] calldata _proof)
        external
        onlyPhase(0) // 0: Commit
    {
        if (hasCommitted[msg.sender]) revert AlreadyCommitted();
        if (_commit == bytes32(0)) revert EmptyHash();
        if (!verify(_proof, msg.sender)) revert NotEligible();

        commits[msg.sender] = _commit;
        hasCommitted[msg.sender] = true;
        voters.push(msg.sender);
        emit VoteCommitted(msg.sender, _commit);
    }

    function revealVote(uint256 _choice, bytes32 _salt)
        external
        onlyPhase(1) // 1: Reveal
        validCandidateId(_choice)
    {
        if (!hasCommitted[msg.sender]) revert NoCommit();
        if (hasRevealed[msg.sender]) revert AlreadyRevealed();

        bytes32 expectedHash = keccak256(abi.encodePacked(_choice, _salt));
        if (expectedHash != commits[msg.sender]) revert HashMismatch();

        hasRevealed[msg.sender] = true;
        tally[_choice] += 1;
        emit VoteRevealed(msg.sender, _choice);
    }

    /* ───── Merkle Proof Check ───── */

    function verify(bytes32[] memory proof, address leafAddr) internal view returns (bool) {
        bytes32 hash = keccak256(abi.encodePacked(leafAddr));
        for (uint i = 0; i < proof.length; i++) {
            hash = (hash < proof[i])
                ? keccak256(abi.encodePacked(hash, proof[i]))
                : keccak256(abi.encodePacked(proof[i], hash));
        }
        return hash == merkleRoot;
    }

    /* ───── Views ───── */

    function candidateCount() external view returns (uint256) {
        return candidates.length;
    }

    function getVotes(uint256 _id) external view validCandidateId(_id) returns (uint256) {
        return tally[_id];
    }

    function getTally() public view returns (uint256[] memory) {
        uint256 n = candidates.length;
        uint256[] memory counts = new uint256[](n);
        for (uint i = 0; i < n; i++) {
            counts[i] = tally[i];
        }
        return counts;
    }

    function getCandidates() external view returns (Candidate[] memory) {
        return candidates;
    }

    function getVoterStatus(address _voter) external view returns (bool committed, bool revealed) {
        return (hasCommitted[_voter], hasRevealed[_voter]);
    }
}
