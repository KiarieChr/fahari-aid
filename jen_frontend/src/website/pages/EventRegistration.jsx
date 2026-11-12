import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL as API_URL } from '../../services/api';

{/*
  Event registration form
  
  Requirements 
  Full Name,
  Phone Number
  Email Address
  REsidence,
  Geneder
  Area Travel from
  Guardian Telno
*/}

const EventRegistration = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [formData, setFormData] = useState({
        names: '',
        phone_no: '',
        email: '',
        residence: '',
        gender: '',
        area_travel_from: '',
        guardian_telno: '',
        attendees: '1',
        sponsorship: 'Self',
        category: '',
        special_needs: '',
        serve: false,
        prayer: ''
    });

    // Fetch event details
    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await fetch(`${API_URL}/get_event_details.php?id=${eventId}`);
                const data = await response.json();

                if (data.success) {
                    setEvent(data.data);
                    if (!data.data.registration_open) {
                        setError('Registration for this event is closed.');
                    }
                } else {
                    setError(data.message || 'Event not found');
                }
            } catch (err) {
                setError('Failed to load event details');
            } finally {
                setLoading(false);
            }
        };

        if (eventId) {
            fetchEvent();
        }
    }, [eventId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const validateStep = (stepNum) => {
        switch (stepNum) {
            case 1:
                return formData.names && formData.phone_no && formData.email && formData.residence && formData.gender;
            case 2:
                return formData.area_travel_from && formData.sponsorship;
            case 3:
                return formData.category;
            default:
                return true;
        }
    };

    const nextStep = () => {
        if (validateStep(step)) {
            setStep(prev => Math.min(prev + 1, 3));
        }
    };

    const prevStep = () => {
        setStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep(3)) return;

        setSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/register_event.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    event_id: eventId
                })
            });

            const data = await response.json();

            if (data.success) {
                setSubmitted(true);
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            setError('Failed to submit registration. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Styles
    const styles = {
        container: {
            minHeight: '100vh',
            background: 'linear-gradient(135deg,rgba(18, 13, 32, 0.78) 0%, rgba(13, 9, 26, 0.73) 100%),url(/DSC_0263.JPG) center center',
            padding: '2rem 1rem'
        },
        card: {
            maxWidth: '700px',
            margin: '0 auto',
            background: 'rgba(26, 22, 37, 0.95)',
            borderRadius: '1.5rem',
            border: '1px solid rgba(136, 74, 186, 0.3)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden'
        },
        header: {
            background: 'linear-gradient(135deg, #120D20 0%, #120d20bc 100%)',
            padding: '2rem',
            textAlign: 'center'
        },
        title: {
            color: '#fff',
            fontSize: '1.75rem',
            margin: 0,
            fontWeight: '700'
        },
        subtitle: {
            color: 'rgba(255,255,255,0.8)',
            marginTop: '0.5rem',
            fontSize: '0.95rem'
        },
        progressBar: {
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '1.5rem 2rem',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
        },
        progressStep: (isActive, isCompleted) => ({
            width: '80px',
            height: '4px',
            borderRadius: '2px',
            background: isCompleted ? '#22c1e6' : isActive ? '#EFF3C1' : 'rgba(255,255,255,0.2)',
            transition: 'all 0.3s ease'
        }),
        formBody: {
            padding: '2rem'
        },
        stepTitle: {
            color: '#eff3c1',
            fontSize: '1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        formGrid: {
            display: 'grid',
            gap: '1.25rem'
        },
        formRow: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem'
        },
        inputGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
        },
        label: {
            color: '#94a3b8',
            fontSize: '0.9rem',
            fontWeight: '500'
        },
        input: {
            padding: '0.875rem 1rem',
            background: 'rgba(18, 13, 32, 0.8)',
            border: '1px solid rgba(136, 74, 186, 0.3)',
            borderRadius: '0.75rem',
            color: '#eff3c1',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.2s'
        },
        select: {
            padding: '0.875rem 1rem',
            background: 'rgba(18, 13, 32, 0.8)',
            border: '1px solid rgba(136, 74, 186, 0.3)',
            borderRadius: '0.75rem',
            color: '#eff3c1',
            fontSize: '1rem',
            outline: 'none',
            cursor: 'pointer'
        },
        textarea: {
            padding: '0.875rem 1rem',
            background: 'rgba(18, 13, 32, 0.8)',
            border: '1px solid rgba(136, 74, 186, 0.3)',
            borderRadius: '0.75rem',
            color: '#eff3c1',
            fontSize: '1rem',
            outline: 'none',
            minHeight: '100px',
            resize: 'vertical'
        },
        checkboxGroup: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem',
            background: 'rgba(136, 74, 186, 0.1)',
            borderRadius: '0.75rem',
            cursor: 'pointer'
        },
        checkbox: {
            width: '20px',
            height: '20px',
            accentColor: '#22c1e6'
        },
        buttonRow: {
            display: 'flex',
            justifyContent: 'space-between',
            gap: '1rem',
            marginTop: '2rem'
        },
        btnPrimary: {
            flex: 1,
            padding: '1rem',
            background: 'linear-gradient(135deg, #22c1e6 0%, #05b5dc 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '0.75rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s'
        },
        btnSecondary: {
            flex: 1,
            padding: '1rem',
            background: 'transparent',
            color: '#94a3b8',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '0.75rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer'
        },
        errorBox: {
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '0.75rem',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: '#ef4444',
            textAlign: 'center'
        },
        successContainer: {
            textAlign: 'center',
            padding: '3rem 2rem'
        },
        successIcon: {
            fontSize: '4rem',
            marginBottom: '1rem'
        },
        successTitle: {
            color: '#22c1e6',
            fontSize: '1.75rem',
            marginBottom: '1rem'
        },
        successText: {
            color: '#94a3b8',
            marginBottom: '2rem',
            lineHeight: '1.6'
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={{ ...styles.card, padding: '4rem', textAlign: 'center' }}>
                    <div style={{ color: '#eff3c1', fontSize: '1.25rem' }}>Loading event details...</div>
                </div>
            </div>
        );
    }

    if (error && !event) {
        return (
            <div style={styles.container}>
                <div style={{ ...styles.card, padding: '4rem', textAlign: 'center' }}>
                    <div style={{ color: '#ef4444', fontSize: '1.25rem', marginBottom: '2rem' }}>{error}</div>
                    <button onClick={() => navigate('/events')} style={styles.btnPrimary}>
                        Back to Events
                    </button>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.header}>
                        <h1 style={styles.title}>Registration Complete!</h1>
                    </div>
                    <div style={styles.successContainer}>
                        <div style={styles.successIcon}>🎉</div>
                        <h2 style={styles.successTitle}>Thank You, {formData.names}!</h2>
                        <p style={styles.successText}>
                            You have successfully registered for <strong>{event?.name}</strong>.<br />
                            A confirmation has been sent to <strong>{formData.email}</strong>.
                        </p>
                        <button
                            onClick={() => navigate('/events')}
                            style={styles.btnPrimary}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            Explore More Events
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                {/* Header */}
                <div style={styles.header}>
                    <h1 style={styles.title}>{event?.name}</h1>
                    <p style={styles.subtitle}>
                        📅 {event?.start_date} {event?.end_date && event?.end_date !== event?.start_date ? `- ${event?.end_date}` : ''}
                        {event?.venue && ` • 📍 ${event?.venue}`}
                    </p>
                    {event?.facilitation_fee > 0 && (
                        <p style={{ ...styles.subtitle, color: '#22c1e6', fontWeight: '600' }}>
                            Facilitation Fee: KES {Number(event.facilitation_fee).toLocaleString()}
                        </p>
                    )}
                </div>

                {/* Progress Bar */}
                <div style={styles.progressBar}>
                    <div style={styles.progressStep(step === 1, step > 1)} />
                    <div style={styles.progressStep(step === 2, step > 2)} />
                    <div style={styles.progressStep(step === 3, false)} />
                </div>

                {/* Form Body */}
                <div style={styles.formBody}>
                    {error && <div style={styles.errorBox}>{error}</div>}

                    <form onSubmit={handleSubmit}>
                        {/* Step 1: Personal Information */}
                        {step === 1 && (
                            <div>
                                <h3 style={styles.stepTitle}>
                                    <span style={{ color: '#22c1e6' }}>01</span> Personal Information
                                </h3>
                                <div style={styles.formGrid}>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Full Name *</label>
                                        <input
                                            type="text"
                                            name="names"
                                            value={formData.names}
                                            onChange={handleChange}
                                            placeholder="Enter your full name"
                                            required
                                            style={styles.input}
                                        />
                                    </div>
                                    <div style={styles.formRow}>
                                        <div style={styles.inputGroup}>
                                            <label style={styles.label}>Phone Number *</label>
                                            <input
                                                type="tel"
                                                name="phone_no"
                                                value={formData.phone_no}
                                                onChange={handleChange}
                                                placeholder="07XX XXX XXX"
                                                required
                                                style={styles.input}
                                            />
                                        </div>
                                        <div style={styles.inputGroup}>
                                            <label style={styles.label}>Email Address *</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="your@email.com"
                                                required
                                                style={styles.input}
                                            />
                                        </div>
                                    </div>
                                    <div style={styles.formRow}>
                                        <div style={styles.inputGroup}>
                                            <label style={styles.label}>Residence / Town *</label>
                                            <input
                                                type="text"
                                                name="residence"
                                                value={formData.residence}
                                                onChange={handleChange}
                                                placeholder="e.g., Nairobi"
                                                required
                                                style={styles.input}
                                            />
                                        </div>
                                        <div style={styles.inputGroup}>
                                            <label style={styles.label}>Gender *</label>
                                            <select
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleChange}
                                                required
                                                style={styles.select}
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Event Details */}
                        {step === 2 && (
                            <div>
                                <h3 style={styles.stepTitle}>
                                    <span style={{ color: '#22c1e6' }}>02</span> Event Details
                                </h3>
                                <div style={styles.formGrid}>
                                    <div style={styles.formRow}>
                                        <div style={styles.inputGroup}>
                                            <label style={styles.label}>Travelling From *</label>
                                            <input
                                                type="text"
                                                name="area_travel_from"
                                                value={formData.area_travel_from}
                                                onChange={handleChange}
                                                placeholder="e.g., Mombasa"
                                                required
                                                style={styles.input}
                                            />
                                        </div>
                                        <div style={styles.inputGroup}>
                                            <label style={styles.label}>Number of Attendees</label>
                                            <select
                                                name="attendees"
                                                value={formData.attendees}
                                                onChange={handleChange}
                                                style={styles.select}
                                            >
                                                {[1, 2, 3, 4, 5].map(n => (
                                                    <option key={n} value={n}>{n}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div style={styles.formRow}>
                                        <div style={styles.inputGroup}>
                                            <label style={styles.label}>Guardian/Emergency Contact</label>
                                            <input
                                                type="tel"
                                                name="guardian_telno"
                                                value={formData.guardian_telno}
                                                onChange={handleChange}
                                                placeholder="07XX XXX XXX"
                                                style={styles.input}
                                            />
                                        </div>
                                        <div style={styles.inputGroup}>
                                            <label style={styles.label}>Sponsorship *</label>
                                            <select
                                                name="sponsorship"
                                                value={formData.sponsorship}
                                                onChange={handleChange}
                                                required
                                                style={styles.select}
                                            >
                                                <option value="Self">Self Sponsored</option>
                                                <option value="Partial">Partial Sponsorship</option>
                                                <option value="Full">Full Sponsorship</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Additional Information */}
                        {step === 3 && (
                            <div>
                                <h3 style={styles.stepTitle}>
                                    <span style={{ color: '#22c1e6' }}>03</span> Additional Information
                                </h3>
                                <div style={styles.formGrid}>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Category *</label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            required
                                            style={styles.select}
                                        >
                                            <option value="">Select Category</option>
                                            <option value="Student">Student</option>
                                            <option value="Working">Working</option>
                                            <option value="Business">Business</option>
                                            <option value="Ministry">Ministry</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Special Needs / Dietary Requirements</label>
                                        <input
                                            type="text"
                                            name="special_needs"
                                            value={formData.special_needs}
                                            onChange={handleChange}
                                            placeholder="Any special requirements..."
                                            style={styles.input}
                                        />
                                    </div>
                                    <label style={styles.checkboxGroup}>
                                        <input
                                            type="checkbox"
                                            name="serve"
                                            checked={formData.serve}
                                            onChange={handleChange}
                                            style={styles.checkbox}
                                        />
                                        <span style={{ color: '#eff3c1' }}>I would like to serve/volunteer at this event</span>
                                    </label>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Prayer Request (Optional)</label>
                                        <textarea
                                            name="prayer"
                                            value={formData.prayer}
                                            onChange={handleChange}
                                            placeholder="Share any prayer requests..."
                                            style={styles.textarea}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div style={styles.buttonRow}>
                            {step > 1 && (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    style={styles.btnSecondary}
                                >
                                    ← Previous
                                </button>
                            )}
                            {step < 3 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    disabled={!validateStep(step)}
                                    style={{
                                        ...styles.btnPrimary,
                                        opacity: validateStep(step) ? 1 : 0.5,
                                        cursor: validateStep(step) ? 'pointer' : 'not-allowed'
                                    }}
                                    onMouseEnter={(e) => validateStep(step) && (e.currentTarget.style.transform = 'scale(1.02)')}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    Next Step →
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={submitting || !validateStep(3)}
                                    style={{
                                        ...styles.btnPrimary,
                                        background: submitting ? '#6B3A9E' : 'linear-gradient(135deg, #22c1e6 0%, #1a9bb8 100%)',
                                        opacity: (submitting || !validateStep(3)) ? 0.7 : 1
                                    }}
                                    onMouseEnter={(e) => !submitting && (e.currentTarget.style.transform = 'scale(1.02)')}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    {submitting ? 'Submitting...' : 'Complete Registration'}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EventRegistration;
