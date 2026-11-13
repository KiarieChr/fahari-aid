import React, { useContext } from 'react';
import { ThemeContext } from '../../../context/ThemeContext';

const AudioPlayer = ({
    item,
    title,
    preacher,
    duration,
    date,
    series,
    isPlaying,
    onTogglePlay,
    progress = 0,
    onSeek
}) => {
    const { theme } = useContext(ThemeContext || {});
    const isDark = theme === 'dark';

    const displayTitle = item?.title || title || 'Audio Sermon';
    const displayPreacher = item?.preacher || preacher || 'Speaker';
    const displayDuration = item?.duration || duration || '45:00';
    const displaySeries = item?.series || series || 'Sunday Service';
    const displayDate = item?.date
        ? new Date(item.date).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })
        : date || '';

    const handleProgressClick = (e) => {
        if (!onSeek) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const percentage = Math.max(0, Math.min(100, (clickX / width) * 100));
        onSeek(percentage);
    };

    return (
        <div style={{
            background: isDark ? '#1a1625' : '#ffffff',
            borderRadius: '1rem',
            padding: '1.25rem 1.5rem',
            border: `1px solid ${isPlaying ? '#22c1e6' : (isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0')}`,
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            boxShadow: isPlaying ? '0 4px 20px rgba(34, 193, 230, 0.15)' : '0 1px 3px rgba(0,0,0,0.02)',
            transition: 'all 0.2s ease'
        }}>
            {/* Play/Pause Button */}
            <button
                onClick={onTogglePlay}
                style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: isPlaying ? '#22c1e6' : (isDark ? 'rgba(34, 193, 230, 0.15)' : '#eff6ff'),
                    color: isPlaying ? '#0f172a' : '#22c1e6',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'transform 0.15s ease, background 0.15s ease',
                    boxShadow: isPlaying ? '0 4px 12px rgba(34, 193, 230, 0.35)' : 'none'
                }}
            >
                {isPlaying ? '⏸' : '▶'}
            </button>

            {/* Sermon Metadata & Progress Bar */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem', gap: '0.5rem' }}>
                    <div style={{ minWidth: 0 }}>
                        <div style={{
                            color: isDark ? '#f8fafc' : '#0f172a',
                            fontWeight: '700',
                            fontSize: '0.98rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {displayTitle}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                            <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.8rem', fontWeight: '500' }}>
                                {displayPreacher}
                            </span>
                            <span style={{ color: isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1' }}>•</span>
                            <span style={{
                                background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                                color: isDark ? '#cbd5e1' : '#475569',
                                fontSize: '0.72rem',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '4px',
                                fontWeight: '600'
                            }}>
                                {displaySeries}
                            </span>
                            {displayDate && (
                                <>
                                    <span style={{ color: isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1' }}>•</span>
                                    <span style={{ color: isDark ? '#64748b' : '#94a3b8', fontSize: '0.75rem' }}>{displayDate}</span>
                                </>
                            )}
                        </div>
                    </div>
                    <div style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.8rem', fontWeight: '600', flexShrink: 0 }}>
                        {displayDuration}
                    </div>
                </div>

                {/* Interactive Progress Bar */}
                <div
                    onClick={handleProgressClick}
                    style={{
                        width: '100%',
                        height: '6px',
                        background: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                        borderRadius: '9999px',
                        position: 'relative',
                        cursor: 'pointer',
                        marginTop: '0.6rem'
                    }}
                >
                    <div style={{
                        width: `${Math.min(100, Math.max(0, progress))}%`,
                        height: '100%',
                        background: '#22c1e6',
                        borderRadius: '9999px',
                        transition: isPlaying ? 'none' : 'width 0.2s ease'
                    }}></div>
                </div>
            </div>

            {/* Actions: Direct Link / Download */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                {item?.media_url && (
                    <a
                        href={item.media_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open Source / Download"
                        style={{
                            background: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                            border: 'none',
                            color: isDark ? '#cbd5e1' : '#475569',
                            borderRadius: '8px',
                            padding: '0.5rem 0.65rem',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center'
                        }}
                    >
                        ⬇️
                    </a>
                )}
            </div>
        </div>
    );
};

export default AudioPlayer;
