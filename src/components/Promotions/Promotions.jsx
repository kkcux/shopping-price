import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronLeft, Heart, Plus, Search, SlidersHorizontal } from 'lucide-react';
import Navbar from '../Home/Navbar';
import Footer from '../Home/Footer';
import AddToListModal from '../Home/AddToListModal';
import { useFavorites } from '../../context/FavoritesContext';
import './Promotions.css';

const promotionProducts = [
  {
    id: 1,
    name: 'แอปเปิ้ล',
    image: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f34e.png',
    store: 'MAKRO',
    price: 59,
    createdAt: '2026-02-15',
    popularity: 1,
  },
  {
    id: 2,
    name: 'ส้มนาเวล',
    image: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f34a.png',
    store: 'LOTUS',
    price: 49,
    createdAt: '2026-02-14',
    popularity: 3,
  },
  {
    id: 3,
    name: 'แอปเปิ้ล',
    image: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f34e.png',
    store: 'BIG C',
    price: 55,
    createdAt: '2026-02-14',
    popularity: 2,
  },
  {
    id: 4,
    name: 'กล้วยหอม',
    image: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f34c.png',
    store: 'LOTUS',
    price: 39,
    createdAt: '2026-02-13',
    popularity: 4,
  },
  {
    id: 5,
    name: 'ผักกาดหอม',
    image: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f96c.png',
    store: 'BIG C',
    price: 25,
    createdAt: '2026-02-12',
    popularity: 5,
  },
  {
    id: 6,
    name: 'แอปเปิ้ล',
    image: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f34e.png',
    store: 'MAKRO',
    price: 57,
    createdAt: '2026-02-11',
    popularity: 6,
  },
  {
    id: 7,
    name: 'ส้มนาเวล',
    image: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f34a.png',
    store: 'LOTUS',
    price: 45,
    createdAt: '2026-02-11',
    popularity: 7,
  },
  {
    id: 8,
    name: 'แอปเปิ้ล',
    image: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f34e.png',
    store: 'BIG C',
    price: 53,
    createdAt: '2026-02-10',
    popularity: 8,
  },
  {
    id: 9,
    name: 'กล้วยหอม',
    image: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f34c.png',
    store: 'MAKRO',
    price: 35,
    createdAt: '2026-02-10',
    popularity: 9,
  },
  {
    id: 10,
    name: 'ผักกาดหอม',
    image: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f96c.png',
    store: 'BIG C',
    price: 22,
    createdAt: '2026-02-09',
    popularity: 10,
  },
];

const sortOptions = [
  { value: 'popular', label: 'ยอดนิยม' },
  { value: 'latest', label: 'ล่าสุดที่สุด' },
  { value: 'price-low', label: 'ราคาต่ำสุด' },
  { value: 'price-high', label: 'ราคาสูงสุด' },
];

const Promotions = () => {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [searchTerm, setSearchTerm] = useState('');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const [selectedStores, setSelectedStores] = useState({
    MAKRO: false,
    LOTUS: false,
    'BIG C': false,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const sortMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayedProducts = useMemo(() => {
    const activeStores = Object.entries(selectedStores)
      .filter(([, checked]) => checked)
      .map(([store]) => store);

    let result = promotionProducts.filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(searchTerm.trim().toLowerCase());
      const storeMatch = activeStores.length === 0 || activeStores.includes(product.store);
      return nameMatch && storeMatch;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === 'latest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return a.popularity - b.popularity;
    });

    return result;
  }, [searchTerm, selectedStores, sortBy]);

  const handleStoreChange = (storeName) => {
    setSelectedStores((prev) => ({ ...prev, [storeName]: !prev[storeName] }));
  };

  const handleOpenAddModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const selectedSortLabel = sortOptions.find((option) => option.value === sortBy)?.label || 'เรียงตาม';

  return (
    <div className="promotion-page">
      <Navbar />

      <section className="promotion-hero">
        <div className="promotion-hero-inner">
          <button type="button" className="promotion-back-btn" onClick={() => navigate(-1)} aria-label="ย้อนกลับ">
            <ChevronLeft size={18} />
          </button>
          <div>
            <h1>PROMOTION</h1>
            <p>สินค้าราคาถูก</p>
          </div>
        </div>
      </section>

      <main className="promotion-main">
        <aside className="promotion-filter-panel">
          <h3>ตัวกรอง</h3>
          <div className="promotion-filter-group">
            <button type="button" className="promotion-filter-title">
              ประเภทร้านค้า <ChevronDown size={14} />
            </button>

            {Object.keys(selectedStores).map((storeName) => (
              <label key={storeName} className="promotion-checkbox-row">
                <input
                  type="checkbox"
                  checked={selectedStores[storeName]}
                  onChange={() => handleStoreChange(storeName)}
                />
                <span>{storeName}</span>
              </label>
            ))}
          </div>

          <button type="button" className="promotion-apply-btn">
            แสดงผล
          </button>
        </aside>

        <section className="promotion-content">
          <div className="promotion-toolbar">
            <div className="promotion-search">
              <input
                type="text"
                placeholder="ค้นหาสินค้า..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
              <Search size={18} />
            </div>

            <div className="promotion-sort" ref={sortMenuRef}>
              <button type="button" onClick={() => setShowSortMenu((prev) => !prev)}>
                <SlidersHorizontal size={16} />
                <span>{selectedSortLabel}</span>
                <ChevronDown size={16} />
              </button>

              {showSortMenu && (
                <div className="promotion-sort-menu">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={sortBy === option.value ? 'active' : ''}
                      onClick={() => {
                        setSortBy(option.value);
                        setShowSortMenu(false);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="promotion-grid">
            {displayedProducts.map((product) => {
              const favorite = isFavorite(product.name);

              return (
                <article className="promotion-card" key={product.id}>
                  <button
                    type="button"
                    className={`promotion-fav-btn ${favorite ? 'active' : ''}`}
                    onClick={() => toggleFavorite(product)}
                    aria-label="สลับรายการโปรด"
                  >
                    <Heart size={18} fill={favorite ? '#ef4444' : 'none'} />
                  </button>

                  <div className="promotion-image-wrap">
                    <img src={product.image} alt={product.name} loading="lazy" />
                  </div>

                  <h4>{product.name}</h4>

                  <button type="button" className="promotion-add-btn" onClick={() => handleOpenAddModal(product)}>
                    <Plus size={16} />
                    เพิ่ม
                  </button>
                </article>
              );
            })}
          </div>
        </section>
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
