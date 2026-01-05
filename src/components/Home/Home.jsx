import React, { useState, useEffect, useMemo, useRef } from 'react';
import './Home.css';
import {
  Search, Plus, Heart, Beef, PackageSearch, Home as HomeIcon,
  Sparkles, Baby, Tv, Hammer, Dog, ChevronLeft, ChevronRight,
  Flame, Star, Tag, LayoutGrid
} from 'lucide-react';


import AddToListModal from './AddToListModal';

const ProductSection = ({ title, icon, items, favorites, toggleFav, loading, onAddToCart }) => {
  const scrollRef = useRef(null);
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -240 : 240; // Adjusted for 5 items/row
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="section-container">
      <div className="section-header">
        <h2 className="section-title">
          {icon}
          <span>{title}</span>
        </h2>
        <button className="btn-view-all">ดูทั้งหมด</button>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-light)' }}>
          กำลังโหลดสินค้า...
        </div>
      ) : (
        <div className="slider-container-relative">
          <button className="scroll-btn prev-btn" onClick={() => scroll('left')}>
            <ChevronLeft size={24} />
          </button>

          <div className="product-grid" ref={scrollRef}>
            {items.map((item, index) => {
              // เช็คว่าสินค้านี้ถูกใจหรือยัง (ใช้ชื่อสินค้าเป็น Key)
              const isFav = favorites[item.name];
              return (
                <div key={item.id || index} className="product-card">
                  <button
                    className={`fav-btn ${isFav ? 'active' : ''}`}
                    onClick={() => toggleFav(item)}
                  >
                    {/* ถ้าชอบแล้วให้เติมสีแดง */}
                    <Heart size={20} fill={isFav ? "#ef4444" : "none"} stroke={isFav ? "#ef4444" : "currentColor"} />
                  </button>

                  <div className="product-img-wrap">
                    <img
                      src={item.image || "https://placehold.co/300x300?text=No+Image"}
                      alt={item.name}
                      loading="lazy"
                    />
                  </div>

                  <div className="product-info">
                    <h3>{item.name}</h3>
                    <button className="btn-add-cart" onClick={() => onAddToCart(item)}>
                      <Plus size={18} /> เพิ่มลง My List
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button className="scroll-btn next-btn" onClick={() => scroll('right')}>
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </section>
  );
};

const Home = () => {
  // เก็บสถานะหัวใจเป็น Object { "ชื่อสินค้า": true/false } เพื่อให้ค้นหาเร็ว
  const [favorites, setFavorites] = useState({});
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // ✅ 1. โหลดข้อมูล Favorites จากเครื่องเมื่อเปิดเว็บ
  useEffect(() => {
    const savedFavs = JSON.parse(localStorage.getItem('favoritesItems')) || [];
    const favMap = {};
    savedFavs.forEach(item => {
      // ใช้ field 'data' (ชื่อสินค้า) เป็น key ตามที่หน้า Favorites ใช้งาน
      if (item.data) favMap[item.data] = true;
    });
    setFavorites(favMap);
  }, []);

  // ... (code ส่วนบนเหมือนเดิม)

  // ✅ 2. ฟังก์ชันกดหัวใจ (แก้ไขป้องกันการเพิ่มซ้ำ)
  const toggleFav = (product) => {
    const productName = product.name;

    setFavorites(prev => {
      const isCurrentlyFav = !!prev[productName];
      const newFavState = { ...prev, [productName]: !isCurrentlyFav };

      // อัปเดต LocalStorage
      const currentSavedFavs = JSON.parse(localStorage.getItem('favoritesItems')) || [];

      let newSavedFavs;
      if (isCurrentlyFav) {
        // กรณี: ยกเลิกหัวใจ -> ลบออก
        newSavedFavs = currentSavedFavs.filter(item => item.data !== productName);
      } else {
        // กรณี: กดหัวใจ -> เพิ่มเข้าไป

        // ⭐ เพิ่มการตรวจสอบว่ามีของชิ้นนี้อยู่แล้วหรือยัง? เพื่อกันการเบิ้ล
        const alreadyExists = currentSavedFavs.some(item => item.data === productName);

        if (!alreadyExists) {
          const favItem = {
            image: product.image,
            data: product.name,
            price: product.price
          };
          newSavedFavs = [...currentSavedFavs, favItem];
        } else {
          // ถ้ามีอยู่แล้ว ให้ใช้รายการเดิม (ไม่เพิ่มซ้ำ)
          newSavedFavs = currentSavedFavs;
        }
      }

      localStorage.setItem('favoritesItems', JSON.stringify(newSavedFavs));
      return newFavState;
    });
  };

  // ... (code ส่วนล่างเหมือนเดิม)

  // โหลดสินค้า (ส่วนเดิม)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/data/all_retailers_products_merged_v1.jsonl');
        const text = await response.text();
        const lines = text.trim().split('\n').slice(0, 500);
        const products = lines.map(line => JSON.parse(line));
        setAllProducts(products);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const { recommended, popular, promo } = useMemo(() => {
    if (allProducts.length === 0) return { recommended: [], popular: [], promo: [] };
    const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
    return {
      recommended: shuffled.slice(0, 10),
      popular: shuffled.slice(10, 20),
      promo: shuffled.slice(20, 30)
    };
  }, [allProducts]);

  const categories = [
    { name: "อาหารสด & แช่แข็ง", icon: <Beef size={28} /> },
    { name: "อาหารแห้ง", icon: <PackageSearch size={28} /> },
    { name: "ของใช้ในบ้าน", icon: <HomeIcon size={28} /> },
    { name: "สุขภาพ & ความงาม", icon: <Sparkles size={28} /> },
    { name: "แม่และเด็ก", icon: <Baby size={28} /> },
    { name: "เครื่องใช้ไฟฟ้า", icon: <Tv size={28} /> },
    { name: "เครื่องมือช่าง", icon: <Hammer size={28} /> },
    { name: "สัตว์เลี้ยง", icon: <Dog size={28} /> },
  ];

  return (
    <div className="home-container">
      {/* HERO SECTION */}
      <header className="hero-banner">
        <div className="hero-content">
          <h1>
            จัดรายการของคุณให้คุ้มกว่าเดิม<br />
            <span>ประหยัดได้ทุกครั้งที่ช้อป</span>
          </h1>
          <p>
            เปรียบเทียบราคาจากสินค้ากว่า
            <strong> {allProducts.length.toLocaleString()} </strong>
            รายการ เพื่อดีลที่คุ้มที่สุด
          </p>

          <div className="search-box-wrapper">
            <input type="text" placeholder="ค้นหาชื่อสินค้าที่ต้องการ..." />
            <button className="search-btn">
              <Search size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="content-wrapper">
        <section className="section-container">
          <div className="section-header">
            <h2 className="section-title">
              <LayoutGrid size={28} color="var(--primary)" />
              หมวดหมู่ยอดนิยม
            </h2>
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

        <ProductSection
          title="สินค้าแนะนำ"
          icon={<Star size={24} color="var(--primary)" />}
          items={recommended}
          favorites={favorites}
          toggleFav={toggleFav}
          loading={loading}
          onAddToCart={(p) => { setSelectedProduct(p); setIsModalOpen(true); }}
        />

        <ProductSection
          title="สินค้ายอดนิยม"
          icon={<Flame size={24} color="#ea580c" />}
          items={popular}
          favorites={favorites}
          toggleFav={toggleFav}
          loading={loading}
          onAddToCart={(p) => { setSelectedProduct(p); setIsModalOpen(true); }}
        />

        <ProductSection
          title="สินค้าโปรโมชั่น"
          icon={<Tag size={24} color="var(--primary)" />}
          items={promo}
          favorites={favorites}
          toggleFav={toggleFav}
          loading={loading}
          onAddToCart={(p) => { setSelectedProduct(p); setIsModalOpen(true); }}
        />
      </main>

      <AddToListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
      />
    </div>
  );
};

export default Home;