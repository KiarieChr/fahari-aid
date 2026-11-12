import React from 'react';

const CellHeader = ({ cell }) => {
    const c = cell || {};
    const cellInfo = {
        name: c.cell_name || c.code || 'My Cell',
        category: c.category || 'General',
        location: c.location || '—',
        meetingTime: c.meeting_day ? `${c.meeting_day}${c.meeting_time ? ' @ ' + c.meeting_time : ''}` : '—',
        status: c.status == 1 ? 'Active' : 'Inactive'
    };

    return (
        <div style={{
            background: 'linear-gradient(135deg, #1A1625 0%, #2e2640 100%)',
            borderRadius: '1rem',
            padding: '2rem',
            border: '1px solid var(--border-color)',
            marginBottom: '1.5rem',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '2rem'
        }}>
            {/* Background decoration */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-10%',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(34, 193, 230, 0.1) 0%, transparent 60%)',
                pointerEvents: 'none'
            }}></div>

            <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '1rem',
                background: 'rgba(34, 193, 230, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                color: 'var(--primary)',
                border: '1px solid rgba(34, 193, 230, 0.2)'
            }}>
                🏘️
            </div>

            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '800', color: 'var(--text-color)' }}>{cellInfo.name}</h1>
                    <span style={{
                        background: 'rgba(34, 197, 94, 0.2)',
                        color: '#4ade80',
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        {cellInfo.status}
                    </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>📍</span> {cellInfo.location}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>📅</span> {cellInfo.meetingTime}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>🏷️</span> {cellInfo.category}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default CellHeader;
