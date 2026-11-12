import React from 'react';

const ValueCard = ({ icon, title, description }) => (
    <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
    }}>
        <div style={{
            width: '40px',
            height: '40px',
            background: 'var(--primary)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.25rem',
            marginBottom: '1.5rem'
        }}>
            {icon}
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--background)' }}>
            {title}
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
            {description}
        </p>
    </div>
);

const ValuesSection = () => {
    return (
        <section className="section-padding" style={{ background: 'var(--secondary)' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <span style={{
                        background: 'rgba(14, 165, 233, 0.1)',
                        color: 'var(--primary)',
                        padding: '0.5rem 1rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        Our Values
                    </span>
                    <h2 style={{
                        fontSize: '3rem',
                        fontWeight: '800',
                        color: 'var(--background)',
                        marginTop: '1rem'
                    }}>
                        What we Treasure
                    </h2>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem'
                }}>
                    <ValueCard
                        icon="👑"
                        title="Godliness"
                        description="We aim at building and sustaining upon the value of godliness."
                    />
                    <ValueCard
                        icon="📖"
                        title="Truth"
                        description="Truth for us is absolute, and we intend to live and grow by it."
                    />
                    <ValueCard
                        icon="♥"
                        title="Love and Grace"
                        description="As we have been loved and shown mercy, we intend to live by and in love and grace."
                    />
                </div>
            </div>
        </section>
    );
};

export default ValuesSection;
