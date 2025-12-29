import React from 'react';
import { ShoppingCart, Bell, ArrowLeft } from 'lucide-react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom'; // ✅ ใช้ NavLink
import './Navbar.css';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

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
              {/* ✨ เปลี่ยนไอคอนเป็นสีขาวเพื่อให้เด่นบนพื้นโลโก้สีดำ */}
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
          {/* ✅ ใช้ NavLink เพื่อให้ CSS จัดการสถานะ active ได้สวยงาม */}
          <li><NavLink to="/" end>HOME</NavLink></li>
          <li><NavLink to="/favorites">FAVORITES</NavLink></li>
          <li><NavLink to="/mylists">MYLISTS</NavLink></li>
        </ul>

        <div className="nav-actions">
          <Link to="/login">
            <button className="login-btn">LOGIN</button>
          </Link>
          <div className="bell-icon">
            <Bell size={22} />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;