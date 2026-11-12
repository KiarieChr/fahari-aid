import React from 'react';

// Simple CSS Bar Chart Component since we are avoiding external libraries
const SimpleBarChart = ({ data }) => {
    const max = Math.max(...data.map(d => d.value));

    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', height: '150px', gap: '8px', padding: '10px 0' }}>
            {data.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                    <div style={{
                        width: '100%',
                        height: `${(d.value / max) * 100}%`,
                        background: d.color || 'var(--primary)',
                        borderRadius: '4px 4px 0 0',
                        opacity: 0.8,
                        transition: 'height 0.5s ease'
                    }}></div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', transform: 'rotate(-45deg)', transformOrigin: 'left top', marginTop: '10px', whiteSpace: 'nowrap' }}>{d.label}</div>
                </div>
            ))}
        </div>
    );
};

const EventAnalytics = () => {
    const attendanceData = [
        { label: 'Jan 1', value: 450, color: 'var(--primary)' },
        { label: 'Jan 8', value: 470, color: 'var(--primary)' },
        { label: 'Jan 15', value: 420, color: 'var(--primary)' },
        { label: 'Jan 22', value: 490, color: 'var(--primary)' },
        { label: 'Jan 29', value: 510, color: 'var(--primary)' },
    ];

    const categoryData = [
        { label: 'Service', value: 2400 },
        { label: 'Conf', value: 300 },
        { label: 'Concert', value: 800 },
        { label: 'Outreach', value: 450 },
    ];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{
                background: 'var(--surface-1)',
                borderRadius: '1rem',
                padding: '1.5rem',
                border: '1px solid var(--border-color)'
            }}>
                <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-color)', fontSize: '1rem' }}>Attendance Trend (Jan)</h3>
                <SimpleBarChart data={attendanceData} />
            </div>

            <div style={{
                background: 'var(--surface-1)',
                borderRadius: '1rem',
                padding: '1.5rem',
                border: '1px solid var(--border-color)'
            }}>
                <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-color)', fontSize: '1rem' }}>Attendance by Category</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {categoryData.map((cat, idx) => (
                        <div key={idx}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.2rem', color: 'var(--text-color)' }}>
                                <span>{cat.label}</span>
                                <span>{cat.value}</span>
                            </div>
                            <div style={{ width: '100%', height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${(cat.value / 2500) * 100}%`, height: '100%', background: idx % 2 === 0 ? 'var(--secondary)' : '#f59e0b' }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EventAnalytics;
