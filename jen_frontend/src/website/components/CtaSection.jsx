import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const CtaSection = () => {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

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
        <section ref={sectionRef} className="cta-section-new">
            {/* Glowing Gradient Divider at the top */}
            <div className="section-divider"></div>

            {/* Soft Radial Lights */}
            <div className="cta-radial-glow"></div>
            
            <div className={`container cta-container ${isVisible ? 'fade-in-up' : 'hidden-state'}`}>
                <div className="cta-glass-card">
                    {/* Glowing Mesh Accent */}
                    <div className="cta-mesh-accent"></div>

                    <div className="cta-content-wrapper">
                        <span className="cta-eyebrow">Kingdom Advancement</span>
                        
                        <h2 className="cta-heading">
                            Let's <span>Build</span>. Let's <span>Grow</span>. <br />
                            Aligned in <span>Purpose</span> & <span>Unity</span>.
                        </h2>
                        
                        <p className="cta-desc">
                            We are raising a generation equipped to transform every mountain of society. Whether you are seeking a community for personal growth, looking to build impactful initiatives, or ready to partner with a global network, there is a place for you here.
                        </p>

                        <div className="cta-buttons">
                            <Link to="/give" className="btn btn-primary cta-btn-glow">
                                Partner With Us
                            </Link>
                            <Link to="/contact" className="btn btn-outline">
                                Join the Network
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .cta-section-new {
                    padding: 96px 0;
                    background: #120D20;
                    position: relative;
                    overflow: hidden;
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

                .cta-radial-glow {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 600px;
                    height: 600px;
                    background: radial-gradient(circle, rgba(34, 193, 230, 0.08) 0%, transparent 70%);
                    pointer-events: none;
                    z-index: 1;
                }

                .cta-container {
                    position: relative;
                    z-index: 2;
                    width: 100%;
                    max-width: 1100px;
                    margin: 0 auto;
                    padding: 0 5%;
                }

                .cta-glass-card {
                    background: linear-gradient(135deg, rgba(26, 22, 37, 0.6) 0%, rgba(18, 14, 28, 0.8) 100%);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: 32px;
                    padding: 80px 48px;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 40px 80px rgba(0, 0, 0, 0.4);
                }

                .cta-mesh-accent {
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(ellipse 60% 60% at 50% 0%, rgba(34, 193, 230, 0.12) 0%, transparent 60%);
                    pointer-events: none;
                }

                .cta-content-wrapper {
                    position: relative;
                    z-index: 3;
                    max-width: 780px;
                    margin: 0 auto;
                }

                .cta-eyebrow {
                    font-size: 11px;
                    letter-spacing: 0.3em;
                    text-transform: uppercase;
                    color: var(--primary, #22c1e6);
                    font-weight: 700;
                    margin-bottom: 24px;
                    display: inline-block;
                }

                .cta-heading {
                    font-family: 'Playfair Display', var(--font-sans), sans-serif;
                    font-size: clamp(2rem, 4vw, 3.2rem);
                    font-weight: 800;
                    color: #ffffff;
                    line-height: 1.2;
                    margin-bottom: 24px;
                }

                .cta-heading span {
                    background: linear-gradient(to right, var(--primary, #22c1e6), var(--secondary, #eff3c1));
                    background-clip: text;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .cta-desc {
                    font-size: 16px;
                    line-height: 1.8;
                    color: var(--text-muted, #94a3b8);
                    margin-bottom: 40px;
                    opacity: 0.95;
                }

                .cta-buttons {
                    display: flex;
                    gap: 20px;
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .cta-btn-glow {
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(34, 193, 230, 0.4);
                }

                .cta-btn-glow:hover {
                    box-shadow: 0 4px 30px rgba(34, 193, 230, 0.6);
                }

                @media (max-width: 768px) {
                    .cta-glass-card {
                        padding: 56px 24px;
                        border-radius: 24px;
                    }
                }

                @media (max-width: 480px) {
                    .cta-buttons {
                        flex-direction: column;
                        gap: 12px;
                    }
                    .cta-buttons .btn {
                        width: 100%;
                    }
                }
            `}</style>
        </section>
    );
};

export default CtaSection;
