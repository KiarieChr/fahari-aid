import React, { useContext } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ThemeContext } from '../../../context/ThemeContext';

const RegistrationProgressChart = ({ data }) => {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';

    const percentage = Number(data?.percentage) || 0;
    const remaining = Math.max(0, 100 - percentage);

    const chartData = [
        { name: 'Registered', value: percentage, color: '#2563eb' },
        { name: 'Remaining', value: remaining, color: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9' }
    ];

    const displayData = percentage >= 100
        ? [{ name: 'Registered', value: 100, color: '#10b981' }]
        : chartData;

    return (
        <div className="stitch-chart-card">
            <div className="chart-header">
                <div>
                    <h3 className="chart-title">Registration Progress</h3>
                    <p className="chart-sub">Aggregate alignment across all active conferences</p>
                </div>
                <span className="status-rate-badge">
                    {percentage >= 80 ? 'Optimal' : 'Active'}
                </span>
            </div>

            <div className="chart-canvas-wrap">
                <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                        <Pie
                            data={displayData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={3}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                            stroke="none"
                        >
                            {displayData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value) => `${Number(value).toFixed(1)}%`}
                            contentStyle={{
                                background: isDark ? '#151128' : '#ffffff',
                                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.15)' : '#e2e8f0'}`,
                                borderRadius: '0.5rem',
                                color: isDark ? '#ffffff' : '#0f172a',
                                fontSize: '0.8rem',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center label */}
                <div className="chart-center-label">
                    <span className="center-value">{percentage.toFixed(0)}%</span>
                    <span className="center-caption">Capacity</span>
                </div>
            </div>

            {/* Bottom 3-Col KPI Metrics */}
            <div className="chart-stats-row">
                <div className="stat-col">
                    <span className="stat-num">{data?.registered ?? data?.total_registered ?? 0}</span>
                    <span className="stat-label">Registered</span>
                </div>
                <div className="stat-col">
                    <span className="stat-num">{data?.target ?? 500}</span>
                    <span className="stat-label">Target Goal</span>
                </div>
                <div className="stat-col">
                    <span className="stat-num">{data?.invited ?? (data?.registered ? Math.round(data.registered * 1.4) : 0)}</span>
                    <span className="stat-label">Invited</span>
                </div>
            </div>

            <style>{`
                .stitch-chart-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 1rem;
                    padding: 1.4rem 1.6rem;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    height: 100%;
                    transition: background 0.2s, border-color 0.2s;
                }
                .portal-wrapper.dark-mode .stitch-chart-card {
                    background: #151128;
                    border-color: rgba(255, 255, 255, 0.08);
                }

                .chart-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 0.5rem;
                    margin-bottom: 0.5rem;
                }
                .chart-title {
                    margin: 0;
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: #0f172a;
                    letter-spacing: -0.01em;
                }
                .portal-wrapper.dark-mode .chart-title {
                    color: #ffffff;
                }
                .chart-sub {
                    margin: 0.2rem 0 0 0;
                    font-size: 0.75rem;
                    color: #64748b;
                }
                .portal-wrapper.dark-mode .chart-sub {
                    color: #94a3b8;
                }

                .status-rate-badge {
                    font-size: 0.7rem;
                    font-weight: 700;
                    padding: 0.2rem 0.55rem;
                    border-radius: 9999px;
                    background: #eff6ff;
                    color: #2563eb;
                }
                .portal-wrapper.dark-mode .status-rate-badge {
                    background: rgba(37, 99, 235, 0.15);
                    color: #60a5fa;
                }

                .chart-canvas-wrap {
                    position: relative;
                    width: 100%;
                    height: 180px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .chart-center-label {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    pointer-events: none;
                }
                .center-value {
                    font-size: 1.55rem;
                    font-weight: 800;
                    color: #2563eb;
                    line-height: 1;
                }
                .portal-wrapper.dark-mode .center-value {
                    color: #60a5fa;
                }
                .center-caption {
                    font-size: 0.68rem;
                    color: #64748b;
                    font-weight: 600;
                    text-transform: uppercase;
                    margin-top: 0.15rem;
                }
                .portal-wrapper.dark-mode .center-caption {
                    color: #94a3b8;
                }

                .chart-stats-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-around;
                    padding-top: 1rem;
                    margin-top: 0.5rem;
                    border-top: 1px solid #f1f5f9;
                }
                .portal-wrapper.dark-mode .chart-stats-row {
                    border-top-color: rgba(255, 255, 255, 0.06);
                }

                .stat-col {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.15rem;
                }
                .stat-num {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #0f172a;
                }
                .portal-wrapper.dark-mode .stat-num {
                    color: #ffffff;
                }
                .stat-label {
                    font-size: 0.7rem;
                    color: #64748b;
                    font-weight: 500;
                }
                .portal-wrapper.dark-mode .stat-label {
                    color: #94a3b8;
                }
            `}</style>
        </div>
    );
};

export default RegistrationProgressChart;
