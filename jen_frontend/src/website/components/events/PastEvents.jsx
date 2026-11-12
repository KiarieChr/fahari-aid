import React, { useState, useEffect } from 'react';
import { API_BASE_URL as API_URL } from '../../../services/api';

const PastEventCard = ({ name, date_formatted, image, attendee_count }) => (
    <div className="past-event-card-new" style={{
        background: 'rgba(26, 22, 37, 0.3)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: '1.25rem',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column'
    }}>
        <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
            <img
                src={image || "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1000&auto=format&fit=crop"}
                alt={name}
                className="past-event-card-img"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'grayscale(30%)',
                    transition: 'all 0.5s ease'
                }}
            />
            {attendee_count > 0 && (
                <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    background: 'rgba(18, 13, 32, 0.8)',
                    backdropFilter: 'blur(4px)',
                    color: 'var(--secondary, #eff3c1)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '9999px',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    letterSpacing: '0.02em'
                }}>
                    👥 {attendee_count} attendees
                </div>
            )}
        </div>
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
            <h4 style={{ fontSize: '1.1rem', fontFamily: 'Playfair Display, serif', fontWeight: '700', color: '#ffffff', marginBottom: '0.75rem', lineHeight: 1.3 }}>
                {name}
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.85rem', marginTop: 'auto' }}>
                <span>📅</span> {date_formatted}
            </div>
        </div>
    </div>
);

const PastEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    const fetchEvents = async (pageNum = 1) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}get_past_events.php?limit=6&page=${pageNum}`);
            const data = await response.json();
            if (data.success) {
                if (pageNum === 1) {
                    setEvents(data.events || []);
                } else {
                    setEvents(prev => [...prev, ...(data.events || [])]);
                }
                setHasMore(data.pagination?.has_more || false);
            }
        } catch (error) {
            console.error('Failed to fetch past events:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents(1);
    }, []);

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchEvents(nextPage);
    };

    if (loading && events.length === 0) {
        return (
            <section style={{ padding: '2rem 0 6rem' }}>
                <div className="container" style={{ maxWidth: '1000px', textAlign: 'center' }}>
                    <p style={{ color: '#94a3b8' }}>Loading past events...</p>
                </div>
            </section>
        );
    }

    if (events.length === 0) {
        return null; // Don't show section if no past events
    }

    return (
        <section style={{ padding: '2rem 0 6rem', position: 'relative' }}>
            <div className="container" style={{ maxWidth: '1000px', position: 'relative', zIndex: 2 }}>
                <h2 style={{ fontSize: '1.8rem', fontFamily: 'Playfair Display, serif', fontWeight: '700', color: '#ffffff', marginBottom: '1.75rem' }}>
                    Past Gatherings
                </h2>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '2rem'
                }}>
                    {events.map((event) => (
                        <PastEventCard key={event.id} {...event} />
                    ))}
                </div>

                {hasMore && (
                    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                        <button
                            onClick={loadMore}
                            disabled={loading}
                            className="load-more-btn-glow"
                            style={{
                                background: 'transparent',
                                border: '1.5px solid rgba(255,255,255,0.15)',
                                padding: '0.75rem 2.25rem',
                                borderRadius: '9999px',
                                fontWeight: '700',
                                color: '#ffffff',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.6 : 1,
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {loading ? 'Loading...' : 'Load More Past Events'}
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                .past-event-card-new:hover {
                    transform: translateY(-6px);
                    background: rgba(33, 28, 47, 0.5) !important;
                    border-color: rgba(34, 193, 230, 0.2) !important;
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
                }
                .past-event-card-new:hover .past-event-card-img {
                    filter: grayscale(0%) !important;
                    transform: scale(1.04);
                }
                .load-more-btn-glow:hover {
                    border-color: var(--primary, #22c1e6) !important;
                    box-shadow: 0 0 15px rgba(34, 193, 230, 0.25) !important;
                    color: var(--primary, #22c1e6) !important;
                }
            `}</style>
        </section>
    );
};

export default PastEvents;
