import React, { useState } from 'react';
import ActiveCellsCarousel from '../components/members/ActiveCellsCarousel';
import MembersTable from '../components/members/MembersTable';
import CreateMemberModal from '../components/members/CreateMemberModal';
import UploadExcelModal from '../components/members/UploadExcelModal';
import NewMemberCategoryModal from '../components/members/NewMemberCategoryModal';
import CreateCellModal from '../components/cells/CreateCellModal';

const MembersDashboard = () => {
    const [selectedCellFilter, setSelectedCellFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [viewMode, setViewMode] = useState('list');

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isCellModalOpen, setIsCellModalOpen] = useState(false);
    const [isCommittedModalOpen, setIsCommittedModalOpen] = useState(false);

    return (
        <div className="stitch-members-container">
            {/* Breadcrumb Header */}
            <div className="stitch-breadcrumbs-bar">
                <div className="breadcrumbs-path">
                    <span className="crumb-segment">Portal</span>
                    <span className="crumb-sep">&gt;</span>
                    <span className="crumb-segment">Members Directory</span>
                    <span className="crumb-sep">&gt;</span>
                    <span className="crumb-current">All Active Members (518)</span>
                </div>

                <div className="sync-live-status">
                    <span className="sync-live-dot">●</span>
                    <span>Sync live</span>
                    <span className="sync-sep">•</span>
                    <span>Updated 2 mins ago</span>
                    <button className="sync-refresh-btn" title="Refresh members list" onClick={() => window.location.reload()}>
                        ⟳
                    </button>
                </div>
            </div>

            {/* Action Bar & Filter Row */}
            <div className="stitch-members-action-bar">
                <div className="actions-left">
                    {/* Add Member Button */}
                    <button
                        className="stitch-add-member-btn"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <span>Add Member</span>
                    </button>

                    {/* Cell Filter */}
                    <div className="stitch-filter-select-wrap">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M12 3v3m0 12v3M3 12h3m12 0h3"></path>
                        </svg>
                        <select
                            value={selectedCellFilter}
                            onChange={(e) => setSelectedCellFilter(e.target.value)}
                        >
                            <option value="">Cell: All 6 Cells</option>
                            <option value="Grace Cell">Grace Cell (Karen)</option>
                            <option value="Faith Cell">Faith Cell (Westlands)</option>
                            <option value="Shiloh Cell">Shiloh Cell (Kilimani)</option>
                            <option value="Bethel Cell">Bethel Cell (CBD)</option>
                            <option value="Zion Cell">Zion Cell (Parklands)</option>
                            <option value="Victory Cell">Victory Cell (Kileleshwa)</option>
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
                            <option value="all">Status: Active & Follow-up</option>
                            <option value="active">Active Only</option>
                            <option value="new">New Converts Only</option>
                            <option value="followup">Needs Follow-up</option>
                        </select>
                    </div>

                    {/* Sort Filter */}
                    <div className="stitch-filter-select-wrap">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="4" y1="6" x2="16" y2="6"></line>
                            <line x1="4" y1="12" x2="12" y2="12"></line>
                            <line x1="4" y1="18" x2="8" y2="18"></line>
                        </svg>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="name">Sort: Name (A-Z)</option>
                            <option value="recent">Sort: Recently Added</option>
                            <option value="health">Sort: Attendance Health</option>
                            <option value="giving">Sort: Giving (YTD)</option>
                        </select>
                    </div>
                </div>

                <div className="actions-right">
                    {/* View mode toggle */}
                    <div className="view-mode-pill">
                        <button
                            className={`view-pill-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="8" y1="6" x2="21" y2="6"></line>
                                <line x1="8" y1="12" x2="21" y2="12"></line>
                                <line x1="8" y1="18" x2="21" y2="18"></line>
                                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                                <line x1="3" y1="18" x2="3.01" y2="18"></line>
                            </svg>
                            <span>List</span>
                        </button>
                        <button
                            className={`view-pill-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                                <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
                                <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
                                <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
                                <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
                            </svg>
                            <span>Grid</span>
                        </button>
                    </div>

                    <button
                        className="info-action-btn"
                        title="Directory Overview & Documentation"
                        onClick={() => setIsUploadModalOpen(true)}
                    >
                        ⓘ
                    </button>
                </div>
            </div>

            {/* Active Cells & Outposts Horizontal Cards */}
            <ActiveCellsCarousel
                selectedCell={selectedCellFilter}
                onSelectCell={setSelectedCellFilter}
            />

            {/* Members Modern Table */}
            <MembersTable
                selectedCellFilter={selectedCellFilter}
                statusFilter={statusFilter}
                sortBy={sortBy}
            />

            {/* Modals */}
            {isCreateModalOpen && <CreateMemberModal onClose={() => setIsCreateModalOpen(false)} />}
            {isCommittedModalOpen && <CreateMemberModal onClose={() => setIsCommittedModalOpen(false)} initialStatus="Committed Member" />}
            {isUploadModalOpen && <UploadExcelModal onClose={() => setIsUploadModalOpen(false)} />}
            {isCategoryModalOpen && <NewMemberCategoryModal onClose={() => setIsCategoryModalOpen(false)} />}
            {isCellModalOpen && <CreateCellModal onClose={() => setIsCellModalOpen(false)} />}

            <style>{`
                .stitch-members-container {
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
                .sync-refresh-btn:hover {
                    color: #0f172a;
                }

                /* Action Bar */
                .stitch-members-action-bar {
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

                .stitch-add-member-btn {
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
                .stitch-add-member-btn:hover {
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

                .actions-right {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .view-mode-pill {
                    display: flex;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 9999px;
                    padding: 0.2rem;
                }
                .portal-wrapper.dark-mode .view-mode-pill {
                    background: #151128;
                    border-color: rgba(255, 255, 255, 0.1);
                }
                .view-pill-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    padding: 0.3rem 0.7rem;
                    border-radius: 9999px;
                    border: none;
                    background: transparent;
                    color: #64748b;
                    font-size: 0.74rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .view-pill-btn.active {
                    background: #eff6ff;
                    color: #2563eb;
                }
                .portal-wrapper.dark-mode .view-pill-btn.active {
                    background: rgba(37, 99, 235, 0.15);
                    color: #60a5fa;
                }

                .info-action-btn {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    color: #64748b;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.9rem;
                    transition: all 0.15s;
                }
                .info-action-btn:hover {
                    color: #0f172a;
                    border-color: #cbd5e1;
                }
                .portal-wrapper.dark-mode .info-action-btn {
                    background: #151128;
                    border-color: rgba(255, 255, 255, 0.1);
                    color: #94a3b8;
                }
            `}</style>
        </div>
    );
};

export default MembersDashboard;
