import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

import Navbar from "../Home/Navbar";
import Footer from "../Home/Footer";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const navigate = useNavigate();
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Login submitted");
    // navigate("/"); // ตัวอย่าง: ล็อกอินเสร็จไปหน้าแรก
  };

  return (
    <div className="page-container">
      
      {/* Navbar ตรงนี้ */}
      <Navbar />

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

      {/* ใส่ Footer ตรงนี้ */}
      <Footer />
      
    </div>
  );
};

export default Login;