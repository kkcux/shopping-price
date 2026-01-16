import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, X, Check, ListPlus, Info, Loader2 } from 'lucide-react'; 
import './AddToListModal.css';

// ✅ 1. เพิ่ม Import Firebase
import { auth, db } from '../../firebase-config';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';

const AddToListModal = ({ isOpen, onClose, product }) => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [myLists, setMyLists] = useState([]);
  const [addedListId, setAddedListId] = useState(null);
  
  // ✅ เพิ่ม State สำหรับเช็ค User และ Loading
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ 2. เช็คสถานะ Login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // ✅ 3. โหลดข้อมูล (แยก Guest / User)
  useEffect(() => {
    if (isOpen) {
        setQuantity(1);
        setAddedListId(null);
        fetchLists();
    }
  }, [isOpen, currentUser]); // เพิ่ม dependency currentUser

  const fetchLists = async () => {
    setLoading(true);
    if (currentUser) {
        // --- 🅰️ กรณี Login: ดึงจาก Firestore ---
        try {
            const q = query(
                collection(db, "shopping_lists"), 
                where("userId", "==", currentUser.uid)
            );
            const querySnapshot = await getDocs(q);
            const cloudLists = querySnapshot.docs.map(doc => ({
                id: doc.id, 
                ...doc.data()
            }));
            setMyLists(cloudLists);
        } catch (error) {
            console.error("Error fetching cloud lists:", error);
        }
    } else {
        // --- 🅱️ กรณี Guest: ดึงจาก LocalStorage (โค้ดเดิม) ---
        try {
            const savedData = localStorage.getItem("myLists");
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                setMyLists(Array.isArray(parsedData) ? parsedData : []);
            } else {
                setMyLists([]);
            }
        } catch (error) {
            setMyLists([]);
        }
    }
    setLoading(false);
  };

  const handleQuantity = (type) => {
    if (type === 'inc') setQuantity(prev => prev + 1);
    if (type === 'dec' && quantity > 1) setQuantity(prev => prev - 1);
  };

  // ✅ 4. บันทึกข้อมูล (แยก Guest / User)
  const handleAddToList = async (listId) => {
    // เตรียมข้อมูลสินค้า
    const newItem = {
        id: product.id || `prod-${Date.now()}`,
        name: product.name || product.data,
        img: product.image,
        qty: quantity
    };

    if (currentUser) {
        // --- 🅰️ กรณี Login: บันทึกลง Firestore ---
        try {
            const listRef = doc(db, "shopping_lists", listId);
            
            // เราต้องอ่านข้อมูลล่าสุดก่อน เพื่อคำนวณจำนวนสินค้า (ป้องกันการทับซ้อน)
            const listSnap = await getDoc(listRef);
            
            if (listSnap.exists()) {
                const listData = listSnap.data();
                let currentItems = listData.items || [];
                
                const existingIndex = currentItems.findIndex(i => i.name === newItem.name);
                
                if (existingIndex > -1) {
                    currentItems[existingIndex].qty += quantity;
                } else {
                    currentItems.push(newItem);
                }

                const newTotal = currentItems.reduce((sum, item) => sum + item.qty, 0);

                // อัปเดตกลับไปที่ Firestore
                await updateDoc(listRef, {
                    items: currentItems,
                    totalItems: newTotal
                });

                // อัปเดต State หน้าจอ (เพื่อให้ UI เปลี่ยนทันทีไม่ต้องรอ fetch ใหม่)
                setMyLists(prev => prev.map(l => 
                    l.id === listId ? { ...l, items: currentItems, totalItems: newTotal } : l
                ));
            }

            setAddedListId(listId);
            setTimeout(() => { setAddedListId(null); onClose(); }, 1200);

        } catch (error) {
            console.error("Error updating cloud list:", error);
            alert("เกิดข้อผิดพลาดในการบันทึก");
        }

    } else {
        // --- 🅱️ กรณี Guest: บันทึกลง LocalStorage (โค้ดเดิม) ---
        const currentLists = JSON.parse(localStorage.getItem("myLists")) || [];
        const updatedLists = currentLists.map(list => {
            if (list.id === listId) {
                const existingItemIndex = (list.items || []).findIndex(item => item.name === newItem.name);
                let newItems = list.items ? [...list.items] : [];
                if (existingItemIndex > -1) {
                    newItems[existingItemIndex].qty += quantity;
                } else {
                    newItems.push(newItem);
                }
                const newTotal = newItems.reduce((sum, item) => sum + item.qty, 0);
                return { ...list, items: newItems, totalItems: newTotal };
            }
            return list;
        });

        localStorage.setItem("myLists", JSON.stringify(updatedLists));
        setMyLists(updatedLists);
        setAddedListId(listId);
        setTimeout(() => { setAddedListId(null); onClose(); }, 1200);
    }
  };

  const handleCreateNewList = () => {
    const productToSend = {
      id: product.id || `prod-${Date.now()}`,
      name: product.name || product.data,
      img: product.image, 
      qty: quantity
    };

    navigate('/mylists/create', { 
      state: { initialItem: productToSend } 
    });
  };

  if (!isOpen || !product) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-green">
          <h3>เลือก List ที่ต้องการเพิ่ม</h3>
          <button className="close-btn-white" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <div className="product-row-card">
            <div className="prod-img">
               <img src={product.image} alt={product.name || product.data} />
            </div>
            <div className="prod-name">{product.name || product.data}</div>
            <div className="qty-control-group">
              <button onClick={() => handleQuantity('dec')} disabled={quantity <= 1}><Minus size={16}/></button>
              <span>{quantity}</span>
              <button onClick={() => handleQuantity('inc')}><Plus size={16}/></button>
            </div>
          </div>

          <div className="info-note">
             <Info size={16} />
             <span>
                {currentUser 
                    ? "บันทึกข้อมูลลงในบัญชีของคุณ (Cloud)" 
                    : "บันทึกในเครื่อง (Guest) - เข้าสู่ระบบเพื่อซิงค์ข้อมูล"
                }
             </span>
          </div>

          <div className="list-selection-container">
            {loading ? (
                <div className="empty-state">
                    <Loader2 className="animate-spin" size={24} />
                    <p>กำลังโหลดรายการ...</p>
                </div>
            ) : myLists.length > 0 ? (
                myLists.map((list) => (
                <div 
                    key={list.id} 
                    className={`list-card-item ${addedListId === list.id ? 'selected' : ''}`}
                    onClick={() => handleAddToList(list.id)}
                >
                    <div className="list-icon-box" style={{ backgroundColor: list.bg || '#dcfce7', color: list.color || '#166534' }}>
                      {addedListId === list.id ? <Check size={20} /> : <ShoppingCart size={20} />}
                    </div>
                    <div className="list-text">
                      <span className="list-name">{list.name}</span>
                      <span className="list-count">{list.totalItems || 0} รายการ</span>
                    </div>
                    <div className="action-arrow"><Plus size={18} /></div>
                </div>
                ))
            ) : (
                <div className="empty-state">
                    <p>You haven’t created a list yet</p>
                </div>
            )}
          </div>

          <div className="create-new-list-area">
             <button className="btn-start-create" onClick={handleCreateNewList}>
                <ListPlus size={18} />
                <span>สร้างรายการใหม่</span>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddToListModal;