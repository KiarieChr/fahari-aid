import React, { useState, useEffect, useContext } from 'react';
import PhotoAlbumGrid from '../components/media/PhotoAlbumGrid';
import { getMediaList } from '../../services/mediaApi';
import { ThemeContext } from '../../context/ThemeContext';

const PhotoGallery = () => {
    const { theme } = useContext(ThemeContext || {});
    const isDark = theme === 'dark';

    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchAlbums = async () => {
        try {
            setLoading(true);
            const data = await getMediaList({
                type: 'photo_gallery',
                search: search || undefined
            });
            const items = data?.results || data?.data?.results || (Array.isArray(data) ? data : []);
            setAlbums(items);
        } catch (err) {
            console.error('Failed to load photo albums:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlbums();
    }, [search]);

    return (
        <div style={{ width: '100%', paddingBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.65rem', fontWeight: '800', color: isDark ? '#ffffff' : '#0f172a', margin: '0 0 0.35rem 0' }}>
                        Ministry Photo Vault & Archives
                    </h1>
                    <p style={{ margin: 0, color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.85rem' }}>
                        Browse high-resolution photo archives from our conferences, celebrations, and outreach missions
                    </p>
                </div>

                <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search photo albums..."
                        style={{
                            width: '100%',
                            background: isDark ? '#1a1625' : '#ffffff',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                            padding: '0.65rem 1rem 0.65rem 2.2rem',
                            borderRadius: '0.65rem',
                            color: isDark ? '#f8fafc' : '#0f172a',
                            fontSize: '0.85rem',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                    />
                    <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                        🔍
                    </span>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                    Loading photo albums...
                </div>
            ) : albums.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '3.5rem 2rem',
                    background: isDark ? '#1a1625' : '#ffffff',
                    borderRadius: '1rem',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                    width: '100%',
                    boxSizing: 'border-box'
                }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🖼️</div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: isDark ? '#ffffff' : '#0f172a' }}>No Photo Galleries Found</h3>
                    <p style={{ margin: 0, color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.85rem' }}>
                        There are no photo vaults matching the search term.
                    </p>
                </div>
            ) : (
                <div style={{ width: '100%' }}>
                    <PhotoAlbumGrid albums={albums} />
                </div>
            )}
        </div>
    );
};

export default PhotoGallery;
