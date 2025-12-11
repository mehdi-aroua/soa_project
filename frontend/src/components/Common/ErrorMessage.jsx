import React from 'react';

const ErrorMessage = ({ message, onClose }) => {
    if (!message) return null;

    return (
        <div className="alert alert-error" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{message}</span>
                {onClose && (
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'inherit',
                            cursor: 'pointer',
                            fontSize: '1.5rem',
                            padding: '0',
                            marginLeft: '1rem'
                        }}
                    >
                        ×
                    </button>
                )}
            </div>
        </div>
    );
};

export default ErrorMessage;
