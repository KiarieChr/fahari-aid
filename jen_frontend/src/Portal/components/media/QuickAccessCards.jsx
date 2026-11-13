import React, { useContext } from 'react';
import { ThemeContext } from '../../../context/ThemeContext';

const QuickAccessCard = ({
    badge,
    icon,
    title,
    subtitle,
    statLabel,
    accentColor,
    onClick,
    isDark
}) => (
    <div
        onClick={onClick}
        className="stitch-quick-access-card"
        style={{
            background: isDark ? '#1a1625' : '#ffffff',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
        }}
    >
        {/* Top Header: Icon + Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: isDark ? `${accentColor}20` : `${accentColor}12`,
                color: accentColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 2px 8px ${accentColor}25`
            }}>
                {icon}
            </div>

            <span style={{
                background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                color: isDark ? '#94a3b8' : '#64748b',
                padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
                fontSize: '0.68rem',
                fontWeight: '700',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
            }}>
                {badge}
            </span>
        </div>

        {/* Title & Description */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{
                color: isDark ? '#ffffff' : '#0f172a',
                fontSize: '1.15rem',
                fontWeight: '700',
                margin: '0 0 0.4rem 0',
                lineHeight: 1.3
            }}>
                {title}
            </h3>
            <p style={{
                color: isDark ? '#94a3b8' : '#64748b',
                fontSize: '0.85rem',
                margin: 0,
                lineHeight: 1.5
            }}>
                {subtitle}
            </p>
        </div>

        {/* Footer Meta Row & Action Button */}
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'}`,
        }}>
            <span style={{
                fontSize: '0.78rem',
                color: isDark ? '#94a3b8' : '#64748b',
                fontWeight: '600'
            }}>
                {statLabel}
            </span>

            <div
                className="card-action-link"
                style={{
                    color: accentColor,
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    transition: 'transform 0.15s ease'
                }}
            >
                <span>Access</span>
                <span className="arrow-icon">→</span>
            </div>
        </div>
    </div>
);

const QuickAccessCards = ({ onNavigate }) => {
    const { theme } = useContext(ThemeContext || {});
    const isDark = theme === 'dark';

    return (
        <div style={{ marginTop: '2rem', width: '100%' }}>
            {/* Section Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                    <h3 style={{
                        color: isDark ? '#ffffff' : '#0f172a',
                        fontSize: '1.15rem',
                        fontWeight: '800',
                        margin: '0 0 0.25rem 0'
                    }}>
                        Media Hub Quick Access
                    </h3>
                    <p style={{ margin: 0, color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.825rem' }}>
                        Direct shortcuts into media libraries, livestreams, photo archives, and the content studio
                    </p>
                </div>
            </div>

            {/* 4 Cards Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.25rem',
                width: '100%'
            }}>
                {/* 1. Audio Sermons */}
                <QuickAccessCard
                    isDark={isDark}
                    badge="Podcasts & Audio"
                    accentColor="#22c1e6"
                    icon={(
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                            <line x1="12" y1="19" x2="12" y2="23"></line>
                            <line x1="8" y1="23" x2="16" y2="23"></line>
                        </svg>
                    )}
                    title="Audio Sermons Archive"
                    subtitle="Stream, study, and download apostolic teachings and pulpit recordings."
                    statLabel="Interactive Audio Player"
                    onClick={() => onNavigate('audio')}
                />

                {/* 2. Video Broadcasts */}
                <QuickAccessCard
                    isDark={isDark}
                    badge="Livestreams & HD"
                    accentColor="#ef4444"
                    icon={(
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="23 7 16 12 23 17 23 7"></polygon>
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                        </svg>
                    )}
                    title="Video Broadcasts Vault"
                    subtitle="Watch Sunday celebration livestreams, conferences, and video messages."
                    statLabel="Full HD Broadcasts"
                    onClick={() => onNavigate('video')}
                />

                {/* 3. Photo Vault */}
                <QuickAccessCard
                    isDark={isDark}
                    badge="Photo Archives"
                    accentColor="#10b981"
                    icon={(
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                    )}
                    title="Ministry Photo Vault"
                    subtitle="Browse high-resolution event moments, youth summits, and outreach albums."
                    statLabel="Lightbox Image Viewer"
                    onClick={() => onNavigate('photos')}
                />

                {/* 4. Content Studio */}
                <QuickAccessCard
                    isDark={isDark}
                    badge="Publishing Studio"
                    accentColor="#8b5cf6"
                    icon={(
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                    )}
                    title="Content Management Studio"
                    subtitle="Publish new audio sermons, embed video broadcasts, and upload photo sets."
                    statLabel="Studio Upload Controls"
                    onClick={() => onNavigate('management')}
                />
            </div>

            <style>{`
                .stitch-quick-access-card {
                    border-radius: 1.15rem;
                    border-width: 1px;
                    border-style: solid;
                    padding: 1.5rem;
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    min-height: 200px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.02);
                    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, border-color 0.2s ease;
                }
                .stitch-quick-access-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 28px -6px rgba(0, 0, 0, 0.08);
                    border-color: rgba(34, 193, 230, 0.4) !important;
                }
                .stitch-quick-access-card:hover .card-action-link {
                    transform: translateX(4px);
                }
                .stitch-quick-access-card:hover .arrow-icon {
                    transform: translateX(3px);
                }
                .arrow-icon {
                    display: inline-block;
                    transition: transform 0.15s ease;
                }
            `}</style>
        </div>
    );
};

export default QuickAccessCards;
