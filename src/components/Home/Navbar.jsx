import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, ArrowLeft, Menu, X, Bell } from 'lucide-react'; 
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

// 1. นำ NotificationList Component มาใช้งานตรงนี้
import NotificationList from '../Notification/NotificationList'; 

import { auth } from '../../firebase-config'; 
import { onAuthStateChanged } from 'firebase/auth';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // 2. สร้าง State และ Ref สำหรับ Pop-up แจ้งเตือน
  const [showNoti, setShowNoti] = useState(false);
  const notiRef = useRef(null); 

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const getInitials = (displayName) => {
    if (!displayName) return '';
    return displayName.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
  };

  // 3. ฟังก์ชันปิด Pop-up เมื่อคลิกที่อื่น (Click Outside)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notiRef.current && !notiRef.current.contains(event.target)) {
        setShowNoti(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          given_name: firebaseUser.displayName
        };
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      } else {
        localStorage.removeItem('user');
        setUser(null);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setShowNoti(false); // ปิดแจ้งเตือนเมื่อเปลี่ยนหน้า
  }, [location.pathname]);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  
  if (isAuthPage) {
    return (
      <nav className="navbar">
        <div className="nav-content">
          <Link to="/" className="brand">
            <div className="logo-circle-nav"><ShoppingCart size={20} color="#FFFFFF" strokeWidth={2.5} /></div>
            PriceFinder
          </Link>
          <button className="btn-nav-back" onClick={() => navigate(location.pathname === '/register' ? '/login' : '/')}>
            <ArrowLeft size={18} />
            <span>{location.pathname === '/register' ? 'กลับหน้าเข้าสู่ระบบ' : 'กลับหน้าหลัก'}</span>
          </button>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="nav-content">
        <Link to="/" className="brand">
          <div className="logo-circle-nav"><ShoppingCart size={20} color="#FFFFFF" strokeWidth={2.5} /></div>
          PriceFinder
        </Link>
        
        <div className="nav-right">
          <ul className="menu">
            <li><NavLink to="/" end>HOME</NavLink></li>
            <li><NavLink to="/favorites">FAVORITES</NavLink></li>
            <li><NavLink to="/mylists">MYLISTS</NavLink></li>
            <li><NavLink to="/promotion">PROMOTION</NavLink></li>
          </ul>

          <div className="nav-actions">
            {/* 4. ส่วนของกระดิ่งที่เรียกใช้ NotificationList */}
            <div className="noti-wrapper" ref={notiRef}>
              <button 
                className={`notification-btn ${showNoti ? 'active' : ''}`} 
                onClick={() => setShowNoti(!showNoti)}
              >
                <Bell size={20} />
                <span className="noti-dot"></span>
              </button>

              {/* แสดง Component NotificationList ของคุณเมื่อกดปุ่ม */}
              {showNoti && (
                <div className="noti-dropdown-container">
                  <NotificationList />
                </div>
              )}
            </div>

            {user ? (
              <div className="user-profile" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="user-profile-image" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', marginRight: '8px' }} />
                ) : (
                  <div className="user-initials-badge" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>
                    <span className="initials-text">{getInitials(user.name || user.given_name || user.email || '')}</span>
                  </div>
                )}
                <span className="user-name">{(user.given_name || user.name || "").split(' ')[0]}</span>
              </div>
            ) : (
              <Link to="/login"><button className="login-btn">LOGIN</button></Link>
            )}
          </div>

          <button type="button" className="nav-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <div className={`mobile-menu ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
        <ul className="mobile-menu-list">
          <li><NavLink to="/" end onClick={() => setMobileMenuOpen(false)}>HOME</NavLink></li>
          <li><NavLink to="/favorites" onClick={() => setMobileMenuOpen(false)}>FAVORITES</NavLink></li>
          <li><NavLink to="/mylists" onClick={() => setMobileMenuOpen(false)}>MYLISTS</NavLink></li>
          <li><NavLink to="/promotion" onClick={() => setMobileMenuOpen(false)}>PROMOTION</NavLink></li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;