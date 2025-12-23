import React, { useState, useEffect } from 'react';
// 1. เพิ่ม Info icon เข้ามา
import { ShoppingCart, Plus, Minus, X, Check, Info } from 'lucide-react'; 
import './Home.css';

const AddToListModal = ({ isOpen, onClose, product }) => {
  const [quantity, setQuantity] = useState(1);
  
  const [myLists, setMyLists] = useState([
    { id: 1, name: "ของใช้รายสัปดาห์", count: 5, color: "white", bg: "black" },
    { id: 2, name: "ขนมขบเคี้ยว", count: 10, color: "black", bg: "#86efac" },
    { id: 3, name: "เครื่องใช้ไฟฟ้า", count: 1, color: "white", bg: "#0ea5e9" },
    { id: 4, name: "โทรศัพท์มือถือ", count: 1, color: "black", bg: "#bfdbfe" },
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [addedListId, setAddedListId] = useState(null);

  useEffect(() => {
    if (isOpen) {
        setQuantity(1);
        setIsCreating(false);
        setNewListName("");
        setAddedListId(null);
    }
  }, [isOpen, product]);

  const handleQuantity = (type) => {
    if (type === 'inc') setQuantity(prev => prev + 1);
    if (type === 'dec' && quantity > 1) setQuantity(prev => prev - 1);
  };

  const handleAddToList = (listId) => {
    setMyLists(prevLists => prevLists.map(list => {
      if (list.id === listId) {
        return { ...list, count: list.count + quantity };
      }
      return list;
    }));

    setAddedListId(listId);

    setTimeout(() => {
      setAddedListId(null);
    }, 1500);
  };

  const handleCreateList = () => {
    if (newListName.trim() === "") return;

    const newList = {
        id: Date.now(),
        name: newListName,
        count: 0,
        color: "black",
        bg: "#e2e8f0"
    };

    setMyLists([...myLists, newList]);
    setNewListName("");
    setIsCreating(false);
  };

  if (!isOpen || !product) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <h3>เลือก List ที่ต้องการเพิ่ม</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={24} color="white" />
          </button>
        </div>

        <div className="modal-body">
          {/* ส่วนแสดงสินค้า */}
          <div className="product-summary-card">
            <div className="product-img-wrapper">
               <img src={product.image} alt={product.data} />
            </div>
            <div className="product-info">
              <h4>{product.data}</h4>
            </div>
            <div className="quantity-controls">
              <button onClick={() => handleQuantity('dec')}><Minus size={14}/></button>
              <span>{quantity}</span>
              <button onClick={() => handleQuantity('inc')}><Plus size={14}/></button>
            </div>
          </div>

          {/* 2. ส่วนหมายเหตุ (Note) ที่เพิ่มเข้ามา */}
          <div className="note-text">
             <Info size={16} color="#f59e0b" />
             <span>สามารถเพิ่มใส่ใน MyList ที่มีอยู่ได้ทันที</span>
          </div>

          {/* รายการ List */}
          <div className="list-selection-container">
            {myLists.map((list) => (
              <div 
                key={list.id} 
                className="list-card-item"
                onClick={() => handleAddToList(list.id)}
              >
                <div className="list-icon-box" style={{ backgroundColor: list.bg, color: list.color }}>
                   <ShoppingCart size={20} />
                </div>
                <div className="list-text">
                  <span className="list-name">{list.name}</span>
                  <span className="list-count">{list.count} รายการ</span>
                </div>

                <div className={`action-icon ${addedListId === list.id ? 'success' : ''}`}>
                   {addedListId === list.id ? (
                     <Check size={20} color="white" /> 
                   ) : (
                     <Plus size={20} color="#94a3b8" />
                   )}
                </div>

              </div>
            ))}

            {/* ส่วนสร้างรายการใหม่ */}
            <div className="create-new-list-area">
                {!isCreating ? (
                    <button className="btn-start-create" onClick={() => setIsCreating(true)}>
                        <Plus size={18} />
                        <span>สร้างรายการใหม่</span>
                    </button>
                ) : (
                    <div className="input-new-list-group">
                        <input 
                            type="text" 
                            placeholder="ชื่อรายการ..." 
                            value={newListName}
                            onChange={(e) => setNewListName(e.target.value)}
                            autoFocus
                        />
                        <button className="btn-confirm" onClick={handleCreateList}>ยืนยัน</button>
                        <button className="btn-cancel" onClick={() => setIsCreating(false)}>ยกเลิก</button>
                    </div>
                )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default AddToListModal;