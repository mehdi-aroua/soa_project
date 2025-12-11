import React from 'react';

const Loading = ({ message = 'Chargement...' }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem',
            gap: '1rem'
        }}>
            <div className="spinner"></div>
            <p style={{ color: 'var(--text-secondary)' }}>{message}</p>
        </div>
    );
};

export default Loading;
