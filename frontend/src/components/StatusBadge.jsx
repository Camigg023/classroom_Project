import React from 'react';

export const StatusBadge = ({ estado }) => {
  const normalized = (estado || '').toLowerCase().replace(/\s+/g, '-');
  return (
    <span className={`badge badge-${normalized}`}>
      {estado}
    </span>
  );
};
