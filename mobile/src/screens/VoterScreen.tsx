import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import {useRoute} from '@react-navigation/native';

import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import { BACKEND_URL, COMMIT_PHASE, REVEAL_PHASE } from '../constants';
import { getBharatVoteContract, solidityPackedKeccak256 } from '../services/BharatVoteService';
import { ethers } from 'ethers';

const VoterScreen: React.FC = () => {
  const route = useRoute();
  const {address, kycVerified, voterId} = (route.params as any) || {};

  const [phase, setPhase] = useState<number | null>(null);
  const [candidates, setCandidates] = useState<{id: number; name: string}[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [salt, setSalt] = useState<string>('');
  const [isCommitting, setIsCommitting] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const canCommit = useMemo(() => phase === COMMIT_PHASE && selectedId !== null && salt.trim().length > 0, [phase, selectedId, salt]);
  const canReveal = useMemo(() => phase === REVEAL_PHASE && selectedId !== null && salt.trim().length > 0, [phase, selectedId, salt]);

  useEffect(() => {
    (async () => {
      try {
        const contract = await getBharatVoteContract();
        const p: number = await contract.phase();
        setPhase(Number(p));
        const list = await contract.getCandidates();
        setCandidates(list.filter((c: any) => c.isActive).map((c: any) => ({ id: Number(c.id), name: c.name })));
      } catch (e) {
        console.warn('Failed to load contract data', e);
      }
    })();
  }, []);

  const generateSalt = () => {
    const s = ethers.hexlify(ethers.randomBytes(32));
    setSalt(s);
  };

  const fetchMerkleProof = async (): Promise<string[]> => {
    const res = await fetch(`${BACKEND_URL}/api/merkle-proof?voter_id=${encodeURIComponent(voterId || 'VOTER1')}`);
    if (!res.ok) throw new Error('Failed to fetch merkle proof');
    return await res.json();
  };

  const handleCommit = async () => {
    if (!canCommit) return;
    setIsCommitting(true);
    setMessage(null);
    try {
      const contract = await getBharatVoteContract();
      const proof = await fetchMerkleProof();
      const candidateId = ethers.toBigInt(selectedId!);
      const bytes32Salt = salt.padEnd(66, '0') as `0x${string}`; // ensure 32 bytes hex
      const commitHash = await solidityPackedKeccak256(['uint256', 'bytes32'], [candidateId, bytes32Salt]);
      const tx = await contract.commitVote(commitHash, proof);
      await tx.wait();
      setMessage('Vote committed. Save your salt to reveal later.');
    } catch (e: any) {
      setMessage(e?.reason || e?.message || 'Commit failed');
    } finally {
      setIsCommitting(false);
    }
  };

  const handleReveal = async () => {
    if (!canReveal) return;
    setIsRevealing(true);
    setMessage(null);
    try {
      const contract = await getBharatVoteContract();
      const candidateId = ethers.toBigInt(selectedId!);
      const bytes32Salt = salt.padEnd(66, '0') as `0x${string}`;
      const tx = await contract.revealVote(candidateId, bytes32Salt);
      await tx.wait();
      setMessage('Vote revealed successfully');
    } catch (e: any) {
      setMessage(e?.reason || e?.message || 'Reveal failed');
    } finally {
      setIsRevealing(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Voting Interface</Text>
        
        <Card>
          <Text style={styles.cardTitle}>Wallet Connected</Text>
          <Text style={styles.address}>{address}</Text>
          
          {kycVerified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✅ KYC Verified</Text>
            </View>
          )}
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Candidates</Text>
          {candidates.length === 0 ? (
            <Text style={styles.statusText}>No candidates available</Text>
          ) : (
            candidates.map((c) => (
              <PrimaryButton
                key={c.id}
                title={`${selectedId === c.id ? '✓ ' : ''}${c.id}. ${c.name}`}
                onPress={() => setSelectedId(c.id)}
                variant={selectedId === c.id ? 'primary' : 'secondary'}
              />
            ))
          )}
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Salt</Text>
          <TextInput
            value={salt}
            onChangeText={setSalt}
            placeholder="0x... (32-byte hex)"
            style={styles.input}
          />
          <PrimaryButton title="Generate Salt" onPress={generateSalt} variant="secondary" />
        </Card>

        {phase === COMMIT_PHASE && (
          <PrimaryButton title={isCommitting ? 'Committing...' : 'Commit Vote'} onPress={handleCommit} disabled={!canCommit || isCommitting} />
        )}
        {phase === REVEAL_PHASE && (
          <PrimaryButton title={isRevealing ? 'Revealing...' : 'Reveal Vote'} onPress={handleReveal} disabled={!canReveal || isRevealing} />
        )}

        {message && (
          <Text style={styles.statusText}>{message}</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#059669',
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 6,
  },
  verifiedBadge: {
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  verifiedText: {
    color: '#059669',
    fontWeight: '600',
    textAlign: 'center',
  },
  statusText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});

export default VoterScreen; 