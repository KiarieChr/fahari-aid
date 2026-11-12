import React, { useContext } from 'react';
import DashboardCard from './DashboardCard';
import { ThemeContext } from '../../../context/ThemeContext';

const UpcomingEventsList = () => {
    const { theme } = useContext(ThemeContext);
    const isLight = theme === 'light';

    // Theme colors
    const colors = {
        text: isLight ? '#1e293b' : '#ffffff',
        textMuted: isLight ? '#64748b' : 'rgba(255,255,255,0.5)',
        surface: isLight ? '#f8fafc' : 'rgba(255,255,255,0.05)',
        dot: isLight ? '#cbd5e1' : 'rgba(255,255,255,0.3)'
    };

    const events = [
        { title: 'Worship Night', date: 'Feb 10 @ 6:00 PM', location: 'Main Auditorium', type: 'Service', color: '#5d87ff' },
        { title: 'Leaders Meeting', date: 'Feb 12 @ 7:30 PM', location: 'Conference Room B', type: 'Meeting', color: '#f59e0b' },
        { title: 'Community Outreach', date: 'Feb 15 @ 9:00 AM', location: 'City Center', type: 'Outreach', color: '#10b981' },
        { title: 'New Members Class', date: 'Feb 18 @ 10:00 AM', location: 'Hall A', type: 'Training', color: '#a855f7' },
    ];

    const getTypeBg = (type) => {
        switch (type) {
            case 'Service': return isLight ? '#eef2ff' : 'rgba(93, 135, 255, 0.15)';
            case 'Meeting': return isLight ? '#fef3c7' : 'rgba(245, 158, 11, 0.15)';
            case 'Outreach': return isLight ? '#dcfce7' : 'rgba(16, 185, 129, 0.15)';
            case 'Training': return isLight ? '#f3e8ff' : 'rgba(168, 85, 247, 0.15)';
            default: return colors.surface;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'Service': return '#5d87ff';
            case 'Meeting': return '#f59e0b';
            case 'Outreach': return '#10b981';
            case 'Training': return '#a855f7';
            default: return '#64748b';
        }
    };

    return (
        <DashboardCard
            title="Upcoming Events"
            headerAction={
                <button style={{
                    background: '#5d87ff',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '0.375rem',
                    padding: '0.375rem 0.75rem',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                }}>
                    View All
                </button>
            }
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {events.map((event, i) => (
                    <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        background: colors.surface,
                        borderRadius: '0.5rem',
                        borderLeft: `3px solid ${event.color}`
                    }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ color: colors.text, fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                                {event.title}
                            </div>
                            <div style={{ color: colors.textMuted, fontSize: '0.8rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <span>{event.date}</span>
                                <span style={{ width: '4px', height: '4px', background: colors.dot, borderRadius: '50%' }}></span>
                                <span>{event.location}</span>
                            </div>
                        </div>
                        <div style={{ marginLeft: '1rem' }}>
                            <span style={{
                                background: getTypeBg(event.type),
                                color: getTypeColor(event.type),
                                padding: '0.25rem 0.75rem',
                                borderRadius: '1rem',
                                fontSize: '0.7rem',
                                fontWeight: '600',
                                textTransform: 'uppercase'
                            }}>
                                {event.type}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </DashboardCard>
    );
};

export default UpcomingEventsList;
