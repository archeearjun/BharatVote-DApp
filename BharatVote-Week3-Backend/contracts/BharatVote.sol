// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BharatVote
 * @notice Week 3 version – Foundation + Admin Controls + Commit-Reveal Voting
 * @dev Includes commitVote() and revealVote() with basic eligibility check
 *      Full Merkle tree verification implementation is Week 4
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
    error EmptyHash();
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

    // Merkle root for voter eligibility (verification in Week 4)
    bytes32 public merkleRoot;

    // Commit-reveal mappings (Week 3)
    mapping(address => bytes32) public commits;
    mapping(address => bool) public hasCommitted;
    mapping(address => bool) public hasRevealed;
    mapping(uint256 => uint256) public tally;

    // Track voters for reset functionality
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

    /// @notice Set/replace voter eligibility root (full verification in Week 4)
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
                      VOTING – WEEK 3 (COMMIT-REVEAL)
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Commit a vote hash during commit phase
     * @param _commit The keccak256 hash of (candidateId + salt)
     * @param _proof Merkle proof array (basic check in Week 3, full verification Week 4)
     * @dev Voters must commit before revealing
     */
    function commitVote(bytes32 _commit, bytes32[] calldata _proof)
        external
        onlyPhase(PHASE_COMMIT)
    {
        // Prevent double-voting
        if (hasCommitted[msg.sender]) revert AlreadyCommitted();
        
        // Validate commitment is not empty
        if (_commit == bytes32(0)) revert EmptyHash();
        
        // Basic eligibility check (Week 3: simple verification)
        // Week 4 will implement full Merkle proof verification
        if (!verifyEligibility(_proof, msg.sender)) revert NotEligible();

        // Store commitment
        commits[msg.sender] = _commit;
        hasCommitted[msg.sender] = true;
        voters.push(msg.sender);

        emit VoteCommitted(msg.sender, _commit);
    }

    /**
     * @notice Reveal a previously committed vote
     * @param _choice The candidate ID the voter chose
     * @param _salt The random salt used during commit phase
     * @dev Contract verifies hash matches commitment
     */
    function revealVote(uint256 _choice, bytes32 _salt)
        external
        onlyPhase(PHASE_REVEAL)
        validCandidateId(_choice)
    {
        // Must have committed first
        if (!hasCommitted[msg.sender]) revert NoCommit();
        
        // Prevent double-revealing
        if (hasRevealed[msg.sender]) revert AlreadyRevealed();

        // Recompute hash and verify it matches commitment
        bytes32 expectedHash = keccak256(abi.encodePacked(_choice, _salt));
        if (expectedHash != commits[msg.sender]) revert HashMismatch();

        // Mark as revealed and tally vote
        hasRevealed[msg.sender] = true;
        tally[_choice] += 1;

        emit VoteRevealed(msg.sender, _choice);
    }

    /*//////////////////////////////////////////////////////////////
                    ELIGIBILITY VERIFICATION (WEEK 3-4)
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Basic eligibility check (Week 3 version)
     * @dev Week 4 will implement full Merkle tree verification
     * @param _proof Merkle proof (currently unused, prepared for Week 4)
     * @param _voter Address to verify
     * @return bool True if eligible
     */
    function verifyEligibility(bytes32[] calldata _proof, address _voter)
        internal
        view
        returns (bool)
    {
        // Week 3: Simple check - if merkleRoot is set, allow all for testing
        // Week 4: Full Merkle proof verification implementation
        
        // If no merkleRoot set, anyone can vote (testing mode)
        if (merkleRoot == bytes32(0)) {
            return true;
        }
        
        // Week 3: Basic placeholder - returns true if proof provided
        // This allows testing the commit-reveal flow
        // Week 4 will replace this with actual Merkle verification
        return _proof.length > 0 || _voter != address(0);
    }

    /*//////////////////////////////////////////////////////////////
                             VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Total candidates ever added (incl. inactive)
    function candidateCount() external view returns (uint256) {
        return candidates.length;
    }

    /// @notice Return current per-candidate tallies
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
    function getVoterStatus(address _voter)
        external
        view
        returns (bool committed, bool revealed)
    {
        return (hasCommitted[_voter], hasRevealed[_voter]);
    }

    /// @notice Get total number of voters who have committed
    function getVoterCount() external view returns (uint256) {
        return voters.length;
    }

    /// @notice Small info pack for frontend
    function getContractInfo()
        external
        view
        returns (
            address _admin,
            uint8 _phase,
            uint256 _candidateCount,
            bytes32 _merkleRoot,
            uint256 _voterCount
        )
    {
        return (admin, phase, candidates.length, merkleRoot, voters.length);
    }

    /// @notice Get voter's commit hash (for debugging)
    function getCommit(address _voter) external view returns (bytes32) {
        return commits[_voter];
    }

    /*//////////////////////////////////////////////////////////////
                         FUTURE / PLACEHOLDERS
    //////////////////////////////////////////////////////////////*/
    // Full Merkle verification – Week 4
    // Express backend integration – Week 5
    // Advanced deployment scripts – Week 6
    // Comprehensive testing – Week 7
    // Reset functionality & testnet deployment – Week 8
}

