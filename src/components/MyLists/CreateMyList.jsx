import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Plus, 
  Minus,
  Save
} from "lucide-react";
import Navbar from "../Home/Navbar";
import Footer from "../Home/Footer";
import "./ListsEdit.css"; // ใช้ CSS เดียวกับ Edit ได้เลย

export default function CreateMyList() {
  const navigate = useNavigate();
  
  const [listName, setListName] = useState("");
  const [items, setItems] = useState([]); 
  const [draftId, setDraftId] = useState(null); // เก็บ ID ของรายการร่าง

  // ✅ 1. โหลดข้อมูล "Draft" ถ้ามีค้างอยู่ (เมื่อกลับมาจากหน้า Product)
  useEffect(() => {
    // เช็คว่ามี ID ค้างใน Session ไหม
    const savedDraftId = sessionStorage.getItem('current_draft_id');
    
    if (savedDraftId) {
      const allLists = JSON.parse(localStorage.getItem("myLists")) || [];
      const foundList = allLists.find(l => String(l.id) === String(savedDraftId));
      
      if (foundList) {
        setDraftId(foundDraftId => savedDraftId);
        setListName(foundList.name);
        setItems(foundList.items || []);
      }
    }
  }, []);

  // ===== Catalog Data =====
  const [catalog, setCatalog] = useState([
    { id: "c1", name: "อินโนวีเนส อาหารทางการแพทย์ 300ก.", img: "https://o2o-static.lotuss.com/products/105727/51921065.jpg", qty: 1 },
    { id: "c2", name: "อันอัน แผ่นรองซึมซับ ไซส์ XXL 10 ชิ้น", img: "https://o2o-static.lotuss.com/products/105727/75583866.jpg", qty: 1 },
    { id: "c3", name: "เนสท์เล่ บู๊สท์ ออฟติมัม 800 กรัม", img: "https://o2o-static.lotuss.com/products/105727/75009552.jpg", qty: 1 },
    { id: "c4", name: "ฟีลฟรีแผ่นรองซึมซับใหญ่พิเศษXXL 8 ชิ้น", img: "https://o2o-static.lotuss.com/products/105727/51165406.jpg", qty: 1 },
    { id: "c5", name: "ซอฟเท็กซ์ แผ่นรองซับ ขนาดใหญ่ 10 ชิ้น", img: "https://o2o-static.lotuss.com/products/105727/791156.jpg", qty: 1 },
  ]);

  // ... (Catalog Logic เหมือนเดิม)
  const increaseCatalogQty = (id) => setCatalog(prev => prev.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i));
  const decreaseCatalogQty = (id) => setCatalog(prev => prev.map(i => i.id === id && i.qty > 1 ? { ...i, qty: i.qty - 1 } : i));

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


  // ✅ 2. ฟังก์ชัน "ดูสินค้าทั้งหมด" (หัวใจสำคัญ)
  const handleGoToProducts = () => {
    // สร้าง ID ใหม่ หรือใช้ ID เดิมถ้ามีอยู่แล้ว
    const idToUse = draftId || Date.now();
    
    // สร้าง Object รายการ
    const newList = {
      id: idToUse,
      name: listName,
      items: items,
      createdAt: idToUse,
      totalItems: items.reduce((sum, i) => sum + i.qty, 0)
    };

    // บันทึกลง LocalStorage
    const allLists = JSON.parse(localStorage.getItem("myLists")) || [];
    
    if (draftId) {
      // ถ้ามีอยู่แล้ว -> อัปเดต
      const updatedLists = allLists.map(l => String(l.id) === String(draftId) ? newList : l);
      localStorage.setItem("myLists", JSON.stringify(updatedLists));
    } else {
      // ถ้ายังไม่มี -> เพิ่มใหม่
      localStorage.setItem("myLists", JSON.stringify([...allLists, newList]));
      // จำ ID ไว้ใน Session
      sessionStorage.setItem('current_draft_id', idToUse);
    }

    // ไปหน้า Products พร้อมแนบ ID
    navigate(`/mylists/create/products/${idToUse}`);
  };


  // ✅ 3. ฟังก์ชันบันทึกเสร็จสิ้น (Save Final)
  const handleSaveFinal = () => {
    if (!listName.trim()) {
      alert("กรุณากรอกชื่อรายการ");
      return;
    }

    // บันทึกครั้งสุดท้าย (เผื่อมีการแก้ไขชื่อ)
    const idToUse = draftId || Date.now();
    const newList = {
      id: idToUse,
      name: listName,
      items: items,
      createdAt: idToUse,
      totalItems: items.reduce((sum, i) => sum + i.qty, 0)
    };

    const allLists = JSON.parse(localStorage.getItem("myLists")) || [];
    
    if (draftId) {
      const updatedLists = allLists.map(l => String(l.id) === String(draftId) ? newList : l);
      localStorage.setItem("myLists", JSON.stringify(updatedLists));
    } else {
      localStorage.setItem("myLists", JSON.stringify([...allLists, newList]));
    }

    // ล้าง Session เพื่อจบการทำงานร่าง
    sessionStorage.removeItem('current_draft_id');

    // ไปหน้ารายละเอียด
    navigate(`/mylists/${idToUse}`);
  };

  return (
    <>
      <Navbar />

      <main className="le-page">
        <section className="le-header-section">
          <div className="le-header-inner">
            <div className="le-topLeft">
              <button className="le-back-btn" onClick={() => {
                  // ถ้ากดย้อนกลับ ให้ล้าง draft ไหม? แล้วแต่ design (ในที่นี้ไม่ล้าง เผื่อกลับมาทำต่อ)
                  navigate(-1);
              }}>
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
              {/* ✅ เรียกใช้ฟังก์ชันพิเศษของเรา */}
              <button className="le-seeAllBtn" onClick={handleGoToProducts}>
                ดูสินค้าทั้งหมด <ChevronRight size={20} />
              </button>
            </div>
            {/* Catalog Grid */}
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
                    <Plus size={16} style={{marginRight:4}}/> เพิ่ม
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
      <Footer />
    </>
  );
}