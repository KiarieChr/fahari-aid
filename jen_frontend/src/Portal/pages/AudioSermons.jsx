import React, { useState, useEffect, useRef, useContext } from 'react';
import AudioPlayer from '../components/media/AudioPlayer';
import { getMediaList } from '../../services/mediaApi';
import { ThemeContext } from '../../context/ThemeContext';

const AudioSermons = () => {
    const { theme } = useContext(ThemeContext || {});
    const isDark = theme === 'dark';

    const [sermons, setSermons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedSpeaker, setSelectedSpeaker] = useState('all');
    const [selectedSeries, setSelectedSeries] = useState('all');

    // Audio Playback state
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const audioRef = useRef(new Audio());

    const fetchAudioSermons = async () => {
        try {
            setLoading(true);
            const data = await getMediaList({
                type: 'audio',
                search: search || undefined,
                series: selectedSeries !== 'all' ? selectedSeries : undefined
            });
            const items = data?.results || data?.data?.results || (Array.isArray(data) ? data : []);
            setSermons(items);
        } catch (err) {
            console.error('Failed to load audio sermons:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAudioSermons();
    }, [search, selectedSeries]);

    // Handle HTML Audio events
    useEffect(() => {
        const audio = audioRef.current;

        const updateProgress = () => {
            if (audio.duration) {
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
        };

        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('ended', handleEnded);
            audio.pause();
        };
    }, []);

    const handleTogglePlay = (item) => {
        const audio = audioRef.current;
        const trackUrl = item.media_file_url || item.media_url;

        if (!trackUrl) {
            alert('Audio stream URL is not available for this message.');
            return;
        }

        if (currentTrack?.id === item.id) {
            if (isPlaying) {
                audio.pause();
                setIsPlaying(false);
            } else {
                audio.play().catch(e => console.warn('Audio play error:', e));
                setIsPlaying(true);
            }
        } else {
            audio.src = trackUrl;
            audio.play().then(() => {
                setCurrentTrack(item);
                setIsPlaying(true);
            }).catch(e => console.warn('Audio play error:', e));
        }
    };

    const handleSeek = (percentage) => {
        const audio = audioRef.current;
        if (audio.duration) {
            audio.currentTime = (percentage / 100) * audio.duration;
            setProgress(percentage);
        }
    };

    const speakers = Array.from(new Set(sermons.map(s => s.preacher).filter(Boolean)));
    const seriesList = Array.from(new Set(sermons.map(s => s.series).filter(Boolean)));

    const displayedSermons = sermons.filter(s => {
        if (selectedSpeaker !== 'all' && s.preacher !== selectedSpeaker) return false;
        return true;
    });

    return (
        <div style={{ width: '100%', paddingBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.65rem', fontWeight: '800', color: isDark ? '#ffffff' : '#0f172a', margin: '0 0 0.35rem 0' }}>
                        Audio Sermons Archive
                    </h1>
                    <p style={{ margin: 0, color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.85rem' }}>
                        Stream, study, and meditate on apostolic teachings and anointed Sunday services
                    </p>
                </div>
                <div style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.825rem', fontWeight: '600' }}>
                    {displayedSermons.length} {displayedSermons.length === 1 ? 'message' : 'messages'} found
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
                        placeholder="Search audio sermons by title, topic..."
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
                    <option value="all">All Preachers & Speakers</option>
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
                    <option value="all">All Teaching Series</option>
                    {seriesList.map(ser => (
                        <option key={ser} value={ser}>{ser}</option>
                    ))}
                </select>
            </div>

            {/* Audio List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                    Loading audio messages...
                </div>
            ) : displayedSermons.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '3.5rem 2rem',
                    background: isDark ? '#1a1625' : '#ffffff',
                    borderRadius: '1rem',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                    width: '100%',
                    boxSizing: 'border-box'
                }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎙️</div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: isDark ? '#ffffff' : '#0f172a' }}>No Audio Sermons Found</h3>
                    <p style={{ margin: 0, color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.85rem' }}>
                        Try clearing search terms or selected filters.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '0.85rem', width: '100%' }}>
                    {displayedSermons.map(item => (
                        <AudioPlayer
                            key={item.id}
                            item={item}
                            isPlaying={currentTrack?.id === item.id && isPlaying}
                            progress={currentTrack?.id === item.id ? progress : 0}
                            onTogglePlay={() => handleTogglePlay(item)}
                            onSeek={currentTrack?.id === item.id ? handleSeek : undefined}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AudioSermons;
