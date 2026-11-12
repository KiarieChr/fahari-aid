import React, { useState } from 'react';
import ContributionsTable from '../../components/finance/contributions/ContributionsTable';

const ContributionsDashboard = () => {
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <div className="stitch-contributions-container">
            {/* Breadcrumb Header */}
            <div className="stitch-breadcrumbs-bar">
                <div className="breadcrumbs-path">
                    <span className="crumb-segment">Portal</span>
                    <span className="crumb-sep">&gt;</span>
                    <span className="crumb-segment">Contributions & Giving</span>
                    <span className="crumb-sep">&gt;</span>
                    <span className="crumb-current">All Contributions</span>
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
                        <h2>Member Contributions & Tithes</h2>
                        <p>Track, verify, and reconcile individual and corporate giving records</p>
                    </div>
                </div>

                <div className="actions-right">
                    <button
                        className="stitch-primary-btn"
                        onClick={() => window.location.href = '/portal/giving'}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <span>Record Contribution</span>
                    </button>
                </div>
            </div>

            <ContributionsTable key={refreshKey} />

            <style>{`
                .stitch-contributions-container {
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

                .stitch-primary-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.45rem;
                    background: linear-gradient(135deg, #22c1e6 0%, #0ea5e9 100%);
                    color: #ffffff;
                    border: none;
                    border-radius: 9999px;
                    padding: 0.55rem 1.15rem;
                    font-size: 0.8125rem;
                    font-weight: 600;
                    cursor: pointer;
                    box-shadow: 0 2px 6px rgba(14, 165, 233, 0.25);
                }
            `}</style>
        </div>
    );
};

export default ContributionsDashboard;
