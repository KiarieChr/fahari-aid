import React from 'react';

const ImpactStat = ({ icon, number, label }) => (
    <div style={{ textAlign: 'center' }}>
        <div style={{
            width: '60px',
            height: '60px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
            fontSize: '1.75rem',
            margin: '0 auto 1.5rem'
        }}>
            {icon}
        </div>
        <div style={{ fontSize: '3rem', fontWeight: '800', color: 'white', lineHeight: 1 }}>
            {number}
        </div>
        <div style={{ color: '#94a3b8', marginTop: '0.5rem' }}>
            {label}
        </div>
    </div>
);

const ImpactSection = () => {
    return (
        <section className="section-padding" style={{ background: 'var(--background)' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                    <span style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'var(--primary)',
                        padding: '0.5rem 1rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        Our Impact
                    </span>
                    <h2 style={{
                        fontSize: '2.5rem',
                        fontWeight: '800',
                        color: 'white',
                        marginTop: '1rem'
                    }}>
                        Kingdom Impact by the Numbers
                    </h2>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '3rem'
                }}>
                    <ImpactStat icon="👥" number="250+" label="Members Registered" />
                    <ImpactStat icon="🕒" number="1,200+" label="Hours of Teaching" />
                    <ImpactStat icon="🏢" number="12" label="Ministries" />
                    <ImpactStat icon="📚" number="500+" label="Resources" />
                </div>
            </div>
        </section>
    );
};

export default ImpactSection;
