import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Heart, Plus, Search, LayoutGrid, ListFilter } from 'lucide-react';
import Navbar from '../Home/Navbar';
import Footer from '../Home/Footer';
import AddToListModal from '../Home/AddToListModal';
import { useFavorites } from '../../context/FavoritesContext';
import { supabase } from '../../../supabaseClient';
import './Promotions.css';

const sortOptions = [
  { value: 'popular', label: 'สินค้าแนะนำ' },
  { value: 'price-low', label: 'ราคาต่ำสุด' },
  { value: 'price-high', label: 'ราคาสูงสุด' },
];

const Promotions = () => {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  // State สำหรับจัดการข้อมูลจาก Supabase
  const [promotionProducts, setPromotionProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showStoreMenu, setShowStoreMenu] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const [selectedStore, setSelectedStore] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const sortMenuRef = useRef(null);
  const storeMenuRef = useRef(null);

  // ดึงข้อมูลจาก Supabase เมื่อโหลดหน้านี้
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('promo_products')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100); // จำกัดการดึงข้อมูลเบื้องต้น (ปรับตัวเลขได้)

        if (error) throw error;

        // แปลงข้อมูลจาก Supabase ให้อยู่ในรูปแบบที่ UI ของคุณต้องการ
        const formattedData = (data || []).map((item) => ({
          id: item.id,
          name: item.base_name || 'ไม่มีชื่อสินค้า',
          image: item.image || '',
          store: item.store_name ? item.store_name.toUpperCase() : 'UNKNOWN',
          price: Number(item.price) || 0,
          originalPrice: Number(item.original_price) || undefined,
          createdAt: item.created_at,
          popularity: item.id, // ใช้ ID เป็นตัวกำหนดความนิยมชั่วคราว
        }));

        setPromotionProducts(formattedData);
      } catch (err) {
        setError(`โหลดข้อมูลไม่สำเร็จ: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ปิดเมนูเมื่อคลิกที่อื่น
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) setShowSortMenu(false);
      if (storeMenuRef.current && !storeMenuRef.current.contains(event.target)) setShowStoreMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // กรองและเรียงลำดับข้อมูล
  const displayedProducts = useMemo(() => {
    let result = promotionProducts.filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(searchTerm.trim().toLowerCase());
      const storeMatch = selectedStore === 'all' || p.store === selectedStore;
      return nameMatch && storeMatch;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === 'latest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return a.popularity - b.popularity; // popular
    });

    return result;
  }, [searchTerm, sortBy, selectedStore, promotionProducts]);

  const handleOpenAddModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="promotion-page">
      <Navbar />

      <header className="promotion-hero">
        <div className="promotion-hero-inner">
          <h1>PROMOTION</h1>
          <p>เลือกสินค้าที่มีราคาโปรโมชั่นจากร้านค้าต่าง ๆ ได้จากที่นี่</p>
        </div>
      </header>

      <main className="promotion-main">
        <section className="promotion-toolbar">
          <h2 className="promotion-title">สินค้าทั้งหมด</h2>

          <div className="promotion-controls">
            <div className="promotion-search">
              <Search size={18} />
              <input
                type="text"
                placeholder="ค้นหาสินค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* ส่วนของ Store Dropdown */}
            <div className="promotion-dropdown-wrapper" ref={storeMenuRef}>
              <button className="promotion-btn-green" onClick={() => setShowStoreMenu(!showStoreMenu)}>
                <LayoutGrid size={18} />
                <span>ประเภทร้านค้า : {selectedStore === 'all' ? 'ทั้งหมด' : selectedStore}</span>
                <ChevronDown size={16} />
              </button>
              {showStoreMenu && (
                <div className="promotion-menu">
                  <button 
                    className={selectedStore === 'all' ? 'active' : ''}
                    onClick={() => { setSelectedStore('all'); setShowStoreMenu(false); }}
                  >
                    ทั้งหมด
                  </button>
                  <button 
                    className={selectedStore === 'MAKRO' ? 'active' : ''}
                    onClick={() => { setSelectedStore('MAKRO'); setShowStoreMenu(false); }}
                  >
                    Makro
                  </button>
                  <button 
                    className={selectedStore === 'LOTUS' ? 'active' : ''}
                    onClick={() => { setSelectedStore('LOTUS'); setShowStoreMenu(false); }}
                  >
                    Lotus
                  </button>
                  <button 
                    className={selectedStore === 'BIG C' ? 'active' : ''}
                    onClick={() => { setSelectedStore('BIG C'); setShowStoreMenu(false); }}
                  >
                    Big C
                  </button>
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="promotion-dropdown-wrapper" ref={sortMenuRef}>
              <button className="promotion-btn-green" onClick={() => setShowSortMenu(!showSortMenu)}>
                <ListFilter size={18} />
                <span>{sortOptions.find(o => o.value === sortBy)?.label}</span>
                <ChevronDown size={16} />
              </button>
              {showSortMenu && (
                <div className="promotion-menu">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      className={sortBy === option.value ? 'active' : ''}
                      onClick={() => { setSortBy(option.value); setShowSortMenu(false); }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {loading ? (
          <p style={{ textAlign: 'center', marginTop: '50px' }}>กำลังโหลดข้อมูลสินค้าโปรโมชั่น...</p>
        ) : error ? (
          <p className="error-text" style={{ textAlign: 'center', color: 'red' }}>{error}</p>
        ) : displayedProducts.length === 0 ? (
          <p style={{ textAlign: 'center', marginTop: '50px' }}>ไม่พบสินค้าที่ค้นหา</p>
        ) : (
          <div className="promotion-grid">
            {displayedProducts.map((product) => {
              const favorite = isFavorite(product.name);
              const hasDiscount = product.originalPrice && product.originalPrice > product.price;

<<<<<<< HEAD
              return (
                <article className="promotion-card" key={product.id}>
                  {hasDiscount && (
                    <div className="promotion-discount-badge">
                      -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
=======
            return (
              <article className="promotion-card" key={product.id}>
                {hasDiscount && (
                  <div className="promotion-discount-badge">
                    -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </div>
                )}

                <button
                  type="button"
                  className={`fav-btn-std ${favorite ? 'active' : ''}`}
                  onClick={() => toggleFavorite(product)}
                >
                  <Heart size={20} fill={favorite ? '#fbbf24' : 'none'} stroke={favorite ? '#fbbf24' : 'currentColor'} />
                </button>

                <div className="promotion-image-wrap">
                  <img src={product.image} alt={product.name} loading="lazy" />
                </div>

                <div className="promotion-info">
                  <h4 className="promotion-name">{product.name}</h4>
                  
                  <div className="promotion-price-container">
                    <div className="promotion-price-row">
                      <span className="promotion-currency">฿</span>
                      <span className="promotion-price">{product.price.toLocaleString()}</span>
>>>>>>> cade0761191d933a203564a85ad11abd6691fb4e
                    </div>
                  )}

                  <button
                    type="button"
                    className={`promotion-fav-btn ${favorite ? 'active' : ''}`}
                    onClick={() => toggleFavorite(product)}
                  >
                    <Heart size={20} fill={favorite ? '#ef4444' : 'none'} />
                  </button>

                  <div className="promotion-image-wrap">
                    {product.image ? (
                      <img src={product.image} alt={product.name} loading="lazy" />
                    ) : (
                      <div style={{ width: '100%', height: '150px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <span style={{ color: '#999' }}>ไม่มีรูป</span>
                      </div>
                    )}
                  </div>

                  <div className="promotion-info">
                    <h4 className="promotion-name">{product.name}</h4>
                    
                    <div className="promotion-price-container">
                      <div className="promotion-price-row">
                        <span className="promotion-currency">฿</span>
                        <span className="promotion-price">{product.price.toLocaleString()}</span>
                      </div>
                      {hasDiscount && (
                        <span className="promotion-original-price">
                          ฿{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <button 
                    type="button" 
                    className="promotion-add-btn" 
                    onClick={() => handleOpenAddModal(product)}
                  >
                    <Plus size={18} />
                    เพิ่ม
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <AddToListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
      />
      <Footer />
    </div>
  );
};

export default Promotions;