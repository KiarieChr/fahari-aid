import React, { useState, useCallback } from 'react';
import MeetingStatsCards from '../components/meetings/MeetingStatsCards';
import MeetingsList from '../components/meetings/MeetingsList';
import MeetingCategories from '../components/meetings/MeetingCategories';
import CreateMeetingModal from '../components/meetings/CreateMeetingModal';

const MeetingsDashboard = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [filterCategory, setFilterCategory] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const handleCreated = useCallback(() => {
        setRefreshKey(k => k + 1);
    }, []);

    return (
        <div className="stitch-meetings-container">
            {/* Breadcrumb Header */}
            <div className="stitch-breadcrumbs-bar">
                <div className="breadcrumbs-path">
                    <span className="crumb-segment">Portal</span>
                    <span className="crumb-sep">&gt;</span>
                    <span className="crumb-segment">Meetings & Services</span>
                    <span className="crumb-sep">&gt;</span>
                    <span className="crumb-current">All Gatherings (153)</span>
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

            {/* Action Bar & Filter Row */}
            <div className="stitch-action-bar">
                <div className="actions-left">
                    <button
                        className="stitch-primary-btn"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <span>Create Meeting</span>
                    </button>

                    {/* Category Filter */}
                    <div className="stitch-filter-select-wrap">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                            <polyline points="2 17 12 22 22 17"></polyline>
                            <polyline points="2 12 12 17 22 12"></polyline>
                        </svg>
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="">Category: All Types</option>
                            <option value="Sunday Service">Sunday Service</option>
                            <option value="Midweek Service">Midweek Service</option>
                            <option value="Cell Fellowship">Cell Fellowship</option>
                            <option value="Leadership Meeting">Leadership Meeting</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="stitch-filter-select-wrap">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">Status: All Statuses</option>
                            <option value="Upcoming">Upcoming</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 4 Stitch KPI Cards */}
            <MeetingStatsCards key={`stats-${refreshKey}`} />

            {/* Meetings Table */}
            <MeetingsList
                key={`list-${refreshKey}`}
                categoryFilter={filterCategory}
                statusFilter={statusFilter}
            />

            {/* Meeting Types & Categories */}
            <MeetingCategories
                key={`cats-${refreshKey}`}
                selectedCategory={filterCategory}
                onSelectCategory={(catName) => setFilterCategory(prev => prev === catName ? '' : catName)}
            />

            {/* Modal */}
            {isCreateModalOpen && (
                <CreateMeetingModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onCreated={handleCreated}
                />
            )}

            <style>{`
                .stitch-meetings-container {
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
                    box-shadow: 0 4px 12px rgba(6, 182, 212, 0.4);
                }

                .stitch-filter-select-wrap {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 9999px;
                    padding: 0.4rem 0.75rem;
                    color: #64748b;
                    font-size: 0.78rem;
                }
                .portal-wrapper.dark-mode .stitch-filter-select-wrap {
                    background: #151128;
                    border-color: rgba(255, 255, 255, 0.1);
                    color: #94a3b8;
                }
                .stitch-filter-select-wrap select {
                    background: transparent;
                    border: none;
                    outline: none;
                    color: #334155;
                    font-size: 0.78rem;
                    font-weight: 500;
                    cursor: pointer;
                }
                .portal-wrapper.dark-mode .stitch-filter-select-wrap select {
                    color: #cbd5e1;
                }
            `}</style>
        </div>
    );
};

export default MeetingsDashboard;
