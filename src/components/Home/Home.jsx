import React, { useState, useEffect, useMemo } from 'react';
import './Home.css';
import { 
  Search, Plus, Heart, 
  Smartphone, Monitor, WashingMachine, Utensils, 
  Salad, Coffee, Cookie,
  // ลบ Star, Flame, Percent ออกเพราะเราใช้ SVG แบบ Custom แทนแล้ว
} from 'lucide-react';

const Home = () => {
  const [favorites, setFavorites] = useState({});
  const [allProducts, setAllProducts] = useState([]); // เก็บข้อมูลทั้งหมด
  const [loading, setLoading] = useState(true); // สถานะการโหลด

  const toggleFav = (id) => {
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // --- 1. โหลดข้อมูล JSONL จากโฟลเดอร์ public ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // path นี้จะชี้ไปที่ public/data/products.jsonl
        const response = await fetch('../../../data/all_retailers_products_merged_v1.jsonl'); 
        const text = await response.text();

        // เทคนิคแปลง JSONL: แยกบรรทัด (\n) แล้วแปลงแต่ละบรรทัดเป็น Object
        const products = text
          .trim() // ตัดช่องว่างหัวท้าย
          .split('\n') // แยกบรรทัด
          .map(line => {
            try {
              return JSON.parse(line);
            } catch (e) {
              return null;
            }
          })
          .filter(item => item !== null); // เอาเฉพาะบรรทัดที่แปลงสำเร็จ

        setAllProducts(products);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- 2. สุ่มสินค้า/เลือกสินค้ามาแสดง ---
  const { recommended, popular, promo } = useMemo(() => {
    if (allProducts.length === 0) return { recommended: [], popular: [], promo: [] };

    // ฟังก์ชันสุ่มสินค้า
    const shuffle = (array) => [...array].sort(() => 0.5 - Math.random());
    
    // สุ่มสินค้าสัก 50 ตัวมาใช้งาน
    const sampled = shuffle(allProducts).slice(0, 50);

    return {
      recommended: sampled.slice(0, 10),
      popular: sampled.slice(10, 20),
      promo: sampled.slice(20, 30)
    };
  }, [allProducts]);


  // หมวดหมู่
  const categories = [
    { name: "มือถือ", icon: <Smartphone size={32} strokeWidth={1.5} /> },
    { name: "คอมพิวเตอร์", icon: <Monitor size={32} strokeWidth={1.5} /> },
    { name: "เครื่องใช้ไฟฟ้า", icon: <WashingMachine size={32} strokeWidth={1.5} /> },
    { name: "อาหาร", icon: <Utensils size={32} strokeWidth={1.5} /> },
    { name: "ผัก & ผลไม้", icon: <Salad size={32} strokeWidth={1.5} /> },
    { name: "เครื่องดื่ม", icon: <Coffee size={32} strokeWidth={1.5} /> },
    { name: "ขนมขบเคี้ยว", icon: <Cookie size={32} strokeWidth={1.5} /> },
  ];

  // Component ย่อย
  const ProductSection = ({ title, icon, items, badgeColor }) => (
    <section className="section-container">
      <div className="section-header">
        <h2 className="section-title">
          {icon} 
          <span style={{ marginLeft: '8px' }}>{title}</span>
        </h2>
        <button className="btn-view-all" style={{ backgroundColor: badgeColor }}>ดูทั้งหมด</button>
      </div>
      
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          กำลังโหลดสินค้าจำนวนมาก...
        </div>
      ) : (
        <div className="product-grid">
          {items.map((item, index) => (
            <div key={item.id || index} className="product-card">
              <button 
                className={`fav-btn ${favorites[item.id] ? 'active' : ''}`}
                onClick={() => toggleFav(item.id)}
              >
                <Heart size={20} fill={favorites[item.id] ? "#ef4444" : "none"} />
              </button>

              <div className="product-img-wrap">
                <img 
                  src={item.image || "https://placehold.co/300x300?text=No+Image"} 
                  alt={item.name} 
                  loading="lazy" 
                  onError={(e) => { e.target.src = "https://placehold.co/300x300?text=Error"; }} 
                />
              </div>
              
              <div className="product-info">
                <h3>{item.name}</h3>
                <button className="btn-add-cart">
                  <Plus size={18} /> เพิ่ม
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );

  return (
    <div className="home-container">
      {/* Hero */}
      <header className="hero-banner">
        <div className="hero-content">
          <h1>จัดรายการของคุณให้คุ้มกว่าเดิม<br /><span>ประหยัดได้ทุกครั้งที่ช้อป</span></h1>
          <p>ค้นหาจากสินค้ากว่า {allProducts.length.toLocaleString()} รายการ เพื่อราคาที่ดีที่สุด</p>
          
          <div className="search-box-wrapper">
            <input type="text" placeholder="ค้นหาสินค้า..." />
            <button className="search-btn"><Search size={22} /></button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="content-wrapper">
        <section className="section-container">
          <div className="section-header">
            <h2 className="section-title">หมวดหมู่</h2>
            {/* ปรับสีปุ่มให้ตรงกับ Theme Sage Green */}
            <button className="btn-view-all" style={{ backgroundColor: '#5c9c73' }}>ดูทั้งหมด</button>
          </div>
          <div className="category-scroll">
            {categories.map((cat, idx) => (
              <div key={idx} className="cat-item">
                <div className="cat-icon-box">{cat.icon}</div>
                <span className="cat-text">{cat.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* --- 3 ส่วนนี้คือจุดที่เปลี่ยนไอคอนเป็น SVG สวยๆ --- */}
        
        <ProductSection 
          title="สินค้าแนะนำ" 
          icon={
            // ไอคอน Sparkles สีเขียว Sage
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5c9c73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
            </svg>
          } 
          items={recommended} 
          badgeColor="#5c9c73" 
        />

        <ProductSection 
          title="สินค้ายอดนิยม" 
          icon={
            // ไอคอน Fire สีส้มอิฐ (ให้ดูร้อนแรงแต่ยังคุมโทน)
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.5-3.3a7 7 0 0 0 3 2.8z"/>
            </svg>
          } 
          items={popular} 
          badgeColor="#5c9c73" 
        />

        <ProductSection 
          title="สินค้าโปรโมชั่น" 
          icon={
            // ไอคอน Tag สีเขียว
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5c9c73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94 .94-2.48 0-3.42L12 2Z"/>
              <path d="M7 7h.01"/>
            </svg>
          } 
          items={promo} 
          badgeColor="#5c9c73" 
        />

      </main>
    </div>
  );
};

export default Home;