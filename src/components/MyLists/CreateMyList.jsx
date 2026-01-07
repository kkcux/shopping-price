import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import {
  Check,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus, // ✅ ต้องมีตรงนี้ ไม่งั้นหน้าขาว
} from "lucide-react";

import Navbar from "../Home/Navbar";
import Footer from "../Home/Footer";
import "./CreateMyList.css";

// ===== ข้อมูลสินค้า (Mockup) =====
// ⚠️ ตรวจสอบ path นี้ให้ถูกต้องตามโปรเจคจริงของคุณนะครับ
import productsData from "../../data/bigC/big_c.json";

export default function CreateMyList() {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useRef(null);

  // รับข้อมูลสินค้าเริ่มต้น (ถ้ามีส่งมาจากหน้าอื่น)
  const initialItem = location.state?.initialItem;

  /* ================= STATE ================= */
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMsg, setWarningMsg] = useState("");

  const [listName, setListName] = useState(
    () => localStorage.getItem("myListDraft_Name") || ""
  );

  const [selected, setSelected] = useState(() => {
    const saved = localStorage.getItem("myListDraft_Items");
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });

  const [catalogQty, setCatalogQty] = useState({});

  /* ================= EFFECT ================= */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (initialItem) {
      setSelected((prev) => {
        const exists = prev.find((i) => i.id === initialItem.id);
        if (exists) {
            return prev; 
        }
        return [...prev, { ...initialItem, qty: 1 }];
      });
      // ล้าง state เพื่อป้องกันการเพิ่มซ้ำเมื่อ refresh
      window.history.replaceState({}, document.title);
    }
  }, [initialItem]);

  useEffect(() => {
    localStorage.setItem("myListDraft_Name", listName);
  }, [listName]);

  useEffect(() => {
    localStorage.setItem("myListDraft_Items", JSON.stringify(selected));
  }, [selected]);

  /* ================= DATA PREP ================= */
  // แปลงข้อมูลให้พร้อมโชว์ใน Catalog
  const catalog = productsData.slice(0, 10).map((p, index) => ({
    id: `bigc-${index}`,
    name: p.data,      
    img: p.image,      
  }));

  /* ================= HANDLERS: SCROLL ================= */
  const scroll = (ref, direction) => {
    const { current } = ref;
    if (current) {
      const scrollAmount = 300;
      current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  /* ================= HANDLERS: QTY ================= */
  const increaseQty = (id) => {
    setCatalogQty((prev) => ({
      ...prev,
      [id]: (prev[id] || 1) + 1,
    }));
  };

  const decreaseQty = (id) => {
    setCatalogQty((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) - 1),
    }));
  };

  const handleSelectProduct = (product) => {
    const qty = catalogQty[product.id] || 1;
    const exists = selected.find((i) => i.id === product.id);

    if (exists) {
      setSelected((prev) =>
        prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + qty } : i
        )
      );
    } else {
      setSelected((prev) => [...prev, { ...product, qty }]);
    }
  };

  const removeItem = (id) => {
    setSelected((prev) => prev.filter((i) => i.id !== id));
  };

  const updateSelectedQty = (id, delta) => {
    setSelected((prev) => prev.map(item => {
      if (item.id === id) {
        return { ...item, qty: Math.max(1, item.qty + delta) };
      }
      return item;
    }));
  };

  /* ================= SAVE LOGIC ================= */
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
      totalItems: selected.reduce((s, i) => s + i.qty, 0),
      createdAt: new Date().toLocaleDateString("th-TH"),
    };

    localStorage.setItem("myLists", JSON.stringify([...existingLists, newList]));
    localStorage.removeItem("myListDraft_Name");
    localStorage.removeItem("myListDraft_Items");
    navigate("/mylists");
  };

  /* ================= UI RENDER ================= */
  return (
    <>
      <Navbar />

      <main className="le-page">
        {/* HEADER */}
        <section className="le-header-section">
          <div className="le-header-inner">
            <div className="le-topLeft">
              {/* ปุ่มย้อนกลับ */}
              <button className="le-back-btn" onClick={() => navigate(-1)}>
                <ChevronLeft size={28} strokeWidth={2.5} />
              </button>
              <div>
                <h1 className="le-title">CREATE NEW LIST</h1>
                <p className="le-subtitle">
                  สร้างรายการใหม่และเลือกสินค้าที่คุณต้องการ
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="le-container">
          {/* NAME INPUT */}
          <div className="le-nameBlock">
            <div className="le-label">ชื่อรายการ</div>
            <input
              className="le-input"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="ตั้งชื่อรายการ... (เช่น ของใช้ประจำเดือน)"
            />
          </div>

          {/* ===== PRODUCT SLIDER (CATALOG) ===== */}
          <section className="le-box">
            <div className="le-boxHead">
              <div className="le-boxTitle">เลือกสินค้าแนะนำ</div>
              <button className="le-seeAllBtn" onClick={() => navigate('/products')}>
                ดูสินค้าทั้งหมด <ChevronRight size={20} />
              </button>
            </div>

            <div className="slider-wrapper">
              <button className="scroll-btn left" onClick={() => scroll(scrollRef, "left")}>
                <ChevronLeft size={24} />
              </button>

              <button className="scroll-btn right" onClick={() => scroll(scrollRef, "right")}>
                <ChevronRight size={24} />
              </button>

              <div className="product-scroll-container" ref={scrollRef}>
                {catalog.map((p) => (
                  <div key={p.id} className="product-card min-w-card">
                    <img src={p.img} alt={p.name} />
                    <h3>{p.name}</h3>

                    {/* ✅ ส่วนควบคุม: เพิ่ม Wrapper เพื่อให้ CSS ดันปุ่มลงล่างได้ */}
                    <div className="control-wrap" style={{ marginTop: 'auto', width: '100%' }}>
                      <div className="le-qty">
                        <button onClick={() => decreaseQty(p.id)}><Minus size={12} /></button>
                        <span>{catalogQty[p.id] || 1}</span>
                        <button onClick={() => increaseQty(p.id)}><Plus size={12} /></button>
                      </div>

                      <button className="add-btn" onClick={() => handleSelectProduct(p)}>
                        <Plus size={14} /> เพิ่มลง My List
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ===== SELECTED LIST (รายการที่เลือกแล้ว) ===== */}
          <section className="le-box">
            <div className="le-boxHead">
              <div className="le-boxTitle">
                รายการสินค้าของคุณ ({selected.length})
              </div>
            </div>

            {selected.length === 0 ? (
              <div style={{ padding: '60px', textAlign: "center", color: "#94a3b8" }}>
                <p>ยังไม่มีสินค้าในรายการ</p>
                <small>เลือกสินค้าจากด้านบนได้เลย</small>
              </div>
            ) : (
              <div className="le-cards">
                {selected.map((p) => (
                  <div key={p.id} className="le-card">
                    <button className="le-remove" onClick={() => removeItem(p.id)}>
                      ✕
                    </button>

                    <div className="le-imgWrap">
                      <img src={p.img} alt={p.name} />
                    </div>

                    <div className="le-cardName">{p.name}</div>
                    
                    {/* ปุ่มปรับจำนวนในรายการที่เลือกแล้ว */}
                    <div className="le-qty">
                        <button onClick={() => updateSelectedQty(p.id, -1)}><Minus size={12} /></button>
                        <span>{p.qty}</span>
                        <button onClick={() => updateSelectedQty(p.id, 1)}><Plus size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* SAVE BUTTON */}
          <div className="le-saveWrap">
            <button className="le-saveBtn" onClick={handleSaveClick}>
              <Plus size={20} style={{ marginRight: 8 }} />
              สร้างรายการ
            </button>
          </div>
        </div>
      </main>

      {/* CONFIRM MODAL */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-icon-circle success">
              <Check size={40} />
            </div>
            <h3 className="modal-title">ยืนยันการสร้างรายการใหม่ ?</h3>
            <p className="modal-desc">คุณสามารถกลับมาแก้ไขภายหลังได้</p>
            <div className="modal-actions">
              <button
                className="modal-btn cancel"
                onClick={() => setShowConfirmModal(false)}
              >
                ยกเลิก
              </button>
              <button className="modal-btn confirm" onClick={handleConfirmSave}>
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WARNING MODAL */}
      {showWarningModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-icon-circle warning">
              <AlertCircle size={40} />
            </div>
            <h3 className="modal-title">ข้อมูลไม่ครบถ้วน</h3>
            <p className="modal-desc">{warningMsg}</p>
            <div className="modal-actions">
              <button
                className="modal-btn confirm"
                onClick={() => setShowWarningModal(false)}
              >
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