import React, { useState } from 'react';
import AttendanceStatsCards from '../components/meetings/attendance/AttendanceStatsCards';
import AttendanceTrendChart from '../components/meetings/attendance/AttendanceTrendChart';
import MeetingsVsEventsChart from '../components/meetings/attendance/MeetingsVsEventsChart';
import AttendanceDistributionChart from '../components/meetings/attendance/AttendanceDistributionChart';
import AttendanceTable from '../components/meetings/attendance/AttendanceTable';

const AttendanceDashboard = () => {
    const [timeRange, setTimeRange] = useState('This Quarter');
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <div className="stitch-attendance-container">
            {/* Breadcrumb Header */}
            <div className="stitch-breadcrumbs-bar">
                <div className="breadcrumbs-path">
                    <span className="crumb-segment">Portal</span>
                    <span className="crumb-sep">&gt;</span>
                    <span className="crumb-segment">Meetings & Services</span>
                    <span className="crumb-sep">&gt;</span>
                    <span className="crumb-current">Attendance & Analytics</span>
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
                    <div className="title-group">
                        <h2>Attendance & Participation Intelligence</h2>
                        <p>Real-time corporate Sunday and midweek cell fellowship participation health</p>
                    </div>
                </div>

                <div className="actions-right">
                    <div className="stitch-select-wrapper">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="stitch-range-select"
                        >
                            <option>This Month</option>
                            <option>Last Month</option>
                            <option>This Quarter</option>
                            <option>Year to Date</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <AttendanceStatsCards key={refreshKey} />

            {/* Charts Grid */}
            <div className="attendance-charts-grid">
                <div className="chart-wrapper-card trend-area">
                    <AttendanceTrendChart />
                </div>
                <div className="chart-wrapper-card compare-area">
                    <MeetingsVsEventsChart />
                </div>
                <div className="chart-wrapper-card dist-area">
                    <AttendanceDistributionChart />
                </div>
            </div>

            {/* Detailed Table */}
            <AttendanceTable key={`table-${refreshKey}`} />

            <style>{`
                .stitch-attendance-container {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                    padding-bottom: 2.5rem;
                }

                .stitch-breadcrumbs-bar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-size: 0.8125rem;
                    color: #64748b;
                }
                .breadcrumbs-path {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                }
                .crumb-segment {
                    color: #64748b;
                }
                .crumb-sep {
                    color: #cbd5e1;
                    font-size: 0.75rem;
                }
                .crumb-current {
                    color: #0f172a;
                    font-weight: 600;
                }
                .sync-live-status {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                    font-size: 0.775rem;
                    color: #64748b;
                }
                .sync-live-dot {
                    color: #22c55e;
                    font-size: 0.75rem;
                }
                .sync-sep {
                    color: #cbd5e1;
                }
                .sync-refresh-btn {
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    color: #64748b;
                    font-size: 0.95rem;
                    padding: 0 0.2rem;
                    transition: transform 0.2s;
                }
                .sync-refresh-btn:hover {
                    transform: rotate(90deg);
                    color: #0f172a;
                }

                .stitch-action-bar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                }
                .title-group h2 {
                    font-size: 1.35rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0;
                    letter-spacing: -0.01em;
                }
                .title-group p {
                    font-size: 0.8125rem;
                    color: #64748b;
                    margin: 0.25rem 0 0 0;
                }

                .stitch-select-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 9999px;
                    padding: 0.4rem 0.85rem;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
                }
                .stitch-range-select {
                    border: none;
                    background: transparent;
                    font-size: 0.8125rem;
                    font-weight: 600;
                    color: #0f172a;
                    outline: none;
                    cursor: pointer;
                }

                .attendance-charts-grid {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr 1fr;
                    gap: 1.25rem;
                }
                @media (max-width: 1024px) {
                    .attendance-charts-grid {
                        grid-template-columns: 1fr;
                    }
                }
                .chart-wrapper-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 1rem;
                    overflow: hidden;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
                }
            `}</style>
        </div>
    );
};

export default AttendanceDashboard;
