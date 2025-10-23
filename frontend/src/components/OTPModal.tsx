import React, { useState, useEffect } from 'react';
import { useI18n } from '../i18n';

interface OTPModalProps {
  visible: boolean;
  maskedPhone: string;
  onClose: () => void;
  onSubmit: (otp: string) => void;
}

/**
 * Modal popup for entering OTP/Captcha
 */
const OTPModal: React.FC<OTPModalProps> = ({ visible, maskedPhone, onClose, onSubmit }) => {
  const { t } = useI18n();
  const [timer, setTimer] = useState(30);
  const [otp, setOtp] = useState('');

  useEffect(() => {
    if (!visible) return;
    setTimer(30);
    const interval = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('otp.enterOTP')}</h3>
        <p className="text-sm text-gray-600 mb-2">An OTP was sent to {maskedPhone}</p>
        <input
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#1f2d54] focus:border-[#1f2d54] mb-4"
          placeholder={t('otp.enterOTP')}
        />
        <div className="flex justify-between items-center mb-4">
          {timer > 0 ? (
            <span className="text-sm text-gray-500">Resend in {timer}s</span>
          ) : (
            <button
              className="text-sm text-[#1f2d54]"
              onClick={() => setTimer(30)}
            >
              {t('otp.resendOTP')}
            </button>
          )}
          <button
            className="text-sm text-gray-500"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
        <button
          className="w-full bg-[#1f2d54] text-white py-2 rounded-md"
          onClick={() => onSubmit(otp)}
        >
          {t('otp.verifyOTP')}
        </button>
      </div>
    </div>
  );
};

export default OTPModal; 