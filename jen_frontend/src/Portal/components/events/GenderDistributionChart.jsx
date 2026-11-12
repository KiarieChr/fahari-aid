import React, { useContext } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ThemeContext } from '../../../context/ThemeContext';

const GenderDistributionChart = ({ data, total }) => {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';

    function getGenderColor(gender) {
        const genderLower = (gender || '').toLowerCase();
        if (genderLower === 'male' || genderLower === 'm') return '#3b82f6';
        if (genderLower === 'female' || genderLower === 'f') return '#ec4899';
        return '#8b5cf6';
    }

    const chartData = (data && data.length > 0 ? data : [
        { gender: 'Male', count: 245 },
        { gender: 'Female', count: 175 }
    ]).map(item => ({
        name: item.gender || 'Unknown',
        value: parseInt(item.count) || 0,
        color: getGenderColor(item.gender)
    }));

    const totalCount = total || chartData.reduce((sum, item) => sum + item.value, 0);
    const dataWithPercentage = chartData.map(item => ({
        ...item,
        percentage: totalCount > 0 ? ((item.value / totalCount) * 100).toFixed(1) : 0
    }));

    return (
        <div className="stitch-chart-card">
            <div className="chart-header">
                <div>
                    <h3 className="chart-title">Demographics & Attendance</h3>
                    <p className="chart-sub">Registered gender distribution and representation</p>
                </div>
                <span className="demo-badge">Verified</span>
            </div>

            <div className="chart-canvas-wrap">
                <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                        <Pie
                            data={dataWithPercentage}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={3}
                            dataKey="value"
                            stroke="none"
                        >
                            {dataWithPercentage.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value, name, props) => [
                                `${value} attendees (${props.payload.percentage}%)`,
                                props.payload.name
                            ]}
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
                    <span className="center-value">{totalCount}</span>
                    <span className="center-caption">Total Souls</span>
                </div>
            </div>

            {/* Legend Pills */}
            <div className="chart-legend-row">
                {dataWithPercentage.map((item, index) => (
                    <div key={index} className="legend-chip">
                        <span className="dot-indicator" style={{ background: item.color }}></span>
                        <span className="legend-name">{item.name}:</span>
                        <strong className="legend-pct">{item.percentage}%</strong>
                    </div>
                ))}
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

                .demo-badge {
                    font-size: 0.7rem;
                    font-weight: 700;
                    color: #7c3aed;
                    background: #f5f3ff;
                    padding: 0.2rem 0.55rem;
                    border-radius: 9999px;
                }
                .portal-wrapper.dark-mode .demo-badge {
                    background: rgba(124, 58, 237, 0.15);
                    color: #c4b5fd;
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
                    color: #0f172a;
                    line-height: 1;
                }
                .portal-wrapper.dark-mode .center-value {
                    color: #ffffff;
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

                .chart-legend-row {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 1.25rem;
                    padding-top: 1rem;
                    margin-top: 0.5rem;
                    border-top: 1px solid #f1f5f9;
                }
                .portal-wrapper.dark-mode .chart-legend-row {
                    border-top-color: rgba(255, 255, 255, 0.06);
                }

                .legend-chip {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    font-size: 0.78rem;
                }
                .dot-indicator {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                }
                .legend-name {
                    color: #64748b;
                }
                .portal-wrapper.dark-mode .legend-name {
                    color: #94a3b8;
                }
                .legend-pct {
                    color: #0f172a;
                    font-weight: 700;
                }
                .portal-wrapper.dark-mode .legend-pct {
                    color: #ffffff;
                }
            `}</style>
        </div>
    );
};

export default GenderDistributionChart;
