import React from 'react';

const AssimilationProgressionChart = ({ data }) => {
    const defaultFunnel = [
        {'stage': '1. First-Time Visitors / Intake', 'count': 28, 'pct': 100, 'color': '#3b82f6'},
        {'stage': '2. Welcome Call & Care Check', 'count': 25, 'pct': 89, 'color': '#06b6d4'},
        {'stage': '3. Cell Fellowship Integration', 'count': 19, 'pct': 68, 'color': '#10b981'},
        {'stage': '4. Foundation Discipleship Class', 'count': 15, 'pct': 54, 'color': '#8b5cf6'},
        {'stage': '5. Water Baptism & Covenant', 'count': 11, 'pct': 39, 'color': '#f59e0b'},
        {'stage': '6. Commissioned Disciples', 'count': 8, 'pct': 29, 'color': '#ec4899'},
    ];

    const defaultTrend = [
        { month: 'Jun', new_souls: 18, retained: 14, retention_pct: 78 },
        { month: 'Jul', new_souls: 22, retained: 17, retention_pct: 77 },
        { month: 'Aug', new_souls: 20, retained: 16, retention_pct: 80 },
        { month: 'Sep', new_souls: 25, retained: 20, retention_pct: 80 },
        { month: 'Oct', new_souls: 26, retained: 21, retention_pct: 81 },
        { month: 'Nov', new_souls: 28, retained: 22, retention_pct: 79 },
    ];

    const funnel = data?.pipeline_funnel && data.pipeline_funnel.length > 0
        ? data.pipeline_funnel
        : defaultFunnel;

    const trend = data?.monthly_trend && data.monthly_trend.length > 0
        ? data.monthly_trend
        : defaultTrend;

    const newConvertsMtd = data?.kpis?.new_converts_mtd ?? 28;
    const retentionRate = data?.kpis?.retention_rate || '78.4%';

    return (
        <div className="assimilation-chart-card">
            {/* Header */}
            <div className="card-top-header">
                <div>
                    <div className="badge-row">
                        <span className="assim-badge">Assimilation & Follow-Up Team</span>
                        <span className="mtd-tag">Month-To-Date Pipeline</span>
                    </div>
                    <h3 className="card-heading">Soul Retention & Stage Progression</h3>
                    <p className="card-subheading">Tracking new souls from altar intake to cell integration and discipleship graduation</p>
                </div>
                <div className="retention-pill">
                    <span className="pill-lbl">Progressive Retention</span>
                    <span className="pill-val">{retentionRate}</span>
                </div>
            </div>

            {/* Stage-by-Stage Funnel */}
            <div className="pipeline-funnel-sec">
                <div className="funnel-title-row">
                    <span className="funnel-title">Progressive Assimilation Stages</span>
                    <span className="funnel-total">{newConvertsMtd} New Converts Tracked</span>
                </div>

                <div className="funnel-bars">
                    {funnel.map((item, idx) => (
                        <div key={idx} className="funnel-row">
                            <div className="funnel-label-col">
                                <span className="stage-name">{item.stage}</span>
                                <span className="stage-metrics">{item.count} souls ({item.pct}%)</span>
                            </div>
                            <div className="progress-track">
                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${item.pct}%`,
                                        background: item.color || '#3b82f6'
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Monthly Trend Mini-Bars */}
            <div className="monthly-assim-trend">
                <div className="trend-hdr">
                    <span className="trend-title">6-Month Intake vs Retained Souls</span>
                    <div className="trend-legends">
                        <span className="leg-item"><span className="dot intake"></span> Intake</span>
                        <span className="leg-item"><span className="dot retained"></span> Retained</span>
                    </div>
                </div>

                <div className="bars-container">
                    {trend.map((t, i) => (
                        <div key={i} className="bar-group">
                            <div className="bar-pair">
                                <div
                                    className="bar intake-bar"
                                    style={{ height: `${Math.min(100, (t.new_souls / 35) * 100)}%` }}
                                    title={`Intake: ${t.new_souls}`}
                                />
                                <div
                                    className="bar retained-bar"
                                    style={{ height: `${Math.min(100, (t.retained / 35) * 100)}%` }}
                                    title={`Retained: ${t.retained}`}
                                />
                            </div>
                            <span className="bar-month">{t.month}</span>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .assimilation-chart-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 1.25rem;
                    padding: 1.5rem;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
                    margin-bottom: 1.5rem;
                }
                .portal-wrapper.dark-mode .assimilation-chart-card {
                    background: #151128;
                    border-color: rgba(255, 255, 255, 0.08);
                }

                .card-top-header {
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
                .assim-badge {
                    font-size: 0.7rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    background: #eff6ff;
                    color: #2563eb;
                    padding: 0.2rem 0.55rem;
                    border-radius: 9999px;
                    letter-spacing: 0.04em;
                }
                .mtd-tag {
                    font-size: 0.72rem;
                    font-weight: 700;
                    color: #64748b;
                    background: #f1f5f9;
                    padding: 0.15rem 0.5rem;
                    border-radius: 0.4rem;
                }
                .portal-wrapper.dark-mode .mtd-tag {
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

                .retention-pill {
                    background: #ecfdf5;
                    border: 1px solid #a7f3d0;
                    border-radius: 0.75rem;
                    padding: 0.5rem 0.85rem;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                }
                .portal-wrapper.dark-mode .retention-pill {
                    background: rgba(16, 185, 129, 0.12);
                    border-color: rgba(16, 185, 129, 0.25);
                }
                .pill-lbl {
                    font-size: 0.65rem;
                    text-transform: uppercase;
                    color: #059669;
                    font-weight: 600;
                }
                .pill-val {
                    font-size: 1.2rem;
                    font-weight: 800;
                    color: #059669;
                }

                .pipeline-funnel-sec {
                    margin-bottom: 1.5rem;
                }
                .funnel-title-row {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    margin-bottom: 0.75rem;
                }
                .funnel-bars {
                    display: flex;
                    flex-direction: column;
                    gap: 0.65rem;
                }
                .funnel-row {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }
                .funnel-label-col {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.78rem;
                }
                .stage-name {
                    font-weight: 700;
                    color: #334155;
                }
                .portal-wrapper.dark-mode .stage-name {
                    color: #cbd5e1;
                }
                .stage-metrics {
                    font-weight: 600;
                    color: #64748b;
                }
                .progress-track {
                    height: 8px;
                    border-radius: 4px;
                    background: #f1f5f9;
                    overflow: hidden;
                }
                .portal-wrapper.dark-mode .progress-track {
                    background: rgba(255, 255, 255, 0.06);
                }
                .progress-fill {
                    height: 100%;
                    border-radius: 4px;
                    transition: width 0.4s ease;
                }

                .monthly-assim-trend {
                    border-top: 1px solid #f1f5f9;
                    padding-top: 1.25rem;
                }
                .portal-wrapper.dark-mode .monthly-assim-trend {
                    border-top-color: rgba(255, 255, 255, 0.06);
                }
                .trend-hdr {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.85rem;
                }
                .trend-title {
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                }
                .trend-legends {
                    display: flex;
                    gap: 0.75rem;
                    font-size: 0.72rem;
                    font-weight: 600;
                    color: #64748b;
                }
                .leg-item {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                }
                .dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                }
                .dot.intake { background: #3b82f6; }
                .dot.retained { background: #10b981; }

                .bars-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    height: 85px;
                    padding-top: 0.5rem;
                }
                .bar-group {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.35rem;
                    flex: 1;
                }
                .bar-pair {
                    display: flex;
                    gap: 3px;
                    align-items: flex-end;
                    height: 65px;
                }
                .bar {
                    width: 14px;
                    border-radius: 3px 3px 0 0;
                    min-height: 4px;
                }
                .bar.intake-bar { background: #3b82f6; }
                .bar.retained-bar { background: #10b981; }
                .bar-month {
                    font-size: 0.72rem;
                    color: #64748b;
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
};

export default AssimilationProgressionChart;
