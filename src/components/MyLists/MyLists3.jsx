import { useMemo } from "react";
import { useNavigate } from "react-router-dom"; // ✅ 1. เพิ่ม import useNavigate

import Navbar from "../Home/Navbar";
import Footer from "../Home/Footer";
import "./MyLists3.css";

// ===== ข้อมูลจริง =====
import lotusData from "../../data/lotus/lotus_adult-care_full.json";
import makroData from "../../data/makro/makro_beverages.json";

/* ================= helpers ================= */

// แปลงราคาเป็น number
const toNumber = (v) => {
  if (v == null) return null;
  if (typeof v === "number") return v;
  const s = String(v).replace(/[^\d.]/g, "");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
};

// clean ชื่อสินค้า
const cleanName = (name) => {
  return String(name || "")
    .toLowerCase()
    .replace(/\b[xX]\s*\d+\b/g, "")
    .replace(/\b\d+(\.\d+)?\b/g, "")
    .replace(/มล\.?|ล\.?|ml|liter|ลิตร|กรัม|g|kg/gi, "")
    .replace(/เครื่องดื่มน้ำอัดลม|เครื่องดื่ม|น้ำอัดลม/gi, "")
    .replace(/[^\u0E00-\u0E7Fa-z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

// แยกชื่อเป็น token
const tokenize = (name) => {
  return cleanName(name)
    .split(" ")
    .filter((w) => w.length >= 2);
};

// match สินค้า
const matchProduct = (targetName, candidates) => {
  const baseTokens = tokenize(targetName);
  if (baseTokens.length === 0) return null;

  let bestMatch = null;
  let bestScore = 0;

  for (const c of candidates) {
    const tokens = tokenize(c.name);
    const overlap = baseTokens.filter((t) =>
      tokens.includes(t)
    ).length;

    if (overlap > bestScore) {
      bestScore = overlap;
      bestMatch = c;
    }
  }

  return bestScore >= 1 ? bestMatch : null;
};

const pickBaseItems = (arr, count = 5) => {
  const list = Array.isArray(arr) ? arr : [];
  return list.slice(0, count);
};

/* ================= component ================= */

export default function MyLists3() {
  const navigate = useNavigate(); // ✅ 2. ประกาศตัวแปร navigate

  const lotusList = useMemo(
    () => (Array.isArray(lotusData) ? lotusData : []),
    []
  );
  const makroList = useMemo(
    () => (Array.isArray(makroData) ? makroData : []),
    []
  );

  /* ===== สร้างแถวสินค้า ===== */
  const items = useMemo(() => {
    const base = pickBaseItems(lotusList, 5);

    return base.map((l) => {
      const m = matchProduct(l.name, makroList);

      const lotusPrice = toNumber(l.price);
      const makroPrice = toNumber(m?.price);

      const priceMap = {
        LOTUS: lotusPrice,
        BIGC: null, // ไม่มีข้อมูล
        MAKRO: makroPrice,
      };

      const validPrices = Object.values(priceMap).filter(
        (v) => typeof v === "number"
      );

      const minVal = validPrices.length
        ? Math.min(...validPrices)
        : null;

      return {
        image: l.image,
        name: cleanName(l.name),
        priceMap,
        minVal,
      };
    });
  }, [lotusList, makroList]);

  /* ===== รวมราคา ===== */
  const totals = useMemo(() => {
    const sum = (key) =>
      items.reduce(
        (acc, it) => acc + (toNumber(it.priceMap[key]) || 0),
        0
      );

    return {
      nonMember: {
        LOTUS: sum("LOTUS"),
        BIGC: null,
        MAKRO: sum("MAKRO"),
      },
      member: {
        LOTUS: Math.max(0, sum("LOTUS") - 10), // สมมติลด 10 บาท
        BIGC: null,
        MAKRO: sum("MAKRO"),
      },
    };
  }, [items]);

  /* ===== ร้านแนะนำ ===== */
  const shops = useMemo(
    () => [
      {
        key: "BIGC",
        brand: "BIG C",
        distance: "2.5 km",
        member: null,
        nonMember: null,
        actionText: "ไปยังร้านค้า",
      },
      {
        key: "LOTUS",
        brand: "LOTUS's",
        distance: "2.8 km",
        member: totals.member.LOTUS,
        nonMember: totals.nonMember.LOTUS,
        actionText: "ไปยังร้านค้า",
      },
      {
        key: "MAKRO",
        brand: "MAKRO",
        distance: "3.7 km",
        member: totals.member.MAKRO,
        nonMember: totals.nonMember.MAKRO,
        actionText: "ไปยังร้านค้า",
      },
    ],
    [totals]
  );

  return (
    <>
      <Navbar />

      <main className="ml3-page">
        {/* ===== TOP BAR ===== */}
        <section className="ml3-topbar">
          <div className="ml3-topbar-inner">
            
            {/* ✅ 3. เพิ่ม onClick ให้กดแล้วย้อนกลับ (-1 คือย้อนไปหน้าก่อนหน้า) */}
            <button className="ml3-back" onClick={() => navigate(-1)}>
              ‹
            </button>

            <div className="ml3-titlewrap">
              <h1 className="ml3-title">ของใช้รายสัปดาห์</h1>
              <p className="ml3-subtitle">
                เปรียบเทียบราคาสินค้าจากหลายร้าน
              </p>
            </div>
          </div>
        </section>

        {/* ... (ส่วนอื่นๆ เหมือนเดิม) ... */}

        {/* ===== SUMMARY ===== */}
        <section className="ml3-mini">
          <div className="ml3-mini-card">
            <div className="ml3-mini-ico blue">🧾</div>
            <div>
              <div className="ml3-mini-top">จำนวนสินค้า</div>
              <div className="ml3-mini-bottom">{items.length} รายการ</div>
            </div>
          </div>

          <div className="ml3-mini-card">
            <div className="ml3-mini-ico green">🏬</div>
            <div>
              <div className="ml3-mini-top">ร้านค้า</div>
              <div className="ml3-mini-bottom">3 ร้าน</div>
            </div>
          </div>
        </section>

        {/* ===== TABLE ===== */}
        <section className="ml3-block">
          <div className="ml3-block-head">การเปรียบเทียบราคา</div>

          <div className="ml3-table">
            <div className="ml3-thead">
              <div className="ml3-th left">สินค้า</div>
              <div className="ml3-th">LOTUS's</div>
              <div className="ml3-th">BIG C</div>
              <div className="ml3-th">MAKRO</div>
            </div>

            {items.map((it, idx) => (
              <div className="ml3-tr" key={idx}>
                <div className="ml3-td left">
                  <img className="ml3-prodimg" src={it.image} alt="" />
                  <div className="ml3-prodmeta">
                    <div className="ml3-prodname">{it.name}</div>
                    <div className="ml3-prodqty">{it.qtyText}</div>
                  </div>
                </div>

                {["LOTUS", "BIGC", "MAKRO"].map((k) => {
                  const val = it.priceMap[k];
                  const isMin =
                    typeof val === "number" && it.minVal === val;

                  return (
                    <div className="ml3-td" key={k}>
                      <span className={`ml3-pill ${isMin ? "best" : ""}`}>
                        {typeof val === "number" ? val : "-"}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* ===== TOTALS ===== */}
            <div className="ml3-tr total">
              <div className="ml3-td left total-label">
                รวมราคาทั้งหมด ( ไม่เป็นสมาชิก )
              </div>
              {["LOTUS", "BIGC", "MAKRO"].map((k) => (
                <div className="ml3-td" key={k}>
                  <span className="ml3-pill">
                    {typeof totals.nonMember[k] === "number"
                      ? Math.round(totals.nonMember[k])
                      : "-"}
                  </span>
                </div>
              ))}
            </div>

            <div className="ml3-tr total">
              <div className="ml3-td left total-label">
                รวมราคาทั้งหมด ( เป็นสมาชิก )
              </div>
              {["LOTUS", "BIGC", "MAKRO"].map((k) => (
                <div className="ml3-td" key={k}>
                  <span
                    className={`ml3-pill ${
                      k === "LOTUS" ? "best" : ""
                    }`}
                  >
                    {typeof totals.member[k] === "number"
                      ? Math.round(totals.member[k])
                      : "-"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== SHOPS ===== */}
        <section className="ml3-block">
          <div className="ml3-block-head">แนะนำร้านค้า</div>

          <div className="ml3-shop-table">
            <div className="ml3-shop-head">
              <div>ร้านค้า</div>
              <div>ระยะทาง</div>
              <div>เป็นสมาชิก</div>
              <div>ไม่เป็นสมาชิก</div>
              <div></div>
            </div>

            {shops.map((s) => (
              <div className="ml3-shop-row" key={s.key}>
                <div className="ml3-shop-brand">{s.brand}</div>
                <div className="ml3-shop-muted">{s.distance}</div>
                <div className="ml3-shop-price">
                  {typeof s.member === "number"
                    ? Math.round(s.member)
                    : "-"}
                </div>
                <div className="ml3-shop-price">
                  {typeof s.nonMember === "number"
                    ? Math.round(s.nonMember)
                    : "-"}
                </div>
                <div className="ml3-shop-action">
                  <button className="ml3-go">
                    {s.actionText} ›
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== SAVE ===== */}
        <section className="ml3-save">
          <button className="ml3-savebtn">
            <span className="ml3-saveicon">🔖</span>
            บันทึกรายการ
          </button>
        </section>
      </main>

      <Footer />
    </>
  );
}