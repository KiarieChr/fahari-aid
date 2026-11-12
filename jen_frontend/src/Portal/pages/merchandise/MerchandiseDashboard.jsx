import React, { useState, useEffect } from 'react';
import { fetchProducts, createProduct, getImageUrl, getFullImageUrl } from '../../../services/merchandiseApi';

const MerchandiseDashboard = () => {
    const [products, setProducts] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const [editingProductId, setEditingProductId] = useState(null);
    
    // New Product State
    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        base_price: '',
        image: null,
        image_url: ''
    });
    const [variants, setVariants] = useState([{ 
        color: '', 
        size: '', 
        price_adjustment: '0.00', 
        stock: 10,
        image_url: '',
        image_file: null,
        image_preview: ''
    }]);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        const data = await fetchProducts();
        setProducts(data);
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleAddVariant = () => {
        setVariants([...variants, { 
            color: '', 
            size: '', 
            price_adjustment: '0.00', 
            stock: 10,
            image_url: '',
            image_file: null,
            image_preview: ''
        }]);
    };

    const handleRemoveVariant = (index) => {
        const newVariants = [...variants];
        newVariants.splice(index, 1);
        setVariants(newVariants);
    };

    const handleVariantChange = (index, field, value) => {
        const newVariants = [...variants];
        newVariants[index][field] = value;
        setVariants(newVariants);
    };

    const handleVariantImageChange = (index, file) => {
        if (!file) return;
        const newVariants = [...variants];
        newVariants[index].image_file = file;
        newVariants[index].image_preview = URL.createObjectURL(file);
        setVariants(newVariants);
    };

    const handleRemoveVariantImage = (index) => {
        const newVariants = [...variants];
        newVariants[index].image_file = null;
        newVariants[index].image_url = '';
        newVariants[index].image_preview = '';
        setVariants(newVariants);
    };

    const handleEditProduct = (product) => {
        setEditingProductId(product.id);
        setNewProduct({
            name: product.name,
            description: product.description,
            base_price: product.base_price,
            image: null,
            image_url: product.image_url || ''
        });
        
        if (product.variants && product.variants.length > 0) {
            setVariants(product.variants.map(v => ({
                id: v.id,
                color: v.color,
                size: v.size,
                price_adjustment: v.price,
                stock: v.stock_quantity !== undefined ? v.stock_quantity : (v.stock || 10),
                image_url: v.image_url || '',
                image_file: null,
                image_preview: ''
            })));
        } else {
            setVariants([{ 
                color: '', 
                size: '', 
                price_adjustment: '0.00', 
                stock: 10,
                image_url: '',
                image_file: null,
                image_preview: ''
            }]);
        }
        setIsAddModalOpen(true);
    };

    const handleOpenAddModal = () => {
        setEditingProductId(null);
        setNewProduct({ name: '', description: '', base_price: '', image: null, image_url: '' });
        setVariants([{ 
            color: '', 
            size: '', 
            price_adjustment: '0.00', 
            stock: 10,
            image_url: '',
            image_file: null,
            image_preview: ''
        }]);
        setIsAddModalOpen(true);
    };

    const handleSaveProduct = async () => {
        if (!newProduct.name || !newProduct.base_price) return showToast("Name and Base Price are required.", "error");
        
        const formData = new FormData();
        if (editingProductId) {
            formData.append('product_id', editingProductId);
        }
        formData.append('name', newProduct.name);
        formData.append('description', newProduct.description);
        formData.append('base_price', newProduct.base_price);
        if (newProduct.image) {
            formData.append('image', newProduct.image);
        }
        
        const validVariants = variants.filter(v => v.color && v.size);
        const serializedVariants = validVariants.map((v, idx) => {
            let imageKey = null;
            if (v.image_file instanceof File) {
                imageKey = `variant_image_${idx}`;
                formData.append(imageKey, v.image_file);
            }
            return {
                id: v.id,
                color: v.color,
                size: v.size,
                price_adjustment: v.price_adjustment,
                stock: v.stock,
                image_url: v.image_url || '',
                image_key: imageKey
            };
        });
        formData.append('variants', JSON.stringify(serializedVariants));
        
        const result = await createProduct(formData);
        if (result.success) {
            showToast(editingProductId ? "Product updated successfully!" : "Product added successfully!");
            setIsAddModalOpen(false);
            setEditingProductId(null);
            setNewProduct({ name: '', description: '', base_price: '', image: null, image_url: '' });
            setVariants([{ 
                color: '', 
                size: '', 
                price_adjustment: '0.00', 
                stock: 10,
                image_url: '',
                image_file: null,
                image_preview: ''
            }]);
            loadProducts();
        } else {
            showToast("Failed to save product: " + result.error, "error");
        }
    };

    return (
        <div className="admin-merch-page">
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">Store Inventory</h1>
                    <p className="admin-subtitle">Manage your merchandise and variants</p>
                </div>
                <button onClick={handleOpenAddModal} className="admin-btn-primary">
                    <span className="icon">+</span> Add New Item
                </button>
            </div>

            {/* Inventory Grid */}
            <div className="admin-grid">
                {products.map(product => (
                    <div key={product.id} className="admin-card">
                        <div className="admin-card-img-wrap">
                            <img src={getFullImageUrl(product.image_url)} alt={product.name} className="admin-card-img" />
                        </div>
                        <div className="admin-card-body">
                            <h3 className="admin-card-title">{product.name}</h3>
                            <div className="admin-card-footer">
                                <span className="admin-card-price">Ksh {parseFloat(product.base_price).toFixed(2)}</span>
                                <span className="admin-card-badge">
                                    {product.variants?.length || 0} Variants
                                </span>
                            </div>

                            {/* Variant Preview Chips */}
                            {product.variants && product.variants.length > 0 && (
                                <div className="admin-card-variants-pills">
                                    {product.variants.slice(0, 4).map((vr, vIdx) => (
                                        <span key={vIdx} className="admin-variant-chip" title={`${vr.color} (${vr.size}) - Stock: ${vr.stock_quantity ?? vr.stock ?? 0}`}>
                                            {vr.image_url && (
                                                <img src={getFullImageUrl(vr.image_url)} alt="" className="admin-variant-chip-img" />
                                            )}
                                            <span>{vr.color} ({vr.size})</span>
                                        </span>
                                    ))}
                                    {product.variants.length > 4 && (
                                        <span className="admin-variant-chip-more">+{product.variants.length - 4}</span>
                                    )}
                                </div>
                            )}

                            <button onClick={() => handleEditProduct(product)} className="admin-btn-secondary" style={{ width: '100%', marginTop: '15px' }}>
                                Edit Product
                            </button>
                        </div>
                    </div>
                ))}
                {products.length === 0 && (
                    <div className="admin-empty-state">
                        <p>No merchandise found. Click "Add New Item" to create one.</p>
                    </div>
                )}
            </div>

            {/* Add / Edit Product Modal */}
            {isAddModalOpen && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-backdrop" onClick={() => setIsAddModalOpen(false)}></div>
                    <div className="admin-modal">
                        <div className="admin-modal-header">
                            <h2>{editingProductId ? "Edit Merchandise" : "Add New Merchandise"}</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="admin-modal-close">✕</button>
                        </div>
                        
                        <div className="admin-modal-body">
                            <div className="admin-form-row">
                                <div className="admin-form-group full-width">
                                    <label>Product Name</label>
                                    <input type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="e.g. Kingdom Hoodie" />
                                </div>
                            </div>
                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label>Base Price (Ksh)</label>
                                    <input type="number" step="0.01" value={newProduct.base_price} onChange={e => setNewProduct({...newProduct, base_price: e.target.value})} placeholder="4500.00" />
                                </div>
                                <div className="admin-form-group">
                                    <label>Main Product Image</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {(newProduct.image || newProduct.image_url) && (
                                            <img 
                                                src={newProduct.image ? URL.createObjectURL(newProduct.image) : getFullImageUrl(newProduct.image_url)} 
                                                alt="Preview" 
                                                style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }} 
                                            />
                                        )}
                                        <input type="file" accept="image/*" onChange={e => setNewProduct({...newProduct, image: e.target.files[0]})} />
                                    </div>
                                </div>
                            </div>
                            <div className="admin-form-row">
                                <div className="admin-form-group full-width">
                                    <label>Description</label>
                                    <textarea rows="3" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} placeholder="Product details..."></textarea>
                                </div>
                            </div>

                            <div className="admin-variants-section">
                                <div className="admin-variants-header">
                                    <div>
                                        <h3>Variants Builder (Image / Color / Size)</h3>
                                        <p style={{ margin: '3px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>
                                            Upload a unique image for each variant (or leave blank to use the main product image).
                                        </p>
                                    </div>
                                    <button onClick={handleAddVariant} className="admin-text-btn">+ Add Variant</button>
                                </div>
                                
                                <div className="admin-variants-list">
                                    {variants.map((v, idx) => {
                                        const variantImgSrc = v.image_preview || (v.image_url ? getFullImageUrl(v.image_url) : '');
                                        return (
                                            <div key={idx} className="admin-variant-row">
                                                {/* Variant Image Uploader */}
                                                <div className="variant-col-img">
                                                    <label className="variant-img-uploader" title={variantImgSrc ? "Change variant image" : "Upload variant image"}>
                                                        <input 
                                                            type="file" 
                                                            accept="image/*" 
                                                            style={{ display: 'none' }}
                                                            onChange={e => {
                                                                if (e.target.files && e.target.files[0]) {
                                                                    handleVariantImageChange(idx, e.target.files[0]);
                                                                }
                                                            }} 
                                                        />
                                                        {variantImgSrc ? (
                                                            <div className="variant-img-preview-wrap">
                                                                <img src={variantImgSrc} alt={`Variant ${v.color}`} className="variant-img-thumb" />
                                                                <span className="variant-img-edit-badge" title="Change">✎</span>
                                                            </div>
                                                        ) : (
                                                            <div className="variant-img-placeholder">
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                                                    <circle cx="8.5" cy="8.5" r="1.5"/>
                                                                    <polyline points="21 15 16 10 5 21"/>
                                                                </svg>
                                                                <span className="variant-img-label">+Img</span>
                                                            </div>
                                                        )}
                                                    </label>
                                                    {variantImgSrc && (
                                                        <button 
                                                            type="button" 
                                                            onClick={() => handleRemoveVariantImage(idx)} 
                                                            className="variant-img-remove-btn" 
                                                            title="Clear variant image"
                                                        >
                                                            ✕
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="variant-col">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Color (e.g. Navy Blue)" 
                                                        value={v.color} 
                                                        onChange={e => handleVariantChange(idx, 'color', e.target.value)} 
                                                    />
                                                </div>
                                                <div className="variant-col small">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Size (XL)" 
                                                        value={v.size} 
                                                        onChange={e => handleVariantChange(idx, 'size', e.target.value)} 
                                                    />
                                                </div>
                                                <div className="variant-col small">
                                                    <input 
                                                        type="number" 
                                                        step="0.01" 
                                                        placeholder="+Price" 
                                                        value={v.price_adjustment} 
                                                        onChange={e => handleVariantChange(idx, 'price_adjustment', e.target.value)} 
                                                    />
                                                </div>
                                                <div className="variant-col small">
                                                    <input 
                                                        type="number" 
                                                        placeholder="Stock" 
                                                        value={v.stock} 
                                                        onChange={e => handleVariantChange(idx, 'stock', e.target.value)} 
                                                    />
                                                </div>
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleRemoveVariant(idx)} 
                                                    className="variant-remove-btn" 
                                                    title="Remove variant"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        
                        <div className="admin-modal-footer">
                            <button onClick={() => setIsAddModalOpen(false)} className="admin-btn-secondary">Cancel</button>
                            <button onClick={handleSaveProduct} className="admin-btn-primary">Save Product</button>
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
                .admin-merch-page {
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
                
                /* Buttons */
                .admin-btn-primary {
                    background: linear-gradient(135deg, #22c1e6 0%, #1aa3c4 100%);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 13px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    box-shadow: 0 4px 15px rgba(34, 193, 230, 0.3);
                    transition: all 0.3s ease;
                }
                .admin-btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(34, 193, 230, 0.4);
                }
                .admin-btn-secondary {
                    background: transparent;
                    color: rgba(255,255,255,0.6);
                    border: 1px solid rgba(255,255,255,0.1);
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 13px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .admin-btn-secondary:hover {
                    background: rgba(255,255,255,0.05);
                    color: #fff;
                }
                .admin-text-btn {
                    background: transparent;
                    border: none;
                    color: #22c1e6;
                    font-size: 12px;
                    font-weight: 700;
                    text-transform: uppercase;
                    cursor: pointer;
                }
                .admin-text-btn:hover {
                    text-decoration: underline;
                }

                /* Grid & Cards */
                .admin-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 24px;
                }
                .admin-card {
                    background: #161226;
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 16px;
                    overflow: hidden;
                    transition: all 0.3s ease;
                }
                .admin-card:hover {
                    border-color: rgba(34, 193, 230, 0.3);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                    transform: translateY(-5px);
                }
                .admin-card-img-wrap {
                    aspect-ratio: 1;
                    background: rgba(255,255,255,0.02);
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .admin-card-img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }
                .admin-card-body {
                    padding: 20px;
                    border-top: 1px solid rgba(255,255,255,0.05);
                }
                .admin-card-title {
                    margin: 0 0 10px 0;
                    font-size: 15px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .admin-card-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .admin-card-price {
                    color: #22c1e6;
                    font-weight: 800;
                    font-size: 18px;
                }
                .admin-card-badge {
                    background: rgba(255,255,255,0.05);
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: rgba(255,255,255,0.6);
                }
                .admin-empty-state {
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 60px;
                    background: rgba(255,255,255,0.02);
                    border-radius: 16px;
                    border: 1px dashed rgba(255,255,255,0.1);
                    color: rgba(255,255,255,0.5);
                    font-style: italic;
                }

                .admin-card-variants-pills {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                    margin-top: 12px;
                }
                .admin-variant-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    padding: 3px 8px;
                    border-radius: 12px;
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.7);
                }
                .admin-variant-chip-img {
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    object-fit: cover;
                }
                .admin-variant-chip-more {
                    font-size: 10px;
                    color: rgba(255, 255, 255, 0.4);
                    align-self: center;
                    font-weight: 600;
                }

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
                    max-width: 780px;
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
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .admin-modal-header h2 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .admin-modal-close {
                    background: none;
                    border: none;
                    color: rgba(255,255,255,0.4);
                    font-size: 20px;
                    cursor: pointer;
                }
                .admin-modal-close:hover {
                    color: #fff;
                }
                .admin-modal-body {
                    padding: 24px;
                    overflow-y: auto;
                    flex: 1;
                }
                .admin-form-row {
                    display: flex;
                    gap: 20px;
                    margin-bottom: 20px;
                }
                .admin-form-group {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                .admin-form-group.full-width {
                    width: 100%;
                }
                .admin-form-group label {
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: rgba(255,255,255,0.5);
                    margin-bottom: 8px;
                    letter-spacing: 1px;
                }
                .admin-form-group input, .admin-form-group textarea {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.1);
                    padding: 12px 16px;
                    border-radius: 8px;
                    color: #fff;
                    font-family: inherit;
                    font-size: 14px;
                    outline: none;
                    transition: border-color 0.3s;
                }
                .admin-form-group input:focus, .admin-form-group textarea:focus {
                    border-color: #22c1e6;
                }
                
                /* Variants Builder */
                .admin-variants-section {
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid rgba(255,255,255,0.05);
                }
                .admin-variants-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }
                .admin-variants-header h3 {
                    margin: 0;
                    font-size: 13px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: rgba(255,255,255,0.8);
                }
                .admin-variant-row {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 15px;
                    align-items: center;
                }
                .variant-col-img {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    flex-shrink: 0;
                }
                .variant-img-uploader {
                    position: relative;
                    width: 44px;
                    height: 44px;
                    border-radius: 8px;
                    border: 1px dashed rgba(255, 255, 255, 0.25);
                    background: rgba(255, 255, 255, 0.03);
                    cursor: pointer;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }
                .variant-img-uploader:hover {
                    border-color: #22c1e6;
                    background: rgba(34, 193, 230, 0.08);
                }
                .variant-img-preview-wrap {
                    position: relative;
                    width: 100%;
                    height: 100%;
                }
                .variant-img-thumb {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                }
                .variant-img-edit-badge {
                    position: absolute;
                    bottom: 2px;
                    right: 2px;
                    background: rgba(0, 0, 0, 0.7);
                    color: #22c1e6;
                    font-size: 10px;
                    padding: 1px 3px;
                    border-radius: 3px;
                    line-height: 1;
                }
                .variant-img-placeholder {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: rgba(255, 255, 255, 0.4);
                    gap: 2px;
                }
                .variant-img-label {
                    font-size: 8px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .variant-img-remove-btn {
                    background: rgba(239, 68, 68, 0.15);
                    color: #ef4444;
                    border: none;
                    border-radius: 50%;
                    width: 18px;
                    height: 18px;
                    font-size: 10px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                    transition: background 0.2s;
                }
                .variant-img-remove-btn:hover {
                    background: rgba(239, 68, 68, 0.35);
                }
                .variant-col {
                    flex: 1;
                }
                .variant-col.small {
                    flex: 0 0 90px;
                }
                .variant-col input {
                    width: 100%;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.1);
                    padding: 10px 12px;
                    border-radius: 6px;
                    color: #fff;
                    font-size: 13px;
                    outline: none;
                }
                .variant-col input:focus {
                    border-color: #22c1e6;
                }
                .variant-remove-btn {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                    border: none;
                    width: 32px;
                    height: 32px;
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .variant-remove-btn:hover {
                    background: rgba(239, 68, 68, 0.2);
                }

                .admin-modal-footer {
                    padding: 24px;
                    border-top: 1px solid rgba(255,255,255,0.05);
                    background: rgba(0,0,0,0.2);
                    display: flex;
                    justify-content: flex-end;
                    gap: 15px;
                    border-bottom-left-radius: 20px;
                    border-bottom-right-radius: 20px;
                }

                @media (max-width: 768px) {
                    .admin-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 15px;
                    }
                    .admin-form-row {
                        flex-direction: column;
                        gap: 15px;
                    }
                    .admin-variant-row {
                        flex-wrap: wrap;
                    }
                    .variant-col.small {
                        flex: 1;
                    }
                }
            `}</style>
        </div>
    );
};

export default MerchandiseDashboard;
