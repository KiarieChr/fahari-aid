import React, { useState, useRef, useContext } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { ThemeContext } from '../../../../context/ThemeContext';
import { getMediaUrl } from '../../../../services/api';

const EditProfilePictureModal = ({ onClose }) => {
    const { user, uploadAvatar } = useAuth();
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef(null);

    // Current avatar URL
    const rawPhoto = user?.photo || user?.profile_picture || user?.avatar;
    const currentAvatar = getMediaUrl(rawPhoto);

    const initials = (() => {
        const name = user?.full_name || `${user?.first_name || user?.firstname || ''} ${user?.last_name || user?.lastname || ''}`.trim();
        if (name) {
            return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        }
        return (user?.email || '??').substring(0, 2).toUpperCase();
    })();

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setError('Please select a valid image (JPEG, PNG, GIF, or WebP).');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be smaller than 5 MB.');
            return;
        }

        setError(null);
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setPreviewUrl(reader.result);
        reader.readAsDataURL(file);
    };

    const handleClearSelection = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            setError('Please select a photo first.');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await uploadAvatar(selectedFile);
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1200);
        } catch (err) {
            setError(err.message || 'Upload failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const displaySrc = previewUrl || currentAvatar;

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
            padding: '1rem',
        }} onClick={onClose}>
            <div style={{
                background: isDark ? '#151128' : '#ffffff',
                padding: '2rem',
                borderRadius: '1.25rem',
                width: '100%',
                maxWidth: '420px',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                boxShadow: isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.6)' : '0 25px 50px -12px rgba(15, 23, 42, 0.15)',
                textAlign: 'center',
                color: isDark ? '#f8fafc' : '#0f172a',
            }} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', textAlign: 'left' }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', color: isDark ? '#f8fafc' : '#0f172a', margin: '0 0 0.15rem 0', fontWeight: '700' }}>
                            Profile Photo
                        </h2>
                        <p style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.8rem', margin: 0 }}>
                            Max 5MB — JPEG, PNG, GIF, or WebP
                        </p>
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
                    >×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Avatar preview */}
                    <div style={{ marginBottom: '1.5rem', position: 'relative', display: 'inline-block' }}>
                        <div style={{
                            width: '140px',
                            height: '140px',
                            borderRadius: '50%',
                            background: displaySrc ? 'transparent' : '#2563eb',
                            border: `4px solid ${previewUrl ? '#2563eb' : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0')}`,
                            margin: '0 auto',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2.5rem',
                            color: 'white',
                            fontWeight: '700',
                            transition: 'border-color 0.3s',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                        }}>
                            {displaySrc ? (
                                <img
                                    src={displaySrc}
                                    alt="Preview"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : initials}
                        </div>
                        {previewUrl && (
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                right: '-4px',
                                background: '#16a34a',
                                color: '#ffffff',
                                borderRadius: '50%',
                                width: '28px',
                                height: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.85rem',
                                border: `2px solid ${isDark ? '#151128' : '#ffffff'}`,
                                fontWeight: 'bold'
                            }}>✓</div>
                        )}
                    </div>

                    {/* Alerts */}
                    {error && (
                        <div style={{ background: isDark ? 'rgba(239,68,68,0.15)' : '#fef2f2', border: `1px solid ${isDark ? 'rgba(239,68,68,0.3)' : '#fecaca'}`, borderRadius: '0.5rem', padding: '0.6rem 0.9rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.85rem', textAlign: 'left' }}>
                            ⚠ {error}
                        </div>
                    )}
                    {success && (
                        <div style={{ background: isDark ? 'rgba(34,197,94,0.15)' : '#f0fdf4', border: `1px solid ${isDark ? 'rgba(34,197,94,0.3)' : '#bbf7d0'}`, borderRadius: '0.5rem', padding: '0.6rem 0.9rem', marginBottom: '1rem', color: '#16a34a', fontSize: '0.85rem', textAlign: 'left', fontWeight: '600' }}>
                            ✓ Photo updated successfully!
                        </div>
                    )}

                    {/* File pick button */}
                    <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={loading}
                            style={{
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                border: `1px dashed ${isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1'}`,
                                background: isDark ? '#0d0a1a' : '#f8fafc',
                                color: isDark ? '#f8fafc' : '#0f172a',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                transition: 'all 0.2s',
                            }}
                        >
                            📁 {selectedFile ? `Change: ${selectedFile.name.slice(0, 24)}...` : 'Select New Photo'}
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            style={{ display: 'none' }}
                        />

                        {selectedFile && (
                            <button
                                type="button"
                                onClick={handleClearSelection}
                                disabled={loading}
                                style={{
                                    padding: '0.5rem',
                                    borderRadius: '0.5rem',
                                    border: `1px solid ${isDark ? 'rgba(239,68,68,0.3)' : '#fecaca'}`,
                                    background: isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2',
                                    color: '#dc2626',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '0.825rem',
                                }}
                            >
                                ✕ Clear Selection
                            </button>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            style={{
                                padding: '0.65rem 1.25rem',
                                borderRadius: '0.5rem',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0'}`,
                                background: isDark ? '#252038' : '#f1f5f9',
                                color: isDark ? '#cbd5e1' : '#475569',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '600'
                            }}
                        >Cancel</button>
                        <button
                            type="submit"
                            disabled={loading || !selectedFile}
                            style={{
                                padding: '0.65rem 1.5rem',
                                borderRadius: '0.5rem',
                                border: 'none',
                                background: (loading || !selectedFile) ? (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0') : '#2563eb',
                                color: (loading || !selectedFile) ? (isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8') : '#ffffff',
                                fontWeight: '700',
                                cursor: (loading || !selectedFile) ? 'not-allowed' : 'pointer',
                                fontSize: '0.9rem',
                                transition: 'all 0.2s',
                                boxShadow: (loading || !selectedFile) ? 'none' : '0 4px 12px rgba(37,99,235,0.25)'
                            }}
                        >
                            {loading ? 'Uploading...' : 'Upload Photo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfilePictureModal;
