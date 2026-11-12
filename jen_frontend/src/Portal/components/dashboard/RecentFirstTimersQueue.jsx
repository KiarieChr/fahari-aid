import React from 'react';

const RecentFirstTimersQueue = ({ data }) => {
    const list = data?.recent_first_timers || [
        { id: 101, name: 'Daniel Kamau', phone: '+254 712 345 678', joined: 'Nov 03, 2026', cell_status: 'Placed in Cell', stage: 'Cell Integration' },
        { id: 102, name: 'Grace Wanjiku', phone: '+254 722 890 123', joined: 'Nov 05, 2026', cell_status: 'Pending Assignment', stage: 'Welcome Call' },
        { id: 103, name: 'Samuel Otieno', phone: '+254 733 456 789', joined: 'Nov 08, 2026', cell_status: 'Placed in Cell', stage: 'Foundation Class' },
    ];

    return (
        <div className="recent-first-timers-card">
            <div className="card-header">
                <div>
                    <h4 className="title">Active Follow-Up & Soul Care Queue</h4>
                    <p className="subtitle">First-time visitors and new converts assigned for care & cell placement</p>
                </div>
                <button className="btn-all-souls" onClick={() => window.location.href = '/portal/assimilation'}>
                    View All Leads
                </button>
            </div>

            <div className="converts-list">
                {list.map((c) => (
                    <div key={c.id} className="convert-item">
                        <div className="avatar-wrap">
                            {c.name.charAt(0)}
                        </div>
                        <div className="info-wrap">
                            <div className="name-row">
                                <span className="c-name">{c.name}</span>
                                <span className="c-date">{c.joined}</span>
                            </div>
                            <div className="meta-row">
                                <span className="c-phone">{c.phone}</span>
                                <span className="dot">•</span>
                                <span className={`cell-tag ${c.cell_status.includes('Placed') ? 'ok' : 'pending'}`}>
                                    {c.cell_status}
                                </span>
                            </div>
                        </div>
                        <div className="action-wrap">
                            <span className="stage-pill">{c.stage}</span>
                            <button className="btn-call" onClick={() => alert(`Initiating follow-up call with ${c.name} (${c.phone})`)}>
                                Care Call
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .recent-first-timers-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 1.25rem;
                    padding: 1.5rem;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
                    margin-bottom: 1.5rem;
                }
                .portal-wrapper.dark-mode .recent-first-timers-card {
                    background: #151128;
                    border-color: rgba(255, 255, 255, 0.08);
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.25rem;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }
                .title {
                    font-size: 1.05rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0;
                }
                .portal-wrapper.dark-mode .title {
                    color: #f8fafc;
                }
                .subtitle {
                    font-size: 0.78rem;
                    color: #64748b;
                    margin: 0.15rem 0 0 0;
                }

                .btn-all-souls {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #2563eb;
                    background: #eff6ff;
                    border: 1px solid #bfdbfe;
                    border-radius: 0.5rem;
                    padding: 0.35rem 0.75rem;
                    cursor: pointer;
                }

                .converts-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .convert-item {
                    display: flex;
                    align-items: center;
                    gap: 0.85rem;
                    background: #f8fafc;
                    border-radius: 0.75rem;
                    padding: 0.75rem 1rem;
                    border: 1px solid #f1f5f9;
                }
                .portal-wrapper.dark-mode .convert-item {
                    background: rgba(255, 255, 255, 0.02);
                    border-color: rgba(255, 255, 255, 0.05);
                }
                .avatar-wrap {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: #3b82f6;
                    color: #ffffff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 0.9rem;
                }
                .info-wrap {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 0.15rem;
                }
                .name-row {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                }
                .c-name {
                    font-size: 0.88rem;
                    font-weight: 700;
                    color: #0f172a;
                }
                .portal-wrapper.dark-mode .c-name {
                    color: #f8fafc;
                }
                .c-date {
                    font-size: 0.72rem;
                    color: #64748b;
                }
                .meta-row {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    font-size: 0.75rem;
                }
                .c-phone {
                    color: #64748b;
                }
                .dot { color: #cbd5e1; }
                .cell-tag.ok {
                    color: #059669;
                    font-weight: 600;
                }
                .cell-tag.pending {
                    color: #d97706;
                    font-weight: 600;
                }

                .action-wrap {
                    display: flex;
                    align-items: center;
                    gap: 0.65rem;
                }
                .stage-pill {
                    font-size: 0.7rem;
                    font-weight: 700;
                    background: #eff6ff;
                    color: #2563eb;
                    padding: 0.2rem 0.55rem;
                    border-radius: 9999px;
                }
                .btn-call {
                    font-size: 0.75rem;
                    font-weight: 700;
                    background: #10b981;
                    color: #ffffff;
                    border: none;
                    border-radius: 0.5rem;
                    padding: 0.35rem 0.75rem;
                    cursor: pointer;
                    transition: background 0.15s ease;
                }
                .btn-call:hover {
                    background: #059669;
                }
            `}</style>
        </div>
    );
};

export default RecentFirstTimersQueue;
