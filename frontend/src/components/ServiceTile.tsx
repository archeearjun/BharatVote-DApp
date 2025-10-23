import React from 'react';

export interface ServiceTileProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

/**
 * Individual tile for service dashboard (e.g. Apply Online, Search Roll)
 */
const ServiceTile: React.FC<ServiceTileProps> = ({ icon, label, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white shadow hover:shadow-lg rounded-lg p-6 flex flex-col items-center cursor-pointer transition"
  >
    <div className="text-3xl text-[#1f2d54]">{icon}</div>
    <div className="mt-4 text-center text-sm font-medium">{label}</div>
  </div>
);

export default ServiceTile; 