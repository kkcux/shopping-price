import React from 'react';
import { ShoppingCart, Bell } from 'lucide-react';
import { Link } from 'react-router-dom'; // ต้องใช้ตัวนี้

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
          <Link to="/"><li>HOME</li></Link>
          <Link to="/favorites"><li>FAVORITES</li></Link>
          <Link to="/mylists"><li>MYLISTS</li></Link>
        </ul>

        <div className="nav-actions">
          <button className="login-btn">LOGIN</button>
          <Bell className="bell-icon" />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;