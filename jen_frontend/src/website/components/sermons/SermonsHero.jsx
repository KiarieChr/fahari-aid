import React, { useState, useEffect } from 'react';

const SermonsHero = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const featuredSermons = [
        {
            id: 1,
            type: 'video',
            title: 'Walking in Kingdom Authority',
            pastor: 'Pastor James Mwangi',
            date: 'Dec 29, 2025',
            duration: '45 min',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop'
        },
        {
            id: 2,
            type: 'video',
            title: 'The Power of Unity in Christ',
            pastor: 'Pastor Grace Wanjiku',
            date: 'Dec 22, 2025',
            duration: '38 min',
            image: 'https://images.unsplash.com/photo-1601142634808-38923eb7c560?q=80&w=1000&auto=format&fit=crop'
        },
        {
            id: 3,
            type: 'audio',
            title: 'Discovering Your Purpose',
            pastor: 'Pastor James Mwangi',
            date: 'Dec 15, 2025',
            duration: '52 min',
            image: 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?q=80&w=1000&auto=format&fit=crop'
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % featuredSermons.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [featuredSermons.length]);

    const nextSlide = () => {
        setCurrentSlide(prev => (prev + 1) % featuredSermons.length);
    };

    const prevSlide = () => {
        setCurrentSlide(prev => (prev - 1 + featuredSermons.length) % featuredSermons.length);
    };

    return (
        <section style={{
            background: 'linear-gradient(180deg, #120D20 0%, #0d091a 100%)',
            paddingTop: '8px',
            position: 'relative',
            color: 'white',
            overflow: 'hidden'
        }}>
            {/* Geometric Masked Background Glow */}
            <div style={{
                position: 'absolute',
                right: 0,
                bottom: 0,
                width: '50%',
                height: '100%',
                background: 'linear-gradient(135deg, rgba(34, 193, 230, 0.08) 0%, transparent 100%)',
                clipPath: 'polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%)',
                zIndex: 0,
                pointerEvents: 'none'
            }}></div>

            <div style={{
                position: 'absolute',
                top: '-30%',
                left: '-10%',
                width: '60%',
                height: '160%',
                background: 'radial-gradient(circle, rgba(34, 193, 230, 0.06) 0%, transparent 70%)',
                zIndex: 0,
                pointerEvents: 'none'
            }}></div>

            <div className="container" style={{ padding: '4.5rem 1rem 5.5rem', position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto' }}>
                <div className="sermons-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 0.8fr',
                    gap: '4rem',
                    alignItems: 'center'
                }}>
                    {/* Left Column: Title and Description */}
                    <div style={{ textAlign: 'left' }}>
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
                            marginBottom: '1.5rem'
                        }}>
                            Sermons & Media
                        </span>
                        
                        <h1 style={{
                            fontSize: '3.75rem',
                            fontWeight: '800',
                            marginBottom: '1.5rem',
                            lineHeight: 1.1,
                            letterSpacing: '-0.02em'
                        }}>
                            Feed Your Spirit
                        </h1>
                        
                        <p style={{
                            fontSize: '1.125rem',
                            color: '#94a3b8',
                            lineHeight: 1.6,
                            marginBottom: '2rem',
                            maxWidth: '520px'
                        }}>
                            Watch or listen to powerful teachings that will transform your life and deepen your walk with God. Explore our collection of message series.
                        </p>
                    </div>

                    {/* Right Column: Carousel */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                        <div style={{
                            width: '100%',
                            maxWidth: '360px',
                            height: '380px',
                            position: 'relative',
                            perspective: '1000px'
                        }}>
                            {featuredSermons.map((sermon, index) => {
                                const isActive = index === currentSlide;
                                return (
                                    <div
                                        key={sermon.id}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            background: '#1A1625',
                                            borderRadius: '24px',
                                            border: '1px solid rgba(255, 255, 255, 0.05)',
                                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                                            overflow: 'hidden',
                                            opacity: isActive ? 1 : 0,
                                            transform: isActive ? 'scale(1) rotateY(0deg)' : 'scale(0.9) rotateY(10deg) translateX(20px)',
                                            pointerEvents: isActive ? 'auto' : 'none',
                                            transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                                            display: 'flex',
                                            flexDirection: 'column'
                                        }}
                                    >
                                        {/* Cover Image */}
                                        <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                                            <img
                                                src={sermon.image}
                                                alt={sermon.title}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                            {/* Media Type Badge */}
                                            <span style={{
                                                position: 'absolute',
                                                top: '1rem',
                                                left: '1rem',
                                                background: 'rgba(0, 0, 0, 0.75)',
                                                color: 'white',
                                                padding: '0.3rem 0.75rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.4rem'
                                            }}>
                                                {sermon.type === 'video' ? '📹 Video' : '🎧 Audio'}
                                            </span>
                                            
                                            {/* Duration Badge */}
                                            <span style={{
                                                position: 'absolute',
                                                bottom: '1rem',
                                                right: '1rem',
                                                background: 'rgba(34, 193, 230, 0.85)',
                                                color: 'white',
                                                padding: '0.2rem 0.6rem',
                                                borderRadius: '6px',
                                                fontSize: '0.7rem',
                                                fontWeight: '700'
                                            }}>
                                                {sermon.duration}
                                            </span>
                                        </div>

                                        {/* Content info */}
                                        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                                            <div>
                                                <h3 style={{
                                                    fontSize: '1.25rem',
                                                    fontWeight: '800',
                                                    color: 'white',
                                                    marginBottom: '0.5rem',
                                                    lineHeight: 1.3
                                                }}>
                                                    {sermon.title}
                                                </h3>
                                                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                                                    ✍️ {sermon.pastor}
                                                </p>
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>📅 {sermon.date}</span>
                                                <button style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#22c1e6',
                                                    fontWeight: '700',
                                                    fontSize: '0.85rem',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem',
                                                    padding: 0
                                                }}>
                                                    Play Now <span style={{ fontSize: '1rem' }}>▶</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Navigation Arrows */}
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <button 
                                onClick={prevSlide}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1rem',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(34, 193, 230, 0.2)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                            >
                                ◀
                            </button>
                            <button 
                                onClick={nextSlide}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1rem',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(34, 193, 230, 0.2)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                            >
                                ▶
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cyan Banner */}
            <div className="live-banner" style={{
                background: '#22c1e6',
                padding: '1.25rem 0',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 10
            }}>
                <div className="container live-banner-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '1100px', margin: '0 auto', padding: '0 1rem' }}>
                    <div className="live-banner-text" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '700' }}>
                        <div style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%', opacity: 0.8, animation: 'pulse 1.5s infinite' }}></div>
                        Watch our services live every Sunday at 10:00 AM EAT
                    </div>
                    <a className="live-banner-btn" href="https://www.youtube.com/@JesusEnthronedNetwork" target="_blank" rel="noopener noreferrer" style={{
                        border: '1px solid white',
                        padding: '0.5rem 1.5rem',
                        borderRadius: '9999px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s',
                        textDecoration: 'none',
                        color: 'white'
                    }}>
                        Join Live Stream
                    </a>
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.3; transform: scale(0.9); }
                    50% { opacity: 1; transform: scale(1.1); }
                }
                @media (max-width: 968px) {
                    .sermons-grid {
                        grid-template-columns: 1fr !important;
                        gap: 3rem !important;
                        text-align: center !important;
                    }
                    .sermons-grid div {
                        text-align: center !important;
                        margin: 0 auto;
                    }
                    h1 {
                        font-size: 2.5rem !important;
                    }
                    .live-banner {
                        padding: 1rem 0 !important;
                    }
                    .live-banner-container {
                        flex-direction: column !important;
                        justify-content: center !important;
                        gap: 1rem !important;
                        text-align: center !important;
                    }
                    .live-banner-text {
                        font-size: 0.9rem !important;
                        line-height: 1.4 !important;
                        justify-content: center !important;
                    }
                    .live-banner-btn {
                        font-size: 0.85rem !important;
                        padding: 0.5rem 1.25rem !important;
                    }
                }
            `}</style>
        </section>
    );
};

export default SermonsHero;
