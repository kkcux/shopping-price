import React, { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react"; // อย่าลืม icon นี้
import Navbar from "../Home/Navbar";
import Footer from "../Home/Footer";
import "./mylists2.css";

const REGISTER_URL = {
  TOPS: "https://www.tops.co.th/th/register",
  MAKRO: "https://www.makro.pro/",
  LOTUS: "https://www.lotuss.com/th/register",
  BIGC: "https://www.bigc.co.th/register",
};

export default function MyLists2() {
  const navigate = useNavigate();
  const { id } = useParams();

  // 1. Init Data
  const [initialData] = useState(() => {
    const savedLists = JSON.parse(localStorage.getItem("myLists")) || [];
    return savedLists.find((list) => String(list.id) === String(id));
  });

  const [listName] = useState(initialData ? initialData.name : "ไม่พบรายการ");
  const [wanted] = useState(initialData ? initialData.items : []);

  // 2. Mock Catalog & Stores
  const catalog = useMemo(() => [
    { id: "p1", name: "KITO รองเท้าแตะสวมบุรุษ ดำ ไซส์ 42", img: "https://o2o-static.lotuss.com/products/73889/51838953.jpg" },
    { id: "p2", name: "CANIA รองเท้าแตะบุรุษ สีน้ำตาล ไซส์ 44", img: "https://o2o-static.lotuss.com/products/73889/50845992.jpg" },
    { id: "p3", name: "CLICK รองเท้าCLOGชาย เขียว ไซส์ 44", img: "https://o2o-static.lotuss.com/products/73889/52358592.jpg" },
    { id: "p4", name: "MESTYLE DISNEY เสื้อเชิ้ตริ้วมิคกี้ สีเหลือง ไซซ์ F", img: "https://o2o-static.lotuss.com/products/73889/75640245.jpg" },
    { id: "p5", name: "BREAKER รองเท้าผ้าใบ BK4P/L สีดำ ไซซ์ 44", img: "https://o2o-static.lotuss.com/products/73889/51635718.jpg" },
  ], []);

  const stores = useMemo(() => [
    { key: "TOPS", label: "TOPS" },
    { key: "LOTUS", label: "LOTUS’s" },
    { key: "BIGC", label: "BIG C" },
    { key: "MAKRO", label: "MAKRO" },
  ], []);

  const membership = useMemo(() => ({
    TOPS: { isMember: false, brand: "tops" },
    MAKRO: { isMember: false, brand: "makro" },
    LOTUS: { isMember: false, brand: "lotus" },
    BIGC: { isMember: false, brand: "bigc" },
  }), []);

  const [selectedStores, setSelectedStores] = useState({
    ALL: true, TOPS: false, LOTUS: false, BIGC: false, MAKRO: false,
  });

  const toggleAll = () => {
    const next = !selectedStores.ALL;
    setSelectedStores({ ALL: next, TOPS: next, LOTUS: next, BIGC: next, MAKRO: next });
  };

  const toggleStore = (k) => {
    const next = { ...selectedStores, [k]: !selectedStores[k], ALL: false };
    if (next.TOPS && next.LOTUS && next.BIGC && next.MAKRO) next.ALL = true;
    setSelectedStores(next);
  };

  return (
    <>
      <Navbar />

      <main className="ml2-page">
        {/* ✅ ส่วน Header แยกออกมาอยู่ข้างบน (Full Width) */}
        <section className="ml2-header-section">
          <div className="ml2-header-inner">
            <div className="ml2-topLeft">
              <button className="ml2-back" aria-label="back" onClick={() => navigate('/mylists')}>
                <ChevronLeft size={24} strokeWidth={2.5} />
              </button>
              <div>
                <div className="ml2-title">MYLISTS</div>
                <div className="ml2-subtitle">เพิ่มสินค้าลงในรายการของคุณและเราจะค้นหาราคาที่ถูกที่สุดจากทุกร้านค้า</div>
              </div>
            </div>
            
            {/* ปุ่ม Edit */}
            <button className="ml2-edit" onClick={() => navigate(`/mylists/${id}/edit`)}>
              EDITLIST
            </button>
          </div>
        </section>

        {/* ✅ ส่วนเนื้อหาด้านล่าง (Container Center) */}
        <div className="ml2-container">
          
          {/* Name Block */}
          <div className="ml2-nameBlock">
            <div className="ml2-label">ชื่อรายการ</div>
            <input className="ml2-input" value={listName} readOnly />
          </div>

          {/* Catalog */}
          <section className="ml2-box">
            <div className="ml2-boxHead">
              <div className="ml2-boxTitle">เลือกรายการสินค้าเพิ่มเติม</div>
              <span className="ml2-pill">ดูทั้งหมด</span>
            </div>
            <div className="ml2-cards">
              {catalog.map((p) => (
                <ProductCard key={p.id} name={p.name} img={p.img} />
              ))}
            </div>
          </section>

          {/* Wanted Items */}
          <section className="ml2-box">
            <div className="ml2-boxHead">
              <div className="ml2-boxTitle">รายการสินค้าที่ต้องการ ({wanted.length})</div>
            </div>
            {wanted.length > 0 ? (
              <div className="ml2-cards">
                {wanted.map((p, index) => (
                  <ProductCard key={`${p.id}-${index}`} name={p.name} img={p.img} sub={`จำนวน ${p.qty} ชิ้น`} />
                ))}
              </div>
            ) : (
              <div style={{ padding: '20px', color: '#999', textAlign: 'center' }}>ยังไม่มีสินค้าในรายการ</div>
            )}
          </section>

          {/* Bottom Grid */}
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
              <div className="ml2-membersHead">
                <div className="ml2-boxTitleLg">สถานะสมาชิก</div>
                <span className="ml2-info">i</span>
              </div>
              <MemberRow brand="tops" title="TOPS" isMember={membership.TOPS.isMember} />
              <MemberRow brand="makro" title="MAKRO" isMember={membership.MAKRO.isMember} />
              <MemberRow brand="lotus" title="LOTUS’s" isMember={membership.LOTUS.isMember} />
              <MemberRow brand="bigc" title="BIG C" isMember={membership.BIGC.isMember} />
            </section>
          </div>

          <div className="ml2-searchWrap">
            <button className="ml2-searchBtn" onClick={() => navigate("/mylists/mylists3")}>
              <span className="ml2-searchIcon">🔍</span>
              เริ่มค้นหาร้านที่ถูกที่สุด
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

// Sub-components (เหมือนเดิม)
function ProductCard({ name, img, sub }) {
  return (
    <div className="ml2-card">
      <div className="ml2-imgWrap">{img ? <img src={img} alt={name} /> : <div className="ml2-imgPh" />}</div>
      <div className="ml2-cardName">{name}</div>
      {sub ? <div className="ml2-cardSub">{sub}</div> : <div className="ml2-cardSubSpacer" />}
    </div>
  );
}

function MemberRow({ brand, title, isMember }) {
  return (
    <div className={`ml2-memberRow ${isMember ? "ok" : "no"}`}>
      <div className={`ml2-brand ${brand}`}>{brand === "tops" ? "Tops" : title}</div>
      <div className="ml2-memberText">{title} {isMember ? "เป็นสมาชิก" : "ไม่เป็นสมาชิก"}</div>
      {!isMember && (
        <a href={REGISTER_URL[brand.toUpperCase()]} target="_blank" rel="noopener noreferrer" className="ml2-join">สมัคร</a>
      )}
    </div>
  );
}