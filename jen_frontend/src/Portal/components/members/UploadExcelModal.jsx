import React, { useState, useRef, useContext } from 'react';
import { ThemeContext } from '../../../context/ThemeContext';

const UploadExcelModal = ({ onClose }) => {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';

    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls') || droppedFile.name.endsWith('.csv'))) {
            setFile(droppedFile);
        } else {
            alert('Please upload an Excel or CSV file.');
        }
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!file) {
            alert('Please select a file first.');
            return;
        }
        alert(`Uploading file: ${file.name}`);
        onClose();
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
            <div
                style={{
                    background: isDark ? '#151128' : '#ffffff',
                    padding: '2rem',
                    borderRadius: '1.25rem',
                    width: '100%',
                    maxWidth: '520px',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                    boxShadow: isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.6)' : '0 25px 50px -12px rgba(15, 23, 42, 0.15)',
                    color: isDark ? '#f8fafc' : '#0f172a'
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
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
                            📥
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', color: isDark ? '#f8fafc' : '#0f172a', margin: 0, fontWeight: '700' }}>Upload Members</h2>
                            <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: isDark ? '#94a3b8' : '#64748b' }}>Import disciples and leaders via spreadsheet</p>
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

                <form onSubmit={handleSubmit}>
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current.click()}
                        style={{
                            border: `2px dashed ${isDragging ? '#2563eb' : (isDark ? 'rgba(255,255,255,0.18)' : '#cbd5e1')}`,
                            borderRadius: '1rem',
                            padding: '3rem 2rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            background: isDragging ? (isDark ? 'rgba(37,99,235,0.15)' : '#eff6ff') : (isDark ? '#0d0a1a' : '#f8fafc'),
                            transition: 'all 0.2s',
                            marginBottom: '1.25rem'
                        }}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                            accept=".xlsx,.xls,.csv"
                        />
                        {file ? (
                            <div>
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📄</div>
                                <div style={{ color: isDark ? '#f8fafc' : '#0f172a', fontWeight: '600', fontSize: '1rem' }}>{file.name}</div>
                                <div style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.85rem', marginTop: '0.25rem' }}>{(file.size / 1024).toFixed(2)} KB</div>
                            </div>
                        ) : (
                            <div>
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.8 }}>☁️</div>
                                <div style={{ color: isDark ? '#f8fafc' : '#0f172a', fontWeight: '600', marginBottom: '0.35rem', fontSize: '1rem' }}>
                                    Click or Drag spreadsheet here
                                </div>
                                <div style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.85rem' }}>
                                    Supports .xlsx, .xls, and .csv files
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); alert('Template download initiated.'); }}
                            style={{
                                color: '#2563eb',
                                fontSize: '0.875rem',
                                textDecoration: 'none',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.35rem'
                            }}
                        >
                            <span>📥</span> Download Excel Template
                        </a>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '0.75rem 1.25rem',
                                borderRadius: '0.5rem',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0'}`,
                                background: isDark ? '#252038' : '#f1f5f9',
                                color: isDark ? '#cbd5e1' : '#475569',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!file}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '0.5rem',
                                border: 'none',
                                background: file ? '#2563eb' : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'),
                                color: file ? '#ffffff' : (isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8'),
                                fontWeight: '700',
                                fontSize: '0.95rem',
                                cursor: file ? 'pointer' : 'not-allowed',
                                boxShadow: file ? '0 4px 12px rgba(37,99,235,0.25)' : 'none'
                            }}
                        >
                            Upload File
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadExcelModal;
