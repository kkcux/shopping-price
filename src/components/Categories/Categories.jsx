import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../Home/Navbar';
import Footer from '../Home/Footer';
import './Categories.css';
import {
  Beef, PackageSearch, Home as HomeIcon,
  Sparkles, Baby, Tv, Hammer, Dog,
  Filter, SlidersHorizontal, ChevronDown, Heart, Check,
  LayoutGrid
} from 'lucide-react';

import AddToListModal from '../Home/AddToListModal';

const Categories = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // --- State หลัก ---
  const [activeCategory, setActiveCategory] = useState(
    location.state?.selectedCategory || 'ทั้งหมด'
  );
  const [allProducts, setAllProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- State สำหรับ Features ---
  const [favorites, setFavorites] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // --- State สำหรับ Filter & Sort ---
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  
  const [sortOption, setSortOption] = useState('popular');
  const [priceFilter, setPriceFilter] = useState({ min: '', max: '' });

  const sortRef = useRef(null);
  const filterRef = useRef(null);

  const categoryList = [
    { id: 'fresh', name: "อาหารสด & แช่แข็ง", icon: <Beef size={24} /> },
    { id: 'dry', name: "อาหารแห้ง", icon: <PackageSearch size={24} /> },
    { id: 'home', name: "ของใช้ในบ้าน", icon: <HomeIcon size={24} /> },
    { id: 'beauty', name: "สุขภาพ & ความงาม", icon: <Sparkles size={24} /> },
    { id: 'baby', name: "แม่และเด็ก", icon: <Baby size={24} /> },
    { id: 'electric', name: "เครื่องใช้ไฟฟ้า", icon: <Tv size={24} /> },
    { id: 'tools', name: "เครื่องมือช่าง", icon: <Hammer size={24} /> },
    { id: 'pet', name: "สัตว์เลี้ยง", icon: <Dog size={24} /> },
  ];

  // ✅ 1. กำหนดคีย์เวิร์ดสำหรับแต่ละหมวดหมู่ (ใช้กรองสินค้า)
  const categoryKeywords = {
    "อาหารสด & แช่แข็ง": ["หมู", "ไก่", "เนื้อ", "ปลา", "กุ้ง", "ผัก", "ผลไม้", "สด", "แช่แข็ง", "ไข่"],
    "อาหารแห้ง": ["ข้าว", "เส้น", "น้ำมัน", "ซอส", "น้ำตาล", "กาแฟ", "ขนม", "บะหมี่", "กระป๋อง", "ปรุงรส"],
    "ของใช้ในบ้าน": ["น้ำยา", "ซัก", "ล้าง", "ปรับผ้านุ่ม", "ทิชชู่", "ไม้กวาด", "ถู", "ห้องน้ำ", "ครัว"],
    "สุขภาพ & ความงาม": ["สบู่", "แชมพู", "ครีม", "โลชั่น", "แป้ง", "ยาสีฟัน", "โฟม", "บำรุง"],
    "แม่และเด็ก": ["นมผง", "ผ้าอ้อม", "เด็ก", "ทารก", "baby", "kid"],
    "เครื่องใช้ไฟฟ้า": ["ทีวี", "ตู้เย็น", "พัดลม", "เตา", "หม้อ", "ไฟฟ้า", "แอร์", "ไมโครเวฟ"],
    "เครื่องมือช่าง": ["สว่าน", "ค้อน", "เลื่อย", "เครื่องมือ", "ช่าง", "หลอดไฟ", "สี"],
    "สัตว์เลี้ยง": ["สุนัข", "แมว", "หมา", "ทรายแมว", "สัตว์เลี้ยง"]
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setShowSortMenu(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const savedFavs = JSON.parse(localStorage.getItem('favoritesItems')) || [];
    const favMap = {};
    savedFavs.forEach(item => { if (item.data) favMap[item.data] = true; });
    setFavorites(favMap);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/data/all_retailers_products_merged_v1.jsonl');
        const text = await response.text();
        
        // โหลดข้อมูลจำนวนมาก (5000 รายการ) เพื่อให้ครอบคลุมทุกหมวด
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

  // ✅ 3. Logic การกรองสินค้า (Filter Logic)
  useEffect(() => {
    let processed = [...allProducts];

    // A. กรองตามหมวดหมู่ (ใช้ Keywords Matching)
    if (activeCategory !== 'ทั้งหมด') {
        const keywords = categoryKeywords[activeCategory] || [];
        
        if (keywords.length > 0) {
            processed = processed.filter(item => {
                // รวมข้อความที่จะค้นหา (ชื่อสินค้า + หมวดหมู่ใน data ถ้ามี)
                const textToSearch = `${item.name} ${item.category || ''}`.toLowerCase();
                
                // ตรวจสอบว่ามีคีย์เวิร์ดคำใดคำหนึ่งอยู่ในชื่อสินค้าหรือไม่
                return keywords.some(kw => textToSearch.includes(kw));
            });
        }
    }

    // B. กรองตามราคา (Price Filter)
    if (priceFilter.min !== '') {
        processed = processed.filter(p => (p.price || 0) >= Number(priceFilter.min));
    }
    if (priceFilter.max !== '') {
        processed = processed.filter(p => (p.price || 0) <= Number(priceFilter.max));
    }

    // C. เรียงลำดับ (Sorting)
    if (sortOption === 'price_asc') {
        processed.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortOption === 'price_desc') {
        processed.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    setDisplayProducts(processed);
  }, [allProducts, activeCategory, sortOption, priceFilter]);

  const resetFilter = () => {
      setPriceFilter({ min: '', max: '' });
      setShowFilterMenu(false);
  };

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
          newSavedFavs = [...currentSavedFavs, { image: product.image, data: product.name, price: product.price }];
        } else { newSavedFavs = currentSavedFavs; }
      }
      localStorage.setItem('favoritesItems', JSON.stringify(newSavedFavs));
      return newFavState;
    });
  };

  const getSortLabel = () => {
      if (sortOption === 'price_asc') return 'ราคา: ต่ำ - สูง';
      if (sortOption === 'price_desc') return 'ราคา: สูง - ต่ำ';
      return 'ยอดนิยม';
  }

  return (
    <div className="categories-page">
      <Navbar />
      <header className="cat-header">
        <div className="cat-header-content">
          <h1>หมวดหมู่สินค้า</h1>
          <p>เลือกประเภทสินค้าที่คุณต้องการเพื่อเปรียบเทียบราคาได้ง่ายขึ้น</p>
        </div>
      </header>

      <div className="cat-container">
        {/* ส่วนเลือกหมวดหมู่ */}
        <section className="cat-selection-section">
            <div className="cat-grid-large">
                {categoryList.map((cat) => (
                    <button 
                        key={cat.id} 
                        className={`cat-card-large ${activeCategory === cat.name ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat.name)}
                    >
                        <div className="cat-icon-wrapper">{cat.icon}</div>
                        <span>{cat.name}</span>
                    </button>
                ))}
            </div>
        </section>

        {/* ส่วน Toolbar (แสดงจำนวนและปุ่ม Filter) */}
        <div className="results-toolbar">
            <h2>
                {activeCategory === 'ทั้งหมด' ? 'สินค้าทั้งหมด' : `รายการ: ${activeCategory}`} 
                <span className="count-badge">{displayProducts.length}</span>
            </h2>
            
            <div className="filter-tools">
                <div className="tool-wrapper">
                   <button 
                        className={`tool-btn ${activeCategory === 'ทั้งหมด' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('ทั้งหมด')}
                    >
                        <LayoutGrid size={18}/> 
                        ทั้งหมด
                    </button>
                </div>

                <div className="tool-wrapper" ref={filterRef}>
                    <button 
                        className={`tool-btn ${showFilterMenu || (priceFilter.min || priceFilter.max) ? 'active' : ''}`}
                        onClick={() => setShowFilterMenu(!showFilterMenu)}
                    >
                        <SlidersHorizontal size={18}/> 
                        ตัวกรอง {(priceFilter.min || priceFilter.max) && <span className="dot-indicator"></span>}
                    </button>
                    
                    {showFilterMenu && (
                        <div className="dropdown-popup filter-popup">
                            <h4>ช่วงราคา (บาท)</h4>
                            <div className="price-inputs">
                                <input 
                                    type="number" placeholder="ต่ำสุด" 
                                    value={priceFilter.min}
                                    onChange={(e) => setPriceFilter({...priceFilter, min: e.target.value})}
                                />
                                <span>-</span>
                                <input 
                                    type="number" placeholder="สูงสุด" 
                                    value={priceFilter.max}
                                    onChange={(e) => setPriceFilter({...priceFilter, max: e.target.value})}
                                />
                            </div>
                            <div className="filter-actions">
                                <button className="btn-reset" onClick={resetFilter}>ล้างค่า</button>
                                <button className="btn-apply" onClick={() => setShowFilterMenu(false)}>ตกลง</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="tool-wrapper" ref={sortRef}>
                    <button 
                        className={`tool-btn ${showSortMenu ? 'active' : ''}`}
                        onClick={() => setShowSortMenu(!showSortMenu)}
                    >
                        เรียงตาม: {getSortLabel()} <ChevronDown size={16} />
                    </button>

                    {showSortMenu && (
                        <div className="dropdown-popup sort-popup">
                            <button 
                                className={sortOption === 'popular' ? 'selected' : ''} 
                                onClick={() => { setSortOption('popular'); setShowSortMenu(false); }}
                            >
                                ยอดนิยม {sortOption === 'popular' && <Check size={16}/>}
                            </button>
                            <button 
                                className={sortOption === 'price_asc' ? 'selected' : ''} 
                                onClick={() => { setSortOption('price_asc'); setShowSortMenu(false); }}
                            >
                                ราคา: ต่ำ - สูง {sortOption === 'price_asc' && <Check size={16}/>}
                            </button>
                            <button 
                                className={sortOption === 'price_desc' ? 'selected' : ''} 
                                onClick={() => { setSortOption('price_desc'); setShowSortMenu(false); }}
                            >
                                ราคา: สูง - ต่ำ {sortOption === 'price_desc' && <Check size={16}/>}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* ตารางแสดงสินค้า */}
        {loading ? (
             <div className="loading-state">กำลังค้นหาสินค้า...</div>
        ) : (
            displayProducts.length > 0 ? (
                <div className="cat-product-grid">
                    {displayProducts.map((item, index) => {
                        const isFav = favorites[item.name];
                        return (
                            <div key={index} className="product-card-std">
                                <button className={`fav-btn-std ${isFav ? 'active' : ''}`} onClick={() => toggleFav(item)}>
                                    <Heart size={20} fill={isFav ? "#ef4444" : "none"} stroke={isFav ? "#ef4444" : "currentColor"} />
                                </button>
                                <div className="img-wrapper-std">
                                    <img src={item.image || "https://placehold.co/300x300?text=No+Image"} alt={item.name} loading="lazy" />
                                </div>
                                <div className="info-std">
                                    <h3 title={item.name}>{item.name}</h3>
                                    <div className="price-std">{item.price ? `฿${item.price.toLocaleString()}` : 'เช็คราคา'}</div>
                                    <button className="btn-add-std" onClick={() => { setSelectedProduct(item); setIsModalOpen(true); }}>
                                        เพิ่มลงรายการ
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="no-results">
                    <p>ไม่พบสินค้าในหมวดหมู่นี้</p>
                    <button className="btn-reset-all" onClick={() => { setPriceFilter({min:'', max:''}); setActiveCategory('ทั้งหมด'); }}>กลับไปดูสินค้าทั้งหมด</button>
                </div>
            )
        )}
      </div>

      <AddToListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
      />
      <Footer />
    </div>
  );
};

export default Categories;