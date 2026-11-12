import React, { useState, useEffect } from 'react';
import api from '../../../../services/api';

const ParticipationHealthChart = () => {
    const [score, setScore] = useState(78);
    const [stats, setStats] = useState({
        serviceAtt: 95,
        cellActivity: 82,
        givingHonor: 100
    });

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const response = await api.get('/get_my_attendance.php');
                if (response?.success && response?.data?.my_attendance?.percentage) {
                    setScore(Math.round(response.data.my_attendance.percentage));
                }
            } catch (err) {
                // Keep 78 baseline
            }
        };
        fetchAttendance();
    }, []);

    // Semi-circle SVG gauge calculation
    const radius = 75;
    const circumference = Math.PI * radius; // half circle circumference approx 235.6
    const strokeDashoffset = circumference * (1 - score / 100);

    return (
        <div className="stitch-health-card">
            {/* Header */}
            <div className="health-card-header">
                <h3 className="health-card-title">Participation Health</h3>
                <button className="health-info-btn" title="Overall health is computed based on service attendance, cell activity, and partnership giving.">
                    ⓘ
                </button>
            </div>

            {/* Radial Gauge */}
            <div className="health-gauge-wrap">
                <div className="gauge-svg-container">
                    <svg width="200" height="110" viewBox="0 0 200 110">
                        <defs>
                            <linearGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#22c1e6" />
                                <stop offset="100%" stopColor="#2563eb" />
                            </linearGradient>
                        </defs>
                        {/* Background track arc */}
                        <path
                            d="M 25 100 A 75 75 0 0 1 175 100"
                            fill="none"
                            stroke="#f1f5f9"
                            strokeWidth="14"
                            strokeLinecap="round"
                        />
                        {/* Colored progress arc */}
                        <path
                            d="M 25 100 A 75 75 0 0 1 175 100"
                            fill="none"
                            stroke="url(#gaugeGradient)"
                            strokeWidth="14"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
                        />
                    </svg>

                    <div className="gauge-center-text">
                        <div className="gauge-percentage">{score}%</div>
                        <div className="gauge-status-badge">GOOD STANDING</div>
                    </div>
                </div>

                <p className="gauge-subtext">Overall Spiritual & Cell Alignment</p>
            </div>

            {/* 3 Metric Sub-boxes */}
            <div className="health-metrics-grid">
                <div className="health-metric-box">
                    <span className="metric-val">{stats.serviceAtt}%</span>
                    <span className="metric-lbl">Service Att.</span>
                </div>
                <div className="health-metric-box">
                    <span className="metric-val">{stats.cellActivity}%</span>
                    <span className="metric-lbl">Cell Activity</span>
                </div>
                <div className="health-metric-box">
                    <span className="metric-val highlight">{stats.givingHonor}%</span>
                    <span className="metric-lbl">Giving Honor</span>
                </div>
            </div>

            <style>{`
                .stitch-health-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 1rem;
                    padding: 1.5rem;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
                    margin-bottom: 1.5rem;
                }
                .portal-wrapper.dark-mode .stitch-health-card {
                    background: #151128;
                    border-color: rgba(255, 255, 255, 0.08);
                }

                .health-card-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 1rem;
                }
                .health-card-title {
                    font-size: 1.02rem;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0;
                }
                .portal-wrapper.dark-mode .health-card-title {
                    color: #ffffff;
                }
                .health-info-btn {
                    background: transparent;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    font-size: 0.95rem;
                    padding: 0.2rem;
                }

                .health-gauge-wrap {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 0.5rem 0 1rem 0;
                }
                .gauge-svg-container {
                    position: relative;
                    width: 200px;
                    height: 115px;
                    display: flex;
                    justify-content: center;
                }
                .portal-wrapper.dark-mode .gauge-svg-container path:first-child {
                    stroke: rgba(255, 255, 255, 0.08);
                }

                .gauge-center-text {
                    position: absolute;
                    bottom: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .gauge-percentage {
                    font-size: 2rem;
                    font-weight: 800;
                    color: #0f172a;
                    line-height: 1;
                }
                .portal-wrapper.dark-mode .gauge-percentage {
                    color: #ffffff;
                }
                .gauge-status-badge {
                    font-size: 0.65rem;
                    font-weight: 700;
                    color: #2563eb;
                    letter-spacing: 0.06em;
                    margin-top: 0.2rem;
                }
                .portal-wrapper.dark-mode .gauge-status-badge {
                    color: #22c1e6;
                }

                .gauge-subtext {
                    font-size: 0.74rem;
                    color: #64748b;
                    margin: 0.65rem 0 0 0;
                    text-align: center;
                }
                .portal-wrapper.dark-mode .gauge-subtext {
                    color: #94a3b8;
                }

                .health-metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 0.5rem;
                    padding-top: 1rem;
                    border-top: 1px solid #f1f5f9;
                }
                .portal-wrapper.dark-mode .health-metrics-grid {
                    border-top-color: rgba(255, 255, 255, 0.06);
                }

                .health-metric-box {
                    background: #f8fafc;
                    border-radius: 0.65rem;
                    padding: 0.65rem 0.4rem;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    gap: 0.15rem;
                }
                .portal-wrapper.dark-mode .health-metric-box {
                    background: rgba(255, 255, 255, 0.04);
                }

                .metric-val {
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: #0f172a;
                }
                .portal-wrapper.dark-mode .metric-val {
                    color: #ffffff;
                }
                .metric-val.highlight {
                    color: #2563eb;
                }
                .portal-wrapper.dark-mode .metric-val.highlight {
                    color: #22c1e6;
                }
                .metric-lbl {
                    font-size: 0.66rem;
                    color: #64748b;
                    font-weight: 500;
                }
                .portal-wrapper.dark-mode .metric-lbl {
                    color: #94a3b8;
                }
            `}</style>
        </div>
    );
};

export default ParticipationHealthChart;
