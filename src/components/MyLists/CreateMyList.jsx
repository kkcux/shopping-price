import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// ✅ Import ChevronLeft เพิ่มเข้ามา
import { Check, AlertCircle, ChevronLeft } from "lucide-react"; 

import Navbar from "../Home/Navbar";
import Footer from "../Home/Footer";
import "./lists-edit.css"; 

export default function CreateMyList() {
  const navigate = useNavigate();

  // Scroll to Top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // State ควบคุม Modal ยืนยัน (สีเขียว)
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // State ควบคุม Modal แจ้งเตือน (สีส้ม)
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMsg, setWarningMsg] = useState("");

  // 1. ชื่อรายการ
  const [listName, setListName] = useState(() => {
    return localStorage.getItem("myListDraft_Name") || "";
  });

  // 2. สินค้าแนะนำ
  const [catalog, setCatalog] = useState([
    { id: "c1", name: "หมูแผ่นทอด x6", img: "https://o2o-static.lotuss.com/products/73889/51838953.jpg", qty: 1 },
    { id: "c2", name: "แอปเปิ้ล", img: "https://o2o-static.lotuss.com/products/73889/50845992.jpg", qty: 1 },
    { id: "c3", name: "ไก่ย่างรสดั้งเดิม", img: "https://o2o-static.lotuss.com/products/73889/52358592.jpg", qty: 1 },
    { id: "c4", name: "กล้วยหอม", img: "https://o2o-static.lotuss.com/products/73889/75640245.jpg", qty: 1 },
    { id: "c5", name: "ส้มแมนดาริน", img: "https://o2o-static.lotuss.com/products/73889/51635718.jpg", qty: 1 },
  ]);

  // 3. รายการที่เลือก
  const [selected, setSelected] = useState(() => {
    const saved = localStorage.getItem("myListDraft_Items");
    if (saved) {
      try {
        return JSON.parse(saved);
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        return [];
      }
    }
    return [];
  });

  // Effect บันทึก Draft
  useEffect(() => {
    localStorage.setItem("myListDraft_Name", listName);
  }, [listName]);

  useEffect(() => {
    localStorage.setItem("myListDraft_Items", JSON.stringify(selected));
  }, [selected]);


  // ===== Handlers =====

  const increaseCatalogQty = (id) => {
    setCatalog((prev) => prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)));
  };

  const decreaseCatalogQty = (id) => {
    setCatalog((prev) => prev.map((i) => (i.id === id && i.qty > 1 ? { ...i, qty: i.qty - 1 } : i)));
  };

  const handleSelectFromCatalog = (product) => {
    const existingItem = selected.find((item) => item.id === product.id);
    if (existingItem) {
      setSelected((prev) => prev.map((item) => item.id === product.id ? { ...item, qty: item.qty + product.qty } : item));
    } else {
      setSelected((prev) => [...prev, { ...product }]);
    }
  };

  const removeItem = (id) => {
    setSelected((prev) => prev.filter((i) => i.id !== id));
  };

  // Check ก่อนบันทึก
  const handleSaveClick = () => {
    if (!listName.trim()) {
      setWarningMsg("กรุณาตั้งชื่อรายการก่อนบันทึก");
      setShowWarningModal(true);
      return;
    }
    if (selected.length === 0) {
      setWarningMsg("กรุณาเลือกสินค้าอย่างน้อย 1 รายการ");
      setShowWarningModal(true);
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmSave = () => {
    const existingLists = JSON.parse(localStorage.getItem("myLists")) || [];
    const newList = {
      id: Date.now(),
      name: listName,
      items: selected,
      totalItems: selected.reduce((sum, item) => sum + item.qty, 0),
      createdAt: new Date().toLocaleDateString('th-TH')
    };

    localStorage.setItem("myLists", JSON.stringify([...existingLists, newList]));
    localStorage.removeItem("myListDraft_Name");
    localStorage.removeItem("myListDraft_Items");

    setShowConfirmModal(false);
    navigate("/mylists"); 
  };

  return (
    <>
      <Navbar />

      <main className="le-page">
        <div className="le-container">
          
          <div className="le-top">
            <div className="le-topLeft">
              {/* ✅ เปลี่ยนปุ่มย้อนกลับให้เป็นไอคอน ChevronLeft */}
              <button className="le-back-btn" onClick={() => navigate(-1)}>
                <ChevronLeft size={28} strokeWidth={2.5} />
              </button>
              <div>
                <h1 className="le-title">CREATE NEW LIST</h1>
                <p className="le-subtitle">สร้างรายการใหม่และเลือกสินค้าที่คุณต้องการเปรียบเทียบราคา</p>
              </div>
            </div>
          </div>

          <div className="le-nameBlock">
            <div className="le-label">ชื่อรายการ</div>
            <input 
              className="le-input" 
              value={listName} 
              onChange={(e) => setListName(e.target.value)}
              placeholder="ตั้งชื่อรายการของคุณ... (เช่น ของทำบุญ, ปาร์ตี้ปีใหม่)"
              style={{ backgroundColor: '#fff', border: '1px solid #ddd' }} 
            />
          </div>

          <section className="le-box">
            <div className="le-boxHead">
              <div className="le-boxTitle">เลือกสินค้าแนะนำ</div>
              <span className="le-pill">ดูทั้งหมด</span>
            </div>
            <div className="le-cards">
              {catalog.map((p) => (
                <div key={p.id} className="le-card">
                  <div className="le-imgWrap"><img src={p.img} alt={p.name} /></div>
                  <div className="le-cardName">{p.name}</div>
                  <div className="le-qty">
                    <button onClick={() => decreaseCatalogQty(p.id)}>−</button>
                    <span>{p.qty}</span>
                    <button onClick={() => increaseCatalogQty(p.id)}>+</button>
                  </div>
                  <button className="le-select" onClick={() => handleSelectFromCatalog(p)}>เลือก</button>
                </div>
              ))}
            </div>
          </section>

          <section className="le-box">
            <div className="le-boxHead">
              <div className="le-boxTitle">รายการสินค้าของคุณ ({selected.length})</div>
            </div>
            {selected.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                ยังไม่มีสินค้าในรายการ เลือกสินค้าจากด้านบนได้เลย
              </div>
            ) : (
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
            )}
          </section>

          <div className="le-saveWrap">
            <button className="le-saveBtn" onClick={handleSaveClick}>
              สร้างรายการ
            </button>
          </div>
        </div>
      </main>

      {/* Modal ยืนยัน (Confirm Save) */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-box fade-in">
            <div className="modal-icon-circle success">
              <Check size={40} strokeWidth={3} />
            </div>
            <h3 className="modal-title">ยืนยันการสร้างรายการใหม่ ?</h3>
            <p className="modal-desc">คุณสามารถกลับมาแก้ไขรายการนี้ได้ภายหลัง</p>
            
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setShowConfirmModal(false)}>
                ยกเลิก
              </button>
              <button className="modal-btn confirm" onClick={handleConfirmSave}>
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal แจ้งเตือน (Warning) */}
      {showWarningModal && (
        <div className="modal-overlay">
          <div className="modal-box fade-in">
            <div className="modal-icon-circle warning">
              <AlertCircle size={40} strokeWidth={2} />
            </div>
            <h3 className="modal-title">ข้อมูลไม่ครบถ้วน</h3>
            <p className="modal-desc">{warningMsg}</p>
            
            <div className="modal-actions">
              <button className="modal-btn close-warning" onClick={() => setShowWarningModal(false)}>
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}