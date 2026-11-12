import React from 'react';

const MeetingsVsEventsChart = () => {
    // Mock Data
    const data = [
        { label: 'Week 1', meetings: 45, events: 120 },
        { label: 'Week 2', meetings: 50, events: 80 },
        { label: 'Week 3', meetings: 48, events: 0 },
        { label: 'Week 4', meetings: 55, events: 150 },
    ];

    const max = Math.max(...data.map(d => Math.max(d.meetings, d.events)));

    return (
        <div style={{
            background: 'var(--surface-1)',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid var(--border-color)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-color)', fontSize: '1rem' }}>Meetings vs Events</h3>

            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem' }}>
                {data.map((d, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', gap: '4px', height: '100%', alignItems: 'flex-end' }}>
                        {/* Meetings Bar */}
                        <div style={{
                            flex: 1,
                            background: 'var(--primary)',
                            height: `${(d.meetings / max) * 100}%`,
                            borderRadius: '4px 4px 0 0',
                            opacity: 0.8,
                            position: 'relative',
                            minHeight: '4px'
                        }}></div>

                        {/* Events Bar */}
                        <div style={{
                            flex: 1,
                            background: 'var(--secondary)',
                            height: `${(d.events / max) * 100}%`,
                            borderRadius: '4px 4px 0 0',
                            opacity: 0.8,
                            position: 'relative',
                            minHeight: '4px'
                        }}></div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.8rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                {data.map((d, i) => (
                    <span key={i} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flex: 1, textAlign: 'center' }}>{d.label}</span>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-color)' }}>
                    <span style={{ width: '10px', height: '10px', background: 'var(--primary)', borderRadius: '2px' }}></span> Meetings
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-color)' }}>
                    <span style={{ width: '10px', height: '10px', background: 'var(--secondary)', borderRadius: '2px' }}></span> Events
                </div>
            </div>
        </div>
    );
};

export default MeetingsVsEventsChart;
