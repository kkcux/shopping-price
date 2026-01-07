import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Bell, ArrowLeft, LogOut } from 'lucide-react'; // เพิ่ม Icon LogOut
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { googleLogout } from '@react-oauth/google'; // ✅ เพิ่ม import googleLogout
import './Navbar.css';
import NotificationList from '../Notification/NotificationList';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);

  // ✅ 1. เพิ่ม State สำหรับเก็บข้อมูล User
  const [user, setUser] = useState(null);

  // ✅ 2. เช็คข้อมูลใน LocalStorage เมื่อโหลดหน้าเว็บ
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // แปลง JSON กลับเป็น Object
    }
  }, [location]); // ใส่ location เพื่อให้เช็คใหม่ทุกครั้งที่เปลี่ยนหน้า

  // ✅ 3. ฟังก์ชันสำหรับ Logout
  const handleLogout = () => {
    googleLogout(); // เคลียร์ session ของ Google
    localStorage.removeItem('user'); // ลบข้อมูล user
    localStorage.removeItem('token'); // ลบ token
    setUser(null); // เคลียร์ state
    navigate('/'); // เด้งไปหน้า Login
  };

  useEffect(() => {
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
          
          {/* ✅ 4. เปลี่ยนปุ่ม LOGIN เป็น Profile Google แบบมีเงื่อนไข */}
          {user ? (
            <div className="user-profile">
              <img 
                src={user.picture} 
                alt="Profile" 
                className="user-avatar" 
              />
              
              <span className="user-name">
                {/* แก้เป็นแบบนี้ครับ: เอาชื่อมาแบ่งวรรค แล้วเลือกตัวแรกสุด */}
                {(user.given_name || user.name).split(' ')[0]}
              </span>
              <button 
                onClick={handleLogout}
                className="btn-logout"
                title="ออกจากระบบ"
              >
                <LogOut size={12} /> {/* ลดขนาดไอคอนลงนิดนึงให้สมดุล */}
              </button>
            </div>
          ) : (
            <Link to="/login">
              <button className="login-btn">LOGIN</button>
            </Link>
          )}

          <div className="notif-wrapper" ref={notifRef} style={{ position: 'relative', order: 2 }}>
            <div 
              className={`bell-icon ${showNotif ? 'active' : ''}`} 
              onClick={() => setShowNotif(!showNotif)}
            >
              <Bell size={22} />
            </div>

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