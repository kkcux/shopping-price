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
  MapPin, // ✅ เพิ่มไอคอนแผนที่
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



/* ================= constants ================= */

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

  // ✅ สำหรับดึงข้อมูลร้านค้าและระยะทาง
  const [branchLoading, setBranchLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [storeDistances, setStoreDistances] = useState({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // ✅ ดึงตำแหน่งปัจจุบันของผู้ใช้ (อัตโนมัติ)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          console.log("✅ ดึงตำแหน่งสำเร็จ:", location);
          setUserLocation(location);
        },
        (error) => {
          console.log("⚠️ Geolocation error:", error);
          // ใช้ตำแหน่งนครพนมเป็นค่า default อัตโนมัติ
          console.log("📍 ใช้ตำแหน่งนครพนมเป็นค่า default");
          setUserLocation({ lat: 17.4108, lng: 104.7786 });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      // ถ้า browser ไม่รองรับ geolocation ให้ใช้ตำแหน่งนครพนม
      console.log("📍 Browser ไม่รองรับ geolocation, ใช้ตำแหน่งนครพนม");
      setUserLocation({ lat: 17.4108, lng: 104.7786 });
    }
  }, []);

  // ✅ คำนวณระยะทางระหว่างสองจุด (Haversine formula)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // รัศมีโลกเป็นกิโลเมตร
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // ระยะทางเป็นกิโลเมตร
  };

  // ✅ ดึงข้อมูลร้านค้าใกล้เคียง
  useEffect(() => {
    if (!userLocation) return;

    const fetchNearbyStores = async () => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/b65ceb91-57c6-4681-8335-687676aa3c11',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MyLists3.jsx:fetchNearbyStores_start',message:'fetch nearby stores start',data:{userLocation},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H4'})}).catch(()=>{});
      // #endregion
      setBranchLoading(true);

      const storeQueries = {
        LOTUS: "โลตัส",
        BIGC: "บิ๊กซี",
        MAKRO: "แม็คโคร",
      };

      const distances = {};

      try {
        for (const [key, query] of Object.entries(storeQueries)) {
          try {
            const response = await fetch(
              `/api/places-nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&q=${encodeURIComponent(query)}&radius=10000`
            );
            const data = await response.json();
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/b65ceb91-57c6-4681-8335-687676aa3c11',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MyLists3.jsx:places_response',message:'places response',data:{key,resultsCount:(data?.results||[]).length,firstLocation:(data?.results||[])[0]?.location||null},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H4'})}).catch(()=>{});
            // #endregion

            if (data.results && data.results.length > 0) {
              // หาร้านที่ใกล้ที่สุด
              const nearest = data.results[0];
              if (nearest.location) {
                const distance = calculateDistance(
                  userLocation.lat,
                  userLocation.lng,
                  nearest.location.lat,
                  nearest.location.lng
                );
                distances[key] = {
                  distance: distance,
                  name: nearest.name,
                  vicinity: nearest.vicinity,
                  location: nearest.location, // ✅ เก็บ location เพื่อใช้เปิดแผนที่
                };
              }
            }
          } catch (err) {
            console.error(`Error fetching ${key}:`, err);
          }
        }

        setStoreDistances(distances);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/b65ceb91-57c6-4681-8335-687676aa3c11',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MyLists3.jsx:setStoreDistances',message:'store distances set',data:{distances},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H5'})}).catch(()=>{});
        // #endregion
      } catch (error) {
        console.error("Error fetching nearby stores:", error);
      } finally {
        setBranchLoading(false);
      }
    };

    fetchNearbyStores();
  }, [userLocation]);



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
          } catch (err) {
            // Skip invalid JSON lines
            console.debug('Skipping invalid line:', err);
          }
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
  const [isDraft, setIsDraft] = useState(false);

  useEffect(() => {
    const fetchListData = async () => {
      // 0. PENDING LOGIN DRAFT PRIORITY (For returning users)
      const pending = JSON.parse(localStorage.getItem("pending_save_list"));
      if (pending && String(pending.id) === String(id)) {
          console.log("RECEIVED PENDING LOGIN DATA:", pending);
          setSelectedList(pending);
          setIsDraft(true);
          return;
      }
      
      // 1. DRAFT DATA PRIORITY
      // 1. DRAFT DATA PRIORITY
      if (location.state?.draftData) {
        console.log("RECEIVED DRAFT DATA:", location.state.draftData);
        setSelectedList(location.state.draftData);
        setIsDraft(true); 
        return;
      }

      // 2. ถ้าไม่มี ให้หาใน Local Storage
      const allLocalLists = JSON.parse(localStorage.getItem("myLists")) || [];
      const localList = allLocalLists.find((l) => String(l.id) === String(id));

      if (localList) {
        setSelectedList(localList);
        return;
      }

      // 3. ถ้าไม่มีใน Local ให้หาใน FireStore (Cloud)
      if (auth.currentUser) {
          try {
              const docRef = doc(db, "shopping_lists", String(id));
              const docSnap = await getDoc(docRef);
              
              if (docSnap.exists()) {
                  const data = docSnap.data();
                  setSelectedList({ id: docSnap.id, ...data });
                  // Optional: Sync back to local? 
                  // might be good for consistency but let's just display it first
              } else {
                  console.log("No such document in Firestore!");
              }
          } catch (err) {
              console.error("Error fetching from Firestore:", err);
          }
      }
    };
    fetchListData();
  }, [id, location.state]);

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

  /* ===== ✅ แนะนำร้านค้าพร้อมระยะทาง ===== */
  const recommendShops = useMemo(() => {
    return [
      {
        key: "BIGC",
        name: "Big C",
        totalPrice: totals.BIGC,
        url: "https://www.bigc.co.th",
        distance: storeDistances.BIGC?.distance || null,
        vicinity: storeDistances.BIGC?.vicinity || null,
        location: storeDistances.BIGC?.location || null,
      },
      {
        key: "LOTUS",
        name: "Lotus's",
        totalPrice: totals.LOTUS,
        url: "https://www.lotuss.com",
        distance: storeDistances.LOTUS?.distance || null,
        vicinity: storeDistances.LOTUS?.vicinity || null,
        location: storeDistances.LOTUS?.location || null,
      },
      {
        key: "MAKRO",
        name: "Makro",
        totalPrice: totals.MAKRO,
        url: "https://www.makro.pro",
        distance: storeDistances.MAKRO?.distance || null,
        vicinity: storeDistances.MAKRO?.vicinity || null,
        location: storeDistances.MAKRO?.location || null,
      },
    ]
      .filter((s) => typeof s.totalPrice === "number" && s.totalPrice > 0)
      .sort((a, b) => {
        // เรียงตามราคาก่อน แล้วตามระยะทาง
        if (a.totalPrice !== b.totalPrice) {
          return a.totalPrice - b.totalPrice;
        }
        if (a.distance && b.distance) {
          return a.distance - b.distance;
        }
        return 0;
      });
  }, [totals, storeDistances]);

  // ✅ ฟังก์ชันเปิดแผนที่พร้อมเส้นทาง
  const openMap = (store) => {
    if (!userLocation) {
      toast.error("ไม่สามารถดึงตำแหน่งของคุณได้");
      return;
    }

    if (store.location) {
      // ใช้ Google Maps Directions API เพื่อแสดงเส้นทาง
      const origin = `${userLocation.lat},${userLocation.lng}`;
      const destination = `${store.location.lat},${store.location.lng}`;
      const mapUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
      window.open(mapUrl, "_blank");
    } else if (store.vicinity) {
      // ถ้าไม่มี location แต่มี vicinity ให้ค้นหาด้วยชื่อร้าน
      const searchQuery = encodeURIComponent(`${store.name} ${store.vicinity}`);
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
      window.open(mapUrl, "_blank");
    } else {
      toast.error("ไม่พบข้อมูลตำแหน่งร้านค้า");
    }
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
    if (isSaving) return; // ✅ ป้องกันการกดซ้ำซ้อน

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
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Store size={24} color="#3b82f6" />
                  <span>ราคาสินค้ารวมแต่ละร้านค้า</span>
               </div>
            </div>

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
                  <div className="ml3-shop-distance">
                    {branchLoading ? (
                      <Loader2 size={14} className="animate-spin" color="#64748b" />
                    ) : s.distance ? (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Navigation size={14} color="#64748b" />
                        {s.distance < 1
                          ? `${Math.round(s.distance * 1000)} ม.`
                          : `${s.distance.toFixed(1)} กม.`}
                      </span>
                    ) : (
                      <span style={{ color: "#cbd5e1" }}>-</span>
                    )}
                  </div>
                  <div className="ml3-shop-price" style={{ color: "#10b77e", fontSize: "1.1rem" }}>
                    ฿{Math.round(s.totalPrice).toLocaleString()}
                  </div>

                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    {s.location && userLocation && (
                      <button
                        className="ml3-btn-map"
                        onClick={() => openMap(s)}
                        title="เปิดแผนที่พร้อมเส้นทาง"
                      >
                        <MapPin size={16} />
                      </button>
                    )}
                    <button className="ml3-go" onClick={() => window.open(s.url, "_blank")}>
                      ไปยังร้านค้า
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
            <div className="ml3-modal-title" style={{ marginTop: '10px' }}>
              {currentUser ? "ยืนยันการบันทึก" : "กรุณาเข้าสู่ระบบ"}
            </div>
            <p className="ml3-modal-desc">
              {currentUser
                ? "ต้องการบันทึกข้อมูลการเปลี่ยนแปลงใช่หรือไม่?"
                : "คุณจำเป็นต้องเข้าสู่ระบบสมาชิกก่อนจึงจะบันทึกรายการได้"}
            </p>
            <div className="ml3-modal-actions">
              <button className="ml3-btn-cancel" onClick={() => setShowModal(false)} disabled={isSaving}>
                ยกเลิก
              </button>
              {currentUser ? (
                <button className="ml3-btn-confirm" onClick={confirmSave} disabled={isSaving}>
                  {isSaving ? "กำลังบันทึก..." : "บันทึก"}
                </button>
              ) : (
                <button
                  className="ml3-btn-confirm"
                  style={{ backgroundColor: '#3b82f6' }}
                  onClick={() => {
                    localStorage.setItem("pending_save_list", JSON.stringify(selectedList));
                    setShowModal(false);
                    navigate('/login', { state: { from: location.pathname } });
                  }}
                  disabled={isSaving}
                >
                  เข้าสู่ระบบ
                </button>
              )}
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
