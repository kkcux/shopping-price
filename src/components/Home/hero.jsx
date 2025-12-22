import React from 'react';
import { Search } from 'lucide-react';

function Hero() {
  return (
    <header className="hero">
      <div className="container hero-content">
        <h1>จัดรายการของคุณให้คุ้มกว่าเดิม<br />ประหยัดได้ทุกครั้งที่ช้อป</h1>
        <p>เพิ่มสินค้าลงในรายการของคุณและเราจะค้นหาราคาที่ถูกที่สุดจากทุกร้านค้า...</p>
        <div className="search-bar">
          <input type="text" placeholder="ค้นหาสินค้า..." />
          <button className="search-btn"><Search size={20} /></button>
        </div>
      </div>
    </header>
  );
}

export default Hero;