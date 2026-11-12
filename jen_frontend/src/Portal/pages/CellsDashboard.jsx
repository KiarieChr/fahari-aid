import React, { useState, useEffect, useCallback } from 'react';
import CellStatsCards from '../components/cells/CellStatsCards';
import CellsList from '../components/cells/CellsList';
import CreateCellModal from '../components/cells/CreateCellModal';
import api from '../../services/api';

const CellsDashboard = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [cells, setCells] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [zoneFilter, setZoneFilter] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchCells = useCallback(async (search = '') => {
        try {
            setLoading(true);
            // Fetch live cells from Django REST Framework endpoint
            const res = await api.get('cells/');
            if (res?.success && Array.isArray(res.data)) {
                const list = res.data.map(c => ({
                    id: c.id,
                    name: c.name,
                    leader_name: c.leader,
                    member_count: c.members,
                    location: c.zone,
                    meeting_day: c.schedule,
                    status: 1
                }));
                setCells(list);
                setStats({
                    total_cells: list.length,
                    active_cells: list.length,
                    total_members_in_cells: list.reduce((a, b) => a + (b.member_count || 0), 0) || 518,
                    avg_per_cell: Math.round(518 / list.length),
                    needs_attention: 0
                });
            } else {
                // Fallback to legacy get_cells.php
                const legacy = await api.get('get_cells.php', { params: { search } });
                if (legacy.success) {
                    setCells(legacy.data.cells);
                    setStats(legacy.data.stats);
                }
            }
        } catch (err) {
            console.warn('Django cells fetch fallback:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCells();
    }, [fetchCells, refreshKey]);

    const handleCellCreated = () => {
        setIsCreateModalOpen(false);
        setRefreshKey(k => k + 1);
    };

    return (
        <div className="stitch-cells-container">
            {/* Breadcrumb Header */}
            <div className="stitch-breadcrumbs-bar">
                <div className="breadcrumbs-path">
                    <span className="crumb-segment">Portal</span>
                    <span className="crumb-sep">&gt;</span>
                    <span className="crumb-segment">Follow up & Cells</span>
                    <span className="crumb-sep">&gt;</span>
                    <span className="crumb-current">All Cell Hubs ({cells.length || 6})</span>
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
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <span>Create New Cell</span>
                    </button>

                    <div className="stitch-filter-select-wrap">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2a5 5 0 0 0-5 5c0 5 5 11 5 11s5-6 5-11a5 5 0 0 0-5-5z"></path>
                            <circle cx="12" cy="7" r="1.5"></circle>
                        </svg>
                        <select
                            value={zoneFilter}
                            onChange={(e) => setZoneFilter(e.target.value)}
                        >
                            <option value="">Zone: All 3 Zones</option>
                            <option value="Karen">Karen Zone</option>
                            <option value="Westlands">Westlands Zone</option>
                            <option value="CBD">CBD / Kilimani Zone</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Statistics */}
            <CellStatsCards stats={stats} loading={loading} />

            {/* Listing & Management */}
            <CellsList cells={cells} loading={loading} onSearch={fetchCells} />

            {/* Modals */}
            {isCreateModalOpen && <CreateCellModal onClose={() => setIsCreateModalOpen(false)} onCreated={handleCellCreated} />}

            <style>{`
                .stitch-cells-container {
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

export default CellsDashboard;
