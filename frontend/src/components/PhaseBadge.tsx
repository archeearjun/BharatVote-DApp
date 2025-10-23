import React from 'react';

interface PhaseBadgeProps {
  phase: 'commit' | 'reveal' | 'finished';
}

/**
 * Phase badge component showing current election phase
 */
const PhaseBadge: React.FC<PhaseBadgeProps> = ({ phase }) => {
  const getBadgeStyle = () => {
    switch (phase) {
      case 'commit':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'reveal':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'finished':
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getLabel = () => {
    switch (phase) {
      case 'commit':
        return '☐ Commit Phase';
      case 'reveal':
        return '⏳ Reveal Phase';
      case 'finished':
        return '☑ Finished';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeStyle()}`}>
      {getLabel()}
    </span>
  );
};

export default PhaseBadge; 