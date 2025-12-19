/**
 * IPFS Integration Test Script
 * Verifies that IPFS storage is working correctly
 */

const axios = require('axios');
const IPFSService = require('../backend/ipfs-service');
require('dotenv').config({ path: '../backend/.env' });

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m'
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

async function testIPFSIntegration() {
    console.log('\n' + '='.repeat(60));
    log('🧪 IPFS Integration Test Suite', colors.blue);
    console.log('='.repeat(60) + '\n');

    const ipfsService = new IPFSService(
        process.env.PINATA_API_KEY,
        process.env.PINATA_SECRET_KEY
    );

    let passedTests = 0;
    let failedTests = 0;

    // Test 1: Authentication
    log('Test 1: Pinata Authentication', colors.blue);
    try {
        const authResult = await ipfsService.testAuthentication();
        if (authResult) {
            log('✅ PASS: Authentication successful', colors.green);
            passedTests++;
        } else {
            log('❌ FAIL: Authentication failed', colors.red);
            failedTests++;
        }
    } catch (error) {
        log(`❌ FAIL: ${error.message}`, colors.red);
        failedTests++;
    }
    console.log();

    // Test 2: Store JSON on IPFS
    log('Test 2: Store JSON Data on IPFS', colors.blue);
    try {
        const testData = {
            test: true,
            timestamp: new Date().toISOString(),
            message: 'BharatVote IPFS Test'
        };
        const result = await ipfsService.pinJSONToIPFS(testData, 'BharatVote-Test');
        log(`✅ PASS: Data stored successfully`, colors.green);
        log(`   IPFS Hash: ${result.ipfsHash}`, colors.reset);
        log(`   Gateway URL: ${result.gatewayUrl}`, colors.reset);
        passedTests++;

        // Save hash for cleanup
        global.testIPFSHash = result.ipfsHash;
    } catch (error) {
        log(`❌ FAIL: ${error.message}`, colors.red);
        failedTests++;
    }
    console.log();

    // Test 3: Retrieve Data from IPFS
    log('Test 3: Retrieve Data from IPFS', colors.blue);
    if (global.testIPFSHash) {
        try {
            const retrievedData = await ipfsService.getFromIPFS(global.testIPFSHash);
            if (retrievedData.message === 'BharatVote IPFS Test') {
                log('✅ PASS: Data retrieved successfully', colors.green);
                log(`   Retrieved: ${JSON.stringify(retrievedData, null, 2)}`, colors.reset);
                passedTests++;
            } else {
                log('❌ FAIL: Retrieved data mismatch', colors.red);
                failedTests++;
            }
        } catch (error) {
            log(`❌ FAIL: ${error.message}`, colors.red);
            failedTests++;
        }
    } else {
        log('⚠️  SKIP: No hash from previous test', colors.yellow);
    }
    console.log();

    // Test 4: Store KYC Data
    log('Test 4: Store KYC Data', colors.blue);
    try {
        const mockKYCData = [
            { voterId: 'TEST001', address: '0x0000000000000000000000000000000000000001' },
            { voterId: 'TEST002', address: '0x0000000000000000000000000000000000000002' }
        ];
        const result = await ipfsService.storeKYCData(mockKYCData);
        log('✅ PASS: KYC data stored successfully', colors.green);
        log(`   IPFS Hash: ${result.ipfsHash}`, colors.reset);
        passedTests++;
    } catch (error) {
        log(`❌ FAIL: ${error.message}`, colors.red);
        failedTests++;
    }
    console.log();

    // Test 5: Store Voter List
    log('Test 5: Store Voter List', colors.blue);
    try {
        const mockVoters = [
            '0x0000000000000000000000000000000000000001',
            '0x0000000000000000000000000000000000000002'
        ];
        const result = await ipfsService.storeVoterList(mockVoters);
        log('✅ PASS: Voter list stored successfully', colors.green);
        log(`   IPFS Hash: ${result.ipfsHash}`, colors.reset);
        passedTests++;
    } catch (error) {
        log(`❌ FAIL: ${error.message}`, colors.red);
        failedTests++;
    }
    console.log();

    // Test 6: Store Audit Trail
    log('Test 6: Store Audit Trail', colors.blue);
    try {
        const mockAuditLogs = [
            {
                timestamp: new Date().toISOString(),
                action: 'TEST_ACTION',
                details: { test: true }
            }
        ];
        const result = await ipfsService.storeAuditTrail(mockAuditLogs);
        log('✅ PASS: Audit trail stored successfully', colors.green);
        log(`   IPFS Hash: ${result.ipfsHash}`, colors.reset);
        passedTests++;
    } catch (error) {
        log(`❌ FAIL: ${error.message}`, colors.red);
        failedTests++;
    }
    console.log();

    // Test 7: Backend Health Check
    log('Test 7: Backend API Health Check', colors.blue);
    try {
        const response = await axios.get('http://localhost:3001/api/health', {
            timeout: 5000
        });
        if (response.data.status === 'healthy') {
            log('✅ PASS: Backend is healthy', colors.green);
            log(`   IPFS Enabled: ${response.data.ipfsEnabled}`, colors.reset);
            passedTests++;
        } else {
            log('❌ FAIL: Backend unhealthy', colors.red);
            failedTests++;
        }
    } catch (error) {
        log(`⚠️  SKIP: Backend not running (${error.message})`, colors.yellow);
        log('   Start backend with: npm run start:ipfs', colors.yellow);
    }
    console.log();

    // Test 8: List Pinned Items
    log('Test 8: List Pinned Items', colors.blue);
    try {
        const items = await ipfsService.listPinnedItems();
        log(`✅ PASS: Retrieved ${items.length} pinned items`, colors.green);
        if (items.length > 0) {
            log(`   Latest: ${items[0].ipfs_pin_hash}`, colors.reset);
        }
        passedTests++;
    } catch (error) {
        log(`❌ FAIL: ${error.message}`, colors.red);
        failedTests++;
    }
    console.log();

    // Cleanup Test Data
    log('Cleanup: Remove Test Data', colors.blue);
    if (global.testIPFSHash) {
        try {
            await ipfsService.unpinFromIPFS(global.testIPFSHash);
            log('✅ Test data cleaned up', colors.green);
        } catch (error) {
            log(`⚠️  Cleanup failed: ${error.message}`, colors.yellow);
        }
    }
    console.log();

    // Summary
    console.log('='.repeat(60));
    log('📊 Test Summary', colors.blue);
    console.log('='.repeat(60));
    log(`✅ Passed: ${passedTests}`, colors.green);
    log(`❌ Failed: ${failedTests}`, colors.red);
    log(`📈 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`, colors.blue);
    console.log('='.repeat(60) + '\n');

    if (failedTests === 0) {
        log('🎉 All tests passed! IPFS integration is working correctly!', colors.green);
    } else {
        log('⚠️  Some tests failed. Please check your configuration.', colors.yellow);
        log('   1. Verify Pinata API keys in backend/.env', colors.yellow);
        log('   2. Check internet connection', colors.yellow);
        log('   3. Verify Pinata service status', colors.yellow);
    }
    console.log();

    process.exit(failedTests === 0 ? 0 : 1);
}

// Run tests
testIPFSIntegration().catch(error => {
    log(`\n❌ Test suite failed: ${error.message}`, colors.red);
    process.exit(1);
});

