import React from 'react';

const PartnershipTierWidget = () => {
    return (
        <div style={{
            background: 'linear-gradient(135deg, #1A1625 0%, #2e2640 100%)',
            borderRadius: '1rem',
            padding: '2rem',
            border: '1px solid var(--border-color)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            height: '100%'
        }}>
            {/* Background decoration */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(34, 193, 230, 0.1) 0%, transparent 60%)',
                pointerEvents: 'none'
            }}></div>

            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', zIndex: 1 }}>
                My Partnership Tier
            </h3>

            <div style={{ zIndex: 1, marginBottom: '1rem' }}>
                <div style={{
                    fontSize: '3rem',
                    fontWeight: '800',
                    background: 'linear-gradient(to right, #FDE68A, #D97706)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 20px rgba(217, 119, 6, 0.3)'
                }}>
                    GOLD
                </div>
                <div style={{ color: 'var(--text-color)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    Partner Since 2024
                </div>
            </div>

            <div style={{ zIndex: 1, width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    <span>Next Tier: Platinum</span>
                    <span>85%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '85%', height: '100%', background: 'linear-gradient(to right, #FDE68A, #D97706)', borderRadius: '4px' }}></div>
                </div>
            </div>
        </div>
    );
};

export default PartnershipTierWidget;
