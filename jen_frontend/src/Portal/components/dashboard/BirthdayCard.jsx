import React from 'react';

const BirthdayCard = () => {
    // Mock data
    const birthday = {
        date: 'October 24th',
        turningAge: 28,
        daysLeft: 265
    };

    return (
        <div style={{
            background: 'linear-gradient(135deg, #1A1625 0%, #2e2640 100%)',
            borderRadius: '1.5rem',
            padding: '3rem',
            border: '1px solid var(--border-color)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            minHeight: '400px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
        }}>
            {/* Background Decorations */}
            <div style={{
                position: 'absolute',
                top: '-20%',
                right: '-20%',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(239, 68, 68, 0.1) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(40px)'
            }}></div>
            <div style={{
                position: 'absolute',
                bottom: '-10%',
                left: '-10%',
                width: '250px',
                height: '250px',
                background: 'radial-gradient(circle, rgba(34, 193, 230, 0.1) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(30px)'
            }}></div>

            {/* Confetti (CSS only representation) */}
            <div style={{ fontSize: '2rem', position: 'absolute', top: '10%', left: '10%', opacity: 0.5 }}>🎉</div>
            <div style={{ fontSize: '1.5rem', position: 'absolute', top: '20%', right: '15%', opacity: 0.4 }}>✨</div>
            <div style={{ fontSize: '2rem', position: 'absolute', bottom: '15%', left: '20%', opacity: 0.3 }}>🎂</div>

            <div style={{ zIndex: 2 }}>
                <h2 style={{
                    color: 'var(--text-color)',
                    fontSize: '1.5rem',
                    fontWeight: '300',
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em',
                    marginBottom: '1rem'
                }}>
                    Upcoming Birthday
                </h2>

                <div style={{
                    fontSize: '4.5rem',
                    fontWeight: '800',
                    background: 'linear-gradient(to right, #22c1e6, #a855f7)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1.1,
                    marginBottom: '0.5rem'
                }}>
                    {birthday.date}
                </div>

                <div style={{
                    fontSize: '2rem',
                    color: 'var(--text-muted)',
                    fontWeight: '600',
                    marginBottom: '2.5rem'
                }}>
                    Turning <span style={{ color: 'var(--text-color)', fontSize: '2.5rem' }}>{birthday.turningAge}</span> Years Old
                </div>

                <div style={{
                    background: 'var(--border-color)',
                    padding: '1rem 2rem',
                    borderRadius: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid var(--border-color)'
                }}>
                    <span style={{ fontSize: '1.5rem' }}>⏳</span>
                    <span style={{ color: 'var(--text-color)', fontSize: '1.1rem', fontWeight: '500' }}>
                        {birthday.daysLeft} days to go!
                    </span>
                </div>
            </div>
        </div>
    );
};

export default BirthdayCard;
