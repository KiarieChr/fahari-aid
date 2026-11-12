import React from 'react';

const ContributionHistoryWidget = () => {
    const contributions = [
        { date: 'Feb 02, 2026', type: 'Tithe', amount: '5,000', method: 'M-Pesa' },
        { date: 'Jan 28, 2026', type: 'Building Fund', amount: '10,000', method: 'Bank Transfer' },
        { date: 'Jan 21, 2026', type: 'Offering', amount: '2,000', method: 'M-Pesa' },
        { date: 'Jan 14, 2026', type: 'Tithe', amount: '5,000', method: 'Card' },
    ];

    return (
        <div style={{
            background: 'var(--surface-1)',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid var(--border-color)',
            height: '100%'
        }}>
            <h3 style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>
                Latest Contributions
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {contributions.map((item, i) => (
                    <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '0.75rem',
                        borderLeft: i === 0 ? '3px solid #22c1e6' : '3px solid transparent'
                    }}>
                        <div>
                            <div style={{ color: 'var(--text-color)', fontWeight: '600', fontSize: '0.95rem' }}>{item.type}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{item.date} • {item.method}</div>
                        </div>
                        <div style={{ color: 'var(--text-color)', fontWeight: '700', fontSize: '1rem' }}>
                            KES {item.amount}
                        </div>
                    </div>
                ))}
            </div>

            <button style={{
                width: '100%',
                marginTop: '1.5rem',
                padding: '0.75rem',
                background: 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: '0.5rem',
                color: 'var(--primary)',
                fontWeight: '600',
                cursor: 'pointer'
            }}>
                View Full Statement
            </button>
        </div>
    );
};

export default ContributionHistoryWidget;
