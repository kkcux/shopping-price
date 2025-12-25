import React, { useState } from 'react';
import './Home.css'; 
import { 
  Heart, Plus, 
  Smartphone, Monitor, WashingMachine, Utensils, 
  Salad, Coffee, Cookie, Tag 
} from 'lucide-react';

// Import Snowfall เข้ามา
import Snowfall from 'react-snowfall';

import productsData from '../../data/bigC/big_c.json'; 
import AddToListModal from './AddToListModal';

function Home() { 
  
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const categories = [
    { name: "มือถือ", icon: <Smartphone /> },
    { name: "คอมพิวเตอร์", icon: <Monitor /> },
    { name: "เครื่องใช้ไฟฟ้า", icon: <WashingMachine /> },
    { name: "อาหาร", icon: <Utensils /> },
    { name: "ผัก & ผลไม้", icon: <Salad /> },
    { name: "เครื่องดื่ม", icon: <Coffee /> },
    { name: "ขนมขบเคี้ยว", icon: <Cookie /> },
  ];

  const recommendedProducts = productsData.slice(35, 41); 
  const popularProducts = productsData.slice(145, 151); 
  const promoProducts = productsData.slice(200, 206); 

  const handleAddClick = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  return (
    // เพิ่ม style relative ให้ div หลัก (เพื่อให้หิมะอ้างอิงตำแหน่งได้ถูกต้อง)
    <div className="app-container" style={{ position: 'relative' }}>

      {/*  ใส่ Snowfall ไว้ตรงนี้ (บนสุด) */}
      <Snowfall 
        snowflakeCount={150} // จำนวนหิมะ (ปรับได้ตามชอบ)
        style={{
          position: 'fixed', // ให้หิมะติดหน้าจอตลอดเวลาเลื่อนลง
          width: '100vw',
          height: '100vh',
          top: 0,
          left: 0,
          zIndex: 90, // ให้อยู่เหนือพื้นหลังแต่อยู่ใต้ Modal (Modal มักจะ z-index 100+)
          pointerEvents: 'none', // สำคัญ! เพื่อให้กดคลิกทะลุหิมะไปโดนปุ่มได้
        }}
      />

      {/* --- Main Content --- */}
      <main className="container main-content">
        
        {/* หมวดหมู่ */}
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

        {/* แถวที่ 1 */}
        <div className="section-header">
          <h2>⭐ สินค้าแนะนำ</h2>
          <span className="badge">ดูทั้งหมด</span>
        </div>
        <div className="product-grid">
          {recommendedProducts.map((item, index) => (
            <div key={index} className="product-card">
              <div className="heart-icon"><Heart size={18} /></div>
              <img src={item.image} alt={item.data} />
              <h3>{item.data}</h3>
              <button className="add-btn" onClick={() => handleAddClick(item)}>
                <Plus size={16} /> เพิ่ม
              </button>
            </div>
          ))}
        </div>

        {/* แถวที่ 2 */}
        <div className="section-header">
          <h2>🔥 สินค้ายอดนิยม</h2>
          <span className="badge">ดูทั้งหมด</span>
        </div>
        <div className="product-grid">
          {popularProducts.map((item, index) => (
            <div key={index} className="product-card">
              <div className="heart-icon"><Heart size={18} /></div>
              <img src={item.image} alt={item.data} />
              <h3>{item.data}</h3>
              <button className="add-btn" onClick={() => handleAddClick(item)}>
                <Plus size={16} /> เพิ่ม
              </button>
            </div>
          ))}
        </div>

        {/* แถวที่ 3 */}
        <div className="section-header">
          <h2>
            <Tag size={24} color="#ef4444" fill="#ef4444" style={{marginRight:'8px'}}/> 
            สินค้าโปรโมชั่น
          </h2>
          <span className="badge">ดูทั้งหมด</span>
        </div>
        <div className="product-grid">
          {promoProducts.map((item, index) => (
            <div key={index} className="product-card">
              <div className="heart-icon"><Heart size={18} /></div>
              <img src={item.image} alt={item.data} />
              <h3>{item.data}</h3>
              <button className="add-btn" onClick={() => handleAddClick(item)}>
                <Plus size={16} /> เพิ่ม
              </button>
            </div>
          ))}
        </div>

      </main>

      {/* Modal */}
      <AddToListModal 
        isOpen={showModal} 
        onClose={handleCloseModal} 
        product={selectedProduct} 
      />
      
    </div>
  );
}

export default Home;