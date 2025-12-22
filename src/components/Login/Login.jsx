import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

import { FiShoppingCart, FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const navigate = useNavigate();
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Login submitted");
  };

  return (
    <div className="page-container">
      {/* ================= Header (Nav) ================= */}
      <header className="site-header">
        <div className="brand">
          <div className="brand-logo">
            <FiShoppingCart size={20} />
          </div>
          <span className="brand-text">PriceFinder</span>
        </div>

        <button className="btn-back" onClick={() => navigate("/")}>
          <FiArrowLeft size={16} />
          <span>กลับไปยังหน้าหลัก</span>
        </button>
      </header>

      {/* ================= Main Content (Card) ================= */}
      <main className="main-content">
        <div className="auth-card">
          <div className="auth-header">
            <h1>เข้าสู่ระบบ</h1>
            <p>เข้าสู่ระบบเพื่อใช้งานฟีเจอร์ต่างๆ ของ PriceFinder</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>อีเมล</label>
              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input type="email" placeholder="กรอกอีเมลของคุณ" required />
              </div>
            </div>

            <div className="form-group">
              <label>รหัสผ่าน</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="กรอกรหัสผ่านของคุณ"
                  required
                />
                <div className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </div>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span className="custom-checkbox"></span>
                <span className="label-text">จดจำการเข้าสู่ระบบ</span>
              </label>

              <span className="forgot-password-link" onClick={() => navigate("/forgot-password")}>
                ลืมรหัสผ่าน?
              </span>
            </div>

            <button type="submit" className="btn-submit">เข้าสู่ระบบ</button>

            <div className="divider">
              <span>หรือเข้าสู่ระบบด้วย</span>
            </div>

            <button type="button" className="btn-google">
              <FcGoogle size={22} />
              เข้าสู่ระบบด้วย Google
            </button>
          </form>

          <div className="auth-footer-text">
            ยังไม่มีบัญชี? <span className="register-link" onClick={() => navigate("/register")}>สมัครสมาชิก</span>
          </div>
        </div>
      </main>

      {/* ================= Footer ================= */}
      <footer className="site-footer">
        <div className="footer-content">
          {/* Brand Col */}
          <div className="footer-col brand-col">
            <div className="brand footer-brand">
              <div className="brand-logo footer-logo">
                <FiShoppingCart size={18} />
              </div>
              <span className="brand-text">PriceFinder</span>
            </div>
            <p className="footer-desc">
              เปรียบเทียบราคาสินค้าจากร้านค้าชั้นนำ เพื่อให้คุณได้สินค้าคุณภาพดีในราคาที่ดีที่สุด
            </p>
          </div>

          {/* Service Col */}
          <div className="footer-col">
            <h3>บริการ</h3>
            <ul>
              <li>เปรียบเทียบราคาสินค้า</li>
              <li>รายการโปรด</li>
              <li>แจ้งเตือนราคา</li>
            </ul>
          </div>

          {/* Category Col */}
          <div className="footer-col">
            <h3>หมวดหมู่</h3>
            <ul>
              <li>อาหาร</li>
              <li>เครื่องดื่ม</li>
              <li>ผักและผลไม้</li>
              <li>อิเล็กทรอนิกส์</li>
            </ul>
          </div>

          {/* More Category Col */}
          <div className="footer-col">
            <h3>หมวดหมู่เพิ่มเติม</h3>
            <ul>
              <li>อาหารแห้งและเครื่องปรุง</li>
              <li>ขนมและของหวาน</li>
              <li>เนื้อสัตว์</li>
              <li>ของใช้ในบ้าน</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom-line"></div>
      </footer>
    </div>
  );
};

export default Login;