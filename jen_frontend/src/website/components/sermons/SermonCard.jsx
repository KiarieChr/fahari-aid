import React from 'react';

const SermonCard = ({ type, title, pastor, date, duration, image }) => {
    return (
        <div style={{
            background: 'white',
            borderRadius: '1rem',
            overflow: 'hidden',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.2s',
            cursor: 'pointer'
        }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
            {/* Thumbnail */}
            <div style={{ position: 'relative', height: '220px' }}>
                <img src={image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    background: '#120D20',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                }}>
                    <span>{type === 'video' ? '▶' : '🎧'}</span> {type === 'video' ? 'Video' : 'Audio'}
                </div>
                {type === 'video' && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '50px',
                        height: '50px',
                        background: '#22c1e6',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1.25rem',
                        boxShadow: '0 4px 12px rgba(34, 193, 230, 0.5)'
                    }}>
                        ▶
                    </div>
                )}
            </div>

            {/* Content */}
            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem', color: '#120D20', lineHeight: 1.4 }}>{title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>{pastor}</p>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span>📅</span> {date}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {duration}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SermonCard;
