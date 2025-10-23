import React from 'react';

interface AlertProps {
  type: 'success' | 'error';
  message: string;
}

/**
 * Reusable alert banner: green for success, red for error
 */
const Alert: React.FC<AlertProps> = ({ type, message }) => (
  <div
    className={`border-l-4 p-4 mb-4 rounded-md text-sm \
      ${type === 'success' ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-red-600 bg-red-50 text-red-800'}`}
  >
    {message}
  </div>
);

export default Alert; 