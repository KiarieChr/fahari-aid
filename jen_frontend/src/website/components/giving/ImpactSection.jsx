import React from 'react';

const StatItem = ({ number, label }) => (
    <div style={{ textAlign: 'center' }}>
        <div style={{
            fontSize: '3rem',
            fontWeight: '800',
            color: '#22c1e6',
            marginBottom: '0.5rem',
            lineHeight: 1
        }}>
            {number}
        </div>
        <div style={{
            fontSize: '0.9rem',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: '600'
        }}>
            {label}
        </div>
    </div>
);

const ImpactSection = () => {
    return (
        <section style={{ padding: '5rem 0', background: '#eff3c1', textAlign: 'center' }}>
            <div className="container">
                <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#120D20', marginBottom: '3rem' }}>
                    Your Impact
                </h2>

                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '4rem',
                    flexWrap: 'wrap',
                    marginBottom: '3rem'
                }}>
                    <StatItem number="15+" label="Countries Reached" />
                    <StatItem number="50K+" label="Lives Impacted" />
                    <StatItem number="100+" label="Missionaries Supported" />
                </div>

                <p style={{
                    maxWidth: '700px',
                    margin: '0 auto',
                    color: '#64748b',
                    lineHeight: 1.6,
                    fontSize: '1.05rem'
                }}>
                    Every contribution—no matter the size—helps us continue our mission of spreading the Gospel, training leaders, and serving communities in need.
                </p>
            </div>
        </section>
    );
};

export default ImpactSection;
