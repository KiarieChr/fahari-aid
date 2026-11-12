import React from 'react';
import contactHeroImg from '../../../assets/contact_hero_illustration.png';

const ContactHero = () => {
    return (
        <section style={{
            background: 'linear-gradient(180deg, #120D20 0%, #0d091a 100%)',
            padding: '8rem 1rem 5rem',
            color: 'white',
            position: 'relative',
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

            <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto' }}>
                <div className="hero-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 0.8fr',
                    gap: '3rem',
                    alignItems: 'center'
                }}>
                    {/* Left Column: Text Content */}
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
                            Get In Touch
                        </span>
                        
                        <h1 style={{
                            fontSize: '3.75rem',
                            fontWeight: '800',
                            marginBottom: '1.5rem',
                            lineHeight: 1.1,
                            letterSpacing: '-0.02em'
                        }}>
                            Connect With Us
                        </h1>
                        
                        <p style={{
                            fontSize: '1.125rem',
                            color: '#94a3b8',
                            lineHeight: 1.6,
                            margin: 0
                        }}>
                            Have questions, feedback, or need prayer? Reach out to the Jesus Enthroned Network team. We are here to support and walk with you.
                        </p>
                    </div>

                    {/* Right Column: Illustration Image */}
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <img 
                            src={contactHeroImg} 
                            alt="Contact Us Illustration" 
                            style={{
                                width: '100%',
                                maxWidth: '350px',
                                height: 'auto',
                                borderRadius: '24px',
                                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                                border: '1px solid rgba(255, 255, 255, 0.05)'
                            }}
                        />
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    section {
                        padding: 6rem 1rem 4rem !important;
                    }
                    .hero-grid {
                        grid-template-columns: 1fr !important;
                        gap: 2.5rem !important;
                        text-align: center !important;
                    }
                    .hero-grid div {
                        text-align: center !important;
                    }
                    h1 {
                        font-size: 2.5rem !important;
                    }
                    img {
                        max-width: 280px !important;
                    }
                }
            `}</style>
        </section>
    );
};

export default ContactHero;
