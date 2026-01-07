import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Plus, 
  Minus,
  Save
} from "lucide-react"; // ✅ นำเข้าไอคอนที่ต้องใช้
import Navbar from "../Home/Navbar";
import Footer from "../Home/Footer";
import "./ListsEdit.css";

export default function ListsEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [listName, setListName] = useState("");
  const [items, setItems] = useState([]); // รายการสินค้าในลิสต์ (Selected)
  const [showModal, setShowModal] = useState(false);

  // ✅ 1. เพิ่ม State สำหรับ Catalog สินค้าแนะนำ
  const [catalog, setCatalog] = useState([
    { id: "c1", name: "อินโนวีเนส อาหารทางการแพทย์ 300ก.", img: "https://o2o-static.lotuss.com/products/105727/51921065.jpg", qty: 1 },
    { id: "c2", name: "อันอัน แผ่นรองซึมซับ ไซส์ XXL 10 ชิ้น", img: "https://o2o-static.lotuss.com/products/105727/75583866.jpg", qty: 1 },
    { id: "c3", name: "เนสท์เล่ บู๊สท์ ออฟติมัม 800 กรัม", img: "https://o2o-static.lotuss.com/products/105727/75009552.jpg", qty: 1 },
    { id: "c4", name: "ฟีลฟรีแผ่นรองซึมซับใหญ่พิเศษXXL 8 ชิ้น", img: "https://o2o-static.lotuss.com/products/105727/51165406.jpg", qty: 1 },
    { id: "c5", name: "ซอฟเท็กซ์ แผ่นรองซับ ขนาดใหญ่ 10 ชิ้น", img: "https://o2o-static.lotuss.com/products/105727/791156.jpg", qty: 1 },
  ]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const savedLists = JSON.parse(localStorage.getItem("myLists")) || [];
    const found = savedLists.find((l) => String(l.id) === String(id));
    if (found) {
      setListName(found.name);
      setItems(found.items || []);
    } else {
      navigate("/mylists");
    }
  }, [id, navigate]);

  // ===== Handlers สำหรับรายการที่เลือกแล้ว (In List) =====
  const updateQty = (index, delta) => {
    setItems((prev) => {
      const next = [...prev];
      next[index].qty = Math.max(1, next[index].qty + delta);
      return next;
    });
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // ===== Handlers สำหรับ Catalog (เลือกเพิ่มสินค้า) =====
  const increaseCatalogQty = (id) => {
    setCatalog((prev) => prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)));
  };

  const decreaseCatalogQty = (id) => {
    setCatalog((prev) => prev.map((i) => (i.id === id && i.qty > 1 ? { ...i, qty: i.qty - 1 } : i)));
  };

  const handleSelectFromCatalog = (product) => {
    const existingIndex = items.findIndex((item) => item.name === product.name); 
    
    if (existingIndex !== -1) {
      setItems((prev) => {
        const next = [...prev];
        next[existingIndex].qty += product.qty;
        return next;
      });
    } else {
      setItems((prev) => [...prev, { ...product }]);
    }
  };

  // ===== Save Logic =====
  const handleSave = () => {
    if (!listName.trim()) {
      alert("กรุณากรอกชื่อรายการ");
      return;
    }
    if (items.length === 0) {
      setShowModal(true);
      return;
    }
    saveAndExit();
  };

  const saveAndExit = () => {
    const savedLists = JSON.parse(localStorage.getItem("myLists")) || [];
    const updatedLists = savedLists.map((l) =>
      String(l.id) === String(id) ? { ...l, name: listName, items: items, totalItems: items.reduce((sum, i) => sum + i.qty, 0) } : l
    );
    localStorage.setItem("myLists", JSON.stringify(updatedLists));
    navigate(`/mylists/${id}`);
  };

  return (
    <>
      <Navbar />

      <main className="le-page">
        {/* Header Section */}
        <section className="le-header-section">
          <div className="le-header-inner">
            <div className="le-topLeft">
              <button className="le-back-btn" onClick={() => navigate(-1)}>
                <ChevronLeft size={28} strokeWidth={2.5} />
              </button>
              <div>
                <h1 className="le-title">EDIT MYLISTS</h1>
                <p className="le-subtitle">แก้ไขรายการสินค้าของคุณ</p>
              </div>
            </div>
          </div>
        </section>

        {/* Content Container */}
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

          {/* ✅ ส่วน Catalog (เพิ่มสินค้า) */}
          <section className="le-box">
            <div className="le-boxHead">
              <div className="le-boxTitle">เลือกรายการสินค้าเพิ่มเติม</div>
              <button className="le-seeAllBtn" onClick={() => navigate('/producs')}>
                ดูสินค้าทั้งหมด <ChevronRight size={20} />
              </button>
            </div>
            <div className="le-cards">
              {catalog.map((p) => (
                <div key={p.id} className="le-card">
                  <div className="le-imgWrap">
                    <img src={p.img} alt={p.name} />
                  </div>
                  <div className="le-cardName">{p.name}</div>
                  <div className="le-qty">
                    <button onClick={() => decreaseCatalogQty(p.id)}>
                      <Minus size={14} strokeWidth={3} />
                    </button>
                    <span>{p.qty}</span>
                    <button onClick={() => increaseCatalogQty(p.id)}>
                      <Plus size={14} strokeWidth={3} />
                    </button>
                  </div>
                  {/* ✅ เปลี่ยนปุ่มเลือกเป็นไอคอน + เพิ่ม */}
                  <button className="le-select" onClick={() => handleSelectFromCatalog(p)}>
                    <Plus size={16} strokeWidth={3} style={{ marginRight: 4 }} /> 
                    เพิ่ม
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* ✅ ส่วนรายการสินค้าที่มีอยู่แล้ว (In List) */}
          <section className="le-box">
            <div className="le-boxHead">
              <div className="le-boxTitle">รายการสินค้าในลิสต์ ({items.length})</div>
            </div>

            {items.length > 0 ? (
              <div className="le-cards">
                {items.map((item, idx) => (
                  <div key={idx} className="le-card">
                    
                    {/* ✅ ปุ่มลบมุมขวาบน (ใช้ไอคอนถังขยะ) */}
                    <button className="le-remove" onClick={() => removeItem(idx)}>
                      <Trash2 size={14} />
                    </button>

                    <div className="le-imgWrap">
                      <img src={item.img} alt={item.name} />
                    </div>
                    <div className="le-cardName">{item.name}</div>
                    
                    {/* ✅ ปุ่มเพิ่มลดจำนวน (ใช้ไอคอน) */}
                    <div className="le-qty">
                      <button onClick={() => updateQty(idx, -1)}>
                        <Minus size={14} strokeWidth={3} />
                      </button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(idx, 1)}>
                        <Plus size={14} strokeWidth={3} />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '40px', color: '#999', textAlign: 'center', width: '100%' }}>
                ไม่มีสินค้าในรายการ
              </div>
            )}
          </section>

          <div className="le-saveWrap">
            <button className="le-saveBtn" onClick={handleSave}>
              <Save size={20} style={{ marginRight: 8 }} />
              บันทึกการแก้ไข
            </button>
          </div>

        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="modal-icon-circle warning">
                <Trash2 size={36} />
              </div>
              <h3 className="modal-title">ไม่มีสินค้าในรายการ</h3>
              <p className="modal-desc">
                คุณต้องการบันทึกรายการว่างเปล่าหรือไม่?
              </p>
              <div className="modal-actions">
                <button className="modal-btn cancel" onClick={() => setShowModal(false)}>
                  ยกเลิก
                </button>
                <button className="modal-btn confirm" onClick={saveAndExit}>
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}