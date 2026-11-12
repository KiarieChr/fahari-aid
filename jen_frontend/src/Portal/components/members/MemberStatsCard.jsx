import React, { useState, useEffect } from 'react';
import { getMemberStats } from '../../../services/membersApi';

const StatCard = ({ title, value, label, description, icon, color = 'var(--primary)', loading }) => (
    <div style={{
        background: 'var(--surface-1)',
        borderRadius: '1rem',
        padding: '1.25rem',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        position: 'relative',
        overflow: 'hidden'
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>{title}</div>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-color)', margin: '0.2rem 0' }}>
                    {loading ? '...' : value}
                </div>
            </div>
            <div style={{
                background: `rgba(${color === 'var(--primary)' ? '34, 193, 230' : (color === '#4ade80' ? '74, 222, 128' : (color === '#f59e0b' ? '245, 158, 11' : '168, 85, 247'))}, 0.1)`,
                color: color,
                borderRadius: '0.5rem',
                padding: '0.5rem',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {icon}
            </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto' }}>
            {label && <span style={{ background: `rgba(${color === 'var(--primary)' ? '34, 193, 230' : (color === '#4ade80' ? '74, 222, 128' : (color === '#f59e0b' ? '245, 158, 11' : '168, 85, 247'))}, 0.1)`, padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', color: color, fontWeight: '600' }}>{label}</span>}
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{description}</span>
        </div>
    </div>
);

const MemberStatsCard = () => {
    const [stats, setStats] = useState({
        total_members: 0,
        committed_members: 0,
        linked_accounts: 0,
        unlinked_accounts: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await getMemberStats();
                if (res.success && res.data) {
                    setStats(res.data);
                }
            } catch (err) {
                console.error('Failed to load member stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const formatNumber = (num) => {
        return (num || 0).toLocaleString();
    };

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
        }}>
            <StatCard
                title="Total Members"
                value={formatNumber(stats.total_members)}
                label="Registered"
                description="All registered members"
                icon="👥"
                color="#22c1e6"
                loading={loading}
            />
            <StatCard
                title="Committed Members"
                value={formatNumber(stats.committed_members)}
                label="Committed"
                description="Formal commitment made"
                icon="🤝"
                color="#4ade80"
                loading={loading}
            />
            <StatCard
                title="Linked Accounts"
                value={formatNumber(stats.linked_accounts)}
                label="Linked"
                description="Committed & ID linked"
                icon="🔗"
                color="#a855f7"
                loading={loading}
            />
            <StatCard
                title="Unlinked Accounts"
                value={formatNumber(stats.unlinked_accounts)}
                label="Unlinked"
                description="Action required"
                icon="⚠️"
                color="#f59e0b"
                loading={loading}
            />
        </div>
    );
};

export default MemberStatsCard;
