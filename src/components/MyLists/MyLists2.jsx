// import React, { useState, useEffect } from "react";
// import { useNavigate, useParams, useLocation } from "react-router-dom"; 
// import { 
//   ChevronLeft, 
//   ChevronRight, 
//   Trash2, 
//   Plus, 
//   Minus,
//   Save,
//   AlertTriangle,
//   Loader2,
//   Info,
//   CheckCircle2,
//   Check // ✅ เพิ่ม Check Icon
// } from "lucide-react";
// import toast, { Toaster } from 'react-hot-toast'; 

// import Navbar from "../Home/Navbar";
// import Footer from "../Home/Footer";
// import "./ListsEdit.css"; 

// import { db, auth } from '../../firebase-config';
// import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'; 
// import { onAuthStateChanged } from 'firebase/auth';

// // ✅ 1. เพิ่ม Constants
// const STORE_LOGOS = {
//   MAKRO: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1weBQ9rq_nOC5CSMa2dFW9Ez5CFXKKy4Q3Q&s",
//   LOTUS: "https://upload.wikimedia.org/wikipedia/commons/1/14/Lotus-2021-logo.png",
//   BIGC: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Big_C_Logo.svg/500px-Big_C_Logo.svg.png",
// };

// const REGISTER_URL = {
//   MAKRO: "https://www.makro.pro/",
//   LOTUS: "https://www.lotuss.com/th/register",
//   BIGC: "https://www.bigc.co.th/register",
// };

// export default function ListsEdit() {
//   const navigate = useNavigate();
//   const { id } = useParams();
//   const location = useLocation(); 

//   // State ข้อมูล
//   const [listName, setListName] = useState("");
//   const [items, setItems] = useState([]); 
//   const [originalList, setOriginalList] = useState(null); 
  
//   // ✅ 2. เพิ่ม State สำหรับเลือกร้านค้า
//   const [selectedStores, setSelectedStores] = useState({
//     ALL: true, LOTUS: false, BIGC: false, MAKRO: false,
//   });
  
//   // Mock Membership (ในอนาคตดึงจาก User Profile)
//   const membership = { LOTUS: true, BIGC: false, MAKRO: false };

//   const [currentUser, setCurrentUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [isSaving, setIsSaving] = useState(false);

//   const [showExitModal, setShowExitModal] = useState(false);
//   const [showWarningModal, setShowWarningModal] = useState(false);

//   // 1. เช็ค Auth
//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       setCurrentUser(user);
//     });
//     return () => unsubscribe();
//   }, []);

//   // 2. Load Data
//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
      
//       const allLists = JSON.parse(localStorage.getItem("myLists")) || [];
//       const localList = allLists.find(l => String(l.id) === String(id));

//       if (localList) {
//         setOriginalList(localList);
//         setListName(localList.name);
//         setItems([...(localList.items || [])]); 
//         // โหลดค่าร้านค้าที่เคยเลือกไว้ (ถ้ามี)
//         if(localList.selectedStores) setSelectedStores(localList.selectedStores);
//         setLoading(false);
//         return;
//       }

//       if (auth.currentUser) {
//         try {
//           const docRef = doc(db, "shopping_lists", id);
//           const docSnap = await getDoc(docRef);
          
//           if (docSnap.exists()) {
//             const data = docSnap.data();
//             const loadedData = { id: docSnap.id, ...data };
//             setOriginalList(loadedData);
//             setListName(data.name);
//             setItems([...(data.items || [])]); 
//             if(data.selectedStores) setSelectedStores(data.selectedStores);
//           } else {
//             toast.error("ไม่พบรายการนี้");
//             navigate('/mylists');
//           }
//         } catch (error) {
//           console.error("Error fetching:", error);
//           toast.error("โหลดข้อมูลล้มเหลว");
//         }
//       }
      
//       setLoading(false);
//     };

//     fetchData();
//   }, [id, location]); 

//   // Prevent Tab Close
//   useEffect(() => {
//     const handleBeforeUnload = (e) => {
//       e.preventDefault();
//       e.returnValue = ''; 
//     };
//     window.addEventListener('beforeunload', handleBeforeUnload);
//     return () => window.removeEventListener('beforeunload', handleBeforeUnload);
//   }, []);

//   /* ===== STORE TOGGLE LOGIC ===== */
//   const toggleAll = () => {
//     const v = !selectedStores.ALL;
//     setSelectedStores({ ALL: v, LOTUS: v, BIGC: v, MAKRO: v });
//   };

//   const toggleStore = (k) => {
//     const next = { ...selectedStores, [k]: !selectedStores[k], ALL: false };
//     if (next.LOTUS && next.BIGC && next.MAKRO) next.ALL = true;
//     setSelectedStores(next);
//   };

//   /* ===== CATALOG DATA ===== */
//   const [catalog, setCatalog] = useState([
//     { id: "c1", name: "อินโนวีเนส อาหารทางการแพทย์ 300ก.", img: "https://o2o-static.lotuss.com/products/105727/51921065.jpg", qty: 1 },
//     { id: "c2", name: "อันอัน แผ่นรองซึมซับ ไซส์ XXL 10 ชิ้น", img: "https://o2o-static.lotuss.com/products/105727/75583866.jpg", qty: 1 },
//     { id: "c3", name: "เนสท์เล่ บู๊สท์ ออฟติมัม 800 กรัม", img: "https://o2o-static.lotuss.com/products/105727/75009552.jpg", qty: 1 },
//     { id: "c4", name: "ฟีลฟรีแผ่นรองซึมซับใหญ่พิเศษXXL 8 ชิ้น", img: "https://o2o-static.lotuss.com/products/105727/51165406.jpg", qty: 1 },
//     { id: "c5", name: "ซอฟเท็กซ์ แผ่นรองซับ ขนาดใหญ่ 10 ชิ้น", img: "https://o2o-static.lotuss.com/products/105727/791156.jpg", qty: 1 },
//   ]);

//   const increaseCatalogQty = (pid) => setCatalog(prev => prev.map(i => i.id === pid ? { ...i, qty: i.qty + 1 } : i));
//   const decreaseCatalogQty = (pid) => setCatalog(prev => prev.map(i => i.id === pid && i.qty > 1 ? { ...i, qty: i.qty - 1 } : i));

//   /* ===== ITEMS LOGIC ===== */
//   const handleSelectFromCatalog = (product) => {
//     const existingIndex = items.findIndex((item) => item.name === product.name); 
//     if (existingIndex !== -1) {
//       setItems((prev) => {
//         const next = [...prev];
//         next[existingIndex].qty += product.qty;
//         return next;
//       });
//     } else {
//       setItems((prev) => [...prev, { ...product }]);
//     }
//     toast.success(`เพิ่ม ${product.name} แล้ว`, { duration: 1500, icon: <CheckCircle2 size={18} color="#10b981" /> });
//   };

//   const updateQty = (index, delta) => {
//     setItems((prev) => {
//       const next = [...prev];
//       next[index].qty = Math.max(1, next[index].qty + delta);
//       return next;
//     });
//   };

//   const removeItem = (index) => setItems((prev) => prev.filter((_, i) => i !== index));

//   const hasChanges = () => {
//     if (!originalList) return false;
//     const nameChanged = listName !== originalList.name;
//     const currentItemsStr = JSON.stringify(items);
//     const originalItemsStr = JSON.stringify(originalList.items || []);
//     const storesChanged = JSON.stringify(selectedStores) !== JSON.stringify(originalList.selectedStores || {});
    
//     return nameChanged || (currentItemsStr !== originalItemsStr) || storesChanged;
//   };

//   /* ===== BUTTON ACTIONS ===== */
//   const handleBackClick = () => {
//     if (hasChanges()) {
//       setShowExitModal(true); 
//     } else {
//       navigate(-1); 
//     }
//   };

//   const confirmExit = () => {
//     setShowExitModal(false);
//     navigate(-1); 
//   };

//   const handleGoToProducts = () => {
//     toast('กรุณาบันทึกการเปลี่ยนแปลงก่อนไปหน้าสินค้า', { 
//       icon: <Info size={18} color="#3b82f6" />,
//       style: { border: '1px solid #bfdbfe', color: '#1e40af' }
//     });
//   };

//   const handleSaveFinal = async () => {
//     if (!listName.trim()) {
//       setShowWarningModal(true);
//       return;
//     }

//     setIsSaving(true);
//     const toastId = toast.loading("กำลังบันทึกการแก้ไข...");

//     try {
//         const updatedData = {
//             name: listName,
//             items: items, 
//             totalItems: items.reduce((sum, i) => sum + i.qty, 0),
//             // ✅ บันทึกร้านค้าที่เลือกไปด้วย
//             selectedStores: selectedStores,
//             updatedAt: new Date().toISOString() 
//         };

//         const isLocalId = !isNaN(id); 

//         if (!isLocalId && currentUser) {
//             const docRef = doc(db, "shopping_lists", id);
//             await updateDoc(docRef, {
//                 ...updatedData,
//                 updatedAt: serverTimestamp() 
//             });
//         } else {
//             const allLists = JSON.parse(localStorage.getItem("myLists")) || [];
//             const existingIndex = allLists.findIndex(l => String(l.id) === String(id));
            
//             if (existingIndex !== -1) {
//                 const newList = { ...allLists[existingIndex], ...updatedData };
//                 allLists[existingIndex] = newList;
//                 localStorage.setItem("myLists", JSON.stringify(allLists));
//             }
//         }

//         toast.dismiss(toastId);
//         // ไปหน้า Compare พร้อมส่ง State ไปด้วย
//         navigate(`/mylists/compare/${id}`, { 
//             state: { selectedStores: selectedStores }
//         });

//     } catch (error) {
//         console.error("Save error:", error);
//         toast.error("บันทึกไม่สำเร็จ", { id: toastId });
//         setIsSaving(false);
//     }
//   };

//   if (loading) {
//       return <div style={{padding: 50, textAlign:'center'}}>กำลังโหลดข้อมูล...</div>;
//   }

//   return (
//     <>
//       <main className="le-page">
//         <section className="le-header-section">
//           <div className="le-header-inner">
//             <div className="le-topLeft">
//               <button className="le-back-btn" onClick={handleBackClick}>
//                 <ChevronLeft size={28} strokeWidth={2.5} />
//               </button>
//               <div>
//                 <h1 className="le-title">EDIT LIST</h1>
//                 <p className="le-subtitle">แก้ไขรายการสินค้า</p>
//               </div>
//             </div>
//           </div>
//         </section>

//         <div className="le-container">
//           <div className="le-nameBlock">
//             <div className="le-label">ชื่อรายการ</div>
//             <input 
//               className="le-input" 
//               value={listName} 
//               onChange={(e) => setListName(e.target.value)}
//               placeholder="ตั้งชื่อรายการ..."
//             />
//           </div>

//           {/* Catalog Section */}
//           <section className="le-box">
//             <div className="le-boxHead">
//               <div className="le-boxTitle">เลือกสินค้าแนะนำ</div>
//               <button className="le-seeAllBtn" onClick={() => navigate('/mylists/create/products/new')}> 
//                 ดูสินค้าทั้งหมด <ChevronRight size={20} />
//               </button>
//             </div>
//             <div className="le-cards">
//               {catalog.map((p) => (
//                 <div key={p.id} className="le-card">
//                   <div className="le-imgWrap"><img src={p.img} alt={p.name} /></div>
//                   <div className="le-cardName">{p.name}</div>
//                   <div className="le-qty">
//                     <button onClick={() => decreaseCatalogQty(p.id)}><Minus size={14} /></button>
//                     <span>{p.qty}</span>
//                     <button onClick={() => increaseCatalogQty(p.id)}><Plus size={14} /></button>
//                   </div>
//                   <button className="le-select" onClick={() => handleSelectFromCatalog(p)}>
//                     <Plus size={16} strokeWidth={3} style={{marginRight:4, transform: "translateY(3px)"}}/> เพิ่ม
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </section>

//           {/* Items Section */}
//           <section className="le-box">
//             <div className="le-boxHead">
//               <div className="le-boxTitle">รายการที่เลือก ({items.length})</div>
//             </div>
//             {items.length > 0 ? (
//               <div className="le-cards">
//                 {items.map((item, idx) => (
//                   <div key={idx} className="le-card">
//                     <button className="le-remove" onClick={() => removeItem(idx)}><Trash2 size={14} /></button>
//                     <div className="le-imgWrap"><img src={item.img} alt={item.name} /></div>
//                     <div className="le-cardName">{item.name}</div>
//                     <div className="le-qty">
//                       <button onClick={() => updateQty(idx, -1)}><Minus size={14} /></button>
//                       <span>{item.qty}</span>
//                       <button onClick={() => updateQty(idx, 1)}><Plus size={14} /></button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div style={{ padding: '40px', color: '#999', textAlign: 'center' }}>ยังไม่มีสินค้าในรายการ</div>
//             )}
//           </section>

//           {/* ✅ 3. ส่วน Store Selection & Membership (เพิ่มใหม่) */}
//           <div className="le-grid-row">
//             {/* กล่องเลือกร้านค้า */}
//             <section className="le-box le-box-half">
//               <div className="le-boxTitle" style={{marginBottom: 15}}>เลือกร้านค้าที่ต้องการเปรียบเทียบ</div>
//               <div className="le-checkRow" onClick={toggleAll}>
//                 <span className={`le-check ${selectedStores.ALL ? "on" : ""}`} />
//                 <span className="le-checkText">ทั้งหมด</span>
//               </div>
//               {["LOTUS", "BIGC", "MAKRO"].map((k) => (
//                 <div key={k} className="le-checkRow" onClick={() => toggleStore(k)}>
//                   <span className={`le-check ${selectedStores[k] ? "on" : ""}`} />
//                   <span className="le-checkText">{k === 'LOTUS' ? "Lotus's" : k === 'BIGC' ? "Big C" : "Makro"}</span>
//                 </div>
//               ))}
//             </section>

//             {/* กล่องสถานะสมาชิก */}
//             <section className="le-box le-box-half">
//               <div className="le-boxTitle" style={{marginBottom: 15}}>สถานะสมาชิก</div>
//               {["LOTUS", "BIGC", "MAKRO"].map((brand) => (
//                 <MemberRow key={brand} brand={brand} isMember={membership[brand]} />
//               ))}
//             </section>
//           </div>

//           <div className="le-saveWrap">
//             <button className="le-saveBtn" onClick={handleSaveFinal} disabled={isSaving}>
//               {isSaving ? (
//                   <>
//                     <Loader2 className="animate-spin" size={20} style={{ marginRight: 8 }} />
//                     กำลังบันทึก...
//                   </>
//               ) : (
//                   <>
//                     <Save size={20} style={{ marginRight: 8 }} />
//                     บันทึกการแก้ไข
//                   </>
//               )}
//             </button>
//           </div>
//         </div>
//       </main>

//       {/* Modals */}
//       {showExitModal && (
//         <div className="modal-overlay" onClick={() => setShowExitModal(false)}>
//           <div className="modal-box" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-icon-circle danger">
//               <AlertTriangle size={36} strokeWidth={2} />
//             </div>
//             <h3 className="modal-title">ยกเลิกการแก้ไข?</h3>
//             <p className="modal-desc">การเปลี่ยนแปลงจะไม่ถูกบันทึก <br/>ต้องการย้อนกลับใช่หรือไม่?</p>
//             <div className="modal-actions row">
//               <button className="modal-btn cancel" onClick={() => setShowExitModal(false)}>แก้ไขต่อ</button>
//               <button className="modal-btn delete" onClick={confirmExit}>ไม่บันทึก</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {showWarningModal && (
//         <div className="modal-overlay" onClick={() => setShowWarningModal(false)}>
//           <div className="modal-box" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-icon-circle warning">
//               <AlertTriangle size={48} strokeWidth={2} />
//             </div>
//             <h3 className="modal-title">กรุณากรอกชื่อรายการ</h3>
//             <p className="modal-desc">โปรดระบุชื่อก่อนทำการบันทึก</p>
//             <div className="modal-actions">
//               <button className="modal-btn primary" onClick={() => setShowWarningModal(false)}>ตกลง</button>
//             </div>
//           </div>
//         </div>
//       )}

//       <Toaster position="top-center" />
//       <Footer />
//     </>
//   );
// }

// /* ✅ 4. Component ย่อยสำหรับ Member Row */
// function MemberRow({ brand, isMember }) {
//   return (
//     <div className={`le-memberRow ${isMember ? "ok" : ""}`}>
//       <div className={`le-brand-logo ${brand.toLowerCase()}`}>
//         <img src={STORE_LOGOS[brand]} alt={brand} />
//       </div>
//       <div className="le-memberText">
//         {isMember ? "เป็นสมาชิกแล้ว" : "ไม่ได้เป็นสมาชิก"}
//       </div>
//       {!isMember && (
//         <a href={REGISTER_URL[brand]} target="_blank" rel="noopener noreferrer" className="le-join">
//           สมัคร
//         </a>
//       )}
//       {isMember && (
//         <div className="le-check-icon">
//           <Check size={18} color="#10b77e" />
//         </div>
//       )}
//     </div>
//   );
// }