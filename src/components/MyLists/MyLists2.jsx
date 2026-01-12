import React, { useMemo, useState, useEffect, useRef } from "react"; 
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Pencil, Trash2, Search, Check, AlertTriangle } from "lucide-react";
import Navbar from "../Home/Navbar";
import Footer from "../Home/Footer";
import "./mylists2.css";

const STORE_LOGOS = {
  MAKRO: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1weBQ9rq_nOC5CSMa2dFW9Ez5CFXKKy4Q3Q&s",
  LOTUS: "https://upload.wikimedia.org/wikipedia/commons/1/14/Lotus-2021-logo.png",
  BIGC: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Big_C_Logo.svg/500px-Big_C_Logo.svg.png",
};

const REGISTER_URL = {
  MAKRO: "https://www.makro.pro/",
  LOTUS: "https://www.lotuss.com/th/register",
  BIGC: "https://www.bigc.co.th/register",
};

export default function MyLists2() {
  const navigate = useNavigate();
  const { id } = useParams();

  // ไม่จำเป็นต้องใช้ isEditing แล้ว เพราะเราจะไม่ลบอัตโนมัติ
  // const isEditing = useRef(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  /* ===== LOAD FROM LOCAL STORAGE ===== */
  const allLists = useMemo(
    () => JSON.parse(localStorage.getItem("myLists")) || [],
    []
  );

  const initialData = useMemo(
    () => allLists.find((l) => String(l.id) === String(id)),
    [allLists, id]
  );

  const [currentListData] = useState(initialData);
  const listName = currentListData?.name || "ไม่พบรายการ";
  const wanted = currentListData?.items || [];

  /* ===== ❌ ลบส่วน Auto Delete ออก (ตัวต้นเหตุปัญหา) ===== */
  // useEffect(() => {
  //   return () => { ... }
  // }, [id]);

  /* ===== Prevent Accidental Refresh/Close ===== */
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = ''; 
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  /* ===== STORES & LOGIC ===== */
  const stores = [
    { key: "LOTUS", label: "LOTUS’s" },
    { key: "BIGC", label: "BIG C" },
    { key: "MAKRO", label: "MAKRO" },
  ];

  const membership = { LOTUS: true, BIGC: false, MAKRO: false };

  const [selectedStores, setSelectedStores] = useState({
    ALL: true, LOTUS: false, BIGC: false, MAKRO: false,
  });

  const toggleAll = () => {
    const v = !selectedStores.ALL;
    setSelectedStores({ ALL: v, LOTUS: v, BIGC: v, MAKRO: v });
  };

  const toggleStore = (k) => {
    const next = { ...selectedStores, [k]: !selectedStores[k], ALL: false };
    if (next.LOTUS && next.BIGC && next.MAKRO) next.ALL = true;
    setSelectedStores(next);
  };

  /* ===== HANDLERS ===== */
  
  // ✅ ปุ่มแก้ไข: ไปหน้า Edit (ข้อมูลยังอยู่แน่นอน เพราะเราเลิกลบอัตโนมัติแล้ว)
  const handleEditClick = () => {
    // เซ็ต session เผื่อไว้ (Optional)
    sessionStorage.setItem('current_draft_id', id);
    navigate(`/mylists/edit/${id}`); 
  };

  // ✅ ปุ่มค้นหา: ไปหน้า Compare
  const handleGoToCompare = () => {
    navigate(`/mylists/compare/${id}`, { 
      state: { 
        listData: currentListData,
        selectedStores: selectedStores 
      } 
    });
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    const newLists = allLists.filter((l) => String(l.id) !== String(id));
    localStorage.setItem("myLists", JSON.stringify(newLists));
    navigate("/mylists");
  };

  const handleBackClick = () => {
    setShowExitModal(true);
  };

  // ✅ ปุ่ม Exit: ลบข้อมูลตรงนี้แทน (ปลอดภัยกว่า)
  const confirmExit = () => {
    setShowExitModal(false);

    // ลบข้อมูลทิ้งเมื่อ user ยืนยันว่าจะออกจริงๆ
    const newLists = allLists.filter((l) => String(l.id) !== String(id));
    localStorage.setItem("myLists", JSON.stringify(newLists));
    console.log(`User confirmed exit. List ID: ${id} deleted.`);

    navigate("/mylists");
  };

  return (
    <>
      {/* <Navbar /> */}

      <main className="ml2-page">
        <section className="ml2-header-section">
          <div className="ml2-header-inner">
            <div className="ml2-topLeft">
              <button className="ml2-back" onClick={handleBackClick}>
                <ChevronLeft size={24} strokeWidth={2.5} />
              </button>
              <div>
                <div className="ml2-title">MYLISTS</div>
                <div className="ml2-subtitle">
                  เพิ่มสินค้าในรายการของคุณและเราจะค้นหาราคาที่ถูกที่สุดจากทุกร้านค้า
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              
              <button className="ml2-edit" onClick={handleEditClick}>
                <Pencil size={18} strokeWidth={2.5} />
                <span>แก้ไขรายการ</span>
              </button>

              <button className="ml2-btn-delete" onClick={handleDeleteClick} title="ลบรายการ">
                <Trash2 size={20} strokeWidth={2} />
              </button>
            </div>
          </div>
        </section>

        <div className="ml2-container">
          <div className="ml2-nameBlock">
            <div className="ml2-label">ชื่อรายการ</div>
            <input className="ml2-input" value={listName} readOnly />
          </div>

          <section className="ml2-box">
            <div className="ml2-boxHead">
              <div className="ml2-boxTitle">
                รายการสินค้าที่ต้องการ ({wanted.length})
              </div>
            </div>

            {wanted.length > 0 ? (
              <div className="ml2-cards">
                {wanted.map((p, index) => (
                  <ProductCard
                    key={`${p.id}-${index}`}
                    name={p.name}
                    img={p.img}
                    sub={`จำนวน ${p.qty} ชิ้น`}
                  />
                ))}
              </div>
            ) : (
              <div className="ml2-empty" style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                ยังไม่มีสินค้าในรายการ
              </div>
            )}
          </section>

          <div className="ml2-bottomGrid">
            <section className="ml2-box ml2-boxTall">
              <div className="ml2-boxTitleLg">เลือกร้านค้าที่ต้องการเปรียบเทียบ</div>
              <div className="ml2-checkRow" onClick={toggleAll}>
                <span className={`ml2-check ${selectedStores.ALL ? "on" : ""}`} />
                <span className="ml2-checkText">ทั้งหมด</span>
              </div>
              {stores.map((s) => (
                <div key={s.key} className="ml2-checkRow" onClick={() => toggleStore(s.key)}>
                  <span className={`ml2-check ${selectedStores[s.key] ? "on" : ""}`} />
                  <span className="ml2-checkText">{s.label}</span>
                </div>
              ))}
            </section>

            <section className="ml2-box ml2-boxTall">
              <div className="ml2-boxTitleLg">สถานะสมาชิก</div>
              {stores.map((s) => (
                <MemberRow key={s.key} brand={s.key} isMember={membership[s.key]} />
              ))}
            </section>
          </div>

          <div className="ml2-searchWrap">
            <button className="ml2-searchBtn" onClick={handleGoToCompare}>
              <Search size={22} strokeWidth={2.5} />
              เริ่มค้นหาร้านที่ถูกที่สุด
            </button>
          </div>
        </div>
      </main>

      {/* Modal Popup: ยืนยันการออก */}
      {showExitModal && (
        <div className="modal-overlay" onClick={() => setShowExitModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-circle danger">
              <AlertTriangle size={36} strokeWidth={2} />
            </div>

            <h3 className="modal-title">ออกจากหน้านี้?</h3>
            <p className="modal-desc">
              หากคุณออกจากหน้านี้ รายการสินค้าจะถูกลบ <br/>
              คุณต้องการออกใช่หรือไม่?
            </p>

            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setShowExitModal(false)}>
                อยู่ต่อ
              </button>
              <button className="modal-btn delete" onClick={confirmExit}>
                ออก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: ยืนยันการลบ */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-circle danger">
              <Trash2 size={36} strokeWidth={2} />
            </div>
            <h3 className="modal-title">ยืนยันการลบรายการ?</h3>
            <p className="modal-desc">
              คุณต้องการลบรายการ "{listName}" ใช่หรือไม่? <br />
              การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setShowDeleteModal(false)}>
                ยกเลิก
              </button>
              <button className="modal-btn delete" onClick={confirmDelete}>
                ลบรายการ
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

/* ===== SUB COMPONENTS ===== */

function ProductCard({ name, img, sub }) {
  return (
    <div className="ml2-card">
      <div className="ml2-imgWrap">
        <img src={img} alt={name} />
      </div>
      <div className="ml2-cardName">{name}</div>
      <div className="ml2-cardSub">{sub}</div>
    </div>
  );
}

function MemberRow({ brand, isMember }) {
  return (
    <div className={`ml2-memberRow ${isMember ? "ok" : ""}`}>
      <div className={`ml2-brand-logo ${brand.toLowerCase()}`}>
        <img src={STORE_LOGOS[brand]} alt={brand} />
      </div>

      <div className="ml2-memberText">
        {isMember ? "เป็นสมาชิกแล้ว" : "ไม่ได้เป็นสมาชิก"}
      </div>
      {!isMember && (
        <a href={REGISTER_URL[brand]} target="_blank" rel="noopener noreferrer" className="ml2-join">
          สมัคร
        </a>
      )}
      {isMember && (
        <div className="ml2-check-icon">
          <Check size={18} color="#10b77e" />
        </div>
      )}
    </div>
  );
}