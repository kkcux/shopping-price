import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
// ❌ ลบ @react-oauth/google และ axios ออก เพราะเราจะใช้ Firebase แทน
// import { useGoogleLogin } from '@react-oauth/google';
// import axios from 'axios';
import "./Login.css";

// ✅ 1. Import Firebase
import { auth } from "../../firebase-config"; // ตรวจสอบ path ให้ถูกต้อง
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

import Navbar from "../Home/Navbar";
import Footer from "../Home/Footer";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  
  // ✅ 2. เพิ่ม State สำหรับเก็บค่าจากฟอร์ม
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // เอาไว้โชว์ข้อความสีแดงเวลากรอกผิด

  // หน้าปลายทาง (ถ้าไม่มีให้ไปหน้า MyLists แทนหน้าแรก จะได้เห็น Dashboard เลย)
  const from = location.state?.from || "/";

  // --- ส่วนจัดการ Google Login (Firebase Version) ---
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      // คำสั่งเดียวจบ เด้ง Popup -> Login -> เชื่อม Database
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // console.log("Google Login สำเร็จ:", user);

      // บันทึกข้อมูลลงเครื่อง (เพื่อให้ Navbar โชว์รูปได้ทันที)
      localStorage.setItem('user', JSON.stringify({
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        photoURL: user.photoURL
      }));
      localStorage.setItem('token', user.accessToken);

      // Redirect ไปหน้าเดิม
      navigate(from, { replace: true });

    } catch (error) {
      console.error("Google Login Error:", error);
      setErrorMessage("เกิดข้อผิดพลาดในการเชื่อมต่อ Google");
    }
  };

  // --- ส่วนจัดการ Email Login (Firebase Version) ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // เคลียร์ error เก่าก่อน

    try {
      // ส่ง Email/Password ไปตรวจสอบที่ Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("Email Login สำเร็จ:", user);
      
      // บันทึก user ลง LocalStorage
      localStorage.setItem('user', JSON.stringify({
        uid: user.uid,
        email: user.email,
        // user.displayName อาจจะว่างถ้าสมัครด้วย email แต่ไม่เป็นไร
      }));
      localStorage.setItem('token', user.accessToken);

      // Redirect
      navigate(from, { replace: true });

    } catch (error) {
      console.error("Login Error:", error);
      // แปล Error เป็นภาษาไทย
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        setErrorMessage("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      } else if (error.code === 'auth/too-many-requests') {
        setErrorMessage("คุณล็อกอินผิดบ่อยเกินไป กรุณารอสักครู่");
      } else {
        setErrorMessage("เข้าสู่ระบบไม่สำเร็จ: " + error.message);
      }
    }
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

          {/* ✅ 3. ส่วนแสดง Error Message (ถ้ามี) */}
          {errorMessage && (
            <div style={{ 
              backgroundColor: '#ffebee', 
              color: '#c62828', 
              padding: '10px', 
              borderRadius: '8px', 
              marginBottom: '15px',
              textAlign: 'center',
              fontSize: '0.9rem'
            }}>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>อีเมล</label>
              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input 
                  type="email" 
                  placeholder="กรอกอีเมลของคุณ" 
                  required 
                  // ✅ 4. ผูกค่ากับ State
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
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
                  // ✅ 4. ผูกค่ากับ State
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {/* ✅ 5. ปุ่ม Google เรียกใช้ฟังก์ชัน Firebase */}
            <button 
                type="button" 
                className="btn-google" 
                onClick={handleGoogleLogin}
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