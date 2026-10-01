import React from 'react';
import { useAuth } from '../context/AuthContext';

export const Header = ({ title }) => {
  const { user } = useAuth();

  return (
    <header className="top-header">
      <h1 className="page-title">{title}</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.85rem', color: '#64748b' }}>
        <span>{user?.email}</span>
      </div>
    </header>
  );
};
