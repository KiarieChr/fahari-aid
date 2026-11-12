import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

const GreetingCard = ({ role }) => {
    const { user } = useAuth();
    const [period, setPeriod] = useState('6months');

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    // Get display name (prefer first name from full_name, fallback to username)
    const getDisplayName = () => {
        if (!user) return 'Brother/Sister';
        const fullName = user?.full_name || user?.firstname || user?.first_name || user.username || 'Disciple';
        return fullName.split(' ')[0];
    };

    const effectiveRole = role || user?.dashboard_role || (user?.is_staff ? 'Administrator' : 'Church Member');
    const roleLabel = effectiveRole === 'cell_leader'
        ? 'Cell Leader'
        : effectiveRole === 'assimilation'
        ? 'Assimilation & Soul Care'
        : effectiveRole === 'admin'
        ? 'Corporate Administrator'
        : effectiveRole === 'dc_coordinator'
        ? 'District Coordinator'
        : 'Church Member';

    const scriptureQuote = effectiveRole === 'cell_leader'
        ? '"Shepherd the flock of God that is among you." — 1 Peter 5:2'
        : effectiveRole === 'assimilation'
        ? '"He who wins souls is wise." — Proverbs 11:30'
        : '"Let everything that has breath praise the Lord." — Psalm 150:6';

    return (
        <div className="stitch-greeting-wrapper">
            {/* Top Live Status Pill */}
            <div className="stitch-live-status">
                <span className="live-dot-pulse"></span>
                <span className="live-status-text">Live Portal Active</span>
                <span className="status-separator">•</span>
                <span className="status-timestamp">Updated 4 mins ago</span>
            </div>

            {/* Main Greeting Bar */}
            <div className="stitch-greeting-row">
                <div className="greeting-text-block">
                    <h1 className="greeting-title">
                        {getGreeting()}, <span className="greeting-name">{getDisplayName()}</span>
                    </h1>
                    <p className="greeting-subtitle">
                        {roleLabel} • <em>{scriptureQuote}</em>
                    </p>
                </div>

                {/* Right Action Controls */}
                <div className="greeting-controls">
                    <select
                        className="stitch-range-select"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                    >
                        <option value="6months">Last 6 Months</option>
                        <option value="3months">Last 3 Months</option>
                        <option value="1year">This Year (2026)</option>
                    </select>

                    <button
                        className="stitch-action-btn secondary"
                        onClick={() => window.print()}
                        title="Export Summary Report"
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        <span>Export Report</span>
                    </button>

                    <button
                        className="stitch-action-btn primary"
                        onClick={() => {
                            if (navigator.share) {
                                navigator.share({ title: 'Jesus Enthroned Network', url: window.location.href });
                            } else {
                                navigator.clipboard.writeText(window.location.href);
                                alert('Portal link copied to clipboard!');
                            }
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <circle cx="18" cy="5" r="3"></circle>
                            <circle cx="6" cy="12" r="3"></circle>
                            <circle cx="18" cy="19" r="3"></circle>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                        </svg>
                        <span>Quick Share</span>
                    </button>
                </div>
            </div>

            <style>{`
                .stitch-greeting-wrapper {
                    margin-bottom: 1.5rem;
                }

                .stitch-live-status {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.45rem;
                    background: #f0fdf4;
                    border: 1px solid #bbf7d0;
                    padding: 0.2rem 0.65rem;
                    border-radius: 9999px;
                    font-size: 0.72rem;
                    font-weight: 500;
                    color: #166534;
                    margin-bottom: 0.65rem;
                }
                .portal-wrapper.dark-mode .stitch-live-status {
                    background: rgba(16, 185, 129, 0.1);
                    border-color: rgba(16, 185, 129, 0.25);
                    color: #34d399;
                }

                .live-dot-pulse {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    background: #10b981;
                    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
                    animation: pulseDot 2s infinite;
                }
                @keyframes pulseDot {
                    0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
                    70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }

                .status-separator {
                    opacity: 0.4;
                }
                .status-timestamp {
                    color: #64748b;
                    font-weight: 400;
                }

                .stitch-greeting-row {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .greeting-text-block {
                    flex: 1;
                    min-width: 280px;
                }

                .greeting-title {
                    font-size: 2rem;
                    font-weight: 800;
                    color: #0f172a;
                    letter-spacing: -0.025em;
                    margin: 0 0 0.35rem 0;
                    line-height: 1.15;
                }
                .portal-wrapper.dark-mode .greeting-title {
                    color: #ffffff;
                }

                .greeting-name {
                    color: #2563eb;
                }
                .portal-wrapper.dark-mode .greeting-name {
                    color: #22c1e6;
                }

                .greeting-subtitle {
                    margin: 0;
                    font-size: 0.88rem;
                    color: #64748b;
                }
                .portal-wrapper.dark-mode .greeting-subtitle {
                    color: #94a3b8;
                }

                .greeting-controls {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    flex-wrap: wrap;
                }

                .stitch-range-select {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    color: #334155;
                    font-size: 0.82rem;
                    font-weight: 500;
                    padding: 0.5rem 0.85rem;
                    border-radius: 0.65rem;
                    cursor: pointer;
                    outline: none;
                    transition: border-color 0.15s;
                }
                .portal-wrapper.dark-mode .stitch-range-select {
                    background: #1e1b2e;
                    border-color: rgba(255, 255, 255, 0.1);
                    color: #cbd5e1;
                }

                .stitch-action-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.45rem;
                    padding: 0.5rem 0.95rem;
                    border-radius: 0.65rem;
                    font-size: 0.82rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    border: none;
                }

                .stitch-action-btn.secondary {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    color: #334155;
                }
                .stitch-action-btn.secondary:hover {
                    background: #f8fafc;
                    border-color: #cbd5e1;
                }
                .portal-wrapper.dark-mode .stitch-action-btn.secondary {
                    background: #1e1b2e;
                    border-color: rgba(255, 255, 255, 0.1);
                    color: #cbd5e1;
                }

                .stitch-action-btn.primary {
                    background: #2563eb;
                    color: #ffffff;
                    box-shadow: 0 1px 3px rgba(37, 99, 235, 0.2);
                }
                .stitch-action-btn.primary:hover {
                    background: #1d4ed8;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
                }

                @media (max-width: 768px) {
                    .greeting-title {
                        font-size: 1.5rem;
                    }
                    .stitch-greeting-row {
                        flex-direction: column;
                    }
                    .greeting-controls {
                        width: 100%;
                        justify-content: flex-start;
                    }
                }
            `}</style>
        </div>
    );
};

export default GreetingCard;
