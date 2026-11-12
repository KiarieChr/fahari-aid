import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { API_BASE_URL as API_URL } from '../../services/api';

const formatImage = (img) => {
    if (!img) return 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=1000&auto=format&fit=crop';
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:') || img.startsWith('/')) {
        return img;
    }
    if (img.includes('photo-') || img.startsWith('photo-')) {
        return `https://images.unsplash.com/${img}`;
    }
    return img;
};

// Hero Component
const DevotionalsHero = () => (
    <section style={{
        background: 'linear-gradient(180deg, #120D20 0%, #0d091a 100%)',
        padding: '0.5rem 1rem 5rem',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        marginTop: '80px'
    }}>
        {/* Geometric Masked Background Glow */}
        <div style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: '50%',
            height: '100%',
            background: 'linear-gradient(135deg, rgba(34, 193, 230, 0.08) 0%, transparent 100%)',
            clipPath: 'polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%)',
            zIndex: 0,
            pointerEvents: 'none'
        }}></div>

        <div style={{
            position: 'absolute',
            top: '-30%',
            left: '-10%',
            width: '60%',
            height: '160%',
            background: 'radial-gradient(circle, rgba(34, 193, 230, 0.06) 0%, transparent 70%)',
            zIndex: 0,
            pointerEvents: 'none'
        }}></div>

        <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto' }}>
            <div className="hero-grid" style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 0.8fr',
                gap: '3rem',
                alignItems: 'center'
            }}>
                {/* Left Column: Text Content */}
                <div style={{ textAlign: 'left' }}>
                    <span style={{
                        background: 'rgba(34, 193, 230, 0.1)',
                        color: '#22c1e6',
                        padding: '0.5rem 1rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        display: 'inline-block',
                        marginBottom: '1.5rem'
                    }}>
                        📖 Daily Inspiration
                    </span>
                    
                    <h1 style={{
                        fontSize: '3.75rem',
                        fontWeight: '800',
                        marginBottom: '1.5rem',
                        lineHeight: 1.1,
                        letterSpacing: '-0.02em'
                    }}>
                        Daily Devotionals
                    </h1>
                    
                    <p style={{
                        fontSize: '1.125rem',
                        color: '#94a3b8',
                        lineHeight: 1.6,
                        margin: 0
                    }}>
                        Start your day with God's Word and be inspired by daily devotional messages from our ministry.
                    </p>
                </div>

                {/* Right Column: Masked Image */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: '350px',
                        height: '240px',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <img 
                            src="https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=1000&auto=format&fit=crop" 
                            alt="Holy Bible" 
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(45deg, rgba(18, 13, 32, 0.4) 0%, rgba(34, 193, 230, 0.2) 100%)',
                            pointerEvents: 'none'
                        }}></div>
                    </div>
                </div>
            </div>
        </div>

        <style>{`
            @media (max-width: 768px) {
                .hero-grid {
                    grid-template-columns: 1fr !important;
                    gap: 2.5rem !important;
                    text-align: center !important;
                }
                .hero-grid div {
                    text-align: center !important;
                }
                h1 {
                    font-size: 2.5rem !important;
                }
            }
        `}</style>
    </section>
);

// Devotional Card Component
const DevotionalCard = ({ devotional, featured = false }) => (
    <Link
        to={`/devotionals/${devotional.slug}`}
        style={{
            background: 'white',
            borderRadius: '1rem',
            overflow: 'hidden',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            textDecoration: 'none',
            display: 'block'
        }}
        className="devotional-card"
    >
        <div style={{ position: 'relative', height: featured ? '300px' : '200px' }}>
            <img
                src={formatImage(devotional.featured_image)}
                alt={devotional.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <span style={{
                position: 'absolute',
                top: '1rem',
                left: '1rem',
                background: 'rgba(0,0,0,0.75)',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                📖 {devotional.day_name}
            </span>
            {featured && (
                <span style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'var(--primary-hover)',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                }}>
                    Featured
                </span>
            )}
        </div>
        <div style={{ padding: '1.5rem', color: 'var(--background)' }}>
            <h3 style={{ fontSize: featured ? '1.5rem' : '1.25rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                {devotional.title}
            </h3>
            <p style={{
                color: '#64748b',
                fontSize: '0.875rem',
                marginBottom: '0.5rem',
                fontStyle: 'italic',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
            }}>
                "{devotional.scripture_text}"
            </p>
            <p style={{ color: 'var(--primary-hover)', fontSize: '0.875rem', marginBottom: '1rem', fontWeight: '600' }}>
                — {devotional.scripture_reference}
            </p>
            {featured && (
                <p style={{
                    color: '#475569',
                    fontSize: '0.9rem',
                    marginBottom: '1rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                }}>
                    {devotional.message_preview}
                </p>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
                <span>📅 {devotional.date_formatted}</span>
                <span style={{ fontWeight: '500' }}>{devotional.author?.name}</span>
            </div>
            {devotional.categories?.length > 0 && (
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {devotional.categories.map(cat => (
                        <span key={cat.id} style={{
                            background: 'rgba(34, 193, 230, 0.1)',
                            color: 'var(--primary-hover)',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '500'
                        }}>
                            {cat.name}
                        </span>
                    ))}
                </div>
            )}
        </div>
    </Link>
);

// Loading Skeleton
const LoadingSkeleton = () => (
    <div style={{
        background: 'white',
        borderRadius: '1rem',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    }}>
        <div style={{
            height: '200px',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite'
        }}></div>
        <div style={{ padding: '1.5rem' }}>
            <div style={{ height: '24px', background: '#f0f0f0', borderRadius: '4px', marginBottom: '0.75rem' }}></div>
            <div style={{ height: '40px', background: '#f0f0f0', borderRadius: '4px', marginBottom: '0.5rem' }}></div>
            <div style={{ height: '16px', background: '#f0f0f0', borderRadius: '4px', width: '50%', marginBottom: '1rem' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ height: '16px', background: '#f0f0f0', borderRadius: '4px', width: '30%' }}></div>
                <div style={{ height: '16px', background: '#f0f0f0', borderRadius: '4px', width: '25%' }}></div>
            </div>
        </div>
    </div>
);

// Main Devotionals Page
const Devotionals = () => {
    const [devotionals, setDevotionals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        total_pages: 1,
        total_count: 0,
        has_more: false
    });
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchDevotionals = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}get_devotionals.php?limit=9&page=${currentPage}`);
                const data = await response.json();

                console.log(data);

                if (data.success) {
                    setDevotionals(data.devotionals || []);
                    setPagination(data.pagination || {});
                } else {
                    setError(data.error || 'Failed to load devotionals');
                }
            } catch (err) {
                console.error('Error fetching devotionals:', err);
                setError('Unable to load devotionals. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchDevotionals();
    }, [currentPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 400, behavior: 'smooth' });
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <DevotionalsHero />

            {/* Content wrapper */}
            <div style={{ background: '#f8fafc', flex: 1, padding: '4rem 0' }}>
                <div className="container">
                    {/* Error Message */}
                    {error && (
                        <div style={{
                            background: '#fee2e2',
                            border: '1px solid #fecaca',
                            color: '#dc2626',
                            padding: '1rem',
                            borderRadius: '8px',
                            marginBottom: '2rem',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Loading State */}
                    {loading ? (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '2rem'
                        }}>
                            {[...Array(6)].map((_, i) => <LoadingSkeleton key={i} />)}
                        </div>
                    ) : devotionals.length === 0 ? (
                        /* Empty State */
                        <div style={{
                            textAlign: 'center',
                            padding: '4rem 2rem',
                            background: 'white',
                            borderRadius: '1rem',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📖</div>
                            <h3 style={{ color: 'var(--background)', marginBottom: '0.5rem' }}>No Devotionals Yet</h3>
                            <p style={{ color: '#64748b' }}>Check back soon for daily inspirational messages.</p>
                        </div>
                    ) : (
                        <>
                            {/* Featured Devotional (first one) */}
                            {currentPage === 1 && devotionals.length > 0 && (
                                <div style={{ marginBottom: '3rem' }}>
                                    <h2 style={{
                                        color: 'var(--background)',
                                        marginBottom: '1.5rem',
                                        fontSize: '1.5rem',
                                        fontWeight: '700'
                                    }}>
                                        Today's Devotional
                                    </h2>
                                    <div style={{ maxWidth: '800px' }}>
                                        <DevotionalCard devotional={devotionals[0]} featured />
                                    </div>
                                </div>
                            )}

                            {/* Devotionals Grid */}
                            <h2 style={{
                                color: 'var(--background)',
                                marginBottom: '1.5rem',
                                fontSize: '1.5rem',
                                fontWeight: '700'
                            }}>
                                {currentPage === 1 ? 'Recent Devotionals' : `Page ${currentPage}`}
                            </h2>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                gap: '2rem',
                                marginBottom: '3rem'
                            }}>
                                {(currentPage === 1 ? devotionals.slice(1) : devotionals).map(devotional => (
                                    <DevotionalCard key={devotional.id} devotional={devotional} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination.total_pages > 1 && (
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    flexWrap: 'wrap'
                                }}>
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: currentPage === 1 ? '#e2e8f0' : 'var(--background)',
                                            color: currentPage === 1 ? '#94a3b8' : 'white',
                                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                            fontWeight: '600',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        ← Previous
                                    </button>

                                    {[...Array(pagination.total_pages)].map((_, i) => {
                                        const page = i + 1;
                                        // Show limited pages
                                        if (
                                            page === 1 ||
                                            page === pagination.total_pages ||
                                            (page >= currentPage - 1 && page <= currentPage + 1)
                                        ) {
                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    style={{
                                                        width: '44px',
                                                        height: '44px',
                                                        borderRadius: '8px',
                                                        border: 'none',
                                                        background: currentPage === page ? 'var(--primary-hover)' : 'white',
                                                        color: currentPage === page ? 'white' : 'var(--background)',
                                                        cursor: 'pointer',
                                                        fontWeight: '600',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        } else if (
                                            page === currentPage - 2 ||
                                            page === currentPage + 2
                                        ) {
                                            return <span key={page} style={{ color: '#64748b' }}>...</span>;
                                        }
                                        return null;
                                    })}

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={!pagination.has_more}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: !pagination.has_more ? '#e2e8f0' : 'var(--background)',
                                            color: !pagination.has_more ? '#94a3b8' : 'white',
                                            cursor: !pagination.has_more ? 'not-allowed' : 'pointer',
                                            fontWeight: '600',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Next →
                                    </button>
                                </div>
                            )}

                            {/* Page Info */}
                            <p style={{
                                textAlign: 'center',
                                color: '#64748b',
                                marginTop: '1rem',
                                fontSize: '0.875rem'
                            }}>
                                Showing page {pagination.current_page} of {pagination.total_pages} ({pagination.total_count} devotionals)
                            </p>
                        </>
                    )}
                </div>
            </div>

            <Footer />

            <style>{`
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                .devotional-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px -4px rgba(0,0,0,0.15) !important;
                }
            `}</style>
        </div>
    );
};

export default Devotionals;
