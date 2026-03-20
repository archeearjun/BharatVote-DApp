// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";

/**
 * @title BharatVote
 * @dev Commit-reveal based voting system with Merkle proof voter eligibility
 */
contract BharatVote is Initializable {
    // Custom errors
    error NotAdmin();
    error ZeroAdmin();
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
    error InvalidMerkleRoot();
    error CanOnlyResetAfterFinish();
    error ElectionPaused();

    address public admin;
    string public name;
    bool public paused;

    // Removed enum Phase, using uint8 for phase management
    uint8 public phase = 0; // 0: Commit, 1: Reveal, 2: Finished

    struct Candidate {
        uint256 id;
        string name;
        bool isActive;
    }

    struct CandidateRecord {
        uint256 id;
        string name;
    }

    struct VoteState {
        bytes32 commitHash;
        uint256 commitRound;
        uint256 revealRound;
    }

    CandidateRecord[] private candidateRecords;

    bytes32 public merkleRoot;

    uint256 public electionRound;

    mapping(address => VoteState) private voteStates;
    mapping(uint256 => mapping(uint256 => uint256)) private talliesByRound;
    mapping(uint256 => mapping(uint256 => bool)) private candidateDisabledByRound;

    /* ───── Events ───── */
    event Paused();
    event Unpaused();
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

    modifier whenNotPaused() {
        if (paused) revert ElectionPaused();
        _;
    }

    modifier validCandidateId(uint256 _id) {
        if (_id >= candidateRecords.length) revert InvalidCandidateId();
        if (candidateDisabledByRound[electionRound][_id]) revert InactiveCandidate();
        _;
    }

    constructor() {
        _disableInitializers();
    }

    function initialize(string calldata _name, address _admin) external initializer {
        if (bytes(_name).length == 0 || bytes(_name).length > 100) revert InvalidNameLength();
        if (_admin == address(0)) revert ZeroAdmin();
        name = _name;
        admin = _admin;
        electionRound = 1;
    }

    /* ───── Admin Controls ───── */

    function setMerkleRoot(bytes32 _root) external onlyAdmin onlyPhase(0) {
        if (_root == bytes32(0)) revert InvalidMerkleRoot();
        merkleRoot = _root;
    }

    function addCandidate(string calldata _name)
        external
        onlyAdmin
        onlyPhase(0) // 0: Commit
    {
        if (bytes(_name).length == 0 || bytes(_name).length > 100) revert InvalidNameLength();
        uint256 id = candidateRecords.length;
        candidateRecords.push(CandidateRecord(id, _name));
        emit CandidateAdded(id, _name);
    }

    function removeCandidate(uint256 _id)
        external
        onlyAdmin
        onlyPhase(0) // 0: Commit
        validCandidateId(_id)
    {
        candidateDisabledByRound[electionRound][_id] = true;
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
        phase = 0; // 0: Commit
        paused = false;
        merkleRoot = bytes32(0);
        electionRound += 1;

        emit ElectionReset();
        emit PhaseChanged(phase);
    }

    /// @notice Halt all vote commits and reveals without destroying state.
    ///         Use when fraud is suspected; unpause to resume after investigation.
    function pause() external onlyAdmin {
        paused = true;
        emit Paused();
    }

    function unpause() external onlyAdmin {
        paused = false;
        emit Unpaused();
    }

    // Emergency reset function - can be called from any phase
    function emergencyReset() external onlyAdmin {
        phase = 0; // 0: Commit
        paused = false;
        merkleRoot = bytes32(0);
        electionRound += 1;

        emit ElectionReset();
        emit PhaseChanged(phase);
    }

    function clearAllCandidates() external onlyAdmin onlyPhase(2) {
        delete candidateRecords;
        emit AllCandidatesCleared();
    }

    /* ───── Voting ───── */

    // slither-disable-next-line reentrancy-events
    function commitVote(bytes32 _commit, bytes32[] calldata _proof)
        external
        onlyPhase(0) // 0: Commit
        whenNotPaused
    {
        VoteState storage state = voteStates[msg.sender];
        if (state.commitRound == electionRound) revert AlreadyCommitted();
        if (_commit == bytes32(0)) revert EmptyHash();
        if (!verify(_proof, msg.sender)) revert NotEligible();

        state.commitHash = _commit;
        state.commitRound = electionRound;
        emit VoteCommitted(msg.sender, _commit);
    }

    function revealVote(uint256 _choice, bytes32 _salt)
        external
        onlyPhase(1) // 1: Reveal
        validCandidateId(_choice)
        whenNotPaused
    {
        VoteState storage state = voteStates[msg.sender];
        if (state.commitRound != electionRound) revert NoCommit();
        if (state.revealRound == electionRound) revert AlreadyRevealed();

        bytes32 expectedHash = keccak256(abi.encodePacked(_choice, _salt));
        if (expectedHash != state.commitHash) revert HashMismatch();

        state.revealRound = electionRound;
        talliesByRound[electionRound][_choice] += 1;
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
        return candidateRecords.length;
    }

    function candidates(uint256 _index) external view returns (uint256 id, string memory candidateName, bool isActive) {
        if (_index >= candidateRecords.length) revert InvalidCandidateId();
        CandidateRecord storage record = candidateRecords[_index];
        return (record.id, record.name, !candidateDisabledByRound[electionRound][_index]);
    }

    function commits(address _voter) external view returns (bytes32) {
        VoteState storage state = voteStates[_voter];
        if (state.commitRound != electionRound) return bytes32(0);
        return state.commitHash;
    }

    function hasCommitted(address _voter) external view returns (bool) {
        return voteStates[_voter].commitRound == electionRound;
    }

    function hasRevealed(address _voter) external view returns (bool) {
        return voteStates[_voter].revealRound == electionRound;
    }

    function tally(uint256 _id) external view returns (uint256) {
        return talliesByRound[electionRound][_id];
    }

    function getVotes(uint256 _id) external view validCandidateId(_id) returns (uint256) {
        return talliesByRound[electionRound][_id];
    }

    function getTally() public view returns (uint256[] memory) {
        uint256 n = candidateRecords.length;
        uint256[] memory counts = new uint256[](n);
        for (uint i = 0; i < n; i++) {
            counts[i] = talliesByRound[electionRound][i];
        }
        return counts;
    }

    function getCandidates() external view returns (Candidate[] memory) {
        uint256 n = candidateRecords.length;
        Candidate[] memory currentCandidates = new Candidate[](n);
        for (uint256 i = 0; i < n; i++) {
            CandidateRecord storage record = candidateRecords[i];
            currentCandidates[i] = Candidate({
                id: record.id,
                name: record.name,
                isActive: !candidateDisabledByRound[electionRound][i]
            });
        }
        return currentCandidates;
    }

    function getVoterStatus(address _voter) external view returns (bool committed, bool revealed) {
        VoteState storage state = voteStates[_voter];
        return (
            state.commitRound == electionRound,
            state.revealRound == electionRound
        );
    }
}
