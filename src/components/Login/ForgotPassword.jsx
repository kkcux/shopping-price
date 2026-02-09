import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase-config";
import { sendPasswordResetEmail, fetchSignInMethodsForEmail } from "firebase/auth";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
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
      // ✅ เช็คว่า email นี้ใช้ Google Login หรือไม่
      try {
        const signInMethods = await fetchSignInMethodsForEmail(auth, email);
        
        // ถ้า email นี้ใช้ Google Login เท่านั้น (ไม่มี password)
        if (signInMethods.length > 0 && signInMethods.includes('google.com') && !signInMethods.includes('password')) {
          setMessage({ 
            type: "error", 
            text: "อีเมลนี้ใช้ Google Login กรุณาเข้าสู่ระบบผ่าน Google แทน" 
          });
          setLoading(false);
          return;
        }
      } catch (authError) {
        // ถ้า email ไม่มีในระบบ จะ throw error แต่เราจะเช็คต่อใน catch block ด้านล่าง
        if (authError.code !== 'auth/user-not-found') {
          console.warn("Error checking sign-in methods:", authError);
        }
      }

      // ✅ เช็คว่ามี email ใน Firestore หรือไม่ก่อนส่ง email
      // ต้องแก้ Firestore rules ให้อนุญาตให้อ่าน users collection โดย email
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setMessage({ type: "error", text: "ไม่พบอีเมลนี้ในระบบหรืออีเมลไม่ถูกต้อง/หากลงทะเบียนด้วย Google กรุณาเข้าสู่ระบบผ่าน Google แทน" });
          setLoading(false);
          return;
        }
      } catch (firestoreError) {
        // ถ้ามีปัญหา permissions ให้ข้ามไปใช้ Firebase Auth เช็คแทน
        console.warn("Firestore check failed, using Auth check instead:", firestoreError);
      }

      // ✅ ถ้ามี email ใน Firestore แล้วค่อยส่งลิงก์รีเซ็ตรหัสผ่าน
      // เมื่อเปลี่ยนรหัสผ่านสำเร็จในหน้า Firebase แล้วกด CONTINUE จะ redirect มาหน้า login
      const actionCodeSettings = {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false, // บังคับให้ใช้ web redirect แทน Firebase default page
      };
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      
      // ✅ ถ้าส่งสำเร็จ แสดงว่ามี email ในระบบ
      setMessage({
        type: "success",
        text: "ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลของคุณแล้ว (กรุณาตรวจสอบกล่องจดหมาย/สแปม)",
      });
      setEmail("");
    } catch (error) {
      console.error(error);
      // ✅ Firebase จะ throw error ถ้าไม่มี email ในระบบ
      if (error.code === "auth/user-not-found") {
        setMessage({ type: "error", text: "ไม่พบอีเมลนี้ในระบบ" });
      } else if (error.code === "auth/invalid-email") {
        setMessage({ type: "error", text: "รูปแบบอีเมลไม่ถูกต้อง" });
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
            <p>ระบบจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปที่อีเมลของคุณ</p>
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
              {loading ? "กำลังส่งลิงก์..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
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