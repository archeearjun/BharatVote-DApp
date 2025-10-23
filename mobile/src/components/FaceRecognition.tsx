import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';

interface Props {
  onVerified: () => void;
}

const FaceRecognition: React.FC<Props> = ({ onVerified }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate camera permission check
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleManualVerification = () => {
    onVerified();
  };

  if (isLoading) {
    return (
      <View style={styles.center}> 
        <Text style={styles.text}>Initializing camera...</Text>
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <Text style={styles.text}>Camera functionality temporarily disabled</Text>
      <Text style={styles.subText}>Face recognition will be added back later</Text>
      <TouchableOpacity style={styles.button} onPress={handleManualVerification}>
        <Text style={styles.buttonText}>Continue (Demo Mode)</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 18,
    color: Platform.OS === 'ios' ? '#000' : '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subText: {
    fontSize: 14,
    color: Platform.OS === 'ios' ? '#666' : '#ccc',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FaceRecognition; 