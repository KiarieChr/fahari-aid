import React from 'react';

const AttendanceDistributionChart = () => {
    // Mock Data
    const data = [
        { label: 'Cell Meetings', value: 35, color: 'var(--primary)' },
        { label: 'Sunday Service', value: 45, color: '#4ade80' },
        { label: 'Prayer', value: 15, color: '#f59e0b' },
        { label: 'Outreach', value: 5, color: '#ef4444' },
    ];

    // Simple Conic Gradient for Donut Chart approximation
    let cumulative = 0;
    const gradient = data.map(d => {
        const start = cumulative;
        cumulative += d.value;
        const end = cumulative;
        return `${d.color} ${start}% ${end}%`;
    }).join(', ');

    const donutStyle = {
        background: `conic-gradient(${gradient})`,
        borderRadius: '50%',
        width: '180px',
        height: '180px',
        position: 'relative',
        margin: '0 auto'
    };

    return (
        <div style={{
            background: 'var(--surface-1)',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid var(--border-color)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-color)', fontSize: '1rem', width: '100%', textAlign: 'left' }}>Attendance Distribution</h3>

            <div style={donutStyle}>
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: 'var(--surface-1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column'
                }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-color)' }}>100%</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Engagement</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.5rem', width: '100%' }}>
                {data.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.color }}></span>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-color)' }}>
                            <span style={{ fontWeight: '600' }}>{d.value}%</span> {d.label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AttendanceDistributionChart;
