import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, MoreVertical, Trash2, Plus, Pencil, LogIn, Loader2 } from 'lucide-react'; 
import { Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast'; 

import Navbar from '../Home/Navbar';
import Footer from '../Home/Footer';
import './MyLists.css'; 

import { db, auth } from '../../firebase-config';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const MyLists = () => {
  const navigate = useNavigate();

  const [savedLists, setSavedLists] = useState([]); 
  const [currentUser, setCurrentUser] = useState(null); 
  const [isLoading, setIsLoading] = useState(true); 

  const [menuId, setMenuId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      // ไม่ว่าจะมี User หรือไม่ ก็ให้โหลดข้อมูลมาแสดง (Local + Cloud)
      await loadAllLists(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ✅ ฟังก์ชันโหลดข้อมูลแบบรวมร่าง (Local + Firebase)
  const loadAllLists = async (user) => {
    let mergedLists = [];

    // 1. ดึงจาก LocalStorage เสมอ
    const localData = JSON.parse(localStorage.getItem("myLists")) || [];
    mergedLists = [...localData];

    // 2. ถ้ามี User ให้ดึงจาก Firebase มาสมทบ
    if (user) {
      try {
        const q = query(collection(db, "shopping_lists"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const cloudLists = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        
        // รวมรายการ (ป้องกัน ID ซ้ำกัน)
        const localIds = new Set(localData.map(l => String(l.id)));
        const newCloudLists = cloudLists.filter(l => !localIds.has(String(l.id)));
        
        mergedLists = [...mergedLists, ...newCloudLists];
      } catch (error) {
        console.error("Error fetching firebase:", error);
        toast.error("โหลดข้อมูลออนไลน์ไม่สำเร็จ");
      }
    }

    // เรียงลำดับใหม่สุดขึ้นก่อน (ถ้ามี createdAt)
    mergedLists.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    setSavedLists(mergedLists);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = (id, e) => { e.stopPropagation(); setMenuId(menuId === id ? null : id); };
  
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
    setMenuId(null);
  };

  // ✅ แก้ไข confirmDelete ให้ลบทั้ง 2 ที่ (Clean Sweep)
  const confirmDelete = async () => {
    if (!deleteId) return; // ไม่ต้องเช็ค currentUser เผื่อลบของ Local

    const toastId = toast.loading('กำลังลบรายการ...');
    const docIdString = String(deleteId);

    try {
      // 1. ลบออกจาก Firebase (ถ้า Login อยู่ และไม่ใช่ ID แบบ Local)
      // (ID Local มักจะเป็นตัวเลขยาวๆ ส่วน Firebase เป็นตัวอักษรผสม)
      if (currentUser && isNaN(Number(docIdString))) {
         try {
            await deleteDoc(doc(db, "shopping_lists", docIdString));
         } catch (e) {
            console.log("Not found in cloud or error", e);
         }
      }

      // 2. ✅ ลบออกจาก LocalStorage เสมอ (นี่คือจุดสำคัญแก้ปัญหาชื่อซ้ำ)
      const allLocal = JSON.parse(localStorage.getItem("myLists")) || [];
      const newLocal = allLocal.filter(l => String(l.id) !== docIdString);
      localStorage.setItem("myLists", JSON.stringify(newLocal));
      
      // 3. อัปเดตหน้าจอ
      setSavedLists(prev => prev.filter(l => String(l.id) !== docIdString));
      
      toast.success('ลบรายการเรียบร้อย', { id: toastId });

    } catch (err) { 
      console.error("Delete Error:", err);
      toast.error('เกิดข้อผิดพลาด: ' + err.message, { id: toastId });
    } finally {
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="header-section">
        <div className="content-container">
          <div className="mylist-header">
            <div className="header-left">
              <div className="back-circle" onClick={() => navigate('/')}>
                 <ChevronLeft size={24} color="#555" />
              </div>
              <div className="header-text-group">
                <h1 className="header-title">MYLISTS</h1>
                <p className="header-subtitle">
                   {currentUser ? "รายการช้อปปิ้งของคุณ" : "รายการในเครื่อง (Guest)"}
                </p>
              </div>
            </div>

            <Link to="/mylists/create" style={{ textDecoration: 'none' }}>
              <button className="btn-newlist">
                <Plus size={16} strokeWidth={3} style={{marginRight:4, transform: "translateY(3px)"}}/> NEWLIST
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="content-section" onClick={() => setMenuId(null)}>
        <div className="content-container">
          
          {(() => {
            if (isLoading) {
              return (
                <div style={{textAlign: 'center', marginTop: '50px', color: '#999', display:'flex', justifyContent:'center', gap: 10}}>
                  <Loader2 className="animate-spin" /> กำลังโหลดข้อมูล...
                </div>
              );
            }

            // ถ้าไม่มีรายการเลย
            if (savedLists.length === 0) {
              return (
                <div className="empty-dashed-container">
                  <p className="empty-text">ยังไม่มีรายการสินค้า</p>
                  <Link to="/mylists/create" className="empty-create-link">
                    สร้างรายการใหม่ +
                  </Link>
                </div>
              );
            }

            return (
              <div className="lists-grid">
                {savedLists.map((list) => (
                  <div key={list.id} className="list-card">
                    <div className="card-top-menu" ref={menuId === list.id ? menuRef : null}>
                      <button className="menu-icon-btn" onClick={(e) => toggleMenu(list.id, e)}>
                        <MoreVertical size={20} color="#6b7280" />
                      </button>
                      {menuId === list.id && (
                        <div className="menu-dropdown">
                          <div className="menu-item edit" onClick={(e) => { e.stopPropagation(); navigate(`/mylists/edit/${list.id}`); }}>
                            <Pencil size={16} /> <span>แก้ไข</span>
                          </div>
                          <div className="menu-item delete" onClick={(e) => { e.stopPropagation(); handleDeleteClick(list.id); }}>
                            <Trash2 size={16} /> <span>ลบรายการ</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="card-body">
                      <h3 className="card-title">{list.name}</h3>
                      <p className="card-count">{list.items ? list.items.length : list.totalItems || 0} รายการ</p>
                    </div>
                    <div className="card-footer">
                      <button className="btn-open" onClick={() => navigate(`/mylists/compare/${list.id}`)}>
                        เปิด
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

        </div>
      </div>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-box fade-in">
            <h3 className="modal-title-small">ยืนยันการลบ?</h3>
            <p className="modal-desc-small">รายการนี้จะหายไปถาวร</p>
            <div className="modal-actions-small">
              <button className="btn-small cancel" onClick={() => setShowDeleteModal(false)}>ยกเลิก</button>
              <button className="btn-small confirm" onClick={confirmDelete}>ลบเลย</button>
            </div>
          </div>
        </div>
      )}

      <Toaster position="top-center" />
      <Footer />
    </div>
  );
};

export default MyLists;