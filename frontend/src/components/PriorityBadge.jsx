import React from 'react';

export const PriorityBadge = ({ prioridad }) => {
  const normalized = (prioridad || '').toLowerCase();
  return (
    <span className={`badge badge-prio-${normalized}`}>
      {prioridad}
    </span>
  );
};
