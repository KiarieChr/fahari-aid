import React from 'react';

const StatCard = ({ label, value, description, icon }) => (
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
            {icon && <span style={{ fontSize: '1.25rem', opacity: 0.8 }}>{icon}</span>}
        </div>
        <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-color)' }}>
            {value}
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {description}
        </div>
    </div>
);

const FastingStatsCards = () => {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
        }}>
            <StatCard
                label="Total Commitments"
                value="20"
                description="Total prayer commitments"
                icon="🔥"
            />
            <StatCard
                label="Unique Participants"
                value="3"
                description="Distinct participants"
                icon="👥"
            />
            <StatCard
                label="Most Popular Day"
                value="Wednesday"
                description="Most selected fasting day"
                icon="📅"
            />
            <StatCard
                label="Today's Commitments"
                value="3"
                description="Commitments submitted today"
                icon="⚡"
            />
        </div>
    );
};

export default FastingStatsCards;
