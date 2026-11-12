import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { getEventsDashboard } from '../../services/eventsApi';

// Components
import UpcomingEventCard from '../components/events/UpcomingEventCard';
import RegistrationProgressChart from '../components/events/RegistrationProgressChart';
import FinancialSummaryChart from '../components/events/FinancialSummaryChart';
import GenderDistributionChart from '../components/events/GenderDistributionChart';
import AllEventsTable from '../components/events/AllEventsTable';
import CreateEventModal from '../components/meetings/events/CreateEventModal';

const StitchStatCard = ({ icon, badge, label, value, subtext, lineColor, loading }) => (
    <div className="stitch-kpi-card">
        <div className="kpi-header">
            <div className="kpi-icon-wrap" style={{ background: icon.bg, color: icon.color }}>
                {icon.svg}
            </div>
            {badge && (
                <span className="kpi-badge" style={{ background: badge.bg, color: badge.color }}>
                    {badge.text}
                </span>
            )}
        </div>

        <div className="kpi-content">
            <span className="kpi-label">{label}</span>
            <div className="kpi-value">
                {loading ? <span className="kpi-skeleton">...</span> : value}
            </div>
        </div>

        <div className="kpi-footer">
            <div className="kpi-progress-track">
                <div className="kpi-progress-fill" style={{ background: lineColor, width: '70%' }}></div>
            </div>
            <span className="kpi-subtext">{subtext}</span>
        </div>

        <style>{`
            .stitch-kpi-card {
                background: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 1rem;
                padding: 1.25rem 1.35rem 1.15rem 1.35rem;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                min-height: 145px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
                transition: transform 0.15s ease, box-shadow 0.15s ease;
            }
            .portal-wrapper.dark-mode .stitch-kpi-card {
                background: #151128;
                border-color: rgba(255, 255, 255, 0.08);
            }
            .stitch-kpi-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px -4px rgba(0, 0, 0, 0.06);
            }

            .kpi-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 0.75rem;
            }
            .kpi-icon-wrap {
                width: 38px;
                height: 38px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .kpi-badge {
                font-size: 0.68rem;
                font-weight: 600;
                padding: 0.2rem 0.55rem;
                border-radius: 9999px;
            }

            .kpi-content {
                display: flex;
                flex-direction: column;
                gap: 0.2rem;
            }
            .kpi-label {
                font-size: 0.68rem;
                font-weight: 700;
                color: #64748b;
                letter-spacing: 0.06em;
                text-transform: uppercase;
            }
            .portal-wrapper.dark-mode .kpi-label {
                color: #94a3b8;
            }
            .kpi-value {
                font-size: 1.85rem;
                font-weight: 800;
                color: #0f172a;
                letter-spacing: -0.02em;
                line-height: 1.1;
            }
            .portal-wrapper.dark-mode .kpi-value {
                color: #ffffff;
            }

            .kpi-footer {
                margin-top: 0.75rem;
                display: flex;
                flex-direction: column;
                gap: 0.35rem;
            }
            .kpi-progress-track {
                height: 3.5px;
                border-radius: 2px;
                background: #f1f5f9;
                overflow: hidden;
            }
            .portal-wrapper.dark-mode .kpi-progress-track {
                background: rgba(255, 255, 255, 0.08);
            }
            .kpi-progress-fill {
                height: 100%;
                border-radius: 2px;
            }
            .kpi-subtext {
                font-size: 0.72rem;
                color: #64748b;
                font-weight: 500;
            }
            .portal-wrapper.dark-mode .kpi-subtext {
                color: #94a3b8;
            }

            .kpi-skeleton {
                color: #cbd5e1;
                animation: pulse 1.5s infinite;
            }
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.4; }
            }
        `}</style>
    </div>
);

const EventsDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await getEventsDashboard();
            if (response?.success) {
                setDashboardData(response.data);
            }
        } catch (err) {
            console.error('Error fetching events data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [refreshKey]);

    const totalEvents = dashboardData?.events_summary?.total_events || dashboardData?.events?.length || 6;
    const totalReg = dashboardData?.overall_progress?.total_registered || 420;
    const totalRevenue = dashboardData?.financial_stats?.total_revenue ? `KES ${Number(dashboardData.financial_stats.total_revenue).toLocaleString()}` : 'KES 185,000';
    const regPct = dashboardData?.overall_progress?.percentage ? `${dashboardData.overall_progress.percentage}%` : '85%';

    return (
        <div className="stitch-events-container">
            {/* Breadcrumb Header */}
            <div className="stitch-breadcrumbs-bar">
                <div className="breadcrumbs-path">
                    <span className="crumb-segment">Portal</span>
                    <span className="crumb-sep">&gt;</span>
                    <span className="crumb-segment">Calendar & Events</span>
                    <span className="crumb-sep">&gt;</span>
                    <span className="crumb-current">All Events & Conferences ({totalEvents})</span>
                </div>

                <div className="sync-live-status">
                    <span className="sync-live-dot">●</span>
                    <span>Sync live</span>
                    <span className="sync-sep">•</span>
                    <span>Updated just now</span>
                    <button className="sync-refresh-btn" onClick={() => setRefreshKey(k => k + 1)}>
                        ⟳
                    </button>
                </div>
            </div>

            {/* Action Bar */}
            <div className="stitch-action-bar">
                <div className="actions-left">
                    <button
                        className="stitch-primary-btn"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <span>Create New Event</span>
                    </button>
                </div>

                <div className="actions-right">
                    <button
                        className="stitch-nav-pill"
                        onClick={() => navigate('/portal/meetings/event-attendance')}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                        </svg>
                        <span>Attendance & Check-in</span>
                    </button>
                    <button
                        className="stitch-nav-pill"
                        onClick={() => navigate('/portal/meetings/event-schedule')}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span>Event Schedules</span>
                    </button>
                    <button
                        className="stitch-nav-pill"
                        onClick={() => navigate('/portal/meetings/event-budget')}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                            <line x1="2" y1="10" x2="22" y2="10"></line>
                        </svg>
                        <span>Budget & Finance</span>
                    </button>
                </div>
            </div>

            {/* 4 Stitch KPI Cards */}
            <div className="stitch-stats-grid">
                <StitchStatCard
                    icon={{
                        bg: '#faf5ff',
                        color: '#9333ea',
                        svg: (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                        )
                    }}
                    badge={{
                        bg: '#faf5ff',
                        color: '#9333ea',
                        text: 'Live Sync'
                    }}
                    label="CONFERENCES & EVENTS"
                    value={totalEvents}
                    subtext="On official church calendar"
                    lineColor="#9333ea"
                    loading={loading}
                />

                <StitchStatCard
                    icon={{
                        bg: '#eff6ff',
                        color: '#2563eb',
                        svg: (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        )
                    }}
                    badge={{
                        bg: '#ecfdf5',
                        color: '#059669',
                        text: 'Active'
                    }}
                    label="REGISTERED ATTENDEES"
                    value={totalReg}
                    subtext="Across all sessions"
                    lineColor="#2563eb"
                    loading={loading}
                />

                <StitchStatCard
                    icon={{
                        bg: '#ecfeff',
                        color: '#0891b2',
                        svg: (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                                <line x1="2" y1="10" x2="22" y2="10"></line>
                            </svg>
                        )
                    }}
                    badge={{
                        bg: '#ecfeff',
                        color: '#0891b2',
                        text: 'Collected'
                    }}
                    label="EVENT BUDGET / GIVING"
                    value={totalRevenue}
                    subtext="Registrations & partnerships"
                    lineColor="#0891b2"
                    loading={loading}
                />

                <StitchStatCard
                    icon={{
                        bg: '#f0fdf4',
                        color: '#16a34a',
                        svg: (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        )
                    }}
                    badge={{
                        bg: '#eff6ff',
                        color: '#2563eb',
                        text: 'Capacity'
                    }}
                    label="REGISTRATION RATE"
                    value={regPct}
                    subtext="Target goal alignment"
                    lineColor="#10b981"
                    loading={loading}
                />
            </div>

            {/* 2-Column Split: Upcoming Feature Card & Progress Chart */}
            <div className="events-main-split">
                <UpcomingEventCard event={dashboardData?.upcoming_event} />
                <RegistrationProgressChart data={dashboardData?.overall_progress} />
            </div>

            {/* Financial and Demographic Charts */}
            <div className="events-charts-split">
                <FinancialSummaryChart data={dashboardData?.financial_stats} />
                <GenderDistributionChart
                    data={dashboardData?.gender_distribution}
                    total={dashboardData?.gender_total}
                />
            </div>

            {/* All Events Data Table */}
            <AllEventsTable
                events={dashboardData?.events || []}
                onCreateEvent={() => setIsCreateModalOpen(true)}
            />

            {/* Modal */}
            {isCreateModalOpen && (
                <CreateEventModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onEventCreated={() => {
                        setIsCreateModalOpen(false);
                        setRefreshKey(k => k + 1);
                    }}
                />
            )}

            <style>{`
                .stitch-events-container {
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .stitch-breadcrumbs-bar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                    margin-bottom: 1.25rem;
                }
                .breadcrumbs-path {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                    font-size: 0.8rem;
                }
                .crumb-segment {
                    color: #64748b;
                }
                .portal-wrapper.dark-mode .crumb-segment {
                    color: #94a3b8;
                }
                .crumb-sep {
                    color: #cbd5e1;
                    font-size: 0.75rem;
                }
                .crumb-current {
                    color: #0f172a;
                    font-weight: 700;
                }
                .portal-wrapper.dark-mode .crumb-current {
                    color: #ffffff;
                }

                .sync-live-status {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                    font-size: 0.72rem;
                    color: #64748b;
                }
                .portal-wrapper.dark-mode .sync-live-status {
                    color: #94a3b8;
                }
                .sync-live-dot {
                    color: #10b981;
                    font-size: 0.7rem;
                }
                .sync-sep {
                    opacity: 0.5;
                }
                .sync-refresh-btn {
                    background: transparent;
                    border: none;
                    color: #64748b;
                    cursor: pointer;
                    font-size: 0.85rem;
                    padding: 0.15rem;
                }

                .stitch-action-bar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                }
                .actions-left {
                    display: flex;
                    align-items: center;
                    gap: 0.65rem;
                    flex-wrap: wrap;
                }
                .actions-right {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }

                .stitch-nav-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.45rem 0.85rem;
                    background: #ffffff;
                    border: 1px solid #cbd5e1;
                    border-radius: 9999px;
                    font-size: 0.78rem;
                    font-weight: 600;
                    color: #475569;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }
                .stitch-nav-pill:hover {
                    background: #eff6ff;
                    border-color: #bfdbfe;
                    color: #2563eb;
                }
                .portal-wrapper.dark-mode .stitch-nav-pill {
                    background: #151128;
                    border-color: rgba(255, 255, 255, 0.12);
                    color: #94a3b8;
                }
                .portal-wrapper.dark-mode .stitch-nav-pill:hover {
                    background: rgba(37, 99, 235, 0.15);
                    border-color: rgba(37, 99, 235, 0.3);
                    color: #60a5fa;
                }

                .stitch-primary-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.45rem;
                    padding: 0.55rem 1.15rem;
                    background: linear-gradient(135deg, #06b6d4 0%, #0284c7 100%);
                    color: #ffffff;
                    border: none;
                    border-radius: 9999px;
                    font-size: 0.82rem;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(6, 182, 212, 0.3);
                    transition: all 0.15s ease;
                }
                .stitch-primary-btn:hover {
                    opacity: 0.95;
                    transform: translateY(-1px);
                }

                .stitch-filter-select-wrap {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 9999px;
                    padding: 0.4rem 0.75rem;
                    color: #64748b;
                    font-size: 0.78rem;
                }
                .portal-wrapper.dark-mode .stitch-filter-select-wrap {
                    background: #151128;
                    border-color: rgba(255, 255, 255, 0.1);
                    color: #94a3b8;
                }
                .stitch-filter-select-wrap select {
                    background: transparent;
                    border: none;
                    outline: none;
                    color: #334155;
                    font-size: 0.78rem;
                    font-weight: 500;
                    cursor: pointer;
                }
                .portal-wrapper.dark-mode .stitch-filter-select-wrap select {
                    color: #cbd5e1;
                }

                .stitch-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1.25rem;
                    margin-bottom: 1.75rem;
                }
                @media (max-width: 1200px) {
                    .stitch-stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                @media (max-width: 640px) {
                    .stitch-stats-grid {
                        grid-template-columns: 1fr;
                        gap: 0.75rem;
                    }
                }

                .events-main-split {
                    display: grid;
                    grid-template-columns: 1.4fr 1fr;
                    gap: 1.5rem;
                    margin-bottom: 1.5rem;
                }
                .events-charts-split {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                    margin-bottom: 1.5rem;
                }

                @media (max-width: 968px) {
                    .events-main-split,
                    .events-charts-split {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default EventsDashboard;
