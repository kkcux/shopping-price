import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// ใช้ CSS ตัวเดียวกับ Login เพื่อให้ Theme เหมือนกันเป๊ะ
import "../Login/Login.css";

import {
  FiShoppingCart,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowLeft
} from "react-icons/fi";

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
          <span>กลับหน้าเข้าสู่ระบบ</span>
        </button>
      </header>

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

            {/* Agreement (Checkbox แบบใหม่) */}
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
              onClick={() => navigate("/")}
            >
              เข้าสู่ระบบ
            </span>
          </div>
        </div>
      </main>

      {/* ================= Footer (4 คอลัมน์ เหมือนหน้า Login) ================= */}
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

export default Register;