import React, { useContext, useState } from 'react';
import { EventContext } from '../../../../context/EventContext';
import ManageEventModal from './ManageEventModal';

const UpcomingEventsList = () => {
    const { events, updateEvent } = useContext(EventContext);
    const [selectedEvent, setSelectedEvent] = useState(null);

    return (
        <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: 'var(--text-color)', fontSize: '1.1rem', marginBottom: '1rem', borderLeft: '4px solid #22c1e6', paddingLeft: '0.75rem' }}>Upcoming Events</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {events.length > 0 ? (
                    events.map(event => (
                        <div key={event.id} style={{
                            background: 'var(--surface-1)',
                            borderRadius: '0.75rem',
                            overflow: 'hidden',
                            border: '1px solid var(--border-color)',
                            transition: 'transform 0.2s',
                            cursor: 'pointer'
                        }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ height: '100px', background: 'linear-gradient(135deg, #2e2640, #1e1b2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                                🗓️
                            </div>
                            <div style={{ padding: '1.25rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                    <h4 style={{ margin: 0, color: 'var(--text-color)', fontSize: '1.1rem' }}>{event.name}</h4>
                                    <span style={{ background: 'rgba(34, 193, 230, 0.1)', color: 'var(--primary)', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '1rem' }}>{event.status}</span>
                                </div>

                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '1rem' }}>
                                    <span>📅 {event.date} • {event.time}</span>
                                    <span>📍 {event.location}</span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-color)' }}><strong>{event.registrations?.length || 0}</strong> RSVPs</div>
                                    <button onClick={() => setSelectedEvent(event)} style={{ background: 'transparent', color: 'var(--primary)', border: '1px solid rgba(34, 193, 230, 0.3)', padding: '0.3rem 0.8rem', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.8rem' }}>Manage</button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', background: 'var(--surface-1)', borderRadius: '0.75rem' }}>
                        No upcoming events.
                    </div>
                )}
            </div>

            {selectedEvent && (
                <ManageEventModal
                    event={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                    onUpdate={updateEvent}
                />
            )}
        </div>
    );
};

export default UpcomingEventsList;
