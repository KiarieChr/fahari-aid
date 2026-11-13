import React, { useState, useEffect } from 'react';
import { getLatestMedia } from '../../../services/mediaApi';

const LatestSermonHero = ({ latestItem: propItem }) => {
    const [item, setItem] = useState(propItem || null);
    const [loading, setLoading] = useState(!propItem);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (propItem) {
            setItem(propItem);
            return;
        }
        let isMounted = true;
        const fetchLatest = async () => {
            try {
                setLoading(true);
                const data = await getLatestMedia();
                if (isMounted && data?.item) {
                    setItem(data.item);
                }
            } catch (err) {
                console.error('Failed to load latest sermon:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchLatest();
        return () => { isMounted = false; };
    }, [propItem]);

    const title = item?.title || 'The Power of Faith (Live Sunday Broadcast)';
    const preacher = item?.preacher || 'Pst. Timothy';
    const dateStr = item?.date
        ? new Date(item.date).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Nov 08, 2026';
    const mediaType = item?.media_type || 'video';
    const bgImage = item?.thumbnail_url || 'https://images.unsplash.com/photo-1549488497-6577382be704?q=80&w=2070&auto=format&fit=crop';
    const mediaUrl = item?.media_url || item?.media_file_url;

    // Helper to extract YouTube video ID
    const getYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const ytId = getYouTubeId(mediaUrl);

    return (
        <>
            <div style={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
                borderRadius: '1.25rem',
                padding: '2.5rem 3rem',
                marginBottom: '1.5rem',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                minHeight: '260px'
            }}>
                {/* Background Image Overlay */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundImage: `url(${bgImage})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    opacity: 0.35,
                    mixBlendMode: 'overlay'
                }}></div>

                <div style={{ position: 'relative', zIndex: 2, maxWidth: '680px' }}>
                    <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem', alignItems: 'center' }}>
                        <span style={{
                            background: '#22c1e6',
                            color: '#0f172a',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.72rem',
                            fontWeight: '800',
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase'
                        }}>
                            Featured Message
                        </span>
                        <span style={{
                            background: 'rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(8px)',
                            color: '#ffffff',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase'
                        }}>
                            {mediaType === 'audio' ? '🎙️ Audio Sermon' : '📺 Video Broadcast'}
                        </span>
                    </div>

                    <h2 style={{
                        fontSize: '2.25rem',
                        fontWeight: '800',
                        color: '#ffffff',
                        margin: '0 0 0.5rem 0',
                        lineHeight: 1.2
                    }}>
                        {title}
                    </h2>
                    <p style={{
                        color: 'rgba(255,255,255,0.85)',
                        fontSize: '0.95rem',
                        marginBottom: '1.75rem',
                        fontWeight: '500'
                    }}>
                        Preached by {preacher} • {dateStr}
                    </p>

                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <button
                            onClick={() => setIsPlaying(true)}
                            style={{
                                background: '#22c1e6',
                                color: '#0f172a',
                                border: 'none',
                                borderRadius: '9999px',
                                padding: '0.75rem 1.85rem',
                                fontSize: '0.9rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.55rem',
                                boxShadow: '0 4px 14px rgba(34, 193, 230, 0.35)',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            <span>▶</span> {mediaType === 'audio' ? 'Listen Now' : 'Watch Broadcast'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Media Playback Modal */}
            {isPlaying && (
                <div
                    onClick={() => setIsPlaying(false)}
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.8)',
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
                            maxWidth: '850px',
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
                            padding: '1.25rem 1.5rem',
                            borderBottom: '1px solid rgba(255,255,255,0.08)'
                        }}>
                            <div>
                                <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.1rem', fontWeight: '700' }}>{title}</h3>
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{preacher}</span>
                            </div>
                            <button
                                onClick={() => setIsPlaying(false)}
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

                        <div style={{ padding: '1.5rem' }}>
                            {mediaType === 'video' && ytId ? (
                                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: '0.75rem', overflow: 'hidden' }}>
                                    <iframe
                                        src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                                        title={title}
                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            ) : mediaType === 'video' && mediaUrl ? (
                                <video
                                    controls
                                    autoPlay
                                    src={mediaUrl}
                                    style={{ width: '100%', maxHeight: '480px', borderRadius: '0.75rem' }}
                                />
                            ) : mediaUrl ? (
                                <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎙️</div>
                                    <audio controls autoPlay src={mediaUrl} style={{ width: '100%', maxWidth: '500px' }} />
                                </div>
                            ) : (
                                <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                                    Media stream not currently available.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default LatestSermonHero;
