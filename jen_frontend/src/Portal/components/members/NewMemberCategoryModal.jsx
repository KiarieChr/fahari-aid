import React, { useState, useContext } from 'react';
import { ThemeContext } from '../../../context/ThemeContext';

const NewMemberCategoryModal = ({ onClose }) => {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#22c1e6'
    });

    const colors = [
        '#22c1e6', // Cyan
        '#a855f7', // Purple
        '#f59e0b', // Orange
        '#ef4444', // Red
        '#10b981', // Green
        '#ec4899', // Pink
        '#6366f1', // Indigo
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleColorSelect = (color) => {
        setFormData(prev => ({ ...prev, color }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onClose();
    };

    const inputStyle = {
        width: '100%',
        padding: '0.65rem 0.85rem',
        borderRadius: '0.5rem',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1'}`,
        background: isDark ? '#0d0a1a' : '#ffffff',
        color: isDark ? '#f8fafc' : '#0f172a',
        fontSize: '0.85rem',
        marginTop: '0.35rem',
        outline: 'none',
        transition: 'border-color 0.15s, background 0.2s, color 0.2s'
    };

    const labelStyle = {
        color: isDark ? '#cbd5e1' : '#334155',
        fontSize: '0.8rem',
        fontWeight: '600'
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: isDark ? 'rgba(0,0,0,0.75)' : 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            padding: '1rem'
        }}>
            <div style={{
                background: isDark ? '#151128' : '#ffffff',
                padding: '1.75rem 2rem',
                borderRadius: '1.25rem',
                width: '100%',
                maxWidth: '460px',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0'}`,
                boxShadow: isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.6)' : '0 20px 40px -8px rgba(0, 0, 0, 0.15)',
                color: isDark ? '#f8fafc' : '#0f172a',
                transition: 'background 0.2s, border-color 0.2s, color 0.2s'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.25rem',
                    paddingBottom: '1rem',
                    borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9'}`
                }}>
                    <div>
                        <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: isDark ? '#f8fafc' : '#0f172a', margin: 0 }}>Add Member Category</h2>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                            Group disciples by ministry tier or spiritual docket
                        </p>
                    </div>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.15rem' }}>
                    <div>
                        <label style={labelStyle}>Category Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. Pillar, Soul Winner, Intern"
                            style={inputStyle}
                            required
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Badge Color</label>
                        <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.5rem' }}>
                            {colors.map((c, i) => (
                                <div
                                    key={i}
                                    onClick={() => handleColorSelect(c)}
                                    style={{
                                        width: '26px',
                                        height: '26px',
                                        borderRadius: '50%',
                                        background: c,
                                        cursor: 'pointer',
                                        border: formData.color === c ? `2px solid ${isDark ? '#ffffff' : '#0f172a'}` : '2px solid transparent',
                                        transform: formData.color === c ? 'scale(1.15)' : 'scale(1)',
                                        transition: 'all 0.2s'
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Short description of this member group..."
                            rows={3}
                            style={{ ...inputStyle, resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '0.55rem 1.15rem',
                                borderRadius: '0.5rem',
                                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0'}`,
                                background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                                color: isDark ? '#cbd5e1' : '#64748b',
                                fontSize: '0.8125rem',
                                fontWeight: '500',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={{
                                padding: '0.55rem 1.35rem',
                                borderRadius: '0.5rem',
                                border: 'none',
                                background: 'linear-gradient(135deg, #22c1e6 0%, #0ea5e9 100%)',
                                color: '#ffffff',
                                fontWeight: '600',
                                fontSize: '0.8125rem',
                                cursor: 'pointer',
                                boxShadow: '0 2px 6px rgba(14, 165, 233, 0.25)'
                            }}
                        >
                            Create Category
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewMemberCategoryModal;
