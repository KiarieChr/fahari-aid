import React from 'react';
import { Link } from 'react-router-dom';

const PartnerSection = () => {
    return (
        <section className="section-padding" style={{ background: 'var(--secondary)' }}>
            <div className="container">
                <div className="partner-container" style={{
                    background: 'linear-gradient(135deg, var(--background), var(--surface))',
                    borderRadius: '2rem',
                    padding: '4rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3rem',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Decorative glow */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '0',
                        width: '300px',
                        height: '300px',
                        background: 'radial-gradient(circle, rgba(14, 165, 233, 0.4) 0%, transparent 70%)',
                        transform: 'translate(-30%, -50%)',
                        pointerEvents: 'none'
                    }}></div>

                    <div className="partner-icon" style={{
                        width: '100px',
                        height: '100px',
                        background: 'var(--primary)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        flexShrink: 0,
                        boxShadow: '0 0 20px rgba(14, 165, 233, 0.5)'
                    }}>
                        ♥
                    </div>

                    <div className="partner-content" style={{ flex: 1 }}>
                        <h2 className="partner-title" style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>
                            Partner With Us
                        </h2>
                        <p className="partner-text" style={{ fontSize: '1.125rem', color: '#94a3b8', maxWidth: '600px' }}>
                            Your generous giving enables us to spread the Gospel, support missions, and transform lives across the globe. Together, we are building the Kingdom.
                        </p>
                    </div>

                    <div className="partner-action">
                        <Link to="/give" className="btn btn-primary btn-hover-scale partner-btn" style={{ fontSize: '1.125rem', padding: '1rem 2.5rem', textDecoration: 'none' }}>
                            Give Now →
                        </Link>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 968px) {
                    .partner-container {
                        flex-direction: column !important;
                        text-align: center !important;
                        padding: 2.5rem 1.5rem !important;
                        gap: 1.5rem !important;
                    }
                    .partner-icon {
                        width: 70px !important;
                        height: 70px !important;
                        font-size: 2rem !important;
                        margin: 0 auto !important;
                    }
                    .partner-title {
                        font-size: 2rem !important;
                    }
                    .partner-text {
                        font-size: 1rem !important;
                        margin: 0 auto !important;
                    }
                    .partner-action {
                        width: 100% !important;
                    }
                    .partner-btn {
                        width: 100% !important;
                        max-width: 300px !important;
                        font-size: 1rem !important;
                        padding: 0.8rem 1.5rem !important;
                    }
                }
            `}</style>
        </section>
    );
};

export default PartnerSection;
