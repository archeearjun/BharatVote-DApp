import React from 'react';

interface BreadcrumbProps {
  items: string[];
}

/**
 * Breadcrumb strip to show navigation context: Home > Apply Online > Form 6
 */
const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => (
  <nav className="bg-gray-100 px-4 py-2 text-sm text-gray-600">
    {items.map((item, index) => (
      <span key={index} className="inline-flex items-center">
        <span>{item}</span>
        {index < items.length - 1 && <span className="mx-2">›</span>}
      </span>
    ))}
  </nav>
);

export default Breadcrumb; 