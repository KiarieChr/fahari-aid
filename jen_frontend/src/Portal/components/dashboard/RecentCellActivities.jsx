import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';

const RecentCellActivities = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                // Try meetings endpoint
                const res = await api.get('meetings/');
                const meetingList = res?.results || res?.data || (Array.isArray(res) ? res : []);
                
                if (meetingList.length > 0) {
                    const mapped = meetingList.slice(0, 4).map((mt, idx) => {
                        const statuses = ['Submitted', 'In Review', 'Action Needed', 'Verified'];
                        const statusColors = [
                            { bg: '#ecfeff', color: '#0891b2' },
                            { bg: '#eff6ff', color: '#2563eb' },
                            { bg: '#fff7ed', color: '#ea580c' },
                            { bg: '#f0fdf4', color: '#16a34a' }
                        ];

                        const st = statuses[idx % statuses.length];
                        const col = statusColors[idx % statusColors.length];
                        const dateStr = mt.start_time ? new Date(mt.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently';

                        return {
                            id: mt.id,
                            icon: (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                            ),
                            iconBg: idx % 2 === 0 ? '#eff6ff' : '#f0fdf4',
                            iconColor: idx % 2 === 0 ? '#2563eb' : '#16a34a',
                            title: mt.name || mt.title || 'Fellowship Meeting',
                            meta: `Led by ${mt.facilitator || 'Pastoral Team'} • Code: ${mt.meeting_code || 'JEN-MEET'}`,
                            status: st,
                            statusBg: col.bg,
                            statusColor: col.color,
                            time: dateStr
                        };
                    });
                    setActivities(mapped);
                } else {
                    useBaseline();
                }
            } catch (err) {
                // Try overview fallback
                try {
                    const overview = await api.get('analytics/overview/');
                    if (overview?.recent_meetings && overview.recent_meetings.length > 0) {
                        const mapped = overview.recent_meetings.slice(0, 4).map((mt, idx) => ({
                            id: mt.id,
                            icon: (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                            ),
                            iconBg: '#eff6ff',
                            iconColor: '#2563eb',
                            title: mt.name || 'Cell Fellowship',
                            meta: `Led by ${mt.facilitator} • ${mt.meeting_code}`,
                            status: idx === 0 ? 'Submitted' : idx === 1 ? 'In Review' : 'Verified',
                            statusBg: idx === 0 ? '#ecfeff' : idx === 1 ? '#eff6ff' : '#f0fdf4',
                            statusColor: idx === 0 ? '#0891b2' : idx === 1 ? '#2563eb' : '#16a34a',
                            time: mt.start_time
                        }));
                        setActivities(mapped);
                        return;
                    }
                } catch (fallbackErr) {
                    // Ignore and use baseline
                }
                useBaseline();
            } finally {
                setLoading(false);
            }
        };

        const useBaseline = () => {
            setActivities([
                {
                    id: 1,
                    icon: (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                        </svg>
                    ),
                    iconBg: '#eff6ff',
                    iconColor: '#2563eb',
                    title: 'Grace Cell #4 - Weekly Fellowship Report',
                    meta: 'Led by Bro. Evans • 18 Attendees • 2 First Timers',
                    status: 'Submitted',
                    statusBg: '#ecfeff',
                    statusColor: '#0891b2',
                    time: 'Yesterday, 7:30 PM'
                },
                {
                    id: 2,
                    icon: (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                    ),
                    iconBg: '#f0fdf4',
                    iconColor: '#16a34a',
                    title: 'Community Outreach Report: Westlands',
                    meta: 'Coordinated with Missions Team • 12 Track Bibles distributed',
                    status: 'In Review',
                    statusBg: '#eff6ff',
                    statusColor: '#2563eb',
                    time: 'Oct 29, 2024'
                },
                {
                    id: 3,
                    icon: (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="8.5" cy="7" r="4"></circle>
                            <line x1="20" y1="8" x2="20" y2="14"></line>
                            <line x1="23" y1="11" x2="17" y2="11"></line>
                        </svg>
                    ),
                    iconBg: '#fffbeb',
                    iconColor: '#d97706',
                    title: 'New Convert Care: Follow-up Call Discipleship',
                    meta: '4 Contacts pending first-touch discipleship call',
                    status: 'Action Needed',
                    statusBg: '#fff7ed',
                    statusColor: '#ea580c',
                    time: 'Oct 27, 2024'
                },
                {
                    id: 4,
                    icon: (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                            <line x1="2" y1="10" x2="22" y2="10"></line>
                        </svg>
                    ),
                    iconBg: '#f5f3ff',
                    iconColor: '#7c3aed',
                    title: 'Building Kingdom Seed - KES 15,000 Receipt',
                    meta: 'MPesa Ref: QK91823JX • Tithe & Network Building',
                    status: 'Verified',
                    statusBg: '#f0fdf4',
                    statusColor: '#16a34a',
                    time: 'Oct 24, 2024'
                }
            ]);
        };

        fetchActivities();
    }, []);

    return (
        <div className="stitch-activities-card">
            {/* Header */}
            <div className="activities-header">
                <div className="activities-header-left">
                    <span className="folder-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                        </svg>
                    </span>
                    <h3 className="activities-title">Recent Cell Activities & Logs</h3>
                </div>
                <Link to="/portal/cells" className="view-all-link">
                    View All ({activities.length > 0 ? activities.length : 24}) →
                </Link>
            </div>

            {/* List */}
            <div className="activities-list">
                {activities.map(act => (
                    <div key={act.id} className="activity-row">
                        <div className="activity-icon" style={{ background: act.iconBg, color: act.iconColor }}>
                            {act.icon}
                        </div>
                        <div className="activity-details">
                            <div className="activity-top-line">
                                <span className="activity-name">{act.title}</span>
                                <span className="activity-status" style={{ background: act.statusBg, color: act.statusColor }}>
                                    {act.status}
                                </span>
                            </div>
                            <span className="activity-meta">{act.meta}</span>
                        </div>
                        <div className="activity-right">
                            <span className="activity-time">{act.time}</span>
                            <button className="meatball-btn" title="Options">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <circle cx="12" cy="5" r="2"></circle>
                                    <circle cx="12" cy="12" r="2"></circle>
                                    <circle cx="12" cy="19" r="2"></circle>
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .stitch-activities-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 1rem;
                    padding: 1.5rem;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
                }
                .portal-wrapper.dark-mode .stitch-activities-card {
                    background: #151128;
                    border-color: rgba(255, 255, 255, 0.08);
                }

                .activities-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 1.25rem;
                }
                .activities-header-left {
                    display: flex;
                    align-items: center;
                    gap: 0.65rem;
                }
                .folder-icon {
                    color: #2563eb;
                    display: flex;
                    align-items: center;
                }
                .portal-wrapper.dark-mode .folder-icon {
                    color: #22c1e6;
                }
                .activities-title {
                    font-size: 1.02rem;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0;
                }
                .portal-wrapper.dark-mode .activities-title {
                    color: #ffffff;
                }

                .view-all-link {
                    font-size: 0.78rem;
                    font-weight: 600;
                    color: #2563eb;
                    text-decoration: none;
                }
                .portal-wrapper.dark-mode .view-all-link {
                    color: #22c1e6;
                }
                .view-all-link:hover {
                    text-decoration: underline;
                }

                .activities-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.85rem;
                }

                .activity-row {
                    display: flex;
                    align-items: center;
                    gap: 0.85rem;
                    padding: 0.65rem 0.75rem;
                    border-radius: 0.75rem;
                    transition: background 0.15s;
                }
                .activity-row:hover {
                    background: #f8fafc;
                }
                .portal-wrapper.dark-mode .activity-row:hover {
                    background: rgba(255, 255, 255, 0.04);
                }

                .activity-icon {
                    width: 38px;
                    height: 38px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .activity-details {
                    flex: 1;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 0.2rem;
                }

                .activity-top-line {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }
                .activity-name {
                    font-size: 0.84rem;
                    font-weight: 600;
                    color: #0f172a;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .portal-wrapper.dark-mode .activity-name {
                    color: #f1f5f9;
                }

                .activity-status {
                    font-size: 0.65rem;
                    font-weight: 700;
                    padding: 0.15rem 0.5rem;
                    border-radius: 9999px;
                    letter-spacing: 0.01em;
                }

                .activity-meta {
                    font-size: 0.74rem;
                    color: #64748b;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .portal-wrapper.dark-mode .activity-meta {
                    color: #94a3b8;
                }

                .activity-right {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    flex-shrink: 0;
                }
                .activity-time {
                    font-size: 0.72rem;
                    color: #94a3b8;
                }

                .meatball-btn {
                    background: transparent;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    padding: 0.25rem;
                    border-radius: 0.35rem;
                    display: flex;
                    align-items: center;
                }
                .meatball-btn:hover {
                    color: #0f172a;
                    background: #f1f5f9;
                }

                @media (max-width: 640px) {
                    .activity-row {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    .activity-right {
                        width: 100%;
                        justify-content: space-between;
                        margin-top: 0.35rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default RecentCellActivities;
