// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BharatVoteWithIPFS
 * @dev Enhanced voting system with IPFS integration for decentralized data storage
 * @notice Stores critical election data on IPFS while maintaining on-chain verification
 */
contract BharatVoteWithIPFS {
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
    error EmptyIPFSHash();

    address public immutable admin;
    uint8 public phase = 0; // 0: Commit, 1: Reveal, 2: Finished

    struct Candidate {
        uint256 id;
        string name;
        bool isActive;
        string ipfsMetadata; // IPFS hash for candidate profile/manifesto
    }

    struct ElectionData {
        string kycDataIPFS;        // IPFS hash for KYC verification data
        string voterListIPFS;       // IPFS hash for eligible voters list
        string resultsIPFS;         // IPFS hash for final results
        string auditTrailIPFS;      // IPFS hash for audit logs
        uint256 timestamp;
        bool isArchived;
    }

    Candidate[] public candidates;
    bytes32 public merkleRoot;

    mapping(address => bytes32) public commits;
    mapping(address => bool) public hasCommitted;
    mapping(address => bool) public hasRevealed;
    mapping(uint256 => uint256) public tally;
    address[] private voters;

    // IPFS Integration
    ElectionData public currentElection;
    ElectionData[] public archivedElections;
    
    // Mapping to store individual voter proof IPFS hashes (optional privacy layer)
    mapping(address => string) public voterProofIPFS;

    /* ───── Events ───── */
    event CandidateAdded(uint256 id, string name, string ipfsHash);
    event CandidateRemoved(uint256 id);
    event VoteCommitted(address indexed voter, bytes32 commit, uint256 timestamp);
    event VoteRevealed(address indexed voter, uint256 choice, uint256 timestamp);
    event PhaseChanged(uint8 newPhase, uint256 timestamp);
    event TallyFinalized(uint256[] finalTally, string resultsIPFS);
    event ElectionReset();
    event AllCandidatesCleared();
    
    // IPFS Events
    event KYCDataStored(string ipfsHash, uint256 timestamp);
    event VoterListStored(string ipfsHash, uint256 timestamp);
    event ResultsArchived(string ipfsHash, uint256 timestamp);
    event AuditTrailUpdated(string ipfsHash, uint256 timestamp);
    event ElectionArchived(uint256 indexed electionId, string resultsIPFS);

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

    /* ───── IPFS Data Management ───── */

    /**
     * @dev Store KYC data IPFS hash on-chain
     * @param _ipfsHash IPFS hash (CIDv0 or CIDv1) of the KYC data JSON
     */
    function setKYCDataIPFS(string calldata _ipfsHash) external onlyAdmin {
        if (bytes(_ipfsHash).length == 0) revert EmptyIPFSHash();
        currentElection.kycDataIPFS = _ipfsHash;
        currentElection.timestamp = block.timestamp;
        emit KYCDataStored(_ipfsHash, block.timestamp);
    }

    /**
     * @dev Store eligible voters list IPFS hash on-chain
     * @param _ipfsHash IPFS hash of the eligible voters list
     */
    function setVoterListIPFS(string calldata _ipfsHash) external onlyAdmin {
        if (bytes(_ipfsHash).length == 0) revert EmptyIPFSHash();
        currentElection.voterListIPFS = _ipfsHash;
        currentElection.timestamp = block.timestamp;
        emit VoterListStored(_ipfsHash, block.timestamp);
    }

    /**
     * @dev Store audit trail IPFS hash on-chain
     * @param _ipfsHash IPFS hash of the audit trail logs
     */
    function setAuditTrailIPFS(string calldata _ipfsHash) external onlyAdmin {
        if (bytes(_ipfsHash).length == 0) revert EmptyIPFSHash();
        currentElection.auditTrailIPFS = _ipfsHash;
        currentElection.timestamp = block.timestamp;
        emit AuditTrailUpdated(_ipfsHash, block.timestamp);
    }

    /**
     * @dev Store final results on IPFS and archive election
     * @param _ipfsHash IPFS hash of the final results
     */
    function archiveResults(string calldata _ipfsHash) external onlyAdmin onlyPhase(2) {
        if (bytes(_ipfsHash).length == 0) revert EmptyIPFSHash();
        currentElection.resultsIPFS = _ipfsHash;
        currentElection.isArchived = true;
        currentElection.timestamp = block.timestamp;
        
        archivedElections.push(currentElection);
        emit ResultsArchived(_ipfsHash, block.timestamp);
        emit ElectionArchived(archivedElections.length - 1, _ipfsHash);
    }

    /**
     * @dev Store individual voter's Merkle proof on IPFS (privacy layer)
     * @param _voter Voter address
     * @param _ipfsHash IPFS hash of the voter's proof data
     */
    function setVoterProofIPFS(address _voter, string calldata _ipfsHash) external onlyAdmin {
        voterProofIPFS[_voter] = _ipfsHash;
    }

    /* ───── Admin Controls ───── */

    function setMerkleRoot(bytes32 _root) external onlyAdmin {
        merkleRoot = _root;
    }

    /**
     * @dev Add candidate with optional IPFS metadata
     * @param _name Candidate name
     * @param _ipfsMetadata IPFS hash for candidate profile/manifesto
     */
    function addCandidate(string calldata _name, string calldata _ipfsMetadata)
        external
        onlyAdmin
        onlyPhase(0)
    {
        if (bytes(_name).length == 0 || bytes(_name).length > 100) revert InvalidNameLength();
        uint256 id = candidates.length;
        candidates.push(Candidate(id, _name, true, _ipfsMetadata));
        emit CandidateAdded(id, _name, _ipfsMetadata);
    }

    function removeCandidate(uint256 _id)
        external
        onlyAdmin
        onlyPhase(0)
        validCandidateId(_id)
    {
        candidates[_id].isActive = false;
        emit CandidateRemoved(_id);
    }

    function startReveal() external onlyAdmin onlyPhase(0) {
        phase = 1;
        emit PhaseChanged(phase, block.timestamp);
    }

    function finishElection() external onlyAdmin onlyPhase(1) {
        phase = 2;
        emit PhaseChanged(phase, block.timestamp);
        emit TallyFinalized(getTally(), currentElection.resultsIPFS);
    }

    function resetElection() external onlyAdmin {
        if (phase != 2) revert CanOnlyResetAfterFinish();

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
        
        // Reset election data but keep IPFS hashes for reference
        delete currentElection;
        phase = 0;

        emit ElectionReset();
        emit PhaseChanged(phase, block.timestamp);
    }

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
        phase = 0;

        emit ElectionReset();
        emit PhaseChanged(phase, block.timestamp);
    }

    function clearAllCandidates() external onlyAdmin onlyPhase(2) {
        uint256 count = candidates.length;
        delete candidates;
        for (uint256 i = 0; i < count; i++) {
            delete tally[i];
        }
        emit AllCandidatesCleared();
    }

    /* ───── Voting ───── */

    function commitVote(bytes32 _commit, bytes32[] calldata _proof)
        external
        onlyPhase(0)
    {
        if (hasCommitted[msg.sender]) revert AlreadyCommitted();
        if (_commit == bytes32(0)) revert EmptyHash();
        if (!verify(_proof, msg.sender)) revert NotEligible();

        commits[msg.sender] = _commit;
        hasCommitted[msg.sender] = true;
        voters.push(msg.sender);
        emit VoteCommitted(msg.sender, _commit, block.timestamp);
    }

    function revealVote(uint256 _choice, bytes32 _salt)
        external
        onlyPhase(1)
        validCandidateId(_choice)
    {
        if (!hasCommitted[msg.sender]) revert NoCommit();
        if (hasRevealed[msg.sender]) revert AlreadyRevealed();

        bytes32 expectedHash = keccak256(abi.encodePacked(_choice, _salt));
        if (expectedHash != commits[msg.sender]) revert HashMismatch();

        hasRevealed[msg.sender] = true;
        tally[_choice] += 1;
        emit VoteRevealed(msg.sender, _choice, block.timestamp);
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

    /**
     * @dev Get current election IPFS data
     */
    function getCurrentElectionData() external view returns (ElectionData memory) {
        return currentElection;
    }

    /**
     * @dev Get archived election by ID
     */
    function getArchivedElection(uint256 _id) external view returns (ElectionData memory) {
        require(_id < archivedElections.length, "Invalid election ID");
        return archivedElections[_id];
    }

    /**
     * @dev Get total number of archived elections
     */
    function getArchivedElectionsCount() external view returns (uint256) {
        return archivedElections.length;
    }

    /**
     * @dev Get voter's proof IPFS hash
     */
    function getVoterProofIPFS(address _voter) external view returns (string memory) {
        return voterProofIPFS[_voter];
    }
}

