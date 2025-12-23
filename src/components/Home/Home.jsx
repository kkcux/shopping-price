import React, { useState } from 'react'; // 1. เพิ่ม useState
import './Home.css'; 
import { 
  Heart, Plus, 
  Smartphone, Monitor, WashingMachine, Utensils, 
  Salad, Coffee, Cookie, Tag 
} from 'lucide-react';

import productsData from '../../data/big_c.json'; 
import AddToListModal from './AddToListModal';

function Home() { // เปลี่ยนชื่อ function ให้ตรงกับไฟล์ (Home)
  
  // 3. สร้าง State สำหรับควบคุม Modal
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

  // 4. ฟังก์ชันเปิด Modal เมื่อกดปุ่ม
  const handleAddClick = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  // 5. ฟังก์ชันปิด Modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  return (
    <div className="app-container">

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
              {/* 6. แก้ปุ่ม onClick ให้เรียก function */}
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
              {/* แก้ปุ่ม onClick */}
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
              {/* แก้ปุ่ม onClick */}
              <button className="add-btn" onClick={() => handleAddClick(item)}>
                <Plus size={16} /> เพิ่ม
              </button>
            </div>
          ))}
        </div>

      </main>

      {/* 7. เรียกใช้ Modal ตรงนี้ (สำคัญมาก! ต้องวางไว้นอก main แต่อยู่ใน div หลัก) */}
      <AddToListModal 
        isOpen={showModal} 
        onClose={handleCloseModal} 
        product={selectedProduct} 
      />
      
    </div>
  );
}

export default Home;