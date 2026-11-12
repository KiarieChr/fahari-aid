import React, { useState, useEffect, useContext } from 'react';
import api from '../../../services/api';
import DashboardCard from './DashboardCard';
import { ThemeContext } from '../../../context/ThemeContext';

const CellOverviewWidget = () => {
    const [cellData, setCellData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { theme } = useContext(ThemeContext);
    const isLight = theme === 'light';

    // Theme colors
    const colors = {
        text: isLight ? '#1e293b' : '#ffffff',
        textMuted: isLight ? '#64748b' : 'rgba(255,255,255,0.5)',
        surface: isLight ? '#f8fafc' : 'rgba(255,255,255,0.05)',
        surfaceAlt: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.08)',
        border: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)',
        accent: '#5d87ff',
        accentBg: isLight ? '#eef2ff' : 'rgba(93, 135, 255, 0.15)'
    };

    useEffect(() => {
        const fetchCellData = async () => {
            try {
                setLoading(true);
                const response = await api.get('/get_my_cell.php');
                if (response.success) {
                    setCellData(response.data);
                }
            } catch (err) {
                console.error('Error fetching cell data:', err);
                setError('Failed to load cell info');
            } finally {
                setLoading(false);
            }
        };
        fetchCellData();
    }, []);

    if (loading) {
        return (
            <DashboardCard title="My Cell Group">
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '3rem 0',
                    color: colors.textMuted
                }}>
                    Loading...
                </div>
            </DashboardCard>
        );
    }

    if (!cellData?.assigned) {
        return (
            <DashboardCard title="My Cell Group">
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem 0',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: colors.surfaceAlt,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        marginBottom: '1rem'
                    }}>
                        🏠
                    </div>
                    <div style={{ color: colors.text, fontWeight: '600', marginBottom: '0.5rem' }}>No Cell Assigned</div>
                    <div style={{ color: colors.textMuted, fontSize: '0.85rem' }}>
                        You haven't been assigned to a cell group yet.
                    </div>
                </div>
            </DashboardCard>
        );
    }

    const cell = cellData.cell;
    const members = cellData.members || [];
    const memberCount = cellData.member_count || members.length;

    return (
        <DashboardCard
            title="My Cell Group"
            headerAction={
                <button style={{
                    background: colors.accentBg,
                    color: colors.accent,
                    border: 'none',
                    borderRadius: '0.375rem',
                    padding: '0.375rem 0.75rem',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                }}>
                    View Details
                </button>
            }
        >
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ color: colors.text, fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                    {cell?.name || 'My Cell'}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: colors.textMuted, fontSize: '0.9rem' }}>
                    <span>Leader:</span>
                    <span style={{ color: colors.text, fontWeight: '600' }}>
                        {cell?.leader_name || 'Not assigned'}
                    </span>
                </div>
                {cell?.location && (
                    <div style={{ color: colors.textMuted, fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        📍 {cell.location}
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: colors.surface, padding: '1rem', borderRadius: '0.5rem' }}>
                    <div style={{ color: colors.textMuted, fontSize: '0.75rem', marginBottom: '0.25rem' }}>Members</div>
                    <div style={{ color: colors.text, fontSize: '1.25rem', fontWeight: '700' }}>{memberCount}</div>
                </div>
                <div style={{ background: colors.surface, padding: '1rem', borderRadius: '0.5rem' }}>
                    <div style={{ color: colors.textMuted, fontSize: '0.75rem', marginBottom: '0.25rem' }}>Meeting Day</div>
                    <div style={{ color: colors.accent, fontSize: '1.1rem', fontWeight: '700' }}>
                        {cell?.meeting_day || 'TBD'}
                    </div>
                </div>
            </div>

            {/* Members List */}
            {members.length > 0 && (
                <div>
                    <div style={{ fontSize: '0.75rem', color: colors.textMuted, textTransform: 'uppercase', fontWeight: '600', marginBottom: '0.75rem' }}>
                        Cell Members
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto' }}>
                        {members.slice(0, 5).map((member, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    background: colors.accentBg,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    color: colors.accent
                                }}>
                                    {member.first_name?.charAt(0) || '?'}
                                </div>
                                <span style={{ color: colors.text }}>
                                    {member.first_name} {member.last_name}
                                </span>
                            </div>
                        ))}
                        {members.length > 5 && (
                            <div style={{ color: colors.textMuted, fontSize: '0.75rem' }}>
                                +{members.length - 5} more
                            </div>
                        )}
                    </div>
                </div>
            )}
        </DashboardCard>
    );
};

export default CellOverviewWidget;
