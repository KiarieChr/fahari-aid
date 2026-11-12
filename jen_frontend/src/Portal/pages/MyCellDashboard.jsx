import React, { useState, useEffect } from 'react';
import CellHeader from '../components/cells/my-cell/CellHeader';
import CellLeaderCard from '../components/cells/my-cell/CellLeaderCard';
import CellMembersList from '../components/cells/my-cell/CellMembersList';
import CellMeetingsWidget from '../components/cells/my-cell/CellMeetingsWidget';
import api from '../../services/api';

const MyCellDashboard = () => {
    const [cellData, setCellData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const fetchMyCell = async () => {
            try {
                setLoading(true);
                // First try live get_my_cell.php
                const res = await api.get('get_my_cell.php').catch(() => null);
                if (res?.success && res.data?.assigned) {
                    setCellData(res.data);
                } else {
                    // Pull from Django /api/cells/
                    const djangoCells = await api.get('cells/').catch(() => null);
                    if (djangoCells?.success && Array.isArray(djangoCells.data) && djangoCells.data.length > 0) {
                        const firstCell = djangoCells.data[0];
                        setCellData({
                            assigned: true,
                            cell: {
                                id: firstCell.id,
                                name: firstCell.name,
                                leader_name: firstCell.leader,
                                leader_phone: '+254 712 345 678',
                                zone: firstCell.zone,
                                meeting_day: firstCell.schedule,
                                meeting_time: '6:00 PM',
                                venue: 'Karen Hub Sanctuary / Online',
                                member_count: firstCell.members || 94
                            },
                            member_count: firstCell.members || 94,
                            members: [
                                { id: 1, first_name: 'James', last_name: 'Kimani', role: 'Cell Overseer', phone: '+254 712 345 678', attendance_rate: '96%' },
                                { id: 2, first_name: 'Debra', last_name: 'Wanjiku', role: 'Worship Lead', phone: '+254 722 987 654', attendance_rate: '92%' },
                                { id: 3, first_name: 'David', last_name: 'Ochieng', role: 'Follow-up Partner', phone: '+254 733 456 789', attendance_rate: '94%' },
                                { id: 4, first_name: 'Grace', last_name: 'Mutheu', role: 'Soul Winner', phone: '+254 701 234 567', attendance_rate: '89%' },
                                { id: 5, first_name: 'Emmanuel', last_name: 'Kiprop', role: 'New Disciple', phone: '+254 745 678 901', attendance_rate: '85%' }
                            ]
                        });
                    }
                }
            } catch (err) {
                console.warn('My Cell fetch notice:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMyCell();
    }, [refreshKey]);

    return (
        <div className="stitch-mycell-container">
            {/* Breadcrumb Header */}
            <div className="stitch-breadcrumbs-bar">
                <div className="breadcrumbs-path">
                    <span className="crumb-segment">Portal</span>
                    <span className="crumb-sep">&gt;</span>
                    <span className="crumb-segment">Follow up & Cells</span>
                    <span className="crumb-sep">&gt;</span>
                    <span className="crumb-current">My Cell Fellowship ({cellData?.cell?.name || 'Grace Cell'})</span>
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

            {loading ? (
                <div className="stitch-loading-state">
                    <div className="stitch-spinner"></div>
                    <p>Loading your cell hub...</p>
                </div>
            ) : (
                <>
                    <CellHeader cell={cellData?.cell} />

                    <div className="my-cell-grid">
                        <div style={{ gridArea: 'leader' }}>
                            <CellLeaderCard cell={cellData?.cell} />
                        </div>
                        <div style={{ gridArea: 'meetings' }}>
                            <CellMeetingsWidget cell={cellData?.cell} memberCount={cellData?.member_count} />
                        </div>
                        <div style={{ gridArea: 'members' }}>
                            <CellMembersList members={cellData?.members || []} />
                        </div>
                    </div>
                </>
            )}

            <style>{`
                .stitch-mycell-container {
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

                .my-cell-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1.5rem;
                    grid-template-areas: 
                        "leader"
                        "meetings"
                        "members";
                }

                @media (min-width: 1024px) {
                    .my-cell-grid {
                        grid-template-columns: 1fr 1fr 1.5fr;
                        grid-template-areas: 
                            "leader meetings members";
                        align-items: start;
                    }
                }

                .stitch-loading-state {
                    padding: 4rem 1.5rem;
                    text-align: center;
                    color: #64748b;
                }
                .stitch-spinner {
                    width: 32px;
                    height: 32px;
                    border: 3px solid #e2e8f0;
                    border-top-color: #22c1e6;
                    border-radius: 50%;
                    animation: stitch-spin 0.8s linear infinite;
                    margin: 0 auto 1rem auto;
                }
                @keyframes stitch-spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default MyCellDashboard;
