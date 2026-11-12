import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const WatchLive = () => {
    const [liveStream, setLiveStream] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch active live stream from API
    useEffect(() => {
        const fetchLiveStream = async () => {
            try {
                setLoading(true);
                const response = await api.get('/get_live_stream.php');
                setLiveStream(response.stream || null);
            } catch (error) {
                console.error('Failed to fetch live stream:', error);
                setLiveStream(null);
            } finally {
                setLoading(false);
            }
        };
        fetchLiveStream();
    }, []);

    // Helper to extract YouTube video ID if applicable
    const getEmbedUrl = (url) => {
        if (!url) return null;
        try {
            // Check if it's a youtube link
            if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
                let videoId = '';
                if (url.includes('youtu.be/')) {
                    videoId = url.split('youtu.be/')[1].split('?')[0];
                } else {
                    const urlParams = new URLSearchParams(new URL(url).search);
                    videoId = urlParams.get('v');
                }
                return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            }
            // For other platforms, we might just have to provide a link
            return null;
        } catch (e) {
            return null;
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Checking for live streams...</div>;
    }

    if (!liveStream) {
        return (
            <div style={{
                background: 'var(--surface-1)',
                borderRadius: '1.5rem',
                padding: '4rem 2rem',
                textAlign: 'center',
                border: '1px solid var(--border-color)',
                marginTop: '1rem'
            }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📺</div>
                <h2 style={{ color: 'var(--text-color)', marginBottom: '1rem' }}>No Active Live Stream</h2>
                <p style={{ color: 'var(--text-muted)' }}>There is no live service broadcasting at the moment. Please check back later or explore our video and audio archives!</p>
            </div>
        );
    }

    const embedUrl = getEmbedUrl(liveStream.stream_url);

    return (
        <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-color)', margin: 0 }}>{liveStream.title}</h1>
                <span style={{
                    background: 'var(--danger)',
                    color: 'black',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '2rem',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    animation: 'pulse 2s infinite'
                }}>
                    <span style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%', display: 'inline-block' }}></span>
                    LIVE NOW
                </span>
            </div>

            <div style={{
                background: 'var(--surface-1)',
                borderRadius: '1.5rem',
                overflow: 'hidden',
                border: '1px solid var(--border-color)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}>
                {embedUrl ? (
                    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                        <iframe
                            src={embedUrl}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title="Live Stream"
                        ></iframe>
                    </div>
                ) : (
                    <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🔴</div>
                        <h2 style={{ color: 'var(--text-color)', marginBottom: '1.5rem' }}>Stream is Live on External Platform</h2>
                        <a href={liveStream.stream_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                            <button style={{
                                background: 'var(--danger)',
                                color: 'black',
                                border: 'none',
                                borderRadius: '0.5rem',
                                padding: '1rem 2.5rem',
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.8rem',
                                boxShadow: '0 4px 15px rgba(244, 63, 94, 0.4)',
                                transition: 'transform 0.2s'
                            }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                Watch Stream Now <span>↗</span>
                            </button>
                        </a>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(244, 63, 94, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0); }
                }
            `}</style>
        </div>
    );
};

export default WatchLive;
