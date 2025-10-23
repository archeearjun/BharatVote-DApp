import React, { useState } from 'react';
import { useI18n } from '../i18n';

interface KYCFormProps {
  onSubmit: (voterId: string) => void;
}

/**
 * Tabbed form card for KYC steps
 */
const KYCForm: React.FC<KYCFormProps> = ({ onSubmit }) => {
  const { t } = useI18n();
  const [active, setActive] = useState(0);
  const [voterId, setVoterId] = useState('');

  const tabs = [t('kyc.voterIdKYC'), t('kyc.addressUpdate')];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex border-b mb-4">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActive(idx)}
            className={`px-4 py-2 -mb-px font-medium focus:outline-none \
              ${active === idx
                ? 'border-b-2 border-[#1f2d54] text-[#1f2d54]'
                : 'text-gray-600 hover:text-[#1f2d54]'}`}
          >
            {tab}
          </button>
        ))}
      </div>
      {active === 0 && (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(voterId);
          }}
        >
          <div>
            <label htmlFor="epic" className="block text-sm font-medium text-gray-700">
              {t('kyc.epicNumber')}
            </label>
            <input
              id="epic"
              type="text"
              maxLength={12}
              value={voterId}
              onChange={(e) => setVoterId(e.target.value)}
              placeholder={t('kyc.epicPlaceholder')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#1f2d54] focus:border-[#1f2d54]"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#1f2d54] text-white py-2 rounded-md"
            disabled={!voterId}
          >
            {t('kyc.sendOTP')}
          </button>
        </form>
      )}
      {active === 1 && (
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('kyc.currentAddress')}</label>
            <input
              type="text"
              placeholder={t('kyc.addressPlaceholder')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#1f2d54] focus:border-[#1f2d54]"
            />
          </div>
          {/* Add address update fields here */}
        </form>
      )}
    </div>
  );
};

export default KYCForm; 