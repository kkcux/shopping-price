import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react"; // เพิ่ม import icon

import Navbar from "../Home/Navbar";
import Footer from "../Home/Footer";
import "./lists-edit.css";

export default function ListsEdit() {
  const navigate = useNavigate();
  
  // เพิ่ม State ควบคุมการแสดง Pop-up
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [listName] = useState("ของใช้รายสัปดาห์");

  // ===== catalog =====
  const [catalog, setCatalog] = useState([
    { id: "c1", name: "หมูแผ่นทอด x6", img: "https://o2o-static.lotuss.com/products/73889/51838953.jpg", qty: 1 },
    { id: "c2", name: "แอปเปิ้ล", img: "https://o2o-static.lotuss.com/products/73889/50845992.jpg", qty: 1 },
    { id: "c3", name: "ไก่ย่างรสดั้งเดิม", img: "https://o2o-static.lotuss.com/products/73889/52358592.jpg", qty: 1 },
    { id: "c4", name: "กล้วยหอม", img: "https://o2o-static.lotuss.com/products/73889/75640245.jpg", qty: 1 },
    { id: "c5", name: "ส้มแมนดาริน", img: "https://o2o-static.lotuss.com/products/73889/51635718.jpg", qty: 1 },
  ]);

  // ===== selected items =====
  const [selected, setSelected] = useState([
    { id: "s1", name: "แอปเปิ้ล", img: "https://o2o-static.lotuss.com/products/73889/50845992.jpg", qty: 1 },
    { id: "s2", name: "หมูแผ่นทอด", img: "https://o2o-static.lotuss.com/products/73889/51838953.jpg", qty: 1 },
    { id: "s3", name: "น้ำดื่มแพ็ค x12", img: "https://o2o-static.lotuss.com/products/105727/51921065.jpg", qty: 1 },
    { id: "s4", name: "ซอสหอยนางรม", img: "https://o2o-static.lotuss.com/products/105727/51165406.jpg", qty: 1 },
    { id: "s5", name: "ผักกาดหอม", img: "https://o2o-static.lotuss.com/products/105727/791156.jpg", qty: 1 },
  ]);

  // ===== handlers =====
  const increase = (id, type) => {
    const setter = type === "catalog" ? setCatalog : setSelected;
    setter((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i))
    );
  };

  const decrease = (id, type) => {
    const setter = type === "catalog" ? setCatalog : setSelected;
    setter((prev) =>
      prev.map((i) => (i.id === id && i.qty > 1 ? { ...i, qty: i.qty - 1 } : i))
    );
  };

  const removeItem = (id) => {
    setSelected((prev) => prev.filter((i) => i.id !== id));
  };

  //  แก้ไขฟังก์ชัน saveList ให้เปิด Modal แทนการ save ทันที
  const handleSaveClick = () => {
    setShowConfirmModal(true);
  };

  //  ฟังก์ชันยืนยันการบันทึก (ทำงานจริงเมื่อกด "ยืนยัน" ใน Modal)
  const handleConfirmSave = () => {
    console.log("CONFIRMED SAVE:", selected);
    setShowConfirmModal(false);
    navigate("/mylists/mylists2");
  };

  return (
    <>
      <Navbar />

      <main className="le-page">
        <div className="le-container">
          {/* ... (Code ส่วน Top, ListName, Catalog เหมือนเดิม) ... */}
          
          <div className="le-top">
            <div className="le-topLeft">
              <button className="le-back" onClick={() => navigate(-1)}>‹</button>
              <div>
                <h1 className="le-title">EDIT MYLISTS</h1>
                <p className="le-subtitle">เพิ่มสินค้าในรายการของคุณและเราจะค้นหาราคาที่ถูกที่สุดจากทุกร้านค้า</p>
              </div>
            </div>
          </div>

          <div className="le-nameBlock">
            <div className="le-label">ชื่อรายการ</div>
            <input className="le-input" value={listName} readOnly />
          </div>

          <section className="le-box">
            <div className="le-boxHead">
              <div className="le-boxTitle">เลือกรายการสินค้า</div>
              <span className="le-pill">ดูทั้งหมด</span>
            </div>
            <div className="le-cards">
              {catalog.map((p) => (
                <div key={p.id} className="le-card">
                  <div className="le-imgWrap"><img src={p.img} alt={p.name} /></div>
                  <div className="le-cardName">{p.name}</div>
                  <div className="le-qty">
                    <button onClick={() => decrease(p.id, "catalog")}>−</button>
                    <span>{p.qty}</span>
                    <button onClick={() => increase(p.id, "catalog")}>+</button>
                  </div>
                  <button className="le-select">เลือก</button>
                </div>
              ))}
            </div>
          </section>

          <section className="le-box">
            <div className="le-boxHead">
              <div className="le-boxTitle">รายการสินค้าที่ต้องการ</div>
              <span className="le-pill">ดูทั้งหมด</span>
            </div>
            <div className="le-cards">
              {selected.map((p) => (
                <div key={p.id} className="le-card">
                  <button className="le-remove" onClick={() => removeItem(p.id)}>✕</button>
                  <div className="le-imgWrap"><img src={p.img} alt={p.name} /></div>
                  <div className="le-cardName">{p.name}</div>
                  <div className="le-cardSub">จำนวน {p.qty} ชิ้น</div>
                </div>
              ))}
            </div>
          </section>

          {/* ===== SAVE BUTTON ===== */}
          <div className="le-saveWrap">
            {/* เรียกฟังก์ชันเปิด Modal */}
            <button className="le-saveBtn" onClick={handleSaveClick}>
              Save
            </button>
          </div>
        </div>
      </main>

      {/*  ส่วนของ Modal Popup (Render ตาม State) */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-icon-circle">
              <Check size={40} strokeWidth={3} />
            </div>
            <h3 className="modal-title">ยืนยันการบันทึกข้อมูลหรือไม่ ?</h3>
            <p className="modal-desc">ข้อมูลจะถูกอัปเดตหากกดยืนยัน</p>
            
            <div className="modal-actions">
              <button 
                className="modal-btn cancel" 
                onClick={() => setShowConfirmModal(false)}
              >
                ยกเลิก
              </button>
              <button 
                className="modal-btn confirm" 
                onClick={handleConfirmSave}
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}