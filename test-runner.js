#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestRunner {
  constructor() {
    this.results = {
      contracts: { passed: 0, failed: 0, errors: [] },
      backend: { passed: 0, failed: 0, errors: [] },
      frontend: { passed: 0, failed: 0, errors: [] },
      integration: { passed: 0, failed: 0, errors: [] }
    };
    this.services = {
      hardhat: null,
      backend: null
    };
  }

  async runCommand(command, cwd = '.') {
    return new Promise((resolve, reject) => {
      console.log(`🔄 Running: ${command} in ${cwd}`);
      
      exec(command, { cwd }, (error, stdout, stderr) => {
        if (error) {
          console.error(`❌ Error: ${error.message}`);
          reject(error);
        } else {
          console.log(`✅ Success: ${command}`);
          resolve({ stdout, stderr });
        }
      });
    });
  }

  async startHardhatNode() {
    return new Promise((resolve, reject) => {
      console.log('🚀 Starting Hardhat node...');
      
      const hardhat = spawn('npx', ['hardhat', 'node'], {
        stdio: 'pipe',
        detached: true
      });

      let resolved = false;
      
      hardhat.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`Hardhat: ${output.trim()}`);
        
        if (output.includes('Started HTTP and WebSocket JSON-RPC server') && !resolved) {
          resolved = true;
          this.services.hardhat = hardhat;
          console.log('✅ Hardhat node started successfully');
          resolve(hardhat);
        }
      });

      hardhat.stderr.on('data', (data) => {
        console.error(`Hardhat Error: ${data.toString()}`);
      });

      hardhat.on('error', (error) => {
        if (!resolved) {
          resolved = true;
          reject(error);
        }
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          reject(new Error('Hardhat node startup timeout'));
        }
      }, 30000);
    });
  }

  async deployContract() {
    try {
      console.log('📄 Deploying smart contract...');
      await this.runCommand('npm run deploy');
      console.log('✅ Contract deployed successfully');
    } catch (error) {
      console.error('❌ Contract deployment failed:', error.message);
      throw error;
    }
  }

  async startBackend() {
    return new Promise((resolve, reject) => {
      console.log('🚀 Starting backend server...');
      
      const backend = spawn('node', ['server.js'], {
        cwd: 'backend',
        stdio: 'pipe',
        detached: true
      });

      let resolved = false;
      
      backend.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`Backend: ${output.trim()}`);
        
        if (output.includes('Server running on port') && !resolved) {
          resolved = true;
          this.services.backend = backend;
          console.log('✅ Backend server started successfully');
          resolve(backend);
        }
      });

      backend.stderr.on('data', (data) => {
        console.error(`Backend Error: ${data.toString()}`);
      });

      backend.on('error', (error) => {
        if (!resolved) {
          resolved = true;
          reject(error);
        }
      });

      // Timeout after 15 seconds
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          reject(new Error('Backend startup timeout'));
        }
      }, 15000);
    });
  }

  async runContractTests() {
    try {
      console.log('\n🧪 Running Smart Contract Tests...');
      const result = await this.runCommand('npm run test:contracts');
      this.results.contracts.passed = 1;
      console.log('✅ Smart contract tests passed');
    } catch (error) {
      this.results.contracts.failed = 1;
      this.results.contracts.errors.push(error.message);
      console.error('❌ Smart contract tests failed');
    }
  }

  async runBackendTests() {
    try {
      console.log('\n🧪 Running Backend Tests...');
      const result = await this.runCommand('npm test', 'backend');
      this.results.backend.passed = 1;
      console.log('✅ Backend tests passed');
    } catch (error) {
      this.results.backend.failed = 1;
      this.results.backend.errors.push(error.message);
      console.error('❌ Backend tests failed');
    }
  }

  async runFrontendTests() {
    try {
      console.log('\n🧪 Running Frontend Tests...');
      const result = await this.runCommand('npm test', 'frontend');
      this.results.frontend.passed = 1;
      console.log('✅ Frontend tests passed');
    } catch (error) {
      this.results.frontend.failed = 1;
      this.results.frontend.errors.push(error.message);
      console.error('❌ Frontend tests failed');
    }
  }

  async runIntegrationTests() {
    try {
      console.log('\n🧪 Running Integration Tests...');
      const result = await this.runCommand('npm test', 'tests');
      this.results.integration.passed = 1;
      console.log('✅ Integration tests passed');
    } catch (error) {
      this.results.integration.failed = 1;
      this.results.integration.errors.push(error.message);
      console.error('❌ Integration tests failed');
    }
  }

  async installDependencies() {
    console.log('📦 Installing dependencies...');
    
    try {
      await this.runCommand('npm install');
      console.log('✅ Root dependencies installed');
    } catch (error) {
      console.warn('⚠️  Root dependencies installation failed');
    }

    try {
      await this.runCommand('npm install', 'backend');
      console.log('✅ Backend dependencies installed');
    } catch (error) {
      console.warn('⚠️  Backend dependencies installation failed');
    }

    try {
      await this.runCommand('npm install', 'frontend');
      console.log('✅ Frontend dependencies installed');
    } catch (error) {
      console.warn('⚠️  Frontend dependencies installation failed');
    }

    try {
      await this.runCommand('npm install', 'tests');
      console.log('✅ Test dependencies installed');
    } catch (error) {
      console.warn('⚠️  Test dependencies installation failed');
    }
  }

  cleanup() {
    console.log('\n🧹 Cleaning up...');
    
    if (this.services.hardhat) {
      console.log('Stopping Hardhat node...');
      process.kill(-this.services.hardhat.pid);
    }
    
    if (this.services.backend) {
      console.log('Stopping backend server...');
      process.kill(-this.services.backend.pid);
    }
  }

  printResults() {
    console.log('\n📊 Test Results Summary');
    console.log('========================');
    
    const categories = ['contracts', 'backend', 'frontend', 'integration'];
    let totalPassed = 0;
    let totalFailed = 0;
    
    categories.forEach(category => {
      const result = this.results[category];
      totalPassed += result.passed;
      totalFailed += result.failed;
      
      const status = result.failed === 0 ? '✅' : '❌';
      console.log(`${status} ${category.padEnd(12)}: ${result.passed} passed, ${result.failed} failed`);
      
      if (result.errors.length > 0) {
        result.errors.forEach(error => {
          console.log(`   Error: ${error}`);
        });
      }
    });
    
    console.log('========================');
    console.log(`📈 Total: ${totalPassed} passed, ${totalFailed} failed`);
    
    if (totalFailed === 0) {
      console.log('🎉 All tests passed successfully!');
    } else {
      console.log('💥 Some tests failed. Please check the errors above.');
    }
  }

  async run() {
    console.log('🚀 BharatVote Automated Test Suite');
    console.log('===================================\n');

    try {
      // Install dependencies
      await this.installDependencies();

      // Start services
      await this.startHardhatNode();
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for Hardhat to stabilize
      
      await this.deployContract();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await this.startBackend();
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for backend to stabilize

      // Run all tests
      await this.runContractTests();
      await this.runBackendTests();
      await this.runFrontendTests();
      await this.runIntegrationTests();

    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
    } finally {
      this.cleanup();
      this.printResults();
    }
  }
}

// Handle cleanup on exit
process.on('SIGINT', () => {
  console.log('\n⚡ Received SIGINT, cleaning up...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⚡ Received SIGTERM, cleaning up...');
  process.exit(0);
});

// Run the test suite
const runner = new TestRunner();
runner.run(); 