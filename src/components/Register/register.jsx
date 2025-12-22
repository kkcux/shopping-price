import React, { useState } from "react";
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
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="page-wrapper">
      {/* Header */}
      <header className="site-header">
        <div className="brand">
          <div className="brand-logo">
            <FiShoppingCart size={20} />
          </div>
          <span className="brand-text">PriceFinder</span>
        </div>

        <button className="btn-back">
          <FiArrowLeft size={16} />
          กลับหน้าเข้าสู่ระบบ
        </button>
      </header>

      {/* Main */}
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

          <form>
            {/* Email */}
            <div className="form-group">
              <label>อีเมล</label>
              <div className="input-with-icon">
                <FiMail className="input-icon" />
                <input type="email" placeholder="กรอกอีเมลของคุณ" />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label>รหัสผ่าน</label>
              <div className="input-with-icon">
                <FiLock className="input-icon" />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="กรอกรหัสผ่าน"
                />
                <span
                  className="toggle-password"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label>ยืนยันรหัสผ่าน</label>
              <div className="input-with-icon">
                <FiLock className="input-icon" />
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="ยืนยันรหัสผ่าน"
                />
                <span
                  className="toggle-password"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>
            </div>

            {/* Agreement (FIXED) */}
            <div className="form-options">
              <label className="checkbox-wrapper">
                <input type="checkbox" />
                <span className="agreement-text">
                  ยอมรับ{" "}
                  <span className="link">เงื่อนไขการใช้งาน</span>{" "}
                  และ{" "}
                  <span className="link">นโยบายความเป็นส่วนตัว</span>
                </span>
              </label>
            </div>

            <button type="submit" className="btn-submit">
              สมัครสมาชิก
            </button>
          </form>

          <div className="auth-footer">
            มีบัญชีอยู่แล้ว? <a href="#">เข้าสู่ระบบ</a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-brand-section">
            <div className="brand footer-brand">
              <div className="brand-logo">
                <FiShoppingCart size={20} />
              </div>
              <span className="brand-text">PriceFinder</span>
            </div>
            <p className="footer-desc">
              เปรียบเทียบราคาสินค้าจากร้านค้าชั้นนำ
              เพื่อให้คุณได้สินค้าคุณภาพดีในราคาที่ดีที่สุด
            </p>
          </div>

          <div className="link-group">
            <h3>บริการ</h3>
            <ul>
              <li>เปรียบเทียบราคาสินค้า</li>
              <li>รายการโปรด</li>
              <li>แจ้งเตือนราคา</li>
            </ul>
          </div>

          <div className="link-group">
            <h3>หมวดหมู่</h3>
            <ul>
              <li>อาหาร</li>
              <li>เครื่องดื่ม</li>
              <li>ผักและผลไม้</li>
              <li>อิเล็กทรอนิกส์</li>
            </ul>
          </div>

          <div className="link-group">
            <h3>หมวดหมู่เพิ่มเติม</h3>
            <ul>
              <li>อาหารแห้งและเครื่องปรุง</li>
              <li>ขนมและของหวาน</li>
              <li>เนื้อสัตว์</li>
              <li>ของใช้ในบ้าน</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom-line" />
      </footer>
    </div>
  );
};

export default Register;
