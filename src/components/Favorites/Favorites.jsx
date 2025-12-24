import React from 'react';
import { ChevronLeft } from 'lucide-react';
import Navbar from '../Home/Navbar';
import Footer from '../Home/Footer';
import './Favorites.css'; // เปลี่ยนไปใช้ไฟล์ CSS ใหม่

const Favorites = () => {
  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-container-full">
        {/* ส่วนหัวข้อ */}
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
                เพิ่มสินค้าลงในรายการของคุณและเราจะค้นหาราคาที่ถูกที่สุดจากทุกร้านค้า
              </p>
            </div>
          </div>
          {/* ลบปุ่ม +MYLISTS ออก เพราะหน้า Favorites ไม่จำเป็นต้องมี */}
        </div>

        {/* ส่วน Login Prompt (พื้นที่สีเทาเต็มจอ) */}
        <div className="login-prompt-area">
          <div className="login-message">
            <p>Login เข้าใช้เพื่อใช้งานฟังก์ชันต่างๆของ PriceFinder</p>
            <a href="/login" className="login-link">เข้าสู่ระบบ</a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Favorites;