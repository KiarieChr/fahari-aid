import React, { useState, useEffect } from 'react';
import { fetchOrders, updateOrderStatus } from '../../../services/merchandiseApi';

const OrdersDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        const data = await fetchOrders();
        setOrders(data);
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        const result = await updateOrderStatus(orderId, newStatus);
        if (result.success !== false) {
            const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
            setOrders(updatedOrders);
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
            showToast(`Order status updated to ${newStatus}`);
        } else {
            showToast("Failed to update status.", "error");
        }
    };

    const getStatusColorClass = (status) => {
        switch(status.toLowerCase()) {
            case 'pending': return 'status-pending';
            case 'processing': return 'status-processing';
            case 'completed': return 'status-completed';
            default: return 'status-default';
        }
    };

    return (
        <div className="admin-orders-page">
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">Order Fulfillment</h1>
                    <p className="admin-subtitle">Manage and track customer purchases</p>
                </div>
            </div>

            {/* Orders Table */}
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th className="text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id} onClick={() => setSelectedOrder(order)}>
                                <td className="font-bold">{order.id}</td>
                                <td>
                                    <p className="font-bold">{order.customer_name}</p>
                                    <p className="text-muted">{order.customer_contact}</p>
                                </td>
                                <td className="text-muted">{new Date(order.created_at).toLocaleDateString()}</td>
                                <td className="price-text">Ksh {parseFloat(order.total_amount).toFixed(2)}</td>
                                <td>
                                    <span className={`status-badge ${getStatusColorClass(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="text-right">
                                    <button className="admin-text-btn">View</button>
                                </td>
                            </tr>
                        ))}
                        {orders.length === 0 && (
                            <tr>
                                <td colSpan="6" className="admin-empty-state">No orders found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-backdrop" onClick={() => setSelectedOrder(null)}></div>
                    <div className="admin-modal">
                        <div className="admin-modal-header">
                            <div>
                                <h2>Order {selectedOrder.id}</h2>
                                <p className="admin-subtitle mt-1">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="admin-modal-close">✕</button>
                        </div>
                        
                        <div className="admin-modal-body">
                            <div className="order-info-grid">
                                <div>
                                    <p className="info-label">Customer Info</p>
                                    <p className="info-value">{selectedOrder.customer_name}</p>
                                    <p className="info-sub">{selectedOrder.customer_contact}</p>
                                </div>
                                <div>
                                    <p className="info-label">Current Status</p>
                                    <span className={`status-badge mt-1 ${getStatusColorClass(selectedOrder.status)}`}>
                                        {selectedOrder.status}
                                    </span>
                                </div>
                            </div>

                            <h3 className="section-title">Order Items</h3>
                            <div className="order-items-list">
                                {selectedOrder.items?.map((item, idx) => (
                                    <div key={idx} className="order-item-row">
                                        <div>
                                            <p className="item-name">{item.product_name}</p>
                                            <p className="item-meta">{item.color} | Size: {item.size}</p>
                                        </div>
                                        <div className="item-price-block">
                                            <p className="item-qty">{item.quantity} x Ksh {parseFloat(item.price).toFixed(2)}</p>
                                            <p className="item-total">Ksh {(item.quantity * item.price).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="order-total-row">
                                <span className="total-label">Total Amount</span>
                                <span className="total-value">Ksh {parseFloat(selectedOrder.total_amount).toFixed(2)}</span>
                            </div>
                        </div>
                        
                        <div className="admin-modal-footer">
                            <div className="status-actions">
                                <button 
                                    onClick={() => handleUpdateStatus(selectedOrder.id, 'Processing')} 
                                    disabled={selectedOrder.status === 'Processing'} 
                                    className="status-btn processing-btn"
                                >
                                    Mark Processing
                                </button>
                                <button 
                                    onClick={() => handleUpdateStatus(selectedOrder.id, 'Completed')} 
                                    disabled={selectedOrder.status === 'Completed'} 
                                    className="status-btn completed-btn"
                                >
                                    Mark Completed
                                </button>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="admin-btn-secondary">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <div style={{
                    position: 'fixed', bottom: '20px', right: '20px', padding: '12px 24px', 
                    borderRadius: '8px', color: '#fff', fontWeight: '500', zIndex: 9999,
                    background: toast.type === 'error' ? 'rgba(239,68,68,0.95)' : 'rgba(34,197,94,0.95)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                    animation: 'fadeIn 0.3s'
                }}>
                    {toast.message}
                </div>
            )}

            <style>{`
                .admin-orders-page {
                    font-family: 'Inter', sans-serif;
                    color: #fff;
                    padding: 10px;
                }
                .admin-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                }
                .admin-title {
                    font-size: 24px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin: 0 0 5px 0;
                    color: #fff;
                }
                .admin-subtitle {
                    font-size: 12px;
                    color: rgba(255,255,255,0.5);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin: 0;
                }
                
                /* Table Styles */
                .admin-table-container {
                    background: #161226;
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                }
                .admin-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                }
                .admin-table th {
                    background: rgba(255,255,255,0.02);
                    padding: 16px 20px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    color: rgba(255,255,255,0.4);
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .admin-table td {
                    padding: 16px 20px;
                    border-bottom: 1px solid rgba(255,255,255,0.03);
                    vertical-align: middle;
                }
                .admin-table tbody tr {
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .admin-table tbody tr:hover {
                    background: rgba(255,255,255,0.02);
                }
                .admin-table tbody tr:last-child td {
                    border-bottom: none;
                }
                .text-right { text-align: right; }
                .font-bold { font-weight: 700; font-size: 14px; margin: 0; }
                .text-muted { color: rgba(255,255,255,0.5); font-size: 12px; margin: 4px 0 0 0; }
                .price-text { color: #22c1e6; font-weight: 800; font-size: 15px; }

                /* Status Badges */
                .status-badge {
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 10px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    border: 1px solid transparent;
                    display: inline-block;
                }
                .status-pending { background: rgba(234, 179, 8, 0.15); color: #facc15; border-color: rgba(234, 179, 8, 0.3); }
                .status-processing { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border-color: rgba(56, 189, 248, 0.3); }
                .status-completed { background: rgba(74, 222, 128, 0.15); color: #4ade80; border-color: rgba(74, 222, 128, 0.3); }
                .status-default { background: rgba(255,255,255,0.1); color: #fff; }

                .admin-text-btn {
                    background: transparent;
                    border: none;
                    color: #22c1e6;
                    font-size: 12px;
                    font-weight: 700;
                    text-transform: uppercase;
                    cursor: pointer;
                }
                .admin-text-btn:hover { text-decoration: underline; }

                /* Modal */
                .admin-modal-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }
                .admin-modal-backdrop {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.8);
                    backdrop-filter: blur(5px);
                }
                .admin-modal {
                    position: relative;
                    width: 100%;
                    max-width: 650px;
                    background: #161226;
                    border-radius: 20px;
                    border: 1px solid rgba(255,255,255,0.1);
                    display: flex;
                    flex-direction: column;
                    max-height: 90vh;
                    box-shadow: 0 25px 50px rgba(0,0,0,0.5);
                }
                .admin-modal-header {
                    padding: 24px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    background: rgba(255,255,255,0.02);
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    border-top-left-radius: 20px;
                    border-top-right-radius: 20px;
                }
                .admin-modal-header h2 {
                    margin: 0;
                    font-size: 20px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                }
                .admin-modal-close {
                    background: none;
                    border: none;
                    color: rgba(255,255,255,0.4);
                    font-size: 24px;
                    cursor: pointer;
                    line-height: 1;
                }
                .admin-modal-close:hover { color: #fff; }
                
                .admin-modal-body {
                    padding: 24px;
                    overflow-y: auto;
                    flex: 1;
                }
                .order-info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                    margin-bottom: 30px;
                }
                .info-label {
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: rgba(255,255,255,0.4);
                    margin: 0 0 8px 0;
                    letter-spacing: 1px;
                }
                .info-value {
                    font-size: 16px;
                    font-weight: 700;
                    margin: 0 0 4px 0;
                }
                .info-sub {
                    font-size: 13px;
                    color: rgba(255,255,255,0.5);
                    margin: 0;
                }

                .section-title {
                    font-size: 13px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin: 0 0 16px 0;
                    padding-bottom: 8px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .order-items-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .order-item-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.05);
                    padding: 16px;
                    border-radius: 12px;
                }
                .item-name {
                    font-size: 14px;
                    font-weight: 700;
                    text-transform: uppercase;
                    margin: 0 0 6px 0;
                }
                .item-meta {
                    font-size: 11px;
                    color: rgba(255,255,255,0.5);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin: 0;
                }
                .item-price-block {
                    text-align: right;
                }
                .item-qty {
                    font-size: 13px;
                    color: rgba(255,255,255,0.8);
                    margin: 0 0 4px 0;
                }
                .item-total {
                    font-size: 16px;
                    font-weight: 800;
                    color: #22c1e6;
                    margin: 0;
                }

                .order-total-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 24px;
                    padding-top: 24px;
                    border-top: 1px solid rgba(255,255,255,0.05);
                }
                .total-label {
                    font-size: 14px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: rgba(255,255,255,0.5);
                }
                .total-value {
                    font-size: 24px;
                    font-weight: 900;
                    color: #fff;
                }

                .admin-modal-footer {
                    padding: 24px;
                    border-top: 1px solid rgba(255,255,255,0.05);
                    background: rgba(0,0,0,0.2);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom-left-radius: 20px;
                    border-bottom-right-radius: 20px;
                }
                .status-actions {
                    display: flex;
                    gap: 12px;
                }
                .status-btn {
                    padding: 10px 16px;
                    border-radius: 8px;
                    font-size: 11px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    cursor: pointer;
                    border: none;
                    transition: all 0.2s;
                }
                .status-btn:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }
                .processing-btn {
                    background: rgba(56, 189, 248, 0.15);
                    color: #38bdf8;
                }
                .processing-btn:hover:not(:disabled) { background: rgba(56, 189, 248, 0.25); }
                
                .completed-btn {
                    background: rgba(74, 222, 128, 0.15);
                    color: #4ade80;
                }
                .completed-btn:hover:not(:disabled) { background: rgba(74, 222, 128, 0.25); }

                .admin-btn-secondary {
                    background: transparent;
                    color: rgba(255,255,255,0.6);
                    border: 1px solid rgba(255,255,255,0.1);
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .admin-btn-secondary:hover {
                    background: rgba(255,255,255,0.05);
                    color: #fff;
                }
                
                @media (max-width: 768px) {
                    .admin-table-container {
                        overflow-x: auto;
                    }
                    .admin-table {
                        min-width: 600px;
                    }
                    .order-info-grid {
                        grid-template-columns: 1fr;
                    }
                    .admin-modal-footer {
                        flex-direction: column;
                        gap: 16px;
                        align-items: stretch;
                    }
                    .status-actions {
                        flex-direction: column;
                    }
                }
            `}</style>
        </div>
    );
};

export default OrdersDashboard;
