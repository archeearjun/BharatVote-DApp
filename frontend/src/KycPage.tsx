import React, { useRef, useState } from 'react';
import { useI18n } from './i18n';
import FaceRecognition from './components/FaceRecognition';
import { BACKEND_URL } from './constants';
import { setStoredKycVerification } from './utils/kycStorage';
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  X,
  Phone,
  Eye,
  Camera,
  Wallet,
} from 'lucide-react';

interface KycPageProps {
  account: string;
  electionAddress?: string;
  onVerified: (voterId: string) => void;
}

const OTP_LENGTH = 6;
const SANDBOX_OTP = '123456';

const KycPage: React.FC<KycPageProps> = ({ account, electionAddress, onVerified }) => {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [voterId, setVoterId] = useState('');
  const [otp, setOtp] = useState(Array.from({ length: OTP_LENGTH }, () => ''));
  const [otpVisible, setOtpVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [faceVisible, setFaceVisible] = useState(false);
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const steps = [t('kyc.epic'), t('kyc.otp'), t('kyc.complete')];
  const shortAccount = `${account.slice(0, 6)}...${account.slice(-4)}`;

  const resetOtp = () => {
    setOtp(Array.from({ length: OTP_LENGTH }, () => ''));
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voterId.trim()) return;

    setLoading(true);
    try {
      if (voterId.length < 6) {
        throw new Error('Voter ID must be at least 6 characters');
      }

      const kycUrl = new URL(`${BACKEND_URL}/api/kyc`);
      kycUrl.searchParams.set('voter_id', voterId);
      if (account) {
        kycUrl.searchParams.set('address', account);
      }
      if (electionAddress) {
        kycUrl.searchParams.set('electionAddress', electionAddress);
      }

      const response = await fetch(kycUrl.toString());
      if (!response.ok) {
        let backendMessage = '';
        try {
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const payload = await response.json();
            backendMessage = String(payload?.error || '').trim();
          } else {
            backendMessage = (await response.text()).trim();
          }
        } catch {}

        if (response.status === 404 && backendMessage.toLowerCase().includes('allowlist not uploaded')) {
          throw new Error('This election is not ready for voter verification yet. Ask the admin to upload the voter list first.');
        }

        throw new Error(backendMessage || `Backend validation failed with status ${response.status}`);
      }

      const kycResult = await response.json();
      if (!kycResult.eligible) {
        throw new Error('Voter ID not found in electoral rolls. Please check your Voter ID.');
      }

      const expectedAddress = kycResult.address?.toLowerCase();
      const connectedAddress = account?.toLowerCase();

      if (!expectedAddress || !connectedAddress) {
        throw new Error('Unable to verify wallet connection. Please try again.');
      }

      if (expectedAddress !== connectedAddress) {
        throw new Error('This wallet does not match the verified voter record for this election.');
      }

      setStep(1);
      setOtpVisible(true);
      setToast({ type: 'success', message: t('kyc.voterIdVerified') });
    } catch (error: unknown) {
      setToast({
        type: 'error',
        message: (error as any)?.message || t('kyc.kycValidationFailed'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const sanitizedValue = value.replace(/\D/g, '').slice(-1);
    const nextOtp = [...otp];
    nextOtp[index] = sanitizedValue;
    setOtp(nextOtp);

    if (sanitizedValue && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }

    if (!sanitizedValue && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedDigits = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pastedDigits) return;

    event.preventDefault();
    const nextOtp = Array.from({ length: OTP_LENGTH }, (_, index) => pastedDigits[index] || '');
    setOtp(nextOtp);

    const nextFocusIndex = Math.min(pastedDigits.length, OTP_LENGTH) - 1;
    if (nextFocusIndex >= 0) {
      otpInputRefs.current[nextFocusIndex]?.focus();
    }
  };

  const handleOtpSubmit = () => {
    const otpString = otp.join('');

    if (otpString.length !== OTP_LENGTH) {
      setToast({ type: 'error', message: t('kyc.enterCompleteOTP') });
      return;
    }

    if (otpString !== SANDBOX_OTP) {
      setToast({
        type: 'error',
        message: 'The OTP code did not match. Please check the sandbox code and try again.',
      });
      return;
    }

    setOtpVisible(false);
    setFaceVisible(true);
    setToast({ type: 'success', message: t('kyc.otpVerified') });
  };

  const handleFaceVerified = () => {
    setFaceVisible(false);
    setStep(2);
    setToast({ type: 'success', message: t('kyc.faceVerified') });
    setTimeout(() => {
      try {
        setStoredKycVerification(account, electionAddress, voterId);
      } catch {}
      onVerified(voterId);
    }, 1200);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-subtle font-sans flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="card-premium space-y-6 p-8 text-center">
            <div>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-slate-900 shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h1 className="mb-2 text-2xl font-semibold text-slate-900">BharatVote</h1>
              <p className="text-sm text-slate-600">{t('kyc.voterVerification')}</p>
              <p className="mt-2 text-sm text-slate-500">
                Demo elections skip KYC. You are verifying for a main election.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                  <Wallet className="h-5 w-5 text-slate-700" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Connected wallet</p>
                  <p className="font-mono text-sm text-slate-900">{shortAccount}</p>
                </div>
              </div>
              <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">1. Verify voter ID</div>
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">2. Confirm OTP</div>
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">3. Complete face check</div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-center space-x-2">
                {steps.map((stepName, index) => (
                  <div key={stepName} className="flex items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium ${
                        index < step
                          ? 'border-green-600 bg-green-600 text-white'
                          : index === step
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-300 bg-slate-100 text-slate-500'
                      }`}
                    >
                      {index < step ? <CheckCircle className="h-4 w-4" /> : index + 1}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`mx-2 h-0.5 w-8 ${index < step ? 'bg-green-600' : 'bg-slate-200'}`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-center">
                <span className="text-sm font-medium text-slate-700">{steps[step]}</span>
              </div>
            </div>

            {step === 2 ? (
              <div className="space-y-6 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-green-50">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-slate-900">Identity verified</h3>
                  <p className="text-sm text-slate-600">Redirecting you to the voting interface…</p>
                </div>
                <div className="flex justify-center">
                  <div className="spinner h-6 w-6" />
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 text-left">
                  <p className="text-sm font-semibold text-slate-900">Verify identity</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Enter the voter ID linked to this wallet. BharatVote will verify the wallet-address match before the voting UI is unlocked.
                  </p>
                </div>

                <div className="text-left">
                  <label htmlFor="epic" className="mb-2 block text-sm font-medium text-slate-700">
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
                  <p className="mt-2 text-sm text-slate-500">
                    Use the voter ID from the allowlisted record for this election.
                  </p>
                </div>

                <button type="submit" disabled={!voterId.trim() || loading} className="btn-primary w-full">
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="spinner h-4 w-4" />
                      Verifying voter record...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Phone className="h-4 w-4" />
                      Continue to OTP
                    </div>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {otpVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="card-premium mx-auto w-full max-w-sm p-6">
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                <Phone className="h-6 w-6 text-slate-700" />
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">OTP verification</h3>
                <p className="mb-2 text-sm text-slate-600">
                  Enter the 6-digit OTP sent to your registered mobile number.
                </p>
                <div className="rounded-lg bg-slate-50 p-2 text-xs text-slate-500">
                  <strong>Sandbox code:</strong> Use <code className="rounded bg-slate-200 px-1">{SANDBOX_OTP}</code> in this verification flow.
                </div>
              </div>

              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    ref={(element) => {
                      otpInputRefs.current[index] = element;
                    }}
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    className="h-12 w-12 rounded-lg border border-slate-300 text-center text-lg font-mono outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-500"
                  />
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setOtpVisible(false);
                    setStep(0);
                    resetOtp();
                  }}
                  className="btn-secondary flex-1"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleOtpSubmit}
                  disabled={otp.some((digit) => !digit)}
                  className="btn-primary flex-1"
                >
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Verify OTP
                  </div>
                </button>
              </div>

              <p className="text-sm text-slate-600">
                Need a fresh code?{' '}
                <button
                  type="button"
                  className="font-medium text-slate-700 underline hover:text-slate-900"
                  onClick={() => setToast({ type: 'success', message: 'Verification code resent. Use the same sandbox code.' })}
                >
                  Resend
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {faceVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="card-premium mx-auto w-full max-w-md p-6">
            <div className="space-y-4 text-center">
              <div className="mb-4 flex items-center justify-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <Camera className="h-5 w-5 text-slate-700" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Face verification</h3>
              </div>

              <div className="overflow-hidden rounded-xl bg-slate-900">
                <FaceRecognition onVerified={handleFaceVerified} />
              </div>

              <p className="flex items-center justify-center gap-2 text-sm text-slate-600">
                <Eye className="h-4 w-4" />
                Align your face within the frame and hold steady for a moment.
              </p>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed right-4 top-4 z-50">
          <div
            className={`card-premium min-w-80 p-4 ${
              toast.type === 'success' ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
            }`}
            role={toast.type === 'success' ? 'status' : 'alert'}
            aria-live={toast.type === 'success' ? 'polite' : 'assertive'}
          >
            <div className="flex items-start gap-3">
              {toast.type === 'success' ? (
                <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
              )}
              <div className="flex-1">
                <p className={`text-sm font-medium ${toast.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                  {toast.type === 'success' ? 'Success' : 'Error'}
                </p>
                <p className={`text-sm ${toast.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                  {toast.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setToast(null)}
                className={toast.type === 'success' ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700'}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default KycPage;
