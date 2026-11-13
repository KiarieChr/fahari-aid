import React, { useState, useContext } from 'react';
import { ThemeContext } from '../../../context/ThemeContext';

const AlbumCard = ({ item, onClick, isDark }) => {
    const title = item.title;
    const cover = item.thumbnail_url || (item.photos && item.photos[0]) || 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=600';
    const photosCount = Array.isArray(item.photos) && item.photos.length > 0 ? item.photos.length : (item.duration ? item.duration : '24 Photos');
    const date = item.date ? new Date(item.date).toLocaleDateString('default', { month: 'short', year: 'numeric' }) : '';

    return (
        <div
            onClick={() => onClick(item)}
            style={{
                background: isDark ? '#1a1625' : '#ffffff',
                borderRadius: '1rem',
                overflow: 'hidden',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
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
            <div style={{
                height: '210px',
                backgroundImage: `url(${cover})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(4px)',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '6px',
                    fontWeight: '600'
                }}>
                    🖼️ {typeof photosCount === 'number' ? `${photosCount} Photos` : photosCount}
                </div>
            </div>

            <div style={{ padding: '1.15rem' }}>
                <h3 style={{
                    color: isDark ? '#ffffff' : '#0f172a',
                    fontSize: '1.05rem',
                    fontWeight: '700',
                    margin: '0 0 0.35rem 0'
                }}>
                    {title}
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.8rem' }}>
                    <span>{item.series || 'Event Gallery'}</span>
                    {date && <span>{date}</span>}
                </div>
            </div>
        </div>
    );
};

const PhotoAlbumGrid = ({ albums = [] }) => {
    const { theme } = useContext(ThemeContext || {});
    const isDark = theme === 'dark';

    const [activeAlbum, setActiveAlbum] = useState(null);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    const handleOpenAlbum = (album) => {
        setActiveAlbum(album);
        setCurrentPhotoIndex(0);
    };

    const photosList = activeAlbum?.photos && activeAlbum.photos.length > 0
        ? activeAlbum.photos
        : [activeAlbum?.thumbnail_url].filter(Boolean);

    const currentImg = photosList[currentPhotoIndex] || activeAlbum?.thumbnail_url;

    const nextPhoto = (e) => {
        e.stopPropagation();
        setCurrentPhotoIndex((prev) => (prev + 1) % photosList.length);
    };

    const prevPhoto = (e) => {
        e.stopPropagation();
        setCurrentPhotoIndex((prev) => (prev - 1 + photosList.length) % photosList.length);
    };

    return (
        <>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.35rem'
            }}>
                {albums.map(item => (
                    <AlbumCard
                        key={item.id}
                        item={item}
                        onClick={handleOpenAlbum}
                        isDark={isDark}
                    />
                ))}
            </div>

            {/* Lightbox Modal */}
            {activeAlbum && (
                <div
                    onClick={() => setActiveAlbum(null)}
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.9)',
                        backdropFilter: 'blur(10px)',
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
                            maxWidth: '1000px',
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1rem',
                            color: '#ffffff'
                        }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>{activeAlbum.title}</h3>
                                {photosList.length > 1 && (
                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                        Photo {currentPhotoIndex + 1} of {photosList.length}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => setActiveAlbum(null)}
                                style={{
                                    background: 'rgba(255,255,255,0.15)',
                                    border: 'none',
                                    color: '#ffffff',
                                    borderRadius: '50%',
                                    width: '36px',
                                    height: '36px',
                                    fontSize: '1.1rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Image Viewer */}
                        <div style={{
                            position: 'relative',
                            width: '100%',
                            maxHeight: '70vh',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            borderRadius: '1rem',
                            background: '#020617'
                        }}>
                            <img
                                src={currentImg}
                                alt={activeAlbum.title}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '70vh',
                                    objectFit: 'contain',
                                    borderRadius: '0.75rem'
                                }}
                            />

                            {photosList.length > 1 && (
                                <>
                                    <button
                                        onClick={prevPhoto}
                                        style={{
                                            position: 'absolute',
                                            left: '12px',
                                            background: 'rgba(0,0,0,0.6)',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '42px',
                                            height: '42px',
                                            fontSize: '1.2rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        ‹
                                    </button>
                                    <button
                                        onClick={nextPhoto}
                                        style={{
                                            position: 'absolute',
                                            right: '12px',
                                            background: 'rgba(0,0,0,0.6)',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '42px',
                                            height: '42px',
                                            fontSize: '1.2rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        ›
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Description */}
                        {activeAlbum.description && (
                            <p style={{ color: '#cbd5e1', fontSize: '0.875rem', marginTop: '1rem', textAlign: 'center', maxWidth: '700px' }}>
                                {activeAlbum.description}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default PhotoAlbumGrid;
