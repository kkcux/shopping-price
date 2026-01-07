import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import "./Login.css";

import Navbar from "../Home/Navbar";
import Footer from "../Home/Footer";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const navigate = useNavigate();
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // --- ส่วนจัดการ Google Login ---
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // 1. ดึงข้อมูล User จาก Google
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );

        console.log("User Info:", userInfo.data);

        // 2. บันทึกข้อมูลลงเครื่อง (เพื่อให้หน้าอื่นรู้ว่าล็อกอินแล้ว)
        localStorage.setItem('user', JSON.stringify(userInfo.data));
        localStorage.setItem('token', tokenResponse.access_token);

        // 3. ไปหน้าแรกทันที
        navigate("/"); 

      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    },
    onError: error => console.log('Login Failed:', error)
  });
  // -----------------------------

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Login submitted");
    // ตัวอย่าง: ล็อกอินแบบปกติเสร็จ ก็ให้ไปหน้าแรกเหมือนกัน
    // navigate("/"); 
  };

  return (
    <div className="page-container">
      
      <Navbar />

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

            {/* ปุ่ม Google Custom ที่แก้ไขแล้ว */}
            <button 
                type="button" 
                className="btn-google" 
                onClick={() => loginWithGoogle()}
            >
              <FcGoogle size={22} />
              เข้าสู่ระบบด้วย Google
            </button>   
          </form>

          <div className="auth-footer-text">
            ยังไม่มีบัญชี? <span className="register-link" onClick={() => navigate("/register")}>สมัครสมาชิก</span>
          </div>
        </div>
      </main>

      <Footer />
      
    </div>
  );
};

export default Login;