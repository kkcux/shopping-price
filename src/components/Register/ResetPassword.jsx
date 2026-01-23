import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Home/Navbar";
import Footer from "../Home/Footer";
import { LockKeyhole } from "lucide-react";
import "./resetpassword.css";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showError, setShowError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    if (!password || !confirm) return false;
    if (password.length < 6) return false;
    if (password !== confirm) return false;
    return true;
  }, [password, confirm]);

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

    setLoading(true);
    try {
      // ✅ ตรงนี้ค่อยเชื่อม Firebase จริงภายหลัง
      // เช่น: await updatePassword(...)
      await new Promise((r) => setTimeout(r, 900));

      // ✅ สำเร็จแล้วกลับไปหน้าเข้าสู่ระบบ
      navigate("/login");
    } catch (err) {
      setShowError("เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาลองใหม่");
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
        <p className="reset-subtitle">สร้างรหัสผ่านใหม่เพื่อใช้งาน PriceFinder</p>

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
              />
            </div>

            {showError ? <div className="reset-error">{showError}</div> : null}

            <button className="reset-submit" type="submit" disabled={loading || !canSubmit}>
              {loading ? "กำลังบันทึก..." : "ยืนยัน"}
            </button>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
}
