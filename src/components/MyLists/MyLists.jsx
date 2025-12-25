import React, { useState } from 'react'; // ❌ ลบ useEffect ออกจาก import
import { ChevronLeft, MoreVertical } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../Home/Navbar';
import Footer from '../Home/Footer';
import './MyLists.css'; 

const MyLists = () => {
  const navigate = useNavigate();

  // ✅ แก้ตรงนี้: ดึงข้อมูลจาก localStorage เข้าไปใน useState โดยตรงเลย
  const [savedLists, setSavedLists] = useState(() => {
    const data = localStorage.getItem("myLists");
    return data ? JSON.parse(data) : [];
  });

  // ❌ ลบ useEffect ตัวเดิมทิ้งไปเลย (ไม่ต้องใช้แล้ว)
  /* useEffect(() => {
    const data = localStorage.getItem("myLists");
    if (data) {
      setSavedLists(JSON.parse(data));
    }
  }, []); 
  */

  const handleDeleteList = (id) => {
    if (window.confirm("ต้องการลบรายการนี้ใช่หรือไม่?")) {
      const updated = savedLists.filter(list => list.id !== id);
      setSavedLists(updated);
      localStorage.setItem("myLists", JSON.stringify(updated));
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      {/* ... ส่วนอื่นเหมือนเดิม ... */}
      <div className="header-section">
        <div className="content-container">
          <div className="mylist-header">
            <div className="header-left">
              <div className="back-circle" onClick={() => navigate('/')}>
                 <ChevronLeft size={24} color="#555" />
              </div>
              <div className="header-text-group">
                <h1 className="header-title">MYLISTS</h1>
                <p className="header-subtitle">เพิ่มสินค้าลงในรายการของคุณและเราจะค้นหาราคาที่ถูกที่สุดจากทุกร้านค้า</p>
              </div>
            </div>

            <Link to="/mylists/create" style={{ textDecoration: 'none' }}>
              <button className="btn-newlist">
                + NEWLIST
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="content-container">
          {savedLists.length > 0 ? (
            <div className="lists-grid">
              {savedLists.map((list) => (
                <div key={list.id} className="list-card">
                  <div className="card-top-menu">
                    <button className="menu-icon-btn" onClick={() => handleDeleteList(list.id)}>
                      <MoreVertical size={20} color="#333" />
                    </button>
                  </div>
                  <div className="card-body">
                    <h3 className="card-title">{list.name}</h3>
                    <p className="card-count">{list.totalItems} รายการ</p>
                  </div>
                  <div className="card-footer">
                    <button 
                      className="btn-open" 
                      onClick={() => navigate(`/mylists/${list.id}`)}
                    >
                      เปิด
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>ยังไม่มีรายการสินค้า</p>
              <Link to="/mylists/create" className="link-create">สร้างรายการใหม่ +</Link>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MyLists;