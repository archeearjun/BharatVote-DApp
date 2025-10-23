# BharatVote Testing Suite

This document describes the comprehensive automated testing setup for the BharatVote blockchain voting application.

## Test Coverage

Our testing suite covers all aspects of the application:

### 🔗 Smart Contract Tests
- **Location**: `test/BharatVote.ts`
- **Framework**: Hardhat + Chai + Ethers.js
- **Coverage**:
  - Contract deployment and initialization
  - Admin functionality (candidate management, phase transitions)
  - Voting workflow (commit-reveal mechanism)
  - Merkle proof verification
  - Vote tallying and results
  - Security validations (double voting, unauthorized access)
  - Gas usage optimization

### 🌐 Backend API Tests
- **Location**: `backend/server.test.js`
- **Framework**: Jest + Supertest
- **Coverage**:
  - KYC validation endpoints
  - Merkle proof generation
  - Error handling and edge cases
  - Security tests (SQL injection, XSS)
  - Performance benchmarks
  - Concurrent request handling

### ⚛️ Frontend Component Tests
- **Location**: `frontend/src/**/*.test.tsx`
- **Framework**: Vitest + React Testing Library
- **Coverage**:
  - Component rendering and interaction
  - Form validation and submission
  - KYC workflow testing
  - Error state handling
  - Loading states and user feedback
  - Accessibility compliance

### 🔄 Integration Tests
- **Location**: `tests/integration.test.js`
- **Framework**: Jest + Playwright + Ethers.js
- **Coverage**:
  - End-to-end voting workflow
  - Cross-service communication
  - System health checks
  - Network connectivity validation

## Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 8.0.0
- Git

### Install Dependencies
```bash
# Install all project dependencies
npm run install:all

# Or install individually
npm install                    # Root dependencies
cd backend && npm install      # Backend dependencies
cd frontend && npm install     # Frontend dependencies
cd tests && npm install        # Test dependencies
```

### Run All Tests (Automated)
```bash
# Run the complete automated test suite
node test-runner.js
```

This will:
1. Install all dependencies
2. Start Hardhat local blockchain
3. Deploy smart contracts
4. Start backend API server
5. Run all test suites
6. Generate coverage reports
7. Clean up services

### Run Individual Test Suites

#### Smart Contract Tests
```bash
npm run test:contracts
```

#### Backend Tests
```bash
npm run test:backend
```

#### Frontend Tests
```bash
npm run test:frontend
```

#### Integration Tests
```bash
npm run test:integration
```

## Test Commands Reference

### Root Level Commands
```bash
npm test                    # Run all tests
npm run test:contracts      # Smart contract tests only
npm run test:backend        # Backend API tests only
npm run test:frontend       # Frontend component tests only
npm run test:integration    # Integration tests only
npm run test:coverage       # Run all tests with coverage
npm run test:watch          # Watch mode for backend/frontend
```

### Individual Project Commands

#### Backend (`cd backend`)
```bash
npm test                    # Run backend tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report
```

#### Frontend (`cd frontend`)
```bash
npm test                    # Run frontend tests
npm run test:ui             # Interactive UI test runner
npm run test:coverage       # Coverage report
```

#### Smart Contracts
```bash
npx hardhat test           # Run contract tests
npx hardhat coverage       # Coverage analysis
npx hardhat test --verbose # Detailed output
```

## Test Configuration

### Smart Contract Tests
- **Network**: Hardhat local network (localhost:8545)
- **Accounts**: Pre-funded test accounts
- **Gas**: Optimized for local testing
- **Coverage**: Solidity coverage with `solidity-coverage`

### Backend Tests
- **Environment**: Node.js test environment
- **Mocking**: JSON test data for KYC records
- **API Testing**: Supertest for HTTP endpoint testing
- **Coverage**: Istanbul/NYC coverage reports

### Frontend Tests
- **Environment**: jsdom (browser simulation)
- **Mocking**: MetaMask wallet simulation
- **Utilities**: React Testing Library helpers
- **Coverage**: Vitest native coverage (v8 provider)

### Integration Tests
- **Network**: Connects to local Hardhat network
- **Services**: Tests real backend API endpoints
- **Timeout**: 30-second timeout for complex operations
- **Cleanup**: Automatic service cleanup

## Continuous Integration

### GitHub Actions (Future)
The test suite is designed to work with CI/CD pipelines:

```yaml
# Example .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm run install:all
      - run: node test-runner.js
```

## Coverage Reports

### Viewing Coverage
After running tests with coverage:

```bash
# Smart contract coverage
open coverage/index.html

# Backend coverage
cd backend && open coverage/lcov-report/index.html

# Frontend coverage
cd frontend && open coverage/index.html
```

### Coverage Targets
- **Smart Contracts**: >95% line coverage
- **Backend APIs**: >90% line coverage
- **Frontend Components**: >85% line coverage
- **Integration**: >80% end-to-end workflow coverage

## Debugging Tests

### Debug Smart Contract Tests
```bash
npx hardhat test --verbose
npx hardhat console --network localhost
```

### Debug Backend Tests
```bash
cd backend
npm run test:watch
# Set breakpoints in test files
```

### Debug Frontend Tests
```bash
cd frontend
npm run test:ui
# Use Vitest UI for interactive debugging
```

### Debug Integration Tests
```bash
cd tests
npm run test:watch
# Check service logs in test-runner.js output
```

## Common Issues & Solutions

### Port Conflicts
If you get port conflict errors:
```bash
# Kill processes on common ports
npx kill-port 8545    # Hardhat
npx kill-port 3001    # Backend
npx kill-port 5173    # Frontend dev server
```

### Contract Deployment Failures
```bash
# Clean and redeploy
npx hardhat clean
npm run compile
npm run deploy
```

### Dependency Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Test Timeouts
- Increase timeout in test files for slow operations
- Check network connectivity for integration tests
- Ensure services are properly started before tests

## Performance Benchmarks

### Expected Test Execution Times
- **Smart Contract Tests**: 30-60 seconds
- **Backend Tests**: 10-20 seconds  
- **Frontend Tests**: 15-30 seconds
- **Integration Tests**: 45-90 seconds
- **Complete Suite**: 2-4 minutes

### Optimization Tips
- Run tests in parallel where possible
- Use test database/blockchain snapshots
- Mock external services in unit tests
- Keep integration tests focused on critical paths

## Test Data Management

### KYC Test Data
Located in `backend/kyc-data.json`:
```json
[
  { "voterId": "VOTER1", "address": "0x90F79bf6EB2c4f870365E785982E1f101E93b906" },
  { "voterId": "VOTER2", "address": "0x0000000000000000000000000000000000000002" },
  { "voterId": "VOTER3", "address": "0x0000000000000000000000000000000000000003" },
  { "voterId": "VOTER4", "address": "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199" }
]
```

### Test Ethereum Accounts
Pre-funded accounts from Hardhat:
- **Admin**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` (Account #0)
- **Voter1**: `0x90F79bf6EB2c4f870365E785982E1f101E93b906` (Account #1)
- **Voter2**: `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65` (Account #2)

## Contributing to Tests

### Adding New Tests
1. Follow existing naming conventions
2. Add comprehensive test cases for edge cases
3. Include both positive and negative test scenarios
4. Update this documentation

### Test Standards
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Clean up resources in test teardown
- Mock external dependencies appropriately

### Pull Request Checklist
- [ ] All tests pass locally
- [ ] New functionality has corresponding tests
- [ ] Coverage targets are maintained
- [ ] Documentation is updated
- [ ] No debugging code left in commits

---

For questions or issues with the testing setup, please create an issue in the project repository. 