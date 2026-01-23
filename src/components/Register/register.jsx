import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ใช้ CSS ตัวเดียวกับ Login เพื่อให้ Theme เหมือนกันเป๊ะ
import "../Login/Login.css";

// ✅ 1. Import Firebase และฟังก์ชันที่จำเป็น
import { auth, db } from "../../firebase-config";
import { 
  createUserWithEmailAndPassword, 
  updateProfile // เพิ่มตัวนี้มาเพื่อใช้อัปเดตชื่อผู้ใช้
} from "firebase/auth";
import { doc, setDoc, collection, query, where, getDocs, limit } from "firebase/firestore";

import Navbar from "../Home/Navbar";
import Footer from "../Home/Footer";
// เพิ่ม FiUser สำหรับไอคอนชื่อ
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiUser } from "react-icons/fi";

const Register = () => {
  const navigate = useNavigate();

  // ✅ Scroll to top เมื่อเข้าหน้า
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // ✅ 2. State สำหรับเก็บข้อมูล (เพิ่ม displayName)
  const [displayName, setDisplayName] = useState(""); // ชื่อผู้ใช้งาน
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // State สำหรับ UI
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // เคลียร์ Error เก่า

    // --- Validation Checks ---
    if (!displayName.trim()) {
      setErrorMessage("กรุณาระบุชื่อผู้ใช้งาน");
      return;
    }
    if (!agree) {
      setErrorMessage("กรุณายอมรับเงื่อนไขการใช้งาน");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setLoading(true);

    try {
      // ✅ เช็ค email ซ้ำใน Firestore ก่อนสร้าง user
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          setErrorMessage("อีเมลนี้ถูกใช้งานแล้ว");
          setLoading(false);
          return;
        }
      } catch (firestoreError) {
        // ถ้ามีปัญหา permissions ให้ข้ามไปใช้ Firebase Auth เช็คแทน
        console.warn("Firestore check failed, using Auth check instead:", firestoreError);
      }

      // ✅ 3. สร้าง User ใน Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ✅ 4. อัปเดต Display Name ใน Authentication Profile
      // เพื่อให้ user.displayName มีค่าทันที
      await updateProfile(user, {
        displayName: displayName
      });

      // ✅ 5. บันทึกข้อมูล User ลง Firestore
      try {
        await setDoc(doc(db, "users", user.uid), {
            displayName: displayName, // บันทึกชื่อลง DB
            email: user.email,
            createdAt: new Date(),
            role: "user"
        });
      } catch (firestoreError) {
        console.error("Error saving user data:", firestoreError);
      }

      console.log("สมัครสมาชิกสำเร็จ:", user);

      // ✅ 6. บันทึก Session ลง LocalStorage
      // ตอนนี้ใช้ displayName จริงๆ ได้แล้ว ไม่ต้องตัด string จาก email
      localStorage.setItem('user', JSON.stringify({
        uid: user.uid,
        email: user.email,
        name: displayName // ใช้ชื่อที่กรอกมา
      }));
      localStorage.setItem('token', user.accessToken);

      // Redirect ไปหน้าแรก
      navigate("/");

    } catch (error) {
      console.error("Registration Error:", error);
      // แปลง Error Message เป็นภาษาไทย
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage("อีเมลนี้ถูกใช้งานแล้ว");
      } else if (error.code === 'auth/invalid-email') {
        setErrorMessage("รูปแบบอีเมลไม่ถูกต้อง");
      } else if (error.code === 'auth/weak-password') {
        setErrorMessage("รหัสผ่านง่ายเกินไป");
      } else {
        setErrorMessage("เกิดข้อผิดพลาด: " + error.message);
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
            <h1>สมัครสมาชิก</h1>
            <p>
              สร้างบัญชีใหม่เพื่อเริ่มใช้งาน PriceFinder
              <br />
              และค้นหาราคาสินค้าที่ดีที่สุด
            </p>
          </div>

          {/* ส่วนแสดง Error Message */}
          {errorMessage && (
            <div style={{ 
              backgroundColor: '#ffebee', 
              color: '#c62828', 
              padding: '12px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              textAlign: 'center',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <FiAlertCircle /> {errorMessage}
            </div>
          )}

          <form onSubmit={handleRegister}>
            
            {/* ✅ ส่วนที่เพิ่มเข้ามา: ชื่อผู้ใช้งาน */}
            <div className="form-group">
              <label>ชื่อผู้ใช้งาน</label>
              <div className="input-wrapper">
                <FiUser className="input-icon" />
                <input
                  type="text"
                  placeholder="กรอกชื่อของคุณ (เช่น หมูขาว จอมป่วน)"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label>อีเมล</label>
              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  placeholder="กรอกอีเมลของคุณ"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  placeholder="กำหนดรหัสผ่าน (ขั้นต่ำ 6 ตัวอักษร)"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
              disabled={!agree || loading}
              style={{ 
                opacity: (!agree || loading) ? 0.6 : 1, 
                cursor: (!agree || loading) ? 'not-allowed' : 'pointer' 
              }}
            >
              {loading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
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

      <Footer />
    </div>
  );
};

export default Register;