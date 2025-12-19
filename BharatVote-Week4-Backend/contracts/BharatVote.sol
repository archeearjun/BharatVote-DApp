// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BharatVote
 * @notice Week 4 version – Foundation + Admin Controls + Commit-Reveal Voting + Merkle Tree Eligibility
 * @dev Includes commitVote() and revealVote() with full Merkle tree verification
 *      Complete voter eligibility system using cryptographic proofs
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

    // Merkle root for voter eligibility (Week 4: full verification implemented)
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

    /// @notice Set/replace voter eligibility Merkle root (Week 4: full verification active)
    /// @param _root The Merkle root hash representing all eligible voters
    /// @dev This root is computed from eligibleVoters.json off-chain
    ///      Once set, only voters with valid Merkle proofs can vote
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
     * @param _proof Merkle proof array proving voter eligibility (Week 4: full verification)
     * @dev Voters must commit before revealing. Merkle proof verifies eligibility.
     */
    function commitVote(bytes32 _commit, bytes32[] calldata _proof)
        external
        onlyPhase(PHASE_COMMIT)
    {
        // Prevent double-voting
        if (hasCommitted[msg.sender]) revert AlreadyCommitted();
        
        // Validate commitment is not empty
        if (_commit == bytes32(0)) revert EmptyHash();
        
        // Full Merkle tree eligibility verification (Week 4)
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
                    ELIGIBILITY VERIFICATION (WEEK 4)
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Full Merkle tree verification for voter eligibility (Week 4)
     * @dev Verifies that a voter's address is in the Merkle tree by checking
     *      the provided proof against the stored merkleRoot
     * @param _proof Array of Merkle proof hashes (path from leaf to root)
     * @param _voter Address to verify eligibility for
     * @return bool True if voter is eligible (proof is valid)
     * 
     * How it works:
     * 1. Hash the voter address to create the leaf: keccak256(abi.encodePacked(_voter))
     * 2. Reconstruct the path from leaf to root using the proof
     * 3. Compare the computed root with the stored merkleRoot
     * 4. If they match, the voter is eligible
     * 
     * Gas cost: ~2,000-5,000 gas per proof element (depends on tree depth)
     * For a tree with 1,000 voters: ~10-15 proof elements = ~20,000-75,000 gas
     */
    function verifyEligibility(bytes32[] calldata _proof, address _voter)
        internal
        view
        returns (bool)
    {
        // If no merkleRoot is set, allow all voters (testing/development mode)
        if (merkleRoot == bytes32(0)) {
            return true;
        }

        // Create leaf hash: keccak256(abi.encodePacked(_voter))
        // This must match how leaves were created in the backend
        bytes32 leaf = keccak256(abi.encodePacked(_voter));

        // Reconstruct the Merkle root by following the proof path
        bytes32 computedHash = leaf;

        // Iterate through each proof element
        for (uint256 i = 0; i < _proof.length; i++) {
            bytes32 proofElement = _proof[i];

            // Sort the hashes before concatenating (canonical ordering)
            // This matches the backend's sortPairs: true option
            if (computedHash <= proofElement) {
                // Left child: hash(computedHash, proofElement)
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                // Right child: hash(proofElement, computedHash)
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }

        // Verify the computed root matches the stored root
        return computedHash == merkleRoot;
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
    // ✅ Full Merkle verification – Week 4 (COMPLETE)
    // Express backend integration – Week 5
    // Advanced deployment scripts – Week 6
    // Comprehensive testing – Week 7
    // Reset functionality & testnet deployment – Week 8
}

