import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../Home/Navbar';
import Footer from '../Home/Footer';
import './MyLists.css';

const MyLists = () => {
  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-container-full">
        {/* ส่วนหัวข้อ */}
        <div className="page-header">
          <div className="header-left">
            <Link to="/">
              <button className="back-button">
                <ChevronLeft size={24} color="#666" />
              </button>
            </Link>
            <div className="header-text">
              <h1 className="page-title">MYLISTS</h1>
              <p className="page-subtitle">
                เพิ่มสินค้าลงในรายการของคุณและเราจะค้นหาราคาที่ถูกที่สุดจากทุกร้านค้า
              </p>
            </div>
          </div>
          <Link to="/lists-edit">
            <button className="new-button">+MYLISTS</button>
          </Link>

        </div>

        {/* ส่วน Login Prompt */}
        <div className="login-prompt-area">
          <div className="login-message">
            <p>Login เข้าใช้เพื่อใช้งานฟังก์ชันต่างๆของ PriceFinder</p>
            {/* ปรับตรงนี้ด้วยก็ได้ครับ */}
            <Link to="/login" className="login-link">เข้าสู่ระบบ</Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyLists;