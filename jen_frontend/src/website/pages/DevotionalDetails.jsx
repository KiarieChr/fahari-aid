import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { API_BASE_URL as API_URL } from '../../services/api';

const formatImage = (img) => {
    if (!img) return 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=2000&auto=format&fit=crop';
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:') || img.startsWith('/')) {
        return img;
    }
    if (img.includes('photo-') || img.startsWith('photo-')) {
        return `https://images.unsplash.com/${img}`;
    }
    return img;
};

const DevotionalDetails = () => {
    const { slug } = useParams();
    const [devotional, setDevotional] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDevotional = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}get_devotional.php?slug=${slug}`);
                const data = await response.json();

                if (data.success) {
                    setDevotional(data.data.devotional);
                } else {
                    setError(data.error || 'Devotional not found');
                }
            } catch (err) {
                console.error('Error fetching devotional:', err);
                setError('Failed to load devotional');
            } finally {
                setLoading(false);
            }
        };

        fetchDevotional();
    }, [slug]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Navbar />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                    <div style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>Loading devotional...</div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !devotional) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Navbar />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
                    <h2 style={{ color: 'var(--background)' }}>{error || 'Devotional Not Found'}</h2>
                    <Link to="/devotionals" style={{ marginTop: '1rem', color: 'var(--primary-hover)', textDecoration: 'underline' }}>
                        Return to Devotionals
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
            <Navbar />
            
            <div style={{ paddingTop: '80px', flex: 1 }}>
                {/* Hero Section */}
                <div style={{ 
                    width: '100%', 
                    height: '400px', 
                    backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.8)), url(${formatImage(devotional.featured_image)})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'flex-end',
                    paddingBottom: '3rem'
                }}>
                    <div className="container">
                        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                            <span style={{
                                background: 'var(--primary-hover)',
                                color: 'white',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                marginBottom: '1rem',
                                display: 'inline-block'
                            }}>
                                📖 {devotional.day_name} Devotional
                            </span>
                            <h1 style={{ color: 'white', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '800', marginBottom: '1rem', lineHeight: 1.2 }}>
                                {devotional.title}
                            </h1>
                            <div style={{ display: 'flex', gap: '1.5rem', color: '#e2e8f0', fontSize: '1rem' }}>
                                <span>📅 {devotional.date_formatted}</span>
                                {devotional.author?.name && <span>✍️ By {devotional.author.name}</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="container" style={{ marginTop: '-2rem', position: 'relative', zIndex: 10, paddingBottom: '4rem' }}>
                    <div style={{ 
                        maxWidth: '800px', 
                        margin: '0 auto', 
                        background: 'white', 
                        padding: 'clamp(2rem, 5vw, 4rem)', 
                        borderRadius: '1rem', 
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' 
                    }}>
                        
                        {/* Scripture Callout */}
                        <div style={{ 
                            background: '#f8fafc', 
                            borderLeft: '4px solid var(--primary-hover)', 
                            padding: '2rem', 
                            borderRadius: '0 0.5rem 0.5rem 0',
                            marginBottom: '3rem',
                            position: 'relative'
                        }}>
                            <span style={{ fontSize: '4rem', color: 'rgba(34, 193, 230, 0.1)', position: 'absolute', top: '-1rem', left: '1rem', fontFamily: 'serif' }}>"</span>
                            <p style={{ fontSize: '1.25rem', fontStyle: 'italic', color: '#334155', lineHeight: 1.8, position: 'relative', zIndex: 1 }}>
                                {devotional.scripture_text}
                            </p>
                            <div style={{ marginTop: '1rem', fontWeight: '700', color: 'var(--primary-hover)', textAlign: 'right' }}>
                                — {devotional.scripture_reference}
                            </div>
                        </div>

                        {/* Main Message */}
                        <div 
                            style={{ 
                                color: '#1e293b', 
                                fontSize: '1.125rem', 
                                lineHeight: 1.8, 
                                marginBottom: '3rem',
                                whiteSpace: 'pre-wrap' // To respect line breaks from textarea
                            }}
                            dangerouslySetInnerHTML={{ __html: devotional.message }} 
                        />

                        {/* Kingdom Insight */}
                        {devotional.kingdom_insight && (
                            <div style={{ 
                                background: 'linear-gradient(135deg, rgba(34, 193, 230, 0.1) 0%, rgba(34, 193, 230, 0.02) 100%)', 
                                border: '1px solid rgba(34, 193, 230, 0.2)',
                                borderRadius: '1rem', 
                                padding: '2rem', 
                                marginBottom: '2rem'
                            }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-hover)', fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>
                                    <span>👑</span> Kingdom Insight
                                </h3>
                                <p style={{ color: '#334155', fontSize: '1.05rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                                    {devotional.kingdom_insight}
                                </p>
                            </div>
                        )}

                        {/* Prayer */}
                        {devotional.prayer && (
                            <div style={{ 
                                background: '#fef2f2', 
                                border: '1px solid #fecaca',
                                borderRadius: '1rem', 
                                padding: '2rem'
                            }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>
                                    <span>🙏</span> Prayer
                                </h3>
                                <p style={{ color: '#7f1d1d', fontSize: '1.05rem', lineHeight: 1.7, fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>
                                    {devotional.prayer}
                                </p>
                            </div>
                        )}
                        
                        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
                            <Link to="/devotionals" style={{ 
                                display: 'inline-block',
                                padding: '0.75rem 1.5rem', 
                                background: '#f1f5f9', 
                                color: '#475569', 
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontWeight: '600',
                                transition: 'all 0.2s'
                            }}>
                                ← Back to All Devotionals
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default DevotionalDetails;
