import React, { useState, useEffect } from 'react';

const EventsHero = () => {
    const [mounted, setMounted] = useState(false);
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        setMounted(true);

        const handleScroll = () => {
            setScrollY(window.scrollY);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <section className="events-hero-section">
            {/* Geometric background mesh with parallax offset */}
            <div 
                className="events-hero-bg-mask"
                style={{ transform: `translateY(${scrollY * 0.15}px)` }}
            ></div>
            
            <div className={`container events-hero-container ${mounted ? 'active' : ''}`}>
                <div className="events-hero-grid">
                    {/* Left Column: Text Content */}
                    <div className="events-hero-content-left">
                        <span className="events-hero-badge">
                            <span className="events-hero-badge-dot"></span>
                            Gatherings & Events
                        </span>
                        
                        <h1 className="events-hero-title">
                            Join the <br />
                            <span>Gathering</span>
                        </h1>
                        
                        <p className="events-hero-description">
                            Experience the presence of God with us. Register for our upcoming events, seminars, and corporate gatherings to align your calling with Kingdom purpose.
                        </p>
                        
                        {/* Small overlay UI indicator */}
                        <div className="events-hero-mini-badge">
                            <span className="mini-badge-icon">🔥</span>
                            <span>Prophetic Alignment & Fellowship</span>
                        </div>
                    </div>

                    {/* Right Column: Geometrically Masked Image with parallax offset */}
                    <div 
                        className="events-hero-visual-right"
                        style={{ transform: `translateY(${scrollY * 0.08}px)` }}
                    >
                        <div className="events-geometric-frame">
                            <img 
                                src="/DSC_0048.JPG" 
                                alt="Kingdom Gathering" 
                                className="events-hero-img"
                                style={{ transform: `scale(1.05) translateY(${scrollY * -0.04}px)` }}
                            />
                            {/* Zero opacity overlay as requested */}
                            <div className="events-hero-img-overlay" style={{ opacity: 0 }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .events-hero-section {
                    padding: 80px 0 50px;
                    background: linear-gradient(135deg, rgba(18, 13, 32, 0.65 ) 0%, rgba(13, 9, 26, 0.59) 100% );
                    color: #ffffff;
                    position: relative;
                    overflow: hidden;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                /* Left column background masking */
                .events-hero-bg-mask {
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(circle at 20% 30%, rgba(34, 193, 230, 0.08) 0%, transparent 60%),
                                radial-gradient(circle at 80% 80%, rgba(239, 243, 193, 0.04) 0%, transparent 60%);
                    clip-path: polygon(0 15%, 100% 0, 100% 85%, 0% 100%);
                    pointer-events: none;
                    z-index: 1;
                    will-change: transform;
                }

                .events-hero-container {
                    position: relative;
                    z-index: 2;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 4%;
                }

                .events-hero-grid {
                    display: grid;
                    grid-template-columns: 1.1fr 0.9fr;
                    gap: 64px;
                    align-items: center;
                }

                .events-hero-content-left {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                }

                /* Staggered load animation starting positions */
                .events-hero-badge {
                    background: rgba(34, 193, 230, 0.08);
                    border: 1px solid rgba(34, 193, 230, 0.2);
                    color: var(--primary, #22c1e6);
                    padding: 8px 18px;
                    border-radius: 9999px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 24px;
                    opacity: 0;
                    transform: translateY(15px);
                    transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s;
                }

                .events-hero-badge-dot {
                    width: 6px;
                    height: 6px;
                    background-color: var(--primary, #22c1e6);
                    border-radius: 50%;
                    box-shadow: 0 0 8px var(--primary, #22c1e6);
                }

                .events-hero-title {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(2.5rem, 5vw, 4.2rem);
                    font-weight: 900;
                    line-height: 1.1;
                    margin-bottom: 20px;
                    color: #ffffff;
                    opacity: 0;
                    transform: translateY(20px);
                    transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.25s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.25s;
                }

                .events-hero-title span {
                    background: linear-gradient(to right, var(--primary, #22c1e6), var(--secondary, #eff3c1));
                    background-clip: text;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .events-hero-description {
                    font-size: 16px;
                    color: var(--text-muted, #94a3b8);
                    line-height: 1.7;
                    margin-bottom: 32px;
                    max-width: 520px;
                    opacity: 0;
                    transform: translateY(20px);
                    transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s;
                }

                .events-hero-mini-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    padding: 10px 18px;
                    border-radius: 12px;
                    font-size: 13px;
                    color: #ffffff;
                    backdrop-filter: blur(8px);
                    opacity: 0;
                    transform: translateY(15px);
                    transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.55s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.55s;
                }

                .mini-badge-icon {
                    font-size: 15px;
                }

                /* Right Column: Geometric Clip-path Masking */
                .events-hero-visual-right {
                    display: flex;
                    justify-content: center;
                    position: relative;
                    will-change: transform;
                }

                .events-geometric-frame {
                    position: relative;
                    width: 100%;
                    max-width: 440px;
                    aspect-ratio: 1.1;
                    overflow: hidden;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
                    /* Dynamic Geometric CSS Masking as requested */
                    clip-path: polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%);
                    border-radius: 30px;
                    opacity: 0;
                    transform: scale(0.9) rotate(-3deg);
                    transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.3s, transform 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.3s;
                }

                .events-hero-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    will-change: transform;
                    transition: transform 0.1s ease;
                }

                .events-hero-img-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(34, 193, 230, 0.3) 0%, rgba(18, 13, 32, 0.8) 100%);
                    transition: opacity 0.3s ease;
                    pointer-events: none;
                }

                /* Active Trigger Classes */
                .events-hero-container.active .events-hero-badge,
                .events-hero-container.active .events-hero-title,
                .events-hero-container.active .events-hero-description,
                .events-hero-container.active .events-hero-mini-badge {
                    opacity: 1;
                    transform: translateY(0);
                }

                .events-hero-container.active .events-geometric-frame {
                    opacity: 1;
                    transform: scale(1) rotate(0deg);
                }

                @media (max-width: 992px) {
                    .events-hero-grid {
                        grid-template-columns: 1fr;
                        gap: 48px;
                        text-align: center;
                    }
                    .events-hero-content-left {
                        align-items: center;
                    }
                    .events-hero-badge, .events-hero-mini-badge {
                        align-self: center;
                    }
                    .events-geometric-frame {
                        aspect-ratio: 1.2;
                    }
                }
            `}</style>
        </section>
    );
};

export default EventsHero;
