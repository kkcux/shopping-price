import React from 'react';
import { ChevronLeft } from 'lucide-react';
import './MyLists.css';

const MyLists = () => {
  return (
    <div className="page-container-full">
      
      {/* ส่วนหัวข้อ: ย้ายออกจาก Container เพื่อให้ชิดซ้ายตรงกับ Navbar */}
      <div className="page-header">
        <a href="/"><button className="back-button">
          <ChevronLeft size={24} color="#666" />
        </button></a>
        <div className="header-text">
          <h1 className="page-title">MYLISTS</h1>
          <p className="page-subtitle">
            เพิ่มสินค้าลงในรายการของคุณและเราจะค้นหาราคาที่ถูกที่สุดจากทุกร้านค้า
          </p>
        </div>
      </div>

      {/* ส่วน Login Prompt: อยู่นอก Container จะได้กว้างเต็มจอ */}
      {/* และใช้ flex: 1 เพื่อยืดลงไปชน Footer */}
      <div className="login-prompt-area">
        <div className="login-message">
          <p>Login เข้าใช้เพื่อใช้งานฟังก์ชันต่างๆของ PriceFinder</p>
          <a href="#" className="login-link">เข้าสู่ระบบ</a>
        </div>
      </div>

    </div>
  );
};

export default MyLists;