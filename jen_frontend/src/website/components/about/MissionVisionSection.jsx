import React from 'react';

const MissionVisionSection = () => {
    return (
        <section className="section-padding" style={{ background: 'var(--secondary)' }}>
            <div className="container">
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '2rem'
                }}>
                    {/* Mission Card */}
                    <div style={{
                        background: 'white',
                        padding: '3rem',
                        borderRadius: '1.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                    }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            background: 'var(--primary)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '1.5rem',
                            marginBottom: '1.5rem'
                        }}>
                            🎯
                        </div>
                        <h3 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--background)' }}>
                            Our Mission
                        </h3>
                        <p style={{ color: '#64748b', lineHeight: 1.7 }}>
                            To equip believers with Kingdom understanding, foster unity among the body of Christ, and empower every individual to discover and fulfill their God-given purpose. Through teaching, fellowship, and outreach, we are building a community that reflects the heart of God to the world.
                        </p>
                    </div>

                    {/* Vision Card */}
                    <div style={{
                        background: 'var(--surface)',
                        padding: '3rem',
                        borderRadius: '1.5rem',
                        color: 'white'
                    }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            background: 'var(--primary)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '1.5rem',
                            marginBottom: '1.5rem'
                        }}>
                            👁️
                        </div>
                        <h3 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem' }}>
                            Our Vision
                        </h3>
                        <p style={{ color: '#94a3b8', lineHeight: 1.7 }}>
                            To see a global movement of believers walking in the fullness of their identity in Christ, advancing the Kingdom in every sphere of society. We envision churches, businesses, families, and nations transformed by the power of the Gospel.
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    div[style*="grid-template-columns"] {
                        grid-template-columns: 1fr !important;
                    }
                    div[style*="padding: 3rem"] {
                        padding: 2rem 1.5rem !important;
                    }
                    h3 {
                        fontSize: 1.75rem !important;
                    }
                }
            `}</style>
        </section>
    );
};

export default MissionVisionSection;
