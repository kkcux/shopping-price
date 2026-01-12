import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Plus, 
  Minus,
  Save,
  AlertTriangle,
  X 
} from "lucide-react";
import Navbar from "../Home/Navbar";
import Footer from "../Home/Footer";
import "./CreateMyList.css"; // ตรวจสอบชื่อไฟล์ CSS ให้ตรงกันนะครับ

export default function CreateMyList() {
  const navigate = useNavigate();
  
  const [listName, setListName] = useState("");
  const [items, setItems] = useState([]); 
  const [draftId, setDraftId] = useState(null); 

  // Modal States
  const [showExitModal, setShowExitModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);

  // --- 1. LOAD DATA (โหลดข้อมูล Draft ถ้ามี) ---
  useEffect(() => {
    const savedDraftId = sessionStorage.getItem('current_draft_id');
    
    if (savedDraftId) {
      const allLists = JSON.parse(localStorage.getItem("myLists")) || [];
      const foundList = allLists.find(l => String(l.id) === String(savedDraftId));
      
      if (foundList) {
        setDraftId(savedDraftId);
        setListName(foundList.name);
        setItems(foundList.items || []);
      }
    }
  }, []);

  // ป้องกันการปิด Tab โดยไม่ตั้งใจ
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = ''; 
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // --- CATALOG DATA ---
  const [catalog, setCatalog] = useState([
    { id: "c1", name: "อินโนวีเนส อาหารทางการแพทย์ 300ก.", img: "https://o2o-static.lotuss.com/products/105727/51921065.jpg", qty: 1 },
    { id: "c2", name: "อันอัน แผ่นรองซึมซับ ไซส์ XXL 10 ชิ้น", img: "https://o2o-static.lotuss.com/products/105727/75583866.jpg", qty: 1 },
    { id: "c3", name: "เนสท์เล่ บู๊สท์ ออฟติมัม 800 กรัม", img: "https://o2o-static.lotuss.com/products/105727/75009552.jpg", qty: 1 },
    { id: "c4", name: "ฟีลฟรีแผ่นรองซึมซับใหญ่พิเศษXXL 8 ชิ้น", img: "https://o2o-static.lotuss.com/products/105727/51165406.jpg", qty: 1 },
    { id: "c5", name: "ซอฟเท็กซ์ แผ่นรองซับ ขนาดใหญ่ 10 ชิ้น", img: "https://o2o-static.lotuss.com/products/105727/791156.jpg", qty: 1 },
  ]);

  const increaseCatalogQty = (id) => setCatalog(prev => prev.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i));
  const decreaseCatalogQty = (id) => setCatalog(prev => prev.map(i => i.id === id && i.qty > 1 ? { ...i, qty: i.qty - 1 } : i));

  // --- LOGIC จัดการสินค้า ---
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

  // --- NAVIGATION HANDLERS ---
  const handleBackClick = () => {
    if (!listName && items.length === 0) {
        navigate(-1);
        return;
    }
    setShowExitModal(true);
  };

  const confirmExit = () => {
    // ถ้าออกโดยไม่บันทึก ให้ลบ Draft ทิ้ง (Cleanup)
    if (draftId) {
      const allLists = JSON.parse(localStorage.getItem("myLists")) || [];
      const filteredLists = allLists.filter(l => String(l.id) !== String(draftId));
      localStorage.setItem("myLists", JSON.stringify(filteredLists));
      sessionStorage.removeItem('current_draft_id');
    }
    setShowExitModal(false);
    navigate(-1);
  };

  // ✅ 2. ฟังก์ชันไปหน้าสินค้า (บันทึกก่อนไป)
  const handleGoToProducts = () => {
    // สร้าง ID ใหม่ถ้ายังไม่มี (Draft ID)
    const idToUse = draftId || Date.now();
    
    // สร้าง Object ข้อมูลล่าสุด
    const newList = {
      id: idToUse,
      name: listName,
      items: items,
      createdAt: idToUse,
      totalItems: items.reduce((sum, i) => sum + i.qty, 0)
    };

    const allLists = JSON.parse(localStorage.getItem("myLists")) || [];
    
    // ✅ บันทึกลง LocalStorage ทันที
    if (draftId) {
      // กรณีแก้ไข: อัปเดตรายการเดิม
      const updatedLists = allLists.map(l => String(l.id) === String(draftId) ? newList : l);
      localStorage.setItem("myLists", JSON.stringify(updatedLists));
    } else {
      // กรณีใหม่: เพิ่มรายการใหม่เข้าไป
      localStorage.setItem("myLists", JSON.stringify([...allLists, newList]));
      // บันทึก Session เพื่อให้พอกลับมาหน้านี้ ข้อมูลยังอยู่
      sessionStorage.setItem('current_draft_id', idToUse);
    }

    // ไปหน้าเลือกสินค้า
    navigate(`/mylists/create/products/${idToUse}`);
  };

  // ✅ 3. ฟังก์ชันบันทึกรายการ (Save Final)
  const handleSaveFinal = () => {
    if (!listName.trim()) {
      setShowWarningModal(true);
      return;
    }

    const idToUse = draftId || Date.now();
    
    const newList = {
      id: idToUse,
      name: listName,
      items: items,
      createdAt: idToUse,
      totalItems: items.reduce((sum, i) => sum + i.qty, 0)
    };

    const allLists = JSON.parse(localStorage.getItem("myLists")) || [];
    
    // ✅ บันทึกลง Storage ให้ชัวร์ก่อนเปลี่ยนหน้า
    if (draftId) {
      const updatedLists = allLists.map(l => String(l.id) === String(draftId) ? newList : l);
      localStorage.setItem("myLists", JSON.stringify(updatedLists));
    } else {
      localStorage.setItem("myLists", JSON.stringify([...allLists, newList]));
    }

    // ล้าง session draft ออก เพราะบันทึกเสร็จแล้ว
    sessionStorage.removeItem('current_draft_id');
    
    // ไปหน้า View รายการ
    navigate(`/mylists/${idToUse}`);
  };

  // --- RENDER ---
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
                <h1 className="le-title">CREATE LIST</h1>
                <p className="le-subtitle">สร้างรายการสินค้าใหม่</p>
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
              placeholder="ตั้งชื่อรายการ... (เช่น ของใช้ประจำเดือน)"
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
              สร้างรายการ
            </button>
          </div>
        </div>
      </main>

      {/* ================= MODALS ================= */}

      {/* 1. Modal ยืนยันการออก (Exit) */}
      {showExitModal && (
        <div className="modal-overlay" onClick={() => setShowExitModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-circle danger">
              <Trash2 size={40} strokeWidth={2} />
            </div>

            <h3 className="modal-title">ยกเลิกรายการนี้?</h3>
            <p className="modal-desc">
              ข้อมูลที่คุณกรอกไว้จะไม่ถูกบันทึก <br/>
              ต้องการลบและออกจากหน้านี้ใช่ไหม
            </p>

            <div className="modal-actions row">
              <button 
                className="modal-btn cancel" 
                onClick={() => setShowExitModal(false)}
              >
                ทำรายการต่อ
              </button>
              <button 
                className="modal-btn delete" 
                onClick={confirmExit}
              >
                ทิ้งรายการ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal แจ้งเตือน (Warning) */}
      {showWarningModal && (
        <div className="modal-overlay" onClick={() => setShowWarningModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-circle warning">
              <AlertTriangle size={48} strokeWidth={2} />
            </div>

            <h3 className="modal-title">กรุณากรอกชื่อรายการ</h3>
            <p className="modal-desc">
              คุณยังไม่ได้ตั้งชื่อรายการสินค้า <br/>
              โปรดระบุชื่อก่อนทำการบันทึก
            </p>

            <div className="modal-actions">
              <button 
                className="modal-btn primary" 
                onClick={() => setShowWarningModal(false)}
              >
                ตกลง, เข้าใจแล้ว
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}