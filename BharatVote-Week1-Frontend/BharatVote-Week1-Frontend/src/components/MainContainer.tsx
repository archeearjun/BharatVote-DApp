import React from 'react';

interface MainContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Main container component with proper max-width and spacing
 */
const MainContainer: React.FC<MainContainerProps> = ({ children, className = '' }) => (
  <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 ${className}`}>
    {children}
  </div>
);

export default MainContainer;

