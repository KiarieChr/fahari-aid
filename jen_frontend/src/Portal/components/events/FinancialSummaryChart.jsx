import React, { useContext } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ThemeContext } from '../../../context/ThemeContext';

const FinancialSummaryChart = ({ data }) => {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';

    const chartData = [
        { name: 'Target', value: Number(data?.total_collection) || 250000, color: '#2563eb' },
        { name: 'Collected', value: Number(data?.collected) || 185000, color: '#10b981' },
        { name: 'Sponsored', value: Number(data?.sponsored_collection) || 65000, color: '#0891b2' },
        { name: 'Pending', value: Number(data?.pending) || 65000, color: '#f59e0b' }
    ];

    const formatCurrency = (value) => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
            return `${(value / 1000).toFixed(0)}K`;
        }
        return value.toLocaleString();
    };

    return (
        <div className="stitch-chart-card">
            <div className="chart-header">
                <div>
                    <h3 className="chart-title">Event Financial Summary</h3>
                    <p className="chart-sub">Registration collections, sponsorship seed & pledges</p>
                </div>
                <div className="kpi-tag-currency">KES (KES)</div>
            </div>

            <div style={{ width: '100%', height: '200px', marginTop: '0.5rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
                        <XAxis
                            type="number"
                            tickFormatter={formatCurrency}
                            tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }}
                            axisLine={{ stroke: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }}
                            tickLine={false}
                        />
                        <YAxis
                            type="category"
                            dataKey="name"
                            tick={{ fontSize: 11, fill: isDark ? '#cbd5e1' : '#334155', fontWeight: 600 }}
                            axisLine={{ stroke: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }}
                            tickLine={false}
                            width={75}
                        />
                        <Tooltip
                            formatter={(value) => [`KES ${Number(value).toLocaleString()}`, 'Amount']}
                            contentStyle={{
                                background: isDark ? '#151128' : '#ffffff',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : '#e2e8f0'}`,
                                borderRadius: '0.5rem',
                                color: isDark ? '#ffffff' : '#0f172a',
                                fontSize: '0.8rem',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                        />
                        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
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

                .kpi-tag-currency {
                    font-size: 0.68rem;
                    font-weight: 700;
                    color: #0891b2;
                    background: #ecfeff;
                    padding: 0.2rem 0.55rem;
                    border-radius: 9999px;
                }
                .portal-wrapper.dark-mode .kpi-tag-currency {
                    background: rgba(8, 145, 178, 0.15);
                    color: #22d3ee;
                }
            `}</style>
        </div>
    );
};

export default FinancialSummaryChart;
