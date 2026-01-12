import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Plus, 
  Minus,
  Save,
  AlertTriangle
} from "lucide-react";
import Navbar from "../Home/Navbar";
import Footer from "../Home/Footer";
import "./ListsEdit.css"; 

export default function ListsEdit() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [listName, setListName] = useState("");
  const [items, setItems] = useState([]); 
  
  // Modal States
  const [showExitModal, setShowExitModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);

  /* ===== 1. LOAD DATA ===== */
  useEffect(() => {
    const allLists = JSON.parse(localStorage.getItem("myLists")) || [];
    const foundList = allLists.find(l => String(l.id) === String(id));
      
    if (foundList) {
      setListName(foundList.name);
      setItems(foundList.items || []);
    } else {
      console.warn("ไม่พบรายการ ID:", id);
    }
  }, [id]);

  // ป้องกันการปิด Tab โดยไม่ตั้งใจ
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = ''; 
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  /* ===== CATALOG DATA ===== */
  const [catalog, setCatalog] = useState([
    { id: "c1", name: "อินโนวีเนส อาหารทางการแพทย์ 300ก.", img: "https://o2o-static.lotuss.com/products/105727/51921065.jpg", qty: 1 },
    { id: "c2", name: "อันอัน แผ่นรองซึมซับ ไซส์ XXL 10 ชิ้น", img: "https://o2o-static.lotuss.com/products/105727/75583866.jpg", qty: 1 },
    { id: "c3", name: "เนสท์เล่ บู๊สท์ ออฟติมัม 800 กรัม", img: "https://o2o-static.lotuss.com/products/105727/75009552.jpg", qty: 1 },
    { id: "c4", name: "ฟีลฟรีแผ่นรองซึมซับใหญ่พิเศษXXL 8 ชิ้น", img: "https://o2o-static.lotuss.com/products/105727/51165406.jpg", qty: 1 },
    { id: "c5", name: "ซอฟเท็กซ์ แผ่นรองซับ ขนาดใหญ่ 10 ชิ้น", img: "https://o2o-static.lotuss.com/products/105727/791156.jpg", qty: 1 },
  ]);

  const increaseCatalogQty = (pid) => setCatalog(prev => prev.map(i => i.id === pid ? { ...i, qty: i.qty + 1 } : i));
  const decreaseCatalogQty = (pid) => setCatalog(prev => prev.map(i => i.id === pid && i.qty > 1 ? { ...i, qty: i.qty - 1 } : i));

  /* ===== ITEMS LOGIC ===== */
  const handleSelectFromCatalog = (product) => {
    const existingIndex = items.findIndex((item) => item.name === product.name); 
    if (existingIndex !== -1) {
      setItems((prev) => {
        const next = [...prev];
        next[existingIndex].qty += product.qty;
        return next;
      });
    } else {
      setItems((prev) => [...prev, { ...product }]);
    }
  };

  const updateQty = (index, delta) => {
    setItems((prev) => {
      const next = [...prev];
      next[index].qty = Math.max(1, next[index].qty + delta);
      return next;
    });
  };

  const removeItem = (index) => setItems((prev) => prev.filter((_, i) => i !== index));

  /* ===== NAVIGATION & SAVE ===== */
  
  // ฟังก์ชันบันทึก (Save)
  const performSave = () => {
    const allLists = JSON.parse(localStorage.getItem("myLists")) || [];
    
    const updatedList = {
      id: Number(id) || id, 
      name: listName,
      items: items,
      createdAt: Number(id) || Date.now(), 
      totalItems: items.reduce((sum, i) => sum + i.qty, 0)
    };

    const existingIndex = allLists.findIndex(l => String(l.id) === String(id));
    
    let newLists;
    if (existingIndex !== -1) {
      newLists = [...allLists];
      newLists[existingIndex] = updatedList; // ทับข้อมูลเก่า
    } else {
      newLists = [...allLists, updatedList];
    }
    
    localStorage.setItem("myLists", JSON.stringify(newLists));
  };

  const handleBackClick = () => {
    setShowExitModal(true);
  };

  // ✅ ฟังก์ชันยืนยันการออก (Confirm Exit) - แก้ไขใหม่!
  const confirmExit = () => {
    setShowExitModal(false);
    
    // ⚠️ เพียงแค่ย้อนกลับ (Navigate Back)
    // ไม่มีการสั่งลบ LocalStorage ใดๆ ทั้งสิ้น
    // ข้อมูลเดิมที่เคยบันทึกไว้จะยังอยู่ครบเหมือนเดิม
    navigate(-1); 
  };

  const handleGoToProducts = () => {
    performSave(); // บันทึกสถานะล่าสุดก่อนไปเลือกของเพิ่ม
    navigate(`/mylists/edit/products/${id}`);
  };

  const handleSaveFinal = () => {
    if (!listName.trim()) {
      setShowWarningModal(true);
      return;
    }
    performSave(); 
    navigate(`/mylists/${id}`); 
  };

  return (
    <>
      <Navbar />

      <main className="le-page">
        <section className="le-header-section">
          <div className="le-header-inner">
            <div className="le-topLeft">
              <button className="le-back-btn" onClick={handleBackClick}>
                <ChevronLeft size={28} strokeWidth={2.5} />
              </button>
              <div>
                <h1 className="le-title">EDIT LIST</h1>
                <p className="le-subtitle">แก้ไขรายการสินค้า</p>
              </div>
            </div>
          </div>
        </section>

        <div className="le-container">
          <div className="le-nameBlock">
            <div className="le-label">ชื่อรายการ</div>
            <input 
              className="le-input" 
              value={listName} 
              onChange={(e) => setListName(e.target.value)}
              placeholder="ตั้งชื่อรายการ..."
            />
          </div>

          <section className="le-box">
            <div className="le-boxHead">
              <div className="le-boxTitle">เลือกสินค้าแนะนำ</div>
              <button className="le-seeAllBtn" onClick={handleGoToProducts}>
                ดูสินค้าทั้งหมด <ChevronRight size={20} />
              </button>
            </div>
            <div className="le-cards">
              {catalog.map((p) => (
                <div key={p.id} className="le-card">
                  <div className="le-imgWrap"><img src={p.img} alt={p.name} /></div>
                  <div className="le-cardName">{p.name}</div>
                  <div className="le-qty">
                    <button onClick={() => decreaseCatalogQty(p.id)}><Minus size={14} /></button>
                    <span>{p.qty}</span>
                    <button onClick={() => increaseCatalogQty(p.id)}><Plus size={14} /></button>
                  </div>
                  <button className="le-select" onClick={() => handleSelectFromCatalog(p)}>
                    <Plus size={16} strokeWidth={3} style={{marginRight:4, transform: "translateY(3px)"}}/> เพิ่ม
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="le-box">
            <div className="le-boxHead">
              <div className="le-boxTitle">รายการที่เลือก ({items.length})</div>
            </div>
            {items.length > 0 ? (
              <div className="le-cards">
                {items.map((item, idx) => (
                  <div key={idx} className="le-card">
                    <button className="le-remove" onClick={() => removeItem(idx)}><Trash2 size={14} /></button>
                    <div className="le-imgWrap"><img src={item.img} alt={item.name} /></div>
                    <div className="le-cardName">{item.name}</div>
                    <div className="le-qty">
                      <button onClick={() => updateQty(idx, -1)}><Minus size={14} /></button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(idx, 1)}><Plus size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '40px', color: '#999', textAlign: 'center' }}>ยังไม่มีสินค้าในรายการ</div>
            )}
          </section>

          <div className="le-saveWrap">
            <button className="le-saveBtn" onClick={handleSaveFinal}>
              <Save size={20} style={{ marginRight: 8 }} />
              บันทึกการแก้ไข
            </button>
          </div>
        </div>
      </main>

      {/* Modal Exit */}
      {showExitModal && (
        <div className="modal-overlay" onClick={() => setShowExitModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-circle danger">
              <AlertTriangle size={36} strokeWidth={2} />
            </div>
            <h3 className="modal-title">ยกเลิกการแก้ไข?</h3>
            <p className="modal-desc">
              การเปลี่ยนแปลงจะไม่ถูกบันทึก <br/>
              ต้องการย้อนกลับใช่หรือไม่?
            </p>
            <div className="modal-actions row">
              <button className="modal-btn cancel" onClick={() => setShowExitModal(false)}>แก้ไขต่อ</button>
              {/* ปุ่มนี้จะแค่ย้อนกลับ ไม่ลบข้อมูล */}
              <button className="modal-btn delete" onClick={confirmExit}>ไม่บันทึก</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Warning */}
      {showWarningModal && (
        <div className="modal-overlay" onClick={() => setShowWarningModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-circle warning">
              <AlertTriangle size={48} strokeWidth={2} />
            </div>
            <h3 className="modal-title">กรุณากรอกชื่อรายการ</h3>
            <p className="modal-desc">โปรดระบุชื่อก่อนทำการบันทึก</p>
            <div className="modal-actions">
              <button className="modal-btn primary" onClick={() => setShowWarningModal(false)}>ตกลง</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}