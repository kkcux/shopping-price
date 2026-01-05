import React, { useState, useRef, useEffect } from 'react'; // เพิ่ม useState, useRef, useEffect
import { ShoppingCart, Bell, ArrowLeft } from 'lucide-react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';
import NotificationList from '../Notification/NotificationList'; // ✅ 1. นำเข้า Component

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // ✅ 2. เพิ่ม State ควบคุมการแสดงผล
  const [showNotif, setShowNotif] = useState(false);
  
  // ✅ 3. เพิ่ม Ref สำหรับตรวจจับการคลิกนอกกล่อง (เพื่อให้ปิดอัตโนมัติ)
  const notifRef = useRef(null);

  useEffect(() => {
    // ฟังก์ชันปิดเมื่อคลิกที่อื่น
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const getBackBtnConfig = () => {
    if (location.pathname === '/register') {
      return { text: 'กลับหน้าเข้าสู่ระบบ', path: '/login' };
    }
    return { text: 'กลับหน้าหลัก', path: '/' };
  };

  const backConfig = getBackBtnConfig();

  // --- กรณีหน้า Login/Register ---
  if (isAuthPage) {
    return (
      <nav className="navbar">
        <div className="nav-content">
          <Link to="/" className="brand">
            <div className="logo-circle-nav">
              <ShoppingCart size={20} color="#FFFFFF" strokeWidth={2.5} />
            </div>
            PriceFinder
          </Link>

          <button className="btn-nav-back" onClick={() => navigate(backConfig.path)}>
            <ArrowLeft size={18} />
            <span>{backConfig.text}</span>
          </button>
        </div>
      </nav>
    );
  }

  // --- กรณีหน้าทั่วไป ---
  return (
    <nav className="navbar">
      <div className="nav-content">
        <Link to="/" className="brand">
          <div className="logo-circle-nav">
            <ShoppingCart size={20} color="#FFFFFF" strokeWidth={2.5} />
          </div>
          PriceFinder
        </Link>
        
        <ul className="menu">
          <li><NavLink to="/" end>HOME</NavLink></li>
          <li><NavLink to="/favorites">FAVORITES</NavLink></li>
          <li><NavLink to="/mylists">MYLISTS</NavLink></li>
        </ul>

        <div className="nav-actions">
          <Link to="/login">
            <button className="login-btn">LOGIN</button>
          </Link>

          {/* ✅ 4. ห่อหุ้มไอคอนกระดิ่งด้วย Wrapper เพื่อจัดตำแหน่ง Popup */}
          <div className="notif-wrapper" ref={notifRef} style={{ position: 'relative', order: 2 }}>
            <div 
              className={`bell-icon ${showNotif ? 'active' : ''}`} 
              onClick={() => setShowNotif(!showNotif)}
            >
              <Bell size={22} />
            </div>

            {/* ✅ 5. แสดง NotificationList เมื่อ showNotif = true */}
            {showNotif && (
              <div style={{ position: 'absolute', top: '55px', right: '-10px', zIndex: 1000 }}>
                <NotificationList />
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;