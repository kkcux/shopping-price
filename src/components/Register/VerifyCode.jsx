import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// ถ้าคุณมี Navbar/Footer ของโปรเจกต์อยู่แล้ว ให้ import ตามของคุณได้เลย
import Navbar from "../Home/Navbar";
import Footer from "../Home/Footer";

// ✅ ใช้ CSS ที่คุณมีอยู่แล้ว (เปลี่ยนชื่อไฟล์ตามจริงของคุณ)
import "./verifycode.css";
import { Mail } from "lucide-react";


export default function VerifyCode() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ รับ email จากหน้าก่อนหน้า (ถ้าคุณส่งมาทาง state)
  // เช่น navigate("/verify", { state: { email } })
  const emailFromState = location?.state?.email || "abcdef@pricefinder@gmail.com";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const code = useMemo(() => otp.join(""), [otp]);

  useEffect(() => {
    // โฟกัสช่องแรก
    inputsRef.current?.[0]?.focus?.();
  }, []);

  useEffect(() => {
    // cooldown สำหรับ "ส่งรหัสอีกครั้ง"
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const focusIndex = (i) => {
    const el = inputsRef.current?.[i];
    if (el) el.focus();
  };

  const handleChange = (i, value) => {
    setError("");

    // รับเฉพาะตัวเลข 0-9
    const v = String(value || "").replace(/\D/g, "");

    // กรณีผู้ใช้พิมพ์/วางทีเดียวหลายตัวในช่องเดียว
    if (v.length > 1) {
      const chars = v.slice(0, 6).split("");
      const next = [...otp];
      for (let k = 0; k < chars.length; k++) {
        if (i + k < 6) next[i + k] = chars[k];
      }
      setOtp(next);

      const last = Math.min(i + chars.length, 6) - 1;
      focusIndex(Math.min(last + 1, 5));
      return;
    }

    const next = [...otp];
    next[i] = v;
    setOtp(next);

    // ถ้ากรอกแล้วให้เด้งไปช่องถัดไป
    if (v && i < 5) focusIndex(i + 1);
  };

  const handleKeyDown = (i, e) => {
    setError("");

    if (e.key === "Backspace") {
      // ถ้าช่องว่างอยู่แล้ว กด backspace ให้ย้อนช่องก่อนหน้า
      if (!otp[i] && i > 0) {
        const next = [...otp];
        next[i - 1] = "";
        setOtp(next);
        focusIndex(i - 1);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowLeft" && i > 0) {
      focusIndex(i - 1);
      e.preventDefault();
      return;
    }
    if (e.key === "ArrowRight" && i < 5) {
      focusIndex(i + 1);
      e.preventDefault();
      return;
    }
  };

  const handlePaste = (i, e) => {
    setError("");
    const text = e.clipboardData.getData("text");
    const v = String(text || "").replace(/\D/g, "").slice(0, 6);
    if (!v) return;

    const chars = v.split("");
    const next = [...otp];
    for (let k = 0; k < chars.length; k++) {
      if (i + k < 6) next[i + k] = chars[k];
    }
    setOtp(next);

    const last = Math.min(i + chars.length, 6) - 1;
    focusIndex(Math.min(last + 1, 5));
    e.preventDefault();
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError("");
    setLoading(true);

    try {
      // ✅ ตรงนี้คุณค่อยไปเชื่อม API/Firebase จริง
      // ตัวอย่าง: await resendOtp(emailFromState)
      await new Promise((r) => setTimeout(r, 700));

      setCooldown(30); // ส่งซ้ำได้อีกทีใน 30 วิ
    } catch {
      setError("ไม่สามารถส่งรหัสใหม่ได้ กรุณาลองอีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (code.length !== 6) {
      setError("กรุณากรอกรหัสให้ครบ 6 หลัก");
      return;
    }

    setLoading(true);
    try {
      // ✅ ตรงนี้คุณค่อยไปเชื่อม API/Firebase ตรวจ OTP จริง
      // ตัวอย่าง: await verifyOtp(emailFromState, code)
      await new Promise((r) => setTimeout(r, 900));

      // ✅ ถ้าถูกต้อง → ไปหน้าตั้งรหัสผ่านใหม่ (คุณเปลี่ยน route ได้)
      navigate("/reset-password", { state: { email: emailFromState } });
    } catch {
      setError("รหัสไม่ถูกต้อง กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-page">
      {/* ===== Header / Navbar ===== */}
      <Navbar />

      {/* ===== Top Right Back Button (ตามรูป) ===== */}
      <div className="verify-top-actions">
        <button
          className="verify-back-btn"
          type="button"
          onClick={() => navigate("/login")}
        >
          ← กลับหน้าเข้าสู่ระบบ
        </button>
      </div>

      {/* ===== Center Content ===== */}
      <main className="verify-main">
        <h1 className="verify-title">ลืมรหัสผ่าน</h1>

        <section className="verify-card">
          <div className="verify-icon">
            {/* ถ้าคุณมีไอคอนของคุณเอง ใส่แทนได้ */}
            <div className="verify-icon-circle">
                <Mail size={24} strokeWidth={2.2} />
            </div>

          </div>

          <h2 className="verify-card-title">ยืนยันรหัส</h2>
          <p className="verify-desc">
            เราได้ส่งรหัสยืนยันไปยัง <span className="verify-email">{emailFromState}</span>
          </p>
          <p className="verify-hint">กรอกรหัสผ่าน 6 หลัก</p>

          <form className="verify-form" onSubmit={handleSubmit}>
            <div className="otp-row">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputsRef.current[i] = el)}
                  className="otp-input"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={(e) => handlePaste(i, e)}
                  aria-label={`otp-${i + 1}`}
                />
              ))}
            </div>

            {/* error text */}
            {error ? <div className="verify-error">{error}</div> : null}

            {/* resend */}
            <button
              type="button"
              className="verify-resend"
              onClick={handleResend}
              disabled={loading || cooldown > 0}
            >
              {cooldown > 0 ? `ส่งรหัสอีกครั้ง (${cooldown}s)` : "ส่งรหัสอีกครั้ง"}
            </button>

            {/* submit */}
            <button className="verify-submit" type="submit" disabled={loading}>
              {loading ? "กำลังตรวจสอบ..." : "ยืนยันรหัส"}
            </button>
          </form>
        </section>
      </main>

      {/* ===== Footer ===== */}
      <Footer />
    </div>
  );
}
