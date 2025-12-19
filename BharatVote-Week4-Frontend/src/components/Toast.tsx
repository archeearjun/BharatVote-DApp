import React, { useEffect, useState } from 'react';

interface ToastProps {
  type: 'success' | 'error';
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

/**
 * Toast notification component
 */
const Toast: React.FC<ToastProps> = ({ type, message, isVisible, onClose }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300); // Wait for animation
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible && !show) return null;

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const icon = type === 'success' ? '✓' : '✕';

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-transform duration-300 ${show ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 max-w-sm`}>
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-medium">{message}</span>
        <button onClick={() => setShow(false)} className="ml-2 text-white hover:text-gray-200">
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;

