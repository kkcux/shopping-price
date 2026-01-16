import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Bell, ArrowLeft, LogOut } from 'lucide-react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { googleLogout } from '@react-oauth/google';
import './Navbar.css';
import NotificationList from '../Notification/NotificationList';

// ✅ 1. เพิ่ม Import Firebase Auth (สำคัญมาก!)
import { auth } from '../../firebase-config'; 
import { signOut } from 'firebase/auth';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);
  
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  }, [location]);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  // ✅ 2. แก้ไขฟังก์ชัน Logout ให้ SignOut จาก Firebase ด้วย
  const confirmLogout = async () => {
    try {
      // 1. สั่ง Firebase ให้ Logout (ตัวการสำคัญที่ทำให้ MyLists รู้ตัว)
      await signOut(auth);
      
      // 2. เคลียร์ส่วนอื่นๆ ตามปกติ
      googleLogout(); 
      localStorage.removeItem('user'); 
      localStorage.removeItem('token'); 
      
      // (Optional) เคลียร์ข้อมูลชั่วคราวอื่นๆ ถ้ามี
      // localStorage.removeItem('myLists'); 

      setUser(null);
      setShowLogoutConfirm(false); 
      
      // 3. ย้ายหน้าและรีเฟรชเพื่อความชัวร์ (ล้าง State ทั้งหมด)
      navigate('/login'); 
      window.location.reload(); 
      
    } catch (error) {
      console.error("Error signing out: ", error);
    }
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
    <>
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
            
            {user ? (
              <div 
                className="user-profile" 
                onClick={() => navigate('/profile')} 
                style={{ cursor: 'pointer' }}
              >
                <img src={user.picture} alt="Profile" className="user-avatar" />
                <span className="user-name">{(user.given_name || user.name).split(' ')[0]}</span>

                <button 
                  onClick={(e) => {
                    e.stopPropagation(); 
                    handleLogoutClick(); 
                  }}
                  className="btn-logout"
                  title="ออกจากระบบ"
                >
                  <LogOut size={12} />
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

      {showLogoutConfirm && (
        <div className="logout-confirm-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="logout-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>ยืนยันการออกจากระบบ</h3>
            <p>คุณต้องการออกจากระบบใช่หรือไม่?</p>
            <div className="logout-actions">
              <button className="btn-cancel" onClick={() => setShowLogoutConfirm(false)}>
                ยกเลิก
              </button>
              <button className="btn-confirm" onClick={confirmLogout}>
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;