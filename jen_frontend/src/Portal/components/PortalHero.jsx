import React from 'react';

const PortalHero = () => {
    return (
        <section style={{
            background: 'var(--bg-color)',
            padding: '10rem 0 6rem',
            textAlign: 'center',
            color: 'var(--text-color)'
        }}>
            <div className="container">
                <span style={{
                    background: 'rgba(34, 193, 230, 0.1)',
                    color: 'var(--primary)',
                    padding: '0.5rem 1rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    display: 'inline-block',
                    marginBottom: '1.5rem'
                }}>
                    Member Portal
                </span>
                <h1 style={{
                    fontSize: '4rem',
                    fontWeight: '800',
                    marginBottom: '1.5rem',
                    lineHeight: 1.1
                }}>
                    Welcome Back
                </h1>
                <p style={{
                    fontSize: '1.125rem',
                    color: 'var(--text-muted)',
                    maxWidth: '600px',
                    margin: '0 auto',
                    lineHeight: 1.6
                }}>
                    Access your personal dashboard, sermons, event registrations, and giving history.
                </p>
            </div>
        </section>
    );
};

export default PortalHero;
