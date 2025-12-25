import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check } from "lucide-react";

import Navbar from "../Home/Navbar";
import Footer from "../Home/Footer";
import "./lists-edit.css";

export default function ListsEdit() {
  const navigate = useNavigate();
  const { id } = useParams();

  // ✅ 1. เตรียมข้อมูลตั้งแต่เริ่ม (ไม่ต้องรอ useEffect)
  // ดึงข้อมูลครั้งเดียวแล้วเก็บไว้ใช้กำหนดค่าเริ่มต้น
  const [initialData] = useState(() => {
    const savedLists = JSON.parse(localStorage.getItem("myLists")) || [];
    return savedLists.find((list) => String(list.id) === String(id));
  });

  // State ควบคุม Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // ✅ 2. กำหนดค่าเริ่มต้นจาก initialData ทันที
  const [listName, setListName] = useState(initialData ? initialData.name : "");
  const [selected, setSelected] = useState(initialData ? initialData.items : []);

  // ✅ 3. Effect นี้เอาไว้แค่ "เด้งออก" กรณีหา ID ไม่เจอเท่านั้น (ไม่ต้อง set state)
  useEffect(() => {
    if (!initialData) {
      navigate("/mylists");
    }
  }, [initialData, navigate]);


  // ===== catalog (สินค้าตัวอย่างสำหรับเลือกเพิ่ม) =====
  const [catalog, setCatalog] = useState([
    { id: "c1", name: "หมูแผ่นทอด x6", img: "https://o2o-static.lotuss.com/products/73889/51838953.jpg", qty: 1 },
    { id: "c2", name: "แอปเปิ้ล", img: "https://o2o-static.lotuss.com/products/73889/50845992.jpg", qty: 1 },
    { id: "c3", name: "ไก่ย่างรสดั้งเดิม", img: "https://o2o-static.lotuss.com/products/73889/52358592.jpg", qty: 1 },
    { id: "c4", name: "กล้วยหอม", img: "https://o2o-static.lotuss.com/products/73889/75640245.jpg", qty: 1 },
    { id: "c5", name: "ส้มแมนดาริน", img: "https://o2o-static.lotuss.com/products/73889/51635718.jpg", qty: 1 },
  ]);

  // ===== handlers =====
  
  // เพิ่ม/ลด จำนวนใน Catalog
  const increaseCatalog = (id) => {
    setCatalog((prev) => prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)));
  };
  const decreaseCatalog = (id) => {
    setCatalog((prev) => prev.map((i) => (i.id === id && i.qty > 1 ? { ...i, qty: i.qty - 1 } : i)));
  };

  // เลือกสินค้าจาก Catalog ลงไปใน Selected
  const handleSelectFromCatalog = (product) => {
    const existingItem = selected.find((item) => item.id === product.id);
    if (existingItem) {
      setSelected((prev) =>
        prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + product.qty } : item
        )
      );
    } else {
      setSelected((prev) => [...prev, { ...product }]);
    }
  };

  // ลบสินค้าออกจาก Selected
  const removeItem = (id) => {
    setSelected((prev) => prev.filter((i) => i.id !== id));
  };

  // เปิด Modal
  const handleSaveClick = () => {
    setShowConfirmModal(true);
  };

  // ฟังก์ชันยืนยันการบันทึก (Update localStorage)
  const handleConfirmSave = () => {
    const savedLists = JSON.parse(localStorage.getItem("myLists")) || [];
    
    // สร้างอาร์เรย์ใหม่โดยอัปเดตข้อมูลเฉพาะรายการที่ id ตรงกัน
    const updatedLists = savedLists.map((list) => {
      if (String(list.id) === String(id)) {
        return {
          ...list,
          name: listName, // อัปเดตชื่อ
          items: selected, // อัปเดตสินค้า
          totalItems: selected.reduce((sum, item) => sum + item.qty, 0), // อัปเดตจำนวนรวม
          updatedAt: new Date().toLocaleDateString('th-TH')
        };
      }
      return list;
    });

    // บันทึกกลับลง localStorage
    localStorage.setItem("myLists", JSON.stringify(updatedLists));

    console.log("UPDATED LIST:", updatedLists);
    setShowConfirmModal(false);
    
    // กลับไปหน้า MyLists (หรือหน้ารายละเอียด)
    navigate("/mylists");
  };

  // ถ้ายังไม่มีข้อมูล (และกำลังจะ Redirect) ให้ return null หรือ Loading ไปก่อน
  if (!initialData) return null;

  return (
    <>
      <Navbar />

      <main className="le-page">
        <div className="le-container">
          
          <div className="le-top">
            <div className="le-topLeft">
              <button className="le-back" onClick={() => navigate(-1)}>‹</button>
              <div>
                <h1 className="le-title">EDIT MYLISTS</h1>
                <p className="le-subtitle">แก้ไขรายการสินค้าของคุณ</p>
              </div>
            </div>
          </div>

          <div className="le-nameBlock">
            <div className="le-label">ชื่อรายการ</div>
            <input 
              className="le-input" 
              value={listName} 
              onChange={(e) => setListName(e.target.value)} // ยอมให้แก้ชื่อได้
            />
          </div>

          {/* ===== CATALOG ===== */}
          <section className="le-box">
            <div className="le-boxHead">
              <div className="le-boxTitle">เลือกรายการสินค้าเพิ่มเติม</div>
              <span className="le-pill">ดูทั้งหมด</span>
            </div>
            <div className="le-cards">
              {catalog.map((p) => (
                <div key={p.id} className="le-card">
                  <div className="le-imgWrap"><img src={p.img} alt={p.name} /></div>
                  <div className="le-cardName">{p.name}</div>
                  <div className="le-qty">
                    <button onClick={() => decreaseCatalog(p.id)}>−</button>
                    <span>{p.qty}</span>
                    <button onClick={() => increaseCatalog(p.id)}>+</button>
                  </div>
                  {/* ปุ่มเลือกทำงานได้แล้ว */}
                  <button className="le-select" onClick={() => handleSelectFromCatalog(p)}>
                    เลือก
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* ===== SELECTED ===== */}
          <section className="le-box">
            <div className="le-boxHead">
              <div className="le-boxTitle">รายการสินค้าที่ต้องการ ({selected.length})</div>
            </div>
            <div className="le-cards">
              {selected.map((p, index) => (
                <div key={`${p.id}-${index}`} className="le-card">
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
            <button className="le-saveBtn" onClick={handleSaveClick}>
              Save Changes
            </button>
          </div>
        </div>
      </main>

      {/* Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-icon-circle">
              <Check size={40} strokeWidth={3} />
            </div>
            <h3 className="modal-title">ยืนยันการบันทึกการแก้ไข ?</h3>
            <p className="modal-desc">ข้อมูลล่าสุดจะถูกบันทึกลงในรายการนี้</p>
            
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