import React, { useState, useEffect } from 'react';
import { API_BASE_URL as API_URL } from '../../../services/api';

const FeaturedEvent = () => {
    const [event, setEvent] = useState(null);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                // Fetch featured event
                const featuredRes = await fetch(`${API_URL}get_upcoming_events.php?featured=1`);
                const featuredData = await featuredRes.json();
                if (featuredData.success && featuredData.event) {
                    setEvent(featuredData.event);
                }

                // Fetch more upcoming events (skip featured)
                const upcomingRes = await fetch(`${API_URL}get_upcoming_events.php?limit=4`);
                const upcomingData = await upcomingRes.json();
                if (upcomingData.success && upcomingData.events) {
                    // Skip first one if it's the featured event
                    setUpcomingEvents(upcomingData.events.slice(1, 4));
                }
            } catch (error) {
                console.error('Failed to fetch events:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const defaultImage = "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1000&auto=format&fit=crop";

    if (loading) {
        return (
            <section style={{ padding: '4rem 0 2rem' }}>
                <div className="container" style={{ maxWidth: '1000px', textAlign: 'center' }}>
                    <p style={{ color: '#94a3b8' }}>Loading events...</p>
                </div>
            </section>
        );
    }

    if (!event) {
        return (
            <section style={{ padding: '4rem 0 2rem' }}>
                <div className="container" style={{ maxWidth: '1000px', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2.5rem', fontFamily: 'Playfair Display, serif', fontWeight: '800', color: '#ffffff' }}>
                        Upcoming Events
                    </h2>
                    <p style={{ color: '#94a3b8', marginTop: '1rem' }}>
                        No upcoming events at the moment. Check back soon!
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="featured-event-section-new" style={{ padding: '4rem 0 2rem', position: 'relative' }}>
            <div className="container" style={{ maxWidth: '1000px', position: 'relative', zIndex: 2 }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <span className="events-eyebrow" style={{
                        fontSize: '11px',
                        letterSpacing: '0.25em',
                        textTransform: 'uppercase',
                        color: 'var(--primary, #22c1e6)',
                        fontWeight: '700',
                        marginBottom: '12px',
                        display: 'block'
                    }}>Gatherings</span>
                    <h2 style={{ fontSize: '2.5rem', fontFamily: 'Playfair Display, serif', fontWeight: '800', color: '#ffffff' }}>
                        Upcoming <span style={{
                            background: 'linear-gradient(to right, var(--primary, #22c1e6), var(--secondary, #eff3c1))',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>Events</span>
                    </h2>
                    <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>
                        Don't miss these upcoming gatherings and programs.
                    </p>
                </div>

                {/* Featured Event Card */}
                <div className="featured-event-card-glass" style={{
                    background: 'rgba(26, 22, 37, 0.4)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'row',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
                    flexWrap: 'wrap',
                    marginBottom: '4rem',
                    transition: 'transform 0.4s ease, border-color 0.4s ease'
                }}>
                    {/* Image Side */}
                    <div style={{ flex: '1 1 350px', minHeight: '350px', overflow: 'hidden', position: 'relative' }}>
                        <img
                            src={event.image || defaultImage}
                            alt={event.name}
                            className="featured-event-img-zoom"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }}
                        />
                    </div>

                    {/* Content Side */}
                    <div style={{ flex: '1 1 350px', padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        {event.days_until <= 7 && event.days_until > 0 && (
                            <span style={{
                                display: 'inline-flex',
                                background: 'rgba(34, 193, 230, 0.15)',
                                border: '1px solid rgba(34, 193, 230, 0.3)',
                                color: '#22c1e6',
                                padding: '0.35rem 0.85rem',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                marginBottom: '1.25rem',
                                alignSelf: 'flex-start'
                            }}>
                                🔔 {event.days_until === 1 ? 'Tomorrow!' : `${event.days_until} days away`}
                            </span>
                        )}
                        <h3 style={{ fontSize: '1.8rem', fontFamily: 'Playfair Display, serif', fontWeight: '800', color: '#ffffff', marginBottom: '1rem', lineHeight: 1.3 }}>
                            {event.name}
                        </h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
                            {event.description || 'Join us for this exciting event!'}
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '2.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#22c1e6', fontSize: '0.95rem', fontWeight: '600' }}>
                                <span>📅</span> {event.date_formatted}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                                <span>🕒</span> {event.time_formatted}
                            </div>
                            {event.venue && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                                    <span>📍</span> {event.venue}
                                </div>
                            )}
                            {!event.is_free && event.facilitation_fee && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#eff3c1', fontSize: '0.95rem', fontWeight: '700' }}>
                                    <span>💰</span> KES {event.facilitation_fee.toLocaleString()}
                                </div>
                            )}
                        </div>

                        <a
                            href={`/events/${event.id}/register`}
                            className="register-btn-glow"
                            style={{
                                display: 'inline-block',
                                background: 'linear-gradient(135deg, var(--primary) 0%, #1aa3c4 100%)',
                                padding: '0.8rem 2.2rem',
                                borderRadius: '12px',
                                fontWeight: '700',
                                color: '#ffffff',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                textDecoration: 'none',
                                textAlign: 'center',
                                boxShadow: '0 4px 15px rgba(34, 193, 230, 0.25)',
                                alignSelf: 'flex-start'
                            }}
                        >
                            Register Now
                        </a>
                    </div>
                </div>

                {/* More Upcoming Events Grid */}
                {upcomingEvents.length > 0 && (
                    <div>
                        <h3 style={{ fontSize: '1.4rem', fontFamily: 'Playfair Display, serif', fontWeight: '700', color: '#ffffff', marginBottom: '1.5rem' }}>
                            More Events
                        </h3>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '2rem'
                        }}>
                            {upcomingEvents.map((evt) => (
                                <div key={evt.id} className="upcoming-event-card-new" style={{
                                    background: 'rgba(26, 22, 37, 0.3)',
                                    backdropFilter: 'blur(12px)',
                                    WebkitBackdropFilter: 'blur(12px)',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    borderRadius: '20px',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                    <div style={{ height: '170px', overflow: 'hidden', position: 'relative' }}>
                                        <img
                                            src={evt.image || defaultImage}
                                            alt={evt.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                                        />
                                    </div>
                                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <h4 style={{ fontSize: '1.1rem', fontFamily: 'Playfair Display, serif', fontWeight: '700', color: '#ffffff', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                                            {evt.name}
                                        </h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#22c1e6', fontSize: '0.85rem', marginBottom: '1.25rem', marginTop: 'auto' }}>
                                            <span>📅</span> {evt.date_formatted}
                                        </div>
                                        <a
                                            href={`/events/${evt.id}/register`}
                                            className="register-link-arrow"
                                            style={{
                                                color: 'var(--secondary, #eff3c1)',
                                                fontSize: '0.85rem',
                                                fontWeight: '600',
                                                textDecoration: 'none',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                transition: 'color 0.2s'
                                            }}
                                        >
                                            Register 
                                            <svg viewBox="0 0 14 14" fill="none" style={{ width: '12px', height: '12px', transition: 'transform 0.2s' }}>
                                                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .featured-event-card-glass:hover {
                    border-color: rgba(34, 193, 230, 0.2) !important;
                    transform: translateY(-4px);
                }
                .featured-event-card-glass:hover .featured-event-img-zoom {
                    transform: scale(1.05);
                }
                .upcoming-event-card-new:hover {
                    transform: translateY(-6px);
                    background: rgba(33, 28, 47, 0.5) !important;
                    border-color: rgba(34, 193, 230, 0.2) !important;
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
                }
                .upcoming-event-card-new:hover img {
                    transform: scale(1.06);
                }
                .register-btn-glow:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(34, 193, 230, 0.45) !important;
                }
                .register-link-arrow:hover {
                    color: var(--primary, #22c1e6) !important;
                }
                .register-link-arrow:hover svg {
                    transform: translateX(3px);
                }
            `}</style>
        </section>
    );
};

export default FeaturedEvent;
