import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Heart, Plus, Search, LayoutGrid, ListFilter } from 'lucide-react';
import Navbar from '../Home/Navbar';
import Footer from '../Home/Footer';
import AddToListModal from '../Home/AddToListModal';
import { useFavorites } from '../../context/FavoritesContext';
import './Promotions.css';

// --- ข้อมูลจำลองชุดใหม่ พร้อมราคาโปรโมชั่น ---
const promotionProducts = [
  {
    id: 1,
    name: 'น้ำมันพืช 1 ลิตร',
    image: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f9f4.png',
    store: 'MAKRO',
    price: 42,
    originalPrice: 55, // ราคาเดิม
    createdAt: '2026-02-16',
    popularity: 1,
  },
  {
    id: 2,
    name: 'ข้าวหอมมะลิ 5 กก.',
    image: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f35a.png',
    store: 'BIG C',
    price: 189,
    originalPrice: 215,
    createdAt: '2026-02-15',
    popularity: 2,
  },
  {
    id: 3,
    name: 'บะหมี่กึ่งสำเร็จรูปแพ็ค',
    image: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f35c.png',
    store: 'LOTUS',
    price: 55,
    originalPrice: 62,
    createdAt: '2026-02-14',
    popularity: 5,
  },
  {
    id: 4,
    name: 'นมจืด 2 ลิตร',
    image: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f95b.png',
    store: 'BIG C',
    price: 92,
    originalPrice: 98,
    createdAt: '2026-02-16',
    popularity: 3,
  },
  {
    id: 5,
    name: 'ไข่ไก่ (เบอร์ 2) 30 ฟอง',
    image: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f95a.png',
    store: 'MAKRO',
    price: 115,
    originalPrice: 130,
    createdAt: '2026-02-13',
    popularity: 4,
  },
  {
    id: 6,
    name: 'น้ำอัดลม 1.5 ลิตร',
    image: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f964.png',
    store: 'LOTUS',
    price: 27,
    originalPrice: 32,
    createdAt: '2026-02-15',
    popularity: 8,
  },
  {
    id: 7,
    name: 'ทิชชู่แพ็ค 6 ม้วน',
    image: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f9fb.png',
    store: 'BIG C',
    price: 69,
    originalPrice: 85,
    createdAt: '2026-02-12',
    popularity: 6,
  },
  {
    id: 8,
    name: 'ผงซักฟอก 1,000 กรัม',
    image: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f9fc.png',
    store: 'MAKRO',
    price: 79,
    originalPrice: 99,
    createdAt: '2026-02-11',
    popularity: 7,
  },
  {
    id: 9,
    name: 'ปลากระป๋อง (แพ็ค 3)',
    image: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f96b.png',
    store: 'LOTUS',
    price: 45,
    originalPrice: 54,
    createdAt: '2026-02-10',
    popularity: 9,
  },
  {
    id: 10,
    name: 'กาแฟสำเร็จรูป 3in1',
    image: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2615.png',
    store: 'BIG C',
    price: 129,
    originalPrice: 155,
    createdAt: '2026-02-09',
    popularity: 10,
  },
];

const sortOptions = [
  { value: 'popular', label: 'สินค้าแนะนำ' },
  { value: 'latest', label: 'ล่าสุดที่สุด' },
  { value: 'price-low', label: 'ราคาต่ำสุด' },
  { value: 'price-high', label: 'ราคาสูงสุด' },
];

const Promotions = () => {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [searchTerm, setSearchTerm] = useState('');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showStoreMenu, setShowStoreMenu] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const [selectedStore, setSelectedStore] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const sortMenuRef = useRef(null);
  const storeMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) setShowSortMenu(false);
      if (storeMenuRef.current && !storeMenuRef.current.contains(event.target)) setShowStoreMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      return a.popularity - b.popularity;
    });

    return result;
  }, [searchTerm, sortBy, selectedStore]);

  const handleOpenAddModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="promotion-page">
      <Navbar />

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
    <span>หมวดหมู่ : {selectedStore === 'all' ? 'ทั้งหมด' : selectedStore}</span>
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

        <div className="promotion-grid">
          {displayedProducts.map((product) => {
            const favorite = isFavorite(product.name);
            const hasDiscount = product.originalPrice && product.originalPrice > product.price;

            return (
              <article className="promotion-card" key={product.id}>
                {hasDiscount && (
                  <div className="promotion-discount-badge">
                    -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
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
                  <img src={product.image} alt={product.name} loading="lazy" />
                </div>

                <div className="promotion-info">
                  <span className="promotion-store-tag">{product.store}</span>
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