import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, X, Check, ListPlus, Info } from 'lucide-react'; 
import './AddToListModal.css';

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
            name: product.name || product.data,
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
        return { ...list, items: newItems, totalItems: newTotal };
      }
      return list;
    });

    localStorage.setItem("myLists", JSON.stringify(updatedLists));
    setMyLists(updatedLists);
    setAddedListId(listId);
    setTimeout(() => { setAddedListId(null); onClose(); }, 1200);
  };

  // ✨ ฟังก์ชันสำหรับส่งข้อมูลสินค้าไปหน้าสร้างรายการใหม่
  const handleCreateNewList = () => {
    const productToSend = {
      id: product.id || `prod-${Date.now()}`,
      name: product.name || product.data,
      img: product.image, // ใช้ 'img' ให้ตรงกับ CreateMyList
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
               <img src={product.image} alt={product.name} />
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
             <span>สามารถเพิ่มใส่ใน MyList ที่มีอยู่ได้ทันที</span>
          </div>

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
                    <div className="action-arrow"><Plus size={18} /></div>
                </div>
                ))
            ) : (
                <div className="empty-state"><p>ยังไม่มีรายการสินค้า</p></div>
            )}
          </div>

          <div className="create-new-list-area">
             {/* ✅ แก้ไข onClick ให้เรียก handleCreateNewList */}
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