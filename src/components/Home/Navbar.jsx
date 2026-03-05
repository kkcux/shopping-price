import React, { useState, useEffect } from 'react';
// 1. เพิ่ม Bell เข้ามาใน import
import { ShoppingCart, ArrowLeft, Menu, X, Bell } from 'lucide-react'; 
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

import { auth } from '../../firebase-config'; 
import { onAuthStateChanged } from 'firebase/auth';

function Navbar() {
  // ... (โค้ดส่วน State และ useEffect เหมือนเดิม ไม่ต้องแก้) ...
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const getInitials = (displayName) => {
    if (!displayName) return '';
    return displayName.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
  };

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
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  }, [location]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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
    <>
      <nav className="navbar">
        <div className="nav-content">
          <Link to="/" className="brand">
            <div className="logo-circle-nav">
              <ShoppingCart size={20} color="#FFFFFF" strokeWidth={2.5} />
            </div>
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
            
            {/* 2. เพิ่มปุ่มกระดิ่งแจ้งเตือนตรงนี้ (จะแสดงตลอดไม่ว่าจะล็อกอินหรือไม่) */}
            <button className="notification-btn" aria-label="Notifications">
              <Bell size={20} />
            </button>

            {user ? (
              <div 
                className="user-profile" 
                onClick={() => navigate('/profile')} 
                style={{ cursor: 'pointer' }}
              >
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="Profile" 
                    className="user-profile-image"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      marginRight: '8px'
                    }}
                  />
                ) : (
                  <div className="user-initials-badge" style={{
                    width: '32px',
                    height: '32px',
                    fontSize: '0.75rem'
                  }}>
                    <span className="initials-text">
                      {getInitials(user.name || user.given_name || user.email || '')}
                    </span>
                  </div>
                )}
                <span className="user-name">
                  {(user.given_name || user.name || "").split(' ')[0]}
                </span>
              </div>
            ) : (
              <Link to="/login">
                <button className="login-btn">LOGIN</button>
              </Link>
            )}
          </div>

          <button
            type="button"
            className="nav-hamburger"
            aria-label="เปิดเมนู"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          </div>
        </div>

        {/* ... (Mobile Menu โค้ดส่วนล่างเหมือนเดิม) ... */}
        <div className={`mobile-menu ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
          <ul className="mobile-menu-list">
            <li><NavLink to="/" end onClick={() => setMobileMenuOpen(false)}>HOME</NavLink></li>
            <li><NavLink to="/favorites" onClick={() => setMobileMenuOpen(false)}>FAVORITES</NavLink></li>
            <li><NavLink to="/mylists" onClick={() => setMobileMenuOpen(false)}>MYLISTS</NavLink></li>
            <li><NavLink to="/promotion" onClick={() => setMobileMenuOpen(false)}>PROMOTION</NavLink></li>
          </ul>
        </div>
      </nav>
    </>
  );
}

export default Navbar;