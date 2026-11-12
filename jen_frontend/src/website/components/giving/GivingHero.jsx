import React from 'react';

const GivingHero = () => {
    return (
        <section style={{
            background: '#120D20',
            padding: '10rem 0 6rem',
            textAlign: 'center',
            color: 'white'
        }}>
            <div className="container">
                {/* Heart Icon Circle */}
                <div style={{
                    width: '80px',
                    height: '80px',
                    margin: '0 auto 2rem',
                    background: 'radial-gradient(circle, #22c1e6 10%, rgba(34, 193, 230, 0) 70%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 40px rgba(34, 193, 230, 0.4)'
                }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        background: '#22c1e6',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        color: 'white'
                    }}>
                        ❤
                    </div>
                </div>

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
                    PARTNER WITH US
                </span>

                <h1 style={{
                    fontSize: '4rem',
                    fontWeight: '800',
                    marginBottom: '1.5rem',
                    lineHeight: 1.1
                }}>
                    Give & Be Blessed
                </h1>

                <p style={{
                    fontSize: '1.125rem',
                    color: '#94a3b8',
                    maxWidth: '600px',
                    margin: '0 auto',
                    lineHeight: 1.6
                }}>
                    Your generous giving enables us to spread the Gospel, support missions, and transform lives across the globe. Together, we are building the Kingdom.
                </p>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    section {
                        padding: 6rem 0 4rem !important;
                    }
                    h1 {
                        fontSize: 2.5rem !important;
                    }
                    p {
                        fontSize: 1rem !important;
                        padding: 0 1rem;
                    }
                    div[style*="width: 80px"] {
                        width: 60px !important;
                        height: 60px !important;
                        marginBottom: 1.5rem !important;
                    }
                    div[style*="width: 50px"] {
                        width: 40px !important;
                        height: 40px !important;
                        fontSize: 1.25rem !important;
                    }
                }
            `}</style>
        </section>
    );
};

export default GivingHero;
