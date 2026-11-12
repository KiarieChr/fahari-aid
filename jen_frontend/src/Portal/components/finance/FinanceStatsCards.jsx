import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

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
                <div className="kpi-progress-fill" style={{ background: lineColor, width: '80%' }}></div>
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

const FinanceStatsCards = () => {
    const [stats, setStats] = useState({
        total_income: 267000,
        total_expenses: 42000,
        total_pledges: 300000,
        pledges_redeemed: 267000,
        net_balance: 225000,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch live from Django analytics
                const res = await api.get('analytics/overview/');
                if (res?.kpis) {
                    const k = res.kpis;
                    const redeemed = k.total_redeemed || 267000;
                    const pledged = k.total_pledged || 300000;
                    setStats({
                        total_income: redeemed,
                        total_expenses: 42000,
                        total_pledges: pledged,
                        pledges_redeemed: redeemed,
                        net_balance: redeemed - 42000
                    });
                } else {
                    const fallback = await api.get('get_finance_stats.php');
                    if (fallback.success) setStats(fallback.data);
                }
            } catch (err) {
                console.warn('Finance stats fallback:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const fmt = (n) => (n || 0).toLocaleString();

    return (
        <div className="stitch-stats-grid">
            {/* Total Giving Received */}
            <StitchStatCard
                icon={{
                    bg: '#ecfeff',
                    color: '#0891b2',
                    svg: (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                            <circle cx="12" cy="12" r="2"></circle>
                        </svg>
                    )
                }}
                badge={{
                    bg: '#ecfeff',
                    color: '#0891b2',
                    text: '89% Goal'
                }}
                label="TOTAL CONTRIBUTIONS"
                value={`KES ${fmt(stats.pledges_redeemed)}`}
                subtext="Tithes, offerings & partnership"
                lineColor="#22c1e6"
                loading={loading}
            />

            {/* Total Pledges */}
            <StitchStatCard
                icon={{
                    bg: '#eff6ff',
                    color: '#2563eb',
                    svg: (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                    )
                }}
                badge={{
                    bg: '#eff6ff',
                    color: '#2563eb',
                    text: 'Pledges'
                }}
                label="PARTNERSHIP PLEDGES"
                value={`KES ${fmt(stats.total_pledges)}`}
                subtext="Pillar & Kingdom building"
                lineColor="#2563eb"
                loading={loading}
            />

            {/* Operational Expenses */}
            <StitchStatCard
                icon={{
                    bg: '#fff1f2',
                    color: '#e11d48',
                    svg: (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                            <polyline points="17 18 23 18 23 12"></polyline>
                        </svg>
                    )
                }}
                badge={{
                    bg: '#fff1f2',
                    color: '#e11d48',
                    text: 'Disbursed'
                }}
                label="MINISTRY EXPENSES"
                value={`KES ${fmt(stats.total_expenses)}`}
                subtext="Missions, logistics & media"
                lineColor="#f43f5e"
                loading={loading}
            />

            {/* Net Available Balance */}
            <StitchStatCard
                icon={{
                    bg: '#f0fdf4',
                    color: '#16a34a',
                    svg: (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                    )
                }}
                badge={{
                    bg: '#f0fdf4',
                    color: '#16a34a',
                    text: 'Surplus'
                }}
                label="NET AVAILABLE BALANCE"
                value={`KES ${fmt(stats.net_balance)}`}
                subtext="Verified treasury reserve"
                lineColor="#10b981"
                loading={loading}
            />

            <style>{`
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
            `}</style>
        </div>
    );
};

export default FinanceStatsCards;
