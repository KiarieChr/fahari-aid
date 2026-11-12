import React from 'react';

const StatCard = ({ icon, value, label, color = 'var(--primary)', alert = false }) => (
    <div style={{
        background: 'var(--surface-1)',
        borderRadius: '1rem',
        padding: '1.25rem',
        border: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
    }}>
        <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '10px',
            background: `rgba(${color === 'var(--primary)' ? '34, 193, 230' : (color === '#ef4444' ? '239, 68, 68' : (color === '#f59e0b' ? '245, 158, 11' : '239, 243, 193'))}, 0.1)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            color: color
        }}>
            {icon}
        </div>
        <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: alert ? '#ef4444' : 'var(--text-color)', lineHeight: 1 }}>{value}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '500', marginTop: '0.2rem' }}>{label}</div>
        </div>
    </div>
);

const AssignmentStatsCards = ({ stats: s, loading }) => {
    const d = s || {};
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
        }}>
            <StatCard icon="👥" value={loading ? '—' : String(d.total_members ?? 0)} label="Total Members" color="#a855f7" />
            <StatCard icon="✅" value={loading ? '—' : String(d.assigned ?? 0)} label="Assigned" color="#22c1e6" />
            <StatCard icon="⏳" value={loading ? '—' : String(d.unassigned ?? 0)} label="Unassigned" color="#f59e0b" alert={true} />
            <StatCard icon="🏘️" value={loading ? '—' : String(d.total_cells ?? 0)} label="Total Cells" color="#eff3c1" />
            <StatCard icon="⚠️" value={loading ? '—' : String(d.at_capacity ?? 0)} label="At Capacity" color="#ef4444" />
        </div>
    );
};

export default AssignmentStatsCards;
