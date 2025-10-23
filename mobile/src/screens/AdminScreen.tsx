import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import {useRoute} from '@react-navigation/native';

import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';

const AdminScreen: React.FC = () => {
  const route = useRoute();
  const {address} = route.params || {};

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Election Administration</Text>
        
        <Card>
          <Text style={styles.cardTitle}>Admin Wallet</Text>
          <Text style={styles.address}>{address}</Text>
          <View style={styles.adminBadge}>
            <Text style={styles.adminText}>👑 Administrator</Text>
          </View>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Admin Functions</Text>
          <Text style={styles.description}>
            Administrative features coming soon:
            {'\n'}• Add/Remove candidates
            {'\n'}• Advance election phases
            {'\n'}• Set Merkle root for eligible voters
            {'\n'}• Reset election
            {'\n'}• View election statistics
          </Text>
        </Card>

        <View style={styles.buttonContainer}>
          <PrimaryButton
            title="Manage Candidates"
            onPress={() => console.log('Manage candidates')}
            variant="primary"
          />
          <PrimaryButton
            title="Election Phases"
            onPress={() => console.log('Election phases')}
            variant="secondary"
          />
          <PrimaryButton
            title="View Results"
            onPress={() => console.log('View results')}
            variant="secondary"
          />
        </View>
      </View>
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
  adminBadge: {
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  adminText: {
    color: '#D97706',
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 12,
  },
});

export default AdminScreen; 