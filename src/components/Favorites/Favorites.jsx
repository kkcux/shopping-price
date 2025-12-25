import React, { useState, useEffect } from 'react';
import { ChevronLeft, Heart, Plus } from 'lucide-react';
import Navbar from '../Home/Navbar'; 
import Footer from '../Home/Footer'; 
import './Favorites.css'; 

const Favorites = () => {
  // ไม่ต้องมี State isLoggedIn แล้ว เพราะถือว่าเข้าสู่ระบบตลอดเวลา
  const [favItems, setFavItems] = useState([]);

  // ดึงข้อมูลจริงจาก LocalStorage
  useEffect(() => {
    const savedFavs = JSON.parse(localStorage.getItem('favoritesItems')) || [];
    setFavItems(savedFavs);
  }, []);

  // ฟังก์ชันลบสินค้า
  const handleRemove = (indexToRemove) => {
    const newItems = favItems.filter((_, index) => index !== indexToRemove);
    setFavItems(newItems);
    localStorage.setItem('favoritesItems', JSON.stringify(newItems));
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-container-full">
        {/* --- ส่วนหัวข้อ --- */}
        <div className="page-header">
          <div className="header-left">
            <a href="/">
              <button className="back-button">
                <ChevronLeft size={24} color="#666" />
              </button>
            </a>
            <div className="header-text">
              <h1 className="page-title">FAVORITES</h1>
              <p className="page-subtitle">
                รายการสินค้าที่คุณชื่นชอบ ({favItems.length} รายการ)
              </p>
            </div>
          </div>
          
          {/* ❌ ลบปุ่มจำลอง Login/Logout ออกแล้ว */}
        </div>

        {/* --- ส่วนแสดงผลสินค้า (แสดงทันที ไม่ต้องเช็ค Login) --- */}
        <div className="favorites-content-grid">
          {favItems.length === 0 ? (
              /* กรณีไม่มีสินค้า */
              <div className="empty-state">
                <Heart size={48} color="#ddd" />
                <p>คุณยังไม่มีรายการโปรด</p>
                <a href="/" className="go-shop-link">ไปเลือกสินค้าที่หน้าแรก</a>
              </div>
          ) : (
            /* กรณีมีสินค้า */
            <div className="product-grid">
              {favItems.map((item, index) => (
                <div key={index} className="product-card">
                  {/* ปุ่มหัวใจ: กดเพื่อลบ */}
                  <div 
                    className="heart-icon active" 
                    onClick={() => handleRemove(index)}
                    title="ลบออกจากรายการโปรด"
                  >
                    <Heart size={18} color="#ef4444" fill="#ef4444" />
                  </div>
                  
                  <img src={item.image} alt={item.data} />
                  <h3>{item.data}</h3>
                  
                  <button className="add-btn">
                    <Plus size={16} /> เพิ่ม
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Favorites;