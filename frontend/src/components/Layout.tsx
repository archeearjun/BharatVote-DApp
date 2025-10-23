import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Layout wrapper with proper container max-width and typography
 */
const Layout: React.FC<LayoutProps> = ({ children }) => (
  <div className="min-h-screen bg-gray-50 font-sans">
    <div className="max-w-screen-md mx-auto px-4">
      {children}
    </div>
  </div>
);

export default Layout; 