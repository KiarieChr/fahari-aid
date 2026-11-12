import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import GreetingCard from '../components/dashboard/GreetingCard';
import StatsGrid from '../components/dashboard/StatsGrid';
import DashboardTabs from '../components/dashboard/DashboardTabs';

// Admin / Corporate Charts & Cards
import AttendanceTrendChart from '../components/dashboard/charts/AttendanceTrendChart';
import RecentCellActivities from '../components/dashboard/RecentCellActivities';
import ParticipationHealthChart from '../components/dashboard/charts/ParticipationHealthChart';
import UpcomingFellowshipsCard from '../components/dashboard/UpcomingFellowshipsCard';
import DailyDevotionalCard from '../components/dashboard/DailyDevotionalCard';

// Church Member Personalized Cards
import PersonalAttendanceJourneyChart from '../components/dashboard/charts/PersonalAttendanceJourneyChart';
import MyCellFellowshipCard from '../components/dashboard/MyCellFellowshipCard';
import PersonalGivingSummaryCard from '../components/dashboard/PersonalGivingSummaryCard';

// Cell Leader Cards
import CellAttendanceTrendChart from '../components/dashboard/charts/CellAttendanceTrendChart';

// Assimilation Team Cards
import AssimilationProgressionChart from '../components/dashboard/charts/AssimilationProgressionChart';
import RecentFirstTimersQueue from '../components/dashboard/RecentFirstTimersQueue';

// Other tab widgets
import CellOverviewWidget from '../components/dashboard/CellOverviewWidget';
import CellEngagementChart from '../components/dashboard/charts/CellEngagementChart';
import PartnershipTierWidget from '../components/dashboard/PartnershipTierWidget';
import GivingProgressChart from '../components/dashboard/charts/GivingProgressChart';
import ContributionHistoryWidget from '../components/dashboard/ContributionHistoryWidget';
import PledgesWidget from '../components/dashboard/PledgesWidget';
import BirthdayCard from '../components/dashboard/BirthdayCard';
import BirthdaysWidget from '../components/dashboard/BirthdaysWidget';

const Dashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Determine natural role from user data
    const naturalRole = user?.dashboard_role || (
        user?.is_superuser || user?.is_staff || user?.role?.includes('Admin')
            ? 'admin'
            : user?.role?.includes('Coordinator')
            ? 'dc_coordinator'
            : user?.role?.includes('Cell Leader') || user?.cell_info?.is_leader
            ? 'cell_leader'
            : user?.role?.includes('Assimilation') || user?.role?.includes('Follow')
            ? 'assimilation'
            : 'member'
    );

    // Superusers & Staff can toggle role views to preview each persona's experience live
    const isStaffOrSuperuser = Boolean(user?.is_superuser || user?.is_staff);
    const [selectedRoleView, setSelectedRoleView] = useState(naturalRole);

    // Keep role in sync if naturalRole loads after mount
    useEffect(() => {
        if (!selectedRoleView || selectedRoleView === 'member') {
            setSelectedRoleView(naturalRole);
        }
    }, [naturalRole]);

    const effectiveRole = isStaffOrSuperuser ? selectedRoleView : naturalRole;

    // Fetch role-scoped analytics data
    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        const fetchRoleData = async () => {
            try {
                const response = await api.get(`analytics/overview/?as_role=${effectiveRole}`);
                if (isMounted && response) {
                    setAnalyticsData(response);
                }
            } catch (err) {
                console.warn('Failed to load role analytics, using default fallback:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchRoleData();
        return () => { isMounted = false; };
    }, [effectiveRole]);

    return (
        <div className="stitch-dashboard-container">
            {/* Super Admin & Staff Live Role Preview Switcher */}
            {isStaffOrSuperuser && (
                <div className="role-preview-bar">
                    <div className="preview-label-group">
                        <span className="preview-icon">👁️</span>
                        <div>
                            <span className="preview-heading">Role Dashboard View:</span>
                            <span className="preview-sub">Switch perspective to inspect role permissions</span>
                        </div>
                    </div>
                    <div className="role-btn-group">
                        <button
                            className={`role-pill-btn ${effectiveRole === 'admin' ? 'active' : ''}`}
                            onClick={() => setSelectedRoleView('admin')}
                        >
                            👑 Corporate Admin
                        </button>
                        <button
                            className={`role-pill-btn ${effectiveRole === 'cell_leader' ? 'active' : ''}`}
                            onClick={() => setSelectedRoleView('cell_leader')}
                        >
                            👥 Cell Leader
                        </button>
                        <button
                            className={`role-pill-btn ${effectiveRole === 'assimilation' ? 'active' : ''}`}
                            onClick={() => setSelectedRoleView('assimilation')}
                        >
                            🕊️ Assimilation Team
                        </button>
                        <button
                            className={`role-pill-btn ${effectiveRole === 'member' ? 'active' : ''}`}
                            onClick={() => setSelectedRoleView('member')}
                        >
                            👤 Church Member
                        </button>
                    </div>
                </div>
            )}

            {/* Live Greeting & Actions Bar */}
            <GreetingCard role={effectiveRole} />

            {/* Top KPI Cards (Automatically hidden for Church Members) */}
            <StatsGrid
                role={effectiveRole}
                analyticsData={analyticsData}
                loading={loading}
            />

            {/* Dashboard Navigation Tabs */}
            <DashboardTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Tab Contents */}
            {activeTab === 'dashboard' ? (
                <div className="stitch-main-2col-grid">
                    {/* Left Column (approx 65% width) */}
                    <div className="stitch-col-left">
                        {/* 1. Normal Church Member View */}
                        {effectiveRole === 'member' ? (
                            <>
                                <PersonalAttendanceJourneyChart
                                    journey={analyticsData?.my_journey}
                                />
                                <MyCellFellowshipCard
                                    cell={analyticsData?.my_journey?.my_cell || user?.cell_info}
                                />
                            </>
                        ) : effectiveRole === 'cell_leader' ? (
                            /* 2. Cell Leader View */
                            <>
                                <CellAttendanceTrendChart
                                    cellData={analyticsData?.cell_data}
                                />
                                <RecentCellActivities
                                    cellData={analyticsData?.cell_data}
                                />
                            </>
                        ) : effectiveRole === 'assimilation' ? (
                            /* 3. Assimilation & Follow-up View */
                            <>
                                <AssimilationProgressionChart
                                    data={analyticsData?.assimilation_data}
                                />
                                <RecentFirstTimersQueue
                                    data={analyticsData?.assimilation_data}
                                />
                            </>
                        ) : (
                            /* 4. Corporate Admin & DC Coordinator View */
                            <>
                                <AttendanceTrendChart />
                                <RecentCellActivities />
                            </>
                        )}
                    </div>

                    {/* Right Column (approx 35% width) */}
                    <div className="stitch-col-right">
                        {effectiveRole === 'member' ? (
                            <>
                                <DailyDevotionalCard />
                                <UpcomingFellowshipsCard />
                                <PersonalGivingSummaryCard />
                            </>
                        ) : effectiveRole === 'cell_leader' || effectiveRole === 'assimilation' ? (
                            <>
                                <UpcomingFellowshipsCard />
                                <DailyDevotionalCard />
                            </>
                        ) : (
                            <>
                                <ParticipationHealthChart />
                                <UpcomingFellowshipsCard />
                                <DailyDevotionalCard />
                            </>
                        )}
                    </div>
                </div>
            ) : activeTab === 'cell' ? (
                <div className="cell-tab-grid">
                    <div style={{ marginBottom: '1.5rem' }}>
                        <CellEngagementChart />
                    </div>
                    <div>
                        <CellOverviewWidget />
                    </div>
                </div>
            ) : activeTab === 'partnership' ? (
                <div className="partnership-grid">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <PartnershipTierWidget />
                        <GivingProgressChart />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <ContributionHistoryWidget />
                        <PledgesWidget />
                    </div>
                </div>
            ) : activeTab === 'birthday' ? (
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <BirthdayCard />
                </div>
            ) : activeTab === 'upcoming' ? (
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <BirthdaysWidget />
                </div>
            ) : null}

            <style>{`
                .stitch-dashboard-container {
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .role-preview-bar {
                    background: linear-gradient(135deg, rgba(37, 99, 235, 0.05), rgba(16, 185, 129, 0.05));
                    border: 1px solid rgba(37, 99, 235, 0.15);
                    border-radius: 1rem;
                    padding: 0.75rem 1.25rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                    margin-bottom: 1.25rem;
                }
                .portal-wrapper.dark-mode .role-preview-bar {
                    background: rgba(255, 255, 255, 0.03);
                    border-color: rgba(255, 255, 255, 0.1);
                }
                .preview-label-group {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                }
                .preview-icon {
                    font-size: 1.25rem;
                }
                .preview-heading {
                    font-size: 0.85rem;
                    font-weight: 800;
                    color: #0f172a;
                    display: block;
                }
                .portal-wrapper.dark-mode .preview-heading {
                    color: #f8fafc;
                }
                .preview-sub {
                    font-size: 0.72rem;
                    color: #64748b;
                }

                .role-btn-group {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }
                .role-pill-btn {
                    padding: 0.4rem 0.85rem;
                    border-radius: 9999px;
                    font-size: 0.78rem;
                    font-weight: 700;
                    border: 1px solid #e2e8f0;
                    background: #ffffff;
                    color: #475569;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }
                .portal-wrapper.dark-mode .role-pill-btn {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.1);
                    color: #cbd5e1;
                }
                .role-pill-btn:hover {
                    border-color: #2563eb;
                    color: #2563eb;
                }
                .role-pill-btn.active {
                    background: #2563eb;
                    color: #ffffff;
                    border-color: #2563eb;
                    box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
                }

                .stitch-main-2col-grid {
                    display: grid;
                    grid-template-columns: 1.8fr 1fr;
                    gap: 1.5rem;
                    align-items: flex-start;
                }

                .stitch-col-left {
                    display: flex;
                    flex-direction: column;
                }

                .stitch-col-right {
                    display: flex;
                    flex-direction: column;
                }

                @media (max-width: 1080px) {
                    .stitch-main-2col-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;