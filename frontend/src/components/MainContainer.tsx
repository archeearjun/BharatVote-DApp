import React from 'react';

interface MainContainerProps {
  children: React.ReactNode;
  className?: string;
  paddingYClassName?: string;
}

/**
 * Main container component with proper max-width and spacing for premium design
 */
const MainContainer: React.FC<MainContainerProps> = ({
  children,
  className = '',
  paddingYClassName = 'py-8',
}) => (
  <div
    className={`w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ${paddingYClassName} space-y-8 ${className}`}
  >
    {children}
  </div>
);

export default MainContainer; 
