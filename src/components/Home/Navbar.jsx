import React from 'react';
import { ShoppingCart, Bell, ArrowLeft } from 'lucide-react'; // เพิ่ม ArrowLeft
import { Link, useLocation, useNavigate } from 'react-router-dom'; // เพิ่ม useLocation, useNavigate
import './Navbar.css';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  // เช็คว่าตอนนี้อยู่หน้า Login หรือ Register หรือไม่
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  // กำหนดข้อความและลิงก์ของปุ่มย้อนกลับตามหน้า
  const getBackBtnConfig = () => {
    if (location.pathname === '/register') {
      return { text: 'กลับหน้าเข้าสู่ระบบ', path: '/login' };
    }
    // กรณีหน้า Login หรือหน้าอื่นๆ ให้กลับหน้าหลัก
    return { text: 'กลับหน้าหลัก', path: '/' };
  };

  const backConfig = getBackBtnConfig();

  // --- กรณีเป็นหน้า Login/Register (แสดงแบบ Simple) ---
  if (isAuthPage) {
    return (
      <nav className="navbar">
        <div className="container nav-content">
          {/* Logo (กดแล้วกลับหน้าหลักเสมอ) */}
          <Link to="/" style={{textDecoration:'none', color:'inherit'}}>
            <div className="brand">
              <div className="logo-circle-nav">
                <ShoppingCart size={22} color="#22c55e" strokeWidth={2.5} />
              </div>
              PriceFinder
            </div>
          </Link>

          {/* ปุ่มย้อนกลับ (ทรงแคปซูลสีเทา) */}
          <button className="btn-nav-back" onClick={() => navigate(backConfig.path)}>
            <ArrowLeft size={20} />
            <span>{backConfig.text}</span>
          </button>
        </div>
      </nav>
    );
  }

  // --- กรณีเป็นหน้าทั่วไป (แสดงเมนูเต็มรูปแบบ) ---
  return (
    <nav className="navbar">
      <div className="container nav-content">
        <Link to="/" style={{textDecoration:'none', color:'inherit'}}>
          <div className="brand">
            <div className="logo-circle-nav">
              <ShoppingCart size={22} color="#22c55e" strokeWidth={2.5} />
            </div>
            PriceFinder
          </div>
        </Link>
        
        <ul className="menu">
          <Link to="/" style={{textDecoration:'none', color:'inherit'}}><li>HOME</li></Link>
          <Link to="/favorites" style={{textDecoration:'none', color:'inherit'}}><li>FAVORITES</li></Link>
          <Link to="/mylists" style={{textDecoration:'none', color:'inherit'}}><li>MYLISTS</li></Link>
        </ul>

        <div className="nav-actions">
          <Link to="/login">
            <button className="login-btn">LOGIN</button>
          </Link>
          <Bell className="bell-icon" size={24} />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;