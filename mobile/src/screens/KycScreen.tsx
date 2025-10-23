import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import PrimaryButton from '../components/PrimaryButton';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import {BACKEND_URL} from '../constants';
import FaceRecognition from '../components/FaceRecognition';

const KycScreen: React.FC = () => {
  const navigation = useNavigation();
  const [step, setStep] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [voterId, setVoterId] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [faceVisible, setFaceVisible] = useState(false);

  const tabs = ['Voter ID KYC', 'Address Update'];
  const steps = ['EPIC', 'OTP', 'Complete'];

  // Fallback timeout for React Native fetch which may not abort on its own
  const fetchWithTimeout = async (url: string, options: any = {}, timeoutMs = 10000) => {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) => setTimeout(() => reject(new Error('REQUEST_TIMEOUT')), timeoutMs)),
    ]) as Promise<any>;
  };

  const handleSendOtp = async () => {
    if (!voterId.trim()) {
      Alert.alert('Error', 'Please enter your Voter ID');
      return;
    }

    setLoading(true);
    try {
      // Validate EPIC format first
      if (voterId.length < 6) {
        throw new Error('Voter ID must be at least 6 characters');
      }

      // Call backend KYC validation with explicit status checks and timeout
      const url = `${BACKEND_URL}/api/kyc?voter_id=${encodeURIComponent(voterId)}`;
      console.log('[KYC] Request URL:', url);
      const response = await fetchWithTimeout(url, {}, 10000);
      console.log('[KYC] Response status:', response.status);
      if (!response.ok) {
        throw new Error(`KYC request failed: HTTP ${response.status}`);
      }
      const kycResult = await response.json();
      console.log('[KYC] Response JSON:', kycResult);

      if (!kycResult.eligible) {
        throw new Error('Voter ID not found in electoral rolls. Please check your Voter ID.');
      }

      console.log('KYC Validation successful:', kycResult);
      
      // Persist KYC result (e.g., address) to pass to wallet screen later
      (global as any).__kycAddress = kycResult.address;

      // Show OTP step
      setStep(1);
      Toast.show({
        type: 'success',
        text1: 'Voter ID Verified',
        text2: 'OTP sent to registered mobile number',
      });
    } catch (error: any) {
      console.error('KYC validation error:', error);
      const timedOut = error?.message === 'REQUEST_TIMEOUT';
      const networkError = typeof error?.message === 'string' && error.message.includes('Network request failed');
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: timedOut || networkError
          ? `Cannot reach backend at ${BACKEND_URL}. Start the backend (npm start in backend/) and retry.`
          : (error.message || 'Please check your Voter ID and try again.'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
  };

  const handleOtpSubmit = () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      Alert.alert('Error', 'Please enter complete 6-digit OTP');
      return;
    }

    // For demo purposes, accept these test OTPs based on voter ID
    const validOtps = {
      VOTER1: '123456',
      VOTER2: '234567',
      VOTER3: '345678',
      VOTER4: '456789',
    };

    const expectedOtp = validOtps[voterId] || '123456'; // Default fallback

    if (otpString === expectedOtp) {
      setStep(1);
      setFaceVisible(true);
      Toast.show({
        type: 'success',
        text1: 'OTP Verified',
        text2: 'Please look at the camera for face verification',
      });
    } else {
      Alert.alert(
        'Invalid OTP',
        `For demo: use ${expectedOtp} for ${voterId}`,
      );
    }
  };

  const handleFaceVerified = () => {
    setFaceVisible(false);
    setStep(2);
    Toast.show({
      type: 'success',
      text1: 'Face Verified',
      text2: 'Redirecting to wallet connection...',
    });
    setTimeout(() => {
      navigation.navigate('WalletConnect', {
        voterId,
        kycVerified: true,
      });
    }, 1500);
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {steps.map((stepName, index) => (
        <View key={index} style={styles.progressStep}>
          <Text
            style={[
              styles.progressText,
              index <= step ? styles.activeProgressText : styles.inactiveProgressText,
            ]}>
            {stepName}
          </Text>
          {index < steps.length - 1 && (
            <Text style={styles.progressArrow}>►</Text>
          )}
        </View>
      ))}
    </View>
  );

  const renderSuccessState = () => (
    <View style={styles.successContainer}>
      <View style={styles.successIcon}>
        <Text style={styles.successIconText}>✓</Text>
      </View>
      <Text style={styles.successTitle}>Identity Verified</Text>
      <Text style={styles.successSubtitle}>
        Redirecting to wallet connection...
      </Text>
      <LoadingSpinner visible={true} overlay={false} />
    </View>
  );

  const renderTabButtons = () => (
    <View style={styles.tabContainer}>
      {tabs.map((tab, index) => (
        <PrimaryButton
          key={index}
          title={tab}
          onPress={() => setActiveTab(index)}
          variant={activeTab === index ? 'primary' : 'secondary'}
          size="small"
          style={[
            styles.tabButton,
            index === 0 && styles.tabButtonFirst,
            index === tabs.length - 1 && styles.tabButtonLast,
          ]}
        />
      ))}
    </View>
  );

  const renderVoterIdForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>EPIC Number (Voter ID)</Text>
        <TextInput
          style={styles.textInput}
          value={voterId}
          onChangeText={setVoterId}
          placeholder="Enter your EPIC number"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="characters"
          autoCorrect={false}
        />
        <Text style={styles.helperText}>
          Enter your Election Photo Identity Card (EPIC) number as printed on your voter ID
        </Text>
      </View>

      <PrimaryButton
        title="Send OTP"
        onPress={handleSendOtp}
        loading={loading}
        disabled={!voterId.trim()}
        size="large"
      />
    </View>
  );

  const renderOtpForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Verification Code</Text>
        <Text style={styles.helperText}>
          Enter the 6-digit OTP sent to your registered mobile number
        </Text>
        
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              style={styles.otpInput}
              value={digit}
              onChangeText={(value) => handleOtpChange(index, value)}
              maxLength={1}
              keyboardType="numeric"
              textAlign="center"
            />
          ))}
        </View>
      </View>

      <PrimaryButton
        title="Verify OTP"
        onPress={handleOtpSubmit}
        disabled={otp.join('').length !== 6}
        size="large"
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>BV</Text>
          </View>
          <Text style={styles.title}>BharatVote</Text>
          <Text style={styles.subtitle}>Voter Verification</Text>
        </View>

        {renderProgressBar()}

        <Card style={styles.mainCard}>
          {step === 2 ? (
            renderSuccessState()
          ) : (
            <>
              {renderTabButtons()}
              {activeTab === 0 ? (
                step === 0 ? renderVoterIdForm() : renderOtpForm()
              ) : (
                <View style={styles.placeholderContainer}>
                  <Text style={styles.placeholderText}>
                    Address Update feature coming soon
                  </Text>
                </View>
              )}
            </>
          )}
        </Card>
      </ScrollView>
      
      <LoadingSpinner visible={loading} text="Verifying your identity..." />
      <Toast />

      {faceVisible && (
        <View style={styles.faceModal}>
          <FaceRecognition onVerified={handleFaceVerified} />
          <Text style={styles.facePrompt}>Align your face within the frame</Text>
        </View>
      )}
    </KeyboardAvoidingView>
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
  scrollContent: {
    padding: 16,
    minHeight: '100%',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 48,
    height: 48,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
  },
  activeProgressText: {
    color: '#2563EB',
    fontWeight: 'bold',
  },
  inactiveProgressText: {
    color: '#6B7280',
  },
  progressArrow: {
    color: '#9CA3AF',
    marginHorizontal: 8,
  },
  mainCard: {
    marginBottom: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    marginHorizontal: 2,
  },
  tabButtonFirst: {
    marginLeft: 0,
  },
  tabButtonLast: {
    marginRight: 0,
  },
  formContainer: {
    gap: 24,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#ffffff',
    minHeight: 44,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 8,
  },
  otpInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    color: '#111827',
    backgroundColor: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
    minHeight: 48,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 16,
  },
  successIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#DCFCE7',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconText: {
    fontSize: 32,
    color: '#059669',
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  successSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  placeholderContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  placeholderText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  faceModal: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  facePrompt: {
    position: 'absolute',
    bottom: 40,
    color: '#fff',
    fontSize: 16,
  },
});

export default KycScreen; 