import React, { useState, useEffect, useContext } from 'react';
import { getMediaStats } from '../../../services/mediaApi';
import { ThemeContext } from '../../../context/ThemeContext';

const StitchKpiCard = ({ icon, badge, label, value, subtext, lineColor, isDark }) => (
    <div className="stitch-kpi-card" style={{
        background: isDark ? '#1a1625' : '#ffffff',
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
    }}>
        <div className="kpi-header">
            <div className="kpi-icon-wrap" style={{ background: icon.bg, color: icon.color }}>
                {icon.svg}
            </div>
            {badge && (
                <span className="kpi-badge" style={{ background: badge.bg, color: badge.color }}>
                    {badge.text}
                </span>
            )}
        </div>
        <div className="kpi-content">
            <span className="kpi-label" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>{label}</span>
            <div className="kpi-value" style={{ color: isDark ? '#ffffff' : '#0f172a' }}>{value}</div>
        </div>
        <div className="kpi-footer">
            <div className="kpi-progress-track" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' }}>
                <div className="kpi-progress-fill" style={{ background: lineColor, width: '85%' }}></div>
            </div>
            <span className="kpi-subtext" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>{subtext}</span>
        </div>
    </div>
);

const MediaStatsCards = ({ stats: propStats }) => {
    const { theme } = useContext(ThemeContext || {});
    const isDark = theme === 'dark';

    const [stats, setStats] = useState(propStats || null);
    const [loading, setLoading] = useState(!propStats);

    useEffect(() => {
        if (propStats) {
            setStats(propStats);
            return;
        }
        let isMounted = true;
        const fetchStats = async () => {
            try {
                setLoading(true);
                const data = await getMediaStats();
                if (isMounted && data?.stats) {
                    setStats(data.stats);
                }
            } catch (err) {
                console.error('Failed to load media stats:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchStats();
        return () => { isMounted = false; };
    }, [propStats]);

    const formatNumber = (num) => {
        if (!num && num !== 0) return '0';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
        return num.toString();
    };

    return (
        <div className="stitch-media-kpis">
            <StitchKpiCard
                isDark={isDark}
                icon={{
                    bg: isDark ? 'rgba(79, 70, 229, 0.15)' : '#eef2ff',
                    color: '#6366f1',
                    svg: (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                            <line x1="12" y1="19" x2="12" y2="23"></line>
                            <line x1="8" y1="23" x2="16" y2="23"></line>
                        </svg>
                    )
                }}
                badge={{ bg: isDark ? 'rgba(79, 70, 229, 0.2)' : '#eef2ff', color: '#6366f1', text: 'Audio Archives' }}
                label="TOTAL AUDIO SERMONS"
                value={loading ? '...' : (stats?.audio_count ?? 0)}
                subtext="Spiritual teachings & messages"
                lineColor="#6366f1"
            />

            <StitchKpiCard
                isDark={isDark}
                icon={{
                    bg: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
                    color: '#ef4444',
                    svg: (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="23 7 16 12 23 17 23 7"></polygon>
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                        </svg>
                    )
                }}
                badge={{ bg: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fef2f2', color: '#ef4444', text: 'Full HD' }}
                label="VIDEO BROADCASTS"
                value={loading ? '...' : (stats?.video_count ?? 0)}
                subtext="Live stream archives & services"
                lineColor="#ef4444"
            />

            <StitchKpiCard
                isDark={isDark}
                icon={{
                    bg: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5',
                    color: '#10b981',
                    svg: (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                    )
                }}
                badge={{ bg: isDark ? 'rgba(16, 185, 129, 0.2)' : '#ecfdf5', color: '#10b981', text: 'Photo Vault' }}
                label="EVENT GALLERIES"
                value={loading ? '...' : (stats?.gallery_count ?? 0)}
                subtext="High-resolution church moments"
                lineColor="#10b981"
            />

            <StitchKpiCard
                isDark={isDark}
                icon={{
                    bg: isDark ? 'rgba(14, 165, 233, 0.15)' : '#f0f9ff',
                    color: '#0ea5e9',
                    svg: (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    )
                }}
                badge={{ bg: isDark ? 'rgba(14, 165, 233, 0.2)' : '#f0f9ff', color: '#0ea5e9', text: 'Engagement' }}
                label="TOTAL VIEWS & LISTENS"
                value={loading ? '...' : formatNumber(stats?.total_views ?? 0)}
                subtext="Congregational outreach & impact"
                lineColor="#0ea5e9"
            />

            <style>{`
                .stitch-media-kpis {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1rem;
                    margin: 1.25rem 0;
                }
                @media (max-width: 1024px) {
                    .stitch-media-kpis {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                @media (max-width: 640px) {
                    .stitch-media-kpis {
                        grid-template-columns: 1fr;
                    }
                }
                .stitch-kpi-card {
                    border-radius: 1rem;
                    border-width: 1px;
                    border-style: solid;
                    padding: 1.25rem 1.35rem 1.15rem 1.35rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    min-height: 145px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
                    transition: transform 0.15s ease, box-shadow 0.15s ease;
                }
                .stitch-kpi-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px -4px rgba(0, 0, 0, 0.08);
                }
                .kpi-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 0.75rem;
                }
                .kpi-icon-wrap {
                    width: 38px;
                    height: 38px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .kpi-badge {
                    font-size: 0.68rem;
                    font-weight: 600;
                    padding: 0.2rem 0.55rem;
                    border-radius: 9999px;
                }
                .kpi-content {
                    display: flex;
                    flex-direction: column;
                    gap: 0.2rem;
                }
                .kpi-label {
                    font-size: 0.68rem;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                }
                .kpi-value {
                    font-size: 1.85rem;
                    font-weight: 800;
                    line-height: 1.15;
                }
                .kpi-footer {
                    display: flex;
                    flex-direction: column;
                    gap: 0.35rem;
                    margin-top: 0.75rem;
                }
                .kpi-progress-track {
                    width: 100%;
                    height: 4px;
                    border-radius: 9999px;
                    overflow: hidden;
                }
                .kpi-progress-fill {
                    height: 100%;
                    border-radius: 9999px;
                }
                .kpi-subtext {
                    font-size: 0.72rem;
                }
            `}</style>
        </div>
    );
};

export default MediaStatsCards;
