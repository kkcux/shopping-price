import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

import Navbar from "../Home/Navbar";
import Footer from "../Home/Footer";
import "./myLists3.css";

/* ================= helpers ================= */

const toNumber = (v) => {
  if (v == null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const s = String(v).replace(/[^\d.]/g, "");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
};

const cleanName = (name) =>
  String(name || "")
    .toLowerCase()
    .replace(/\b[xX]\s*\d+\b/g, "")
    .replace(/\b\d+(\.\d+)?\b/g, "")
    .replace(/มล\.?|ล\.?|ml|liter|ลิตร|กรัม|g|kg/gi, "")
    .replace(/[^\u0E00-\u0E7Fa-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenize = (name) =>
  cleanName(name).split(" ").filter((w) => w.length >= 2);

const matchProduct = (targetName, candidates) => {
  const baseTokens = tokenize(targetName);
  if (baseTokens.length === 0) return null;

  let best = null;
  let bestScore = 0;

  for (const p of candidates) {
    const candText = cleanName(p.name);
    const score = baseTokens.filter((t) => candText.includes(t)).length;
    if (score > bestScore) {
      bestScore = score;
      best = p;
    }
  }

  return bestScore >= 1 ? best : null;
};

const normalizeRetailer = (v) => {
  const s = String(v || "").toLowerCase().replace(/\s+/g, "");
  if (!s) return "";

  if (s.includes("lotus") || s.includes("โลตัส")) return "LOTUS";
  if (s.includes("big")) return "BIGC";
  if (s.includes("makro") || s.includes("แม็คโคร")) return "MAKRO";

  return "";
};

const pickFirst = (obj, keys) => {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return null;
};

const normalizeRow = (row) => {
  const retailerRaw = pickFirst(row, [
    "retailer",
    "store",
    "shop",
    "source",
    "merchant",
    "platform",
  ]);
  const retailer = normalizeRetailer(retailerRaw);

  const name = pickFirst(row, [
    "name",
    "title",
    "product_name",
    "productName",
    "product_title",
  ]);
  const price = pickFirst(row, [
    "price",
    "sale_price",
    "final_price",
    "current_price",
    "min_price",
    "discount_price",
  ]);
  const image = pickFirst(row, [
    "image",
    "img",
    "image_url",
    "imageUrl",
    "thumbnail",
    "thumb",
  ]);

  return {
    retailer,
    name: name ? String(name) : "",
    price: toNumber(price),
    image: image ? String(image) : "",
  };
};

/* ================= component ================= */

export default function MyLists3() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===== load jsonl ===== */
  useEffect(() => {
    let mounted = true;

    fetch("/data/all_retailers_products_merged_v1.jsonl")
      .then((res) => res.text())
      .then((text) => {
        const lines = text.split(/\r?\n/).filter(Boolean);
        const normalized = [];

        for (const line of lines) {
          try {
            const row = JSON.parse(line);
            const n = normalizeRow(row);
            if (n.retailer && n.name) normalized.push(n);
          } catch {}
        }

        if (!mounted) return;
        setAllProducts(normalized);
        setLoading(false);

        const retailers = [...new Set(normalized.map((x) => x.retailer))];
        console.log("Retailers in jsonl:", retailers);
      })
      .catch(() => setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  /* ===== split by retailer ===== */
  const lotusList = useMemo(
    () => allProducts.filter((p) => p.retailer === "LOTUS"),
    [allProducts]
  );
  const bigcList = useMemo(
    () => allProducts.filter((p) => p.retailer === "BIGC"),
    [allProducts]
  );
  const makroList = useMemo(
    () => allProducts.filter((p) => p.retailer === "MAKRO"),
    [allProducts]
  );

  /* ===== selected list ===== */
  const selectedList = useMemo(() => {
    const all = JSON.parse(localStorage.getItem("myLists")) || [];
    return all.find((l) => String(l.id) === String(id)) || null;
  }, [id]);

  const wanted = selectedList?.items || [];
  const listName = selectedList?.name || "ไม่พบรายการ";

  /* ===== compare rows ===== */
  const rows = useMemo(() => {
    return wanted.map((w) => {
      const l = matchProduct(w.name, lotusList);
      const b = matchProduct(w.name, bigcList);
      const m = matchProduct(w.name, makroList);

      const priceMap = {
        LOTUS: l?.price ?? null,
        BIGC: b?.price ?? null,
        MAKRO: m?.price ?? null,
      };

      const valid = Object.values(priceMap).filter(
        (v) => typeof v === "number"
      );
      const minVal = valid.length ? Math.min(...valid) : null;

      return {
        name: w.name,
        image: l?.image || b?.image || m?.image || w?.img || "",
        priceMap,
        minVal,
      };
    });
  }, [wanted, lotusList, bigcList, makroList]);

  const totals = useMemo(() => {
    const sum = (k) =>
      rows.reduce((acc, r) => acc + (r.priceMap[k] || 0), 0);
    return {
      LOTUS: sum("LOTUS"),
      BIGC: sum("BIGC"),
      MAKRO: sum("MAKRO"),
    };
  }, [rows]);

  /* ===== แนะนำร้านค้า ===== */
  const recommendShops = [
    {
      key: "BIGC",
      name: "BIG C",
      distance: "2.5 km",
      memberPrice: totals.BIGC,
      nonMemberPrice: totals.BIGC
        ? Math.round(totals.BIGC * 1.05)
        : null,
      url: "https://www.bigc.co.th",
    },
    {
      key: "LOTUS",
      name: "LOTUS’s",
      distance: "2.8 km",
      memberPrice: totals.LOTUS,
      nonMemberPrice: totals.LOTUS
        ? Math.round(totals.LOTUS * 1.05)
        : null,
      url: "https://www.lotuss.com",
    },
    {
      key: "MAKRO",
      name: "MAKRO",
      distance: "3.7 km",
      memberPrice: totals.MAKRO,
      nonMemberPrice: totals.MAKRO
        ? Math.round(totals.MAKRO * 1.05)
        : null,
      url: "https://www.makro.pro",
    },
  ].filter((s) => typeof s.memberPrice === "number");

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ padding: 40, textAlign: "center" }}>
          กำลังโหลดข้อมูลราคา...
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="ml3-page">
        <section className="ml3-header-section">
          <div className="ml3-header-inner">
            <div className="ml3-topLeft">
              <button className="ml3-back" onClick={() => navigate(-1)}>
                <ChevronLeft size={28} strokeWidth={2.5} />
              </button>
              <div className="ml3-titlewrap">
                <h1 className="ml3-title">{listName}</h1>
                <p className="ml3-subtitle">
                  เปรียบเทียบราคาสินค้าจากหลายร้าน
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="ml3-container">
          {/* ===== ตารางเปรียบเทียบราคา ===== */}
          <section className="ml3-block">
            <div className="ml3-block-head">การเปรียบเทียบราคา</div>

            <div className="ml3-table">
              <div className="ml3-thead">
                <div className="ml3-th left">สินค้า</div>
                <div className="ml3-th">LOTUS</div>
                <div className="ml3-th">BIGC</div>
                <div className="ml3-th">MAKRO</div>
              </div>

              {rows.map((it, idx) => (
                <div className="ml3-tr" key={idx}>
                  <div className="ml3-td left">
                    <img
                      className="ml3-prodimg"
                      src={it.image}
                      alt=""
                    />
                    <div className="ml3-prodmeta">
                      <div className="ml3-prodname">{it.name}</div>
                    </div>
                  </div>

                  {["LOTUS", "BIGC", "MAKRO"].map((k) => {
                    const val = it.priceMap[k];
                    const isMin =
                      typeof val === "number" && it.minVal === val;
                    return (
                      <div className="ml3-td" key={k}>
                        <span
                          className={`ml3-pill ${
                            isMin ? "best" : ""
                          }`}
                        >
                          {typeof val === "number" ? val : "-"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}

              <div className="ml3-tr total">
                <div className="ml3-td left total-label">รวม</div>
                {["LOTUS", "BIGC", "MAKRO"].map((k) => (
                  <div className="ml3-td" key={k}>
                    <span className="ml3-pill">
                      {totals[k] > 0 ? Math.round(totals[k]) : "-"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ===== แนะนำร้านค้า ===== */}
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

              {recommendShops.map((s, idx) => (
                <div className="ml3-shop-row" key={s.key}>
                  <div className="ml3-shop-brand">
                    {idx === 0 && (
                      <span className="ml3-best">ราคาถูกที่สุด</span>
                    )}
                    {s.name}
                  </div>

                  <div className="ml3-shop-muted">{s.distance}</div>

                  <div className="ml3-shop-price">
                    ฿{Math.round(s.memberPrice)}
                  </div>

                  <div className="ml3-shop-price">
                    {s.nonMemberPrice
                      ? `฿${s.nonMemberPrice}`
                      : "-"}
                  </div>

                  <div>
                    <button
                      className="ml3-go"
                      onClick={() =>
                        window.open(s.url, "_blank")
                      }
                    >
                      ไปยังร้านค้า
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
