import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase-config";
import { sendPasswordResetEmail } from "firebase/auth";
import { FiMail, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import Navbar from "../Home/Navbar";
import Footer from "../Home/Footer";
import "./Login.css";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    if (!email) {
      setMessage({ type: "error", text: "กรุณากรอกอีเมลของคุณ" });
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage({
        type: "success",
        text: "ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลของคุณแล้ว",
      });
      setEmail("");
    } catch (error) {
      console.error(error);
      if (error.code === "auth/user-not-found") {
        setMessage({ type: "error", text: "ไม่พบอีเมลนี้ในระบบ" });
      } else {
        setMessage({ type: "error", text: "เกิดข้อผิดพลาด: " + error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <Navbar />

      <main className="main-content">
        <div className="auth-card">
          <div className="auth-header">
            <h1>ลืมรหัสผ่าน</h1>
            <p>คุณต้องการรับรหัสยืนยัน</p>
          </div>

          {message.text && (
            <div className={`alert-box ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              {message.type === 'success' ? <FiCheckCircle size={18} /> : <FiAlertCircle size={18} />}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleResetPassword}>
            
            {/* ✅ กล่องข้อความแบบธรรมดา (ไม่มีรูป/ไอคอน) */}
            <div className="reset-method-box simple-text-mode">
              <div className="method-text">
                <span className="method-title">รับรหัสผ่านทางอีเมล</span>
                <span className="method-subtitle">
                  ส่งรหัสผ่านรีเซ็ตไปยังอีเมลของคุณ
                </span>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: "25px" }}>
              <label>อีเมล</label>
              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  placeholder="กรอกอีเมลของคุณ"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "กำลังส่งข้อมูล..." : "ส่งรหัสผ่านยืนยัน"}
            </button>
          </form>

          <div className="auth-footer-text">
            นึกรหัสผ่านออกแล้ว?{" "}
            <span className="register-link" onClick={() => navigate("/login")}>
              เข้าสู่ระบบ
            </span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ForgotPassword;