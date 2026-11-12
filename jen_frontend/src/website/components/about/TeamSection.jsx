import React from 'react';

const TeamMember = ({ image, name, role, secondaryRole }) => (
    <div style={{
        background: 'white',
        borderRadius: '1rem',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        textAlign: 'center'
    }}>
        <div style={{ height: '300px' }}>
            <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--background)', marginBottom: '0.25rem' }}>
                {name}
            </h3>
            <p style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '0.9rem' }}>
                {role}
            </p>
            {secondaryRole && (
                <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    {secondaryRole}
                </p>
            )}
        </div>
    </div>
);

const TeamSection = () => {
    const team = [
        {
            name: 'Benjamin Kimani',
            role: 'Director',
            image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=2000&auto=format&fit=crop'
        },
        {
            name: 'Paul Muteti',
            role: 'Deputy Director',
            image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=2000&auto=format&fit=crop'
        },
        {
            name: 'Naomi Mwihaki',
            role: 'Executive Secretary',
            image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=2000&auto=format&fit=crop'
        },
        {
            name: 'James Kiarie',
            role: 'Media Director',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2000&auto=format&fit=crop'
        }
    ];

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
                        Organogram
                    </span>
                    <h2 style={{
                        fontSize: '3rem',
                        fontWeight: '800',
                        color: 'var(--background)',
                        marginTop: '1rem'
                    }}>
                        Organisation Structure
                    </h2>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '2rem'
                }}>
                    {team.map((member, index) => (
                        <TeamMember key={index} {...member} />
                    ))}
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    h2 {
                        fontSize: 2.25rem !important;
                    }
                }
            `}</style>
        </section>
    );
};

export default TeamSection;
