import React from 'react';

const ValuesSection = () => {
    const values = [
        {
            num: '01',
            title: 'Christ-Centered Foundation',
            description: 'The Lordship of Jesus Christ governs every program, decision, and relationship. Biblical Principles are not an add-on — they are the foundation.'
        },
        {
            num: '02',
            title: 'Transformational Integrity',
            description: 'Ethical leadership that actively rejects corruption, champions accountability, and models the standard we seek to raise in the next generation.'
        },
        {
            num: '03',
            title: 'Wholeness',
            description: 'We develop character with the same intentionality as competence — because sustainable Kingdom impact requires the whole person.'
        },
        {
            num: '04',
            title: 'Excellence in Service',
            description: 'Pursuing wisdom, truth, innovation, fairness, and generosity in every engagement — because what we do for the Kingdom deserves our very best.'
        }
    ];

    return (
        <section className="values-section-new">
            {/* Background Zoom Layer */}
            <div className="values-bg-zoom-container">
                <img 
                    src="/DSC_0071.JPG" 
                    alt="Pillars Background" 
                    className="values-bg-zoom-image"
                />
                <div className="values-bg-overlay"></div>
            </div>

            <div className="container values-container">
                {/* Header Section matching Mockup Structure */}
                <div className="values-header" style={{ position: 'relative', zIndex: 4 }}>
                    <div className="values-eyebrow">Core Values</div>
                    <h2 className="values-title">
                        The Principles That <em>Define Everything We Do</em>
                    </h2>
                    <p className="values-subtitle">
                        These core values form the foundation of our network, guiding our conduct and aligning our programs with eternal truths.
                    </p>
                </div>

                {/* Staggered Animated Grid */}
                <div className="values-grid">
                    {values.map((val, index) => (
                        <div
                            key={index}
                            className="value-card-new"
                            style={{
                                animation: 'valuesSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                                animationDelay: `${index * 0.1}s`,
                                opacity: 0
                            }}
                        >
                            <div className="value-card-inner">
                                <div className="value-num">{val.num}</div>
                                <h3 className="value-card-title">{val.title}</h3>
                                <p className="value-card-desc">{val.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .values-section-new {
                    padding: 96px 0;
                    position: relative;
                    overflow: hidden;
                    background: var(--background, #120D20);
                }

                .values-bg-zoom-container {
                    position: absolute;
                    inset: 0;
                    z-index: 1;
                    overflow: hidden;
                }

                .values-bg-zoom-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 12s ease;
                    transform: scale(1);
                }

                .values-section-new:hover .values-bg-zoom-image {
                    transform: scale(1.07);
                }

                .values-bg-overlay {
                    position: absolute;
                    inset: 0;
                    z-index: 2;
                    background: linear-gradient(135deg, rgba(18, 13, 32, 0.95), rgba(10, 8, 18, 0.98));
                }

                .values-container {
                    position: relative;
                    z-index: 3;
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 5%;
                }

                .values-header {
                    text-align: center;
                    margin-bottom: 56px;
                    animation: valuesSlideDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                .values-header p {
                    max-width: 680px;
                    font-size: 16px;
                    color: var(--text-muted, #94a3b8);
                    margin: 16px auto 0;
                    line-height: 1.8;
                }

                .values-eyebrow {
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

                .values-eyebrow::after {
                    content: '';
                    width: 40px;
                    height: 1.5px;
                    background: var(--primary, #22c1e6);
                }

                .values-title {
                    font-family: 'Playfair Display', var(--font-sans), sans-serif;
                    font-size: clamp(1.7rem, 3vw, 2.6rem);
                    font-weight: 700;
                    color: var(--text, #ffffff);
                    line-height: 1.25;
                }

                .values-title em {
                    font-style: italic;
                    color: var(--primary, #22c1e6);
                }

                .values-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 24px;
                }

                .value-card-new {
                    background: rgba(26, 22, 37, 0.75);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border-radius: 0 12px 12px 0;
                    border-left: 3px solid rgba(34, 193, 230, 0.4);
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    border-right: 1px solid rgba(255, 255, 255, 0.05);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }

                .value-card-new:hover {
                    transform: translateY(-5px);
                    background: rgba(33, 28, 47, 0.88);
                    border-left-color: var(--primary, #22c1e6);
                    border-color: rgba(255, 255, 255, 0.12);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
                }

                .value-card-inner {
                    padding: 32px 24px;
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    font-family: var(--font-sans), sans-serif;
                }

                .value-num {
                    font-size: 12px;
                    letter-spacing: 0.2em;
                    color: var(--primary, #22c1e6);
                    font-weight: 600;
                    margin-bottom: 12px;
                }

                .value-card-title {
                    font-family: 'Playfair Display', var(--font-sans), sans-serif;
                    color: var(--text, #ffffff);
                    font-size: 1.15rem;
                    font-weight: 700;
                    margin: 0 0 10px 0;
                }

                .value-card-desc {
                    color: var(--text-muted, rgba(255, 255, 255, 0.7));
                    line-height: 1.7;
                    font-size: 13.5px;
                    margin: 0;
                }

                @keyframes valuesSlideUp {
                    from {
                        opacity: 0;
                        transform: translateY(24px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes valuesSlideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @media (max-width: 900px) {
                    .values-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 600px) {
                    .values-grid {
                        grid-template-columns: 1fr;
                    }
                    .values-container {
                        padding: 0 4%;
                    }
                }
            `}</style>
        </section>
    );
};

export default ValuesSection;
