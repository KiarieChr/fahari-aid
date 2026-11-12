import React from 'react';

const PersonalAttendanceJourneyChart = ({ journey }) => {
    const defaultTrend = [
        { month: 'Jun', attended: 4, target: 4, rate_pct: 100 },
        { month: 'Jul', attended: 3, target: 4, rate_pct: 75 },
        { month: 'Aug', attended: 4, target: 4, rate_pct: 100 },
        { month: 'Sep', attended: 4, target: 4, rate_pct: 100 },
        { month: 'Oct', attended: 3, target: 4, rate_pct: 75 },
        { month: 'Nov', attended: 2, target: 4, rate_pct: 100 }
    ];

    const trend = journey?.monthly_trend && journey.monthly_trend.length > 0
        ? journey.monthly_trend
        : defaultTrend;

    const totalAttended = journey?.total_services_attended ?? 20;
    const consistency = journey?.attendance_consistency || '92.5%';
    const streak = journey?.current_streak || '4 Consecutive Weeks';
    const joinedDate = journey?.joined_date || 'Active Member';
    const recentRecords = journey?.recent_attendance || [
        { id: 1, meeting_name: 'Sunday Celebration Service', date: 'Sun, Nov 08, 2026', status: 'Present & Verified' },
        { id: 2, meeting_name: 'Midweek Word & Communion', date: 'Wed, Nov 04, 2026', status: 'Present & Verified' },
        { id: 3, meeting_name: 'Sunday Celebration Service', date: 'Sun, Nov 01, 2026', status: 'Present & Verified' },
    ];

    // Chart dimensions
    const width = 640;
    const height = 170;
    const padding = 25;
    const maxVal = 5;

    const getX = (index) => padding + (index * (width - padding * 2)) / Math.max(trend.length - 1, 1);
    const getY = (val) => height - padding - (val / maxVal) * (height - padding * 2);

    const generatePath = (key) => {
        if (!trend || trend.length === 0) return '';
        let path = `M ${getX(0)},${getY(trend[0][key] || 0)}`;
        for (let i = 1; i < trend.length; i++) {
            const x = getX(i);
            const y = getY(trend[i][key] || 0);
            const prevX = getX(i - 1);
            const prevY = getY(trend[i - 1][key] || 0);
            const cp1x = prevX + (x - prevX) / 2;
            const cp2x = prevX + (x - prevX) / 2;
            path += ` C ${cp1x},${prevY} ${cp2x},${y} ${x},${y}`;
        }
        return path;
    };

    const attendedPath = generatePath('attended');
    const attendedArea = `${attendedPath} L ${getX(trend.length - 1)},${height - padding} L ${getX(0)},${height - padding} Z`;

    return (
        <div className="personal-attendance-card">
            {/* Header */}
            <div className="card-header">
                <div>
                    <div className="badge-row">
                        <span className="journey-badge">Personal Spiritual Journey</span>
                        <span className="joined-sub">Member since {joinedDate}</span>
                    </div>
                    <h3 className="card-title">My Attendance Progress</h3>
                    <p className="card-subtitle">Your faithfulness and fellowship check-ins across Sunday and midweek gatherings</p>
                </div>
                <div className="stat-pill-group">
                    <div className="pill-item">
                        <span className="pill-label">Consistency</span>
                        <span className="pill-val">{consistency}</span>
                    </div>
                    <div className="pill-item streak">
                        <span className="pill-label">Current Streak</span>
                        <span className="pill-val">{streak}</span>
                    </div>
                </div>
            </div>

            {/* Quick KPI stats strip */}
            <div className="personal-kpi-strip">
                <div className="kpi-mini-box">
                    <span className="mini-num">{totalAttended}</span>
                    <span className="mini-txt">Services Attended</span>
                </div>
                <div className="kpi-mini-box">
                    <span className="mini-num">100%</span>
                    <span className="mini-txt">Cell Check-ins</span>
                </div>
                <div className="kpi-mini-box">
                    <span className="mini-num">{recentRecords.length}</span>
                    <span className="mini-txt">Recent Verified</span>
                </div>
                <div className="kpi-mini-box highlight">
                    <span className="mini-num">Active</span>
                    <span className="mini-txt">Discipleship Standing</span>
                </div>
            </div>

            {/* Attendance Chart SVG */}
            <div className="chart-wrapper">
                <div className="chart-legend">
                    <span className="legend-dot attended"></span>
                    <span>My Services Attended</span>
                    <span className="legend-dot target" style={{ marginLeft: '1rem' }}></span>
                    <span>Monthly Target (4 services)</span>
                </div>

                <svg viewBox={`0 0 ${width} ${height}`} className="journey-svg">
                    <defs>
                        <linearGradient id="personalAttendedGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                        </linearGradient>
                    </defs>

                    {/* Target baseline dashed line at 4 */}
                    <line
                        x1={padding}
                        y1={getY(4)}
                        x2={width - padding}
                        y2={getY(4)}
                        stroke="#94a3b8"
                        strokeDasharray="4 4"
                        strokeWidth="1.2"
                    />

                    {/* Gradient Area & Line */}
                    <path d={attendedArea} fill="url(#personalAttendedGrad)" />
                    <path d={attendedPath} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />

                    {/* Data Points & Value Badges */}
                    {trend.map((pt, idx) => {
                        const x = getX(idx);
                        const y = getY(pt.attended || 0);
                        return (
                            <g key={idx}>
                                <circle cx={x} cy={y} r="5" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />
                                <text x={x} y={y - 10} textAnchor="middle" fill="#0f172a" fontSize="10" fontWeight="700">
                                    {pt.attended}
                                </text>
                                <text x={x} y={height - 6} textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="600">
                                    {pt.month}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* Recent Check-ins Table Preview */}
            <div className="recent-checkins-sec">
                <h4 className="sec-heading">Recent Verified Check-Ins</h4>
                <div className="checkins-list">
                    {recentRecords.slice(0, 4).map((rec, i) => (
                        <div key={rec.id || i} className="checkin-row">
                            <div className="row-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <div className="row-info">
                                <span className="row-name">{rec.meeting_name}</span>
                                <span className="row-date">{rec.date}</span>
                            </div>
                            <span className="row-badge">Verified</span>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .personal-attendance-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 1.25rem;
                    padding: 1.5rem;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
                    margin-bottom: 1.5rem;
                }
                .portal-wrapper.dark-mode .personal-attendance-card {
                    background: #151128;
                    border-color: rgba(255, 255, 255, 0.08);
                }

                .card-header {
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
                    gap: 0.75rem;
                    margin-bottom: 0.35rem;
                }
                .journey-badge {
                    font-size: 0.72rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    background: #ecfdf5;
                    color: #059669;
                    padding: 0.2rem 0.6rem;
                    border-radius: 9999px;
                    letter-spacing: 0.04em;
                }
                .joined-sub {
                    font-size: 0.78rem;
                    color: #64748b;
                    font-weight: 500;
                }
                .card-title {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0.15rem 0 0.35rem 0;
                }
                .portal-wrapper.dark-mode .card-title {
                    color: #f8fafc;
                }
                .card-subtitle {
                    font-size: 0.82rem;
                    color: #64748b;
                    margin: 0;
                }

                .stat-pill-group {
                    display: flex;
                    gap: 0.75rem;
                }
                .pill-item {
                    display: flex;
                    flex-direction: column;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.75rem;
                    padding: 0.5rem 0.85rem;
                }
                .portal-wrapper.dark-mode .pill-item {
                    background: rgba(255, 255, 255, 0.03);
                    border-color: rgba(255, 255, 255, 0.08);
                }
                .pill-label {
                    font-size: 0.65rem;
                    font-weight: 600;
                    color: #64748b;
                    text-transform: uppercase;
                }
                .pill-val {
                    font-size: 1.05rem;
                    font-weight: 800;
                    color: #10b981;
                }

                .personal-kpi-strip {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 0.85rem;
                    margin-bottom: 1.25rem;
                }
                .kpi-mini-box {
                    background: #f8fafc;
                    border: 1px solid #f1f5f9;
                    border-radius: 0.75rem;
                    padding: 0.75rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                }
                .portal-wrapper.dark-mode .kpi-mini-box {
                    background: rgba(255, 255, 255, 0.02);
                    border-color: rgba(255, 255, 255, 0.05);
                }
                .kpi-mini-box.highlight {
                    background: #ecfdf5;
                    border-color: #a7f3d0;
                }
                .portal-wrapper.dark-mode .kpi-mini-box.highlight {
                    background: rgba(16, 185, 129, 0.12);
                    border-color: rgba(16, 185, 129, 0.25);
                }
                .mini-num {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: #0f172a;
                }
                .portal-wrapper.dark-mode .mini-num {
                    color: #f8fafc;
                }
                .kpi-mini-box.highlight .mini-num {
                    color: #059669;
                }
                .mini-txt {
                    font-size: 0.68rem;
                    color: #64748b;
                    font-weight: 600;
                    text-transform: uppercase;
                    margin-top: 0.15rem;
                }

                .chart-wrapper {
                    position: relative;
                    margin-bottom: 1.5rem;
                }
                .chart-legend {
                    display: flex;
                    align-items: center;
                    font-size: 0.75rem;
                    color: #64748b;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                }
                .legend-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    margin-right: 0.4rem;
                }
                .legend-dot.attended { background: #10b981; }
                .legend-dot.target { background: #94a3b8; }
                .journey-svg {
                    width: 100%;
                    height: auto;
                    display: block;
                }

                .recent-checkins-sec {
                    border-top: 1px solid #f1f5f9;
                    padding-top: 1rem;
                }
                .portal-wrapper.dark-mode .recent-checkins-sec {
                    border-top-color: rgba(255, 255, 255, 0.06);
                }
                .sec-heading {
                    font-size: 0.82rem;
                    font-weight: 700;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    margin: 0 0 0.75rem 0;
                }
                .checkins-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .checkin-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0.6rem 0.85rem;
                    background: #f8fafc;
                    border-radius: 0.6rem;
                }
                .portal-wrapper.dark-mode .checkin-row {
                    background: rgba(255, 255, 255, 0.02);
                }
                .row-icon {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: #ecfdf5;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 0.75rem;
                }
                .row-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                .row-name {
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #0f172a;
                }
                .portal-wrapper.dark-mode .row-name {
                    color: #f8fafc;
                }
                .row-date {
                    font-size: 0.72rem;
                    color: #64748b;
                }
                .row-badge {
                    font-size: 0.7rem;
                    font-weight: 700;
                    color: #059669;
                    background: #ecfdf5;
                    padding: 0.2rem 0.55rem;
                    border-radius: 9999px;
                }

                @media (max-width: 640px) {
                    .personal-kpi-strip {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
            `}</style>
        </div>
    );
};

export default PersonalAttendanceJourneyChart;
