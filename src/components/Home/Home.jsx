import React, { useState, useEffect, useRef } from 'react';
import './Home.css'; 
import { 
  Heart, Plus, 
  Smartphone, Monitor, WashingMachine, Utensils, 
  Salad, Coffee, Cookie, 
  ChevronLeft, ChevronRight,
  // ✅ ใช้ไอคอนชุดนี้
  Star, Flame, BadgePercent, LayoutGrid 
} from 'lucide-react';

import Snowfall from 'react-snowfall';
import productsData from '../../data/bigC/big_c.json'; 
import AddToListModal from './AddToListModal';

// Custom Hook สำหรับลากเมาส์
const useDraggableScroll = (ref) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - ref.current.offsetLeft);
    setScrollLeft(ref.current.scrollLeft);
    ref.current.style.cursor = 'grabbing';
    ref.current.style.userSelect = 'none';
  };

  const onMouseUp = () => {
    setIsDragging(false);
    ref.current.style.cursor = 'grab';
    ref.current.style.removeProperty('user-select');
  };

  const onMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      ref.current.style.cursor = 'grab';
      ref.current.style.removeProperty('user-select');
    }
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX) * 2;
    ref.current.scrollLeft = scrollLeft - walk;
  };

  return { onMouseDown, onMouseUp, onMouseLeave, onMouseMove };
};

function Home() { 
  
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [favorites, setFavorites] = useState([]);

  const recommendRef = useRef(null);
  const popularRef = useRef(null);
  const promoRef = useRef(null);

  const dragRecommend = useDraggableScroll(recommendRef);
  const dragPopular = useDraggableScroll(popularRef);
  const dragPromo = useDraggableScroll(promoRef);

  const categories = [
    { name: "มือถือ", icon: <Smartphone /> },
    { name: "คอมพิวเตอร์", icon: <Monitor /> },
    { name: "เครื่องใช้ไฟฟ้า", icon: <WashingMachine /> },
    { name: "อาหาร", icon: <Utensils /> },
    { name: "ผัก & ผลไม้", icon: <Salad /> },
    { name: "เครื่องดื่ม", icon: <Coffee /> },
    { name: "ขนมขบเคี้ยว", icon: <Cookie /> },
  ];

  const recommendedProducts = productsData.slice(0, 50); 
  const popularProducts = productsData.slice(50, 100); 
  const promoProducts = productsData.slice(100, 150); 

  useEffect(() => {
    const savedFavs = JSON.parse(localStorage.getItem('favoritesItems')) || [];
    setFavorites(savedFavs);
  }, []);

  const isProductFavorite = (product) => {
    return favorites.some(fav => fav.data === product.data);
  };

  const handleToggleFavorite = (product) => {
    let updatedFavs;
    const isFav = isProductFavorite(product);
    if (isFav) {
      updatedFavs = favorites.filter(item => item.data !== product.data);
    } else {
      updatedFavs = [...favorites, product];
    }
    setFavorites(updatedFavs);
    localStorage.setItem('favoritesItems', JSON.stringify(updatedFavs));
  };

  const scroll = (ref, direction) => {
    const { current } = ref;
    if (current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleAddClick = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const ScrollButtons = ({ scrollRef }) => (
    <>
      <button className="scroll-btn left" onClick={() => scroll(scrollRef, 'left')}>
        <ChevronLeft size={24} />
      </button>
      <button className="scroll-btn right" onClick={() => scroll(scrollRef, 'right')}>
        <ChevronRight size={24} />
      </button>
    </>
  );

  return (
    <div className="app-container" style={{ position: 'relative' }}>

      <Snowfall 
        snowflakeCount={150} 
        style={{
          position: 'fixed', width: '100vw', height: '100vh', top: 0, left: 0, 
          zIndex: 90, pointerEvents: 'none', 
        }}
      />

      <main className="container main-content">
        
        {/* --- หมวดหมู่ --- */}
        <div className="section-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#000' }}>
            {/* หมวดหมู่: ใช้ LayoutGrid สีดำ */}
            <LayoutGrid size={28} color="#000000" strokeWidth={2} /> 
            หมวดหมู่
          </h2>
          <a href="/CategorySection"><span className="badge">ดูทั้งหมด</span></a>
        </div>
        <div className="category-grid">
          {categories.map((cat, index) => (
            <div key={index} className="cat-card">
              <div className="cat-icon">{cat.icon}</div>
              <span>{cat.name}</span>
            </div>
          ))}
        </div>

        {/* --- แถวที่ 1: สินค้าแนะนำ --- */}
        <div className="section-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#000' }}>
            {/* ✅ สินค้าแนะนำ: ใช้ Star สีดำ (ไม่เทพื้น) */}
            <Star size={28} color="#000000" strokeWidth={2} /> 
            สินค้าแนะนำ
          </h2>
          <span className="badge">ดูทั้งหมด</span>
        </div>
        
        <div className="slider-wrapper">
          <ScrollButtons scrollRef={recommendRef} />
          <div 
            className="product-scroll-container" 
            ref={recommendRef}
            {...dragRecommend} 
          >
            {recommendedProducts.map((item, index) => {
              const isFav = isProductFavorite(item);
              return (
                <div key={index} className="product-card min-w-card">
                  <div 
                    className="heart-icon" 
                    onClick={() => handleToggleFavorite(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Heart size={18} color={isFav ? "#ef4444" : "#666"} fill={isFav ? "#ef4444" : "none"} />
                  </div>
                  <img src={item.image} alt={item.data} loading="lazy" style={{pointerEvents: 'none'}} /> 
                  <h3>{item.data}</h3>
                  <button className="add-btn" onClick={() => handleAddClick(item)}>
                    <Plus size={16} /> เพิ่ม
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- แถวที่ 2: สินค้ายอดนิยม --- */}
        <div className="section-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#000' }}>
            {/* ✅ สินค้ายอดนิยม: ใช้ Flame สีดำ (ไม่เทพื้น) */}
            <Flame size={28} color="#000000" strokeWidth={2} /> 
            สินค้ายอดนิยม
          </h2>
          <span className="badge">ดูทั้งหมด</span>
        </div>
        <div className="slider-wrapper">
          <ScrollButtons scrollRef={popularRef} />
          <div 
            className="product-scroll-container" 
            ref={popularRef}
            {...dragPopular}
          >
            {popularProducts.map((item, index) => {
              const isFav = isProductFavorite(item);
              return (
                <div key={index} className="product-card min-w-card">
                  <div className="heart-icon" onClick={() => handleToggleFavorite(item)} style={{ cursor: 'pointer' }}>
                    <Heart size={18} color={isFav ? "#ef4444" : "#666"} fill={isFav ? "#ef4444" : "none"} />
                  </div>
                  <img src={item.image} alt={item.data} loading="lazy" style={{pointerEvents: 'none'}} />
                  <h3>{item.data}</h3>
                  <button className="add-btn" onClick={() => handleAddClick(item)}>
                    <Plus size={16} /> เพิ่ม
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- แถวที่ 3: สินค้าโปรโมชั่น --- */}
        <div className="section-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#000' }}>
            {/* ✅ สินค้าโปรโมชั่น: ใช้ BadgePercent (ป้าย %) สีดำ */}
            <BadgePercent size={28} color="#000000" strokeWidth={2} /> 
            สินค้าโปรโมชั่น
          </h2>
          <span className="badge">ดูทั้งหมด</span>
        </div>
        <div className="slider-wrapper">
          <ScrollButtons scrollRef={promoRef} />
          <div 
            className="product-scroll-container" 
            ref={promoRef}
            {...dragPromo}
          >
            {promoProducts.map((item, index) => {
              const isFav = isProductFavorite(item);
              return (
                <div key={index} className="product-card min-w-card">
                  <div className="heart-icon" onClick={() => handleToggleFavorite(item)} style={{ cursor: 'pointer' }}>
                    <Heart size={18} color={isFav ? "#ef4444" : "#666"} fill={isFav ? "#ef4444" : "none"} />
                  </div>
                  <img src={item.image} alt={item.data} loading="lazy" style={{pointerEvents: 'none'}} />
                  <h3>{item.data}</h3>
                  <button className="add-btn" onClick={() => handleAddClick(item)}>
                    <Plus size={16} /> เพิ่ม
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </main>

      <AddToListModal 
        isOpen={showModal} 
        onClose={handleCloseModal} 
        product={selectedProduct} 
      />
      
    </div>
  );
}

export default Home;