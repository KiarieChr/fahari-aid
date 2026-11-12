import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCalendarEvents } from '../../services/calendarApi';

const CalendarWidget = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 1-indexed

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const firstDayIndex = new Date(currentYear, currentMonth - 1, 1).getDay();
    const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const monthName = today.toLocaleString('default', { month: 'long' });

    useEffect(() => {
        let isMounted = true;
        const fetchMonthEvents = async () => {
            try {
                setLoading(true);
                const res = await getCalendarEvents({ year: currentYear, month: currentMonth });
                if (isMounted && res?.events) {
                    setEvents(res.events);
                }
            } catch (err) {
                console.error('Failed to load widget events:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchMonthEvents();
        return () => { isMounted = false; };
    }, [currentYear, currentMonth]);

    // Match events to dates
    const getEventsForDay = (day) => {
        const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return events.filter(e => {
            const start = e.start || e.date;
            return start && start.startsWith(dateStr);
        });
    };

    // Find next upcoming activity
    const todayStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const upcomingEvents = events
        .filter(e => (e.start || e.date) >= todayStr)
        .sort((a, b) => (a.start || a.date).localeCompare(b.start || b.date));
    const nextActivity = upcomingEvents[0] || events[0];

    return (
        <div style={{
            background: 'var(--surface-1, #1e293b)',
            border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
            borderRadius: '1rem',
            padding: '1.5rem',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
        }}>
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.1rem' }}>📅</span>
                        <h3 style={{ color: 'var(--primary, #38bdf8)', fontSize: '1rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                            {monthName} {currentYear}
                        </h3>
                    </div>
                    <Link 
                        to="/portal/calendar" 
                        style={{ 
                            fontSize: '0.75rem', 
                            color: 'var(--primary, #38bdf8)', 
                            textDecoration: 'none',
                            fontWeight: '600'
                        }}
                    >
                        View All →
                    </Link>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }}></span>
                        <span>Event</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                        <span>Meeting</span>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                    {days.map(d => (
                        <div key={d} style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.75rem', fontWeight: '600', padding: '0.25rem 0' }}>{d}</div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', gap: '0.25rem' }}>
                    {/* Empty padding days */}
                    {Array.from({ length: firstDayIndex }).map((_, i) => (
                        <div key={`empty-${i}`} />
                    ))}

                    {dates.map(date => {
                        const isToday = date === today.getDate();
                        const dayEvts = getEventsForDay(date);
                        const hasEvent = dayEvts.some(e => e.type === 'event' || e.category === 'event');
                        const hasMeeting = dayEvts.some(e => e.type === 'meeting' || e.category === 'meeting' || !e.type);

                        return (
                            <div 
                                key={date} 
                                title={dayEvts.length > 0 ? `${dayEvts.length} activity scheduled` : undefined}
                                style={{
                                    aspectRatio: '1',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.82rem',
                                    color: isToday ? '#ffffff' : 'var(--text-color, #f1f5f9)',
                                    background: isToday ? 'var(--primary, #2563eb)' : (dayEvts.length > 0 ? 'rgba(255,255,255,0.03)' : 'transparent'),
                                    position: 'relative',
                                    fontWeight: isToday ? '700' : '500',
                                    transition: 'all 0.15s ease'
                                }}
                            >
                                <span>{date}</span>
                                {dayEvts.length > 0 && !isToday && (
                                    <div style={{ display: 'flex', gap: '2px', position: 'absolute', bottom: '3px' }}>
                                        {hasEvent && <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#3b82f6' }} />}
                                        {hasMeeting && <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#10b981' }} />}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div style={{ 
                marginTop: '1.25rem', 
                padding: '0.85rem', 
                background: 'rgba(255,255,255,0.03)', 
                border: '1px solid var(--border-color, rgba(255,255,255,0.05))',
                borderRadius: '0.75rem' 
            }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem', fontWeight: '700' }}>
                    Next Gathering
                </div>
                {nextActivity ? (
                    <div>
                        <div style={{ color: 'var(--text-color, #f1f5f9)', fontSize: '0.85rem', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {nextActivity.title}
                        </div>
                        <div style={{ color: 'var(--primary, #38bdf8)', fontSize: '0.78rem', marginTop: '0.2rem' }}>
                            {new Date(nextActivity.start || nextActivity.date).toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric' })}
                            {nextActivity.venue && ` • ${nextActivity.venue}`}
                        </div>
                    </div>
                ) : (
                    <div style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.8rem' }}>
                        {loading ? 'Checking schedule...' : 'No upcoming activities this month'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CalendarWidget;
