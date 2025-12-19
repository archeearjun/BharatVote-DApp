# BharatVote - Digital Voting Platform

A decentralized voting platform built with React, TypeScript, and Solidity smart contracts.

## Features

- **Commit-Reveal Voting**: Secure voting system where votes are encrypted during commit phase
- **Merkle Proof Verification**: Voter eligibility verification using Merkle trees
- **Admin Panel**: Manage candidates and control election phases
- **Voter Interface**: Clean, intuitive voting experience
- **Real-time Results**: Live election results and statistics

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   cd frontend && npm install
   ```

2. **Start Local Blockchain**
   ```bash
   npx hardhat node
   ```

3. **Deploy Smart Contract**
   ```bash
   npx hardhat run scripts/deploy.ts --network localhost
   ```

4. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

5. **Add Candidates (Admin Only)**
   - Connect your wallet to the frontend
   - Navigate to the Admin Panel
   - Add candidates using the "Add Candidate" form
   - Only candidates added by the admin will appear in the voter panel

6. **Vote**
   - Connect your wallet (must be in eligibleVoters.json)
   - Enter candidate name and generate salt
   - Commit your vote
   - Wait for reveal phase to reveal your vote

## Project Structure

```
BharatVote/
├── contracts/          # Solidity smart contracts
├── frontend/           # React frontend application
├── backend/            # Backend services
├── scripts/            # Deployment and utility scripts
└── tests/              # Contract tests
```

## Smart Contract

The main contract (`BharatVote.sol`) implements:
- Commit-reveal voting mechanism
- Candidate management
- Phase-based election control
- Merkle proof verification

## Frontend

Built with React + TypeScript, featuring:
- Material-UI components
- Responsive design
- Real-time updates
- Wallet integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
