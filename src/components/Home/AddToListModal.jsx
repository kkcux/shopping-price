import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, X, Check, Info } from 'lucide-react'; 
import './Home.css';

const AddToListModal = ({ isOpen, onClose, product }) => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  // Lazy Initialization: โหลดข้อมูลครั้งแรกครั้งเดียว จบ!
  // (ข้อมูลจะสดใหม่เสมอ เพราะเมื่อเราเปลี่ยนหน้าไปสร้างรายการ Component นี้จะถูกรีเซ็ตใหม่เอง)
  const [myLists, setMyLists] = useState(() => {
    const savedData = localStorage.getItem("myLists");
    return savedData ? JSON.parse(savedData) : [];
  });

  const [addedListId, setAddedListId] = useState(null);

  // useEffect เหลือหน้าที่แค่ "รีเซ็ตฟอร์ม" เมื่อเปิด Modal
  // ลบโค้ด setMyLists(...) ออกไปเลย เพื่อแก้ปัญหาตัวแดงและการ Render วนซ้ำ
  useEffect(() => {
    if (isOpen) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setQuantity(1);
        setAddedListId(null);
    }
  }, [isOpen]);

  const handleQuantity = (type) => {
    if (type === 'inc') setQuantity(prev => prev + 1);
    if (type === 'dec' && quantity > 1) setQuantity(prev => prev - 1);
  };

  // ฟังก์ชันเพิ่มสินค้าลงใน List
  const handleAddToList = (listId) => {
    const currentLists = JSON.parse(localStorage.getItem("myLists")) || [];
    
    const updatedLists = currentLists.map(list => {
      if (list.id === listId) {
        const newItem = {
            id: product.id || `prod-${Date.now()}`,
            name: product.data,
            img: product.image,
            qty: quantity
        };

        const existingItemIndex = (list.items || []).findIndex(item => item.name === newItem.name);
        let newItems = list.items ? [...list.items] : [];

        if (existingItemIndex > -1) {
            newItems[existingItemIndex].qty += quantity;
        } else {
            newItems.push(newItem);
        }

        const newTotal = newItems.reduce((sum, item) => sum + item.qty, 0);

        return { 
            ...list, 
            items: newItems,
            totalItems: newTotal 
        };
      }
      return list;
    });

    localStorage.setItem("myLists", JSON.stringify(updatedLists));
    setMyLists(updatedLists);
    setAddedListId(listId);

    setTimeout(() => {
      setAddedListId(null);
    }, 1500);
  };

  if (!isOpen || !product) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <h3>เลือก List ที่ต้องการเพิ่ม</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={24} color="white" />
          </button>
        </div>

        <div className="modal-body">
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

          <div className="note-text">
             <Info size={16} color="#f59e0b" />
             <span>สามารถเพิ่มใส่ใน MyList ที่มีอยู่ได้ทันที</span>
          </div>

          <div className="list-selection-container">
            {myLists.length > 0 ? (
                myLists.map((list) => (
                <div 
                    key={list.id} 
                    className="list-card-item"
                    onClick={() => handleAddToList(list.id)}
                >
                    <div className="list-icon-box" style={{ backgroundColor: list.bg || '#e2e8f0', color: list.color || 'black' }}>
                    <ShoppingCart size={20} />
                    </div>
                    <div className="list-text">
                    <span className="list-name">{list.name}</span>
                    <span className="list-count">{list.totalItems || list.count || 0} รายการ</span>
                    </div>

                    <div className={`action-icon ${addedListId === list.id ? 'success' : ''}`}>
                    {addedListId === list.id ? (
                        <Check size={20} color="white" /> 
                    ) : (
                        <Plus size={20} color="#94a3b8" />
                    )}
                    </div>
                </div>
                ))
            ) : (
                <div style={{ textAlign: 'center', color: '#999', padding: '10px' }}>
                    ยังไม่มีรายการสินค้า
                </div>
            )}

            {/* ส่วนสร้างรายการใหม่ */}
            <div className="create-new-list-area">
                <button 
                  className="btn-start-create" 
                  onClick={() => navigate('/mylists/create')} 
                >
                    <Plus size={18} />
                    <span>สร้างรายการใหม่</span>
                </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default AddToListModal;