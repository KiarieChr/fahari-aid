import React from 'react';

const CellMeetingsWidget = ({ cell, memberCount }) => {
    const c = cell || {};
    const meetingDay = c.meeting_day || 'TBD';
    const meetingTime = c.meeting_time || '';
    const location = c.location || '';
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
            <h3 style={{ color: 'var(--primary)', fontSize: '1rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                📅 Meetings & Activity
            </h3>

            {/* Next Meeting */}
            <div style={{
                background: 'rgba(34, 193, 230, 0.05)',
                borderLeft: '4px solid #22c1e6',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '1rem'
            }}>
                <div style={{ color: 'var(--primary)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', marginBottom: '0.25rem' }}>Next Meeting</div>
                <div style={{ color: 'var(--text-color)', fontSize: '1.1rem', fontWeight: '700' }}>Every {meetingDay}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{meetingTime ? `@ ${meetingTime}` : ''}{location ? ` • ${location}` : ''}</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={{ flex: 1, padding: '0.4rem', borderRadius: '0.25rem', border: 'none', background: 'var(--primary)', color: 'var(--bg-color)', fontWeight: '600', cursor: 'pointer', fontSize: '0.8rem' }}>I'm Attending</button>
                    <button style={{ flex: 1, padding: '0.4rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>Can't Make It</button>
                </div>
            </div>

            {/* Attendance Stat */}
            <div style={{ marginTop: 'auto', padding: '1rem', background: 'var(--surface-2)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>My Attendance (Last 30 days)</div>
                    <div style={{ color: 'var(--text-color)', fontSize: '0.9rem', fontWeight: '600' }}>{memberCount ?? 0} Members in Cell</div>
                </div>
                <div style={{ fontSize: '1.5rem' }}>🔥</div>
            </div>
        </div>
    );
};

export default CellMeetingsWidget;
