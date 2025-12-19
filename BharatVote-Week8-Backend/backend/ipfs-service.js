/**
 * IPFS Service for BharatVote
 * Handles data storage on IPFS via Pinata
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

class IPFSService {
    constructor(pinataApiKey, pinataSecretKey) {
        this.pinataApiKey = pinataApiKey || process.env.PINATA_API_KEY;
        this.pinataSecretKey = pinataSecretKey || process.env.PINATA_SECRET_KEY;
        this.pinataEndpoint = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
        this.pinataFileEndpoint = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
        this.gateway = 'https://gateway.pinata.cloud/ipfs/';
    }

    /**
     * Verify Pinata authentication
     */
    async testAuthentication() {
        try {
            const url = 'https://api.pinata.cloud/data/testAuthentication';
            const response = await axios.get(url, {
                headers: {
                    'pinata_api_key': this.pinataApiKey,
                    'pinata_secret_api_key': this.pinataSecretKey
                }
            });
            console.log('✅ Pinata authentication successful:', response.data);
            return true;
        } catch (error) {
            console.error('❌ Pinata authentication failed:', error.message);
            return false;
        }
    }

    /**
     * Pin JSON data to IPFS via Pinata
     * @param {Object} data - JSON data to pin
     * @param {string} name - Name/identifier for the pinned data
     * @returns {Promise<Object>} - { ipfsHash, pinataUrl, gatewayUrl }
     */
    async pinJSONToIPFS(data, name) {
        try {
            const payload = {
                pinataContent: data,
                pinataMetadata: {
                    name: name,
                    keyvalues: {
                        project: 'BharatVote',
                        timestamp: new Date().toISOString(),
                        type: 'election-data'
                    }
                }
            };

            const response = await axios.post(this.pinataEndpoint, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'pinata_api_key': this.pinataApiKey,
                    'pinata_secret_api_key': this.pinataSecretKey
                }
            });

            const ipfsHash = response.data.IpfsHash;
            console.log(`✅ Successfully pinned ${name} to IPFS: ${ipfsHash}`);

            return {
                ipfsHash: ipfsHash,
                pinataUrl: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
                gatewayUrl: `${this.gateway}${ipfsHash}`,
                timestamp: response.data.Timestamp,
                size: response.data.PinSize
            };
        } catch (error) {
            console.error(`❌ Failed to pin ${name} to IPFS:`, error.message);
            if (error.response) {
                console.error('Response data:', error.response.data);
            }
            throw error;
        }
    }

    /**
     * Pin file to IPFS via Pinata
     * @param {string} filePath - Path to file
     * @param {string} name - Name/identifier for the pinned file
     * @returns {Promise<Object>} - { ipfsHash, pinataUrl, gatewayUrl }
     */
    async pinFileToIPFS(filePath, name) {
        try {
            const formData = new FormData();
            const file = fs.createReadStream(filePath);
            
            formData.append('file', file);
            
            const metadata = JSON.stringify({
                name: name,
                keyvalues: {
                    project: 'BharatVote',
                    timestamp: new Date().toISOString()
                }
            });
            formData.append('pinataMetadata', metadata);

            const response = await axios.post(this.pinataFileEndpoint, formData, {
                maxBodyLength: 'Infinity',
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                    'pinata_api_key': this.pinataApiKey,
                    'pinata_secret_api_key': this.pinataSecretKey
                }
            });

            const ipfsHash = response.data.IpfsHash;
            console.log(`✅ Successfully pinned file ${name} to IPFS: ${ipfsHash}`);

            return {
                ipfsHash: ipfsHash,
                pinataUrl: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
                gatewayUrl: `${this.gateway}${ipfsHash}`,
                timestamp: response.data.Timestamp,
                size: response.data.PinSize
            };
        } catch (error) {
            console.error(`❌ Failed to pin file ${name} to IPFS:`, error.message);
            throw error;
        }
    }

    /**
     * Retrieve data from IPFS
     * @param {string} ipfsHash - IPFS hash (CID)
     * @returns {Promise<any>} - Retrieved data
     */
    async getFromIPFS(ipfsHash) {
        try {
            const url = `${this.gateway}${ipfsHash}`;
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.error(`❌ Failed to retrieve data from IPFS (${ipfsHash}):`, error.message);
            throw error;
        }
    }

    /**
     * Store KYC data on IPFS
     * @param {Array} kycData - Array of KYC records
     * @returns {Promise<Object>} - IPFS storage result
     */
    async storeKYCData(kycData) {
        const kycPayload = {
            type: 'kyc-data',
            version: '1.0',
            timestamp: new Date().toISOString(),
            data: kycData.map(record => ({
                voterId: record.voterId,
                addressHash: this.hashAddress(record.address), // Hash for privacy
                verificationStatus: 'verified',
                verificationDate: new Date().toISOString()
            }))
        };

        return await this.pinJSONToIPFS(kycPayload, `BharatVote-KYC-${Date.now()}`);
    }

    /**
     * Store eligible voters list on IPFS
     * @param {Array} voterAddresses - Array of eligible voter addresses
     * @returns {Promise<Object>} - IPFS storage result
     */
    async storeVoterList(voterAddresses) {
        const voterPayload = {
            type: 'eligible-voters',
            version: '1.0',
            timestamp: new Date().toISOString(),
            merkleRoot: null, // Will be set after Merkle tree generation
            totalVoters: voterAddresses.length,
            voters: voterAddresses.map(addr => ({
                address: addr.toLowerCase(),
                registered: new Date().toISOString()
            }))
        };

        return await this.pinJSONToIPFS(voterPayload, `BharatVote-Voters-${Date.now()}`);
    }

    /**
     * Store election results on IPFS
     * @param {Object} results - Election results data
     * @returns {Promise<Object>} - IPFS storage result
     */
    async storeResults(results) {
        const resultsPayload = {
            type: 'election-results',
            version: '1.0',
            timestamp: new Date().toISOString(),
            electionId: results.electionId || Date.now(),
            candidates: results.candidates,
            tally: results.tally,
            totalVotes: results.totalVotes,
            phase: results.phase,
            merkleRoot: results.merkleRoot,
            metadata: {
                commitPhaseStart: results.commitPhaseStart,
                revealPhaseStart: results.revealPhaseStart,
                electionFinished: results.electionFinished
            }
        };

        return await this.pinJSONToIPFS(resultsPayload, `BharatVote-Results-${Date.now()}`);
    }

    /**
     * Store audit trail on IPFS
     * @param {Array} auditLogs - Array of audit log entries
     * @returns {Promise<Object>} - IPFS storage result
     */
    async storeAuditTrail(auditLogs) {
        const auditPayload = {
            type: 'audit-trail',
            version: '1.0',
            timestamp: new Date().toISOString(),
            logs: auditLogs
        };

        return await this.pinJSONToIPFS(auditPayload, `BharatVote-Audit-${Date.now()}`);
    }

    /**
     * Generate audit log entry
     * @param {string} action - Action performed
     * @param {Object} details - Additional details
     * @returns {Object} - Audit log entry
     */
    createAuditLog(action, details = {}) {
        return {
            timestamp: new Date().toISOString(),
            action: action,
            details: details,
            blockTimestamp: details.blockTimestamp || null,
            transactionHash: details.transactionHash || null
        };
    }

    /**
     * Hash address for privacy (one-way hash)
     * @param {string} address - Ethereum address
     * @returns {string} - Hashed address
     */
    hashAddress(address) {
        const crypto = require('crypto');
        return crypto.createHash('sha256').update(address.toLowerCase()).digest('hex');
    }

    /**
     * Unpin data from IPFS (remove from Pinata)
     * @param {string} ipfsHash - IPFS hash to unpin
     * @returns {Promise<boolean>} - Success status
     */
    async unpinFromIPFS(ipfsHash) {
        try {
            const url = `https://api.pinata.cloud/pinning/unpin/${ipfsHash}`;
            await axios.delete(url, {
                headers: {
                    'pinata_api_key': this.pinataApiKey,
                    'pinata_secret_api_key': this.pinataSecretKey
                }
            });
            console.log(`✅ Successfully unpinned ${ipfsHash} from IPFS`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to unpin ${ipfsHash} from IPFS:`, error.message);
            return false;
        }
    }

    /**
     * List all pinned items
     * @returns {Promise<Array>} - List of pinned items
     */
    async listPinnedItems() {
        try {
            const url = 'https://api.pinata.cloud/data/pinList';
            const response = await axios.get(url, {
                headers: {
                    'pinata_api_key': this.pinataApiKey,
                    'pinata_secret_api_key': this.pinataSecretKey
                }
            });
            return response.data.rows;
        } catch (error) {
            console.error('❌ Failed to list pinned items:', error.message);
            throw error;
        }
    }
}

module.exports = IPFSService;

