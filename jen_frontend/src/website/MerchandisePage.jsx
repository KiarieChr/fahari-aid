import React, { useState, useEffect, useMemo } from 'react';
import { fetchProducts, createOrder, getImageUrl } from '../services/merchandiseApi';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const MerchandisePage = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

  // TASK 1: Flattened image map across all variants with fallback to main product image
  const galleryImages = useMemo(() => {
    if (!selectedProduct) return [];

    const images = [];
    const fallbackUrl = selectedProduct.image_url || '';

    if (selectedProduct.variants && selectedProduct.variants.length > 0) {
      selectedProduct.variants.forEach(variant => {
        if (Array.isArray(variant.images) && variant.images.length > 0) {
          variant.images.forEach(img => {
            images.push({
              url: typeof img === 'string' ? img : img.url || fallbackUrl,
              variantId: variant.id,
              color: variant.color,
              size: variant.size
            });
          });
        } else if (variant.image_url) {
          images.push({
            url: variant.image_url,
            variantId: variant.id,
            color: variant.color,
            size: variant.size
          });
        } else {
          images.push({
            url: fallbackUrl,
            variantId: variant.id,
            color: variant.color,
            size: variant.size
          });
        }
      });
    } else if (fallbackUrl) {
      images.push({
        url: fallbackUrl,
        variantId: null,
        color: '',
        size: ''
      });
    }

    return images;
  }, [selectedProduct]);

  // TASK 3: When variant dropdown changes, snap to that variant's first image
  const handleVariantChange = (variantId) => {
    setSelectedVariant(variantId);
    const targetIndex = galleryImages.findIndex(img => img.variantId == variantId);
    if (targetIndex !== -1) {
      setActiveImageIndex(targetIndex);
    }
  };

  // TASK 2: Swipe / navigation handler syncing active index to variant dropdown
  const goToImageIndex = (newIndex) => {
    if (galleryImages.length === 0) return;
    let targetIndex = newIndex;
    if (targetIndex < 0) targetIndex = galleryImages.length - 1;
    if (targetIndex >= galleryImages.length) targetIndex = 0;

    setActiveImageIndex(targetIndex);

    const newImage = galleryImages[targetIndex];
    if (newImage && newImage.variantId && newImage.variantId != selectedVariant) {
      setSelectedVariant(newImage.variantId);
    }
  };

  const handlePrevImage = () => {
    goToImageIndex(activeImageIndex - 1);
  };

  const handleNextImage = () => {
    goToImageIndex(activeImageIndex + 1);
  };

  // Swipe gesture detection
  const minSwipeDistance = 40;

  const onTouchStart = (e) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    if (distance > minSwipeDistance) {
      handleNextImage(); // Swiped left -> next
    } else if (distance < -minSwipeDistance) {
      handlePrevImage(); // Swiped right -> prev
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  const openModal = (product) => {
    setSelectedProduct(product);
    setSelectedVariant(product.variants && product.variants.length > 0 ? product.variants[0].id : '');
    setActiveImageIndex(0);
    setQuantity(1);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const addToCart = () => {
    if (!selectedVariant) return showToast("Please select a variant.", "error");
    const variantObj = selectedProduct.variants.find(v => v.id == selectedVariant);
    if (!variantObj) return;

    const cartItem = {
      variant_id: variantObj.id,
      productName: selectedProduct.name,
      color: variantObj.color,
      size: variantObj.size,
      price: parseFloat(variantObj.price),
      quantity: parseInt(quantity)
    };

    setCart([...cart, cartItem]);
    setSelectedProduct(null);
    setIsCartOpen(true);
    showToast(`${selectedProduct.name} added to cart!`);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return showToast("Cart is empty", "error");
    if (!customerName || !customerContact) return showToast("Please fill in contact info", "error");

    const orderData = {
      customer_name: customerName,
      customer_contact: customerContact,
      items: cart
    };

    const result = await createOrder(orderData);
    if (result.success) {
      showToast("Order placed successfully! Order ID: " + result.order_id);
      setCart([]);
      setCustomerName('');
      setCustomerContact('');
      setIsCartOpen(false);
    } else {
      showToast("Failed to place order: " + result.error, "error");
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="merch-page">
      <Navbar />
      
      <div className="merch-content">
        
        {/* Floating Cart Button */}
        <button 
          onClick={() => setIsCartOpen(true)}
          className="merch-cart-btn"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
          {cart.length > 0 && (
            <span className="cart-badge">
              {cart.length}
            </span>
          )}
        </button>

        {/* Hero Section */}
        <div className="merch-hero-section">
            <div className="merch-hero-bg-particles">
                {[...Array(15)].map((_, i) => (
                    <div key={i} className={`merch-particle merch-particle-${i + 1}`}></div>
                ))}
            </div>
            <div className="merch-glow-effect merch-glow-1"></div>
            <div className="merch-glow-effect merch-glow-2"></div>

            <div className="merch-hero-container">
                <div className="merch-hero-grid">
                    <div className="merch-hero-left">
                        <div className="merch-eyebrow">
                            Kingdom Purpose Unity
                        </div>
                        <h1 className="merch-title">
                            Kingdom<br/>
                            <span className="merch-title-highlight">Apparel</span>
                        </h1>
                        <p className="merch-subtitle">
                            Wear your faith and represent the Jesus Enthroned Network. Premium quality gear for a generation transforming every sphere.
                        </p>
                        <button onClick={() => window.scrollTo({top: 800, behavior: 'smooth'})} className="merch-btn-primary">
                            <span>Shop Collection</span>
                            <span className="btn-shine"></span>
                        </button>
                    </div>
                    
                    <div className="merch-hero-right">
                        <div className="merch-collage-block">
                            <img src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Collection Models" className="merch-collage-img" />
                            <div className="merch-award-badge">
                                <div className="badge-ring-1">
                                    <div className="badge-ring-2">
                                        <div className="badge-text">
                                            <span className="sm">Support</span>
                                            <span className="lg">The</span>
                                            <span className="md">Ministry</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Feature Bar */}
        <div className="merch-feature-bar">
            <div className="merch-feature-container">
                <div className="merch-feature-item">
                    <span className="icon">👕</span>
                    <div className="text">
                        <h4>Premium Quality</h4>
                        <p>Built to Last</p>
                    </div>
                </div>
                <div className="merch-feature-item">
                    <span className="icon">⭐</span>
                    <div className="text">
                        <h4>Community</h4>
                        <p>Fan Favorites</p>
                    </div>
                </div>
                <div className="merch-feature-item">
                    <span className="icon">📦</span>
                    <div className="text">
                        <h4>New Arrivals</h4>
                        <p>Fresh Designs</p>
                    </div>
                </div>
                <div className="merch-feature-item">
                    <span className="icon">🙏</span>
                    <div className="text">
                        <h4>Global Impact</h4>
                        <p>Supporting Missions</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Product Grid */}
        <div className="merch-products-section">
            <div className="merch-products-grid">
            {products.map(product => (
                <div key={product.id} className="merch-product-card" onClick={() => openModal(product)}>
                <div className="merch-product-image-wrap">
                    {product.id % 2 !== 0 && (
                        <span className="merch-badge-new"><span className="dot"></span>New</span>
                    )}
                    <img src={getImageUrl(product.image_url) || 'https://via.placeholder.com/400?text=Merch'} alt={product.name} className="merch-product-img" />
                </div>
                <div className="merch-product-info">
                    <h2 className="merch-product-name">{product.name}</h2>
                    <p className="merch-product-price">Ksh {parseFloat(product.base_price).toFixed(2)}</p>
                </div>
                </div>
            ))}
            </div>
        </div>

        {/* Slide-out Cart Drawer */}
        {isCartOpen && (
            <div className="merch-cart-overlay">
            <div className="merch-cart-backdrop" onClick={() => setIsCartOpen(false)}></div>
            <div className="merch-cart-drawer">
                <div className="merch-cart-header">
                    <h2>Your Cart</h2>
                    <button onClick={() => setIsCartOpen(false)} className="merch-close-btn">✕</button>
                </div>
                
                {cart.length === 0 ? (
                    <p className="merch-empty-cart">Your bag is empty.</p>
                ) : (
                    <div className="merch-cart-items">
                    {cart.map((item, idx) => (
                        <div key={idx} className="merch-cart-item">
                        <div className="merch-cart-item-details">
                            <p className="merch-item-name">{item.productName}</p>
                            <p className="merch-item-meta">{item.color} | Size: {item.size}</p>
                            <p className="merch-item-qty">Qty: {item.quantity}</p>
                        </div>
                        <p className="merch-item-price">Ksh {(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                    ))}
                    </div>
                )}

                <div className="merch-cart-footer">
                    <div className="merch-cart-total">
                    <span>Total</span>
                    <span className="total-val">Ksh {cartTotal.toFixed(2)}</span>
                    </div>

                    <div className="merch-checkout-form">
                    <input type="text" placeholder="Your Name" value={customerName} onChange={e => setCustomerName(e.target.value)} className="merch-input" />
                    <input type="text" placeholder="Email or Phone" value={customerContact} onChange={e => setCustomerContact(e.target.value)} className="merch-input" />
                    
                    <button onClick={handleCheckout} className="merch-btn-primary full-width">
                        <span>Place Order Now</span>
                    </button>
                    <p className="merch-checkout-note">Pay securely later or via bank transfer.</p>
                    </div>
                </div>
            </div>
            </div>
        )}

        {/* Product Selection Modal */}
        {selectedProduct && (
            <div className="merch-modal-overlay">
            <div className="merch-modal-backdrop" onClick={() => setSelectedProduct(null)}></div>
            <div className="merch-modal-content">
                <button onClick={() => setSelectedProduct(null)} className="merch-modal-close">✕</button>
                
                <div className="merch-modal-left">
                    <div 
                        className="merch-gallery-container"
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    >
                        {galleryImages.length > 1 && (
                            <button 
                                type="button" 
                                onClick={handlePrevImage} 
                                className="merch-gallery-arrow merch-gallery-prev"
                                aria-label="Previous variant image"
                            >
                                ‹
                            </button>
                        )}

                        <div className="merch-gallery-slide">
                            <img 
                                src={getImageUrl(galleryImages[activeImageIndex]?.url) || 'https://via.placeholder.com/400?text=Merch'} 
                                alt={selectedProduct.name} 
                                className="merch-modal-img" 
                            />
                        </div>

                        {galleryImages.length > 1 && (
                            <button 
                                type="button" 
                                onClick={handleNextImage} 
                                className="merch-gallery-arrow merch-gallery-next"
                                aria-label="Next variant image"
                            >
                                ›
                            </button>
                        )}

                        {/* Tag displaying active variant color / size */}
                        {galleryImages.length > 0 && galleryImages[activeImageIndex]?.color && (
                            <div className="merch-gallery-tag">
                                {galleryImages[activeImageIndex].color} {galleryImages[activeImageIndex].size ? `• ${galleryImages[activeImageIndex].size}` : ''}
                            </div>
                        )}

                        {/* Dot indicators across all variant images */}
                        {galleryImages.length > 1 && (
                            <div className="merch-gallery-dots">
                                {galleryImages.map((img, idx) => (
                                    <span 
                                        key={idx} 
                                        onClick={() => goToImageIndex(idx)} 
                                        className={`merch-gallery-dot ${idx === activeImageIndex ? 'active' : ''}`}
                                        title={`${img.color} - ${img.size}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Thumbnail strip */}
                    {galleryImages.length > 1 && (
                        <div className="merch-gallery-thumbs">
                            {galleryImages.map((img, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => goToImageIndex(idx)} 
                                    className={`merch-thumb-wrap ${idx === activeImageIndex ? 'active' : ''}`}
                                >
                                    <img src={getImageUrl(img.url) || 'https://via.placeholder.com/400?text=Merch'} alt="" className="merch-thumb-img" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="merch-modal-right">
                    <h2 className="merch-modal-title">{selectedProduct.name}</h2>
                    <p className="merch-modal-price">Ksh {parseFloat(selectedProduct.base_price).toFixed(2)}</p>
                    
                    <p className="merch-modal-desc">{selectedProduct.description}</p>
                    
                    <div className="merch-modal-form">
                        <div className="merch-form-group">
                            <label>Select Variant</label>
                            <select value={selectedVariant} onChange={e => handleVariantChange(e.target.value)} className="merch-input">
                            {selectedProduct.variants.map(v => (
                                <option key={v.id} value={v.id}>{v.color} - Size {v.size} (+Ksh {v.price})</option>
                            ))}
                            </select>
                        </div>
                        
                        <div className="merch-form-group">
                            <label>Quantity</label>
                            <input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} className="merch-input" />
                        </div>
                    </div>

                    <button onClick={addToCart} className="merch-btn-primary full-width">
                        <span>Add to Bag</span>
                    </button>
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

      </div>
      
      <Footer />

      <style>{`
        .merch-page {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            background: linear-gradient(135deg, #1A1625 0%, #0d0a14 50%, #120D20 100%);
            color: #ffffff;
            font-family: 'Inter', sans-serif;
        }

        .merch-content {
            flex-grow: 1;
            padding-bottom: 80px;
            position: relative;
        }

        /* Hero Section */
        .merch-hero-section {
            position: relative;
            padding: 80px 3% 60px;
            overflow: hidden;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .merch-hero-container {
            max-width: 1440px;
            margin: 0 auto;
            position: relative;
            z-index: 10;
        }

        .merch-hero-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            align-items: center;
        }

        .merch-eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            font-size: 11px;
            letter-spacing: 0.3em;
            text-transform: uppercase;
            color: var(--primary, #22c1e6);
            font-weight: 600;
            margin-bottom: 16px;
        }
        .merch-eyebrow::before {
            content: '';
            width: 28px;
            height: 1.5px;
            background: var(--primary, #22c1e6);
        }

        .merch-title {
            font-family: 'Onest', 'Montserrat', sans-serif;
            font-size: clamp(3rem, 5vw, 5.5rem);
            font-weight: 900;
            line-height: 1.1;
            margin-bottom: 24px;
            text-transform: uppercase;
        }

        .merch-title-highlight {
            background: linear-gradient(120deg, #22c1e6, #a855f7, #e0aaff, #22c1e6);
            background-size: 200% auto;
            -webkit-background-clip: text;
            color: transparent;
            animation: merchGradientSweep 4s linear infinite;
        }

        .merch-subtitle {
            font-size: 16px;
            color: rgba(255, 255, 255, 0.75);
            line-height: 1.8;
            margin-bottom: 40px;
            max-width: 500px;
        }

        .merch-hero-right {
            position: relative;
        }

        .merch-collage-block {
            background: #1e1b29;
            border-radius: 36px;
            height: 450px;
            border: 1.5px solid rgba(255, 255, 255, 0.05);
            overflow: hidden;
            position: relative;
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.35);
        }

        .merch-collage-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: 0.85;
            transition: transform 0.6s ease;
        }

        .merch-collage-block:hover .merch-collage-img {
            transform: scale(1.05);
        }

        .merch-award-badge {
            position: absolute;
            bottom: -20px;
            right: -20px;
            z-index: 20;
        }

        .badge-ring-1 {
            width: 120px;
            height: 120px;
            background: rgba(34, 193, 230, 0.12);
            border: 2px solid rgba(34, 193, 230, 0.45);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: merch-pulse-ring 3s infinite ease-in-out;
        }

        .badge-ring-2 {
            width: 100px;
            height: 100px;
            background: #0d283c;
            border: 3px solid var(--primary, #22c1e6);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 18px rgba(34, 193, 230, 0.45);
        }

        .badge-text {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-transform: uppercase;
            font-weight: 800;
        }
        .badge-text .sm { font-size: 8px; color: rgba(255,255,255,0.7); letter-spacing: 2px;}
        .badge-text .lg { font-size: 20px; color: #fff;}
        .badge-text .md { font-size: 10px; color: var(--primary, #22c1e6); letter-spacing: 1px;}

        /* Buttons */
        .merch-btn-primary {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            font-size: 14.5px;
            padding: 1rem 2rem;
            background: linear-gradient(135deg, var(--primary, #22c1e6) 0%, #1aa3c4 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(34, 193, 230, 0.3);
            transition: all 0.3s ease;
        }
        .merch-btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(34, 193, 230, 0.45);
        }
        .merch-btn-primary.full-width {
            width: 100%;
        }
        .merch-btn-primary .btn-shine {
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            animation: merch-btn-shine 3s infinite;
        }

        .merch-cart-btn {
            position: fixed;
            bottom: 30px;
            left: 30px;
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, var(--primary, #22c1e6) 0%, #1aa3c4 100%);
            color: white;
            border: none;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 100;
            box-shadow: 0 8px 25px rgba(34, 193, 230, 0.4);
            transition: transform 0.3s ease;
        }
        .merch-cart-btn:hover {
            transform: scale(1.1);
        }
        .cart-badge {
            position: absolute;
            top: -5px;
            right: -5px;
            background: var(--secondary, #a855f7);
            color: white;
            font-size: 12px;
            font-weight: 800;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(168, 85, 247, 0.5);
        }

        /* Feature Bar */
        .merch-feature-bar {
            background: rgba(26, 22, 37, 0.6);
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            padding: 24px 3%;
        }
        .merch-feature-container {
            max-width: 1440px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
        }
        .merch-feature-item {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 0 16px;
            border-right: 1px solid rgba(255, 255, 255, 0.08);
        }
        .merch-feature-item:last-child {
            border-right: none;
        }
        .merch-feature-item .icon {
            font-size: 28px;
        }
        .merch-feature-item h4 {
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: 0 0 4px 0;
            font-weight: 700;
        }
        .merch-feature-item p {
            font-size: 11px;
            color: rgba(255,255,255,0.5);
            margin: 0;
            text-transform: uppercase;
        }

        /* Product Grid */
        .merch-products-section {
            max-width: 1440px;
            margin: 0 auto;
            padding: 80px 3%;
        }
        .merch-products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 30px;
        }
        .merch-product-card {
            cursor: pointer;
        }
        .merch-product-image-wrap {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 20px;
            aspect-ratio: 4/5;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
            margin-bottom: 20px;
            transition: all 0.4s ease;
        }
        .merch-product-card:hover .merch-product-image-wrap {
            transform: translateY(-8px);
            border-color: rgba(34, 193, 230, 0.3);
            box-shadow: 0 15px 35px rgba(34, 193, 230, 0.1);
        }
        .merch-product-img {
            width: 80%;
            height: 80%;
            object-fit: contain;
            transition: transform 0.5s ease;
        }
        .merch-product-card:hover .merch-product-img {
            transform: scale(1.1);
        }
        .merch-badge-new {
            position: absolute;
            top: 16px;
            left: 16px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255,255,255,0.1);
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            display: flex;
            align-items: center;
            gap: 6px;
            backdrop-filter: blur(5px);
        }
        .merch-badge-new .dot {
            width: 6px;
            height: 6px;
            background: var(--secondary, #a855f7);
            border-radius: 50%;
            box-shadow: 0 0 8px var(--secondary, #a855f7);
        }
        .merch-product-info {
            text-align: center;
        }
        .merch-product-name {
            font-size: 15px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: 0 0 8px 0;
        }
        .merch-product-price {
            color: var(--primary, #22c1e6);
            font-weight: 700;
            font-size: 16px;
            margin: 0;
        }

        /* Cart Drawer */
        .merch-cart-overlay {
            position: fixed;
            inset: 0;
            z-index: 1000;
            display: flex;
            justify-content: flex-start;
        }
        .merch-cart-backdrop {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(5px);
            animation: fadeIn 0.3s;
        }
        .merch-cart-drawer {
            position: relative;
            width: 100%;
            max-width: 420px;
            background: #161226;
            height: 100%;
            display: flex;
            flex-direction: column;
            border-right: 1px solid rgba(255,255,255,0.08);
            animation: slideInLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .merch-cart-header {
            padding: 24px;
            border-bottom: 1px solid rgba(255,255,255,0.08);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .merch-cart-header h2 {
            margin: 0;
            font-size: 20px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .merch-close-btn, .merch-modal-close {
            background: none;
            border: none;
            color: rgba(255,255,255,0.5);
            font-size: 24px;
            cursor: pointer;
            transition: color 0.3s;
        }
        .merch-close-btn:hover, .merch-modal-close:hover {
            color: var(--primary, #22c1e6);
        }
        .merch-empty-cart {
            padding: 40px;
            text-align: center;
            color: rgba(255,255,255,0.4);
            font-style: italic;
        }
        .merch-cart-items {
            flex-grow: 1;
            overflow-y: auto;
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        .merch-cart-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 20px;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .merch-item-name {
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            margin: 0 0 4px 0;
        }
        .merch-item-meta {
            font-size: 11px;
            color: rgba(255,255,255,0.5);
            text-transform: uppercase;
            margin: 0 0 8px 0;
        }
        .merch-item-qty {
            font-size: 12px;
            font-weight: 600;
            margin: 0;
        }
        .merch-item-price {
            font-weight: 700;
            color: var(--primary, #22c1e6);
            margin: 0;
        }
        .merch-cart-footer {
            padding: 24px;
            border-top: 1px solid rgba(255,255,255,0.08);
            background: rgba(0,0,0,0.2);
        }
        .merch-cart-total {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .merch-cart-total .total-val {
            font-size: 28px;
            font-weight: 900;
        }
        .merch-checkout-form {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .merch-input {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.1);
            padding: 14px 16px;
            border-radius: 8px;
            color: white;
            font-family: inherit;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 1px;
            outline: none;
            transition: border-color 0.3s;
        }
        .merch-input:focus {
            border-color: var(--primary, #22c1e6);
        }
        .merch-input option {
            background: #1A1625;
            color: white;
        }
        .merch-checkout-note {
            text-align: center;
            font-size: 10px;
            color: rgba(255,255,255,0.4);
            text-transform: uppercase;
            margin-top: 8px;
            letter-spacing: 0.5px;
        }

        /* Product Modal */
        .merch-modal-overlay {
            position: fixed;
            inset: 0;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .merch-modal-backdrop {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            animation: fadeIn 0.3s;
        }
        .merch-modal-content {
            position: relative;
            width: 100%;
            max-width: 900px;
            background: #161226;
            border-radius: 24px;
            border: 1px solid rgba(255,255,255,0.08);
            display: flex;
            overflow: hidden;
            box-shadow: 0 25px 50px rgba(0,0,0,0.5);
            animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .merch-modal-close {
            position: absolute;
            top: 20px;
            right: 24px;
            z-index: 10;
        }
        .merch-modal-left {
            flex: 1;
            background: rgba(255,255,255,0.02);
            padding: 30px 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border-right: 1px solid rgba(255,255,255,0.05);
            position: relative;
        }
        .merch-gallery-container {
            position: relative;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            touch-action: pan-y;
            user-select: none;
            padding-bottom: 25px;
        }
        .merch-gallery-slide {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 280px;
        }
        .merch-gallery-arrow {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background: rgba(22, 18, 38, 0.85);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: #fff;
            font-size: 24px;
            line-height: 1;
            cursor: pointer;
            z-index: 5;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.25s ease;
            backdrop-filter: blur(5px);
        }
        .merch-gallery-arrow:hover {
            background: var(--primary, #22c1e6);
            border-color: var(--primary, #22c1e6);
            color: #120D20;
            transform: translateY(-50%) scale(1.1);
        }
        .merch-gallery-prev {
            left: 5px;
        }
        .merch-gallery-next {
            right: 5px;
        }
        .merch-gallery-tag {
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(18, 13, 32, 0.85);
            border: 1px solid rgba(255, 255, 255, 0.12);
            padding: 4px 14px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: var(--primary, #22c1e6);
            backdrop-filter: blur(5px);
            white-space: nowrap;
        }
        .merch-gallery-dots {
            position: absolute;
            bottom: 4px;
            display: flex;
            gap: 6px;
            align-items: center;
            justify-content: center;
        }
        .merch-gallery-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.25);
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .merch-gallery-dot.active {
            background: var(--primary, #22c1e6);
            width: 18px;
            border-radius: 4px;
        }
        .merch-gallery-thumbs {
            display: flex;
            gap: 8px;
            margin-top: 12px;
            overflow-x: auto;
            max-width: 100%;
            padding: 4px;
        }
        .merch-thumb-wrap {
            width: 44px;
            height: 44px;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(255, 255, 255, 0.02);
            overflow: hidden;
            cursor: pointer;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        }
        .merch-thumb-wrap:hover, .merch-thumb-wrap.active {
            border-color: var(--primary, #22c1e6);
            transform: scale(1.05);
        }
        .merch-thumb-img {
            width: 80%;
            height: 80%;
            object-fit: contain;
        }
        .merch-modal-img {
            width: 100%;
            max-width: 320px;
            max-height: 320px;
            object-fit: contain;
            transition: opacity 0.2s ease;
        }
        .merch-modal-right {
            flex: 1;
            padding: 40px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .merch-modal-title {
            font-size: 32px;
            font-weight: 900;
            text-transform: uppercase;
            margin: 0 0 8px 0;
        }
        .merch-modal-price {
            font-size: 24px;
            color: var(--primary, #22c1e6);
            font-weight: 700;
            margin: 0 0 24px 0;
        }
        .merch-modal-desc {
            font-size: 14px;
            color: rgba(255,255,255,0.6);
            line-height: 1.6;
            margin: 0 0 32px 0;
        }
        .merch-modal-form {
            display: flex;
            flex-direction: column;
            gap: 20px;
            margin-bottom: 32px;
        }
        .merch-form-group label {
            display: block;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: rgba(255,255,255,0.5);
            margin-bottom: 8px;
            font-weight: 700;
        }

        /* Animations */
        @keyframes merchGradientSweep {
            0% { background-position: 0% 50%; }
            100% { background-position: 200% 50%; }
        }
        @keyframes merch-btn-shine {
            0% { left: -100%; }
            50%, 100% { left: 100%; }
        }
        @keyframes merch-pulse-ring {
            0%, 100% { transform: scale(1); opacity: 0.9; }
            50% { transform: scale(1.08); opacity: 1; }
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideInLeft {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
        }
        @keyframes scaleIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }

        /* Particles & Glows (from Hero) */
        .merch-hero-bg-particles {
            position: absolute;
            inset: 0;
            overflow: hidden;
            pointer-events: none;
        }
        .merch-particle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: rgba(34, 193, 230, 0.5);
            border-radius: 50%;
            animation: merch-float-particle 15s infinite ease-in-out;
        }
        ${[...Array(15)].map((_, i) => `
            .merch-particle-${i + 1} {
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation-delay: ${Math.random() * 5}s;
                animation-duration: ${10 + Math.random() * 10}s;
                opacity: ${0.3 + Math.random() * 0.5};
                transform: scale(${0.5 + Math.random() * 1.5});
            }
        `).join('')}
        @keyframes merch-float-particle {
            0%, 100% { transform: translateY(0) translateX(0); }
            25% { transform: translateY(-30px) translateX(10px); }
            50% { transform: translateY(-50px) translateX(-10px); }
            75% { transform: translateY(-20px) translateX(20px); }
        }
        .merch-glow-effect {
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            z-index: 1;
            animation: merch-glow-pulse 8s ease-in-out infinite;
            pointer-events: none;
        }
        .merch-glow-1 {
            width: 400px;
            height: 400px;
            background: rgba(34, 193, 230, 0.1);
            top: 10%;
            left: -5%;
        }
        .merch-glow-2 {
            width: 300px;
            height: 300px;
            background: rgba(168, 85, 247, 0.1);
            bottom: 10%;
            right: 5%;
            animation-delay: 2s;
        }
        @keyframes merch-glow-pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.2); opacity: 0.8; }
        }

        /* Responsive */
        @media (max-width: 968px) {
            .merch-hero-grid {
                grid-template-columns: 1fr;
                gap: 60px;
                text-align: center;
            }
            .merch-eyebrow { justify-content: center; }
            .merch-eyebrow::before { display: none; }
            .merch-feature-container {
                grid-template-columns: 1fr 1fr;
            }
            .merch-feature-item {
                border-bottom: 1px solid rgba(255,255,255,0.08);
                padding: 16px 0;
            }
            .merch-feature-item:nth-child(even) { border-right: none; }
            .merch-feature-item:nth-child(3), .merch-feature-item:nth-child(4) { border-bottom: none; }
            .merch-modal-content {
                flex-direction: column;
                height: 90vh;
                overflow-y: auto;
            }
            .merch-modal-left { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.05); padding: 20px;}
        }
        @media (max-width: 640px) {
            .merch-feature-container { grid-template-columns: 1fr; }
            .merch-feature-item { border-right: none !important; }
            .merch-feature-item:not(:last-child) { border-bottom: 1px solid rgba(255,255,255,0.08); }
        }
      `}</style>
    </div>
  );
};

export default MerchandisePage;
