import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

const FaqSection = () => {
    const [openIndex, setOpenIndex] = useState(0); // Default first one open
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    const faqs = [
        {
            q: "Who is Jesus Enthroned Network for?",
            a: "JEN is for anyone with a desire to fulfil their Kingdom purpose — from students and young professionals to established leaders and institutions. We welcome Governing Members, Full Members, Associate/Partner Members, and Student Members across every walk of life."
        },
        {
            q: "How do I become a member?",
            a: "The membership process involves an Orientation, a Vetting stage, and a formal Induction. You can begin by joining a Cell or Fellowship Hub in your area, or by contacting us directly to discuss the right membership pathway for you."
        },
        {
            q: "Do you operate outside Kenya?",
            a: "Yes. While JEN is incorporated in Kenya under the Companies Act 2015, our mandate is global. We operate international chapters in compliance with local laws in each territory, with a unified governance structure that maintains our values and standards across every region."
        },
        {
            q: "Can institutions or churches partner with JEN?",
            a: "Absolutely. We have an Associate/Partner Membership category specifically designed for organisations, churches, schools, and institutions that share our mission. Partnership opens access to our programs, resources, and collaborative initiatives across all seven spheres."
        },
        {
            q: "What does JEN's cell (small group) system look like?",
            a: "Cells are intimate groups of 5–15 members that meet weekly for discipleship, fellowship, prayer, and sphere-of-influence application. Each cell is led by a commissioned Cell Leader and feeds into the broader Fellowship and Mentorship Hub structure within JEN's governance framework."
        }
    ];

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.15 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    const toggleFaq = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section ref={sectionRef} className="faq-section-new">
            {/* Glowing Gradient Divider at the top */}
            <div className="section-divider"></div>

            {/* Background Ambient Glow */}
            <div className="faq-glow-left"></div>

            <div className={`container faq-container ${isVisible ? 'fade-in-up' : 'hidden-state'}`}>
                {/* Header */}
                <div className="faq-header">
                    <span className="faq-eyebrow">FAQ</span>
                    <h2 className="faq-title">Frequently Asked <em>Questions</em></h2>
                    <p className="faq-subtitle">
                        Whether you are exploring membership, partnership, or our programs, here are answers to the questions we hear most often.
                    </p>
                </div>

                {/* FAQ List */}
                <div className="faq-list-new">
                    {faqs.map((faq, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <div key={index} className={`faq-item-new ${isOpen ? 'open' : ''}`}>
                                <button 
                                    className="faq-question-btn-new" 
                                    onClick={() => toggleFaq(index)}
                                    aria-expanded={isOpen}
                                >
                                    <span>{faq.q}</span>
                                    <ChevronDown 
                                        size={20} 
                                        className="faq-chevron-new"
                                        style={{
                                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                                        }}
                                    />
                                </button>
                                <div 
                                    className="faq-answer-wrapper-new"
                                    style={{
                                        maxHeight: isOpen ? '250px' : '0px',
                                        opacity: isOpen ? 1 : 0
                                    }}
                                >
                                    <div className="faq-answer-content-new">
                                        <p>{faq.a}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <style>{`
                .faq-section-new {
                    padding: 96px 0;
                    background: linear-gradient(180deg, #150f28 0%, #120D20 100%);
                    position: relative;
                    overflow: hidden;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                /* Glowing Gradient Divider styling */
                .section-divider {
                    position: absolute;
                    top: 0;
                    left: 0;
                    height: 1px;
                    width: 100%;
                    background: linear-gradient(90deg, transparent 10%, rgba(34, 193, 230, 0.3) 50%, transparent 90%);
                    z-index: 10;
                }
                .section-divider::after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 300px;
                    height: 15px;
                    background: radial-gradient(circle, rgba(34, 193, 230, 0.15) 0%, transparent 80%);
                    filter: blur(4px);
                    pointer-events: none;
                }

                /* Animation Helpers */
                .hidden-state {
                    opacity: 0;
                    transform: translateY(30px);
                }
                .fade-in-up {
                    opacity: 1;
                    transform: translateY(0);
                    transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .faq-glow-left {
                    position: absolute;
                    bottom: -10%;
                    left: -10%;
                    width: 450px;
                    height: 450px;
                    background: radial-gradient(circle, rgba(34, 193, 230, 0.06) 0%, transparent 70%);
                    pointer-events: none;
                    z-index: 1;
                }

                .faq-container {
                    position: relative;
                    z-index: 2;
                    width: 100%;
                    max-width: 850px;
                    margin: 0 auto;
                    padding: 0 5%;
                }

                .faq-header {
                    text-align: center;
                    margin-bottom: 64px;
                }

                .faq-eyebrow {
                    font-size: 11px;
                    letter-spacing: 0.3em;
                    text-transform: uppercase;
                    color: var(--primary, #22c1e6);
                    font-weight: 600;
                    margin-bottom: 16px;
                    display: inline-flex;
                    align-items: center;
                    gap: 12px;
                    font-family: var(--font-sans), sans-serif;
                }

                .faq-eyebrow::after {
                    content: '';
                    width: 40px;
                    height: 1.5px;
                    background: var(--primary, #22c1e6);
                }

                .faq-title {
                    font-family: 'Playfair Display', var(--font-sans), sans-serif;
                    font-size: clamp(1.8rem, 3vw, 2.6rem);
                    font-weight: 700;
                    color: var(--text, #ffffff);
                    line-height: 1.25;
                    margin-bottom: 20px;
                }

                .faq-title em {
                    font-style: italic;
                    color: var(--primary, #22c1e6);
                }

                .faq-subtitle {
                    font-size: 16px;
                    color: var(--text-muted, #94a3b8);
                    margin: 0 auto;
                    max-width: 600px;
                    line-height: 1.7;
                }

                .faq-list-new {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .faq-item-new {
                    background: rgba(26, 22, 37, 0.4);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 16px;
                    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                    overflow: hidden;
                }

                .faq-item-new:hover {
                    background: rgba(33, 28, 47, 0.6);
                    border-color: rgba(34, 193, 230, 0.2);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
                }

                .faq-item-new.open {
                    background: rgba(33, 28, 47, 0.8);
                    border-color: rgba(34, 193, 230, 0.3);
                    box-shadow: 0 12px 36px rgba(34, 193, 230, 0.08);
                }

                .faq-question-btn-new {
                    width: 100%;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 24px 32px;
                    background: none;
                    border: none;
                    text-align: left;
                    font-family: var(--font-sans), sans-serif;
                    font-size: 1.08rem;
                    font-weight: 600;
                    color: var(--text, #ffffff);
                    transition: all 0.25s ease;
                    cursor: pointer;
                }

                .faq-question-btn-new:hover {
                    color: var(--primary, #22c1e6);
                }

                .faq-item-new.open .faq-question-btn-new {
                    color: var(--primary, #22c1e6);
                }

                .faq-chevron-new {
                    color: var(--primary, #22c1e6);
                    flex-shrink: 0;
                    margin-left: 16px;
                }

                .faq-answer-wrapper-new {
                    overflow: hidden;
                    transition: max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
                }

                .faq-answer-content-new {
                    padding: 0 32px 28px;
                    font-family: var(--font-sans), sans-serif;
                    font-size: 0.95rem;
                    line-height: 1.75;
                    color: var(--text-muted, #94a3b8);
                }

                @media (max-width: 600px) {
                    .faq-question-btn-new {
                        padding: 20px 24px;
                        font-size: 0.975rem;
                    }
                    .faq-answer-content-new {
                        padding: 0 24px 20px;
                        font-size: 0.9rem;
                    }
                }
            `}</style>
        </section>
    );
};

export default FaqSection;
