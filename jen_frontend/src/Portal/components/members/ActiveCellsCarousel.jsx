import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';

const ActiveCellsCarousel = ({ onSelectCell, selectedCell }) => {
    const [cells, setCells] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCells = async () => {
            try {
                const res = await api.get('cells/');
                if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
                    setCells(res.data);
                } else if (Array.isArray(res) && res.length > 0) {
                    setCells(res);
                } else {
                    useFallbackCells();
                }
            } catch (err) {
                console.warn('Failed to load cells from Django backend, using fallback:', err);
                useFallbackCells();
            } finally {
                setLoading(false);
            }
        };

        const useFallbackCells = () => {
            setCells([
                {
                    id: 1,
                    name: 'Grace Fellowship Cell',
                    zone: 'Karen Zone',
                    leader: 'Pastor Daniel',
                    members: 94,
                    schedule: 'Wed 6:00 PM',
                    activePct: 96,
                    iconBg: '#eff6ff',
                    iconColor: '#2563eb',
                    badgeBg: '#ede9fe',
                    badgeColor: '#6d28d9'
                },
                {
                    id: 2,
                    name: 'Faith Cell',
                    zone: 'Westlands',
                    leader: 'Min. Debra',
                    members: 112,
                    schedule: 'Thu 6:30 PM',
                    activePct: 91,
                    iconBg: '#faf5ff',
                    iconColor: '#9333ea',
                    badgeBg: '#e0e7ff',
                    badgeColor: '#3730a3'
                },
                {
                    id: 3,
                    name: 'Shiloh Cell',
                    zone: 'Kilimani',
                    leader: 'Dcn. Brian',
                    members: 88,
                    schedule: 'Tue 7:00 PM',
                    activePct: 89,
                    iconBg: '#ecfeff',
                    iconColor: '#0891b2',
                    badgeBg: '#cffafe',
                    badgeColor: '#0e7490'
                },
                {
                    id: 4,
                    name: 'Bethel Cell',
                    zone: 'CBD Hub',
                    leader: 'Sis. Martha',
                    members: 74,
                    schedule: 'Wed 5:30 PM',
                    activePct: 84,
                    iconBg: '#f0fdf4',
                    iconColor: '#16a34a',
                    badgeBg: '#dcfce7',
                    badgeColor: '#15803d'
                },
                {
                    id: 5,
                    name: 'Zion Cell',
                    zone: 'Parklands',
                    leader: 'Bro. Kelvin',
                    members: 65,
                    schedule: 'Fri 6:00 PM',
                    activePct: 93,
                    iconBg: '#eef2ff',
                    iconColor: '#4338ca',
                    badgeBg: '#ede9fe',
                    badgeColor: '#5b21b6'
                },
                {
                    id: 6,
                    name: 'Victory Cell',
                    zone: 'Kileleshwa',
                    leader: 'Eld. David',
                    members: 85,
                    schedule: 'Sun 4:00 PM',
                    activePct: 97,
                    iconBg: '#ecfdf5',
                    iconColor: '#059669',
                    badgeBg: '#ccfbf1',
                    badgeColor: '#0f766e'
                }
            ]);
        };

        fetchCells();
    }, []);

    return (
        <div className="active-cells-section">
            {/* Header */}
            <div className="cells-section-header">
                <div className="header-left">
                    <span className="cells-folder-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                        </svg>
                    </span>
                    <h3 className="section-title">Active Cells & Outposts</h3>
                    <span className="zones-pill">{cells.length} Zones</span>
                </div>
                <Link to="/portal/cells" className="manage-cells-link">
                    Manage All Cells →
                </Link>
            </div>

            {/* Horizontal Cards Grid */}
            <div className="cells-cards-grid">
                {cells.map(c => {
                    const isSelected = selectedCell === c.name;
                    return (
                        <div
                            key={c.id}
                            className={`cell-card-item ${isSelected ? 'selected' : ''}`}
                            onClick={() => onSelectCell && onSelectCell(isSelected ? null : c.name)}
                        >
                            {/* Card Top: Zone Icon + Members Count */}
                            <div className="card-top">
                                <div className="cell-pin-icon" style={{ background: c.iconBg || '#eff6ff', color: c.iconColor || '#2563eb' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M12 2a5 5 0 0 0-5 5c0 5 5 11 5 11s5-6 5-11a5 5 0 0 0-5-5z"></path>
                                        <circle cx="12" cy="7" r="1.5"></circle>
                                    </svg>
                                </div>
                                <span className="members-badge" style={{ background: c.badgeBg || '#ede9fe', color: c.badgeColor || '#6d28d9' }}>
                                    {c.members} Members
                                </span>
                            </div>

                            {/* Card Body */}
                            <div className="card-body">
                                <h4 className="cell-name">{c.name}</h4>
                                <span className="cell-zone-leader">{c.zone} • {c.leader}</span>
                            </div>

                            {/* Card Footer: Schedule + Active Pct */}
                            <div className="card-footer">
                                <span className="cell-schedule">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                    </svg>
                                    <span>{c.schedule}</span>
                                </span>
                                <span className="cell-active-rate">{c.activePct}% active</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <style>{`
                .active-cells-section {
                    margin-bottom: 1.5rem;
                }

                .cells-section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 0.85rem;
                }
                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 0.55rem;
                }
                .cells-folder-icon {
                    color: #2563eb;
                    display: flex;
                    align-items: center;
                }
                .portal-wrapper.dark-mode .cells-folder-icon {
                    color: #22c1e6;
                }
                .section-title {
                    font-size: 0.98rem;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0;
                }
                .portal-wrapper.dark-mode .section-title {
                    color: #ffffff;
                }
                .zones-pill {
                    background: #eff6ff;
                    color: #2563eb;
                    font-size: 0.68rem;
                    font-weight: 600;
                    padding: 0.15rem 0.5rem;
                    border-radius: 9999px;
                }
                .portal-wrapper.dark-mode .zones-pill {
                    background: rgba(37, 99, 235, 0.15);
                    color: #60a5fa;
                }

                .manage-cells-link {
                    font-size: 0.76rem;
                    font-weight: 600;
                    color: #2563eb;
                    text-decoration: none;
                }
                .portal-wrapper.dark-mode .manage-cells-link {
                    color: #22c1e6;
                }
                .manage-cells-link:hover {
                    text-decoration: underline;
                }

                .cells-cards-grid {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 0.85rem;
                }

                .cell-card-item {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.85rem;
                    padding: 0.9rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }
                .portal-wrapper.dark-mode .cell-card-item {
                    background: #151128;
                    border-color: rgba(255, 255, 255, 0.08);
                }
                .cell-card-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    border-color: #cbd5e1;
                }
                .cell-card-item.selected {
                    border-color: #2563eb;
                    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
                }
                .portal-wrapper.dark-mode .cell-card-item.selected {
                    border-color: #22c1e6;
                    box-shadow: 0 0 0 2px rgba(34, 193, 230, 0.2);
                }

                .card-top {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 0.65rem;
                }
                .cell-pin-icon {
                    width: 26px;
                    height: 26px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .members-badge {
                    font-size: 0.65rem;
                    font-weight: 600;
                    padding: 0.15rem 0.45rem;
                    border-radius: 9999px;
                }

                .card-body {
                    margin-bottom: 0.65rem;
                }
                .cell-name {
                    font-size: 0.84rem;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0 0 0.15rem 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .portal-wrapper.dark-mode .cell-name {
                    color: #ffffff;
                }
                .cell-zone-leader {
                    font-size: 0.68rem;
                    color: #64748b;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: block;
                }
                .portal-wrapper.dark-mode .cell-zone-leader {
                    color: #94a3b8;
                }

                .card-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-size: 0.66rem;
                    color: #64748b;
                    padding-top: 0.45rem;
                    border-top: 1px solid #f8fafc;
                }
                .portal-wrapper.dark-mode .card-footer {
                    border-top-color: rgba(255, 255, 255, 0.04);
                    color: #94a3b8;
                }
                .cell-schedule {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }
                .cell-active-rate {
                    font-weight: 600;
                    color: #10b981;
                }

                @media (max-width: 1200px) {
                    .cells-cards-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }
                @media (max-width: 680px) {
                    .cells-cards-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
            `}</style>
        </div>
    );
};

export default ActiveCellsCarousel;
