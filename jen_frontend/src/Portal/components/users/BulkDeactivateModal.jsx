import React, { useState, useContext } from 'react';
import { ThemeContext } from '../../../context/ThemeContext';

const BulkDeactivateModal = ({ onClose }) => {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';

    const initialUsers = [
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Viewer' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Editor' },
        { id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'Viewer' },
        { id: '4', name: 'Sarah Williams', email: 'sarah@example.com', role: 'Admin' },
        { id: '5', name: 'David Brown', email: 'david@example.com', role: 'Cell Leader' }
    ];

    const [users] = useState(initialUsers);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const toggleUser = (id) => {
        setSelectedUserIds(prev =>
            prev.includes(id)
                ? prev.filter(userId => userId !== id)
                : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (selectedUserIds.length === filteredUsers.length) {
            setSelectedUserIds([]);
        } else {
            setSelectedUserIds(filteredUsers.map(u => u.id));
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedUserIds.length === 0) {
            alert('Please select at least one user to deactivate.');
            return;
        }

        const confirmDeactivate = window.confirm(`Are you sure you want to deactivate ${selectedUserIds.length} user(s)? This will revoke their access to the portal.`);
        if (confirmDeactivate) {
            alert(`Deactivation simulated for user IDs: ${selectedUserIds.join(', ')}`);
            onClose();
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
        outline: 'none',
        boxSizing: 'border-box'
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
                maxHeight: '85vh',
                display: 'flex',
                flexDirection: 'column',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                boxShadow: isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.6)' : '0 25px 50px -12px rgba(15, 23, 42, 0.15)',
                color: isDark ? '#f8fafc' : '#0f172a'
            }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: isDark ? 'rgba(220,38,38,0.2)' : '#fef2f2',
                            color: '#dc2626',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem'
                        }}>
                            🚫
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', color: isDark ? '#f8fafc' : '#0f172a', margin: 0, fontWeight: '700' }}>
                                Bulk User Deactivation
                            </h2>
                            <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                                Select multiple accounts to revoke access
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

                <div style={{ marginBottom: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={inputStyle}
                    />
                </div>

                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                    borderRadius: '0.5rem',
                    marginBottom: '1.25rem'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead>
                            <tr style={{ background: isDark ? '#0d0a1a' : '#f8fafc', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}` }}>
                                <th style={{ padding: '0.65rem 0.75rem', width: '40px', textAlign: 'center' }}>
                                    <input
                                        type="checkbox"
                                        onChange={toggleAll}
                                        checked={filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length}
                                        style={{ accentColor: '#dc2626', cursor: 'pointer' }}
                                    />
                                </th>
                                <th style={{ padding: '0.65rem 0.75rem', textAlign: 'left', fontWeight: '600' }}>User</th>
                                <th style={{ padding: '0.65rem 0.75rem', textAlign: 'left', fontWeight: '600' }}>Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map(user => {
                                    const isSelected = selectedUserIds.includes(user.id);
                                    return (
                                        <tr
                                            key={user.id}
                                            onClick={() => toggleUser(user.id)}
                                            style={{
                                                cursor: 'pointer',
                                                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'}`,
                                                background: isSelected ? (isDark ? 'rgba(220,38,38,0.15)' : '#fef2f2') : 'transparent'
                                            }}
                                        >
                                            <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => {}} // handled by row click
                                                    style={{ accentColor: '#dc2626', cursor: 'pointer' }}
                                                />
                                            </td>
                                            <td style={{ padding: '0.65rem 0.75rem' }}>
                                                <div style={{ fontWeight: '600', color: isDark ? '#f8fafc' : '#0f172a' }}>{user.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b' }}>{user.email}</div>
                                            </td>
                                            <td style={{ padding: '0.65rem 0.75rem' }}>
                                                <span style={{
                                                    padding: '0.2rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    background: isDark ? '#252038' : '#f1f5f9',
                                                    color: isDark ? '#cbd5e1' : '#475569'
                                                }}>
                                                    {user.role}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: isDark ? '#94a3b8' : '#64748b' }}>
                                        No users found matching "{searchTerm}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                        {selectedUserIds.length} user(s) selected
                    </span>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button type="button" onClick={onClose} style={{
                            padding: '0.65rem 1.25rem',
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
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={selectedUserIds.length === 0}
                            style={{
                                padding: '0.65rem 1.25rem',
                                borderRadius: '0.5rem',
                                border: 'none',
                                background: selectedUserIds.length > 0 ? '#dc2626' : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'),
                                color: selectedUserIds.length > 0 ? '#ffffff' : (isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8'),
                                fontWeight: '700',
                                cursor: selectedUserIds.length > 0 ? 'pointer' : 'not-allowed',
                                boxShadow: selectedUserIds.length > 0 ? '0 4px 12px rgba(220,38,38,0.25)' : 'none'
                            }}
                        >
                            Deactivate ({selectedUserIds.length})
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BulkDeactivateModal;
