import React from 'react';

const PropheticHeader = () => {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
            <div>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-color)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Hello there! Welcome Back, Timothy <span style={{ fontSize: '1.5rem' }}>👋</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>The word .!</p>
            </div>

            <div style={{
                background: 'var(--surface-1)',
                padding: '1.5rem 2rem',
                borderRadius: '1rem',
                border: '1px solid var(--border-color)',
                minWidth: '250px'
            }}>
                <h3 style={{ color: 'var(--primary)', fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Fulfilled Prophecies</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Check your name</p>
            </div>
        </div>
    );
};

export default PropheticHeader;
