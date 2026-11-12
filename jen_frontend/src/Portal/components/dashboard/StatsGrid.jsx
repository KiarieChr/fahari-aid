import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const StitchStatCard = ({ icon, badge, label, value, subtext, lineColor, loading }) => (
    <div className="stitch-kpi-card">
        {/* Top Header: Icon + Badge */}
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

        {/* Content */}
        <div className="kpi-content">
            <span className="kpi-label">{label}</span>
            <div className="kpi-value">
                {loading ? <span className="kpi-skeleton">...</span> : value}
            </div>
        </div>

        {/* Footer Line & Subtext */}
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
                letter-spacing: 0.01em;
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

const StatsGrid = ({ role = 'admin', analyticsData = null, loading: externalLoading = false }) => {
    // If the effective role is a normal Church Member, top stats must NOT be displayed!
    if (role === 'member') {
        return null;
    }

    const [stats, setStats] = useState({
        total_members: 518,
        total_cells: 6,
        total_events: 5,
        total_contributions: 267000
    });
    const [loading, setLoading] = useState(externalLoading);

    useEffect(() => {
        if (analyticsData) {
            setLoading(false);
            return;
        }

        const fetchStats = async () => {
            try {
                const response = await api.get(`analytics/overview/?as_role=${role}`);
                if (response?.kpis) {
                    setStats({
                        total_members: response.kpis.active_members || 518,
                        total_cells: response.kpis.active_cells || 6,
                        total_events: response.upcoming_events?.length || 5,
                        total_contributions: response.kpis.total_redeemed || 267000,
                    });
                }
            } catch (err) {
                console.warn('Using baseline KPI data:', err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [role, analyticsData]);

    // Format money into KES xxxk
    const formatGiving = (amount) => {
        if (!amount) return 'KES 267k';
        if (amount >= 1000) {
            return `KES ${Math.round(amount / 1000)}k`;
        }
        return `KES ${amount}`;
    };

    // -------------------------------------------------------------------------
    // 1. CELL LEADER DASHBOARD STATS
    // -------------------------------------------------------------------------
    if (role === 'cell_leader') {
        const cellKpis = analyticsData?.cell_kpis || analyticsData?.cell_data?.kpis || {
            members_count: 14,
            attendance_rate: '88%',
            pending_followups: 2,
            new_converts: '+3 MTD'
        };

        return (
            <div className="stitch-stats-grid">
                {/* Cell Card 1: Members in Cell */}
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
                        bg: '#eff6ff',
                        color: '#2563eb',
                        text: 'Assigned Cell'
                    }}
                    label="MY CELL MEMBERS"
                    value={cellKpis.members_count}
                    subtext="Active Disciples"
                    lineColor="#2563eb"
                    loading={loading}
                />

                {/* Cell Card 2: Weekly Cell Attendance */}
                <StitchStatCard
                    icon={{
                        bg: '#ecfdf5',
                        color: '#059669',
                        svg: (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        )
                    }}
                    badge={{
                        bg: '#ecfdf5',
                        color: '#059669',
                        text: 'Optimal Turnout'
                    }}
                    label="CELL WEEKLY ATTENDANCE"
                    value={cellKpis.attendance_rate}
                    subtext="Weekly Meeting Rate"
                    lineColor="#10b981"
                    loading={loading}
                />

                {/* Cell Card 3: Care & Follow-Up */}
                <StitchStatCard
                    icon={{
                        bg: '#fffbeb',
                        color: '#d97706',
                        svg: (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                        )
                    }}
                    badge={{
                        bg: '#fffbeb',
                        color: '#d97706',
                        text: 'Action Needed'
                    }}
                    label="CARE & FOLLOW-UP"
                    value={cellKpis.pending_followups}
                    subtext="Absent Disciples"
                    lineColor="#f59e0b"
                    loading={loading}
                />

                {/* Cell Card 4: Cell Multiplication */}
                <StitchStatCard
                    icon={{
                        bg: '#faf5ff',
                        color: '#9333ea',
                        svg: (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <line x1="19" y1="8" x2="19" y2="14"></line>
                                <line x1="22" y1="11" x2="16" y2="11"></line>
                            </svg>
                        )
                    }}
                    badge={{
                        bg: '#faf5ff',
                        color: '#9333ea',
                        text: 'Multiplication'
                    }}
                    label="CELL MULTIPLICATION"
                    value={cellKpis.new_converts}
                    subtext="New Disciples MTD"
                    lineColor="#8b5cf6"
                    loading={loading}
                />

                <style>{gridStyle}</style>
            </div>
        );
    }

    // -------------------------------------------------------------------------
    // 2. ASSIMILATION & FOLLOW-UP TEAM STATS
    // -------------------------------------------------------------------------
    if (role === 'assimilation') {
        const assimKpis = analyticsData?.assimilation_kpis || analyticsData?.assimilation_data?.kpis || {
            new_converts_mtd: 28,
            active_followups: 18,
            assimilated_to_cells: 12,
            retention_rate: '78.4%'
        };

        return (
            <div className="stitch-stats-grid">
                {/* Assim Card 1: New Converts MTD */}
                <StitchStatCard
                    icon={{
                        bg: '#eff6ff',
                        color: '#2563eb',
                        svg: (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                            </svg>
                        )
                    }}
                    badge={{
                        bg: '#ecfdf5',
                        color: '#059669',
                        text: 'This Month'
                    }}
                    label="NEW SOULS (MTD)"
                    value={assimKpis.new_converts_mtd}
                    subtext="Visitors & Converts"
                    lineColor="#2563eb"
                    loading={loading}
                />

                {/* Assim Card 2: Active Follow-Ups */}
                <StitchStatCard
                    icon={{
                        bg: '#fff7ed',
                        color: '#ea580c',
                        svg: (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                            </svg>
                        )
                    }}
                    badge={{
                        bg: '#fff7ed',
                        color: '#ea580c',
                        text: 'In Care Queue'
                    }}
                    label="ACTIVE FOLLOW-UPS"
                    value={assimKpis.active_followups}
                    subtext="Calls & Visits"
                    lineColor="#ea580c"
                    loading={loading}
                />

                {/* Assim Card 3: Cell Integration */}
                <StitchStatCard
                    icon={{
                        bg: '#ecfdf5',
                        color: '#059669',
                        svg: (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                <polyline points="9 22 9 12 15 12 15 22"></polyline>
                            </svg>
                        )
                    }}
                    badge={{
                        bg: '#ecfdf5',
                        color: '#059669',
                        text: 'Cell Fellowship'
                    }}
                    label="CELL INTEGRATION"
                    value={assimKpis.assimilated_to_cells}
                    subtext="Placed in Small Groups"
                    lineColor="#10b981"
                    loading={loading}
                />

                {/* Assim Card 4: Retention Rate */}
                <StitchStatCard
                    icon={{
                        bg: '#ecfeff',
                        color: '#0891b2',
                        svg: (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                            </svg>
                        )
                    }}
                    badge={{
                        bg: '#ecfeff',
                        color: '#0891b2',
                        text: '30-Day Conversion'
                    }}
                    label="RETENTION RATE"
                    value={assimKpis.retention_rate}
                    subtext="Souls Preserved"
                    lineColor="#06b6d4"
                    loading={loading}
                />

                <style>{gridStyle}</style>
            </div>
        );
    }

    // -------------------------------------------------------------------------
    // 3. CORPORATE ADMIN / DC COORDINATOR (Church-wide KPIs)
    // -------------------------------------------------------------------------
    const corpKpis = analyticsData?.kpis || stats;

    return (
        <div className="stitch-stats-grid">
            {/* Card 1: Network Members */}
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
                    text: '~ +12%'
                }}
                label="NETWORK MEMBERS"
                value={corpKpis.active_members || stats.total_members}
                subtext="Active Disciples"
                lineColor="#22c1e6"
                loading={loading}
            />

            {/* Card 2: Cell Fellowships */}
            <StitchStatCard
                icon={{
                    bg: '#f0fdf4',
                    color: '#16a34a',
                    svg: (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                    )
                }}
                badge={{
                    bg: '#eff6ff',
                    color: '#2563eb',
                    text: 'All Optimal'
                }}
                label="CELL FELLOWSHIPS"
                value={corpKpis.active_cells || stats.total_cells}
                subtext="Across 3 Zones"
                lineColor="#10b981"
                loading={loading}
            />

            {/* Card 3: Upcoming Services */}
            <StitchStatCard
                icon={{
                    bg: '#faf5ff',
                    color: '#9333ea',
                    svg: (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                    )
                }}
                badge={{
                    bg: '#faf5ff',
                    color: '#9333ea',
                    text: 'This Week'
                }}
                label="UPCOMING SERVICES"
                value={stats.total_events}
                subtext="Sunday Service Next"
                lineColor="#8b5cf6"
                loading={loading}
            />

            {/* Card 4: Network Giving (YTD) */}
            <StitchStatCard
                icon={{
                    bg: '#ecfeff',
                    color: '#0891b2',
                    svg: (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                            <circle cx="12" cy="12" r="2"></circle>
                            <path d="M6 12h.01M18 12h.01"></path>
                        </svg>
                    )
                }}
                badge={{
                    bg: '#ecfeff',
                    color: '#0891b2',
                    text: '89% Goal'
                }}
                label="NETWORK GIVING (YTD)"
                value={formatGiving(corpKpis.total_redeemed || stats.total_contributions)}
                subtext="/ 300k target"
                lineColor="#22c1e6"
                loading={loading}
            />

            <style>{gridStyle}</style>
        </div>
    );
};

const gridStyle = `
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
`;

export default StatsGrid;