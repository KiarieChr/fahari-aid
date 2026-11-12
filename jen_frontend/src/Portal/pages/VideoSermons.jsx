import React, { useState, useEffect, useContext } from 'react';
import VideoGrid from '../components/media/VideoGrid';
import { getMediaList } from '../../services/mediaApi';
import { ThemeContext } from '../../context/ThemeContext';

const VideoSermons = () => {
    const { theme } = useContext(ThemeContext || {});
    const isDark = theme === 'dark';

    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedSpeaker, setSelectedSpeaker] = useState('all');
    const [selectedSeries, setSelectedSeries] = useState('all');

    const fetchVideos = async () => {
        try {
            setLoading(true);
            const data = await getMediaList({
                type: 'video',
                search: search || undefined,
                series: selectedSeries !== 'all' ? selectedSeries : undefined
            });
            const items = data?.results || data?.data?.results || (Array.isArray(data) ? data : []);
            setVideos(items);
        } catch (err) {
            console.error('Failed to load video sermons:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, [search, selectedSeries]);

    const speakers = Array.from(new Set(videos.map(v => v.preacher).filter(Boolean)));
    const seriesList = Array.from(new Set(videos.map(v => v.series).filter(Boolean)));

    const displayedVideos = videos.filter(v => {
        if (selectedSpeaker !== 'all' && v.preacher !== selectedSpeaker) return false;
        return true;
    });

    return (
        <div style={{ width: '100%', paddingBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.65rem', fontWeight: '800', color: isDark ? '#ffffff' : '#0f172a', margin: '0 0 0.35rem 0' }}>
                        Video Broadcasts & Sermons
                    </h1>
                    <p style={{ margin: 0, color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.85rem' }}>
                        Watch Sunday celebration livestreams, midweek conferences, and ministry messages
                    </p>
                </div>
                <div style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.825rem', fontWeight: '600' }}>
                    {displayedVideos.length} {displayedVideos.length === 1 ? 'broadcast' : 'broadcasts'} available
                </div>
            </div>

            {/* Search & Filter Bar - Full Width Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '0.85rem',
                marginBottom: '1.75rem',
                width: '100%'
            }}>
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search video broadcasts by title or keyword..."
                        style={{
                            width: '100%',
                            background: isDark ? '#1a1625' : '#ffffff',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                            padding: '0.75rem 1rem 0.75rem 2.4rem',
                            borderRadius: '0.65rem',
                            color: isDark ? '#f8fafc' : '#0f172a',
                            fontSize: '0.85rem',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                    />
                    <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                        🔍
                    </span>
                </div>

                <select
                    value={selectedSpeaker}
                    onChange={(e) => setSelectedSpeaker(e.target.value)}
                    style={{
                        width: '100%',
                        background: isDark ? '#1a1625' : '#ffffff',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                        color: isDark ? '#f8fafc' : '#0f172a',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.65rem',
                        fontSize: '0.85rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                    }}
                >
                    <option value="all">All Speakers</option>
                    {speakers.map(sp => (
                        <option key={sp} value={sp}>{sp}</option>
                    ))}
                </select>

                <select
                    value={selectedSeries}
                    onChange={(e) => setSelectedSeries(e.target.value)}
                    style={{
                        width: '100%',
                        background: isDark ? '#1a1625' : '#ffffff',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                        color: isDark ? '#f8fafc' : '#0f172a',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.65rem',
                        fontSize: '0.85rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                    }}
                >
                    <option value="all">All Series</option>
                    {seriesList.map(ser => (
                        <option key={ser} value={ser}>{ser}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                    Loading video broadcasts...
                </div>
            ) : displayedVideos.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '3.5rem 2rem',
                    background: isDark ? '#1a1625' : '#ffffff',
                    borderRadius: '1rem',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                    width: '100%',
                    boxSizing: 'border-box'
                }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📹</div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: isDark ? '#ffffff' : '#0f172a' }}>No Video Broadcasts Found</h3>
                    <p style={{ margin: 0, color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.85rem' }}>
                        No records match the active search criteria.
                    </p>
                </div>
            ) : (
                <div style={{ width: '100%' }}>
                    <VideoGrid videos={displayedVideos} />
                </div>
            )}
        </div>
    );
};

export default VideoSermons;
