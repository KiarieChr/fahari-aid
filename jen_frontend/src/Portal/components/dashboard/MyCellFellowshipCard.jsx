import React from 'react';

const MyCellFellowshipCard = ({ cell }) => {
    const cellName = cell?.name || 'Grace Fellowship Cell';
    const cellCode = cell?.code || 'GFC-01';
    const leader = cell?.leader || 'James Kiarie';
    const meetingDay = cell?.meeting_day || 'Every Wednesday';
    const meetingTime = cell?.meeting_time || '6:00 PM';
    const location = cell?.location || 'Ruiru Fellowship Center';

    return (
        <div className="my-cell-card">
            <div className="card-top">
                <div className="badge-tag">My Small Group Community</div>
                <span className="code-pill">{cellCode}</span>
            </div>

            <div className="cell-main-info">
                <div className="cell-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                </div>
                <div>
                    <h3 className="cell-title">{cellName}</h3>
                    <p className="cell-leader">Led by <span className="leader-name">{leader}</span></p>
                </div>
            </div>

            <div className="cell-schedule-strip">
                <div className="schedule-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{meetingDay} • {meetingTime}</span>
                </div>
                <div className="schedule-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>{location}</span>
                </div>
            </div>

            <div className="card-actions">
                <button className="btn-cell-action primary" onClick={() => alert(`Next fellowship is ${meetingDay} at ${meetingTime}!`)}>
                    Next Fellowship Info
                </button>
                <button className="btn-cell-action secondary" onClick={() => alert(`Connect with cell leader: ${leader}`)}>
                    Contact Leader
                </button>
            </div>

            <style>{`
                .my-cell-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 1.25rem;
                    padding: 1.5rem;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
                    margin-bottom: 1.5rem;
                }
                .portal-wrapper.dark-mode .my-cell-card {
                    background: #151128;
                    border-color: rgba(255, 255, 255, 0.08);
                }

                .card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }
                .badge-tag {
                    font-size: 0.7rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    background: #eff6ff;
                    color: #2563eb;
                    padding: 0.2rem 0.6rem;
                    border-radius: 9999px;
                    letter-spacing: 0.04em;
                }
                .code-pill {
                    font-size: 0.72rem;
                    font-weight: 700;
                    color: #64748b;
                    background: #f1f5f9;
                    padding: 0.15rem 0.5rem;
                    border-radius: 0.4rem;
                }
                .portal-wrapper.dark-mode .code-pill {
                    background: rgba(255, 255, 255, 0.06);
                    color: #94a3b8;
                }

                .cell-main-info {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1.25rem;
                }
                .cell-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 1rem;
                    background: #eff6ff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .portal-wrapper.dark-mode .cell-icon {
                    background: rgba(37, 99, 235, 0.15);
                }
                .cell-title {
                    font-size: 1.2rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0 0 0.2rem 0;
                }
                .portal-wrapper.dark-mode .cell-title {
                    color: #f8fafc;
                }
                .cell-leader {
                    font-size: 0.85rem;
                    color: #64748b;
                    margin: 0;
                }
                .leader-name {
                    font-weight: 700;
                    color: #2563eb;
                }

                .cell-schedule-strip {
                    display: flex;
                    flex-direction: column;
                    gap: 0.6rem;
                    background: #f8fafc;
                    border-radius: 0.75rem;
                    padding: 0.85rem 1rem;
                    margin-bottom: 1.25rem;
                }
                .portal-wrapper.dark-mode .cell-schedule-strip {
                    background: rgba(255, 255, 255, 0.02);
                }
                .schedule-item {
                    display: flex;
                    align-items: center;
                    gap: 0.65rem;
                    font-size: 0.85rem;
                    color: #334155;
                    font-weight: 500;
                }
                .portal-wrapper.dark-mode .schedule-item {
                    color: #cbd5e1;
                }

                .card-actions {
                    display: flex;
                    gap: 0.75rem;
                }
                .btn-cell-action {
                    flex: 1;
                    padding: 0.6rem 0.85rem;
                    border-radius: 0.75rem;
                    font-size: 0.82rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    border: none;
                }
                .btn-cell-action.primary {
                    background: #2563eb;
                    color: #ffffff;
                }
                .btn-cell-action.primary:hover {
                    background: #1d4ed8;
                }
                .btn-cell-action.secondary {
                    background: #f1f5f9;
                    color: #475569;
                    border: 1px solid #e2e8f0;
                }
                .portal-wrapper.dark-mode .btn-cell-action.secondary {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.1);
                    color: #cbd5e1;
                }
            `}</style>
        </div>
    );
};

export default MyCellFellowshipCard;
