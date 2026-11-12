import React, { useState } from 'react';

const StrategicPlan = () => {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const pillars = [
        {
            num: '01',
            title: 'Spiritual Growth',
            badgeColor: '#22c1e6', // Cyan
            textColor: '#0c5c70',
            bgColor: 'rgba(34, 193, 230, 0.08)',
            body: 'The foundation of everything we do. We are committed to deepening the spiritual roots of every member through discipleship, Biblical teaching, mentorship, and a culture of prayer and accountability — because lasting Kingdom influence can only flow from a transformed life. Growth in every other pillar begins here.',
            microCopy: 'Rooted in the Word. Grounded in community.'
        },
        {
            num: '02',
            title: 'Cell Fellowship Expansion',
            badgeColor: '#d97706', // Gold
            textColor: '#78350f',
            bgColor: 'rgba(217, 119, 6, 0.08)',
            body: 'Transformation scales through relationship, not just programs. We are expanding our network of cells — small, intentional groups of 5 to 15 members — into homes, institutions, workplaces, and neighborhoods across Kenya and beyond. Every new cell is a new centre of Kingdom influence planted in a community.',
            microCopy: 'Every cell is a Kingdom outpost.'
        },
        {
            num: '03',
            title: 'Global Missions',
            badgeColor: '#0ec2e6', // Lighter Cyan
            textColor: '#0891b2',
            bgColor: 'rgba(14, 194, 230, 0.08)',
            body: 'Our mandate does not stop at borders. We are establishing international chapters aligned with our Constitution, raising Kingdom leaders in every nation who carry the same Biblical values, governance standards, and transformational purpose. The Great Commission is our global strategy.',
            microCopy: 'One mandate. Every nation.'
        },
        {
            num: '04',
            title: 'Digital Evangelism',
            badgeColor: '#eab308', // Lighter Gold
            textColor: '#a16207',
            bgColor: 'rgba(234, 179, 8, 0.08)',
            body: "The media mountain is one of the most contested — and most strategic — spheres of our generation. We are building a credible, excellent digital presence that extends the reach of JEN's message, equips members with Kingdom-aligned content, and positions the Network as a trusted voice in the digital public square.",
            microCopy: 'Claiming the digital mountain for the Kingdom.'
        }
    ];

    return (
        <section style={{ padding: '6rem 1rem 7rem', background: 'var(--secondary)', position: 'relative' }}>
            <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <span style={{
                        background: 'rgba(34, 193, 230, 0.1)',
                        color: '#22c1e6',
                        padding: '0.5rem 1rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        display: 'inline-block',
                        marginBottom: '1rem'
                    }}>
                        OUR ROADMAP
                    </span>
                    <h2 style={{
                        fontSize: '3rem',
                        fontWeight: '800',
                        color: '#120D20',
                        margin: '0',
                        letterSpacing: '-0.02em'
                    }}>
                        Strategic Plan
                    </h2>
                </div>

                <div className="roadmap-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1.2fr',
                    gap: '4.5rem',
                    alignItems: 'start'
                }}>
                    {/* Left Column: Summary */}
                    <div style={{ position: 'sticky', top: '100px' }}>
                        <p style={{
                            fontSize: '1.125rem',
                            color: '#475569',
                            lineHeight: 1.7,
                            marginBottom: '1.5rem',
                            fontWeight: '500'
                        }}>
                            Jesus Enthroned Network is not built on programs alone — it is built on a clear, Kingdom-directed roadmap. Our strategic plan charts the path from individual transformation to global influence, ensuring that every cell, chapter, and initiative moves in the same direction: raising a generation that enthrones Christ in every sphere.
                        </p>
                        <p style={{
                            fontSize: '1.05rem',
                            color: '#64748b',
                            lineHeight: 1.7,
                            marginBottom: '2.5rem'
                        }}>
                            This is not a five-year plan shaped by trends. It is a Spirit-led mandate grounded in Scripture, accountable governance, and the unwavering conviction that Kingdom purpose is always greater than personal ambition.
                        </p>

                        <button style={{
                            padding: '1rem 2rem',
                            background: 'linear-gradient(135deg, #120D20 0%, #22c1e6 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: '800',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            boxShadow: '0 8px 20px rgba(34, 193, 230, 0.15)',
                            transition: 'all 0.25s ease'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 12px 24px rgba(34, 193, 230, 0.25)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(34, 193, 230, 0.15)';
                        }}
                        >
                            Explore Strategic Growth
                        </button>
                    </div>

                    {/* Right Column: Timeline Cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {pillars.map((pillar, idx) => (
                            <div 
                                key={idx}
                                onMouseEnter={() => setHoveredIndex(idx)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                style={{
                                    background: 'white',
                                    padding: '2rem',
                                    borderRadius: '20px',
                                    boxShadow: hoveredIndex === idx ? '0 15px 30px rgba(0, 0, 0, 0.05)' : '0 5px 15px rgba(0, 0, 0, 0.01)',
                                    border: hoveredIndex === idx ? '1px solid rgba(34, 193, 230, 0.15)' : '1px solid rgba(0, 0, 0, 0.02)',
                                    transform: hoveredIndex === idx ? 'translateX(8px)' : 'translateX(0)',
                                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                    display: 'flex',
                                    gap: '1.5rem',
                                    alignItems: 'start'
                                }}
                            >
                                {/* Pillar Badge */}
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '12px',
                                    backgroundColor: pillar.bgColor,
                                    color: pillar.badgeColor,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.25rem',
                                    fontWeight: '800',
                                    flexShrink: 0
                                }}>
                                    {pillar.num}
                                </div>

                                <div>
                                    <h3 style={{
                                        fontSize: '1.35rem',
                                        fontWeight: '800',
                                        color: '#120D20',
                                        marginBottom: '0.75rem',
                                        letterSpacing: '-0.01em'
                                    }}>
                                        {pillar.title}
                                    </h3>
                                    <p style={{
                                        color: '#475569',
                                        fontSize: '0.975rem',
                                        lineHeight: 1.6,
                                        margin: 0
                                    }}>
                                        {pillar.body}
                                    </p>

                                    {/* Hover micro-copy animation */}
                                    <div style={{
                                        maxHeight: hoveredIndex === idx ? '60px' : '0px',
                                        opacity: hoveredIndex === idx ? 1 : 0,
                                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                        overflow: 'hidden',
                                        marginTop: hoveredIndex === idx ? '0.75rem' : '0px',
                                        color: '#22c1e6',
                                        fontSize: '0.875rem',
                                        fontWeight: '700',
                                        fontStyle: 'italic'
                                    }}>
                                        ✨ {pillar.microCopy}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Note */}
                <div style={{ 
                    marginTop: '5rem', 
                    paddingTop: '2rem', 
                    borderTop: '1px solid rgba(0, 0, 0, 0.05)',
                    textAlign: 'center',
                    maxWidth: '800px',
                    margin: '5rem auto 0'
                }}>
                    <p style={{
                        fontSize: '0.8rem',
                        color: '#94a3b8',
                        lineHeight: 1.5,
                        margin: 0
                    }}>
                        Our strategic pillars are reviewed annually by the Board of Directors in line with Article IX of the JEN Constitution, ensuring accountability, transparency, and alignment with our founding mission at every stage of growth.
                    </p>
                </div>
            </div>

            <style>{`
                @media (max-width: 968px) {
                    .roadmap-grid {
                        grid-template-columns: 1fr !important;
                        gap: 3.5rem !important;
                    }
                    div[style*="position: sticky"] {
                        position: static !important;
                    }
                }
            `}</style>
        </section>
    );
};

export default StrategicPlan;
