import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const EventsSection = ({ event, loading }) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    // Default fallback event
    const defaultEvent = {
        name: 'Marriage Enrichment Seminar',
        description: 'Strengthen your marriage with biblical principles. Open to couples at all stages of marriage.',
        start_date: '2026-02-14T10:00:00',
        end_date: '2026-02-14T16:00:00',
        venue: 'Family Center',
        id: null
    };

    const eventData = event || defaultEvent;

    useEffect(() => {
        const targetDate = new Date(eventData.start_date);

        const calculateTimeLeft = () => {
            const difference = +targetDate - +new Date();
            let timeLeft = {};

            if (difference > 0) {
                timeLeft = {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                };
            } else {
                timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
            }
            return timeLeft;
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [eventData.start_date]);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    return (
        <section className="section-padding" style={{ background: 'var(--background)' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <span style={{
                        background: 'rgba(255,255,255,0.1)',
                        color: 'var(--primary)',
                        padding: '0.5rem 1rem',
                        borderRadius: '9999px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        Upcoming Event
                    </span>
                    <h2 style={{
                        fontSize: '3rem',
                        fontWeight: '800',
                        color: 'white',
                        marginTop: '1.5rem'
                    }}>
                        Join Our Next Gathering
                    </h2>
                    <p style={{ color: '#94a3b8' }}>
                        Experience the presence of God together. Don't miss this powerful time.
                    </p>
                </div>

                <div className="event-card" style={{
                    background: 'white',
                    borderRadius: '2rem',
                    overflow: 'hidden',
                    display: 'flex',
                    maxWidth: '1000px',
                    margin: '0 auto',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }}>
                    <div className="event-image" style={{ flex: '1', minHeight: '300px' }}>
                        <img
                            src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop"
                            alt="Event"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                    <div className="event-content" style={{ flex: '1', padding: '3rem', background: 'var(--primary)', color: 'white' }}>
                        <div style={{ marginBottom: '2rem' }}>
                            <p style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', opacity: 0.9 }}>Starts in:</p>
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                {[
                                    { label: 'D', value: timeLeft.days },
                                    { label: 'H', value: timeLeft.hours },
                                    { label: 'M', value: timeLeft.minutes },
                                    { label: 'S', value: timeLeft.seconds }
                                ].map((item, i) => (
                                    <span key={i} className="timer-box" style={{
                                        background: 'rgba(0,0,0,0.2)',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '0.75rem',
                                        fontWeight: '800',
                                        fontFamily: 'monospace',
                                        fontSize: '2rem',
                                        lineHeight: 1,
                                        minWidth: '70px',
                                        textAlign: 'center'
                                    }}>
                                        {item.value}<span style={{ fontSize: '0.8rem', verticalAlign: 'top', marginLeft: '0.1rem' }}>{item.label}</span>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <h3 className="event-title" style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem', lineHeight: 1.2 }}>
                            {eventData.name}
                        </h3>
                        <p className="event-description" style={{ marginBottom: '2rem', opacity: 0.9, lineHeight: 1.6 }}>
                            {eventData.description || 'Join us for this special event. Experience the presence of God together.'}
                        </p>

                        <div style={{ marginBottom: '2rem', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>📅</span> {formatDate(eventData.start_date)}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>⏰</span> {formatTime(eventData.start_date)}{eventData.end_date ? ` - ${formatTime(eventData.end_date)}` : ''}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>📍</span> {eventData.venue || 'TBA'}
                            </div>
                            {eventData.registered_count !== undefined && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>👥</span> {eventData.registered_count} registered
                                </div>
                            )}
                        </div>

                        {eventData.id ? (
                            <Link 
                                to={`/events/${eventData.id}/register`}
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    padding: '1rem',
                                    borderRadius: '9999px',
                                    border: '1px solid white',
                                    background: 'transparent',
                                    color: 'white',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s',
                                    fontSize: '1rem',
                                    textAlign: 'center',
                                    textDecoration: 'none'
                                }}
                                onMouseOver={(e) => { e.target.style.background = 'white'; e.target.style.color = 'var(--primary)'; }}
                                onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'white'; }}
                            >
                                Register Now
                            </Link>
                        ) : (
                            <button style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '9999px',
                                border: '1px solid white',
                                background: 'transparent',
                                color: 'white',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'background 0.2s',
                                fontSize: '1rem'
                            }}
                                onMouseOver={(e) => { e.target.style.background = 'white'; e.target.style.color = 'var(--primary)'; }}
                                onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'white'; }}
                            >
                                Register Now
                            </button>
                        )}
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                    <Link to="/events" className="btn btn-primary">
                        View All Events →
                    </Link>
                </div>
            </div>

            <style>{`
                @media (max-width: 968px) {
                    .event-card {
                        flex-direction: column !important;
                        border-radius: 1.5rem !important;
                    }
                    .event-image {
                        minHeight: 250px !important;
                    }
                    .event-content {
                        padding: 2rem !important;
                    }
                    h2 {
                        fontSize: 2.25rem !important;
                    }
                    .timer-box {
                        fontSize: 1.5rem !important;
                        padding: 0.5rem 0.75rem !important;
                        minWidth: 60px !important;
                    }
                }
            `}</style>
        </section>
    );
};

export default EventsSection;
