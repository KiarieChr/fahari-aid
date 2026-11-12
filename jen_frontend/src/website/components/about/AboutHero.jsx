import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const AboutHero = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <section className="about-hero-section">
            {/* Ambient glows behind the columns */}
            <div className="about-hero-glow-left"></div>
            <div className="about-hero-glow-right"></div>

            <div className={`container-fluid about-hero-container ${mounted ? 'active' : ''}`}>
                <div className="about-hero-grid">
                    {/* Left Column: Content */}
                    <div className="about-hero-content-left">
                        <span className="about-hero-badge">
                            <span className="about-hero-badge-dot"></span>
                            Our Identity
                        </span>
                        
                        <h1 className="about-hero-title">
                            Our Story, Mission <br />
                            & <span>Kingdom Vision</span>
                        </h1>
                        
                        <p className="about-hero-description">
                            Jesus Enthroned Network is a global ministry committed to raising a generation that knows God intimately, walks in Kingdom authority, and transforms every sphere of society.
                        </p>

                        <div className="about-hero-actions">
                            <Link to="/give" className="btn btn-primary cta-btn-glow">
                                Partner With Us
                            </Link>
                            <Link to="/contact" className="btn btn-outline">
                                Join the Network
                            </Link>
                        </div>

                        {/* High-fidelity UI Detail: Small Stats Overlay */}
                        <div className="about-hero-mini-ui">
                            <div className="mini-ui-item">
                                <span className="mini-ui-num">7</span>
                                <span className="mini-ui-label">Spheres of Influence</span>
                            </div>
                            <div className="mini-ui-divider"></div>
                            <div className="mini-ui-item">
                                <span className="mini-ui-num">Est. 2025</span>
                                <span className="mini-ui-label">Kingdom Mandate</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Sleek Abstract Photo Grid built with CSS Grid & Transforms */}
                    <div className="about-hero-visual-right">
                        <div className="about-hero-grid-collage">
                            {/* Frame 1 */}
                            <div className="collage-item item-1">
                                <img 
                                    src="/DSC_0097.JPG" 
                                    alt="Professionals collaborating" 
                                />
                            </div>
                            
                            {/* Frame 2 */}
                            <div className="collage-item item-2">
                                <img 
                                    src="/DSC_0071.JPG" 
                                    alt="Creative meeting" 
                                />
                            </div>
                            
                            {/* Frame 3 */}
                            <div className="collage-item item-3">
                                <img 
                                    src="/DSC_0063.JPG" 
                                    alt="Team brainstorming" 
                                />
                            </div>
                            
                            {/* Frame 4 */}
                            <div className="collage-item item-4">
                                <img 
                                    src="/DSC_0043.JPG" 
                                    alt="Diverse team meeting" 
                                />
                            </div>

                            {/* Floating Glass Accent Overlay */}
                            <div className="collage-overlay-glass">
                                <div className="glass-indicator">
                                    <span className="indicator-pulse"></span>
                                    <span>Kingdom Unity & Purpose</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .about-hero-section {
                    padding: 10px 0 30px;
                    background-color: var(--background, #120D20);
                    color: var(--text, #ffffff);
                    position: relative;
                    overflow: hidden;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                /* Glowing backlights */
                .about-hero-glow-left {
                    position: absolute;
                    top: -10%;
                    left: -5%;
                    width: 500px;
                    height: 500px;
                    background: radial-gradient(circle, rgba(34, 193, 230, 0.1) 0%, transparent 70%);
                    pointer-events: none;
                    z-index: 1;
                }

                .about-hero-glow-right {
                    position: absolute;
                    bottom: -10%;
                    right: -5%;
                    width: 450px;
                    height: 450px;
                    background: radial-gradient(circle, rgba(239, 243, 193, 0.05) 0%, transparent 70%);
                    pointer-events: none;
                    z-index: 1;
                }

                .about-hero-container {
                    position: relative;
                    z-index: 2;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                /* Staggered entrance animations */
                .about-hero-badge {
                    opacity: 0;
                    transform: translateY(15px);
                    transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s;
                }

                .about-hero-title {
                    opacity: 0;
                    transform: translateY(20px);
                    transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.25s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.25s;
                }

                .about-hero-description {
                    opacity: 0;
                    transform: translateY(20px);
                    transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s;
                }

                .about-hero-actions {
                    opacity: 0;
                    transform: translateY(20px);
                    transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.55s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.55s;
                }

                .about-hero-mini-ui {
                    opacity: 0;
                    transform: translateY(20px);
                    transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.7s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.7s;
                }

                .collage-item {
                    opacity: 0;
                    transform: scale(0.9) translateY(30px);
                    transition: opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .collage-overlay-glass {
                    opacity: 0;
                    transform: scale(0.9) translateY(20px);
                    transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.9s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.9s;
                }

                /* Active state triggers */
                .about-hero-container.active .about-hero-badge,
                .about-hero-container.active .about-hero-title,
                .about-hero-container.active .about-hero-description,
                .about-hero-container.active .about-hero-actions,
                .about-hero-container.active .about-hero-mini-ui,
                .about-hero-container.active .collage-overlay-glass {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }

                .about-hero-container.active .collage-item.item-1 {
                    opacity: 1;
                    transform: scale(1) rotate(-2deg) skewY(1deg);
                }
                .about-hero-container.active .collage-item.item-2 {
                    opacity: 1;
                    transform: scale(1) rotate(1deg) skewX(-1deg);
                }
                .about-hero-container.active .collage-item.item-3 {
                    opacity: 1;
                    transform: scale(1) rotate(2deg) skewX(1deg);
                }
                .about-hero-container.active .collage-item.item-4 {
                    opacity: 1;
                    transform: scale(1) rotate(-1deg) skewY(-2deg);
                }

                /* Grid setup */
                .about-hero-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 64px;
                    align-items: center;
                }

                .about-hero-content-left {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    text-align: left;
                }

                /* Identity badge */
                .about-hero-badge {
                    background: rgba(34, 193, 230, 0.08);
                    border: 1px solid rgba(34, 193, 230, 0.2);
                    color: var(--primary, #22c1e6);
                    padding: 8px 18px;
                    border-radius: 9999px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.2em;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 24px;
                    font-family: var(--font-sans), sans-serif;
                }

                .about-hero-badge-dot {
                    width: 6px;
                    height: 6px;
                    background-color: var(--primary, #22c1e6);
                    border-radius: 50%;
                    box-shadow: 0 0 8px var(--primary, #22c1e6);
                }

                /* Heading style */
                .about-hero-title {
                    font-family: 'Playfair Display', var(--font-sans), sans-serif;
                    font-size: clamp(2.2rem, 4vw, 3.6rem);
                    font-weight: 900;
                    line-height: 1.15;
                    margin-bottom: 20px;
                    letter-spacing: -0.01em;
                }

                .about-hero-title span {
                    background: linear-gradient(to right, var(--primary, #22c1e6), var(--secondary, #eff3c1));
                    background-clip: text;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .about-hero-description {
                    font-family: var(--font-sans), sans-serif;
                    font-size: 16px;
                    color: var(--text-muted, #94a3b8);
                    line-height: 1.8;
                    margin-bottom: 36px;
                    opacity: 0.95;
                }

                .about-hero-actions {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 40px;
                    flex-wrap: wrap;
                }

                .cta-btn-glow {
                    box-shadow: 0 4px 20px rgba(34, 193, 230, 0.3);
                }

                /* Mini stats panel UI */
                .about-hero-mini-ui {
                    display: flex;
                    align-items: center;
                    gap: 24px;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    padding: 14px 28px;
                    border-radius: 16px;
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                }

                .mini-ui-item {
                    display: flex;
                    flex-direction: column;
                }

                .mini-ui-num {
                    font-family: 'Playfair Display', var(--font-sans), sans-serif;
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #ffffff;
                }

                .mini-ui-label {
                    font-size: 10px;
                    color: var(--text-muted, #94a3b8);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .mini-ui-divider {
                    width: 1px;
                    height: 24px;
                    background-color: rgba(255, 255, 255, 0.1);
                }

                /* Asymmetrical CSS Grid Collage */
                .about-hero-visual-right {
                    position: relative;
                }

                .about-hero-grid-collage {
                    display: grid;
                    grid-template-columns: repeat(12, 1fr);
                    grid-template-rows: repeat(12, 1fr);
                    width: 100%;
                    aspect-ratio: 1.1;
                    position: relative;
                    padding: 20px;
                }

                .collage-item {
                    position: relative;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
                    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .collage-item img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                    transition: transform 0.6s ease;
                }

                .collage-item:hover {
                    z-index: 10;
                    border-color: rgba(34, 193, 230, 0.3);
                    box-shadow: 0 30px 60px rgba(34, 193, 230, 0.15);
                }

                .collage-item:hover img {
                    transform: scale(1.08);
                }

                /* Distinct asymmetrical frames */
                .item-1 {
                    grid-column: 1 / 7;
                    grid-row: 1 / 8;
                    transform: rotate(-2deg) skewY(1deg);
                    border-radius: 24px 12px 24px 12px;
                }

                .item-2 {
                    grid-column: 7 / 13;
                    grid-row: 2 / 7;
                    transform: rotate(1deg) skewX(-1deg);
                    border-radius: 12px 24px 12px 24px;
                }

                .item-3 {
                    grid-column: 2 / 8;
                    grid-row: 8 / 13;
                    transform: rotate(2deg) skewX(1deg);
                    border-radius: 16px;
                }

                .item-4 {
                    grid-column: 8 / 13;
                    grid-row: 7 / 12;
                    transform: rotate(-1deg) skewY(-2deg);
                    border-radius: 24px;
                }

                .collage-overlay-glass {
                    position: absolute;
                    bottom: 0px;
                    right: 20px;
                    background: rgba(26, 22, 37, 0.7);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 10px 18px;
                    border-radius: 9999px;
                    color: #ffffff;
                    font-size: 12px;
                    font-weight: 600;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                    z-index: 12;
                }

                .glass-indicator {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .indicator-pulse {
                    width: 8px;
                    height: 8px;
                    background-color: var(--primary, #22c1e6);
                    border-radius: 50%;
                    animation: pulseGlow 2s infinite;
                }

                @keyframes pulseGlow {
                    0% {
                        transform: scale(0.95);
                        box-shadow: 0 0 0 0 rgba(34, 193, 230, 0.7);
                    }
                    70% {
                        transform: scale(1);
                        box-shadow: 0 0 0 6px rgba(34, 193, 230, 0);
                    }
                    100% {
                        transform: scale(0.95);
                        box-shadow: 0 0 0 0 rgba(34, 193, 230, 0);
                    }
                }

                @media (max-width: 992px) {
                    .about-hero-grid {
                        grid-template-columns: 1fr;
                        gap: 48px;
                    }
                    .about-hero-content-left {
                        align-items: center;
                        text-align: center;
                    }
                    .about-hero-actions {
                        justify-content: center;
                    }
                    .about-hero-grid-collage {
                        max-width: 500px;
                        margin: 0 auto;
                    }
                }
            `}</style>
        </section>
    );
};

export default AboutHero;
