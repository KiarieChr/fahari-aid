import React, { useState, useRef, useContext } from 'react';
import { ThemeContext } from '../../../context/ThemeContext';
import { createMedia } from '../../../services/mediaApi';

const UploadPhotosModal = ({ onClose, onSuccess }) => {
    const { theme } = useContext(ThemeContext || {});
    const isDark = theme === 'dark';

    const [uploadType, setUploadType] = useState('url'); // 'url' or 'file'
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        series: 'Conferences',
        date: new Date().toISOString().split('T')[0],
        coverUrl: '',
        photoUrls: '',
        description: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title) {
            alert('Please enter an album title.');
            return;
        }

        try {
            setSubmitting(true);

            // Parse photo URLs
            const photoList = formData.photoUrls
                ? formData.photoUrls.split('\n').map(s => s.trim()).filter(Boolean)
                : [];

            const cover = formData.coverUrl || photoList[0] || 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=600';

            const payload = {
                title: formData.title,
                media_type: 'photo_gallery',
                series: formData.series,
                date: formData.date,
                thumbnail_url: cover,
                duration: `${Math.max(photoList.length, 12)} Photos`,
                photos: photoList.length > 0 ? photoList : [cover],
                description: formData.description || ''
            };

            await createMedia(payload);
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error('Gallery upload error:', err);
            alert('Failed to publish photo gallery. Please check inputs and try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '0.65rem 0.85rem',
        background: isDark ? '#0d0a1a' : '#f8fafc',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0'}`,
        borderRadius: '0.5rem',
        color: isDark ? '#f8fafc' : '#0f172a',
        fontSize: '0.9rem',
        marginTop: '0.35rem',
        outline: 'none',
        boxSizing: 'border-box'
    };

    const labelStyle = {
        color: isDark ? '#94a3b8' : '#475569',
        fontSize: '0.85rem',
        fontWeight: '600'
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: isDark ? 'rgba(0,0,0,0.75)' : 'rgba(15,23,42,0.45)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1rem'
        }} onClick={onClose}>
            <div style={{
                background: isDark ? '#151128' : '#ffffff',
                padding: '2rem',
                borderRadius: '1.25rem',
                width: '100%',
                maxWidth: '600px',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                boxShadow: isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.6)' : '0 25px 50px -12px rgba(15, 23, 42, 0.15)',
                color: isDark ? '#f8fafc' : '#0f172a',
                maxHeight: '90vh',
                overflowY: 'auto'
            }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: isDark ? 'rgba(16,185,129,0.2)' : '#ecfdf5',
                            color: '#10b981',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem'
                        }}>
                            🖼️
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', color: isDark ? '#f8fafc' : '#0f172a', margin: 0, fontWeight: '700' }}>
                                Create Photo Vault / Album
                            </h2>
                            <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                                Publish event galleries and church celebration photo archives
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: isDark ? '#252038' : '#f1f5f9',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                            color: isDark ? '#94a3b8' : '#64748b',
                            fontSize: '1.25rem',
                            cursor: 'pointer',
                            borderRadius: '8px',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            lineHeight: 1
                        }}
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                    <div>
                        <label style={labelStyle}>Gallery / Album Title *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g. Easter Retreat 2026 Moments"
                            style={inputStyle}
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Event Category</label>
                            <select name="series" value={formData.series} onChange={handleChange} style={inputStyle}>
                                <option value="Conferences">Conferences</option>
                                <option value="Celebrations">Celebrations</option>
                                <option value="Missions">Missions & Outreach</option>
                                <option value="Youth Events">Youth Events</option>
                                <option value="Worship Nights">Worship Nights</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Event Date *</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} style={inputStyle} required />
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Cover Image URL</label>
                        <input
                            type="url"
                            name="coverUrl"
                            value={formData.coverUrl}
                            onChange={handleChange}
                            placeholder="https://images.unsplash.com/..."
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Photo Image URLs (one URL per line)</label>
                        <textarea
                            name="photoUrls"
                            value={formData.photoUrls}
                            onChange={handleChange}
                            placeholder="https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg"
                            style={{ ...inputStyle, minHeight: '90px', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.8rem' }}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Description / Highlights</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Highlights and summary of the gathering..."
                            style={{ ...inputStyle, minHeight: '65px', resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <button type="button" onClick={onClose} disabled={submitting} style={{
                            padding: '0.75rem 1.25rem',
                            borderRadius: '0.5rem',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0'}`,
                            background: isDark ? '#252038' : '#f1f5f9',
                            color: isDark ? '#cbd5e1' : '#475569',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            cursor: 'pointer'
                        }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting} style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.5rem',
                            border: 'none',
                            background: '#10b981',
                            color: '#ffffff',
                            fontWeight: '700',
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            opacity: submitting ? 0.7 : 1,
                            boxShadow: '0 4px 12px rgba(16,185,129,0.25)'
                        }}>
                            {submitting ? 'Creating...' : 'Create Album'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadPhotosModal;
