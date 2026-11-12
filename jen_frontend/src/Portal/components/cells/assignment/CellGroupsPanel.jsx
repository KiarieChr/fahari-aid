import React from 'react';

const CellGroupsPanel = ({ cells: apiCells = [], onAssign }) => {
    const cells = apiCells.map(c => ({
        id: c.id,
        name: c.name || c.code,
        leader: c.leader_name || '—',
        current: c.member_count,
        max: c.capacity || 15,
        location: c.location || '—'
    }));

    const getCapacityColor = (current, max) => {
        const ratio = current / max;
        if (ratio >= 1) return '#ef4444'; // Red
        if (ratio >= 0.8) return '#f59e0b'; // Amber
        return 'var(--primary)'; // Blue
    };

    return (
        <div style={{
            background: 'var(--surface-1)',
            borderRadius: '1rem',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden'
        }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)' }}>
                <h3 style={{ margin: '0', color: 'var(--text-color)', fontSize: '1rem' }}>Available Cell Groups</h3>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'grid', gap: '1rem' }}>
                {cells.map(cell => {
                    const capacityColor = getCapacityColor(cell.current, cell.max);
                    const isFull = cell.current >= cell.max;

                    return (
                        <div key={cell.id} style={{
                            background: 'var(--bg-color)',
                            borderRadius: '0.75rem',
                            padding: '1rem',
                            border: '1px solid var(--border-color)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                <div>
                                    <div style={{ color: 'var(--text-color)', fontWeight: '600', fontSize: '0.95rem' }}>{cell.name}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{cell.location} • {cell.leader}</div>
                                </div>
                                <button
                                    onClick={() => onAssign(cell.id)}
                                    disabled={isFull}
                                    style={{
                                        background: isFull ? 'var(--border-color)' : 'rgba(34, 193, 230, 0.1)',
                                        color: isFull ? 'var(--text-muted)' : 'var(--primary)',
                                        border: isFull ? 'none' : '1px solid #22c1e6',
                                        borderRadius: '0.5rem',
                                        padding: '0.3rem 0.8rem',
                                        fontSize: '0.75rem',
                                        cursor: isFull ? 'not-allowed' : 'pointer',
                                        fontWeight: '600'
                                    }}
                                >
                                    {isFull ? 'Full' : 'Assign'}
                                </button>
                            </div>

                            {/* Capacity Bar */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <div style={{ flex: 1, height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${(cell.current / cell.max) * 100}%`,
                                        height: '100%',
                                        background: capacityColor,
                                        borderRadius: '3px'
                                    }}></div>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: capacityColor, fontWeight: '600', width: '45px', textAlign: 'right' }}>
                                    {cell.current}/{cell.max}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CellGroupsPanel;
