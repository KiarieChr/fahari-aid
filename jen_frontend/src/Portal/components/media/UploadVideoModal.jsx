import React, { useState, useRef, useContext } from 'react';
import { ThemeContext } from '../../../context/ThemeContext';
import { createMedia } from '../../../services/mediaApi';

const UploadVideoModal = ({ onClose, onSuccess }) => {
    const { theme } = useContext(ThemeContext || {});
    const isDark = theme === 'dark';

    const [uploadType, setUploadType] = useState('url'); // 'url' or 'file'
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        preacher: '',
        date: new Date().toISOString().split('T')[0],
        series: 'Sunday Celebration',
        videoUrl: '',
        thumbnailUrl: '',
        duration: '1:05:00',
        featured: false,
        description: ''
    });
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.type.startsWith('video/')) {
                setFile(selectedFile);
            } else {
                alert('Please upload a video file (MP4, MOV, WebM, etc.)');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (uploadType === 'file' && !file) {
            alert('Please select a video file.');
            return;
        }
        if (uploadType === 'url' && !formData.videoUrl) {
            alert('Please enter a video stream URL.');
            return;
        }

        try {
            setSubmitting(true);
            let payload;

            // Extract default thumbnail if YouTube
            let computedThumbnail = formData.thumbnailUrl;
            if (!computedThumbnail && formData.videoUrl) {
                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                const match = formData.videoUrl.match(regExp);
                if (match && match[2].length === 11) {
                    computedThumbnail = `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`;
                }
            }
            if (!computedThumbnail) {
                computedThumbnail = 'https://images.unsplash.com/photo-1549488497-6577382be704?q=80&w=2070&auto=format&fit=crop';
            }

            if (uploadType === 'file') {
                payload = new FormData();
                payload.append('title', formData.title);
                payload.append('media_type', 'video');
                payload.append('preacher', formData.preacher);
                payload.append('series', formData.series);
                payload.append('date', formData.date);
                payload.append('duration', formData.duration || '1:00:00');
                payload.append('description', formData.description || '');
                payload.append('featured', formData.featured ? 'true' : 'false');
                payload.append('thumbnail_url', computedThumbnail);
                payload.append('media_file', file);
            } else {
                payload = {
                    title: formData.title,
                    media_type: 'video',
                    preacher: formData.preacher,
                    series: formData.series,
                    date: formData.date,
                    duration: formData.duration || '1:00:00',
                    media_url: formData.videoUrl,
                    thumbnail_url: computedThumbnail,
                    featured: formData.featured,
                    description: formData.description || ''
                };
            }

            await createMedia(payload);
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error('Video upload error:', err);
            alert('Failed to publish video broadcast. Please check inputs and try again.');
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

    const tabStyle = (isActive) => ({
        padding: '0.6rem 1.25rem',
        cursor: 'pointer',
        borderBottom: isActive ? '2px solid #ef4444' : '2px solid transparent',
        color: isActive ? '#ef4444' : (isDark ? '#94a3b8' : '#64748b'),
        fontWeight: isActive ? '700' : '500',
        transition: 'all 0.15s ease'
    });

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
                maxWidth: '620px',
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
                            background: isDark ? 'rgba(239,68,68,0.2)' : '#fef2f2',
                            color: '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem'
                        }}>
                            📹
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', color: isDark ? '#f8fafc' : '#0f172a', margin: 0, fontWeight: '700' }}>
                                Add Video Broadcast
                            </h2>
                            <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                                Embed YouTube livestream, Vimeo or upload MP4 recording
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

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}` }}>
                    <div style={tabStyle(uploadType === 'url')} onClick={() => setUploadType('url')}>Video Stream Link (YouTube / Vimeo / Cloud)</div>
                    <div style={tabStyle(uploadType === 'file')} onClick={() => setUploadType('file')}>Direct MP4 Upload</div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                    {uploadType === 'file' ? (
                        <div
                            onClick={() => fileInputRef.current.click()}
                            style={{
                                border: `2px dashed ${isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1'}`,
                                borderRadius: '0.75rem',
                                padding: '1.75rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                background: isDark ? '#0d0a1a' : '#f8fafc'
                            }}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept="video/*"
                                style={{ display: 'none' }}
                            />
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📽️</div>
                            {file ? (
                                <div style={{ color: '#ef4444', fontWeight: '600' }}>{file.name}</div>
                            ) : (
                                <>
                                    <div style={{ color: isDark ? '#f8fafc' : '#0f172a', fontWeight: '600' }}>Click to select video file</div>
                                    <div style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>MP4, WebM, MOV supported</div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div>
                            <label style={labelStyle}>Video Stream URL (YouTube, Vimeo, or Live URL) *</label>
                            <input
                                type="url"
                                name="videoUrl"
                                value={formData.videoUrl}
                                onChange={handleChange}
                                placeholder="https://www.youtube.com/watch?v=..."
                                style={inputStyle}
                                required={uploadType === 'url'}
                            />
                        </div>
                    )}

                    <div>
                        <label style={labelStyle}>Broadcast / Message Title *</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Living Above Circumstances" style={inputStyle} required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Preacher / Speaker *</label>
                            <input type="text" name="preacher" value={formData.preacher} onChange={handleChange} placeholder="e.g. Pastor Timothy" style={inputStyle} required />
                        </div>
                        <div>
                            <label style={labelStyle}>Broadcast Date *</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} style={inputStyle} required />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Teaching Series</label>
                            <select name="series" value={formData.series} onChange={handleChange} style={inputStyle}>
                                <option value="Sunday Celebration">Sunday Celebration</option>
                                <option value="Faith Series">Faith Series</option>
                                <option value="Prayer School">Prayer School</option>
                                <option value="Youth Summit">Youth Summit</option>
                                <option value="Leadership Conference">Leadership Conference</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Duration (hh:mm:ss)</label>
                            <input type="text" name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g. 1:15:00" style={inputStyle} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.25rem' }}>
                        <input
                            type="checkbox"
                            id="featuredCheck"
                            name="featured"
                            checked={formData.featured}
                            onChange={handleChange}
                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <label htmlFor="featuredCheck" style={{ ...labelStyle, cursor: 'pointer', margin: 0 }}>
                            Feature this broadcast on Hero Banner (Latest Message)
                        </label>
                    </div>

                    <div>
                        <label style={labelStyle}>Summary / Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Key sermon highlights, scriptures, and program overview..."
                            style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }}
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
                            background: '#ef4444',
                            color: '#ffffff',
                            fontWeight: '700',
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            opacity: submitting ? 0.7 : 1,
                            boxShadow: '0 4px 12px rgba(239,68,68,0.25)'
                        }}>
                            {submitting ? 'Publishing...' : 'Publish Broadcast'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadVideoModal;
