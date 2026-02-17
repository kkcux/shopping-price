import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Heart, Plus, Search, LayoutGrid, ListFilter } from 'lucide-react';
import Navbar from '../Home/Navbar';
import Footer from '../Home/Footer';
import AddToListModal from '../Home/AddToListModal';
import { useFavorites } from '../../context/FavoritesContext';
import './Promotions.css';

// ดึงตัวอย่างข้อมูลจากโฟลเดอร์ `src/data` — นำมาอย่างละ 10 รายการ
import bigCData from '../../data/bigC/big_c.json';
import lotusBakery from '../../data/Lotus/lotus_bakery_full.json';
import makroBeverages from '../../data/makro/makro_beverages.json';

const take = (arr, n) => (Array.isArray(arr) ? arr.slice(0, n) : []);

const promotionProducts = (() => {
  const items = [];
  let id = 1;

  take(bigCData, 10).forEach((p) => {
    const price = typeof p.price === 'number' ? p.price : parseFloat(p.price || 0);
    items.push({
      id: id++,
      name: p.data || p.name || 'ไม่มีชื่อสินค้า',
      image: p.image || '',
      store: 'BIG C',
      price: Math.round(price),
      originalPrice: Math.round(price * 1.15) || undefined,
      createdAt: '2026-02-17',
      popularity: id,
    });
  });

  take(lotusBakery, 10).forEach((p) => {
    const price = parseFloat(p.price || 0);
    items.push({
      id: id++,
      name: p.name || 'ไม่มีชื่อสินค้า',
      image: p.image || '',
      store: 'LOTUS',
      price: Math.round(price),
      originalPrice: Math.round(price * 1.15) || undefined,
      createdAt: '2026-02-17',
      popularity: id,
    });
  });

  take(makroBeverages, 10).forEach((p) => {
    const price = parseFloat(p.price || 0);
    items.push({
      id: id++,
      name: p.name || 'ไม่มีชื่อสินค้า',
      image: p.image || '',
      store: 'MAKRO',
      price: Math.round(price),
      originalPrice: Math.round(price * 1.15) || undefined,
      createdAt: '2026-02-17',
      popularity: id,
    });
  });

  return items;
})();

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