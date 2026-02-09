import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../Home/Navbar";
import Footer from "../Home/Footer";
import { LockKeyhole } from "lucide-react";
import "./resetpassword.css";
import { auth } from "../../firebase-config";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get("oobCode") || "";
  const mode = searchParams.get("mode") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showError, setShowError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [resetEmail, setResetEmail] = useState("");
  const [success, setSuccess] = useState(false);

  const canSubmit = useMemo(() => {
    if (!password || !confirm) return false;
    if (password.length < 6) return false;
    if (password !== confirm) return false;
    if (!oobCode) return false;
    if (verifying) return false;
    if (success) return false;
    return true;
  }, [password, confirm, oobCode, verifying, success]);

  useEffect(() => {
    let mounted = true;

    async function run() {
      // ต้องเข้ามาจากลิงก์ในอีเมลของ Firebase (จะมี oobCode)
      if (!oobCode) {
        if (mounted) {
          setShowError("ไม่พบโค้ดรีเซ็ตรหัสผ่าน กรุณาเปิดลิงก์จากอีเมลที่ระบบส่งให้");
          setVerifying(false);
        }
        return;
      }

      // ถ้ามี mode แต่ไม่ใช่ resetPassword ก็ยังพยายาม verify ตาม oobCode ได้
      try {
        const email = await verifyPasswordResetCode(auth, oobCode);
        if (!mounted) return;
        setResetEmail(email || "");
        setVerifying(false);
      } catch {
        if (!mounted) return;
        setVerifying(false);
        setShowError("ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุ กรุณาขอลิงก์ใหม่อีกครั้ง");
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, [oobCode, mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowError("");

    if (!password || !confirm) {
      setShowError("กรุณากรอกข้อมูลให้ครบ");
      return;
    }
    if (password.length < 6) {
      setShowError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    if (password !== confirm) {
      setShowError("รหัสผ่านไม่ตรงกัน");
      return;
    }
    if (!oobCode) {
      setShowError("ไม่พบโค้ดรีเซ็ตรหัสผ่าน กรุณาเปิดลิงก์จากอีเมล");
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setSuccess(true);
      // แสดงข้อความสำเร็จแล้วค่อย redirect ไปหน้า login
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500); // รอ 1.5 วินาทีเพื่อให้ user เห็นข้อความสำเร็จ
    } catch (error) {
      const code = error?.code || "";
      if (code === "auth/expired-action-code" || code === "auth/invalid-action-code") {
        setShowError("ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุ กรุณาขอลิงก์ใหม่อีกครั้ง");
      } else if (code === "auth/weak-password") {
        setShowError("รหัสผ่านง่ายเกินไป กรุณาลองใหม่");
      } else {
        setShowError("เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาลองใหม่");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-page">
      <Navbar />

      {/* ปุ่มกลับ (มุมขวาบน) */}
      <div className="reset-top-actions">
        <button
          className="reset-back-btn"
          type="button"
          onClick={() => navigate("/")}
        >
          ← กลับไปยังหน้าหลัก
        </button>
      </div>

      <main className="reset-main">
        <h1 className="reset-title">เปลี่ยนรหัสผ่านใหม่</h1>
        <p className="reset-subtitle">
          {resetEmail ? `กำลังตั้งรหัสผ่านใหม่สำหรับ ${resetEmail}` : "สร้างรหัสผ่านใหม่เพื่อใช้งาน PriceFinder"}
        </p>

        <section className="reset-card">
          <form className="reset-form" onSubmit={handleSubmit}>
            {/* Password */}
            <label className="reset-label">รหัสผ่านใหม่</label>
            <div className="reset-input-wrap">
              <span className="reset-icon">
                <LockKeyhole size={18} strokeWidth={2.2} />
              </span>
              <input
                className="reset-input"
                type="password"
                placeholder="กรอกรหัสผ่านใหม่ของคุณ"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || verifying || success}
              />
            </div>

            {/* Confirm */}
            <label className="reset-label">ยืนยันรหัสผ่าน</label>
            <div className="reset-input-wrap">
              <span className="reset-icon">
                <LockKeyhole size={18} strokeWidth={2.2} />
              </span>
              <input
                className="reset-input"
                type="password"
                placeholder="ยืนยันรหัสผ่านใหม่ของคุณ"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={loading || verifying || success}
              />
            </div>

            {showError ? <div className="reset-error">{showError}</div> : null}
            
            {success && (
              <div style={{
                backgroundColor: '#e8f5e9',
                color: '#2e7d32',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '15px',
                textAlign: 'center',
                fontSize: '0.9rem'
              }}>
                ✅ เปลี่ยนรหัสผ่านสำเร็จ! กำลังไปหน้าเข้าสู่ระบบ...
              </div>
            )}

            <button className="reset-submit" type="submit" disabled={loading || !canSubmit || success}>
              {verifying ? "กำลังตรวจสอบลิงก์..." : loading ? "กำลังบันทึก..." : success ? "สำเร็จ" : "ยืนยัน"}
            </button>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
}
