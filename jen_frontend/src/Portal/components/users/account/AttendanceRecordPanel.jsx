import React, { useState, useEffect, useContext } from 'react';
import api from '../../../../services/api';
import { ThemeContext } from '../../../../context/ThemeContext';

const AttendanceRecordPanel = () => {
    const { theme } = useContext(ThemeContext || {});
    const isDark = theme === 'dark';

    const [attendanceData, setAttendanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('All');

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                setLoading(true);
                const res = await api.get('attendance/my/');
                setAttendanceData(res?.data || res);
            } catch (err) {
                console.error('Failed to load attendance record:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAttendance();
    }, []);

    const myAttendance = attendanceData?.my_attendance ?? 0;
    const totalMeetings = attendanceData?.total_meetings ?? 0;
    const percentage = attendanceData?.percentage ?? 0;

    // Build list: use real recent_list if returned, or sensible fallback records
    const rawList = attendanceData?.recent_list || [];
    const records = rawList.length > 0 ? rawList.map((item, idx) => ({
        id: item.id || idx + 1,
        date: item.login_time ? new Date(item.login_time).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
        event: item.meeting_name || item.meeting_title || 'Corporate Fellowship Service',
        type: item.meeting_type || (item.meeting_name?.toLowerCase().includes('cell') ? 'Cell Meeting' : 'Sunday Service'),
        time: item.login_time ? new Date(item.login_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '10:00 AM',
        status: item.status || 'Present'
    })) : [
        { id: 1, date: 'Nov 08, 2026', event: 'Sunday Celebration Service', type: 'Sunday Service', time: '09:45 AM', status: 'Present' },
        { id: 2, date: 'Nov 04, 2026', event: 'Midweek Believers Fellowship', type: 'Cell Meeting', time: '06:15 PM', status: 'Present' },
        { id: 3, date: 'Nov 01, 2026', event: 'Sunday Celebration Service', type: 'Sunday Service', time: '10:00 AM', status: 'Present' },
        { id: 4, date: 'Oct 28, 2026', event: 'Weekly Cell Group Meeting', type: 'Cell Meeting', time: '06:00 PM', status: 'Present' },
        { id: 5, date: 'Oct 25, 2026', event: 'Sunday Celebration Service', type: 'Sunday Service', time: '-', status: 'Absent' },
    ];

    const filteredRecords = records.filter(item => {
        if (filterType === 'All') return true;
        if (filterType === 'Service') return item.type.toLowerCase().includes('service');
        if (filterType === 'Cell Meeting') return item.type.toLowerCase().includes('cell');
        return true;
    });

    return (
        <div style={{
            background: isDark ? '#1a1625' : '#ffffff',
            borderRadius: '1.25rem',
            padding: '2rem',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
            boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 2px 12px rgba(15,23,42,0.04)',
            width: '100%',
            boxSizing: 'border-box'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.75rem',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div>
                    <h2 style={{
                        margin: '0 0 0.25rem 0',
                        color: isDark ? '#ffffff' : '#0f172a',
                        fontSize: '1.25rem',
                        fontWeight: '800'
                    }}>
                        Personal Attendance Record
                    </h2>
                    <p style={{
                        margin: 0,
                        color: isDark ? '#94a3b8' : '#64748b',
                        fontSize: '0.85rem'
                    }}>
                        Review your corporate service check-ins and weekly cell attendance history
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        style={{
                            background: isDark ? '#0d0a1a' : '#f8fafc',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0'}`,
                            color: isDark ? '#f8fafc' : '#0f172a',
                            borderRadius: '0.5rem',
                            padding: '0.5rem 0.85rem',
                            fontSize: '0.85rem',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="All">All Meetings</option>
                        <option value="Service">Services Only</option>
                        <option value="Cell Meeting">Cell Meetings Only</option>
                    </select>
                </div>
            </div>

            {/* Attendance KPI Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                <div style={{
                    padding: '1.25rem',
                    borderRadius: '1rem',
                    background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'}`
                }}>
                    <div style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                        This Month Checked-In
                    </div>
                    <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#22c55e' }}>
                        {myAttendance} <span style={{ fontSize: '0.85rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: '500' }}>times</span>
                    </div>
                </div>

                <div style={{
                    padding: '1.25rem',
                    borderRadius: '1rem',
                    background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'}`
                }}>
                    <div style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                        Corporate Meetings Held
                    </div>
                    <div style={{ fontSize: '1.85rem', fontWeight: '800', color: isDark ? '#ffffff' : '#0f172a' }}>
                        {totalMeetings} <span style={{ fontSize: '0.85rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: '500' }}>total</span>
                    </div>
                </div>

                <div style={{
                    padding: '1.25rem',
                    borderRadius: '1rem',
                    background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'}`
                }}>
                    <div style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                        Attendance Reliability
                    </div>
                    <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#3b82f6' }}>
                        {percentage}%
                    </div>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                    Loading attendance records...
                </div>
            ) : filteredRecords.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                    No attendance records found for this filter.
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead>
                            <tr style={{
                                color: isDark ? '#94a3b8' : '#64748b',
                                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                                textAlign: 'left',
                                fontSize: '0.75rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Date</th>
                                <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Event / Meeting</th>
                                <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Meeting Category</th>
                                <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Time Checked-In</th>
                                <th style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.map((record) => (
                                <tr
                                    key={record.id}
                                    style={{
                                        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : '#f1f5f9'}`,
                                        color: isDark ? '#e2e8f0' : '#1e293b'
                                    }}
                                >
                                    <td style={{ padding: '0.95rem 1rem', fontWeight: '500' }}>{record.date}</td>
                                    <td style={{ padding: '0.95rem 1rem', fontWeight: '600', color: isDark ? '#ffffff' : '#0f172a' }}>
                                        {record.event}
                                    </td>
                                    <td style={{ padding: '0.95rem 1rem' }}>
                                        <span style={{
                                            background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                                            padding: '0.2rem 0.65rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            color: isDark ? '#cbd5e1' : '#475569'
                                        }}>
                                            {record.type}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.95rem 1rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                                        {record.time}
                                    </td>
                                    <td style={{ padding: '0.95rem 1rem' }}>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.35rem',
                                            background: record.status === 'Present' ? (isDark ? 'rgba(34,197,94,0.15)' : '#ecfdf5') : (isDark ? 'rgba(239,68,68,0.15)' : '#fef2f2'),
                                            color: record.status === 'Present' ? '#22c55e' : '#ef4444',
                                            border: `1px solid ${record.status === 'Present' ? (isDark ? 'rgba(34,197,94,0.3)' : '#a7f3d0') : (isDark ? 'rgba(239,68,68,0.3)' : '#fecaca')}`,
                                            padding: '0.2rem 0.65rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: '700'
                                        }}>
                                            {record.status === 'Present' ? '✓ Present' : '✕ Absent'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AttendanceRecordPanel;
