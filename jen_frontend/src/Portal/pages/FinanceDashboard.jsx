import React, { useState } from 'react';
import FinanceStatsCards from '../components/finance/FinanceStatsCards';
import TransactionsTable from '../components/finance/TransactionsTable';
import RecordIncomeModal from '../components/finance/RecordIncomeModal';
import RecordExpenseModal from '../components/finance/RecordExpenseModal';
import RecordContributionModal from '../components/finance/RecordContributionModal';
import CreateBudgetModal from '../components/finance/CreateBudgetModal';
import MakePledgeModal from '../components/finance/pledges/MakePledgeModal';

const FinanceDashboard = () => {
    const [incomeModal, setIncomeModal] = useState(false);
    const [expenseModal, setExpenseModal] = useState(false);
    const [contributionModal, setContributionModal] = useState(false);
    const [budgetModal, setBudgetModal] = useState(false);
    const [pledgeModal, setPledgeModal] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleSuccess = () => setRefreshKey(k => k + 1);

    return (
        <div className="stitch-finance-container">
            {/* Breadcrumb Header */}
            <div className="stitch-breadcrumbs-bar">
                <div className="breadcrumbs-path">
                    <span className="crumb-segment">Portal</span>
                    <span className="crumb-sep">&gt;</span>
                    <span className="crumb-segment">Contributions & Giving</span>
                    <span className="crumb-sep">&gt;</span>
                    <span className="crumb-current">Financial Overview</span>
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
                    <button
                        className="stitch-primary-btn"
                        onClick={() => setContributionModal(true)}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <span>Record Contribution</span>
                    </button>

                    <button
                        className="stitch-secondary-btn"
                        onClick={() => setPledgeModal(true)}
                    >
                        <span>+ Partner Pledge</span>
                    </button>

                    <button
                        className="stitch-secondary-btn"
                        onClick={() => setExpenseModal(true)}
                    >
                        <span>+ Record Expense</span>
                    </button>

                    <button
                        className="stitch-secondary-btn"
                        onClick={() => setIncomeModal(true)}
                    >
                        <span>+ General Income</span>
                    </button>
                </div>
            </div>

            {/* 4 Stitch KPI Cards */}
            <FinanceStatsCards key={`stats-${refreshKey}`} />

            {/* Transactions Table */}
            <TransactionsTable key={`tx-${refreshKey}`} />

            {/* Modals */}
            {incomeModal && <RecordIncomeModal onClose={() => setIncomeModal(false)} onSuccess={handleSuccess} />}
            {expenseModal && <RecordExpenseModal onClose={() => setExpenseModal(false)} onSuccess={handleSuccess} />}
            {contributionModal && <RecordContributionModal onClose={() => setContributionModal(false)} onSuccess={handleSuccess} />}
            {budgetModal && <CreateBudgetModal onClose={() => setBudgetModal(false)} onSuccess={handleSuccess} />}
            {pledgeModal && <MakePledgeModal onClose={() => setPledgeModal(false)} onSuccess={handleSuccess} />}

            <style>{`
                .stitch-finance-container {
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .stitch-breadcrumbs-bar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                    margin-bottom: 1.25rem;
                }
                .breadcrumbs-path {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                    font-size: 0.8rem;
                }
                .crumb-segment {
                    color: #64748b;
                }
                .portal-wrapper.dark-mode .crumb-segment {
                    color: #94a3b8;
                }
                .crumb-sep {
                    color: #cbd5e1;
                    font-size: 0.75rem;
                }
                .crumb-current {
                    color: #0f172a;
                    font-weight: 700;
                }
                .portal-wrapper.dark-mode .crumb-current {
                    color: #ffffff;
                }

                .sync-live-status {
                    display: flex;
                    align-items: center;
                    gap: 0.45rem;
                    font-size: 0.72rem;
                    color: #64748b;
                }
                .portal-wrapper.dark-mode .sync-live-status {
                    color: #94a3b8;
                }
                .sync-live-dot {
                    color: #10b981;
                    font-size: 0.7rem;
                }
                .sync-sep {
                    opacity: 0.5;
                }
                .sync-refresh-btn {
                    background: transparent;
                    border: none;
                    color: #64748b;
                    cursor: pointer;
                    font-size: 0.85rem;
                    padding: 0.15rem;
                }

                .stitch-action-bar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                }
                .actions-left {
                    display: flex;
                    align-items: center;
                    gap: 0.65rem;
                    flex-wrap: wrap;
                }

                .stitch-primary-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.45rem;
                    padding: 0.55rem 1.15rem;
                    background: linear-gradient(135deg, #06b6d4 0%, #0284c7 100%);
                    color: #ffffff;
                    border: none;
                    border-radius: 9999px;
                    font-size: 0.82rem;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(6, 182, 212, 0.3);
                    transition: all 0.15s ease;
                }
                .stitch-primary-btn:hover {
                    opacity: 0.95;
                    transform: translateY(-1px);
                }

                .stitch-secondary-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                    padding: 0.5rem 0.95rem;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 9999px;
                    color: #334155;
                    font-size: 0.78rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .stitch-secondary-btn:hover {
                    background: #f8fafc;
                    border-color: #cbd5e1;
                }
                .portal-wrapper.dark-mode .stitch-secondary-btn {
                    background: #151128;
                    border-color: rgba(255, 255, 255, 0.1);
                    color: #cbd5e1;
                }
            `}</style>
        </div>
    );
};

export default FinanceDashboard;
