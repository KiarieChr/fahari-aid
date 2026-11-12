import React from 'react';

const CellAttendanceTrendChart = ({ cellData }) => {
    const defaultTrend = [
        { month: 'Jun', attendance_count: 12, turnout_pct: 85 },
        { month: 'Jul', attendance_count: 13, turnout_pct: 90 },
        { month: 'Aug', attendance_count: 11, turnout_pct: 78 },
        { month: 'Sep', attendance_count: 14, turnout_pct: 95 },
        { month: 'Oct', attendance_count: 12, turnout_pct: 85 },
        { month: 'Nov', attendance_count: 13, turnout_pct: 90 },
    ];

    const trend = cellData?.monthly_trend && cellData.monthly_trend.length > 0
        ? cellData.monthly_trend
        : defaultTrend;

    const cellName = cellData?.cell_name || 'My Cell Fellowship';
    const cellCode = cellData?.cell_code || 'GFC-01';
    const membersCount = cellData?.kpis?.members_count || 14;
    const turnoutRate = cellData?.kpis?.attendance_rate || '88%';
    const nextFellowship = cellData?.next_fellowship || 'Wednesday at 6:00 PM';
    const membersList = cellData?.members || [
        { id: 1, name: 'Grace Njeri', phone: '+254 712 111 222', status: 'Regular Attendee' },
        { id: 2, name: 'Peter Ndung\'u', phone: '+254 722 333 444', status: 'Regular Attendee' },
        { id: 3, name: 'Mercy Achieng', phone: '+254 733 555 666', status: 'Needs Follow-Up' },
    ];

    // Chart dimensions
    const width = 640;
    const height = 170;
    const padding = 25;
    const maxVal = 100;

    const getX = (index) => padding + (index * (width - padding * 2)) / Math.max(trend.length - 1, 1);
    const getY = (val) => height - padding - (val / maxVal) * (height - padding * 2);

    const generateArea = () => {
        if (!trend || trend.length === 0) return '';
        let path = `M ${getX(0)},${getY(trend[0].turnout_pct || 80)}`;
        for (let i = 1; i < trend.length; i++) {
            const x = getX(i);
            const y = getY(trend[i].turnout_pct || 80);
            const prevX = getX(i - 1);
            const prevY = getY(trend[i - 1].turnout_pct || 80);
            const cp1x = prevX + (x - prevX) / 2;
            const cp2x = prevX + (x - prevX) / 2;
            path += ` C ${cp1x},${prevY} ${cp2x},${y} ${x},${y}`;
        }
        return path;
    };

    const linePath = generateArea();
    const areaPath = `${linePath} L ${getX(trend.length - 1)},${height - padding} L ${getX(0)},${height - padding} Z`;

    return (
        <div className="cell-leader-trend-card">
            <div className="card-top-bar">
                <div>
                    <div className="badge-row">
                        <span className="role-badge">Cell Leadership Analytics</span>
                        <span className="cell-tag">{cellCode}</span>
                    </div>
                    <h3 className="card-heading">{cellName} • Weekly Turnout</h3>
                    <p className="card-subheading">Tracking discipleship consistency, care needs, and cell multiplication</p>
                </div>
                <div className="highlight-pill">
                    <span className="pill-sub">Average Turnout</span>
                    <span className="pill-rate">{turnoutRate}</span>
                </div>
            </div>

            {/* SVG Trend Chart */}
            <div className="chart-container">
                <svg viewBox={`0 0 ${width} ${height}`} className="trend-svg">
                    <defs>
                        <linearGradient id="cellTurnoutGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                        </linearGradient>
                    </defs>

                    {/* Area fill */}
                    <path d={areaPath} fill="url(#cellTurnoutGrad)" />
                    {/* Line stroke */}
                    <path d={linePath} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />

                    {/* Points & Labels */}
                    {trend.map((pt, idx) => {
                        const x = getX(idx);
                        const y = getY(pt.turnout_pct || 80);
                        return (
                            <g key={idx}>
                                <circle cx={x} cy={y} r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" />
                                <text x={x} y={y - 10} textAnchor="middle" fill="#0f172a" fontSize="10" fontWeight="700">
                                    {pt.turnout_pct}%
                                </text>
                                <text x={x} y={height - 6} textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="600">
                                    {pt.month}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* Cell Disciples Roster */}
            <div className="cell-roster-sec">
                <div className="roster-header">
                    <h4 className="roster-title">Cell Disciples Roster ({membersCount} Members)</h4>
                    <span className="next-fellowship-tag">Next: {nextFellowship}</span>
                </div>
                <div className="roster-grid">
                    {membersList.slice(0, 6).map((m, i) => (
                        <div key={m.id || i} className="roster-card">
                            <div className="roster-avatar">
                                {m.name.charAt(0)}
                            </div>
                            <div className="roster-details">
                                <span className="roster-name">{m.name}</span>
                                <span className="roster-phone">{m.phone}</span>
                            </div>
                            <span className={`status-tag ${m.status.includes('Needs') ? 'warn' : 'ok'}`}>
                                {m.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .cell-leader-trend-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 1.25rem;
                    padding: 1.5rem;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
                    margin-bottom: 1.5rem;
                }
                .portal-wrapper.dark-mode .cell-leader-trend-card {
                    background: #151128;
                    border-color: rgba(255, 255, 255, 0.08);
                }

                .card-top-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    flex-wrap: wrap;
                    gap: 1rem;
                    margin-bottom: 1.25rem;
                }
                .badge-row {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    margin-bottom: 0.35rem;
                }
                .role-badge {
                    font-size: 0.7rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    background: #eff6ff;
                    color: #2563eb;
                    padding: 0.2rem 0.55rem;
                    border-radius: 9999px;
                    letter-spacing: 0.04em;
                }
                .cell-tag {
                    font-size: 0.72rem;
                    font-weight: 700;
                    color: #64748b;
                    background: #f1f5f9;
                    padding: 0.15rem 0.5rem;
                    border-radius: 0.4rem;
                }
                .portal-wrapper.dark-mode .cell-tag {
                    background: rgba(255, 255, 255, 0.06);
                    color: #94a3b8;
                }
                .card-heading {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0.15rem 0 0.35rem 0;
                }
                .portal-wrapper.dark-mode .card-heading {
                    color: #f8fafc;
                }
                .card-subheading {
                    font-size: 0.82rem;
                    color: #64748b;
                    margin: 0;
                }

                .highlight-pill {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.75rem;
                    padding: 0.5rem 0.85rem;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                }
                .portal-wrapper.dark-mode .highlight-pill {
                    background: rgba(255, 255, 255, 0.03);
                    border-color: rgba(255, 255, 255, 0.08);
                }
                .pill-sub {
                    font-size: 0.65rem;
                    text-transform: uppercase;
                    color: #64748b;
                    font-weight: 600;
                }
                .pill-rate {
                    font-size: 1.2rem;
                    font-weight: 800;
                    color: #2563eb;
                }

                .chart-container {
                    margin-bottom: 1.5rem;
                }
                .trend-svg {
                    width: 100%;
                    height: auto;
                    display: block;
                }

                .cell-roster-sec {
                    border-top: 1px solid #f1f5f9;
                    padding-top: 1.25rem;
                }
                .portal-wrapper.dark-mode .cell-roster-sec {
                    border-top-color: rgba(255, 255, 255, 0.06);
                }
                .roster-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.85rem;
                }
                .roster-title {
                    font-size: 0.82rem;
                    font-weight: 700;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    margin: 0;
                }
                .next-fellowship-tag {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #2563eb;
                }

                .roster-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 0.75rem;
                }
                @media (max-width: 640px) {
                    .roster-grid {
                        grid-template-columns: 1fr;
                    }
                }
                .roster-card {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.75rem;
                    padding: 0.65rem 0.85rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .portal-wrapper.dark-mode .roster-card {
                    background: rgba(255, 255, 255, 0.02);
                    border-color: rgba(255, 255, 255, 0.06);
                }
                .roster-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: #2563eb;
                    color: #ffffff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 0.85rem;
                }
                .roster-details {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                .roster-name {
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #0f172a;
                }
                .portal-wrapper.dark-mode .roster-name {
                    color: #f8fafc;
                }
                .roster-phone {
                    font-size: 0.72rem;
                    color: #64748b;
                }
                .status-tag {
                    font-size: 0.68rem;
                    font-weight: 600;
                    padding: 0.15rem 0.45rem;
                    border-radius: 9999px;
                }
                .status-tag.ok {
                    background: #ecfdf5;
                    color: #059669;
                }
                .status-tag.warn {
                    background: #fffbeb;
                    color: #d97706;
                }
            `}</style>
        </div>
    );
};

export default CellAttendanceTrendChart;
