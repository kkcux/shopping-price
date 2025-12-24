import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// ใช้ CSS ตัวเดียวกับ Login เพื่อให้ Theme เหมือนกันเป๊ะ
import "../Login/Login.css";


import Navbar from "../Home/Navbar";
import Footer from "../Home/Footer";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

const Register = () => {
  const navigate = useNavigate();

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);

  const handleRegister = (e) => {
    e.preventDefault();

    if (!agree) {
      alert("กรุณายอมรับเงื่อนไขการใช้งาน");
      return;
    }

    console.log("สมัครสมาชิกสำเร็จ");
    // TODO: ต่อ API สมัครสมาชิก
  };

  return (
    <div className="page-container">
      
      {/*  ใส่ Navbar ตรงนี้ */}
      <Navbar />

      {/* ================= Main Content (Card) ================= */}
      <main className="main-content">
        <div className="auth-card">
          <div className="auth-header">
            <h1>สมัครสมาชิก</h1>
            <p>
              สร้างบัญชีใหม่เพื่อเริ่มใช้งาน PriceFinder
              <br />
              และค้นหาราคาสินค้าที่ดีที่สุด
            </p>
          </div>

          <form onSubmit={handleRegister}>
            {/* Email */}
            <div className="form-group">
              <label>อีเมล</label>
              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  placeholder="กรอกอีเมลของคุณ"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label>รหัสผ่าน</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="กำหนดรหัสผ่าน"
                  required
                />
                <div
                  className="toggle-password"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label>ยืนยันรหัสผ่าน</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                  required
                />
                <div
                  className="toggle-password"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <FiEyeOff /> : <FiEye />}
                </div>
              </div>
            </div>

            {/* Agreement (Checkbox) */}
            <div className="form-options" style={{ justifyContent: 'flex-start' }}>
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                />
                <span className="custom-checkbox"></span>
                <span className="label-text">
                  ยอมรับ{" "}
                  <span className="register-link">เงื่อนไขการใช้งาน</span>{" "}
                  และ{" "}
                  <span className="register-link">นโยบายความเป็นส่วนตัว</span>
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="btn-submit"
              disabled={!agree}
              // เพิ่ม style ให้ปุ่มจางลงถ้ายังไม่ติ๊ก
              style={{ opacity: agree ? 1 : 0.6, cursor: agree ? 'pointer' : 'not-allowed' }}
            >
              สมัครสมาชิก
            </button>
          </form>

          <div className="auth-footer-text">
            มีบัญชีอยู่แล้ว?{" "}
            <span
              className="register-link"
              onClick={() => navigate("/login")}
            >
              เข้าสู่ระบบ
            </span>
          </div>
        </div>
      </main>

      {/*  ใส่ Footer ตรงนี้ */}
      <Footer />
      
    </div>
  );
};

export default Register;