import React, { useState, useEffect } from 'react';
import { ChevronLeft, Heart, Trash2, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Home/Navbar'; 
import Footer from '../Home/Footer'; 
import './Favorites.css'; 

const Favorites = () => {
  const navigate = useNavigate();
  const [favItems, setFavItems] = useState([]);

  // โหลดข้อมูลจาก LocalStorage
  useEffect(() => {
    const savedFavs = JSON.parse(localStorage.getItem('favoritesItems')) || [];
    setFavItems(savedFavs);
  }, []);

  // (ส่วนหนึ่งของ Favorites.jsx)
// ...
  // ฟังก์ชันลบสินค้า
  const handleRemove = (itemToRemove) => {
    // กรองเอาเฉพาะสินค้าที่ไม่ใช่ตัวที่จะลบ (เทียบจากชื่อ data)
    const newItems = favItems.filter(item => item.data !== itemToRemove.data);
    setFavItems(newItems);
    // บันทึกค่าใหม่ลงเครื่อง หน้า Home จะได้รับรู้ด้วยถ้ารีเฟรช
    localStorage.setItem('favoritesItems', JSON.stringify(newItems));
  };
// ...

  return (
    <div className="page-wrapper">
      <Navbar />

      {/* --- Header Section (แบบเดียวกับ MyLists) --- */}
      <div className="header-section">
        <div className="content-container">
          <div className="fav-header">
            <div className="header-left">
              <div className="back-circle" onClick={() => navigate('/')}>
                 <ChevronLeft size={24} />
              </div>
              <div className="header-text-group">
                <h1 className="header-title">FAVORITES</h1>
                <p className="header-subtitle">รายการสินค้าที่คุณชื่นชอบทั้งหมด ({favItems.length} รายการ)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Content Section --- */}
      <div className="content-section">
        <div className="content-container">
          {favItems.length > 0 ? (
            <div className="fav-grid">
              {favItems.map((item, index) => (
                <div key={index} className="fav-card">
                  {/* ปุ่มลบ */}
                  <button 
                    className="btn-remove-fav" 
                    onClick={() => handleRemove(item)}
                    title="ลบออกจากรายการโปรด"
                  >
                    <Trash2 size={18} />
                  </button>
                  
                  <div className="fav-img-wrap">
                    <img src={item.image} alt={item.data} loading="lazy" />
                  </div>
                  
                  <div className="fav-info">
                    <h3 className="fav-name">{item.data}</h3>
                  </div>
                  
                  <button className="btn-add-cart">
                    <ShoppingCart size={18} /> เพิ่มลงตะกร้า
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="empty-state">
              <div className="empty-icon-box">
                <Heart size={48} color="#cbd5e1" />
              </div>
              <h3>ยังไม่มีสินค้าในรายการโปรด</h3>
              <p>กดหัวใจที่สินค้าเพื่อบันทึกไว้ดูภายหลัง</p>
              <button onClick={() => navigate('/')} className="btn-go-shop">
                ไปเลือกสินค้า
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Favorites;