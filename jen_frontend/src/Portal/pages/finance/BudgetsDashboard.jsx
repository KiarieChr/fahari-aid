import React, { useState } from 'react';
import BudgetsList from '../../components/finance/budgets/BudgetsList';

const BudgetsDashboard = () => {
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <div className="stitch-budgets-container">
            {/* Breadcrumb Header */}
            <div className="stitch-breadcrumbs-bar">
                <div className="breadcrumbs-path">
                    <span className="crumb-segment">Portal</span>
                    <span className="crumb-sep">&gt;</span>
                    <span className="crumb-segment">Contributions & Giving</span>
                    <span className="crumb-sep">&gt;</span>
                    <span className="crumb-current">Ministry Budgets</span>
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
                        <h2>Ministry Budgets & Fiscal Utilization</h2>
                        <p>Plan allocations, track ministry department spending, and prevent budget overruns</p>
                    </div>
                </div>
            </div>

            <BudgetsList key={refreshKey} />

            <style>{`
                .stitch-budgets-container {
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
            `}</style>
        </div>
    );
};

export default BudgetsDashboard;
