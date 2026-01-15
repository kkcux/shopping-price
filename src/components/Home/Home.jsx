import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import {
  Search, Plus, Heart, Beef, PackageSearch, Home as HomeIcon,
  Sparkles, Baby, Tv, Hammer, Dog, ChevronLeft, ChevronRight,
  Flame, Star, Tag, LayoutGrid
} from 'lucide-react';

import AddToListModal from './AddToListModal';

const ProductSection = ({ title, icon, items, favorites, toggleFav, loading, onAddToCart, onViewAll }) => {
  const scrollRef = useRef(null);
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -240 : 240;
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
        <button className="btn-view-all" onClick={onViewAll}>
            ดูทั้งหมด
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          กำลังโหลดสินค้า...
        </div>
      ) : (
        <div className="slider-container-relative">
          <button className="scroll-btn prev-btn" onClick={() => scroll('left')}>
            <ChevronLeft size={24} />
          </button>

          <div className="product-grid" ref={scrollRef}>
            {items.map((item, index) => {
              const isFav = favorites[item.name];
              return (
                <div key={item.id || index} className="product-card">
                  <button
                    className={`fav-btn ${isFav ? 'active' : ''}`}
                    onClick={() => toggleFav(item)}
                  >
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
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState({});
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // --- Search & Suggestion States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);     // เก็บรายการแนะนำ
  const [showSuggestions, setShowSuggestions] = useState(false); // ควบคุมการแสดงผล Dropdown
  const searchContainerRef = useRef(null); // ใช้เช็คคลิกนอกกล่อง

  // ฟังก์ชันจัดการการพิมพ์
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim().length > 0) {
      // กรองสินค้าที่ชื่อตรงกัน (เอาแค่ 6 รายการพอ ไม่ให้ยาวเกิน)
      const filtered = allProducts
        .filter(p => p.name && p.name.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 6);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // ฟังก์ชันเมื่อกดค้นหา (Enter หรือ ปุ่มแว่นขยาย)
  const handleSearch = () => {
    if (searchTerm.trim()) {
      setShowSuggestions(false);
      navigate('/categories', { 
        state: { searchTerm: searchTerm, selectedCategory: 'ทั้งหมด' } 
      });
    }
  };

  // ฟังก์ชันเมื่อเลือกรายการจาก Dropdown
  const handleSelectSuggestion = (productName) => {
    setSearchTerm(productName);
    setShowSuggestions(false);
    // ไปหน้า Categories เพื่อค้นหาสินค้านั้นทันที
    navigate('/categories', { 
        state: { searchTerm: productName, selectedCategory: 'ทั้งหมด' } 
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // ปิด Dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ... (ฟังก์ชันอื่นๆ: handleViewAll, favorites, loading - เหมือนเดิม) ...
  const handleViewAll = (filterType) => {
    navigate('/categories', { state: { selectedFilter: filterType, selectedCategory: 'ทั้งหมด' } });
  };

  useEffect(() => {
    const savedFavs = JSON.parse(localStorage.getItem('favoritesItems')) || [];
    const favMap = {};
    savedFavs.forEach(item => { if (item.data) favMap[item.data] = true; });
    setFavorites(favMap);
  }, []);

  const toggleFav = (product) => {
     const productName = product.name;
    setFavorites(prev => {
      const isCurrentlyFav = !!prev[productName];
      const newFavState = { ...prev, [productName]: !isCurrentlyFav };
      const currentSavedFavs = JSON.parse(localStorage.getItem('favoritesItems')) || [];
      let newSavedFavs;
      if (isCurrentlyFav) {
        newSavedFavs = currentSavedFavs.filter(item => item.data !== productName);
      } else {
        const alreadyExists = currentSavedFavs.some(item => item.data === productName);
        if (!alreadyExists) {
          const favItem = { image: product.image, data: product.name, price: product.price };
          newSavedFavs = [...currentSavedFavs, favItem];
        } else { newSavedFavs = currentSavedFavs; }
      }
      localStorage.setItem('favoritesItems', JSON.stringify(newSavedFavs));
      return newFavState;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/data/all_retailers_products_merged_v1.jsonl');
        const text = await response.text();
        const lines = text.trim().split('\n').slice(0, 500); 
        const products = lines.map(line => {
            try { return JSON.parse(line); } catch(e) { return null; }
        }).filter(item => item !== null);
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

  const handleCategoryClick = (categoryName) => {
    navigate('/categories', { state: { selectedCategory: categoryName } });
  };

  return (
    <div className="home-container">
      <header className="hero-banner">
        <div className="hero-content">
          <h1>
            จัดรายการของคุณให้คุ้มกว่าเดิม<br />
            <span>ประหยัดได้ทุกครั้งที่ช้อป</span>
          </h1>
          <p>
            เปรียบเทียบราคาจากสินค้ากว่า
            <strong> {allProducts.length > 0 ? '5,000+' : '...'} </strong>
            รายการ เพื่อดีลที่คุ้มที่สุด
          </p>
          
          {/* 🟢 4. ส่วน Search Box + Dropdown Suggestions */}
          <div className="search-container-relative" ref={searchContainerRef}>
            <div className="search-box-wrapper">
              <input 
                  type="text" 
                  placeholder="ค้นหาชื่อสินค้าที่ต้องการ..." 
                  value={searchTerm}
                  onChange={handleInputChange} // ใช้ฟังก์ชันใหม่
                  onKeyDown={handleKeyDown}
                  onFocus={() => { if(searchTerm && suggestions.length > 0) setShowSuggestions(true); }}
              />
              <button className="search-btn" onClick={handleSearch}>
                <Search size={22} />
              </button>
            </div>

            {/* 🟢 5. กล่อง Dropdown แสดงผลการค้นหา */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="search-suggestions-dropdown">
                {suggestions.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="suggestion-item"
                    onClick={() => handleSelectSuggestion(item.name)}
                  >
                    <div className="suggestion-icon-area">
                      {item.image ? (
                        <img src={item.image} alt="product" className="suggestion-img" />
                      ) : (
                        <Search size={18} className="suggestion-icon-default" />
                      )}
                    </div>
                    <div className="suggestion-text">
                      <span className="suggestion-name">{item.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </header>

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
              <div 
                key={idx} 
                className="cat-item"
                onClick={() => handleCategoryClick(cat.name)}
              >
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
          onViewAll={() => handleViewAll('recommended')} 
        />
        <ProductSection
          title="สินค้ายอดนิยม"
          icon={<Flame size={24} color="#ea580c" />}
          items={popular}
          favorites={favorites}
          toggleFav={toggleFav}
          loading={loading}
          onAddToCart={(p) => { setSelectedProduct(p); setIsModalOpen(true); }}
          onViewAll={() => handleViewAll('popular')} 
        />
        <ProductSection
          title="สินค้าโปรโมชั่น"
          icon={<Tag size={24} color="var(--primary)" />}
          items={promo}
          favorites={favorites}
          toggleFav={toggleFav}
          loading={loading}
          onAddToCart={(p) => { setSelectedProduct(p); setIsModalOpen(true); }}
          onViewAll={() => handleViewAll('promo')} 
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