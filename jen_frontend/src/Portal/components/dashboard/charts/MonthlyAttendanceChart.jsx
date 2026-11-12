import React from 'react';

const MonthlyAttendanceChart = () => {
    return (
        <div style={{
            background: 'var(--surface-1)',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid var(--border-color)',
            height: '100%'
        }}>
            <h3 style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                Monthly Attendance Breakdown
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Present */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                        <span>Present</span>
                    </div>
                    <div style={{ width: '100%', height: '10px', background: 'var(--border-color)', borderRadius: '5px' }}>
                        <div style={{ width: '85%', height: '100%', background: 'var(--primary)', borderRadius: '5px' }}></div>
                    </div>
                </div>
                {/* Absent */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                        <span>Absent</span>
                    </div>
                    <div style={{ width: '100%', height: '10px', background: 'var(--border-color)', borderRadius: '5px' }}>
                        <div style={{ width: '10%', height: '100%', background: '#ef4444', borderRadius: '5px' }}></div>
                    </div>
                </div>
                {/* Excused */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                        <span>Excused</span>
                    </div>
                    <div style={{ width: '100%', height: '10px', background: 'var(--border-color)', borderRadius: '5px' }}>
                        <div style={{ width: '5%', height: '100%', background: 'var(--secondary)', borderRadius: '5px' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonthlyAttendanceChart;
