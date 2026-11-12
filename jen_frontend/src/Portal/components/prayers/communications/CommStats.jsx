import React from 'react';

const StatCard = ({ label, value, description, icon, color = 'var(--primary)' }) => (
    <div style={{
        background: 'var(--surface-1)',
        borderRadius: '1rem',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: '1px solid var(--border-color)'
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                letterSpacing: '0.05em',
                color: 'var(--text-muted)',
                textTransform: 'uppercase'
            }}>
                {label}
            </span>
            <div style={{
                width: '40px', height: '40px',
                borderRadius: '50%',
                background: color === 'var(--primary)' ? 'rgba(34, 193, 230, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: color,
                fontSize: '1.2rem'
            }}>
                {icon}
            </div>
        </div>
        <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-color)' }}>
            {value}
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {description}
        </div>
    </div>
);

const CommStats = () => {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
        }}>
            <StatCard
                label="Alerts Sent Today"
                value="1,240"
                description="+12% from last week"
                icon="📢"
            />
            <StatCard
                label="Active Intercessors"
                value="856"
                description="Reachable via SMS/App"
                icon="👥"
                color="#22c55e"
            />
            <StatCard
                label="SMS Balance"
                value="4,500"
                description="Credits remaining"
                icon="💳"
            />
            <StatCard
                label="Avg. Open Rate"
                value="98%"
                description="For push notifications"
                icon="📈"
                color="#22c55e"
            />
        </div>
    );
};

export default CommStats;
