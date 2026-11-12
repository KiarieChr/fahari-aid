import React, { useState, useContext } from 'react';
import { createMember } from '../../../services/membersApi';
import { ThemeContext } from '../../../context/ThemeContext';

const CreateMemberModal = ({ onClose, onSuccess, initialStatus = 'Regular Member' }) => {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';

    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        cellGroup: '',
        category: 'Member',
        commitmentStatus: initialStatus,
        address: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMsg('');
        try {
            await createMember(formData);
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error('Failed to create member:', err);
            setErrorMsg(err?.response?.data?.detail || err?.message || 'Failed to register member. Please verify required fields.');
        } finally {
            setSubmitting(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '0.65rem 0.85rem',
        background: isDark ? '#0d0a1a' : '#ffffff',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1'}`,
        borderRadius: '0.5rem',
        color: isDark ? '#f8fafc' : '#0f172a',
        fontSize: '0.85rem',
        marginTop: '0.35rem',
        outline: 'none',
        transition: 'border-color 0.15s, background 0.2s, color 0.2s'
    };

    const labelStyle = {
        color: isDark ? '#cbd5e1' : '#334155',
        fontSize: '0.8rem',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '0.45rem'
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(15, 23, 42, 0.45)',
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
                maxWidth: '580px',
                maxHeight: '92vh',
                overflowY: 'auto',
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
                        <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: isDark ? '#f8fafc' : '#0f172a', margin: 0 }}>
                            {initialStatus === 'Committed Member' ? 'Register Committed Member' : 'Register New Member'}
                        </h2>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                            Add a disciple into the kingdom network registry
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#94a3b8',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            lineHeight: 1
                        }}
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.1rem' }}>
                    {/* Full Name */}
                    <div>
                        <label style={labelStyle}>Full Name *</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Enter full name"
                            style={inputStyle}
                            required
                        />
                    </div>

                    {/* Phone & Email */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Phone Number *</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="0712 345 678"
                                style={inputStyle}
                                required
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="example@mail.com"
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    {/* Cell Group & Category */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Cell Group</label>
                            <select
                                name="cellGroup"
                                value={formData.cellGroup}
                                onChange={handleChange}
                                style={inputStyle}
                            >
                                <option value="">Select Cell</option>
                                <option value="Grace Fellowship">Grace Fellowship (Karen)</option>
                                <option value="Bethel Youth">Bethel Youth (CBD)</option>
                                <option value="Emmanuel Prayer">Emmanuel Prayer (Kilimani)</option>
                                <option value="Zion Fellowship">Zion Fellowship (Parklands)</option>
                                <option value="Shalom Campus">Shalom Campus</option>
                                <option value="Victory Fellowship">Victory Fellowship (Kileleshwa)</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Ministry Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                style={inputStyle}
                            >
                                <option value="Member">Regular Disciple</option>
                                <option value="Cell Leader">Cell Leader</option>
                                <option value="Ministry Head">Ministry Department Head</option>
                                <option value="Pastor">Pastor / Elder</option>
                            </select>
                        </div>
                    </div>

                    {/* Commitment Status Radio */}
                    <div>
                        <label style={labelStyle}>Commitment Level</label>
                        <div style={{
                            display: 'flex',
                            gap: '1.5rem',
                            marginTop: '0.45rem',
                            padding: '0.65rem 0.85rem',
                            borderRadius: '0.5rem',
                            background: isDark ? '#0d0a1a' : '#f8fafc',
                            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0'}`
                        }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.82rem', color: isDark ? '#f8fafc' : '#0f172a' }}>
                                <input
                                    type="radio"
                                    name="commitmentStatus"
                                    value="Regular Member"
                                    checked={formData.commitmentStatus === 'Regular Member'}
                                    onChange={handleChange}
                                />
                                Regular Disciple
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.82rem', color: isDark ? '#f8fafc' : '#0f172a' }}>
                                <input
                                    type="radio"
                                    name="commitmentStatus"
                                    value="Committed Member"
                                    checked={formData.commitmentStatus === 'Committed Member'}
                                    onChange={handleChange}
                                />
                                Committed Pillar
                            </label>
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <label style={labelStyle}>Residential Location</label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Enter estate, road, or neighborhood..."
                            rows={2}
                            style={{ ...inputStyle, resize: 'vertical' }}
                        />
                    </div>

                    {/* Error Banner */}
                    {errorMsg && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#f87171',
                            borderRadius: '0.5rem',
                            padding: '0.65rem 0.85rem',
                            fontSize: '0.8rem'
                        }}>
                            ⚠️ {errorMsg}
                        </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            style={{
                                padding: '0.55rem 1.15rem',
                                borderRadius: '0.5rem',
                                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0'}`,
                                background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                                color: isDark ? '#cbd5e1' : '#64748b',
                                fontSize: '0.8125rem',
                                fontWeight: '500',
                                cursor: submitting ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                padding: '0.55rem 1.35rem',
                                borderRadius: '0.5rem',
                                border: 'none',
                                background: 'linear-gradient(135deg, #22c1e6 0%, #0ea5e9 100%)',
                                color: '#ffffff',
                                fontWeight: '600',
                                fontSize: '0.8125rem',
                                cursor: submitting ? 'wait' : 'pointer',
                                boxShadow: '0 2px 6px rgba(14, 165, 233, 0.25)'
                            }}
                        >
                            {submitting ? 'Registering...' : 'Register Member'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateMemberModal;
