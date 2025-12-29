import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, X, Check, PackagePlus, ListPlus } from 'lucide-react'; // เพิ่ม Icon ใหม่
import './AddToListModal.css'; // อย่าลืมเปลี่ยนชื่อไฟล์ CSS ให้ตรงกัน

const AddToListModal = ({ isOpen, onClose, product }) => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [myLists, setMyLists] = useState(() => {
    const savedData = localStorage.getItem("myLists");
    return savedData ? JSON.parse(savedData) : [];
  });
  const [addedListId, setAddedListId] = useState(null);

  useEffect(() => {
    if (isOpen) {
        setQuantity(1);
        setAddedListId(null);
    }
  }, [isOpen]);

  const handleQuantity = (type) => {
    if (type === 'inc') setQuantity(prev => prev + 1);
    if (type === 'dec' && quantity > 1) setQuantity(prev => prev - 1);
  };

  const handleAddToList = (listId) => {
    const currentLists = JSON.parse(localStorage.getItem("myLists")) || [];
    const updatedLists = currentLists.map(list => {
      if (list.id === listId) {
        const newItem = {
            id: product.id || `prod-${Date.now()}`,
            name: product.data, // หรือ product.name ตาม API
            img: product.image,
            qty: quantity
        };
        // ... (Logic เดิมในการรวมจำนวนสินค้า) ...
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
    setTimeout(() => { setAddedListId(null); onClose(); }, 1200); // ปิด Auto หลังเพิ่มเสร็จให้ UX ลื่นไหล
  };

  if (!isOpen || !product) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Header แบบ Clean */}
        <div className="modal-header">
          <div className="header-title">
            <PackagePlus size={24} color="#5c9c73" />
            <h3>เพิ่มลงรายการ</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Product Card ดีไซน์ใหม่ */}
          <div className="product-hero-card">
            <div className="product-hero-img">
               <img src={product.image} alt={product.data} />
            </div>
            <div className="product-hero-info">
              <h4>{product.name || product.data}</h4> {/* ใช้ชื่อสินค้า */}
              
              <div className="quantity-wrapper">
                <span className="qty-label">จำนวน:</span>
                <div className="quantity-controls">
                  <button onClick={() => handleQuantity('dec')} disabled={quantity <= 1}><Minus size={14}/></button>
                  <span className="qty-value">{quantity}</span>
                  <button onClick={() => handleQuantity('inc')}><Plus size={14}/></button>
                </div>
              </div>
            </div>
          </div>

          <div className="list-section-title">เลือกรายการของคุณ</div>

          <div className="list-selection-container">
            {myLists.length > 0 ? (
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

                    <div className="action-arrow">
                       <Plus size={18} />
                    </div>
                </div>
                ))
            ) : (
                <div className="empty-state">
                    <p>ยังไม่มีรายการสินค้า</p>
                </div>
            )}
          </div>

          {/* ปุ่มสร้างใหม่แบบ Sticky Bottom */}
          <div className="create-new-list-area">
             <button className="btn-start-create" onClick={() => navigate('/mylists/create')}>
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