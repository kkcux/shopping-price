import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Home/Navbar";
import Footer from "../Home/Footer";
import { Check } from "lucide-react";
import "./verifysuccess.css";

export default function VerifySuccess() {
  const navigate = useNavigate();

  return (
    <div className="verify-success-page">
      <Navbar />

      {/* ปุ่มกลับหน้าเข้าสู่ระบบ (มุมขวาบน) */}
      <div className="verify-success-top-actions">
        <button
          className="verify-success-back-btn"
          type="button"
          onClick={() => navigate("/login")}
        >
          ← กลับหน้าเข้าสู่ระบบ
        </button>
      </div>

      <main className="verify-success-main">
        <h1 className="verify-success-title">ลืมรหัสผ่าน</h1>

        <section className="verify-success-card">
          <div className="verify-success-icon">
            <div className="verify-success-icon-circle">
              <Check size={26} strokeWidth={3} />
            </div>
          </div>

          <h2 className="verify-success-card-title">ยืนยันรหัสสำเร็จ</h2>
          <p className="verify-success-desc">คุณสามารถตั้งรหัสผ่านใหม่ได้แล้ว</p>

          <button
            className="verify-success-submit"
            type="button"
            onClick={() => navigate("/reset-password")}
          >
            ตั้งค่ารหัสผ่านใหม่
          </button>
        </section>
      </main>

      <Footer />
    </div>
  );
}
