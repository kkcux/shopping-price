import React from 'react';
import { ShoppingCart, Bell } from 'lucide-react';
import { Link } from 'react-router-dom'; // ✅ import Link

function Navbar() {
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
          {/* ใส่ style เพื่อลบเส้นขีดเส้นใต้ของ Link ถ้ามี */}
          <Link to="/" style={{textDecoration:'none', color:'inherit'}}><li>HOME</li></Link>
          <Link to="/favorites" style={{textDecoration:'none', color:'inherit'}}><li>FAVORITES</li></Link>
          <Link to="/mylists" style={{textDecoration:'none', color:'inherit'}}><li>MYLISTS</li></Link>
        </ul>

        <div className="nav-actions">
          
          {/* ✅ แก้ไขตรงนี้: เอา Link มาครอบปุ่ม LOGIN */}
          <Link to="/login">
            <button className="login-btn">LOGIN</button>
          </Link>
          
          <Bell className="bell-icon" />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;