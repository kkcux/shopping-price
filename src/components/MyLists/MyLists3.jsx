import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  ChevronLeft,
  Save,
  Pencil,
  Trash2,
  CheckCircle2,
  ShoppingBag,
  Store,
  LogIn,
  Loader2,
  X,
  AlertCircle,
  Navigation, // ✅ เพิ่มไอคอนนำทาง
} from "lucide-react";

import Footer from "../Home/Footer";
import "./mylists3.css";

import { db, auth } from "../../firebase-config";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  collection,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

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

const tokenize = (name) => cleanName(name).split(" ").filter((w) => w.length >= 2);

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
  const name = pickFirst(row, ["name", "title", "product_name", "productName", "product_title"]);
  const price = pickFirst(row, [
    "price",
    "sale_price",
    "final_price",
    "current_price",
    "min_price",
    "discount_price",
  ]);
  const image = pickFirst(row, ["image", "img", "image_url", "imageUrl", "thumbnail", "thumb"]);

  return {
    retailer,
    name: name ? String(name) : "",
    price: toNumber(price),
    image: image ? String(image) : "",
  };
};

/* ===== ✅ distance (Haversine) ===== */
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// รองรับทั้ง {location:{lat,lng}} และ {geometry:{location:{lat,lng}}}
const getPlaceLatLng = (p) => {
  const lat = p?.location?.lat ?? p?.geometry?.location?.lat;
  const lng = p?.location?.lng ?? p?.geometry?.location?.lng;
  if (lat == null || lng == null) return null;
  return { lat: Number(lat), lng: Number(lng) };
};

/* ================= component ================= */

export default function MyLists3() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const [isSaving, setIsSaving] = useState(false);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // ✅ เปลี่ยนจาก useState เป็น useRef เพื่อแก้ปัญหา Alert เด้งซ้ำ
  const processedIncomingRef = useRef(false);

  // ✅ สำหรับคำนวณ “ระยะทางจริง” ของร้านค้าแนะนำ
  const [userLocation, setUserLocation] = useState(null);
  const [branches, setBranches] = useState({ LOTUS: [], BIGC: [], MAKRO: [] });
  const [branchLoading, setBranchLoading] = useState(false);
  const [branchError, setBranchError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

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
      })
      .catch(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

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
  const [selectedList, setSelectedList] = useState(null);

  useEffect(() => {
    const fetchListData = async () => {
      // ลองหาใน Local ก่อน
      const allLocalLists = JSON.parse(localStorage.getItem("myLists")) || [];
      const localList = allLocalLists.find((l) => String(l.id) === String(id));

      if (localList) {
        setSelectedList(localList);
        return;
      }

      // ถ้าไม่เจอ และมี user ลองหาใน Firebase
      if (currentUser) {
        try {
          const docRef = doc(db, "shopping_lists", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setSelectedList({ id: docSnap.id, ...docSnap.data() });
          }
        } catch (error) {
          console.error("Error fetching list:", error);
        }
      }
    };
    fetchListData();
  }, [id, currentUser]);

  // ✅ แก้ไข: ใช้ useRef เช็ค ทำให้ Alert เด้งแค่ครั้งเดียวแน่นอน
  useEffect(() => {
    if (selectedList && location.state?.incomingItem && !processedIncomingRef.current) {
      processedIncomingRef.current = true;

      const newItem = location.state.incomingItem;

      setSelectedList((prev) => {
        const currentItems = prev.items || [];
        const existingIndex = currentItems.findIndex((i) => i.name === newItem.name);
        let updatedItems = [...currentItems];

        if (existingIndex > -1) {
          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            qty: (updatedItems[existingIndex].qty || 1) + (newItem.qty || 1),
          };
          toast.success(`เพิ่มจำนวน ${newItem.name} แล้ว`, { id: "add-item-toast" });
        } else {
          updatedItems.push(newItem);
          toast.success(`เพิ่ม ${newItem.name} ลงในรายการแล้ว`, { id: "add-item-toast" });
        }

        const newTotalItems = updatedItems.reduce((acc, curr) => acc + (curr.qty || 1), 0);

        return {
          ...prev,
          items: updatedItems,
          totalItems: newTotalItems,
        };
      });

      window.history.replaceState({}, document.title);
    }
  }, [selectedList, location.state]);

  /* ===== ✅ ดึงตำแหน่งผู้ใช้ (สำหรับระยะทางร้าน) ===== */
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        console.error("Location error:", err);
        setBranchError("โปรดอนุญาต Location เพื่อคำนวณระยะทาง");
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }, []);

  /* ===== ✅ ดึงสาขาจริงผ่าน /api/places-nearby แล้วคำนวณระยะทาง ===== */
  useEffect(() => {
    if (!userLocation) return;

    const retailerQueries = [
      { key: "LOTUS", q: "Lotus" },
      { key: "BIGC", q: "Big C" },
      { key: "MAKRO", q: "Makro" },
    ];

    const run = async () => {
      setBranchLoading(true);
      setBranchError("");

      try {
        const out = { LOTUS: [], BIGC: [], MAKRO: [] };

        await Promise.all(
          retailerQueries.map(async (r) => {
            const url =
              `/api/places-nearby?lat=${encodeURIComponent(userLocation.lat)}` +
              `&lng=${encodeURIComponent(userLocation.lng)}` +
              `&q=${encodeURIComponent(r.q)}&radius=10000`;

            const res = await fetch(url);
            const data = await res.json();

            if (!res.ok) throw new Error(data?.error || "Places API error");
            if (data.status && data.status !== "OK" && data.status !== "ZERO_RESULTS") {
              throw new Error(`Google status: ${data.status}`);
            }

            const list = (data.results || [])
              .map((p) => {
                const ll = getPlaceLatLng(p);
                if (!ll) return null;
                const d = haversineDistance(userLocation.lat, userLocation.lng, ll.lat, ll.lng);
                return { ...p, distance: d };
              })
              .filter(Boolean)
              .sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999));

            out[r.key] = list;
          })
        );

        setBranches(out);
      } catch (e) {
        setBranchError(String(e?.message || e));
      } finally {
        setBranchLoading(false);
      }
    };

    run();
  }, [userLocation]);

  const wanted = selectedList?.items || [];
  const listName = selectedList?.name || "ไม่พบรายการ";

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
      const valid = Object.values(priceMap).filter((v) => typeof v === "number");
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
    const sum = (k) => rows.reduce((acc, r) => acc + (r.priceMap[k] || 0), 0);
    return {
      LOTUS: sum("LOTUS"),
      BIGC: sum("BIGC"),
      MAKRO: sum("MAKRO"),
    };
  }, [rows]);

  /* ===== ✅ “แก้แค่ระยะทาง” ของร้านค้าแนะนำ ===== */
  const recommendShops = useMemo(() => {
    const fmt = (km) =>
      typeof km === "number" && Number.isFinite(km) ? `${km.toFixed(2)} km` : "-";

    const bigcKm = branches.BIGC?.[0]?.distance;
    const lotusKm = branches.LOTUS?.[0]?.distance;
    const makroKm = branches.MAKRO?.[0]?.distance;

    return [
      {
        key: "BIGC",
        name: "Big C",
        distance: fmt(bigcKm),
        totalPrice: totals.BIGC,
        url: "https://www.bigc.co.th",
      },
      {
        key: "LOTUS",
        name: "Lotus’s",
        distance: fmt(lotusKm),
        totalPrice: totals.LOTUS,
        url: "https://www.lotuss.com",
      },
      {
        key: "MAKRO",
        name: "Makro",
        distance: fmt(makroKm),
        totalPrice: totals.MAKRO,
        url: "https://www.makro.pro",
      },
    ].filter((s) => typeof s.totalPrice === "number" && s.totalPrice > 0);
  }, [branches, totals]);

  /* ===== ✅ ปุ่ม “นำทาง” (เปิด Google Maps) ===== */
  const handleNavigate = (shopKey) => {
    const branch = branches?.[shopKey]?.[0]; // เอาสาขาที่ใกล้สุด
    const ll = getPlaceLatLng(branch);
    if (!ll) {
      toast.error("ไม่พบพิกัดสาขาสำหรับนำทาง");
      return;
    }
    const url = `https://www.google.com/maps/dir/?api=1&destination=${ll.lat},${ll.lng}`;
    window.open(url, "_blank");
  };

  const handleBackClick = () => {
    setShowExitModal(true);
  };

  const handleExitWithoutSave = () => {
    const isNewList = location.state?.isNewList;

    if (isNewList) {
      const allLists = JSON.parse(localStorage.getItem("myLists")) || [];
      const filteredLists = allLists.filter((l) => String(l.id) !== String(id));
      localStorage.setItem("myLists", JSON.stringify(filteredLists));
    }

    setShowExitModal(false);
    navigate("/mylists");
  };

  const handleSaveClick = () => {
    if (!selectedList) {
      toast.error("ไม่พบข้อมูลที่จะบันทึก");
      return;
    }
    setShowModal(true);
  };

  const confirmSave = async () => {
    setShowModal(false);
    setShowExitModal(false);
    setIsSaving(true);

    const toastId = toast.loading("กำลังบันทึกข้อมูล...");

    try {
      if (currentUser) {
        const isLocalId = !isNaN(id);

        if (isLocalId) {
          const newListRef = doc(collection(db, "shopping_lists"));
          await setDoc(newListRef, {
            ...selectedList,
            userId: currentUser.uid,
            updatedAt: serverTimestamp(),
          });
          const allLists = JSON.parse(localStorage.getItem("myLists")) || [];
          const filteredLists = allLists.filter((l) => String(l.id) !== String(id));
          localStorage.setItem("myLists", JSON.stringify(filteredLists));

          toast.dismiss(toastId);
          navigate("/mylists");
        } else {
          const listRef = doc(db, "shopping_lists", id);
          await setDoc(
            listRef,
            {
              ...selectedList,
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );

          toast.dismiss(toastId);
          navigate("/mylists");
        }
      } else {
        const allLists = JSON.parse(localStorage.getItem("myLists")) || [];
        const existingIndex = allLists.findIndex((l) => String(l.id) === String(id));

        let newLists;
        if (existingIndex !== -1) {
          newLists = [...allLists];
          newLists[existingIndex] = selectedList;
        } else {
          newLists = [...allLists, selectedList];
        }
        localStorage.setItem("myLists", JSON.stringify(newLists));

        localStorage.removeItem("pending_save_list");
        sessionStorage.removeItem("current_draft_id");

        toast.dismiss(toastId);
        setIsSaving(false);
        setShowLoginModal(true);
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("บันทึกไม่สำเร็จ: " + error.message, { id: toastId });
      setIsSaving(false);
    }
  };

  const handleLoginRedirect = () => {
    setShowLoginModal(false);
    navigate("/login", { state: { from: location.pathname } });
  };

  const handleCancelLogin = () => {
    const allLists = JSON.parse(localStorage.getItem("myLists")) || [];
    const filteredLists = allLists.filter((l) => String(l.id) !== String(id));
    localStorage.setItem("myLists", JSON.stringify(filteredLists));

    setShowLoginModal(false);
    navigate("/mylists");
  };

  // ❗ คงของคุณไว้ตามเดิม
  const handleEditClick = () => {
    navigate(`/mylists/edit/${id}`);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    const toastId = toast.loading("กำลังลบรายการ...");

    try {
      if (currentUser) {
        await deleteDoc(doc(db, "shopping_lists", id));
      }

      const allLists = JSON.parse(localStorage.getItem("myLists")) || [];
      const filteredLists = allLists.filter((l) => String(l.id) !== String(id));
      localStorage.setItem("myLists", JSON.stringify(filteredLists));

      toast.success("ลบรายการเรียบร้อย", { id: toastId });

      setShowDeleteModal(false);

      setTimeout(() => {
        navigate("/mylists");
      }, 500);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("ลบไม่สำเร็จ: " + error.message, { id: toastId });
    }
  };

  if (loading) {
    return (
      <>
        <div style={{ padding: 80, textAlign: "center", color: "#64748b" }}>
          กำลังโหลดข้อมูลราคา...
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <main className="ml3-page">
        <section className="ml3-header-section">
          <div className="ml3-header-inner">
            <div className="ml3-topLeft">
              <button className="ml3-back" onClick={handleBackClick}>
                <ChevronLeft size={24} strokeWidth={2.5} />
              </button>
              <div className="ml3-titlewrap">
                <h1 className="ml3-title">{listName}</h1>
                <p className="ml3-subtitle">เปรียบเทียบราคาและจัดการรายการสินค้า</p>
              </div>
            </div>
            <div className="ml3-topRight">
              <button className="ml3-btn-edit-pill" onClick={handleEditClick}>
                <Pencil size={16} strokeWidth={2.5} />
                <span>แก้ไข</span>
              </button>
              <button className="ml3-btn-delete-circle" onClick={handleDeleteClick}>
                <Trash2 size={18} strokeWidth={2} />
              </button>
            </div>
          </div>
        </section>

        <div className="ml3-container">
          <section className="ml3-block">
            <div className="ml3-block-head">
              <ShoppingBag size={24} color="#10b77e" />
              <span>การเปรียบเทียบราคา</span>
            </div>

            <div className="ml3-table">
              <div className="ml3-thead">
                <div className="ml3-th left">รายการสินค้า</div>
                <div className="ml3-th">LOTUS'S</div>
                <div className="ml3-th">BIG C</div>
                <div className="ml3-th">MAKRO</div>
              </div>

              {rows.map((it, idx) => (
                <div className="ml3-tr" key={idx}>
                  <div className="ml3-td left">
                    <div className="ml3-img-container">
                      <img
                        className="ml3-prodimg"
                        src={it.image || "https://via.placeholder.com/64?text=No+Img"}
                        alt=""
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/64?text=No+Img";
                        }}
                      />
                    </div>
                    <div className="ml3-prodmeta">
                      <div className="ml3-prodname">{it.name}</div>
                    </div>
                  </div>

                  {["LOTUS", "BIGC", "MAKRO"].map((k) => {
                    const val = it.priceMap[k];
                    const isMin = typeof val === "number" && it.minVal === val;
                    return (
                      <div className="ml3-td" key={k}>
                        <span className={`ml3-pill ${isMin ? "best" : ""}`}>
                          {typeof val === "number" ? (
                            <>
                              ฿{val.toLocaleString()}
                              {isMin && <CheckCircle2 size={14} style={{ marginLeft: 6 }} />}
                            </>
                          ) : (
                            <span style={{ color: "#cbd5e1" }}>-</span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}

              <div className="ml3-tr total">
                <div className="ml3-td left total-label">รวมทั้งหมด</div>
                {["LOTUS", "BIGC", "MAKRO"].map((k) => (
                  <div className="ml3-td" key={k}>
                    <span className="ml3-pill" style={{ fontWeight: 800, color: "#1e293b" }}>
                      {totals[k] > 0 ? `฿${Math.round(totals[k]).toLocaleString()}` : "-"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="ml3-block">
            <div className="ml3-block-head">
              <Store size={24} color="#3b82f6" />
              <span>ร้านค้าแนะนำ</span>
            </div>

            {branchLoading && (
              <div style={{ padding: 8, color: "#64748b" }}>กำลังคำนวณระยะทาง...</div>
            )}
            {branchError && (
              <div style={{ padding: 8, color: "#ef4444" }}>{branchError}</div>
            )}

            <div className="ml3-shop-table">
              <div className="ml3-shop-head">
                <div>ร้านค้า</div>
                <div>ระยะทาง</div>
                <div>ราคารวม</div>
                <div></div>
              </div>

              {recommendShops.map((s) => (
                <div className="ml3-shop-row" key={s.key}>
                  <div className="ml3-shop-brand">{s.name}</div>
                  <div className="ml3-shop-muted" style={{ color: "#64748b" }}>
                    {s.distance}
                  </div>
                  <div className="ml3-shop-price" style={{ color: "#10b77e", fontSize: "1.1rem" }}>
                    ฿{Math.round(s.totalPrice).toLocaleString()}
                  </div>

                  {/* ✅ ปุ่มเหมือนเดิม + เพิ่มปุ่มนำทาง */}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button className="ml3-go" onClick={() => window.open(s.url, "_blank")}>
                      ไปยังร้านค้า
                    </button>

                    <button
                      className="ml3-go"
                      style={{
                        backgroundColor: "#cbd5e1",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                      onClick={() => handleNavigate(s.key)}
                      disabled={!branches?.[s.key]?.[0]}
                      title={!branches?.[s.key]?.[0] ? "ยังไม่พบพิกัดสาขา" : "นำทางไปยังสาขาใกล้ที่สุด"}
                    >
                      <Navigation size={16} />
                      นำทาง
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="ml3-save">
            <button className="ml3-savebtn" onClick={handleSaveClick} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 size={20} className="animate-spin" style={{ marginRight: 8 }} />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Save size={20} strokeWidth={2.5} />
                  บันทึกการเปลี่ยนแปลง
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Exit Modal */}
      {showExitModal && (
        <div className="ml3-modal-overlay" onClick={() => setShowExitModal(false)}>
          <div className="ml3-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              <div
                style={{
                  background: "#fef3c7",
                  padding: 12,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AlertCircle size={28} color="#d97706" />
              </div>
            </div>
            <div className="ml3-modal-title">ต้องการบันทึกก่อนออกหรือไม่?</div>
            <p className="ml3-modal-desc">หากคุณออกโดยไม่บันทึก ข้อมูลล่าสุดอาจสูญหาย</p>
            <div className="ml3-modal-actions" style={{ flexDirection: "column", gap: "8px" }}>
              <button
                className="ml3-btn-confirm"
                onClick={confirmSave}
                style={{ width: "100%", justifyContent: "center" }}
              >
                บันทึกและออก
              </button>
              <button
                className="ml3-btn-cancel"
                onClick={handleExitWithoutSave}
                style={{
                  width: "100%",
                  justifyContent: "center",
                  color: "#ef4444",
                  borderColor: "#fee2e2",
                  backgroundColor: "#fef2f2",
                }}
              >
                ไม่บันทึก (ออกทันที)
              </button>
              <button
                onClick={() => setShowExitModal(false)}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "none",
                  border: "none",
                  color: "#64748b",
                  cursor: "pointer",
                  marginTop: 4,
                }}
              >
                ยกเลิก (อยู่ที่เดิม)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Modal */}
      {showModal && (
        <div className="ml3-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="ml3-modal" onClick={(e) => e.stopPropagation()} style={{ padding: "24px", position: "relative" }}>
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#94a3b8",
              }}
            >
              <X size={24} />
            </button>
            <div className="ml3-modal-title" style={{ marginTop: "10px" }}>
              ยืนยันการบันทึก
            </div>
            <p className="ml3-modal-desc">
              {currentUser
                ? "ต้องการบันทึกข้อมูลการเปลี่ยนแปลงใช่หรือไม่?"
                : "คุณจำเป็นต้องเข้าสู่ระบบเพื่อบันทึกข้อมูลถาวร"}
            </p>
            <div className="ml3-modal-actions">
              <button className="ml3-btn-cancel" onClick={() => setShowModal(false)}>
                ยกเลิก
              </button>
              <button className="ml3-btn-confirm" onClick={confirmSave}>
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="ml3-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="ml3-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ml3-modal-title" style={{ color: "#ef4444" }}>
              ยืนยันการลบ
            </div>
            <p className="ml3-modal-desc">
              คุณต้องการลบรายการสินค้านี้ใช่หรือไม่? <br />
              การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>
            <div className="ml3-modal-actions">
              <button className="ml3-btn-cancel" onClick={() => setShowDeleteModal(false)}>
                ยกเลิก
              </button>
              <button className="ml3-btn-discard" onClick={confirmDelete}>
                ลบรายการ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="ml3-modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="ml3-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              <div
                style={{
                  background: "#eff6ff",
                  padding: 12,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LogIn size={28} color="#3b82f6" />
              </div>
            </div>
            <div className="ml3-modal-title">บันทึกข้อมูลแล้ว</div>
            <p className="ml3-modal-desc">
              ข้อมูลถูกบันทึกในเครื่องชั่วคราว
              <br />
              กรุณาเข้าสู่ระบบเพื่อเก็บข้อมูลถาวร หรือกด "ยกเลิก" หากไม่ต้องการบันทึก
            </p>
            <div className="ml3-modal-actions">
              <button className="ml3-btn-cancel" onClick={handleCancelLogin}>
                ยกเลิก
              </button>
              <button
                className="ml3-btn-confirm"
                style={{ backgroundColor: "#3b82f6" }}
                onClick={handleLoginRedirect}
              >
                เข้าสู่ระบบ
              </button>
            </div>
          </div>
        </div>
      )}

      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            borderRadius: "50px",
            background: "#333",
            color: "#fff",
            fontSize: "1rem",
            padding: "10px 20px",
          },
          success: {
            style: {
              background: "#ecfdf5",
              color: "#047857",
              border: "1px solid #a7f3d0",
            },
            iconTheme: {
              primary: "#10b981",
              secondary: "#ecfdf5",
            },
          },
          error: {
            style: {
              background: "#fef2f2",
              color: "#b91c1c",
              border: "1px solid #fecaca",
            },
          },
        }}
      />

      <Footer />
    </>
  );
}
