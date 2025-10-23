import React from 'react';
import ServiceTile, { ServiceTileProps } from './ServiceTile';

interface DashboardProps {
  services: ServiceTileProps[];
}

/**
 * Dashboard grid containing service tiles
 */
const ServiceDashboard: React.FC<DashboardProps> = ({ services }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
    {services.map((svc, idx) => (
      <ServiceTile key={idx} icon={svc.icon} label={svc.label} onClick={svc.onClick} />
    ))}
  </div>
);

export default ServiceDashboard; 