import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Blogs = () => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#120D20', color: '#ffffff' }}>
            <Navbar />
            
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '120px 24px 80px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background ambient lighting */}
                <div style={{
                    position: 'absolute',
                    top: '30%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '500px',
                    height: '500px',
                    background: 'radial-gradient(circle, rgba(239, 243, 193, 0.05) 0%, transparent 70%)',
                    pointerEvents: 'none'
                }}></div>

                <div style={{
                    position: 'relative',
                    zIndex: 2,
                    textAlign: 'center',
                    maxWidth: '600px',
                    background: 'rgba(26, 22, 37, 0.4)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    padding: '64px 48px',
                    borderRadius: '28px',
                    boxShadow: '0 30px 60px rgba(0, 0, 0, 0.35)'
                }}>
                    <span style={{
                        fontSize: '3rem',
                        display: 'block',
                        marginBottom: '20px'
                    }}>✍️</span>

                    <h1 style={{
                        fontFamily: 'Playfair Display, serif',
                        fontSize: '2.5rem',
                        fontWeight: '800',
                        marginBottom: '16px',
                        lineHeight: '1.2'
                    }}>
                        Insights & Blogs
                    </h1>

                    <p style={{
                        color: '#94a3b8',
                        fontSize: '1.1rem',
                        lineHeight: '1.7',
                        marginBottom: '32px'
                    }}>
                        Deep theological studies, leadership articles, ethical business frameworks, and updates from our chapters. Launching soon.
                    </p>

                    <div style={{
                        display: 'inline-block',
                        background: 'rgba(34, 193, 230, 0.08)',
                        border: '1px solid rgba(34, 193, 230, 0.2)',
                        color: 'var(--primary, #22c1e6)',
                        padding: '8px 24px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em'
                    }}>
                        Stay Tuned
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Blogs;
