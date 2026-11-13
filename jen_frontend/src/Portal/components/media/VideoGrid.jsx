import React, { useState, useContext } from 'react';
import { ThemeContext } from '../../../context/ThemeContext';

const VideoCard = ({ item, onPlay, isDark }) => {
    const title = item.title;
    const preacher = item.preacher || 'Speaker';
    const series = item.series || 'Sunday Service';
    const date = item.date
        ? new Date(item.date).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })
        : '';
    const duration = item.duration || '45:00';
    const thumbnail = item.thumbnail_url || 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=600';
    const views = item.views_count || 0;

    return (
        <div
            onClick={() => onPlay(item)}
            style={{
                background: isDark ? '#1a1625' : '#ffffff',
                borderRadius: '1rem',
                overflow: 'hidden',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px -6px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
            }}
        >
            {/* Thumbnail with Overlay & Duration Badge */}
            <div style={{
                height: '180px',
                backgroundImage: `url(${thumbnail})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'rgba(34, 193, 230, 0.9)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0f172a',
                        fontSize: '1.2rem',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}>
                        ▶
                    </div>
                </div>

                {/* Duration Badge */}
                <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    background: 'rgba(0,0,0,0.75)',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontWeight: '600'
                }}>
                    ⏱ {duration}
                </div>

                {/* Series Badge */}
                <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    background: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(4px)',
                    color: '#22c1e6',
                    fontSize: '0.68rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontWeight: '700',
                    textTransform: 'uppercase'
                }}>
                    {series}
                </div>
            </div>

            {/* Content Details */}
            <div style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                <div>
                    <h3 style={{
                        color: isDark ? '#ffffff' : '#0f172a',
                        fontSize: '1rem',
                        fontWeight: '700',
                        margin: '0 0 0.35rem 0',
                        lineHeight: 1.35
                    }}>
                        {title}
                    </h3>
                    <div style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.8rem', fontWeight: '500' }}>
                        {preacher}
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '0.85rem',
                    paddingTop: '0.75rem',
                    borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'}`,
                    fontSize: '0.75rem',
                    color: isDark ? '#64748b' : '#94a3b8'
                }}>
                    <span>📅 {date}</span>
                    <span>👁 {views} views</span>
                </div>
            </div>
        </div>
    );
};

const VideoGrid = ({ videos = [] }) => {
    const { theme } = useContext(ThemeContext || {});
    const isDark = theme === 'dark';
    const [activeVideo, setActiveVideo] = useState(null);

    const getYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const mediaUrl = activeVideo?.media_url || activeVideo?.media_file_url;
    const ytId = getYouTubeId(mediaUrl);

    return (
        <>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.25rem'
            }}>
                {videos.map(item => (
                    <VideoCard
                        key={item.id}
                        item={item}
                        onPlay={setActiveVideo}
                        isDark={isDark}
                    />
                ))}
            </div>

            {/* Video Modal Player */}
            {activeVideo && (
                <div
                    onClick={() => setActiveVideo(null)}
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.85)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        padding: '1.5rem'
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: '#0f172a',
                            borderRadius: '1.25rem',
                            maxWidth: '900px',
                            width: '100%',
                            overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1.15rem 1.5rem',
                            borderBottom: '1px solid rgba(255,255,255,0.08)'
                        }}>
                            <div>
                                <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.1rem', fontWeight: '700' }}>
                                    {activeVideo.title}
                                </h3>
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                                    {activeVideo.preacher} • {activeVideo.series}
                                </span>
                            </div>
                            <button
                                onClick={() => setActiveVideo(null)}
                                style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    color: '#ffffff',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{ padding: '1.25rem' }}>
                            {ytId ? (
                                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: '0.75rem', overflow: 'hidden' }}>
                                    <iframe
                                        src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                                        title={activeVideo.title}
                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            ) : mediaUrl ? (
                                <video
                                    controls
                                    autoPlay
                                    src={mediaUrl}
                                    style={{ width: '100%', maxHeight: '500px', borderRadius: '0.75rem' }}
                                />
                            ) : (
                                <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                                    Broadcast video feed currently offline.
                                </div>
                            )}

                            {activeVideo.description && (
                                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '1rem 0 0 0', lineHeight: 1.5 }}>
                                    {activeVideo.description}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default VideoGrid;
