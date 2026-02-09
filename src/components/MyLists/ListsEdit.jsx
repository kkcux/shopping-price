import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom"; 
import { 
  ChevronLeft, ChevronRight, Trash2, Plus, Minus, Save,
  AlertTriangle, Loader2, CheckCircle2, Check
} from "lucide-react";
import toast, { Toaster } from 'react-hot-toast'; 

import Footer from "../Home/Footer";
import "./ListsEdit.css"; 

import { db, auth } from '../../firebase-config';
import { doc, getDoc } from 'firebase/firestore';
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

export default function ListsEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation(); 

  const TEMP_KEY = `temp_editing_${id}`;

  const [listName, setListName] = useState("");
  const [items, setItems] = useState([]); 
  const [originalList, setOriginalList] = useState(null); 
  const [selectedStores, setSelectedStores] = useState({
    ALL: true, LOTUS: true, BIGC: true, MAKRO: true,
  });
  
  // ✅ ดึงข้อมูล membership จาก localStorage หรือใช้ค่า default
  const [membership, setMembership] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData.membership) {
          return userData.membership;
        }
      }
    } catch {}
    return { LOTUS: false, BIGC: false, MAKRO: false };
  });

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // ✅ State สำหรับ currentUser
  const [currentUser, setCurrentUser] = useState(null);

  // Flag to prevent double actions
  const isDiscarding = useRef(false);

  const [showExitModal, setShowExitModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showStoreWarningModal, setShowStoreWarningModal] = useState(false);

  // 1. LOAD DATA
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const isReturning = sessionStorage.getItem('returning_from_add');

      // A. RETURNING from Add Product Screen: Load from TEMP_KEY
      if (isReturning) {
        const tempData = JSON.parse(localStorage.getItem(TEMP_KEY));
        if (tempData) {
          setOriginalList(tempData.original || {}); 
          setListName(tempData.name);
          setItems(tempData.items || []); 
          if(tempData.selectedStores) setSelectedStores(tempData.selectedStores);
          
          setLoading(false);
          // FIX: Don't remove immediately to prevent Double-Elimination in StrictMode
          // sessionStorage.removeItem('returning_from_add'); 
          return;
        }
      } 
      
      // B. FRESH LOAD: Remove any old temp data to avoid confusion
      localStorage.removeItem(TEMP_KEY);

      // C. CHECK FOR PASSED DATA (from MyLists3)
      if (location.state?.initialData) {
         console.log("Using Initial Data from Navigation");
         const passedData = location.state.initialData;
         // Deep Copy
         setOriginalList(JSON.parse(JSON.stringify(passedData)));
         setListName(passedData.name || "");
         setItems(passedData.items || []);
         if(passedData.selectedStores) setSelectedStores(passedData.selectedStores);
         setLoading(false);
         return;
      }

      // Try Local Storage
      const allLists = JSON.parse(localStorage.getItem("myLists")) || [];
      const localListRaw = allLists.find(l => String(l.id) === String(id));

      if (localListRaw) {
        // Deep copy to break reference
        const localList = JSON.parse(JSON.stringify(localListRaw));
        setOriginalList(JSON.parse(JSON.stringify(localList))); 
        setListName(localList.name);
        setItems(localList.items || []); 
        if(localList.selectedStores) setSelectedStores(localList.selectedStores);
        setLoading(false);
        return;
      }

      // If not found in Local, and originally was fetching from Firebase,
      // But now we are strictly offline/local for this flow as requested.
      // So we just stop here or handle "Not Found".
      // (Optional: You could leave read-only Firebase fetch here if truly needed, 
      // but 'Remove Database' was the instruction).
      
      // Fallback: Empty or Error
      if (!localListRaw) {
          // If purely offline app, maybe show error
          // toast.error("ไม่พบรายการ");
          // navigate('/mylists');
      }
      
      setLoading(false);
    };

    fetchData();
  }, [id, location, TEMP_KEY]); 

  // ✅ Listen การเปลี่ยนแปลงของ auth state และโหลด membership ใหม่
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists() && userSnap.data().membership) {
            setMembership(userSnap.data().membership);
            // อัปเดต localStorage ด้วย
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              const userData = JSON.parse(storedUser);
              userData.membership = userSnap.data().membership;
              localStorage.setItem('user', JSON.stringify(userData));
            }
          }
        } catch (error) {
          console.error("Error loading membership from Firestore:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // ✅ Listen การเปลี่ยนแปลงของ localStorage (เมื่อมีการอัปเดตจากหน้า Profile)
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          if (userData.membership) {
            setMembership(userData.membership);
          }
        }
      } catch {}
    };
    
    // Listen custom event จากหน้า Profile
    const handleMembershipUpdate = (event) => {
      if (event.detail && event.detail.membership) {
        setMembership(event.detail.membership);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    window.addEventListener('membershipUpdated', handleMembershipUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
      window.removeEventListener('membershipUpdated', handleMembershipUpdate);
    };
  }, []);

  // Prevent Tab Close if unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges() && !isDiscarding.current) {
        e.preventDefault();
        e.returnValue = ''; 
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [items, listName, selectedStores, originalList]);

  /* ===== LOGIC ===== */
  const getSelectedCount = (stores) => {
    return [stores.LOTUS, stores.BIGC, stores.MAKRO].filter(Boolean).length;
  };

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

  const increaseCatalogQty = (pid) => setCatalog(prev => prev.map(i => i.id === pid ? { ...i, qty: i.qty + 1 } : i));
  const decreaseCatalogQty = (pid) => setCatalog(prev => prev.map(i => i.id === pid && i.qty > 1 ? { ...i, qty: i.qty - 1 } : i));

  const handleSelectFromCatalog = (product) => {
    // ✅ ใช้จำนวนจากตัวเลือกสินค้าแนะนำ เช่น ตั้งไว้ที่ 2 แล้วกดเพิ่ม = +2
    const qtyToAdd =
      typeof product.qty === "number" && Number.isFinite(product.qty)
        ? Math.max(1, product.qty)
        : 1;

    const existingIndex = items.findIndex((item) => item.name === product.name); 
    if (existingIndex !== -1) {
      setItems((prev) => {
        const next = [...prev];
        const currentRaw = next[existingIndex].qty;
        const currentQty =
          typeof currentRaw === "number" && Number.isFinite(currentRaw)
            ? currentRaw
            : parseInt(currentRaw, 10) || 1;
        next[existingIndex].qty = currentQty + qtyToAdd;
        return next;
      });
    } else {
      setItems((prev) => [...prev, { ...product, qty: qtyToAdd }]);
    }
    toast.success(`เพิ่ม ${product.name} แล้ว`, { duration: 1500, icon: <CheckCircle2 size={18} color="#10b981" /> });
  };

  const updateQty = (index, delta) => {
    // ✅ ให้เพิ่ม/ลดทีละ 1 แบบตรง ๆ และกันค่าเพี้ยนจาก localStorage (เช่น string)
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const currentQtyRaw = item.qty;
        const currentQty =
          typeof currentQtyRaw === "number" && Number.isFinite(currentQtyRaw)
            ? currentQtyRaw
            : parseInt(currentQtyRaw, 10) || 1;

        const newQty = Math.max(1, currentQty + delta);
        return { ...item, qty: newQty };
      })
    );
  };

  const removeItem = (index) => setItems((prev) => prev.filter((_, i) => i !== index));

  const hasChanges = () => {
    if (!originalList) return false;
    const nameChanged = listName !== originalList.name;
    const currentItemsStr = JSON.stringify(items);
    const originalItemsStr = JSON.stringify(originalList.items || []);
    const storesChanged = JSON.stringify(selectedStores) !== JSON.stringify(originalList.selectedStores || {});
    return nameChanged || (currentItemsStr !== originalItemsStr) || storesChanged;
  };

  const handleBackClick = () => {
    if (hasChanges()) {
      setShowExitModal(true); 
    } else {
      localStorage.removeItem(TEMP_KEY); 
      sessionStorage.removeItem('returning_from_add');
      // navigate back to view
      navigate(`/mylists/compare/${id}`);
    }
  };

  // Discard changes
  const confirmExit = () => {
    isDiscarding.current = true;
    localStorage.removeItem(TEMP_KEY);
    sessionStorage.removeItem('returning_from_add');
    setShowExitModal(false);
    
    // Replace: true to reset state
    navigate(`/mylists/compare/${id}`, { replace: true }); 
  };

  const handleGoToProducts = () => {
    sessionStorage.setItem('returning_from_add', 'true');
    const currentData = {
        id: id,
        name: listName,
        items: items,
        selectedStores: selectedStores,
        original: originalList
    };
    // Save to TEMP ONLY so we can return
    localStorage.setItem(TEMP_KEY, JSON.stringify(currentData));
    navigate(`/mylists/edit/products/${id}`); 
  };

  const handleSaveFinal = async () => {
    if (!listName.trim()) {
      setShowWarningModal(true);
      return;
    }

    // เช็คว่าเลือกร้านค้าอย่างน้อย 2 ร้าน (ตอนกดปุ่มดูราคาเปรียบเทียบ)
    const selectedCount = getSelectedCount(selectedStores);
    if (selectedCount < 2) {
      setShowStoreWarningModal(true);
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("กำลังแก้ไขรายการ...");

    try {
        const updatedData = {
            name: listName,
            items: items, 
            totalItems: items.reduce((sum, i) => sum + i.qty, 0),
            selectedStores: selectedStores,
            updatedAt: new Date().toISOString() 
        };

        const dataToPass = {
            id: id,
            ...updatedData
        };

        // CRITICAL: DO NOT SAVE TO LOCALSTORAGE HERE
        // Just clear temp editing state
        localStorage.removeItem(TEMP_KEY);
        sessionStorage.removeItem('returning_from_add');
        
        toast.success("แก้ไขรายการแล้ว", { id: toastId, duration: 1500 });
        
        // Pass data via Navigation State (in memory only)
        setTimeout(() => {
            navigate(`/mylists/compare/${id}`, { 
                state: { draftData: dataToPass } 
            }); 
        }, 1000);

    } catch (error) {
        console.error("Save error:", error);
        toast.error("มีปัญหาเกิดขึ้น", { id: toastId });
        setIsSaving(false);
    }
  };

  if (loading) {
      return <div style={{padding: 50, textAlign:'center'}}>กำลังโหลดข้อมูล...</div>;
  }

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
              <div className="le-cards-scroll">
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
              {!currentUser ? (
                <div style={{ 
                  padding: '40px 20px', 
                  textAlign: 'center', 
                  color: '#64748b',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{ fontSize: '1rem' }}>กรุณาเข้าสู่ระบบเพื่อดูสถานะสมาชิก</div>
                  <button 
                    onClick={() => navigate('/login')}
                    style={{
                      padding: '10px 24px',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                  >
                    เข้าสู่ระบบ
                  </button>
                </div>
              ) : (
                ["LOTUS", "BIGC", "MAKRO"].map((brand) => (
                  <MemberRow key={brand} brand={brand} isMember={membership[brand]} />
                ))
              )}
            </section>
          </div>

          <div className="le-saveWrap">
            <button className="le-saveBtn" onClick={handleSaveFinal} disabled={isSaving}>
              {isSaving ? (
                  <>
                    <Loader2 className="animate-spin" size={20} style={{ marginRight: 8 }} />
                    กำลังบันทึก...
                  </>
              ) : (
                  <>
                    <Save size={20} style={{ marginRight: 8 }} />
                    บันทึกการเปลี่ยนแปลง
                  </>
              )}
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
              <button className="modal-btn delete" onClick={confirmExit}>ไม่บันทึก</button>
            </div>
          </div>
        </div>
      )}

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

      {showStoreWarningModal && (
        <div className="modal-overlay" onClick={() => setShowStoreWarningModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-circle warning">
              <AlertTriangle size={48} strokeWidth={2} />
            </div>
            <h3 className="modal-title">ต้องเลือกร้านค้าอย่างน้อย 2 ร้าน</h3>
            <p className="modal-desc">กรุณาเลือกร้านค้าอย่างน้อย 2 ร้านเพื่อเปรียบเทียบราคา</p>
            <div className="modal-actions">
              <button className="modal-btn primary" onClick={() => setShowStoreWarningModal(false)}>ตกลง</button>
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
        {isMember ? `${brand === 'LOTUS' ? "LOTUS's" : brand === 'BIGC' ? "BIG C" : brand === 'MAKRO' ? "MAKRO" : brand} เป็นสมาชิก` : `${brand === 'LOTUS' ? "LOTUS's" : brand === 'BIGC' ? "BIG C" : brand === 'MAKRO' ? "MAKRO" : brand} ไม่เป็นสมาชิก`}
      </div>
      {!isMember && (
        <a href={REGISTER_URL[brand]} target="_blank" rel="noopener noreferrer" className="le-join">
          สมัคร
        </a>
      )}
    </div>
  );
}