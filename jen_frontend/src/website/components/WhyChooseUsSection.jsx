import React, { useState, useEffect, useRef } from 'react';

const WhyChooseUsSection = () => {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    const pillars = [
        "Biblical Principles guiding every program and decision",
        "Deep, relational mentorship across all seven spheres of influence",
        "Holistic development of character as much as competence",
        "Transparent, accountable governance rooted in integrity",
        "Global reach — local, national, and international chapters",
        "Commitment to generational legacy, not just immediate results"
    ];

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.15 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    return (
        <section ref={sectionRef} className="why-section-new">
            {/* Glowing Gradient Divider at the top */}
            <div className="section-divider"></div>

            {/* Ambient Radial Lights */}
            <div className="why-glow-top"></div>
            <div className="why-glow-bottom"></div>

            <div className={`container why-container ${isVisible ? 'fade-in-up' : 'hidden-state'}`}>
                <div className="why-header">
                    <span className="why-eyebrow">Why Choose JEN</span>
                    <h2 className="why-title">
                        Kingdom Purpose. Proven Principles. <br />
                        <em>Lasting Transformation.</em>
                    </h2>
                    <p className="why-subtitle">
                        Our approach combines Kingdom grounding with real-world mentorship and community accountability to help individuals fulfill their divine purpose in every sphere of life.
                    </p>
                </div>

                <div className="why-grid">
                    {/* Visual Card */}
                    <div className="why-visual-card">
                        <div className="why-visual-content">
                            <div className="why-visual-icon-glow">
                                <svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg" className="why-center-svg">
                                    <path d="M36 8l5 15H58L46 33l4.5 14L36 39l-14.5 8L26 33 14 23h17L36 8z" fill="var(--primary)" />
                                </svg>
                            </div>
                            <span className="why-visual-tag">Est. 2025</span>
                        </div>
                    </div>

                    {/* Pillars List */}
                    <div className="why-pillars-wrapper">
                        <ul className="why-pillars-list">
                            {pillars.map((pillar, index) => (
                                <li 
                                    key={index} 
                                    className="why-pillar-item"
                                    style={{
                                        animationDelay: `${index * 0.1}s`
                                    }}
                                >
                                    <span className="why-check-circle">
                                        <svg viewBox="0 0 11 9" className="why-check-svg">
                                            <path d="M1 4.5L4 7.5L10 1.5" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                        </svg>
                                    </span>
                                    <span className="why-pillar-text">{pillar}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <style>{`
                .why-section-new {
                    padding: 96px 0;
                    background: linear-gradient(180deg, #120D20 0%, #150f28 100%);
                    position: relative;
                    overflow: hidden;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                /* Glowing Gradient Divider styling */
                .section-divider {
                    position: absolute;
                    top: 0;
                    left: 0;
                    height: 1px;
                    width: 100%;
                    background: linear-gradient(90deg, transparent 10%, rgba(34, 193, 230, 0.3) 50%, transparent 90%);
                    z-index: 10;
                }
                .section-divider::after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 300px;
                    height: 15px;
                    background: radial-gradient(circle, rgba(34, 193, 230, 0.15) 0%, transparent 80%);
                    filter: blur(4px);
                    pointer-events: none;
                }

                /* Animation Helpers */
                .hidden-state {
                    opacity: 0;
                    transform: translateY(30px);
                }
                .fade-in-up {
                    opacity: 1;
                    transform: translateY(0);
                    transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                }

                /* Background Ambient Lights */
                .why-glow-top {
                    position: absolute;
                    top: -10%;
                    right: 10%;
                    width: 400px;
                    height: 400px;
                    background: radial-gradient(circle, rgba(34, 193, 230, 0.08) 0%, transparent 70%);
                    pointer-events: none;
                    z-index: 1;
                }

                .why-glow-bottom {
                    position: absolute;
                    bottom: -10%;
                    left: 5%;
                    width: 350px;
                    height: 350px;
                    background: radial-gradient(circle, rgba(239, 243, 193, 0.05) 0%, transparent 70%);
                    pointer-events: none;
                    z-index: 1;
                }

                .why-container {
                    position: relative;
                    z-index: 2;
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 5%;
                }

                .why-header {
                    text-align: center;
                    margin-bottom: 64px;
                }

                .why-eyebrow {
                    font-size: 11px;
                    letter-spacing: 0.3em;
                    text-transform: uppercase;
                    color: var(--primary, #22c1e6);
                    font-weight: 600;
                    margin-bottom: 16px;
                    display: inline-flex;
                    align-items: center;
                    gap: 12px;
                    font-family: var(--font-sans), sans-serif;
                }

                .why-eyebrow::after {
                    content: '';
                    width: 40px;
                    height: 1.5px;
                    background: var(--primary, #22c1e6);
                }

                .why-title {
                    font-family: 'Playfair Display', var(--font-sans), sans-serif;
                    font-size: clamp(1.8rem, 3vw, 2.6rem);
                    font-weight: 700;
                    color: var(--text, #ffffff);
                    line-height: 1.25;
                    margin-bottom: 20px;
                }

                .why-title em {
                    font-style: italic;
                    color: var(--primary, #22c1e6);
                }

                .why-subtitle {
                    font-size: 16px;
                    color: var(--text-muted, #94a3b8);
                    max-width: 700px;
                    margin: 0 auto;
                    line-height: 1.75;
                }

                .why-grid {
                    display: grid;
                    grid-template-columns: 1fr 1.2fr;
                    gap: 64px;
                    align-items: center;
                }

                /* Visual Graphic Card */
                .why-visual-card {
                    background: linear-gradient(135deg, rgba(26, 22, 37, 0.4) 0%, rgba(20, 16, 30, 0.6) 100%);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: 24px;
                    aspect-ratio: 5/4;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
                }

                .why-visual-card::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(circle at 50% 50%, rgba(34, 193, 230, 0.1) 0%, transparent 60%);
                }

                .why-visual-content {
                    position: relative;
                    z-index: 2;
                    text-align: center;
                }

                .why-visual-icon-glow {
                    width: 140px;
                    height: 140px;
                    background: rgba(34, 193, 230, 0.05);
                    border: 1px solid rgba(34, 193, 230, 0.15);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                    box-shadow: 0 0 40px rgba(34, 193, 230, 0.1);
                    transition: all 0.5s ease;
                }

                .why-visual-card:hover .why-visual-icon-glow {
                    transform: scale(1.08) rotate(15deg);
                    background: rgba(34, 193, 230, 0.08);
                    border-color: rgba(34, 193, 230, 0.3);
                    box-shadow: 0 0 50px rgba(34, 193, 230, 0.2);
                }

                .why-center-svg {
                    width: 70px;
                    height: 70px;
                    filter: drop-shadow(0 0 12px rgba(34, 193, 230, 0.6));
                }

                .why-visual-tag {
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    color: var(--secondary, #eff3c1);
                    opacity: 0.8;
                }

                /* Pillars List */
                .why-pillars-wrapper {
                    display: flex;
                    flex-direction: column;
                }

                .why-pillars-list {
                    list-style: none;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .why-pillar-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 20px;
                    padding: 16px 24px;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.04);
                    border-radius: 16px;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .why-pillar-item:hover {
                    transform: translateX(8px);
                    background: rgba(255, 255, 255, 0.04);
                    border-color: rgba(34, 193, 230, 0.25);
                    box-shadow: 0 8px 24px rgba(34, 193, 230, 0.05);
                }

                .why-check-circle {
                    flex-shrink: 0;
                    width: 24px;
                    height: 24px;
                    background: rgba(34, 193, 230, 0.1);
                    border: 1px solid rgba(34, 193, 230, 0.3);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-top: 2px;
                    transition: all 0.3s ease;
                }

                .why-pillar-item:hover .why-check-circle {
                    background: var(--primary);
                    border-color: var(--primary);
                }

                .why-check-svg {
                    width: 11px;
                    height: 9px;
                    transition: all 0.3s ease;
                }

                .why-pillar-item:hover .why-check-svg path {
                    stroke: #120D20;
                }

                .why-pillar-text {
                    font-size: 15px;
                    line-height: 1.6;
                    color: var(--text, #ffffff);
                    font-weight: 500;
                    opacity: 0.9;
                }

                @media (max-width: 900px) {
                    .why-grid {
                        grid-template-columns: 1fr;
                        gap: 40px;
                    }
                    .why-visual-card {
                        aspect-ratio: 16/9;
                        max-width: 500px;
                        margin: 0 auto;
                        width: 100%;
                    }
                }

                @media (max-width: 600px) {
                    .why-pillar-item {
                        padding: 12px 16px;
                        gap: 12px;
                    }
                    .why-pillar-text {
                        font-size: 14px;
                    }
                    .why-container {
                        padding: 0 4%;
                    }
                }
            `}</style>
        </section>
    );
};

export default WhyChooseUsSection;
