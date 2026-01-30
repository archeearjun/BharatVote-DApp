import React from 'react';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  loadingText?: string;
}

/**
 * Reusable primary button with consistent styling and states
 */
const PrimaryButton: React.FC<PrimaryButtonProps> = ({ 
  children, 
  variant = 'primary', 
  loading = false, 
  loadingText = 'Loading...',
  disabled,
  className = '',
  ...props 
}) => {
  const baseClasses = "w-full";
  
  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary"
  };

  return (
    <button
      className={`${variantClasses[variant]} ${baseClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2 opacity-60"></div>
          {loadingText}
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default PrimaryButton; 
