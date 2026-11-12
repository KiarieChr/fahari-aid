import React from 'react';
import {
    Activity,
    BookOpen,
    Building2,
    Briefcase,
    Tv,
    Music
} from 'lucide-react';

const SpheresOfInfluence = () => {
    const spheres = [
        {
            title: 'Governance & Leadership',
            icon: <Building2 size={24} />,
            description: 'Equipping the next generation of political and civic leaders with integrity, wisdom, and Kingdom values.',
            color: '#15be56',
            tags: ['Civic Education', 'Policy', 'Public Service']
        },
        {
            title: 'Education & Career Empowerment',
            icon: <BookOpen size={24} />,
            description: 'Developing curricula and programs that integrate ethical values, critical thinking, and career readiness.',
            color: '#ee6c20',
            tags: ['Curriculum', 'Career Dev.', 'Scholarships']
        },
        {
            title: 'Media & Communication',
            icon: <Tv size={24} />,
            description: 'Promoting ethical media frameworks and raising communicators who reflect Kingdom truth and values.',
            color: '#6366f1',
            tags: ['Journalism', 'Digital Media', 'Publishing']
        },
        {
            title: 'Business & Economic Development',
            icon: <Briefcase size={24} />,
            description: 'Building economic structures anchored in moral accountability, sustainability, and community flourishing.',
            color: '#ef4444',
            tags: ['Entrepreneurship', 'Finance', 'Trade']
        },
        {
            title: 'Technology & Innovation',
            icon: <Activity size={24} />,
            description: 'Harnessing innovation for societal benefit, empowering the next generation of Kingdom technologists and inventors.',
            color: '#22c1e6',
            tags: ['Tech Hubs', 'AI & Data', 'Startups']
        },
        {
            title: 'Arts & Creative Expression',
            icon: <Music size={24} />,
            description: 'Supporting creative expressions that reflect truth, beauty, and redemptive Kingdom values across all art forms.',
            color: '#b08d2b',
            tags: ['Visual Arts', 'Music', 'Film & Theatre']
        }
    ];

    return (
        <section className="spheres-section-new">
            {/* Background Zoom Layer */}
            <div className="bg-zoom-container">
                <img
                    src="/DSC_0063.JPG"
                    alt="Background Accent"
                    className="bg-zoom-image"
                />
                <div className="bg-overlay"></div>
            </div>

            <div className="container spheres-container">
                {/* Header Section matching Mockup Structure */}
                <div className="arms-header" style={{ position: 'relative', zIndex: 4 }}>
                    <div className="eyebrow">Arms of Influence</div>
                    <h2 className="section-title">
                        Kingdom Initiatives That Drive<br /><em>Transformation Across Every Sector</em>
                    </h2>
                    <p>
                        From governance and business to media and education, our Arms of Influence embed Kingdom values into every sphere of society through targeted, expert-led programs.
                    </p>
                </div>

                {/* Staggered Animated Grid */}
                <div className="spheres-grid">
                    {spheres.map((sphere, index) => {
                        const hex = sphere.color;
                        const r = parseInt(hex.slice(1, 3), 16) || 34;
                        const g = parseInt(hex.slice(3, 5), 16) || 193;
                        const b = parseInt(hex.slice(5, 7), 16) || 230;

                        return (
                            <div
                                key={index}
                                className="sphere-card-new"
                                style={{
                                    borderTop: `4px solid ${sphere.color}`,
                                    animation: 'slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                                    animationDelay: `${index * 0.1}s`,
                                    opacity: 0,
                                    '--hover-glow': `0 16px 36px rgba(${r}, ${g}, ${b}, 0.15)`
                                }}
                            >
                                <div className="sphere-card-inner">
                                    {/* Icon Box with translucent coloring */}
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '0.75rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: sphere.color,
                                        background: `rgba(${r}, ${g}, ${b}, 0.1)`,
                                        border: `1px solid rgba(${r}, ${g}, ${b}, 0.2)`,
                                        marginBottom: '1.5rem',
                                        transition: 'transform 0.3s ease'
                                    }} className="card-icon-wrapper">
                                        {sphere.icon}
                                    </div>

                                    <h3 style={{
                                        fontSize: '1.25rem',
                                        fontWeight: '700',
                                        color: 'var(--background)',
                                        marginBottom: '0.5rem'
                                    }}>
                                        {sphere.title}
                                    </h3>

                                    <p style={{
                                        color: '#475569',
                                        fontSize: '0.875rem',
                                        lineHeight: '1.6',
                                        marginBottom: '1.5rem',
                                        flex: 1
                                    }}>
                                        {sphere.description}
                                    </p>

                                    {/* Styled Tags */}
                                    <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '0.5rem',
                                        marginTop: 'auto'
                                    }}>
                                        {sphere.tags.map((tag, tIndex) => (
                                            <span
                                                key={tIndex}
                                                style={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    color: sphere.color,
                                                    background: `rgba(${r}, ${g}, ${b}, 0.05)`,
                                                    border: `1px solid rgba(${r}, ${g}, ${b}, 0.12)`,
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '9999px'
                                                }}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <style>{`
                .arms-header {
                    text-align: center;
                    margin-bottom: 56px;
                    animation: slideDownFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                .arms-header p {
                    max-width: 680px;
                    font-size: 16px;
                    color: #475569;
                    margin: 16px auto 0;
                    line-height: 1.8;
                }

                .eyebrow {
                    font-size: 11px;
                    letter-spacing: 0.3em;
                    text-transform: uppercase;
                    color: var(--primary-hover);
                    font-weight: 600;
                    margin-bottom: 16px;
                    display: inline-flex;
                    align-items: center;
                    gap: 12px;
                }

                .eyebrow::after {
                    content: '';
                    width: 40px;
                    height: 1.5px;
                    background: var(--primary-hover);
                }

                .section-title {
                    font-family: 'Playfair Display', 'Inter', sans-serif;
                    font-size: clamp(1.7rem, 3vw, 2.6rem);
                    font-weight: 700;
                    color: #0f2340 !important;
                    line-height: 1.25;
                }

                .section-title em {
                    font-style: italic;
                    color: var(--primary-hover);
                    animation: pulseGlow 3s ease-in-out infinite;
                    display: inline-block;
                }

                @keyframes pulseGlow {
                    0%, 100% {
                        opacity: 1;
                        text-shadow: 0 0 0px transparent;
                    }
                    50% {
                        opacity: 0.9;
                        text-shadow: 0 0 8px rgba(34, 193, 230, 0.15);
                    }
                }

                .spheres-section-new {
                    padding: 96px 0;
                    position: relative;
                    overflow: hidden;
                    background: var(--secondary);
                }

                .bg-zoom-container {
                    position: absolute;
                    inset: 0;
                    z-index: 1;
                    overflow: hidden;
                }

                .bg-zoom-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 10s ease;
                    transform: scale(1);
                }

                .spheres-section-new:hover .bg-zoom-image {
                    transform: scale(1.06);
                }

                .bg-overlay {
                    position: absolute;
                    inset: 0;
                    z-index: 2;
                    background: linear-gradient(135deg, rgba(249, 247, 243, 0.95), rgba(245, 237, 214, 0.97));
                }

                .spheres-container {
                    position: relative;
                    z-index: 3;
                    width: 100%;
                    max-width: 1920px;
                    margin: 0 auto;
                    padding: 0 2%;
                }

                .spheres-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                    gap: 2rem;
                }

                .sphere-card-new {
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border-radius: 1rem;
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }

                .sphere-card-new:hover {
                    transform: translateY(-6px);
                    background: rgba(255, 255, 255, 0.98);
                    border-color: rgba(203, 213, 225, 1);
                    box-shadow: var(--hover-glow, 0 16px 24px rgba(0, 0, 0, 0.08));
                }

                .sphere-card-new:hover .card-icon-wrapper {
                    transform: scale(1.08) rotate(3deg);
                }

                .sphere-card-inner {
                    padding: 2rem;
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }

                @keyframes slideUpFade {
                    from {
                        opacity: 0;
                        transform: translateY(24px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @media (max-width: 768px) {
                    .spheres-section-new {
                        padding: 64px 0;
                    }
                    .spheres-grid {
                        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                        gap: 1.5rem;
                    }
                }
            `}</style>
        </section>
    );
};

export default SpheresOfInfluence;
