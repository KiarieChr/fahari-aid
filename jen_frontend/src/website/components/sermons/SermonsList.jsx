import React, { useState, useEffect } from 'react';
import SermonsFilter from './SermonsFilter';
import SermonCard from './SermonCard';
import { getMediaList } from '../../../services/mediaApi';

const SermonsList = () => {
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sermons, setSermons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeMedia, setActiveMedia] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const fetchSermons = async () => {
            try {
                setLoading(true);
                const data = await getMediaList();
                if (isMounted && data?.results && data.results.length > 0) {
                    const formatted = data.results
                        .filter(item => item.media_type === 'audio' || item.media_type === 'video')
                        .map(item => ({
                            id: item.id,
                            type: item.media_type,
                            title: item.title,
                            pastor: item.preacher || 'Speaker',
                            date: item.date ? new Date(item.date).toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' }) : '',
                            duration: item.duration || '45 min',
                            image: item.thumbnail_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop',
                            media_url: item.media_url || item.media_file_url,
                            description: item.description
                        }));
                    setSermons(formatted);
                }
            } catch (err) {
                console.warn('Using default sermon list fallback:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchSermons();
        return () => { isMounted = false; };
    }, []);

    const filteredSermons = sermons.filter(sermon => {
        const matchesFilter = filter === 'all' || sermon.type === filter;
        const matchesSearch = sermon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sermon.pastor.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const ytId = activeMedia ? getYouTubeId(activeMedia.media_url) : null;

    return (
        <section style={{ background: '#f8fafc', paddingBottom: '5rem' }}>
            <SermonsFilter
                filter={filter}
                setFilter={setFilter}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            />

            <div className="container">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3.5rem 0', color: '#64748b' }}>
                        Loading latest sermons and messages...
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: '2rem',
                        marginTop: '1rem'
                    }}>
                        {filteredSermons.map(sermon => (
                            <div key={sermon.id} onClick={() => setActiveMedia(sermon)}>
                                <SermonCard {...sermon} />
                            </div>
                        ))}
                    </div>
                )}

                {!loading && filteredSermons.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>
                        <p>No sermons found matching your criteria.</p>
                    </div>
                )}
            </div>

            {/* Media Playback Modal */}
            {activeMedia && (
                <div
                    onClick={() => setActiveMedia(null)}
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
                                <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.15rem', fontWeight: '700' }}>
                                    {activeMedia.title}
                                </h3>
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                                    {activeMedia.pastor} • {activeMedia.date}
                                </span>
                            </div>
                            <button
                                onClick={() => setActiveMedia(null)}
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
                            {activeMedia.type === 'video' && ytId ? (
                                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: '0.75rem', overflow: 'hidden' }}>
                                    <iframe
                                        src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                                        title={activeMedia.title}
                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            ) : activeMedia.type === 'video' && activeMedia.media_url ? (
                                <video
                                    controls
                                    autoPlay
                                    src={activeMedia.media_url}
                                    style={{ width: '100%', maxHeight: '480px', borderRadius: '0.75rem' }}
                                />
                            ) : activeMedia.media_url ? (
                                <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎙️</div>
                                    <audio controls autoPlay src={activeMedia.media_url} style={{ width: '100%', maxWidth: '500px' }} />
                                </div>
                            ) : (
                                <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                                    Media broadcast stream not currently reachable.
                                </div>
                            )}

                            {activeMedia.description && (
                                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '1rem 0 0 0', lineHeight: 1.5 }}>
                                    {activeMedia.description}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default SermonsList;
