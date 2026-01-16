import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, X, ListPlus, Info, Loader2, ChevronRight } from 'lucide-react'; 
import { Toaster } from 'react-hot-toast'; 
import './AddToListModal.css';

import { auth, db } from '../../firebase-config';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

const AddToListModal = ({ isOpen, onClose, product }) => {
  const navigate = useNavigate();
  const [myLists, setMyLists] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. เช็ค Login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // 2. โหลดรายการ List
  useEffect(() => {
    if (isOpen) {
        fetchLists();
    }
  }, [isOpen, currentUser]);

  const fetchLists = async () => {
    setLoading(true);
    if (currentUser) {
        try {
            const q = query(collection(db, "shopping_lists"), where("userId", "==", currentUser.uid));
            const querySnapshot = await getDocs(q);
            
            // ใช้ doc.id (H2er3...) เป็น id หลัก เพื่อให้ URL ถูกต้อง
            const cloudLists = querySnapshot.docs.map(doc => ({ 
                ...doc.data(), 
                id: doc.id 
            }));
            
            setMyLists(cloudLists);
        } catch (error) {
            console.error("Error loading cloud lists:", error);
        }
    } else {
        try {
            const savedData = localStorage.getItem("myLists");
            const parsedData = savedData ? JSON.parse(savedData) : [];
            setMyLists(Array.isArray(parsedData) ? parsedData : []);
        } catch (error) {
            setMyLists([]);
        }
    }
    setLoading(false);
  };

  // ✅ ฟังก์ชัน: ไปที่ลิสต์พร้อมหิ้วสินค้าไปด้วย
  const handleGoToList = (listId) => {
    // 1. จัดเตรียมข้อมูลสินค้าให้อยู่ในฟอร์แมตที่พร้อมใช้
    const productToSend = {
      id: product.id || `prod-${Date.now()}`,
      name: product.name || product.data || "สินค้าไม่ระบุชื่อ",
      img: product.image || product.img || "", 
      qty: 1, // ค่าเริ่มต้น (เพราะหน้า Modal นี้เราตัดตัวปรับจำนวนออกแล้ว)
      price: product.price || 0 // (เผื่อมีราคา)
    };

    console.log("Navigating to List:", listId, "With Item:", productToSend);
    
    onClose(); 

    // 2. สั่งเปลี่ยนหน้า พร้อมแนบ state ชื่อ 'incomingItem' ไปด้วย
    navigate(`/mylists/compare/${listId}`, { 
      state: { incomingItem: productToSend } 
    }); 
  };

  const handleCreateNewList = () => {
    // เตรียมข้อมูลส่งไปหน้าสร้างใหม่เหมือนกัน
    const productToSend = {
        id: product.id || `prod-${Date.now()}`,
        name: product.name || product.data || "สินค้าไม่ระบุชื่อ",
        img: product.image || product.img || "", 
        qty: 1
    };
    onClose();
    navigate('/mylists/create', { state: { initialItem: productToSend } });
  };

  if (!isOpen || !product) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-green">
          <h3>เพิ่มไปยังรายการของฉัน</h3>
          <button className="close-btn-white" onClick={onClose}><X size={24} /></button>
        </div>

        <div className="modal-body">
          {/* แสดงสินค้าที่จะนำไป */}
          <div className="product-row-card">
            <div className="prod-img">
               <img 
                 src={product.image || product.img || "https://via.placeholder.com/60"} 
                 alt={product.name} 
                 onError={(e) => e.target.src = "https://via.placeholder.com/60"} 
               />
            </div>
            <div className="prod-name">{product.name || product.data || "สินค้า"}</div>
          </div>

          <div className="info-note">
             <Info size={16} />
             <span>เลือกรายการเพื่อนำสินค้านี้ไปใส่</span>
          </div>

          {/* รายการ List */}
          <div className="list-selection-container">
            {loading ? (
                <div className="empty-state"><Loader2 className="animate-spin" size={24} /><p>กำลังโหลด...</p></div>
            ) : myLists.length > 0 ? (
                myLists.map((list) => (
                    <div 
                        key={list.id} 
                        className="list-card-item"
                        onClick={() => handleGoToList(list.id)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="list-icon-box" style={{ backgroundColor: list.bg || '#dcfce7', color: list.color || '#166534' }}>
                           <ShoppingCart size={20} />
                        </div>
                        <div className="list-text">
                          <span className="list-name">{list.name}</span>
                          <span className="list-count">{list.totalItems || 0} รายการ</span>
                        </div>
                        <div className="action-arrow">
                            <ChevronRight size={20} color="#ccc" />
                        </div>
                    </div>
                ))
            ) : (
                <div className="empty-state">
                    <p>ยังไม่มีรายการสินค้า</p>
                </div>
            )}
          </div>

          {/* ปุ่มสร้างใหม่ */}
          <div className="create-new-list-area">
             <button className="btn-start-create" onClick={handleCreateNewList}>
                <ListPlus size={18} />
                <span>สร้างรายการใหม่พร้อมสินค้านี้</span>
             </button>
          </div>
        </div>
      </div>
      <Toaster position="top-center" />
    </div>
  );
};

export default AddToListModal;