import React, { useState, useEffect } from 'react';
import { ChevronLeft, Heart, Trash2, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Home/Navbar'; 
import Footer from '../Home/Footer'; 
import AddToListModal from '../Home/AddToListModal'; // ✅ 1. Import Modal เข้ามา (เช็ค Path ให้ถูกต้อง)
import './Favorites.css'; 

const Favorites = () => {
  const navigate = useNavigate();
  const [favItems, setFavItems] = useState([]);

  // ✅ 2. เพิ่ม State สำหรับ Modal และสินค้าที่เลือก
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // โหลดข้อมูลจาก LocalStorage
  useEffect(() => {
    const savedFavs = JSON.parse(localStorage.getItem('favoritesItems')) || [];
    setFavItems(savedFavs);
  }, []);

  // ฟังก์ชันลบสินค้า
  const handleRemove = (itemToRemove) => {
    const newItems = favItems.filter(item => item.data !== itemToRemove.data);
    setFavItems(newItems);
    localStorage.setItem('favoritesItems', JSON.stringify(newItems));
  };

  // ✅ 3. สร้างฟังก์ชันเปิด Modal (เลียนแบบหน้า Home)
  const handleAddToCart = (item) => {
    // ⚠️ หมายเหตุ: ใน Favorites เก็บชื่อสินค้าใน field 'data' 
    // แต่ Modal (ที่มาจากหน้า Home) น่าจะคาดหวัง field 'name'
    // เราจึงต้องแปลงข้อมูลเล็กน้อยก่อนส่งไป
    const productToPass = {
      ...item,
      name: item.data // map 'data' ให้เป็น 'name' เพื่อให้ Modal แสดงชื่อถูก
    };

    setSelectedProduct(productToPass);
    setIsModalOpen(true);
  };

  return (
    <div className="page-wrapper">
      <Navbar />

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
                  
                  {/* ✅ 4. ผูกฟังก์ชัน handleAddToCart เข้ากับปุ่ม */}
                  <button 
                    className="btn-add-cart"
                    onClick={() => handleAddToCart(item)}
                  >
                    <ShoppingCart size={18} /> เพิ่มลงตะกร้า
                  </button>
                </div>
              ))}
            </div>
          ) : (
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

      {/* ✅ 5. แสดง Modal (วางไว้ก่อน Footer เหมือนหน้า Home) */}
      <AddToListModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={selectedProduct} 
      />

      <Footer />
    </div>
  );
};

export default Favorites;