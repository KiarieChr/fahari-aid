import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Partners = () => {
    const [activeFaq, setActiveFaq] = useState(null);
    const [hoveredConviction, setHoveredConviction] = useState(null);
    const [selectedBenefit, setSelectedBenefit] = useState(0);
    const [activeSection, setActiveSection] = useState('partners-hero');

    useEffect(() => {
        const sections = ['partners-hero', 'why-partner', 'categories', 'benefits', 'get-involved', 'faq'];
        
        const observerOptions = {
            root: null,
            rootMargin: '-30% 0px -30% 0px',
            threshold: 0.15
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, observerOptions);

        sections.forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => {
            sections.forEach((id) => {
                const el = document.getElementById(id);
                if (el) observer.unobserve(el);
            });
        };
    }, []);

    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const toggleFaq = (idx) => {
        setActiveFaq(activeFaq === idx ? null : idx);
    };

    const convictions = [
        {
            num: '01',
            title: 'Shared Vision, Multiplied Impact',
            body: 'The challenges facing our generation are too vast for any single ministry. Partnership pools resources, expertise, networks, and influence to achieve what none of us could accomplish independently. We believe that Kingdom collaboration is not a strategy — it is a Biblical imperative.'
        },
        {
            num: '02',
            title: 'Accountability That Protects Everyone',
            body: 'All JEN partnerships are governed by the standards of our Constitution, our Code of Conduct, and our Ethics Committee. Formal partnership agreements ensure that every relationship is transparent, purposeful, and mutually accountable — protecting both JEN and our partners.'
        },
        {
            num: '03',
            title: 'Legacy Over Short-Term Gain',
            body: 'We are not looking for sponsorships or one-off engagements. We are building long-term partnerships rooted in shared values that will outlast any single program, season, or campaign — because the legacy we are building is generational.'
        }
    ];

    const categories = [
        {
            num: '01',
            title: 'Church & Ministry Partners',
            badgeColor: '#22c1e6', // Cyan
            bgColor: 'rgba(34, 193, 230, 0.05)',
            desc: "Local churches, denominations, and para-church ministries who share our Statement of Faith and want to extend their discipleship reach through JEN's cell system, mentorship programs, and leadership development pathways. Church partnerships give members access to JEN's structured Kingdom formation framework while strengthening the local church's own mission.",
            looksLike: 'Joint cell fellowships, shared mentorship programs, co-hosted discipleship events, and cross-referral of members into JEN\'s Orientation and Induction process.'
        },
        {
            num: '02',
            title: 'Academic & Institutional Partners',
            badgeColor: '#d97706', // Gold
            bgColor: 'rgba(217, 119, 6, 0.05)',
            desc: "Universities, colleges, schools, and educational institutions that want to embed Kingdom values, student wellness frameworks, and character formation into their learning environment. JEN's Technology Hubs, Mentorship Programs, and Student Wellness initiatives are designed for institutional deployment.",
            looksLike: 'On-campus cell groups, student wellness programs, character and leadership curricula, JEN-facilitated mentorship hubs within institutions, and co-developed innovation and technology programs.'
        },
        {
            num: '03',
            title: 'Business & Corporate Partners',
            badgeColor: '#0ec2e6', // Lighter Cyan
            bgColor: 'rgba(14, 194, 230, 0.05)',
            desc: 'Kingdom-minded businesses, social enterprises, and professional networks that want to invest in the next generation of ethical, purpose-driven leaders — and align their corporate citizenship with a credible, accountable organisation doing transformational work.',
            looksLike: 'Program sponsorships, internship and employment pipelines for JEN members, co-hosted business and entrepreneurship forums, and investment in JEN\'s economic development arm.'
        },
        {
            num: '04',
            title: 'Media & Creative Partners',
            badgeColor: '#eab308', // Lighter Gold
            bgColor: 'rgba(234, 179, 8, 0.05)',
            desc: "Media houses, content creators, publishers, and creative organisations who want to collaborate in occupying the media mountain with excellent, Kingdom-aligned content. JEN's Digital Evangelism pillar creates a natural bridge for media partnerships that extend reach and deepen Kingdom influence online and offline.",
            looksLike: 'Content co-creation, platform sharing, joint media campaigns, training and capacity-building for JEN\'s media arm members, and collaboration on Kingdom-aligned storytelling and publishing.'
        }
    ];

    const benefits = [
        {
            num: '01',
            title: 'Access to the JEN Network',
            desc: "Partners gain meaningful access to JEN's growing membership base across Kenya and international chapters — a community of young leaders, professionals, students, and Kingdom influencers being equipped.",
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
            )
        },
        {
            num: '02',
            title: 'Co-branded Programs',
            desc: 'Where appropriate, partners are acknowledged and involved in the programs they make possible — giving visibility within a community that values integrity and purpose.',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                </svg>
            )
        },
        {
            num: '03',
            title: 'Seat at the Table',
            desc: "Strategic partners are invited into relevant conversations about JEN's program development, ensuring that partnership is collaborative and not merely financial.",
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            )
        },
        {
            num: '04',
            title: 'Preferential Access',
            desc: "Partners receive priority access to JEN's convenings, forums, leadership summits, and training events — giving teams and staff access to Kingdom formation content.",
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                    <line x1="4" y1="22" x2="4" y2="15" />
                </svg>
            )
        },
        {
            num: '05',
            title: 'Transparent Stewardship',
            desc: "Every partnership contribution is managed under JEN's Constitution-governed financial framework, with full auditing and stewardship confidence.",
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
            )
        },
        {
            num: '06',
            title: 'A Legacy Investment',
            desc: "Partnership with JEN is an investment not just in programs today but in the generation that will lead nations, institutions, and communities tomorrow.",
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
            )
        }
    ];

    const faqs = [
        {
            q: 'Is there a financial commitment required to partner with JEN?',
            a: 'Not necessarily. While some partnership categories involve financial investment, others are built on resource-sharing, expertise, networks, or in-kind contributions. We believe partnership looks different for every organisation and we are open to exploring what meaningful collaboration looks like for you.'
        },
        {
            q: 'How are partnership agreements formalised?',
            a: 'All formal partnerships are documented through a Partnership Agreement reviewed by JEN\'s Ethics Committee and approved in line with the standards set out in our Constitution. This protects both parties and ensures clarity of expectations, roles, and accountability from the outset.'
        },
        {
            q: 'Can an individual become a partner, not just an organisation?',
            a: 'Yes. Individuals who wish to partner with JEN at a level beyond standard membership — whether through financial investment, professional expertise, mentorship, or advocacy — are welcome to explore our individual partnership and sponsorship pathways.'
        },
        {
            q: 'What is JEN\'s approach to partnership with organisations of different theological backgrounds?',
            a: 'JEN\'s Statement of Faith is the foundation of all we do and is non-negotiable. We welcome partnerships with any organisation that shares our core Biblical convictions, regardless of denomination. We do not enter partnerships that require compromise of our Statement of Faith or Code of Conduct.'
        },
        {
            q: 'How will we know our partnership investment is being used well?',
            a: 'JEN operates under a Constitution-governed financial management framework that includes independent auditing, Finance Committee oversight, and annual reporting. Partners are provided with relevant reporting on the programs their partnership supports.'
        }
    ];

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            
            {/* Hero Section */}
            <section id="partners-hero" style={{
                background: 'linear-gradient(235deg, rgba(18, 13, 32, 0.65 ) 0%, rgba(13, 9, 26, 0.59) 100%),url(/DSC_0048.JPG) center center',
                padding: '0.5rem 1rem 5.5rem',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                marginTop: '80px'
            }}>
                {/* Geometric Background Shapes */}
                <div style={{
                    position: 'absolute',
                    right: 0,
                    bottom: 0,
                    width: '50%',
                    height: '100%',
                    background: 'linear-gradient(135deg, rgba(34, 193, 230, 0.38) 0%, transparent 100%)',
                    clipPath: 'polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%)',
                    zIndex: 0,
                    pointerEvents: 'none'
                }}></div>

                <div style={{
                    position: 'absolute',
                    top: '-30%',
                    left: '-10%',
                    width: '60%',
                    height: '160%',
                    background: 'radial-gradient(circle, rgba(34, 193, 230, 0.06) 0%, transparent 70%)',
                    zIndex: 0,
                    pointerEvents: 'none'
                }}></div>

                <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto' }}>
                    <div className="partners-hero-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: '1.25fr 0.75fr',
                        gap: '4rem',
                        alignItems: 'center'
                    }}>
                        {/* Text Column */}
                        <div style={{ textAlign: 'left' }}>
                            <span style={{
                                background: 'rgba(34, 193, 230, 0.1)',
                                color: '#22c1e6',
                                padding: '0.5rem 1rem',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                display: 'inline-block',
                                marginBottom: '1.5rem'
                            }}>
                                PARTNERSHIPS & COLLABORATION
                            </span>
                            
                            <h1 style={{
                                fontSize: '3.75rem',
                                fontWeight: '800',
                                marginBottom: '1.5rem',
                                lineHeight: 1.1,
                                letterSpacing: '-0.02em'
                            }}>
                                Building the Kingdom Together
                            </h1>
                            
                            <p style={{
                                fontSize: '1.125rem',
                                color: '#94a3b8',
                                lineHeight: 1.6,
                                margin: 0,
                                maxWidth: '580px'
                            }}>
                                No single organisation can transform every sphere of society alone. Jesus Enthroned Network partners with churches, institutions, businesses, and individuals who share our conviction that Kingdom purpose demands Kingdom collaboration — and that the greatest things happen when we move together.
                            </p>
                        </div>

                        {/* Image / Graphic Column */}
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <div style={{
                                position: 'relative',
                                width: '100%',
                                maxWidth: '350px',
                                height: '260px',
                                borderRadius: '24px',
                                overflow: 'hidden',
                                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                                <img 
                                    src="../../src/assets/DSC_0200-2.jpg" 
                                    alt="Building the Kingdom Together" 
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    background: 'linear-gradient(45deg, rgba(18, 13, 32, 0.4) 0%, rgba(34, 193, 230, 0.2) 100%)',
                                    pointerEvents: 'none'
                                }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <style>{`
                    @media (max-width: 968px) {
                        .partners-hero-grid {
                            grid-template-columns: 1fr !important;
                            gap: 2.5rem !important;
                            text-align: center !important;
                        }
                        .partners-hero-grid div {
                            text-align: center !important;
                        }
                        h1 {
                            font-size: 2.5rem !important;
                        }
                    }
                    @keyframes fadeInLeft {
                        from { opacity: 0; transform: translateX(-40px); }
                        to { opacity: 1; transform: translateX(0); }
                    }
                    @keyframes fadeInRight {
                        from { opacity: 0; transform: translateX(40px); }
                        to { opacity: 1; transform: translateX(0); }
                    }
                    @keyframes floatSpheres {
                        0%, 100% { transform: translate(0, 0) scale(1); }
                        50% { transform: translate(25px, -15px) scale(1.08); }
                    }
                    .slide-in-left {
                        opacity: 0;
                        animation: fadeInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    }
                    .slide-in-right {
                        opacity: 0;
                        animation: fadeInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    }
                    .glow-vector {
                        animation: floatSpheres 12s infinite ease-in-out;
                    }
                    .staggered-category-card:hover .cat-number {
                        transform: scale(1.15) rotate(-3deg);
                        text-shadow: 0 0 15px currentColor;
                    }
                    .nav-dot-container:hover .nav-dot-label {
                        opacity: 1 !important;
                        transform: translateX(0) !important;
                    }
                    @media (max-width: 968px) {
                        .dot-navigator {
                            display: none !important;
                        }
                    }
                `}</style>
            </section>

            {/* Section 1: Why Partner With JEN */}
            <section id="why-partner" style={{ 
                padding: '3.5rem 1.5rem', 
                background: 'radial-gradient(circle at 10% 20%, rgba(34, 193, 230, 0.03) 0%, transparent 45%), radial-gradient(circle at 90% 80%, rgba(34, 193, 230, 0.03) 0%, transparent 45%), #f8fafc',
                position: 'relative'
            }}>
                <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <div className="why-partner-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: '1.2fr 0.8fr',
                        gap: '4.5rem',
                        alignItems: 'center'
                    }}>
                        {/* Left Column: Introductions & Mixed Typography */}
                        <div style={{ textAlign: 'left' }}>
                            <span style={{
                                color: '#22c1e6',
                                fontSize: '0.8rem',
                                fontWeight: '800',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                display: 'block',
                                marginBottom: '1rem'
                            }}>
                                THE CASE FOR PARTNERSHIP
                            </span>
                            <h2 style={{ 
                                fontSize: '3.25rem', 
                                fontWeight: '800', 
                                color: '#120D20', 
                                marginBottom: '1.5rem', 
                                lineHeight: 1.15,
                                letterSpacing: '-0.02em' 
                            }}>
                                When Kingdom-Minded Organisations Align, <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: '400', color: '#22c1e6' }}>Nations Change</span>
                            </h2>
                            <p style={{ 
                                fontSize: '1.05rem', 
                                color: '#475569', 
                                lineHeight: 1.7, 
                                marginBottom: '1.5rem' 
                            }}>
                                Partnership with JEN is not a transactional arrangement — it is a covenant of shared purpose. We partner with organisations and individuals who are equally committed to raising a generation of Kingdom leaders, transforming the seven spheres of societal influence, and transmitting a lasting legacy to the next generation.
                            </p>
                            <p style={{ 
                                fontSize: '1.05rem', 
                                fontWeight: '700', 
                                color: '#22c1e6', 
                                lineHeight: 1.7,
                                margin: 0 
                            }}>
                                When you partner with JEN, you are not adding your name to a list. You are joining a movement.
                            </p>
                        </div>

                        {/* Right Column: Sleek Interactive Card */}
                        <div style={{
                            background: '#161226',
                            padding: '2.5rem',
                            borderRadius: '24px',
                            border: '1px solid rgba(34, 193, 230, 0.15)',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
                            textAlign: 'left'
                        }}>
                            <span style={{
                                color: 'rgba(255, 255, 255, 0.4)',
                                fontSize: '0.75rem',
                                fontWeight: '800',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                display: 'block',
                                marginBottom: '1.5rem'
                            }}>
                                OUR PARTNERSHIP CONVICTIONS
                            </span>

                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {convictions.map((c, i) => {
                                    const isHovered = hoveredConviction === i;
                                    return (
                                        <li 
                                            key={i}
                                            onMouseEnter={() => setHoveredConviction(i)}
                                            onMouseLeave={() => setHoveredConviction(null)}
                                            style={{
                                                padding: '1.25rem 0',
                                                borderBottom: i === 2 ? 'none' : '1px solid rgba(255,255,255,0.06)',
                                                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '0.5rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <span 
                                                    className="bullet-dot"
                                                    style={{
                                                        width: '8px',
                                                        height: '8px',
                                                        borderRadius: '50%',
                                                        background: isHovered ? '#22c1e6' : 'rgba(255,255,255,0.3)',
                                                        boxShadow: isHovered ? '0 0 10px #22c1e6' : 'none',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                />
                                                <h4 style={{
                                                    fontSize: '1.1rem',
                                                    fontWeight: '800',
                                                    color: isHovered ? '#22c1e6' : '#f8fafc',
                                                    margin: 0,
                                                    transition: 'all 0.3s ease',
                                                    transform: isHovered ? 'translateX(4px)' : 'translateX(0)'
                                                }}>
                                                    {c.title}
                                                </h4>
                                            </div>
                                            
                                            <div style={{
                                                maxHeight: isHovered ? '140px' : '0px',
                                                opacity: isHovered ? 1 : 0,
                                                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                                                overflow: 'hidden',
                                                paddingLeft: '1.5rem',
                                                color: '#94a3b8',
                                                fontSize: '0.875rem',
                                                lineHeight: 1.5
                                            }}>
                                                {c.body}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                </div>

                <style>{`
                    @media (max-width: 968px) {
                        .why-partner-grid {
                            grid-template-columns: 1fr !important;
                            gap: 3.5rem !important;
                        }
                    }
                `}</style>
            </section>

              {/* Section 2: Partnership Categories */}
            <section id="categories" style={{ 
                padding: '7.5rem 1rem 6.5rem', 
                background: '#f0fafd',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Slanted Transition Wave (Top) */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    overflow: 'hidden',
                    lineHeight: 0,
                    transform: 'rotate(180deg)',
                    zIndex: 1
                }}>
                    <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{
                        position: 'relative',
                        display: 'block',
                        width: 'calc(100% + 1.3px)',
                        height: '40px'
                    }}>
                        <path d="M1200 120L0 120L0 0L1200 120Z" fill="#f8fafc" />
                    </svg>
                </div>

                {/* Slanted Transition Wave (Bottom) */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    overflow: 'hidden',
                    lineHeight: 0,
                    zIndex: 1
                }}>
                    <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{
                        position: 'relative',
                        display: 'block',
                        width: 'calc(100% + 1.3px)',
                        height: '40px'
                    }}>
                        <path d="M1200 120L0 120L0 0L1200 120Z" fill="#f8fafc" />
                    </svg>
                </div>
                {/* Slanted Geometric Masked Background Image */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: 'url("https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1500&auto=format&fit=crop")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.12,
                    clipPath: 'polygon(0 0, 100% 8%, 100% 100%, 0 92%)',
                    zIndex: 0,
                    pointerEvents: 'none'
                }}></div>
                {/* Floating Glow Nodes */}
                <div className="glow-vector" style={{
                    position: 'absolute',
                    top: '10%',
                    left: '-5%',
                    width: '350px',
                    height: '350px',
                    background: 'radial-gradient(circle, rgba(34, 193, 230, 0.08) 0%, transparent 70%)',
                    zIndex: 0,
                    pointerEvents: 'none'
                }}></div>
                <div className="glow-vector" style={{
                    position: 'absolute',
                    bottom: '10%',
                    right: '-5%',
                    width: '400px',
                    height: '400px',
                    background: 'radial-gradient(circle, rgba(217, 119, 6, 0.06) 0%, transparent 70%)',
                    zIndex: 0,
                    pointerEvents: 'none',
                    animationDelay: '-6s'
                }}></div>

                <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
                        <span style={{
                            background: 'rgba(34, 193, 230, 0.1)',
                            color: '#22c1e6',
                            padding: '0.4rem 0.9rem',
                            borderRadius: '9999px',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            display: 'inline-block',
                            marginBottom: '1rem'
                        }}>
                            WHO WE PARTNER WITH
                        </span>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#120D20', marginBottom: '1rem', letterSpacing: '-0.01em' }}>
                            A Place at the Table for Every Kingdom Ally
                        </h2>
                        <p style={{ fontSize: '1.05rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
                            JEN welcomes partners across four distinct categories, each carrying its own form of contribution and collaboration.
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', width: '100%' }}>
                        {categories.map((cat, idx) => {
                            const isEven = idx % 2 === 0;
                            return (
                                <div 
                                    key={idx}
                                    style={{
                                        width: '92%',
                                        alignSelf: isEven ? 'flex-start' : 'flex-end',
                                        background: '#0d091a',
                                        padding: '2.5rem 3rem',
                                        borderRadius: '28px',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        animationDelay: `${idx * 0.15}s`
                                    }}
                                    className={`staggered-category-card ${isEven ? 'slide-in-left' : 'slide-in-right'}`}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.borderColor = cat.badgeColor;
                                        e.currentTarget.style.boxShadow = `0 15px 35px ${cat.badgeColor}15`;
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0, 0, 0.15)';
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                        {/* Large Number */}
                                        <div 
                                            className="cat-number"
                                            style={{
                                                fontSize: '3.75rem',
                                                fontWeight: '900',
                                                color: cat.badgeColor,
                                                lineHeight: 1,
                                                fontFamily: 'sans-serif',
                                                flexShrink: 0,
                                                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                                            }}
                                        >
                                            {cat.num}
                                        </div>

                                        {/* Content */}
                                        <div style={{ flex: 1, minWidth: '280px', textAlign: 'left' }}>
                                            <span style={{
                                                fontSize: '0.7rem',
                                                fontWeight: '800',
                                                textTransform: 'uppercase',
                                                color: cat.badgeColor,
                                                letterSpacing: '0.08em',
                                                display: 'block',
                                                marginBottom: '0.4rem'
                                            }}>
                                                PARTNERSHIP CATEGORY
                                            </span>
                                            <h3 style={{
                                                fontSize: '1.75rem',
                                                fontWeight: '800',
                                                color: 'white',
                                                marginBottom: '1rem',
                                                letterSpacing: '-0.01em'
                                            }}>
                                                {cat.title}
                                            </h3>
                                            <p style={{
                                                color: '#94a3b8',
                                                fontSize: '0.975rem',
                                                lineHeight: 1.6,
                                                marginBottom: '1.5rem'
                                            }}>
                                                {cat.desc}
                                            </p>

                                            <div style={{
                                                paddingTop: '1.25rem',
                                                borderTop: '1px solid rgba(255,255,255,0.06)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '0.4rem'
                                            }}>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: '800',
                                                    textTransform: 'uppercase',
                                                    color: 'rgba(255,255,255,0.4)',
                                                    letterSpacing: '0.05em'
                                                }}>
                                                    What this looks like
                                                </span>
                                                <p style={{
                                                    color: '#22c1e6',
                                                    fontSize: '0.9rem',
                                                    lineHeight: 1.5,
                                                    margin: 0,
                                                    fontStyle: 'italic'
                                                }}>
                                                    {cat.looksLike}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <style>{`
                    @media (max-width: 968px) {
                        .staggered-category-card {
                            width: 100% !important;
                            align-self: center !important;
                            padding: 2rem 1.5rem !important;
                        }
                    }
                `}</style>
            </section>

               {/* Section 3: What Partners Receive */}
            <section id="benefits" style={{ 
                padding: '6.5rem 1rem', 
                background: '#f8fafc',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Slanted Geometric Masked Background Image */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: 'url("https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1500&auto=format&fit=crop")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.12,
                    clipPath: 'polygon(0 8%, 100% 0, 100% 92%, 0 100%)',
                    zIndex: 0,
                    pointerEvents: 'none'
                }}></div>
                <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
                        <span style={{
                            background: 'rgba(34, 193, 230, 0.1)',
                            color: '#22c1e6',
                            padding: '0.4rem 0.9rem',
                            borderRadius: '9999px',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            display: 'inline-block',
                            marginBottom: '1rem'
                        }}>
                            PARTNERSHIP BENEFITS
                        </span>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#120D20', marginBottom: '1rem', letterSpacing: '-0.01em' }}>
                            More Than a Logo on a Banner
                        </h2>
                        <p style={{ fontSize: '1.05rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
                            Partnership with JEN opens doors to a network, a community, and a mission that goes far beyond a typical organisational relationship.
                        </p>
                    </div>

                    <div className="switcher-grid" style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: '4rem', 
                        alignItems: 'stretch' 
                    }}>
                        {/* Left Column: Active Benefit Showcase Card */}
                        <div style={{
                            background: 'linear-gradient(135deg, #0d091a 0%, #161226 100%)',
                            padding: '3.5rem 3rem',
                            borderRadius: '28px',
                            border: '1px solid rgba(34, 193, 230, 0.25)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            color: 'white',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            textAlign: 'left',
                            position: 'relative',
                            overflow: 'hidden',
                            minHeight: '420px'
                        }}>
                            {/* Decorative Radial Glow */}
                            <div style={{
                                position: 'absolute',
                                top: '-20%',
                                right: '-20%',
                                width: '200px',
                                height: '200px',
                                background: 'radial-gradient(circle, rgba(34, 193, 230, 0.15) 0%, transparent 70%)',
                                pointerEvents: 'none'
                            }}></div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                                <div style={{ 
                                    color: '#22c1e6', 
                                    background: 'rgba(34, 193, 230, 0.08)', 
                                    padding: '1rem', 
                                    borderRadius: '16px',
                                    display: 'inline-flex'
                                }}>
                                    {benefits[selectedBenefit].icon}
                                </div>
                                <span style={{
                                    fontSize: '0.8rem',
                                    fontWeight: '800',
                                    color: 'rgba(255, 255, 255, 0.4)',
                                    background: 'rgba(255, 255, 255, 0.06)',
                                    padding: '0.3rem 0.8rem',
                                    borderRadius: '6px',
                                    letterSpacing: '0.05em'
                                }}>
                                    BENEFIT {benefits[selectedBenefit].num}
                                </span>
                            </div>

                            <h3 style={{ fontSize: '2.25rem', fontWeight: '850', color: 'white', marginBottom: '1.25rem', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                                {benefits[selectedBenefit].title}
                            </h3>
                            <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
                                {benefits[selectedBenefit].desc}
                            </p>

                            <div style={{
                                marginTop: 'auto',
                                paddingTop: '1.5rem',
                                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}>
                                <span style={{ fontSize: '1.25rem' }}>⚡</span>
                                <span style={{ color: '#22c1e6', fontSize: '0.925rem', fontWeight: '700', letterSpacing: '0.02em' }}>
                                    {[
                                        "Accelerating Kingdom impact through direct connections with thousands of committed disciples.",
                                        "Unifying corporate identities for maximum local visibility and ministry reach.",
                                        "Contributing to the strategic direction of programs and cells.",
                                        "Ensuring your team receives first-priority access to training, conferences, and resources.",
                                        "Ensuring absolute accountability, audit compliance, and stewardship reports.",
                                        "Securing a heritage that will form character and influence for generations to come."
                                    ][selectedBenefit]}
                                </span>
                            </div>
                        </div>

                        {/* Right Column: Clickable Tabs List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', justifyContent: 'center' }}>
                            {benefits.map((b, idx) => {
                                const isActive = selectedBenefit === idx;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedBenefit(idx)}
                                        style={{
                                            background: isActive ? 'white' : 'rgba(255, 255, 255, 0.4)',
                                            padding: '1.25rem 1.5rem',
                                            borderRadius: '16px',
                                            border: isActive ? '2px solid #22c1e6' : '1px solid rgba(0, 0, 0, 0.05)',
                                            boxShadow: isActive ? '0 10px 25px -5px rgba(34, 193, 230, 0.15)' : 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            cursor: 'pointer',
                                            width: '100%',
                                            transition: 'all 0.25s ease',
                                            textAlign: 'left'
                                        }}
                                        onMouseEnter={e => {
                                            if (!isActive) {
                                                e.currentTarget.style.background = 'white';
                                                e.currentTarget.style.borderColor = 'rgba(34, 193, 230, 0.3)';
                                            }
                                        }}
                                        onMouseLeave={e => {
                                            if (!isActive) {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)';
                                                e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.05)';
                                            }
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ color: isActive ? '#22c1e6' : '#64748b', transition: 'color 0.2s' }}>
                                                {b.icon}
                                            </div>
                                            <span style={{ 
                                                fontWeight: '800', 
                                                fontSize: '1rem', 
                                                color: isActive ? '#120D20' : '#475569',
                                                transition: 'color 0.2s'
                                            }}>
                                                {b.title}
                                            </span>
                                        </div>
                                        <span style={{ 
                                            fontSize: '1.25rem', 
                                            color: isActive ? '#22c1e6' : '#94a3b8', 
                                            transform: isActive ? 'translateX(3px)' : 'translateX(0)',
                                            transition: 'all 0.2s'
                                        }}>
                                            ➔
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <style>{`
                    @media (max-width: 968px) {
                        .switcher-grid {
                            grid-template-columns: 1fr !important;
                            gap: 2.5rem !important;
                        }
                    }
                `}</style>
            </section>

            {/* Section 4: Current Partners */}
            <section id="get-involved" style={{ padding: '5rem 1rem', background: '#ffffff', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
                    <span style={{
                        background: 'rgba(34, 193, 230, 0.1)',
                        color: '#22c1e6',
                        padding: '0.4rem 0.9rem',
                        borderRadius: '9999px',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        display: 'inline-block',
                        marginBottom: '1rem'
                    }}>
                        THOSE WHO WALK WITH US
                    </span>
                    <h2 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#120D20', marginBottom: '0.75rem' }}>
                        Our Partners in Purpose
                    </h2>
                    <p style={{ fontSize: '1.05rem', color: '#64748b', maxWidth: '600px', margin: '0 auto 3rem' }}>
                        We are deeply grateful for every organisation and individual who has chosen to align with the mission of Jesus Enthroned Network. Together, we are building something that will outlast all of us.
                    </p>

                    {/* Styled Grid for Partner Names / Logos Placeholder */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1.5rem',
                        alignItems: 'center',
                        justifyContent: 'center',
                        maxWidth: '900px',
                        margin: '0 auto'
                    }}>
                        {['Kingdom Foundation', 'Apex Media Group', 'Global Outreach Alliance', 'Ebenezer Fellowship'].map((p, i) => (
                            <div 
                                key={i}
                                style={{
                                    padding: '1.5rem',
                                    background: '#f8fafc',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(0,0,0,0.04)',
                                    color: '#94a3b8',
                                    fontWeight: '700',
                                    fontSize: '0.95rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.03em',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'white';
                                    e.currentTarget.style.color = '#22c1e6';
                                    e.currentTarget.style.borderColor = 'rgba(34, 193, 230, 0.3)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = '#f8fafc';
                                    e.currentTarget.style.color = '#94a3b8';
                                    e.currentTarget.style.borderColor = 'rgba(0,0,0,0.04)';
                                }}
                            >
                                {p}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section 5: Become a Partner */}
            <section style={{ padding: '6rem 1rem', background: '#f8fafc' }}>
                <div className="container" style={{ maxWidth: '850px', margin: '0 auto' }}>
                    <div style={{
                        backgroundImage: 'linear-gradient(135deg, rgba(18, 13, 32, 0.92) 0%, rgba(26, 22, 37, 0.96) 100%), url("https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=1500&auto=format&fit=crop")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        padding: '4.5rem 3rem',
                        borderRadius: '32px',
                        textAlign: 'center',
                        color: 'white',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                        position: 'relative',
                        overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.04)'
                    }}>
                        {/* Glow Vector inside card */}
                        <div style={{
                            position: 'absolute',
                            top: '-50%',
                            right: '-30%',
                            width: '200px',
                            height: '200px',
                            background: 'radial-gradient(circle, rgba(34, 193, 230, 0.15) 0%, transparent 70%)',
                            pointerEvents: 'none'
                        }}></div>

                        <span style={{
                            background: 'rgba(34, 193, 230, 0.15)',
                            color: '#22c1e6',
                            padding: '0.4rem 0.9rem',
                            borderRadius: '9999px',
                            fontSize: '0.72rem',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            display: 'inline-block',
                            marginBottom: '1.5rem'
                        }}>
                            TAKE THE NEXT STEP
                        </span>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1.5rem', letterSpacing: '-0.02em', lineHeight: '1.2' }}>
                            Ready to Build the Kingdom Together?
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2.5rem', maxWidth: '640px', margin: '0 auto 2.5rem' }}>
                            If you represent a church, institution, business, media organisation, or any Kingdom-minded body that shares our conviction that this generation must be equipped, empowered, and released into their divine purpose — we would love to explore what partnership could look like.
                        </p>
                        <p style={{ color: '#e2e8f0', fontSize: '0.95rem', fontStyle: 'italic', marginBottom: '2rem' }}>
                            Partnership conversations begin with a simple conversation. No pressure, no pitch — just two Kingdom-minded parties exploring whether God is calling us to walk together.
                        </p>

                        <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button style={{
                                padding: '1rem 2rem',
                                background: 'linear-gradient(135deg, #22c1e6 0%, #0ec2e6 100%)',
                                color: '#120D20',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: '800',
                                fontSize: '0.95rem',
                                cursor: 'pointer',
                                transition: 'all 0.25s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                Start a Partnership Conversation
                            </button>
                            <button style={{
                                padding: '1rem 2rem',
                                background: 'rgba(255, 255, 255, 0.06)',
                                color: 'white',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                fontWeight: '700',
                                fontSize: '0.95rem',
                                cursor: 'pointer',
                                transition: 'all 0.25s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'}
                            >
                                Download Our Partnership Overview
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 6: FAQ Accordion */}
            <section id="faq" style={{ padding: '6rem 1rem', background: '#ffffff' }}>
                <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <span style={{
                            background: 'rgba(34, 193, 230, 0.1)',
                            color: '#22c1e6',
                            padding: '0.4rem 0.9rem',
                            borderRadius: '9999px',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            display: 'inline-block',
                            marginBottom: '1rem'
                        }}>
                            PARTNERSHIP FAQ
                        </span>
                        <h2 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#120D20', margin: 0 }}>
                            Frequently Asked Questions
                        </h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {faqs.map((faq, i) => {
                            const isOpen = activeFaq === i;
                            return (
                                <div 
                                    key={i}
                                    style={{
                                        border: '1px solid rgba(0,0,0,0.05)',
                                        borderRadius: '16px',
                                        background: isOpen ? '#f8fafc' : 'white',
                                        overflow: 'hidden',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <button 
                                        onClick={() => toggleFaq(i)}
                                        style={{
                                            width: '100%',
                                            padding: '1.5rem',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            fontWeight: '700',
                                            fontSize: '1.05rem',
                                            color: '#120D20',
                                            gap: '1rem'
                                        }}
                                    >
                                        <span>{faq.q}</span>
                                        <span style={{
                                            fontSize: '1.25rem',
                                            color: '#22c1e6',
                                            transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.25s ease',
                                            lineHeight: 1
                                        }}>
                                            +
                                        </span>
                                    </button>
                                    
                                    <div style={{
                                        maxHeight: isOpen ? '250px' : '0px',
                                        opacity: isOpen ? 1 : 0,
                                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            padding: '0 1.5rem 1.5rem 1.5rem',
                                            color: '#64748b',
                                            fontSize: '0.95rem',
                                            lineHeight: 1.6
                                        }}>
                                            {faq.a}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Page Footer Pull Quote */}
            <section style={{ 
                padding: '6rem 1rem', 
                background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)', 
                borderTop: '1px solid rgba(0,0,0,0.03)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div className="container" style={{ maxWidth: '850px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #120D20 0%, #0d091a 100%)',
                        padding: '4rem 3rem',
                        borderRadius: '32px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        position: 'relative',
                        overflow: 'hidden',
                        textAlign: 'center'
                    }}>
                        {/* Glow Sphere inside quote card */}
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '200px',
                            height: '200px',
                            background: 'radial-gradient(circle, rgba(34, 193, 230, 0.12) 0%, transparent 70%)',
                            pointerEvents: 'none',
                            zIndex: 0
                        }}></div>

                        {/* Large Quote Icon */}
                        <div style={{
                            fontSize: '4.5rem',
                            fontFamily: 'Georgia, serif',
                            color: '#22c1e6',
                            lineHeight: 1,
                            marginBottom: '1rem',
                            zIndex: 1,
                            position: 'relative',
                            userSelect: 'none',
                            opacity: 0.8
                        }}>
                            “
                        </div>

                        <blockquote style={{
                            fontSize: '1.65rem',
                            fontWeight: '600',
                            fontFamily: 'Georgia, serif',
                            color: '#f8fafc',
                            lineHeight: 1.6,
                            margin: '0 0 2rem 0',
                            fontStyle: 'italic',
                            zIndex: 1,
                            position: 'relative',
                            padding: '0 1rem'
                        }}>
                            "Two are better than one, because they have a good reward for their toil. For if they fall, one will lift up his fellow."
                        </blockquote>

                        <div style={{
                            width: '40px',
                            height: '2px',
                            background: '#22c1e6',
                            margin: '0 auto 1.5rem',
                            zIndex: 1,
                            position: 'relative'
                        }}></div>

                        <cite style={{ 
                            fontSize: '0.85rem', 
                            fontWeight: '800', 
                            color: '#22c1e6', 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.2em',
                            zIndex: 1,
                            position: 'relative',
                            display: 'block'
                        }}>
                            Ecclesiastes 4:9–10
                        </cite>
                    </div>
                </div>
            </section>

            {/* Sticky Floating Dot Navigator */}
            <div style={{
                position: 'fixed',
                right: '28px',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                zIndex: 1000
            }} className="dot-navigator">
                {[
                    { id: 'partners-hero', label: 'Welcome' },
                    { id: 'why-partner', label: 'Why Partner' },
                    { id: 'categories', label: 'Who We Partner' },
                    { id: 'benefits', label: 'Benefits' },
                    { id: 'get-involved', label: 'Become a Partner' },
                    { id: 'faq', label: 'FAQs & Quote' }
                ].map((item, idx) => {
                    const isActive = activeSection === item.id;
                    return (
                        <div key={idx} style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }} className="nav-dot-container">
                            {/* Label (Fades in on hover) */}
                            <span className="nav-dot-label" style={{
                                position: 'absolute',
                                right: '35px',
                                background: '#120D20',
                                color: 'white',
                                padding: '0.35rem 0.75rem',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                whiteSpace: 'nowrap',
                                opacity: 0,
                                transform: 'translateX(10px)',
                                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                                pointerEvents: 'none',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                border: '1px solid rgba(255, 255, 255, 0.08)'
                            }}>
                                {item.label}
                            </span>
                            
                            {/* Interactive Dot */}
                            <button
                                onClick={() => scrollToSection(item.id)}
                                style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    background: isActive ? '#22c1e6' : 'rgba(18, 13, 32, 0.25)',
                                    border: isActive ? '3px solid white' : '2px solid transparent',
                                    outline: isActive ? '2px solid #22c1e6' : 'none',
                                    cursor: 'pointer',
                                    padding: 0,
                                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                    boxShadow: isActive ? '0 0 10px #22c1e6' : 'none'
                                }}
                            />
                        </div>
                    );
                })}
            </div>

            <Footer />
        </div>
    );
};

export default Partners;
