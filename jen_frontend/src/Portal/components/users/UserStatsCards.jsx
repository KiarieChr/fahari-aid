import React, { useState, useEffect, useContext } from 'react';
import { getUserStats } from '../../../services/userApi';
import { ThemeContext } from '../../../context/ThemeContext';

const StatCard = ({ title, value, icon, accentColor, subtext, isDark }) => (
    <div style={{
        background: isDark ? '#1a1625' : '#ffffff',
        borderRadius: '1rem',
        padding: '1.25rem 1.35rem',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        transition: 'transform 0.15s ease'
    }}>
        <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: isDark ? `${accentColor}20` : `${accentColor}12`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.35rem',
            color: accentColor,
            flexShrink: 0
        }}>
            {icon}
        </div>
        <div>
            <div style={{
                fontSize: '1.65rem',
                fontWeight: '800',
                color: isDark ? '#ffffff' : '#0f172a',
                lineHeight: 1.15
            }}>
                {value}
            </div>
            <div style={{
                color: isDark ? '#94a3b8' : '#64748b',
                fontSize: '0.78rem',
                fontWeight: '600',
                marginTop: '0.2rem',
                letterSpacing: '0.02em'
            }}>
                {title}
            </div>
            {subtext && (
                <div style={{ fontSize: '0.7rem', color: accentColor, marginTop: '2px', fontWeight: '600' }}>
                    {subtext}
                </div>
            )}
        </div>
    </div>
);

const UserStatsCards = () => {
    const { theme } = useContext(ThemeContext || {});
    const isDark = theme === 'dark';

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchStats = async () => {
            try {
                setLoading(true);
                const data = await getUserStats();
                if (isMounted && data?.stats) {
                    setStats(data.stats);
                }
            } catch (err) {
                console.error('Failed to load user stats:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchStats();
        return () => { isMounted = false; };
    }, []);

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
            width: '100%'
        }}>
            <StatCard
                isDark={isDark}
                icon="👥"
                value={loading ? '...' : (stats?.total_users ?? 0)}
                title="Total Users"
                accentColor="#2563eb"
                subtext="Registered logins"
            />
            <StatCard
                isDark={isDark}
                icon="🟢"
                value={loading ? '...' : (stats?.active_users ?? 0)}
                title="Active Credentials"
                accentColor="#10b981"
                subtext="Authorized & active"
            />
            <StatCard
                isDark={isDark}
                icon="👑"
                value={loading ? '...' : (stats?.super_admins ?? 0)}
                title="Super Admins"
                accentColor="#8b5cf6"
                subtext="Full access privileges"
            />
            <StatCard
                isDark={isDark}
                icon="🛡️"
                value={loading ? '...' : (stats?.cell_leaders ?? 0)}
                title="Cell Leaders"
                accentColor="#0ea5e9"
                subtext="Cell fellowship overseers"
            />
            <StatCard
                isDark={isDark}
                icon="⛔"
                value={loading ? '...' : (stats?.inactive_users ?? 0)}
                title="Deactivated"
                accentColor="#ef4444"
                subtext={stats?.inactive_users > 0 ? "Locked accounts" : "None locked"}
            />
        </div>
    );
};

export default UserStatsCards;
