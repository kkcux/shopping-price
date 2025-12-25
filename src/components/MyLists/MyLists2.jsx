import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import Navbar from "../Home/Navbar";
import Footer from "../Home/Footer";
import "./mylists2.css";

const REGISTER_URL = {
  MAKRO: "https://www.makro.pro/",
  LOTUS: "https://www.lotuss.com/th/register",
  BIGC: "https://www.bigc.co.th/register",
};

export default function MyLists2() {
  const navigate = useNavigate();
  const { id } = useParams();

  /* ===== LOAD FROM LOCAL STORAGE ===== */
  const allLists = useMemo(
    () => JSON.parse(localStorage.getItem("myLists")) || [],
    []
  );

  const initialData = useMemo(
    () => allLists.find((l) => String(l.id) === String(id)),
    [allLists, id]
  );

  const listName = initialData?.name || "ไม่พบรายการ";
  const wanted = initialData?.items || [];

  /* ===== STORES (ไม่มี TOPS) ===== */
  const stores = [
    { key: "LOTUS", label: "LOTUS’s" },
    { key: "BIGC", label: "BIG C" },
    { key: "MAKRO", label: "MAKRO" },
  ];

  const membership = {
    LOTUS: false,
    BIGC: false,
    MAKRO: false,
  };

  const [selectedStores, setSelectedStores] = useState({
    ALL: true,
    LOTUS: false,
    BIGC: false,
    MAKRO: false,
  });

  const toggleAll = () => {
    const v = !selectedStores.ALL;
    setSelectedStores({
      ALL: v,
      LOTUS: v,
      BIGC: v,
      MAKRO: v,
    });
  };

  const toggleStore = (k) => {
    const next = { ...selectedStores, [k]: !selectedStores[k], ALL: false };
    if (next.LOTUS && next.BIGC && next.MAKRO) next.ALL = true;
    setSelectedStores(next);
  };

  return (
    <>
      <Navbar />

      <main className="ml2-page">
        {/* HEADER */}
        <section className="ml2-header-section">
          <div className="ml2-header-inner">
            <div className="ml2-topLeft">
              <button className="ml2-back" onClick={() => navigate("/mylists")}>
                <ChevronLeft size={24} strokeWidth={2.5} />
              </button>
              <div>
                <div className="ml2-title">MYLISTS</div>
                <div className="ml2-subtitle">
                  เพิ่มสินค้าในรายการของคุณและเราจะค้นหาราคาที่ถูกที่สุดจากทุกร้านค้า
                </div>
              </div>
            </div>

            <button
              className="ml2-edit"
              onClick={() => navigate(`/mylists/${id}/edit`)}
            >
              EDITLIST
            </button>
          </div>
        </section>

        <div className="ml2-container">
          {/* NAME */}
          <div className="ml2-nameBlock">
            <div className="ml2-label">ชื่อรายการ</div>
            <input className="ml2-input" value={listName} readOnly />
          </div>

          {/* WANTED ITEMS */}
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
              <div className="ml2-empty">ยังไม่มีสินค้าในรายการ</div>
            )}
          </section>

          {/* STORES + MEMBERS */}
          <div className="ml2-bottomGrid">
            <section className="ml2-box ml2-boxTall">
              <div className="ml2-boxTitleLg">
                เลือกร้านค้าที่ต้องการเปรียบเทียบ
              </div>

              <div className="ml2-checkRow" onClick={toggleAll}>
                <span className={`ml2-check ${selectedStores.ALL ? "on" : ""}`} />
                ทั้งหมด
              </div>

              {stores.map((s) => (
                <div
                  key={s.key}
                  className="ml2-checkRow"
                  onClick={() => toggleStore(s.key)}
                >
                  <span
                    className={`ml2-check ${
                      selectedStores[s.key] ? "on" : ""
                    }`}
                  />
                  {s.label}
                </div>
              ))}
            </section>

            <section className="ml2-box ml2-boxTall">
              <div className="ml2-boxTitleLg">สถานะสมาชิก</div>

              {stores.map((s) => (
                <MemberRow
                  key={s.key}
                  brand={s.key}
                  isMember={membership[s.key]}
                />
              ))}
            </section>
          </div>

          <div className="ml2-searchWrap">
            <button
              className="ml2-searchBtn"
              onClick={() => navigate("/mylists/mylists3")}
            >
              🔍 เริ่มค้นหาร้านที่ถูกที่สุด
            </button>
          </div>
        </div>
      </main>

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
    <div className={`ml2-memberRow ${isMember ? "ok" : "no"}`}>
      <div className="ml2-memberText">
        {brand} {isMember ? "เป็นสมาชิก" : "ไม่เป็นสมาชิก"}
      </div>
      {!isMember && (
        <a
          href={REGISTER_URL[brand]}
          target="_blank"
          rel="noopener noreferrer"
          className="ml2-join"
        >
          สมัคร
        </a>
      )}
    </div>
  );
}
