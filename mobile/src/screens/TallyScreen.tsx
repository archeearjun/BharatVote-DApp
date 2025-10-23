import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';

import Card from '../components/Card';
import { getReadOnlyContract } from '../services/BharatVoteService';

const TallyScreen: React.FC = () => {
  const [rows, setRows] = useState<{id:number; name:string; votes:number}[]>([]);
  const totalVotes = rows.reduce((sum, c) => sum + c.votes, 0);

  useEffect(() => {
    (async () => {
      try {
        const c = await getReadOnlyContract();
        const list = await c.getCandidates();
        const active = list.filter((x: any) => x.isActive);
        const rowsData = await Promise.all(active.map(async (x: any) => {
          const count = await c.getVotes(x.id);
          return { id: Number(x.id), name: x.name, votes: Number(count) };
        }));
        setRows(rowsData);
      } catch (e) {
        console.warn('Failed to load tally', e);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Election Results</Text>
        
        <Card>
          <Text style={styles.cardTitle}>Vote Summary</Text>
          <Text style={styles.totalVotes}>Total Votes Cast: {totalVotes}</Text>
          <Text style={styles.status}>Status: Election Finished</Text>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Candidate Results</Text>
          {rows.map((candidate, index) => {
            const percentage = totalVotes > 0 ? ((candidate.votes / totalVotes) * 100).toFixed(1) : '0.0';
            return (
              <View key={candidate.id} style={styles.candidateRow}>
                <View style={styles.candidateInfo}>
                  <Text style={styles.candidateName}>
                    #{candidate.id + 1} {candidate.name}
                  </Text>
                  <Text style={styles.candidateVotes}>
                    {candidate.votes} votes ({percentage}%)
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      {width: `${percentage}%`},
                      index === 0 && styles.winnerBar
                    ]} 
                  />
                </View>
              </View>
            );
          })}
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Election Details</Text>
          <Text style={styles.description}>
            This is a demonstration of the election results display.
            {'\n\n'}In the full implementation, this will show:
            {'\n'}• Real-time vote counts from blockchain
            {'\n'}• Election phase information
            {'\n'}• Voting statistics and participation rates
            {'\n'}• Verification links to blockchain transactions
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  content: {
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
    marginBottom: 12,
  },
  totalVotes: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    color: '#6B7280',
  },
  candidateRow: {
    marginBottom: 16,
  },
  candidateInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  candidateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  candidateVotes: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D1D5DB',
    borderRadius: 4,
  },
  winnerBar: {
    backgroundColor: '#059669',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});

export default TallyScreen; 