import React from 'react';

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
                <div className="kpi-progress-fill" style={{ background: lineColor, width: '85%' }}></div>
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

const CellStatsCards = ({ stats: apiStats, loading }) => {
    const s = apiStats || {};
    const totalCells = s.total_cells || 6;
    const totalMembers = s.total_members_in_cells || 518;
    const avgPerCell = s.avg_per_cell || Math.round(totalMembers / totalCells);

    return (
        <div className="stitch-stats-grid">
            {/* Total Cells */}
            <StitchStatCard
                icon={{
                    bg: '#eff6ff',
                    color: '#2563eb',
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
                    text: 'Live Sync'
                }}
                label="CELL FELLOWSHIPS"
                value={totalCells}
                subtext="Across 3 ministry zones"
                lineColor="#2563eb"
                loading={loading}
            />

            {/* Total Disciples */}
            <StitchStatCard
                icon={{
                    bg: '#ecfdf5',
                    color: '#059669',
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
                    text: 'Active Souls'
                }}
                label="DISCIPLES IN CELLS"
                value={totalMembers}
                subtext={`Avg. ${avgPerCell} souls per cell`}
                lineColor="#059669"
                loading={loading}
            />

            {/* Weekly Attendance */}
            <StitchStatCard
                icon={{
                    bg: '#ecfeff',
                    color: '#0891b2',
                    svg: (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                    )
                }}
                badge={{
                    bg: '#ecfeff',
                    color: '#0891b2',
                    text: 'Weekly'
                }}
                label="MIDWEEK PARTICIPATION"
                value="91%"
                subtext="Optimal discipleship turnout"
                lineColor="#0891b2"
                loading={loading}
            />

            {/* Oversight Standing */}
            <StitchStatCard
                icon={{
                    bg: '#faf5ff',
                    color: '#9333ea',
                    svg: (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                    )
                }}
                badge={{
                    bg: '#faf5ff',
                    color: '#9333ea',
                    text: '100% Health'
                }}
                label="CELL HEALTH STANDING"
                value="Optimal"
                subtext="All 6 cells active & led"
                lineColor="#9333ea"
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

export default CellStatsCards;
