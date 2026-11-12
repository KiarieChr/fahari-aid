import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ContactInfoItem = ({ icon, title, content }) => (
    <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '2.5rem', alignItems: 'center' }}>
        <div style={{
            width: '55px',
            height: '55px',
            background: 'rgba(34, 193, 230, 0.08)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#22c1e6',
            fontSize: '1.5rem',
            flexShrink: 0,
            border: '1px solid rgba(34, 193, 230, 0.15)'
        }}>
            {icon}
        </div>
        <div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#120D20', marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>
                {title}
            </h4>
            <div style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: '500', lineHeight: 1.5 }}>
                {content}
            </div>
        </div>
    </div>
);

const ContactFormSection = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showToast, setShowToast] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/jesusenthroned/api/';

    useEffect(() => {
        if (message.text) {
            setShowToast(true);
            const timer = setTimeout(() => {
                setShowToast(false);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const res = await axios.post(`${API_URL}public_send_message.php`, formData);
            if (res.data.success) {
                setMessage({ text: res.data.message || 'Message sent successfully!', type: 'success' });
                setFormData({
                    full_name: '',
                    email: '',
                    phone: '',
                    subject: '',
                    message: ''
                });
            } else {
                setMessage({ text: res.data.error || 'Failed to send message.', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: error.response?.data?.error || 'An error occurred. Please try again.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section style={{ padding: '5rem 1rem 7rem', background: '#f8fafc', position: 'relative' }}>
            <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
                <div className="contact-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '5rem',
                    alignItems: 'start'
                }}>
                    {/* Left Column: Contact Info */}
                    <div>
                        <h2 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#120D20', marginBottom: '3rem', letterSpacing: '-0.02em' }}>
                            Get In Touch
                        </h2>

                        <ContactInfoItem
                            icon="📍"
                            title="Address"
                            content={
                                <>
                                    123 Faith Avenue<br />
                                    Barnabas - Nakuru, Kenya
                                </>
                            }
                        />
                        <ContactInfoItem
                            icon="📞"
                            title="Phone"
                            content="+254 702 961713"
                        />
                        <ContactInfoItem
                            icon="✉️"
                            title="Email"
                            content="info@jesusenthroned.org"
                        />
                        <ContactInfoItem
                            icon="🕒"
                            title="Office Hours"
                            content={
                                <>
                                    Monday - Friday<br />
                                    9:00 AM - 5:00 PM EAT
                                </>
                            }
                        />
                    </div>

                    {/* Right Column: Contact Form */}
                    <div style={{
                        background: 'white',
                        padding: '3rem',
                        borderRadius: '24px',
                        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.06)',
                        border: '1px solid rgba(0,0,0,0.02)'
                    }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#120D20', marginBottom: '2rem', letterSpacing: '-0.01em' }}>
                            Send Us a Message
                        </h3>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>Full Name *</label>
                                    <input 
                                        type="text" 
                                        name="full_name" 
                                        required 
                                        placeholder="Your name" 
                                        value={formData.full_name} 
                                        onChange={handleChange}
                                        style={{
                                            padding: '0.85rem 1rem', borderRadius: '12px', border: '2px solid #e2e8f0', background: '#f8fafc', outline: 'none', transition: 'all 0.2s', fontSize: '0.95rem'
                                        }} 
                                        className="input-focus"
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>Email *</label>
                                    <input 
                                        type="email" 
                                        name="email" 
                                        required 
                                        placeholder="your@email.com" 
                                        value={formData.email} 
                                        onChange={handleChange}
                                        style={{
                                            padding: '0.85rem 1rem', borderRadius: '12px', border: '2px solid #e2e8f0', background: '#f8fafc', outline: 'none', transition: 'all 0.2s', fontSize: '0.95rem'
                                        }} 
                                        className="input-focus"
                                    />
                                </div>
                            </div>

                            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>Phone</label>
                                    <input 
                                        type="text" 
                                        name="phone" 
                                        placeholder="+254 700 000 000" 
                                        value={formData.phone} 
                                        onChange={handleChange}
                                        style={{
                                            padding: '0.85rem 1rem', borderRadius: '12px', border: '2px solid #e2e8f0', background: '#f8fafc', outline: 'none', transition: 'all 0.2s', fontSize: '0.95rem'
                                        }} 
                                        className="input-focus"
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>Subject *</label>
                                    <input 
                                        type="text" 
                                        name="subject" 
                                        required 
                                        placeholder="How can we help?" 
                                        value={formData.subject} 
                                        onChange={handleChange}
                                        style={{
                                            padding: '0.85rem 1rem', borderRadius: '12px', border: '2px solid #e2e8f0', background: '#f8fafc', outline: 'none', transition: 'all 0.2s', fontSize: '0.95rem'
                                        }} 
                                        className="input-focus"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>Message *</label>
                                <textarea 
                                    name="message" 
                                    required 
                                    rows="5" 
                                    placeholder="Your message..." 
                                    value={formData.message} 
                                    onChange={handleChange}
                                    style={{
                                        padding: '0.85rem 1rem', borderRadius: '12px', border: '2px solid #e2e8f0', background: '#f8fafc', outline: 'none', resize: 'vertical', transition: 'all 0.2s', fontSize: '0.95rem'
                                    }}
                                    className="input-focus"
                                ></textarea>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                style={{
                                    alignSelf: 'flex-start',
                                    marginTop: '0.5rem',
                                    width: '100%',
                                    padding: '1rem',
                                    background: 'linear-gradient(135deg, #120D20 0%, #22c1e6 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: '800',
                                    fontSize: '1rem',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 8px 20px rgba(34, 193, 230, 0.15)',
                                    transition: 'all 0.25s ease',
                                    opacity: loading ? 0.7 : 1
                                }}
                            >
                                {loading ? 'Sending...' : '✈ Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Floating Toast Notification */}
            {showToast && message.text && (
                <div style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    zIndex: 1100,
                    background: message.type === 'success' 
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                        : 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                    color: 'white',
                    padding: '1.1rem 1.6rem',
                    borderRadius: '16px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    fontWeight: '600',
                    minWidth: '300px',
                    maxWidth: '380px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    animation: 'slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                }}
                >
                    <span style={{ fontSize: '1.25rem' }}>{message.type === 'success' ? '✅' : '⚠️'}</span>
                    <div style={{ flex: 1, fontSize: '0.9rem', lineHeight: '1.4' }}>{message.text}</div>
                    <button 
                        onClick={() => setShowToast(false)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '1.3rem',
                            opacity: 0.8,
                            padding: '0 0 0 0.5rem',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >×</button>
                </div>
            )}

            <style>{`
                @keyframes slideIn {
                    from { transform: translateY(20px) scale(0.95); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }
                .input-focus:focus {
                    border-color: #22c1e6 !important;
                    background: white !important;
                    box-shadow: 0 0 0 4px rgba(34, 193, 230, 0.1) !important;
                }
                @media (max-width: 768px) {
                    section {
                        padding: 3rem 1rem 4rem !important;
                    }
                    .contact-grid {
                        grid-template-columns: 1fr !important;
                        gap: 3.5rem !important;
                    }
                    .form-grid {
                        grid-template-columns: 1fr !important;
                        gap: 1.25rem !important;
                    }
                    div[style*="padding: 3rem"] {
                        padding: 1.75rem !important;
                    }
                    h2 {
                        marginBottom: 2rem !important;
                    }
                }
            `}</style>
        </section>
    );
};

export default ContactFormSection;
