import React, { useState, useRef, useContext } from 'react';
import { ThemeContext } from '../../../context/ThemeContext';
import { createMedia } from '../../../services/mediaApi';

const UploadAudioModal = ({ onClose, onSuccess }) => {
    const { theme } = useContext(ThemeContext || {});
    const isDark = theme === 'dark';

    const [uploadType, setUploadType] = useState('url'); // 'url' or 'file'
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        preacher: '',
        date: new Date().toISOString().split('T')[0],
        series: 'Sunday Service',
        audioUrl: '',
        thumbnailUrl: '',
        duration: '45:00',
        description: ''
    });
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.type.startsWith('audio/')) {
                setFile(selectedFile);
            } else {
                alert('Please upload an audio file (MP3, WAV, AAC, etc.)');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (uploadType === 'file' && !file) {
            alert('Please select an audio file to upload.');
            return;
        }
        if (uploadType === 'url' && !formData.audioUrl) {
            alert('Please enter an audio URL.');
            return;
        }

        try {
            setSubmitting(true);
            let payload;

            if (uploadType === 'file') {
                payload = new FormData();
                payload.append('title', formData.title);
                payload.append('media_type', 'audio');
                payload.append('preacher', formData.preacher);
                payload.append('series', formData.series);
                payload.append('date', formData.date);
                payload.append('duration', formData.duration || '45:00');
                payload.append('description', formData.description || '');
                payload.append('media_file', file);
                if (formData.thumbnailUrl) {
                    payload.append('thumbnail_url', formData.thumbnailUrl);
                }
            } else {
                payload = {
                    title: formData.title,
                    media_type: 'audio',
                    preacher: formData.preacher,
                    series: formData.series,
                    date: formData.date,
                    duration: formData.duration || '45:00',
                    media_url: formData.audioUrl,
                    thumbnail_url: formData.thumbnailUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop',
                    description: formData.description || ''
                };
            }

            await createMedia(payload);
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error('Audio upload error:', err);
            alert('Failed to upload audio sermon. Please check inputs and try again.');
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
        borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
        color: isActive ? '#2563eb' : (isDark ? '#94a3b8' : '#64748b'),
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
                            background: isDark ? 'rgba(37,99,235,0.2)' : '#eff6ff',
                            color: '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem'
                        }}>
                            🎧
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', color: isDark ? '#f8fafc' : '#0f172a', margin: 0, fontWeight: '700' }}>
                                Upload Audio Sermon
                            </h2>
                            <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                                Add audio recording or link to the media library
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
                    <div style={tabStyle(uploadType === 'url')} onClick={() => setUploadType('url')}>Audio URL / Cloud Link</div>
                    <div style={tabStyle(uploadType === 'file')} onClick={() => setUploadType('file')}>Direct Audio File Upload</div>
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
                                accept="audio/*"
                                style={{ display: 'none' }}
                            />
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎤</div>
                            {file ? (
                                <div style={{ color: '#2563eb', fontWeight: '600' }}>{file.name}</div>
                            ) : (
                                <>
                                    <div style={{ color: isDark ? '#f8fafc' : '#0f172a', fontWeight: '600' }}>Click to select audio file</div>
                                    <div style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>MP3, WAV, AAC supported</div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div>
                            <label style={labelStyle}>Direct Audio URL (MP3, Podcast CDN, SoundCloud)</label>
                            <input
                                type="url"
                                name="audioUrl"
                                value={formData.audioUrl}
                                onChange={handleChange}
                                placeholder="https://cdn.example.com/sermons/message.mp3"
                                style={inputStyle}
                                required={uploadType === 'url'}
                            />
                        </div>
                    )}

                    <div>
                        <label style={labelStyle}>Sermon Title *</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. The Power of Kingdom Faith" style={inputStyle} required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Preacher / Speaker *</label>
                            <input type="text" name="preacher" value={formData.preacher} onChange={handleChange} placeholder="e.g. Pastor Daniel Mutua" style={inputStyle} required />
                        </div>
                        <div>
                            <label style={labelStyle}>Date Preached *</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} style={inputStyle} required />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Series / Category</label>
                            <select name="series" value={formData.series} onChange={handleChange} style={inputStyle}>
                                <option value="Sunday Service">Sunday Service</option>
                                <option value="Mid-Week Service">Mid-Week Service</option>
                                <option value="Special Conference">Special Conference</option>
                                <option value="Youth Service">Youth Service</option>
                                <option value="Revival Meeting">Revival Meeting</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Estimated Duration</label>
                            <input type="text" name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g. 45:20" style={inputStyle} />
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Description / Key Scripture</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Brief sermon outline or key scriptural references..."
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
                            background: '#2563eb',
                            color: '#ffffff',
                            fontWeight: '700',
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            opacity: submitting ? 0.7 : 1,
                            boxShadow: '0 4px 12px rgba(37,99,235,0.25)'
                        }}>
                            {submitting ? 'Uploading...' : 'Save & Publish Audio'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadAudioModal;
