import React, { useState, useEffect, useContext } from 'react';
import api from '../../../services/api';
import DashboardCard from './DashboardCard';
import { ThemeContext } from '../../../context/ThemeContext';

const AttendanceWidget = () => {
    const [attendanceData, setAttendanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { theme } = useContext(ThemeContext);
    const isLight = theme === 'light';

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                setLoading(true);
                const response = await api.get('/get_my_attendance.php');
                if (response.success) {
                    setAttendanceData(response.data);
                }
            } catch (err) {
                console.error('Error fetching attendance:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, []);

    const getStatusColor = (status) => {
        if (status === 'Present' || status === 'present') return '#10b981';
        if (status === 'Absent' || status === 'absent') return '#ef4444';
        return '#94a3b8';
    };

    const getStatusBg = (status) => {
        if (status === 'Present' || status === 'present') return '#dcfce7';
        if (status === 'Absent' || status === 'absent') return '#fee2e2';
        return '#f1f5f9';
    };

    // Transform API data or use fallback
    const history = attendanceData?.recent_attendance?.map(record => ({
        date: new Date(record.date || record.login_time).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        }),
        event: record.meeting_name || 'Meeting',
        status: record.attended ? 'Present' : 'Absent'
    })) || [];

    const stats = attendanceData?.my_attendance || { attended: 0, total_meetings: 0, percentage: 0 };

    if (loading) {
        return (
            <DashboardCard title="My Attendance">
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '3rem 0',
                    color: isLight ? '#64748b' : 'rgba(255,255,255,0.5)'
                }}>
                    Loading...
                </div>
            </DashboardCard>
        );
    }

    // Theme colors
    const colors = {
        text: isLight ? '#1e293b' : '#ffffff',
        textMuted: isLight ? '#64748b' : 'rgba(255,255,255,0.5)',
        surface: isLight ? '#f8fafc' : 'rgba(255,255,255,0.05)',
        border: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)'
    };

    return (
        <DashboardCard
            title="My Attendance"
            headerAction={
                <button style={{
                    background: colors.surface,
                    color: colors.textMuted,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '0.375rem',
                    padding: '0.375rem 0.75rem',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                }}>
                    View All
                </button>
            }
        >
            {/* Stats Summary */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '0.75rem',
                marginBottom: '1.5rem'
            }}>
                <div style={{ background: colors.surface, padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                    <div style={{ color: colors.text, fontSize: '1.5rem', fontWeight: '700' }}>{stats.attended}</div>
                    <div style={{ color: colors.textMuted, fontSize: '0.75rem' }}>Attended</div>
                </div>
                <div style={{ background: colors.surface, padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                    <div style={{ color: colors.text, fontSize: '1.5rem', fontWeight: '700' }}>{stats.total_meetings}</div>
                    <div style={{ color: colors.textMuted, fontSize: '0.75rem' }}>Total</div>
                </div>
                <div style={{ background: '#dcfce7', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                    <div style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: '700' }}>{stats.percentage}%</div>
                    <div style={{ color: colors.textMuted, fontSize: '0.75rem' }}>Rate</div>
                </div>
            </div>

            {/* Recent History */}
            <div style={{ fontSize: '0.75rem', color: colors.textMuted, textTransform: 'uppercase', fontWeight: '600', marginBottom: '0.75rem' }}>
                Recent History
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {history.length > 0 ? history.slice(0, 5).map((record, i) => (
                    <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        background: colors.surface,
                        borderRadius: '0.5rem',
                        borderLeft: `3px solid ${getStatusColor(record.status)}`
                    }}>
                        <div>
                            <div style={{ color: colors.text, fontSize: '0.9rem', fontWeight: '600' }}>{record.event}</div>
                            <div style={{ color: colors.textMuted, fontSize: '0.75rem' }}>{record.date}</div>
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            color: getStatusColor(record.status),
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            background: getStatusBg(record.status),
                            padding: '0.25rem 0.75rem',
                            borderRadius: '1rem'
                        }}>
                            {record.status}
                        </div>
                    </div>
                )) : (
                    <div style={{ color: colors.textMuted, fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>
                        No attendance records yet
                    </div>
                )}
            </div>
        </DashboardCard>
    );
};

export default AttendanceWidget;
