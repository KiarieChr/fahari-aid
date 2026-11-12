import React from 'react';

const PersonalGivingSummaryCard = () => {
    return (
        <div className="personal-giving-card">
            <div className="card-head">
                <span className="badge-giving">Faith Stewardship</span>
                <span className="giving-year">2026 Season</span>
            </div>
            <h4 className="giving-title">Personal Giving & Tithes</h4>
            <p className="giving-sub">“Bring the whole tithe into the storehouse...” — Malachi 3:10</p>

            <div className="giving-box">
                <div className="box-item">
                    <span className="box-label">Monthly Covenant</span>
                    <span className="box-val">Active</span>
                </div>
                <div className="box-item">
                    <span className="box-label">Pledge Status</span>
                    <span className="box-val green">Honored</span>
                </div>
            </div>

            <button className="btn-giving" onClick={() => window.location.href = '/portal/finance'}>
                View My Giving History & Receipts
            </button>

            <style>{`
                .personal-giving-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 1.25rem;
                    padding: 1.35rem;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
                    margin-bottom: 1.5rem;
                }
                .portal-wrapper.dark-mode .personal-giving-card {
                    background: #151128;
                    border-color: rgba(255, 255, 255, 0.08);
                }
                .card-head {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }
                .badge-giving {
                    font-size: 0.68rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    background: #ecfeff;
                    color: #0891b2;
                    padding: 0.2rem 0.55rem;
                    border-radius: 9999px;
                }
                .giving-year {
                    font-size: 0.72rem;
                    color: #64748b;
                    font-weight: 600;
                }
                .giving-title {
                    font-size: 1.05rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0.2rem 0;
                }
                .portal-wrapper.dark-mode .giving-title {
                    color: #f8fafc;
                }
                .giving-sub {
                    font-size: 0.78rem;
                    color: #64748b;
                    font-style: italic;
                    margin: 0 0 1rem 0;
                }
                .giving-box {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                }
                .box-item {
                    background: #f8fafc;
                    border-radius: 0.6rem;
                    padding: 0.6rem 0.75rem;
                    display: flex;
                    flex-direction: column;
                }
                .portal-wrapper.dark-mode .box-item {
                    background: rgba(255, 255, 255, 0.03);
                }
                .box-label {
                    font-size: 0.65rem;
                    color: #64748b;
                    text-transform: uppercase;
                    font-weight: 600;
                }
                .box-val {
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: #0f172a;
                }
                .portal-wrapper.dark-mode .box-val {
                    color: #f8fafc;
                }
                .box-val.green {
                    color: #10b981;
                }
                .btn-giving {
                    width: 100%;
                    padding: 0.6rem;
                    background: #0891b2;
                    color: #ffffff;
                    border: none;
                    border-radius: 0.6rem;
                    font-size: 0.8rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: background 0.15s ease;
                }
                .btn-giving:hover {
                    background: #0e7490;
                }
            `}</style>
        </div>
    );
};

export default PersonalGivingSummaryCard;
