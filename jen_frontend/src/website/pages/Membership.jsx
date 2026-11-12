import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Membership = () => {
    const [activeFaq, setActiveFaq] = useState(null);
    const [activeSection, setActiveSection] = useState('membership-hero');
    const [activeCategory, setActiveCategory] = useState(0);
    const [activeStep, setActiveStep] = useState(0);

    const toggleFaq = (idx) => {
        setActiveFaq(activeFaq === idx ? null : idx);
    };

    useEffect(() => {
        const sections = ['membership-hero', 'who-for', 'pathways', 'journey', 'expectations', 'fees', 'faq', 'cta'];
        
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

    const categories = [
        {
            num: '01',
            title: 'Governing Member',
            badge: 'Foundational Leadership',
            badgeColor: '#22c1e6', // Cyan
            bgColor: 'rgba(34, 193, 230, 0.05)',
            who: "Individuals who carry full constitutional rights within JEN — including voting at General Meetings, standing for Board positions, and participating in the highest levels of organizational governance. Governing Members are the backbone of JEN's accountability structure and are held to the highest standards of integrity, conduct, and commitment.",
            requirements: [
                "Born-again Christian with a demonstrable and consistent faith walk",
                "Affirms the JEN Statement of Faith without reservation",
                "Has completed the full Orientation, Vetting, and Induction process",
                "Demonstrates commitment to JEN's Core Values and Code of Conduct",
                "Actively participates in a cell or fellowship hub",
                "Recommended by an existing Governing Member and approved by the Board"
            ],
            rights: [
                "Full voting rights at Annual and Special General Meetings",
                "Eligibility to stand for Board and committee positions",
                "Access to all JEN programs, resources, and events",
                "Participation in constitutional amendment processes",
                "Recognized as a core covenant member of the Network"
            ],
            expectations: "Governing Members are expected to be active, not passive. This means regular cell attendance, participation in governance processes, financial contribution where able, and the modeling of Kingdom character in every sphere of their influence."
        },
        {
            num: '02',
            title: 'Full Member',
            badge: 'Active Member',
            badgeColor: '#d97706', // Gold
            bgColor: 'rgba(217, 119, 6, 0.05)',
            who: "Individuals who are fully committed to JEN's mission and values and are actively engaged in the life of the Network — attending cells, participating in programs, and growing in their Kingdom purpose — but who are not yet in a Board or governance role.",
            requirements: [
                "Born-again Christian who affirms the JEN Statement of Faith",
                "Has completed Orientation and Induction",
                "Actively participating in a cell or fellowship hub",
                "Submitted to JEN's Code of Conduct and Membership Covenant"
            ],
            rights: [
                "Access to all JEN programs, mentorship, and training initiatives",
                "Participation in fellowship hubs and arms of influence",
                "Eligibility to serve in cell leadership and program facilitation roles",
                "Access to the member portal and JEN resources library",
                "Invitation to General Meetings as an observer (non-voting unless elevated to Governing Member)"
            ],
            expectations: "Full Members who demonstrate consistent character, active engagement, and Kingdom leadership are eligible to be recommended for Governing Membership through the formal elevation process reviewed by the Board."
        },
        {
            num: '03',
            title: 'Associate & Partner Member',
            badge: 'Organisational Partner',
            badgeColor: '#0ec2e6', // Lighter Cyan
            bgColor: 'rgba(14, 194, 230, 0.05)',
            who: "Churches, schools, universities, businesses, NGOs, and other organisations or institutions that share JEN's mission and want to formally align with the Network. Also includes individual professionals or ministry leaders who wish to partner with JEN without taking on full membership obligations.",
            requirements: [
                "Shared alignment with JEN's Statement of Faith and Core Values",
                "Formal Partnership Agreement reviewed by the Ethics Committee and approved by the Board",
                "Commitment to the terms of the partnership as defined in the agreement"
            ],
            rights: [
                "Co-branded program delivery and collaboration opportunities",
                "Access to JEN's network, resources, and leadership community",
                "Invitation to relevant JEN events, forums, and convenings",
                "Acknowledgment within JEN's partnership ecosystem",
                "Regular engagement with relevant Arms of Influence"
            ],
            expectations: "Associate and Partner Members do not carry voting rights in JEN's governance processes. Their relationship with JEN is one of purposeful collaboration rather than constitutional membership."
        },
        {
            num: '04',
            title: 'Student Member',
            badge: 'Next Generation',
            badgeColor: '#eab308', // Lighter Gold
            bgColor: 'rgba(234, 179, 8, 0.05)',
            who: "Secondary school and tertiary institution students who are in the earlier stages of their Kingdom journey — discovering their identity, purpose, and calling — and who want the grounding, community, and mentorship that JEN provides at this critical stage of life.",
            requirements: [
                "Currently enrolled in a recognized secondary school or tertiary institution",
                "Affirms a personal Christian faith consistent with JEN's Statement of Faith",
                "Written parental or guardian consent required for members under 18",
                "Connected to a JEN school-based or institutional cell or hub"
            ],
            rights: [
                "Full access to JEN's Mentorship and Student Wellness Programs",
                "Participation in school-based and institutional cells",
                "Access to character, leadership, and career readiness training",
                "Connection to the wider JEN network and community",
                "A clear pathway into Full Membership upon leaving academic institution"
            ],
            expectations: "You are not the church of tomorrow — you are the Kingdom now. JEN takes your membership seriously, invests in your growth intentionally, and walks with you through some of the most formative years of your life. You belong here."
        }
    ];

    const journeySteps = [
        {
            num: '01',
            title: 'Orientation',
            duration: '1-2 sessions',
            desc: "Your first step into JEN is an Orientation — a structured introduction to who we are, what we believe, how we are governed, and what membership means in practice. Orientation covers JEN's vision and mission, the seven mountains mandate, our Statement of Faith, the Code of Conduct, and the rights and responsibilities of each membership category.",
            subtext: "Orientation is not an assessment — it is an invitation. It is where we make sure you know exactly what you are joining and we make sure you feel genuinely welcomed before you take any further step. Offered in-person or online.",
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
            )
        },
        {
            num: '02',
            title: 'Vetting',
            duration: '1-2 weeks',
            desc: "Following Orientation, prospective members go through a Vetting process — a simple but important integrity and conduct review to ensure alignment with JEN's values and suitability for the membership category being applied for.",
            subtext: "Vetting is not an adversarial process. It is a pastoral one — a conversation to confirm faith, character, and commitment, and to ensure that membership is entered into honestly and with accountability on both sides. Overseen by the Education and Membership Committee.",
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 11 11 13 15 9" />
                </svg>
            )
        },
        {
            num: '03',
            title: 'Induction',
            duration: 'At gathering',
            desc: "Induction is the formal welcome of a new member into the JEN family. It includes the signing of the Membership Covenant, the taking of an Oath of Commitment, and a formal commissioning into the Network and its mission.",
            subtext: "Induction is not just administrative — it is a moment. We believe that covenants matter, that words spoken in community carry weight, and that every person who joins JEN should feel the significance of the step they are taking. Commissioned at chapter or cell events.",
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
            )
        }
    ];

    const expectationsList = [
        {
            title: 'Attend and participate in a cell regularly',
            body: 'Cells are where the real work of discipleship happens. Consistent, relational participation in a small group is the heartbeat of JEN membership — not an optional add-on.'
        },
        {
            title: 'Uphold the JEN Code of Conduct in every sphere',
            body: 'Our Code of Conduct is not a list of rules — it is a reflection of the Kingdom values we are called to embody in our homes, workplaces, institutions, and public lives.'
        },
        {
            title: 'Contribute to the community, not just consume',
            body: 'JEN is a family, not a service provider. Every member is expected to bring something — their gifts, their time, their prayers, their encouragement — to the community.'
        },
        {
            title: 'Submit to accountability and restoration',
            body: "We take integrity seriously. Where conduct falls short, JEN's Ethics Committee exists not to punish but to restore — and members agree to submit to that process at induction."
        },
        {
            title: 'Support the Network\'s financial sustainability',
            body: 'JEN does not impose fixed fees, but members are encouraged to contribute financially to the sustainability of the Network in proportion to their means, in the spirit of generous stewardship.'
        }
    ];

    const faqs = [
        {
            q: 'Do I have to be part of a church to join JEN?',
            a: 'Q: Do I have to be part of a church to join JEN? JEN is not a church and does not replace the local church — we deeply value and work alongside the local church as a partner. You do not need to be part of a specific church to join JEN, but we do encourage every member to be connected to a local church community as part of a healthy, holistic faith life.'
        },
        {
            q: 'What if there is no JEN cell or chapter near me?',
            a: 'If you are in a region without an active cell or chapter, you can begin as an online member connected to a virtual cell, while we work with you to explore whether there is an opportunity to plant a cell in your area. Some of JEN\'s most significant chapter launches have started with a single person raising their hand and saying "I want to see this here."'
        },
        {
            q: 'Can I be a member of JEN and another Christian organisation at the same time?',
            a: 'Yes, in most cases. JEN does not require exclusivity of membership. However, where another membership or affiliation creates a conflict of interest with JEN\'s Constitution, Code of Conduct, or Statement of Faith, this will need to be discussed during the Vetting process.'
        },
        {
            q: 'What happens if I need to take a break from active membership?',
            a: 'Life happens. JEN understands that seasons change. Members who need to step back from active participation are encouraged to communicate with their cell leader or the Membership Committee so that the transition is handled pastorally and the door remains open for re-engagement when the season changes.'
        },
        {
            q: 'How is my personal information handled?',
            a: 'JEN maintains a formal Membership Register in line with Article VIII of the Constitution. Your personal data is held securely, used only for purposes directly related to your membership, and is never shared with third parties without your consent.'
        },
        {
            q: 'Can my organisation join as a member rather than a partner?',
            a: 'Organisations are best served by the Associate and Partner Membership category, which is designed specifically for institutional relationships. Individual representatives of that organisation may also apply for Full or Governing Membership in their personal capacity.'
        }
    ];

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            
            {/* Hero Section */}
            <section id="membership-hero" style={{
                background: 'linear-gradient(180deg, #120D20 0%, #0d091a 100%)',
                padding: '4.5rem 1rem 5.5rem',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                marginTop: '80px'
            }}>
                {/* Geometric Shapes */}
                <div style={{
                    position: 'absolute',
                    right: 0,
                    bottom: 0,
                    width: '50%',
                    height: '100%',
                    background: 'linear-gradient(135deg, rgba(34, 193, 230, 0.08) 0%, transparent 100%)',
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
                    <div className="membership-hero-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: '1.2fr 0.8fr',
                        gap: '4rem',
                        alignItems: 'center'
                    }}>
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
                                JOIN THE NETWORK
                            </span>
                            
                            <h1 style={{
                                fontSize: '3.75rem',
                                fontWeight: '800',
                                marginBottom: '1.5rem',
                                lineHeight: 1.1,
                                letterSpacing: '-0.02em'
                            }}>
                                Membership at Jesus Enthroned Network
                            </h1>
                            
                            <p style={{
                                fontSize: '1.125rem',
                                color: '#94a3b8',
                                lineHeight: 1.6,
                                margin: 0,
                                maxWidth: '620px'
                            }}>
                                Membership at JEN is not a subscription — it is a covenant. When you join the Network, you are not signing up for events and emails. You are stepping into a community of Kingdom-minded men and women who are committed to personal transformation, mutual accountability, and collective influence across every sphere of society. Your place here is purposeful.
                            </p>
                        </div>

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
                                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop" 
                                    alt="Membership covenant community" 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                        .membership-hero-grid {
                            grid-template-columns: 1fr !important;
                            gap: 2.5rem !important;
                            text-align: center !important;
                        }
                        .membership-hero-grid div {
                            text-align: center !important;
                        }
                        h1 {
                            font-size: 2.5rem !important;
                        }
                    }
                    @keyframes fadeInLeft {
                        from { opacity: 0; transform: translateX(-35px); }
                        to { opacity: 1; transform: translateX(0); }
                    }
                    @keyframes fadeInRight {
                        from { opacity: 0; transform: translateX(35px); }
                        to { opacity: 1; transform: translateX(0); }
                    }
                    @keyframes floatNodes {
                        0%, 100% { transform: translate(0, 0) scale(1); }
                        50% { transform: translate(20px, -20px) scale(1.1); }
                    }
                    .slide-left {
                        opacity: 0;
                        animation: fadeInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    }
                    .slide-right {
                        opacity: 0;
                        animation: fadeInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    }
                    .bg-glow-vector {
                        animation: floatNodes 15s infinite ease-in-out;
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

            {/* Section 1: Who Membership Is For */}
            <section id="who-for" style={{ 
                padding: '6rem 1.5rem', 
                background: 'radial-gradient(circle at 10% 20%, rgba(34, 193, 230, 0.03) 0%, transparent 45%), radial-gradient(circle at 90% 80%, rgba(34, 193, 230, 0.03) 0%, transparent 45%), #f8fafc',
                position: 'relative'
            }}>
                <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <div className="who-for-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: '1.2fr 0.8fr',
                        gap: '4.5rem',
                        alignItems: 'center'
                    }}>
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
                                IS JEN FOR YOU?
                            </span>
                            <h2 style={{ 
                                fontSize: '3.25rem', 
                                fontWeight: '800', 
                                color: '#120D20', 
                                marginBottom: '1.5rem', 
                                lineHeight: 1.15,
                                letterSpacing: '-0.02em' 
                            }}>
                                Built for Every Stage of the <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: '400', color: '#22c1e6' }}>Kingdom Journey</span>
                            </h2>
                            <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                                JEN membership is open to individuals, students, professionals, leaders, and organisations who share a born-again Christian faith, affirm our Statement of Faith, and are committed to living out Kingdom values in their personal and professional lives.
                            </p>
                            <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                                Whether you are a student still discovering your calling, a professional seeking a community of Kingdom-minded peers, an established leader wanting to invest in the next generation, or an organisation looking to embed Kingdom values into your work — there is a membership pathway designed for you.
                            </p>
                            <p style={{ fontSize: '1.08rem', fontWeight: '700', color: '#22c1e6', lineHeight: 1.6, margin: 0 }}>
                                The one thing every JEN member shares is this: a conviction that Jesus Christ is Lord over every sphere of life, and a desire to live that conviction out loud.
                            </p>
                        </div>

                        {/* Interactive Case Card */}
                        <div style={{
                            background: '#161226',
                            padding: '2.5rem',
                            borderRadius: '24px',
                            border: '1px solid rgba(34, 193, 230, 0.15)',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
                            textAlign: 'left',
                            color: 'white'
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
                                MEMBERSHIP ALIGNMENT
                            </span>
                            
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {[
                                    { title: "Born-Again Christian Faith", desc: "A personal confession of Jesus Christ as Savior." },
                                    { title: "Statement of Faith", desc: "Agreement with core Biblical doctrines." },
                                    { title: "Code of Conduct", desc: "Modeling Christlike integrity in public/private." },
                                    { title: "Active Participation", desc: "Committing to regular fellowship." }
                                ].map((item, idx) => (
                                    <li key={idx} style={{ paddingBottom: '0.85rem', borderBottom: idx === 3 ? 'none' : '1px solid rgba(255,255,255,0.06)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c1e6' }}></span>
                                            <strong style={{ fontSize: '0.95rem', color: '#f8fafc' }}>{item.title}</strong>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', paddingLeft: '1.1rem' }}>{item.desc}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <style>{`
                    @media (max-width: 968px) {
                        .who-for-grid {
                            grid-template-columns: 1fr !important;
                            gap: 3.5rem !important;
                        }
                    }
                `}</style>
            </section>

            {/* Section 2: Membership Categories */}
            <section id="pathways" style={{ 
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
                    backgroundImage: 'url("https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1500&auto=format&fit=crop")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.12,
                    clipPath: 'polygon(0 0, 100% 8%, 100% 100%, 0 92%)',
                    zIndex: 0,
                    pointerEvents: 'none'
                }}></div>

                {/* Floating Glow Nodes */}
                <div className="bg-glow-vector" style={{
                    position: 'absolute',
                    top: '10%',
                    left: '-5%',
                    width: '350px',
                    height: '350px',
                    background: 'radial-gradient(circle, rgba(34, 193, 230, 0.08) 0%, transparent 70%)',
                    zIndex: 0,
                    pointerEvents: 'none'
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
                            FIND YOUR PATHWAY
                        </span>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#120D20', marginBottom: '1rem', letterSpacing: '-0.01em' }}>
                            Four Membership Categories. One Kingdom Family.
                        </h2>
                        <p style={{ fontSize: '1.05rem', color: '#64748b', maxWidth: '640px', margin: '0 auto' }}>
                            Each membership category carries its own rights, responsibilities, and pathway into the JEN community. Choose the one that best reflects where you are and where you are going.
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
                                    <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
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
                                                {cat.badge}
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
                                            <p style={{ color: '#94a3b8', fontSize: '0.975rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                                                {cat.who}
                                            </p>

                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '1.5rem' }}>
                                                <div>
                                                    <h5 style={{ color: cat.badgeColor, fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Requirements</h5>
                                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                        {cat.requirements.map((req, rIdx) => (
                                                            <li key={rIdx} style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                                                <span style={{ color: cat.badgeColor }}>✓</span> {req}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h5 style={{ color: cat.badgeColor, fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Rights & Privileges</h5>
                                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                        {cat.rights.map((rgt, rgIdx) => (
                                                            <li key={rgIdx} style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                                                <span style={{ color: cat.badgeColor }}>✦</span> {rgt}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>

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
                                                    Commitment Expected
                                                </span>
                                                <p style={{
                                                    color: '#22c1e6',
                                                    fontSize: '0.9rem',
                                                    lineHeight: 1.5,
                                                    margin: 0,
                                                    fontStyle: 'italic'
                                                }}>
                                                    {cat.expectations}
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

            {/* Section 3: The Membership Journey */}
            <section id="journey" style={{ 
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

                <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
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
                            HOW IT WORKS
                        </span>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#120D20', marginBottom: '1rem', letterSpacing: '-0.01em' }}>
                            Three Steps Into the JEN Family
                        </h2>
                        <p style={{ fontSize: '1.05rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
                            Membership at JEN is not instantaneous — and that is by design. The process exists to ensure that every member who joins does so with full understanding.
                        </p>
                    </div>

                    <div className="switcher-grid" style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: '4rem', 
                        alignItems: 'stretch' 
                    }}>
                        {/* Left Column: Active Step Showcase Card */}
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
                                    {journeySteps[activeCategory].icon}
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
                                    STEP {journeySteps[activeStep].num} ({journeySteps[activeStep].duration})
                                </span>
                            </div>

                            <h3 style={{ fontSize: '2.25rem', fontWeight: '850', color: 'white', marginBottom: '1.25rem', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                                {journeySteps[activeStep].title}
                            </h3>
                            <p style={{ color: '#94a3b8', fontSize: '1.025rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                                {journeySteps[activeStep].desc}
                            </p>
                            <p style={{ color: '#e2e8f0', fontSize: '0.9rem', lineHeight: 1.5, fontStyle: 'italic', margin: 0 }}>
                                {journeySteps[activeStep].subtext}
                            </p>
                        </div>

                        {/* Right Column: Clickable Steps Tabs */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', justifyContent: 'center' }}>
                            {journeySteps.map((s, idx) => {
                                const isActive = activeStep === idx;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveStep(idx)}
                                        style={{
                                            background: isActive ? 'white' : 'rgba(255, 255, 255, 0.4)',
                                            padding: '1.5rem 1.75rem',
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
                                                {s.icon}
                                            </div>
                                            <div>
                                                <span style={{ 
                                                    fontWeight: '800', 
                                                    fontSize: '1.1rem', 
                                                    color: isActive ? '#120D20' : '#475569',
                                                    transition: 'color 0.2s',
                                                    display: 'block'
                                                }}>
                                                    {s.title}
                                                </span>
                                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Step {s.num}</span>
                                            </div>
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

            {/* Section 4: Membership Expectations */}
            <section id="expectations" style={{ padding: '6rem 1.5rem', background: '#ffffff', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
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
                            WHAT WE ASK OF YOU
                        </span>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#120D20', marginBottom: '1rem' }}>
                            Membership Is a Covenant, Not a Subscription
                        </h2>
                        <p style={{ fontSize: '1.05rem', color: '#64748b', maxWidth: '740px', margin: '0 auto' }}>
                            JEN membership carries real expectations — and we say that not to deter you but to honour you. We believe you are capable of more than passive participation. We believe your presence in this Network is not accidental.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                        {expectationsList.map((exp, idx) => (
                            <div key={idx} style={{
                                background: '#f8fafc',
                                padding: '2.25rem 2rem',
                                borderRadius: '20px',
                                border: '1px solid rgba(0,0,0,0.04)',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.borderColor = 'rgba(34, 193, 230, 0.3)';
                                e.currentTarget.style.background = 'white';
                                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.03)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = 'rgba(0,0,0,0.04)';
                                e.currentTarget.style.background = '#f8fafc';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '1.5rem' }}>🛡️</span>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#22c1e6', background: 'rgba(34, 193, 230, 0.08)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                                        0{idx + 1}
                                    </span>
                                </div>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#120D20', margin: 0 }}>{exp.title}</h3>
                                <p style={{ color: '#64748b', fontSize: '0.925rem', lineHeight: 1.5, margin: 0 }}>{exp.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section 5: Membership Fees */}
            <section id="fees" style={{ padding: '6rem 1.5rem', background: '#f8fafc' }}>
                <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
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
                            FINANCIAL CONTRIBUTION
                        </span>
                        <h2 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#120D20', marginBottom: '1rem' }}>
                            Stewardship, Not a Subscription
                        </h2>
                        <p style={{ fontSize: '1.05rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
                            JEN does not operate a pay-to-belong model. No one is excluded from membership because of financial constraints.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                        {[
                            { title: "Annual Membership Contribution", desc: "A suggested annual contribution exists for Full and Governing Members to support operating costs. Set by the Board annually." },
                            { title: "Project & Program Giving", desc: "Choose to give toward student wellness, cell multiplication, technology hubs, or global missions projects directly." },
                            { title: "In-Kind Contribution", desc: "Contribute professional skills, time, or networks to the work of the Network. Every form of stewardship is valued." },
                            { title: "Transparency Commitment", desc: "Managed under a Constitution-governed financial framework, with Finance Committee oversight and independent audits." }
                        ].map((fee, idx) => (
                            <div key={idx} style={{
                                padding: '2rem 1.75rem',
                                background: 'white',
                                borderRadius: '16px',
                                border: '1px solid rgba(0,0,0,0.03)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.01)',
                                textAlign: 'left'
                            }}>
                                <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '1rem' }}>💎</span>
                                <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#120D20', marginBottom: '0.5rem' }}>{fee.title}</h4>
                                <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>{fee.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section 6: Frequently Asked Questions */}
            <section id="faq" style={{ padding: '6rem 1.5rem', background: '#ffffff' }}>
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
                            MEMBERSHIP FAQ
                        </span>
                        <h2 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#120D20', margin: 0 }}>
                            Your Questions, Answered
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

            {/* Section 7: Call To Action */}
            <section id="cta" style={{ padding: '6rem 1.5rem', background: '#f8fafc' }}>
                <div className="container" style={{ maxWidth: '850px', margin: '0 auto' }}>
                    <div style={{
                        backgroundImage: 'linear-gradient(135deg, rgba(18, 13, 32, 0.92) 0%, rgba(26, 22, 37, 0.96) 100%), url("https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1500&auto=format&fit=crop")',
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
                            YOUR NEXT STEP
                        </span>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1.5rem', letterSpacing: '-0.02em', lineHeight: '1.2' }}>
                            Your Purpose Has a Community Here
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2.5rem', maxWidth: '640px', margin: '0 auto 2.5rem' }}>
                            You were not created to fulfil your Kingdom calling alone. JEN exists to walk with you — through the formation, the challenges, the growth, and the influence — as you step into everything God has called you to be and do.
                        </p>
                        <p style={{ color: '#e2e8f0', fontSize: '0.95rem', fontStyle: 'italic', marginBottom: '2rem' }}>
                            The door is open. The community is ready. Your next step is simply to begin.
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
                                Apply for Membership
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
                                Speak to a Membership Coordinator
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
                                Find a Cell Near Me
                            </button>
                        </div>
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
                            "For we are co-workers in God's service; you are God's field, God's building."
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
                            1 Corinthians 3:9
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
                    { id: 'membership-hero', label: 'Welcome' },
                    { id: 'who-for', label: 'Is JEN for You?' },
                    { id: 'pathways', label: 'Pathways' },
                    { id: 'journey', label: 'The Journey' },
                    { id: 'expectations', label: 'Expectations' },
                    { id: 'fees', label: 'Stewardship' },
                    { id: 'faq', label: 'FAQs' },
                    { id: 'cta', label: 'Get Started' }
                ].map((item, idx) => {
                    const isActive = activeSection === item.id;
                    return (
                        <div key={idx} style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }} className="nav-dot-container">
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

export default Membership;
