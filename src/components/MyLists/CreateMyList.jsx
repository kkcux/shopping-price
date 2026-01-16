import React, { useState, useEffect, useRef } from "react"; // 1. เพิ่ม useRef
import { useNavigate, useLocation } from "react-router-dom";
import { 
  ChevronLeft, ChevronRight, Trash2, Plus, Minus, Save,
  AlertTriangle, Check, CheckCircle2 
} from "lucide-react";
import toast, { Toaster } from 'react-hot-toast'; 

import Footer from "../Home/Footer";
import "./CreateMyList.css"; 

import { auth } from '../../firebase-config';
import { onAuthStateChanged } from 'firebase/auth';

const STORE_LOGOS = {
  MAKRO: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1weBQ9rq_nOC5CSMa2dFW9Ez5CFXKKy4Q3Q&s",
  LOTUS: "https://upload.wikimedia.org/wikipedia/commons/1/14/Lotus-2021-logo.png",
  BIGC: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Big_C_Logo.svg/500px-Big_C_Logo.svg.png",
};

const REGISTER_URL = {
  MAKRO: "https://www.makro.pro/",
  LOTUS: "https://www.lotuss.com/th/register",
  BIGC: "https://www.bigc.co.th/register",
};

const DRAFT_KEY = 'current_draft'; 

export default function CreateMyList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);

  // ✅ 2. สร้าง Flag เพื่อกันไม่ให้ Auto-Save ทำงานตอนเรากดทิ้ง
  const isDiscarding = useRef(false);

  // ==========================================
  // Smart Initialization
  // ==========================================
  
  const isReturning = sessionStorage.getItem('returning_from_add');
  const stateItem = location.state?.initialItem;
  
  const [listName, setListName] = useState(() => {
    if (isReturning) {
        const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
        return saved?.name || "";
    }
    return ""; 
  });

  const [items, setItems] = useState(() => {
    const savedDraft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");

    if (isReturning && savedDraft) {
        if (stateItem) {
           const exists = savedDraft.items.some(i => i.name === stateItem.name);
           return exists ? savedDraft.items : [...savedDraft.items, stateItem];
        }
        return savedDraft.items || [];
    }
    if (stateItem) return [stateItem];
    return []; 
  });

  const [selectedStores, setSelectedStores] = useState(() => {
    if (isReturning) {
        const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
        return saved?.selectedStores || { ALL: true, LOTUS: false, BIGC: false, MAKRO: false };
    }
    return { ALL: true, LOTUS: false, BIGC: false, MAKRO: false };
  });

  useEffect(() => {
    if (!isReturning && !stateItem) {
        localStorage.removeItem(DRAFT_KEY);
    }
    sessionStorage.removeItem('returning_from_add');
  }, []);

  const membership = { LOTUS: true, BIGC: false, MAKRO: false };

  const [showExitModal, setShowExitModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningType, setWarningType] = useState("name"); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // ✅ 3. แก้ไข Auto-Save: เช็คว่ากำลังทิ้งรายการอยู่หรือเปล่า
  useEffect(() => {
    // ถ้ากำลังทิ้งรายการ (isDiscarding = true) ให้หยุดทำงานทันที ไม่ต้องเซฟ
    if (isDiscarding.current) return;

    if (listName || items.length > 0) {
      const draftData = { 
          name: listName, 
          items: items, 
          selectedStores: selectedStores 
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
    }
  }, [listName, items, selectedStores]);

  // Prevent Tab Close
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (items.length > 0 && !isDiscarding.current) { // เพิ่ม check ตรงนี้ด้วยกันเหนียว
        e.preventDefault();
        e.returnValue = ''; 
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [items]);

  /* ===== LOGIC ===== */
  const toggleAll = () => {
    const v = !selectedStores.ALL;
    setSelectedStores({ ALL: v, LOTUS: v, BIGC: v, MAKRO: v });
  };

  const toggleStore = (k) => {
    const next = { ...selectedStores, [k]: !selectedStores[k], ALL: false };
    if (next.LOTUS && next.BIGC && next.MAKRO) next.ALL = true;
    setSelectedStores(next);
  };

  const [catalog, setCatalog] = useState([
    { id: "c1", name: "อินโนวีเนส อาหารทางการแพทย์ 300ก.", img: "https://o2o-static.lotuss.com/products/105727/51921065.jpg", qty: 1 },
    { id: "c2", name: "อันอัน แผ่นรองซึมซับ ไซส์ XXL 10 ชิ้น", img: "https://o2o-static.lotuss.com/products/105727/75583866.jpg", qty: 1 },
    { id: "c3", name: "เนสท์เล่ บู๊สท์ ออฟติมัม 800 กรัม", img: "https://o2o-static.lotuss.com/products/105727/75009552.jpg", qty: 1 },
    { id: "c4", name: "ฟีลฟรีแผ่นรองซึมซับใหญ่พิเศษXXL 8 ชิ้น", img: "https://o2o-static.lotuss.com/products/105727/51165406.jpg", qty: 1 },
    { id: "c5", name: "ซอฟเท็กซ์ แผ่นรองซับ ขนาดใหญ่ 10 ชิ้น", img: "https://o2o-static.lotuss.com/products/105727/791156.jpg", qty: 1 },
  ]);

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
    toast.success(`เพิ่ม ${product.name} แล้ว`, { duration: 1500, icon: <CheckCircle2 size={18} color="#10b981" /> });
  };

  const updateQty = (index, delta) => {
    setItems((prev) => {
      const next = [...prev];
      next[index].qty = Math.max(1, next[index].qty + delta);
      return next;
    });
  };

  const removeItem = (index) => setItems((prev) => prev.filter((_, i) => i !== index));

  const handleBackClick = () => {
    if (!listName && items.length === 0) {
        // กรณีไม่มีอะไรเลย ให้ลบ Draft กันเหนียวแล้วออกเลย
        localStorage.removeItem(DRAFT_KEY);
        navigate(-1);
        return;
    }
    setShowExitModal(true);
  };

  // ✅ 4. แก้ไข Confirm Exit: เปิด Flag ว่ากำลังทิ้ง และลบข้อมูลให้เกลี้ยง
  const confirmExit = () => {
    isDiscarding.current = true; // บอก Auto-Save ว่า "หยุดเดี๋ยวนี้!"
    
    // ลบข้อมูลจริงจัง
    localStorage.removeItem(DRAFT_KEY); 
    
    setShowExitModal(false);
    navigate('/mylists'); 
  };

  const handleGoToProducts = () => {
    sessionStorage.setItem('returning_from_add', 'true');
    
    // ตรงนี้เราบังคับ Save ก่อนไป
    const draftData = { name: listName, items: items, selectedStores: selectedStores };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
    navigate(`/mylists/create/products/new`); 
  };

  const handleSaveFinal = () => {
    const trimmedName = listName.trim();

    if (!trimmedName) {
      setWarningType("name");
      setShowWarningModal(true);
      return;
    }
    if (items.length === 0) {
      setWarningType("empty");
      setShowWarningModal(true);
      return;
    }

    const allLists = JSON.parse(localStorage.getItem("myLists")) || [];
    const isDuplicate = allLists.some(list => list.name === trimmedName);

    if (isDuplicate) {
      setWarningType("duplicate");
      setShowWarningModal(true);
      return;
    }

    try {
      const guestId = Date.now().toString();
      
      const newList = {
        id: guestId,
        name: trimmedName,
        items: items,
        totalItems: items.reduce((sum, i) => sum + i.qty, 0),
        selectedStores: selectedStores, 
        createdAt: new Date().toISOString(),
        budget: 0,
        isGuest: !currentUser 
      };

      localStorage.setItem("myLists", JSON.stringify([...allLists, newList]));
      
      // ✅ ตอนบันทึกเสร็จ ก็บอกว่ากำลังจะไปแล้วเหมือนกัน เพื่อกัน Auto-save เขียนทับ
      isDiscarding.current = true;
      localStorage.removeItem(DRAFT_KEY);
      
      navigate(`/mylists/compare/${guestId}`, { state: { isNewList: true } }); 

    } catch (error) {
      console.error("Error creating list:", error);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  return (
    <>
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
            <div className="le-label">ชื่อรายการ <span style={{color: 'red'}}>*</span></div>
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
            <div className="le-cards-scroll"> 
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
              <div style={{ padding: '40px', color: '#999', textAlign: 'center' }}>
                ยังไม่มีสินค้าในรายการ <br/>
                <small style={{color: '#ff4d4f'}}>* กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ</small>
              </div>
            )}
          </section>

          <div className="le-grid-row">
            <section className="le-box le-box-half">
              <div className="le-boxTitle" style={{marginBottom: 15}}>เลือกร้านค้าที่ต้องการเปรียบเทียบ</div>
              <div className="le-checkRow" onClick={toggleAll}>
                <span className={`le-check ${selectedStores.ALL ? "on" : ""}`} />
                <span className="le-checkText">ทั้งหมด</span>
              </div>
              {["LOTUS", "BIGC", "MAKRO"].map((k) => (
                <div key={k} className="le-checkRow" onClick={() => toggleStore(k)}>
                  <span className={`le-check ${selectedStores[k] ? "on" : ""}`} />
                  <span className="le-checkText">{k === 'LOTUS' ? "Lotus's" : k === 'BIGC' ? "Big C" : "Makro"}</span>
                </div>
              ))}
            </section>

            <section className="le-box le-box-half">
              <div className="le-boxTitle" style={{marginBottom: 15}}>สถานะสมาชิก</div>
              {["LOTUS", "BIGC", "MAKRO"].map((brand) => (
                <MemberRow key={brand} brand={brand} isMember={membership[brand]} />
              ))}
            </section>
          </div>

          <div className="le-saveWrap">
            <button className="le-saveBtn" onClick={handleSaveFinal}>
              <Save size={20} style={{ marginRight: 8 }} />
              ดูราคาเปรียบเทียบ
            </button>
          </div>
        </div>
      </main>

      {/* Modal Exit */}
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
              <button className="modal-btn cancel" onClick={() => setShowExitModal(false)}>ทำรายการต่อ</button>
              <button className="modal-btn delete" onClick={confirmExit}>ทิ้งรายการ</button>
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
            
            {warningType === "name" && (
              <>
                <h3 className="modal-title">กรุณากรอกชื่อรายการ</h3>
                <p className="modal-desc">โปรดตั้งชื่อรายการก่อนทำการบันทึก</p>
              </>
            )}

            {warningType === "empty" && (
              <>
                <h3 className="modal-title">รายการสินค้าว่างเปล่า</h3>
                <p className="modal-desc">กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการก่อนบันทึก</p>
              </>
            )}

            {warningType === "duplicate" && (
              <>
                <h3 className="modal-title">ชื่อรายการซ้ำ</h3>
                <p className="modal-desc">คุณมีรายการชื่อนี้อยู่แล้ว <br/>กรุณาเปลี่ยนชื่อใหม่เพื่อไม่ให้สับสน</p>
              </>
            )}

            <div className="modal-actions">
              <button className="modal-btn primary" onClick={() => setShowWarningModal(false)}>ตกลง, เข้าใจแล้ว</button>
            </div>
          </div>
        </div>
      )}

      <Toaster position="top-center" />
      <Footer />
    </>
  );
}

function MemberRow({ brand, isMember }) {
  return (
    <div className={`le-memberRow ${isMember ? "ok" : ""}`}>
      <div className={`le-brand-logo ${brand.toLowerCase()}`}>
        <img src={STORE_LOGOS[brand]} alt={brand} />
      </div>
      <div className="le-memberText">
        {isMember ? "เป็นสมาชิกแล้ว" : "ไม่ได้เป็นสมาชิก"}
      </div>
      {!isMember && (
        <a href={REGISTER_URL[brand]} target="_blank" rel="noopener noreferrer" className="le-join">
          สมัคร
        </a>
      )}
      {isMember && (
        <div className="le-check-icon">
          <Check size={18} color="#10b77e" />
        </div>
      )}
    </div>
  );
}