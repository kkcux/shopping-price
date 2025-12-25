import React, { useState, useRef } from 'react'; // เพิ่ม useRef
import './Home.css'; 
import { 
  Heart, Plus, 
  Smartphone, Monitor, WashingMachine, Utensils, 
  Salad, Coffee, Cookie, Tag,
  ChevronLeft, ChevronRight // เพิ่มไอคอนลูกศร
} from 'lucide-react';

import Snowfall from 'react-snowfall';
import productsData from '../../data/bigC/big_c.json'; 
import AddToListModal from './AddToListModal';

function Home() { 
  
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // --- 1. สร้าง Ref สำหรับแต่ละ Section เพื่อใช้อ้างอิงในการเลื่อน ---
  const recommendRef = useRef(null);
  const popularRef = useRef(null);
  const promoRef = useRef(null);

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

  // --- 2. ฟังก์ชันเลื่อน Scroll ---
  const scroll = (ref, direction) => {
    const { current } = ref;
    if (current) {
      // เลื่อนทีละ 300px (ปรับได้ตามชอบ)
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

  // Component ย่อยสำหรับปุ่มเลื่อน (เพื่อลดโค้ดซ้ำ)
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
          position: 'fixed', 
          width: '100vw',
          height: '100vh',
          top: 0,
          left: 0,
          zIndex: 90, 
          pointerEvents: 'none', 
        }}
      />

      <main className="container main-content">
        
        {/* หมวดหมู่ (ยังคงเป็น Grid เหมือนเดิม หรือจะทำสไลด์ด้วยก็ได้) */}
        <div className="section-header">
          <h2>หมวดหมู่</h2>
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
          <h2>⭐ สินค้าแนะนำ</h2>
          <span className="badge">ดูทั้งหมด</span>
        </div>
        
        {/* ครอบด้วย slider-wrapper เพื่อวางปุ่ม Relative */}
        <div className="slider-wrapper">
          <ScrollButtons scrollRef={recommendRef} />
          
          {/* เปลี่ยน class เป็น product-scroll-container และใส่ ref */}
          <div className="product-scroll-container" ref={recommendRef}>
            {recommendedProducts.map((item, index) => (
              <div key={index} className="product-card min-w-card">
                <div className="heart-icon"><Heart size={18} /></div>
                <img src={item.image} alt={item.data} loading="lazy" />
                <h3>{item.data}</h3>
                <button className="add-btn" onClick={() => handleAddClick(item)}>
                  <Plus size={16} /> เพิ่ม
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* --- แถวที่ 2: สินค้ายอดนิยม --- */}
        <div className="section-header">
          <h2>🔥 สินค้ายอดนิยม</h2>
          <span className="badge">ดูทั้งหมด</span>
        </div>
        <div className="slider-wrapper">
          <ScrollButtons scrollRef={popularRef} />
          <div className="product-scroll-container" ref={popularRef}>
            {popularProducts.map((item, index) => (
              <div key={index} className="product-card min-w-card">
                <div className="heart-icon"><Heart size={18} /></div>
                <img src={item.image} alt={item.data} loading="lazy" />
                <h3>{item.data}</h3>
                <button className="add-btn" onClick={() => handleAddClick(item)}>
                  <Plus size={16} /> เพิ่ม
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* --- แถวที่ 3: สินค้าโปรโมชั่น --- */}
        <div className="section-header">
          <h2>
            <Tag size={24} color="#ef4444" fill="#ef4444" style={{marginRight:'8px'}}/> 
            สินค้าโปรโมชั่น
          </h2>
          <span className="badge">ดูทั้งหมด</span>
        </div>
        <div className="slider-wrapper">
          <ScrollButtons scrollRef={promoRef} />
          <div className="product-scroll-container" ref={promoRef}>
            {promoProducts.map((item, index) => (
              <div key={index} className="product-card min-w-card">
                <div className="heart-icon"><Heart size={18} /></div>
                <img src={item.image} alt={item.data} loading="lazy" />
                <h3>{item.data}</h3>
                <button className="add-btn" onClick={() => handleAddClick(item)}>
                  <Plus size={16} /> เพิ่ม
                </button>
              </div>
            ))}
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