import React from 'react';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}

/**
 * Reusable primary button with consistent styling and states
 */
const PrimaryButton: React.FC<PrimaryButtonProps> = ({ 
  children, 
  variant = 'primary', 
  loading = false, 
  disabled,
  className = '',
  ...props 
}) => {
  const baseClasses = "w-full rounded-lg py-2.5 font-semibold tracking-tight transition-all disabled:cursor-not-allowed shadow-sm hover:shadow";
  
  const variantClasses = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-300 disabled:text-slate-500",
    secondary: "bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-300"
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2 opacity-60"></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default PrimaryButton;

