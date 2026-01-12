import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, MoreVertical, Trash2, X, Plus, Pencil } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../Home/Navbar';
import Footer from '../Home/Footer';
import './MyLists.css'; 

const MyLists = () => {
  const navigate = useNavigate();

  const [savedLists, setSavedLists] = useState(() => {
    const data = localStorage.getItem("myLists");
    return data ? JSON.parse(data) : [];
  });

  const [menuId, setMenuId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = (id, e) => {
    e.stopPropagation();
    setMenuId(menuId === id ? null : id);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
    setMenuId(null);
  };

  const confirmDelete = () => {
    if (deleteId) {
      const updated = savedLists.filter(list => list.id !== deleteId);
      setSavedLists(updated);
      localStorage.setItem("myLists", JSON.stringify(updated));
    }
    setShowDeleteModal(false);
    setDeleteId(null);
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
                <p className="header-subtitle">เพิ่มสินค้าลงในรายการของคุณและเราจะค้นหาราคาที่ถูกที่สุดจากทุกร้านค้า</p>
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
          {savedLists.length > 0 ? (
            <div className="lists-grid">
              {savedLists.map((list) => (
                <div key={list.id} className="list-card">
                  
                  <div className="card-top-menu" ref={menuId === list.id ? menuRef : null}>
                    <button className="menu-icon-btn" onClick={(e) => toggleMenu(list.id, e)}>
                      <MoreVertical size={20} color="#6b7280" />
                    </button>

                    {menuId === list.id && (
                      <div className="menu-dropdown">
                        <div 
                          className="menu-item edit" 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/mylists/edit/${list.id}`);
                          }}
                        >
                          <Pencil size={16} />
                          <span>แก้ไข</span>
                        </div>

                        <div 
                          className="menu-item delete" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(list.id);
                          }}
                        >
                          <Trash2 size={16} />
                          <span>ลบรายการ</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="card-body">
                    <h3 className="card-title">{list.name}</h3>
                    <p className="card-count">{list.totalItems} รายการ</p>
                  </div>
                  <div className="card-footer">
                    {/* ✅ แก้ไขตรงนี้: เปลี่ยน Link ไปหน้า Compare (MyLists3) */}
                    <button 
                      className="btn-open" 
                      onClick={() => navigate(`/mylists/compare/${list.id}`)}
                    >
                      เปิด
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>ยังไม่มีรายการสินค้า</p>
              <Link to="/mylists/create" className="link-create">สร้างรายการใหม่ +</Link>
            </div>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-box fade-in">
            <h3 className="modal-title-small">ยืนยันการลบ?</h3>
            <p className="modal-desc-small">รายการนี้จะหายไปถาวร</p>
            
            <div className="modal-actions-small">
              <button 
                className="btn-small cancel" 
                onClick={() => setShowDeleteModal(false)}
              >
                ยกเลิก
              </button>
              <button 
                className="btn-small confirm" 
                onClick={confirmDelete}
              >
                ลบเลย
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MyLists;