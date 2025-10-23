import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Modal,
} from 'react-native';

interface LoadingSpinnerProps {
  visible: boolean;
  text?: string;
  overlay?: boolean;
  size?: 'small' | 'large';
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  visible,
  text,
  overlay = true,
  size = 'large',
  color = '#059669',
}) => {
  const SpinnerContent = () => (
    <View style={styles.container}>
      <View style={styles.spinnerContainer}>
        <ActivityIndicator size={size} color={color} />
        {text && <Text style={styles.text}>{text}</Text>}
      </View>
    </View>
  );

  if (overlay) {
    return (
      <Modal
        transparent
        animationType="fade"
        visible={visible}
        onRequestClose={() => {}}>
        <SpinnerContent />
      </Modal>
    );
  }

  return visible ? <SpinnerContent /> : null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  spinnerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    minWidth: 120,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
  },
});

export default LoadingSpinner; 