import React from 'react';
import './Login.css';

import {
  FiShoppingCart,
  FiMail,
  FiLock,
  FiArrowLeft
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

const Login = () => {
  return (
    <div className="page-wrapper">
      <header className="site-header">
        <div className="brand">
          <div className="brand-logo">
            <FiShoppingCart size={22} />
          </div>
          <span className="brand-text">PriceFinder</span>
        </div>

        <button className="btn-back">
          <FiArrowLeft size={16} />
          กลับไปยังหน้าหลัก
        </button>
      </header>

      <main className="main-content">
        <div className="auth-header">
          <h1>เข้าสู่ระบบ</h1>
          <p>เข้าสู่ระบบเพื่อใช้งานฟีเจอร์ต่างๆ ของ PriceFinder</p>
        </div>

        <div className="auth-card">
          <form>
            {/* Email */}
            <div className="form-group">
              <label>อีเมล</label>
              <div className="input-with-icon">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  placeholder="กรอกอีเมลของคุณ"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label>รหัสผ่าน</label>
              <div className="input-with-icon">
                <FiLock className="input-icon" />
                <input
                  type="password"
                  placeholder="กรอกรหัสผ่านของคุณ"
                />
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-wrapper">
                <input type="checkbox" />
                จดจำการเข้าสู่ระบบ
              </label>

              <a href="#" className="forgot-pass">
                ลืมรหัสผ่าน?
              </a>
            </div>

            <button type="submit" className="btn-submit">
              เข้าสู่ระบบ
            </button>

            <div className="divider">
              <span>หรือเข้าสู่ระบบด้วย</span>
            </div>

            <button type="button" className="btn-google">
              <FcGoogle size={20} />
              เข้าสู่ระบบด้วย Google
            </button>
          </form>

          <div className="auth-footer">
            ยังไม่มีบัญชี? <a href="#">สมัครสมาชิก</a>
          </div>
        </div>
      </main>

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
              เปรียบเทียบราคาสินค้าจากร้านค้าชั้นนำเพื่อให้คุณได้สินค้าคุณภาพดีในราคาที่ดีที่สุด
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
            <h3 style={{ opacity: 0 }}>หมวดหมู่เพิ่มเติม</h3>
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

export default Login;
