import React, { useState, useEffect, useCallback } from 'react';
import AssignmentStatsCards from '../components/cells/assignment/AssignmentStatsCards';
import UnassignedMembersList from '../components/cells/assignment/UnassignedMembersList';
import CellGroupsPanel from '../components/cells/assignment/CellGroupsPanel';
import api from '../../services/api';

const AssignMembersDashboard = () => {
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [unassigned, setUnassigned] = useState([]);
    const [cells, setCells] = useState([]);
    const [stats, setStats] = useState(null);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchData = useCallback(async (search = '', location = '') => {
        try {
            setLoading(true);
            // Fetch live cells from Django REST Framework
            const cellsRes = await api.get('cells/').catch(() => null);
            if (cellsRes?.success && Array.isArray(cellsRes.data)) {
                setCells(cellsRes.data);
            } else {
                const legacy = await api.get('get_cells.php').catch(() => null);
                if (legacy?.success) setCells(legacy.data?.cells || []);
            }

            const unassignedRes = await api.get('get_unassigned_members.php', { params: { search, location } }).catch(() => null);
            if (unassignedRes?.success) {
                setUnassigned(unassignedRes.data.members || []);
                setStats(unassignedRes.data.stats);
                setLocations(unassignedRes.data.locations || []);
            }
        } catch (err) {
            console.error('Failed to fetch assignment data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData, refreshKey]);

    const toggleSelection = (id) => {
        setSelectedMembers(prev =>
            prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
        );
    };

    const handleAssign = async (cellId) => {
        if (selectedMembers.length === 0) {
            alert('Please select at least one member to assign.');
            return;
        }
        try {
            const res = await api.post('assign_members.php', {
                cell_id: cellId,
                member_ids: selectedMembers
            });
            if (res.success) {
                setSelectedMembers([]);
                fetchData();
            } else {
                alert(res.error || 'Failed to assign members');
            }
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to assign members');
        }
    };

    return (
        <div className="stitch-assign-container">
            {/* Breadcrumb Header */}
            <div className="stitch-breadcrumbs-bar">
                <div className="breadcrumbs-path">
                    <span className="crumb-segment">Portal</span>
                    <span className="crumb-sep">&gt;</span>
                    <span className="crumb-segment">Follow up & Cells</span>
                    <span className="crumb-sep">&gt;</span>
                    <span className="crumb-current">Assign Members ({unassigned.length} pending)</span>
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

            <AssignmentStatsCards stats={stats} loading={loading} />

            <div className="stitch-assign-grid">
                <UnassignedMembersList
                    members={unassigned}
                    locations={locations}
                    selectedMembers={selectedMembers}
                    toggleSelection={toggleSelection}
                    onSearch={fetchData}
                    loading={loading}
                />
                <CellGroupsPanel cells={cells} onAssign={handleAssign} />
            </div>

            <style>{`
                .stitch-assign-container {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                    padding-bottom: 2.5rem;
                    min-height: calc(100vh - 120px);
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

                .stitch-assign-grid {
                    display: grid;
                    grid-template-columns: minmax(320px, 1fr) minmax(360px, 1.8fr);
                    gap: 1.25rem;
                    flex: 1;
                    min-height: 0;
                }
                @media (max-width: 1024px) {
                    .stitch-assign-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default AssignMembersDashboard;
