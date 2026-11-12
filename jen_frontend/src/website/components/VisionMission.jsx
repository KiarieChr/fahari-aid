import React from 'react';
import { Eye, Rocket, Quote } from 'lucide-react';

const VisionMission = () => {
    return (
        <section className="intro-vision-section">
            <div className="container intro-vision-container">
                
                {/* 1. Split Introduction Grid (Matches Mockup) */}
                <div className="intro-grid">
                    {/* Left Column: Image with floating accent badge */}
                    <div className="intro-visual-wrapper">
                        <div className="intro-img-frame">
                            <img 
                                src="/DSC_0009.JPG" 
                                alt="Kingdom Purpose Collaboration" 
                                className="intro-img"
                            />
                            {/* Floating Gold/Accent Badge */}
                            <div className="intro-badge-accent">
                                <Quote size={24} style={{ color: '#ffffff' }} />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Title, Scripture, and Copy */}
                    <div className="intro-content">
                        <div className="intro-eyebrow">Introduction</div>
                        <h2 className="intro-title">Building a Kingdom <em className="text-gradient">Generation That Lasts</em></h2>
                        
                        <div className="intro-verse-box">
                            <p className="verse-text">
                                "To equip the saints for the work of ministry, for building up the body of Christ, until we all attain to the unity of the faith... growing up in every way into Him who is the head, into Christ."
                            </p>
                            <cite className="verse-cite">Ephesians 4:11–16</cite>
                        </div>

                        <p className="intro-text">
                            Many young people begin life with a sense of calling. Far fewer are equipped with the Biblical grounding, practical skills, and community of accountability needed to sustain that calling through every season of life.
                        </p>
                        <p className="intro-text">
                            That is the work we do at Jesus Enthroned Network. We partner with individuals, institutions, and communities to raise a generation that does not merely attend church — but leads nations, transforms industries, and shapes culture with Kingdom values.
                        </p>
                        <p className="intro-text">
                            Our work is not measured by how many events we host, but by the depth of transformation we facilitate and the legacy we help transmit to the next generation.
                        </p>
                    </div>
                </div>

                {/* 2. Vision & Mission Cards Grid (Below Intro) */}
                <div className="vm-cards-grid">
                    {/* Vision Card */}
                    <div className="vm-card-new">
                        <div className="vm-card-header">
                            <div className="vm-icon-box vision-gradient">
                                <Eye size={24} style={{ color: 'white' }} />
                            </div>
                            <h3 className="vm-card-title">Our Vision</h3>
                        </div>
                        <p className="vm-card-content">
                            To nurture and raise a generation grounded in the gospel of the kingdom, guided by kingdom principles, and empowered to fulfill their divine purpose in Christ.
                        </p>
                    </div>

                    {/* Mission Card */}
                    <div className="vm-card-new">
                        <div className="vm-card-header">
                            <div className="vm-icon-box mission-gradient">
                                <Rocket size={24} style={{ color: 'white' }} />
                            </div>
                            <h3 className="vm-card-title">Our Mission</h3>
                        </div>
                        <p className="vm-card-content">
                            To influence the seven mountains of societal influence—Spirituality, Education, Politics & Governance, Business & Economics, Media & Communication, Family, Arts and Entertainment—aligning them with the values of the Kingdom.
                        </p>
                    </div>
                </div>

            </div>

            <style>{`
                .intro-vision-section {
                    padding: 96px 0;
                    background: #171228;
                    position: relative;
                }

                .intro-vision-container {
                    width: 100%;
                    max-width: 1440px;
                    margin: 0 auto;
                    padding: 0 3%;
                }

                /* Split Introduction Grid */
                .intro-grid {
                    display: grid;
                    grid-template-columns: 0.9fr 1.1fr;
                    gap: 64px;
                    align-items: center;
                    margin-bottom: 80px;
                }

                .intro-visual-wrapper {
                    position: relative;
                    opacity: 0;
                    transform: translateX(-45px);
                    transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.1s, transform 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.1s;
                }

                .intro-img-frame {
                    border-radius: 20px;
                    overflow: hidden;
                    aspect-ratio: 4/3;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    position: relative;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                }

                .intro-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .intro-badge-accent {
                    position: absolute;
                    top: 24px;
                    left: 5px;
                    width: 60px;
                    height: 60px;
                    background: var(--primary, #22c1e6);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 10px 25px rgba(34, 193, 230, 0.4);
                    animation: floatBadge 4s ease-in-out infinite alternate;
                    z-index: 5;
                }

                @keyframes floatBadge {
                    0% { transform: translateY(0) rotate(0deg); }
                    100% { transform: translateY(-10px) rotate(6deg); }
                }

                /* Right Column Intro Content */
                .intro-content {
                    display: flex;
                    flex-direction: column;
                    opacity: 0;
                    transform: translateX(45px);
                    transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.1s, transform 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.1s;
                }

                /* Active triggers from scroll wrapper */
                .in-view .intro-visual-wrapper,
                .in-view .intro-content {
                    opacity: 1;
                    transform: translateX(0);
                }

                .intro-eyebrow {
                    font-size: 11px;
                    letter-spacing: 0.25em;
                    text-transform: uppercase;
                    color: var(--primary, #22c1e6);
                    font-weight: 700;
                    margin-bottom: 12px;
                }

                .intro-title {
                    font-family: 'Onest', 'Montserrat', 'Inter', sans-serif;
                    font-size: clamp(1.8rem, 3vw, 2.5rem);
                    font-weight: 800;
                    color: white;
                    line-height: 1.2;
                    margin-bottom: 24px;
                }

                .intro-title em {
                    font-style: italic;
                    font-weight: 800;
                }

                /* Scripture verse box styling */
                .intro-verse-box {
                    border-left: 3px solid var(--primary, #22c1e6);
                    padding-left: 24px;
                    margin-bottom: 28px;
                    box-shadow: inset 4px 0 12px -6px rgba(34, 193, 230, 0.15);
                    animation: verseGlowBorder 4s infinite alternate;
                }

                @keyframes verseGlowBorder {
                    0% { border-color: var(--primary, #22c1e6); }
                    100% { border-color: var(--secondary, #eff3c1); }
                }

                .verse-text {
                    font-family: 'Playfair Display', serif;
                    font-style: italic;
                    font-size: 17px;
                    color: rgba(255, 255, 255, 0.9);
                    line-height: 1.6;
                    margin: 0 0 8px 0;
                }

                .verse-cite {
                    font-family: 'Inter', sans-serif;
                    font-size: 11.5px;
                    font-style: normal;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: var(--primary, #22c1e6);
                }

                .intro-text {
                    font-size: 15px;
                    color: var(--text-muted, #94a3b8);
                    line-height: 1.7;
                    margin: 0 0 20px 0;
                }

                /* Vision & Mission Cards Grid */
                .vm-cards-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 32px;
                }

                .vm-card-new {
                    background: rgba(255, 255, 255, 0.015);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                    padding: 40px;
                    transition: transform 0.3s ease, background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
                    opacity: 0;
                }

                .vm-cards-grid .vm-card-new:nth-child(1) {
                    transform: translateY(35px) rotate(-1.5deg);
                    transition: opacity 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s, transform 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s;
                }

                .vm-cards-grid .vm-card-new:nth-child(2) {
                    transform: translateY(35px) rotate(1.5deg);
                    transition: opacity 1s cubic-bezier(0.16, 1, 0.3, 1) 0.45s, transform 1s cubic-bezier(0.16, 1, 0.3, 1) 0.45s;
                }

                .in-view .vm-card-new {
                    opacity: 1 !important;
                    transform: translateY(0) rotate(0deg) !important;
                }

                .vm-card-new:hover {
                    transform: translateY(-4px);
                    background: rgba(255, 255, 255, 0.03);
                    border-color: rgba(34, 193, 230, 0.2);
                    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
                }

                .vm-card-header {
                    display: flex;
                    align-items: center;
                    gap: 18px;
                    margin-bottom: 20px;
                }

                .vm-icon-box {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.25);
                }

                .vision-gradient {
                    background: linear-gradient(135deg, var(--primary, #22c1e6) 0%, #1aa3c4 100%);
                }

                .mission-gradient {
                    background: linear-gradient(135deg, #A855F7 0%, #7E22CE 100%);
                }

                .vm-card-title {
                    font-family: 'Onest', 'Montserrat', 'Inter', sans-serif;
                    color: white;
                    font-size: 1.4rem;
                    font-weight: 700;
                    margin: 0;
                }

                .vm-card-content {
                    color: rgba(255, 255, 255, 0.7);
                    line-height: 1.7;
                    font-size: 14.5px;
                    margin: 0;
                }

                /* Responsive Design */
                @media (max-width: 968px) {
                    .intro-grid {
                        grid-template-columns: 1fr;
                        gap: 40px;
                    }
                    .intro-visual-wrapper {
                        max-width: 480px;
                        margin: 0 auto;
                        width: 100%;
                    }
                    .vm-cards-grid {
                        grid-template-columns: 1fr;
                        gap: 20px;
                    }
                }
            `}</style>
        </section>
    );
};

export default VisionMission;
