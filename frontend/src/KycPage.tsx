import React, { useState } from 'react';
import { useI18n } from './i18n';
import FaceRecognition from './components/FaceRecognition';
import { BACKEND_URL } from './constants';
import { 
  Shield, 
  User, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Phone, 
  Eye, 
  Camera,
  ArrowRight
} from 'lucide-react';

interface KycPageProps {
  account: string;
  electionAddress?: string;
  onVerified: (voterId: string) => void;
}

const KycPage: React.FC<KycPageProps> = ({ account, electionAddress, onVerified }) => {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [voterId, setVoterId] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpVisible, setOtpVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [faceVisible, setFaceVisible] = useState(false);

  const tabs = [t('kyc.voterIdKYC'), t('kyc.addressUpdate')];
  const steps = [t('kyc.epic'), t('kyc.otp'), t('kyc.complete')];

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voterId.trim()) return;

    setLoading(true);
    try {
      // Validate EPIC format first
      if (voterId.length < 6) {
        throw new Error('Voter ID must be at least 6 characters');
      }

      console.log('DEBUG KYC: Starting KYC validation for voter:', voterId);
      console.log('DEBUG KYC: Backend URL:', BACKEND_URL);
      console.log('DEBUG KYC: Account:', account);

      // Call backend KYC validation
      const kycUrl = new URL(`${BACKEND_URL}/api/kyc`);
      kycUrl.searchParams.set('voter_id', voterId);
      if (account) {
        kycUrl.searchParams.set('address', account);
      }
      if (electionAddress) {
        kycUrl.searchParams.set('electionAddress', electionAddress);
      }
      const response = await fetch(kycUrl.toString());
      console.log('DEBUG KYC: Backend response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Backend validation failed with status ${response.status}`);
      }
      
      const kycResult = await response.json();
      console.log('DEBUG KYC: Backend response data:', kycResult);

      if (!kycResult.eligible) {
        throw new Error('Voter ID not found in electoral rolls. Please check your Voter ID.');
      }

      // Verify that the connected wallet address matches the voter's registered address
      const expectedAddress = kycResult.address?.toLowerCase();
      const connectedAddress = account?.toLowerCase();

      console.log('KYC Validation Details:');
      console.log('- Voter ID:', voterId);
      console.log('- Expected Address:', expectedAddress);
      console.log('- Connected Address:', connectedAddress);
      console.log('- Addresses Match:', expectedAddress === connectedAddress);

      if (!expectedAddress || !connectedAddress) {
        throw new Error('Unable to verify wallet connection. Please try again.');
      }

      if (expectedAddress !== connectedAddress) {
        throw new Error('You are not eligible to vote with this wallet. Please ensure you are using the correct voter credentials and wallet.');
      }

      // Store the validated voter data
      console.log('DEBUG KYC: KYC Validation successful:', kycResult);
      console.log('DEBUG KYC: Showing OTP modal');
      
      // Show OTP modal for final verification
      setOtpVisible(true);
      setStep(1);
      setToast({ type: 'success', message: t('kyc.voterIdVerified') });
    } catch (error: unknown) {
      console.error('DEBUG KYC: KYC validation error:', error);
      setToast({ 
        type: 'error', 
        message: (error as any)?.message || t('kyc.kycValidationFailed') 
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

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpSubmit = () => {
    console.log('DEBUG KYC: OTP submit button clicked');
    const otpString = otp.join('');
    console.log('DEBUG KYC: Entered OTP:', otpString);
    console.log('DEBUG KYC: OTP length:', otpString.length);
    
    if (otpString.length !== 6) {
      console.log('DEBUG KYC: OTP incomplete, showing error');
      setToast({ type: 'error', message: t('kyc.enterCompleteOTP') });
      return;
    }

    // For demo purposes, accept these test OTPs based on voter ID
    const expectedOtp = '123456';
    console.log('DEBUG KYC: Voter ID:', voterId);
    console.log('DEBUG KYC: Expected OTP:', expectedOtp);
    console.log('DEBUG KYC: OTP match:', otpString === expectedOtp);

    if (otpString === expectedOtp) {
      console.log('DEBUG KYC: OTP verified successfully, showing face verification');
      setOtpVisible(false);
      setFaceVisible(true);
      setToast({ type: 'success', message: t('kyc.otpVerified') });
    } else {
      console.log('DEBUG KYC: OTP verification failed');
      setToast({ 
        type: 'error', 
        message: `OTP verification failed. Expected: ${expectedOtp} for ${voterId}` 
      });
    }
  };

  const handleFaceVerified = () => {
    console.log('DEBUG KYC: Face verification completed, calling onVerified');
    setFaceVisible(false);
    setStep(2);
    setToast({ type: 'success', message: t('kyc.faceVerified') });
    setTimeout(() => {
      console.log('DEBUG KYC: Calling onVerified with voterId:', voterId);
      try {
        const key = `bv_kyc_${account.toLowerCase()}`;
        localStorage.setItem(key, '1');
        localStorage.setItem(`${key}_id`, voterId);
      } catch (err) {
        console.error('DEBUG KYC: Failed to persist voter id', err);
      }
      onVerified(voterId);
    }, 1500);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-subtle font-sans flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="card-premium p-8 text-center">
            {/* Header */}
            <div className="mb-8">
              <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-semibold text-slate-900 mb-2">BharatVote</h1>
              <p className="text-sm text-slate-600">{t('kyc.voterVerification')}</p>
              <p className="text-xs text-slate-500 mt-2">
                Demo elections skip KYC. You’re verifying for a main election.
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-2">
                {steps.map((stepName, index) => (
                  <div key={index} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium ${
                      index < step ? 'bg-success-500 border-success-500 text-white' :
                      index === step ? 'bg-brand-500 border-brand-500 text-white' :
                      'bg-slate-100 border-slate-300 text-slate-500'
                    }`}>
                      {index < step ? <CheckCircle className="w-4 h-4" /> : index + 1}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-8 h-0.5 mx-2 ${
                        index < step ? 'bg-success-500' : 'bg-slate-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-3">
                <span className="text-sm font-medium text-slate-700">
                  {steps[step]}
                </span>
              </div>
            </div>

            {/* Success State */}
            {step === 2 ? (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-success-100 rounded-2xl flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 text-success-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Identity Verified</h3>
                  <p className="text-sm text-slate-600">Redirecting to voting interface...</p>
                </div>
                <div className="flex justify-center">
                  <div className="spinner w-6 h-6"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Tabs */}
                <div className="bg-slate-100 rounded-xl p-1 flex">
                  {tabs.map((tab, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTab(index)}
                      className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                        activeTab === index
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {index === 0 ? <User className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                        <span className="hidden sm:inline">{tab}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Form Content */}
                {activeTab === 0 && step === 0 && (
                  <form onSubmit={handleSendOtp} className="space-y-6">
                    <div className="text-left">
                      <label htmlFor="epic" className="block text-sm font-medium text-slate-700 mb-2">
                        Voter ID
                      </label>
                      <input
                        id="epic"
                        type="text"
                        value={voterId}
                        onChange={(e) => setVoterId(e.target.value.toUpperCase())}
                        placeholder="VOTER1"
                        maxLength={15}
                        autoFocus
                        className="input-base w-full text-center font-mono"
                        disabled={loading}
                      />
                      <p className="text-xs text-slate-500 mt-2">Enter your registered Voter ID</p>
                    </div>
                    <button
                      type="submit"
                      disabled={!voterId.trim() || loading}
                      className="btn-primary w-full"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="spinner w-4 h-4"></div>
                          Sending...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Phone className="w-4 h-4" />
                          Send OTP
                        </div>
                      )}
                    </button>
                  </form>
                )}

                {activeTab === 1 && (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Phone className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500">Address update feature coming soon</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {otpVisible && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
             onClick={() => setOtpVisible(false)}>
          <div className="card-premium p-6 w-full max-w-sm mx-auto"
               onClick={(e) => e.stopPropagation()}>
            <div className="text-center space-y-6">
              <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mx-auto">
                <Phone className="w-6 h-6 text-brand-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  OTP Verification
                </h3>
                <p className="text-sm text-slate-600 mb-2">
                  Enter the 6-digit OTP sent to your registered mobile number
                </p>
                <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded">
                  <strong>Mock Mode:</strong> Use OTP <code className="bg-slate-200 px-1 rounded">123456</code>
                </div>
              </div>
              
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    className="w-12 h-12 text-center text-lg font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                ))}
              </div>
              
              <button
                onClick={handleOtpSubmit}
                disabled={otp.some(digit => !digit)}
                className="btn-primary w-full"
              >
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Verify OTP
                </div>
              </button>
              
              <p className="text-sm text-slate-600">
                Didn't receive OTP?{' '}
                <button className="text-brand-600 hover:text-brand-700 font-medium underline">
                  Resend
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Face Recognition Modal */}
      {faceVisible && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
             onClick={() => setFaceVisible(false)}>
          <div className="card-premium p-6 w-full max-w-md mx-auto"
               onClick={(e) => e.stopPropagation()}>
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                  <Camera className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Face Verification</h3>
              </div>
              
              <div className="bg-slate-900 rounded-xl overflow-hidden">
                <FaceRecognition onVerified={handleFaceVerified} />
              </div>
              
              <p className="text-sm text-slate-600 flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" />
                Align your face within the frame
              </p>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`card-premium p-4 min-w-80 ${
            toast.type === 'success' ? 'border-l-4 border-success-500' : 'border-l-4 border-error-500'
          }`}>
            <div className="flex items-start gap-3">
              {toast.type === 'success' ? 
                <CheckCircle className="w-5 h-5 text-success-600 mt-0.5" /> :
                <AlertTriangle className="w-5 h-5 text-error-600 mt-0.5" />
              }
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  toast.type === 'success' ? 'text-success-800' : 'text-error-800'
                }`}>
                  {toast.type === 'success' ? 'Success' : 'Error'}
                </p>
                <p className={`text-sm ${
                  toast.type === 'success' ? 'text-success-700' : 'text-error-700'
                }`}>
                  {toast.message}
                </p>
              </div>
              <button 
                onClick={() => setToast(null)}
                className={`${
                  toast.type === 'success' ? 'text-success-600 hover:text-success-700' : 'text-error-600 hover:text-error-700'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default KycPage; 
