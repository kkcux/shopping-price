import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";

import Navbar from "../Home/Navbar";
import Footer from "../Home/Footer";
import "./lists-edit.css";

// ===== ข้อมูลจริง =====
import productsData from "../../data/bigC/big_c.json";

export default function CreateMyList() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

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
    localStorage.setItem("myListDraft_Name", listName);
  }, [listName]);

  useEffect(() => {
    localStorage.setItem("myListDraft_Items", JSON.stringify(selected));
  }, [selected]);

  /* ================= DATA ================= */
  const catalog = productsData.slice(0, 10).map((p, index) => ({
    id: `bigc-${index}`,
    name: p.data,      // ชื่อสินค้า
    img: p.image,      // ✅ รูปสินค้า (สำคัญมาก)
  }));

  /* ================= SCROLL (เหมือน Home) ================= */
  const scroll = (ref, direction) => {
    const { current } = ref;
    if (current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  /* ================= HANDLERS ================= */
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
      // ✅ เก็บ img ไปด้วย
      setSelected((prev) => [...prev, { ...product, qty }]);
    }
  };

  const removeItem = (id) => {
    setSelected((prev) => prev.filter((i) => i.id !== id));
  };

  /* ================= SAVE ================= */
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

  /* ================= UI ================= */
  return (
    <>
      <Navbar />

      <main className="le-page">
        {/* HEADER */}
        <section className="le-header-section">
          <div className="le-header-inner">
            <div className="le-topLeft">
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
          {/* NAME */}
          <div className="le-nameBlock">
            <div className="le-label">ชื่อรายการ</div>
            <input
              className="le-input"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="ตั้งชื่อรายการ..."
            />
          </div>

          {/* ===== PRODUCT SLIDER ===== */}
          <section className="le-box">
            <div className="le-boxHead">
              <div className="le-boxTitle">เลือกสินค้าแนะนำ</div>
            </div>

            <div className="slider-wrapper">
              <button
                className="scroll-btn left"
                onClick={() => scroll(scrollRef, "left")}
              >
                <ChevronLeft size={24} />
              </button>

              <button
                className="scroll-btn right"
                onClick={() => scroll(scrollRef, "right")}
              >
                <ChevronRight size={24} />
              </button>

              <div className="product-scroll-container" ref={scrollRef}>
                {catalog.map((p) => (
                  <div key={p.id} className="product-card min-w-card">
                    <img src={p.img} alt={p.name} />
                    <h3>{p.name}</h3>

                    <div className="le-qty">
                      <button onClick={() => decreaseQty(p.id)}>−</button>
                      <span>{catalogQty[p.id] || 1}</span>
                      <button onClick={() => increaseQty(p.id)}>+</button>
                    </div>

                    <button
                      className="add-btn"
                      onClick={() => handleSelectProduct(p)}
                    >
                      <Plus size={16} /> เพิ่ม
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ===== SELECTED LIST (รูปไม่หายแล้ว) ===== */}
          <section className="le-box">
            <div className="le-boxHead">
              <div className="le-boxTitle">
                รายการสินค้าของคุณ ({selected.length})
              </div>
            </div>

            {selected.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "#999" }}>
                ยังไม่มีสินค้าในรายการ
              </div>
            ) : (
              <div className="le-cards">
                {selected.map((p) => (
                  <div key={p.id} className="le-card">
                    <button
                      className="le-remove"
                      onClick={() => removeItem(p.id)}
                    >
                      ✕
                    </button>

                    {/* ✅ รูปอยู่ตรงนี้ */}
                    <div className="le-imgWrap">
                      <img src={p.img} alt={p.name} />
                    </div>

                    <div className="le-cardName">{p.name}</div>
                    <div className="le-cardSub">จำนวน {p.qty} ชิ้น</div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* SAVE */}
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
                className="modal-btn close-warning"
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
