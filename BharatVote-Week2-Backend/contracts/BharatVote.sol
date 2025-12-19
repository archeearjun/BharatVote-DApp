// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BharatVote
 * @notice Week 2 version – admin, phases, candidate management, Merkle root setup.
 * @dev Commit/reveal, Merkle verification, and full reset are planned for later weeks.
 */
contract BharatVote {
    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/
    error NotAdmin();
    error WrongPhase();
    error InvalidCandidateId();
    error InactiveCandidate();
    error InvalidNameLength();
    error AlreadyCommitted();
    error AlreadyRevealed();
    error NotEligible();
    error NoCommit();
    error HashMismatch();
    error CanOnlyResetAfterFinish();

    /*//////////////////////////////////////////////////////////////
                               CONSTANTS
    //////////////////////////////////////////////////////////////*/
    uint8 public constant PHASE_COMMIT = 0;
    uint8 public constant PHASE_REVEAL = 1;
    uint8 public constant PHASE_FINISHED = 2;

    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/
    address public immutable admin;
    uint8 public phase = PHASE_COMMIT; // 0: commit, 1: reveal, 2: finished

    struct Candidate {
        uint256 id;
        string name;
        bool isActive;
    }

    Candidate[] public candidates;

    // Week 2: store eligibility root (actual verification in Week 3+)
    bytes32 public merkleRoot;

    // Week 3+ commit/reveal placeholders
    mapping(address => bytes32) public commits;
    mapping(address => bool) public hasCommitted;
    mapping(address => bool) public hasRevealed;
    mapping(uint256 => uint256) public tally;

    // optional – for future reset
    address[] private voters;

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/
    event CandidateAdded(uint256 indexed id, string name);
    event CandidateRemoved(uint256 indexed id);
    event VoteCommitted(address indexed voter, bytes32 commit);
    event VoteRevealed(address indexed voter, uint256 choice);
    event PhaseChanged(uint8 newPhase);
    event TallyFinalized(uint256[] finalTally);
    event ElectionReset();
    event AllCandidatesCleared();

    /*//////////////////////////////////////////////////////////////
                                MODIFIERS
    //////////////////////////////////////////////////////////////*/
    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAdmin();
        _;
    }

    modifier onlyPhase(uint8 expected) {
        if (phase != expected) revert WrongPhase();
        _;
    }

    modifier validCandidateId(uint256 _id) {
        if (_id >= candidates.length) revert InvalidCandidateId();
        if (!candidates[_id].isActive) revert InactiveCandidate();
        _;
    }

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/
    constructor() {
        admin = msg.sender;
    }

    /*//////////////////////////////////////////////////////////////
                           ADMIN – WEEK 2
    //////////////////////////////////////////////////////////////*/

    /// @notice Set/replace voter eligibility root (offchain Merkle, onchain check in Week 3+)
    function setMerkleRoot(bytes32 _root) external onlyAdmin {
        merkleRoot = _root;
    }

    /// @notice Add a new active candidate – only in commit phase
    function addCandidate(string calldata _name)
        external
        onlyAdmin
        onlyPhase(PHASE_COMMIT)
    {
        uint256 len = bytes(_name).length;
        if (len == 0 || len > 100) revert InvalidNameLength();

        uint256 id = candidates.length;
        candidates.push(Candidate({id: id, name: _name, isActive: true}));

        emit CandidateAdded(id, _name);
    }

    /// @notice Soft-delete candidate – only in commit phase
    function removeCandidate(uint256 _id)
        external
        onlyAdmin
        onlyPhase(PHASE_COMMIT)
        validCandidateId(_id)
    {
        candidates[_id].isActive = false;
        emit CandidateRemoved(_id);
    }

    /// @notice Move from commit → reveal
    function startReveal() external onlyAdmin onlyPhase(PHASE_COMMIT) {
        phase = PHASE_REVEAL;
        emit PhaseChanged(phase);
    }

    /// @notice Move from reveal → finished and emit final tally snapshot
    function finishElection() external onlyAdmin onlyPhase(PHASE_REVEAL) {
        phase = PHASE_FINISHED;
        emit PhaseChanged(phase);
        emit TallyFinalized(getTally());
    }

    /*//////////////////////////////////////////////////////////////
                             VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Total candidates ever added (incl. inactive)
    function candidateCount() external view returns (uint256) {
        return candidates.length;
    }

    /// @notice Return current per-candidate tallies (0 for inactive candidates)
    function getTally() public view returns (uint256[] memory) {
        uint256 n = candidates.length;
        uint256[] memory counts = new uint256[](n);
        for (uint256 i = 0; i < n; i++) {
            counts[i] = tally[i];
        }
        return counts;
    }

    /// @notice Return full candidate array
    function getCandidates() external view returns (Candidate[] memory) {
        return candidates;
    }

    /// @notice Helper for frontend to show user status
    function getVoterStatus(address _voter) external view returns (bool committed, bool revealed) {
        return (hasCommitted[_voter], hasRevealed[_voter]);
    }

    /// @notice Small info pack for frontend
    function getContractInfo()
        external
        view
        returns (address _admin, uint8 _phase, uint256 _candidateCount, bytes32 _merkleRoot)
    {
        return (admin, phase, candidates.length, merkleRoot);
    }

    /*//////////////////////////////////////////////////////////////
                         FUTURE / PLACEHOLDERS
    //////////////////////////////////////////////////////////////*/
    // commitVote() – Week 3
    // revealVote() – Week 3
    // verifyMerkleProof(address, bytes32[]) – Week 4
    // resetElection() – Week 8
}
