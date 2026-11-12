import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMediaList } from '../../services/mediaApi';

const SermonCard = ({ type, title, pastor, date, duration, image }) => (
    <div style={{
        background: 'white',
        borderRadius: '1rem',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s',
        cursor: 'pointer'
    }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
        <div style={{ position: 'relative', height: '240px' }}>
            <img src={image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <span style={{
                position: 'absolute',
                top: '1rem',
                left: '1rem',
                background: 'rgba(0,0,0,0.75)',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                {type === 'video' ? '▶ Video' : '🎧 Audio'}
            </span>
        </div>
        <div style={{ padding: '1.5rem', color: 'var(--background)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>{title}</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>{pastor}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.875rem' }}>
                <span>📅 {date}</span>
                <span>{duration}</span>
            </div>
        </div>
    </div>
);

const SermonsSection = ({ sermons: propSermons, loading: propLoading }) => {
    const [sermons, setSermons] = useState(propSermons || []);
    const [loading, setLoading] = useState(propLoading !== undefined ? propLoading : !propSermons);

    useEffect(() => {
        if (propSermons && propSermons.length > 0) {
            setSermons(propSermons);
            setLoading(false);
            return;
        }

        let isMounted = true;
        const fetchLatest = async () => {
            try {
                const data = await getMediaList({ limit: 3 });
                if (isMounted && data?.results && data.results.length > 0) {
                    const formatted = data.results.map(item => ({
                        id: item.id,
                        type: item.media_type,
                        title: item.title,
                        pastor: item.preacher || 'Speaker',
                        date: item.date ? new Date(item.date).toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' }) : '',
                        duration: item.duration || '45 min',
                        image: item.thumbnail_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop'
                    }));
                    setSermons(formatted);
                }
            } catch (err) {
                console.warn('Failed to load dynamic sermons section:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchLatest();
        return () => { isMounted = false; };
    }, [propSermons]);

    return (
        <section className="section-padding" style={{ background: 'var(--secondary)' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <span style={{
                        background: 'rgba(34, 193, 230, 0.1)',
                        color: 'var(--primary-hover)',
                        padding: '0.5rem 1rem',
                        borderRadius: '9999px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        Latest Sermons
                    </span>
                    <h2 style={{
                        fontSize: '3rem',
                        fontWeight: '800',
                        color: 'var(--background)',
                        margin: '1.5rem 0 1rem'
                    }}>
                        Feed Your Spirit
                    </h2>
                    <p style={{ color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
                        Watch or listen to our latest messages and be transformed by the Word of God.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem',
                    marginBottom: '4rem'
                }}>
                    {sermons.map((sermon, index) => (
                        <Link to="/sermons" key={sermon.id || index} style={{ textDecoration: 'none' }}>
                            <SermonCard {...sermon} />
                        </Link>
                    ))}
                </div>

                <div style={{ textAlign: 'center' }}>
                    <Link to="/sermons" className="btn btn-hover-effect" style={{
                        background: 'var(--background)',
                        color: 'white',
                        padding: '1rem 2.5rem',
                        borderRadius: '9999px',
                        textDecoration: 'none',
                        fontWeight: '700',
                        display: 'inline-block'
                    }}>
                        View All Sermons & Archive
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default SermonsSection;
