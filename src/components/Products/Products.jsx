import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../Home/Navbar';
import Footer from '../Home/Footer';
import './products.css';
import {
  Heart, Check,
  SlidersHorizontal, ChevronDown,
  ChevronLeft, ChevronRight,
  ArrowLeft
} from 'lucide-react';

import AddToListModal from '../Home/AddToListModal';

const Products = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: targetListId } = useParams(); // ✅ ดึง ID จาก URL (ถ้ามี)

  // --- State หลัก ---
  const [activeCategory, setActiveCategory] = useState(
    location.state?.selectedCategory || 'ทั้งหมด'
  );
  const [allProducts, setAllProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- State Features ---
  const [favorites, setFavorites] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // --- Filter & Sort ---
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [sortOption, setSortOption] = useState('popular');
  const [priceFilter, setPriceFilter] = useState({ min: '', max: '' });

  // --- Pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  const sortRef = useRef(null);
  const filterRef = useRef(null);

  const categoryMapping = {
    "อาหารสด & แช่แข็ง": ["อาหารสดและแช่แข็ง", "ผักและผลไม้", "เบเกอรี่"],
    "อาหารแห้ง": ["อาหารแห้งและเครื่องปรุง", "เครื่องดื่ม"],
    "ของใช้ในบ้าน": ["ของใช้ในบ้าน", "เครื่องเขียนและอุปกรณ์สำนักงาน", "อุปกรณ์สำนักงาน"],
    "สุขภาพ & ความงาม": ["สุขภาพและความงาม", "ของใช้ส่วนตัว", "เสื้อผ้าและเครื่องแต่งกาย"],
    "แม่และเด็ก": ["แม่และเด็ก"],
    "เครื่องใช้ไฟฟ้า": ["เครื่องใช้ไฟฟ้า"],
    "เครื่องมือช่าง": ["เครื่องมือช่างและอุปกรณ์ปรับปรุงบ้าน", "ยานยนต์"],
    "สัตว์เลี้ยง": ["สัตว์เลี้ยง"]
  };

  // ... (useEffect ส่วนอื่นๆ) ...
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) setShowSortMenu(false);
      if (filterRef.current && !filterRef.current.contains(event.target)) setShowFilterMenu(false);
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
        if (!response.ok) throw new Error('Network response was not ok');
        const text = await response.text();
        const lines = text.trim().split('\n').slice(0, 500); 
        const products = lines
          .filter(line => line.trim() !== '') 
          .map(line => { try { return JSON.parse(line); } catch (e) { return null; } })
          .filter(item => item !== null && item.name);
        setAllProducts(products);
      } catch (error) { console.error("Error loading products:", error); } 
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let processed = [...allProducts];
    if (activeCategory !== 'ทั้งหมด') {
        const targetCategories = categoryMapping[activeCategory] || [];
        if (targetCategories.length > 0) processed = processed.filter(item => item.category && targetCategories.includes(item.category));
    }
    if (priceFilter.min !== '') processed = processed.filter(p => (p.price || 0) >= Number(priceFilter.min));
    if (priceFilter.max !== '') processed = processed.filter(p => (p.price || 0) <= Number(priceFilter.max));
    if (sortOption === 'price_asc') processed.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sortOption === 'price_desc') processed.sort((a, b) => (b.price || 0) - (a.price || 0));

    setDisplayProducts(processed);
    setCurrentPage(1);
  }, [allProducts, activeCategory, sortOption, priceFilter]);

  // ... (Pagination Logic) ...
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = displayProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(displayProducts.length / itemsPerPage);

  const changePage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    if (endPage - startPage < maxButtons - 1) startPage = Math.max(1, endPage - maxButtons + 1);
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button key={i} onClick={() => changePage(i)} className={`pagination-number ${currentPage === i ? 'active' : ''}`} style={{width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #e5e7eb', background: currentPage === i ? '#10b981' : 'white', color: currentPage === i ? 'white' : '#374151', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i}</button>
      );
    }
    return buttons;
  };

  const toggleFav = (product) => {
    const productName = product.name;
    setFavorites(prev => {
      const isCurrentlyFav = !!prev[productName];
      const newFavState = { ...prev, [productName]: !isCurrentlyFav };
      const currentSavedFavs = JSON.parse(localStorage.getItem('favoritesItems')) || [];
      let newSavedFavs;
      if (isCurrentlyFav) newSavedFavs = currentSavedFavs.filter(item => item.data !== productName);
      else {
        const alreadyExists = currentSavedFavs.some(item => item.data === productName);
        if (!alreadyExists) newSavedFavs = [...currentSavedFavs, { image: product.image, data: product.name, price: product.price }];
        else newSavedFavs = currentSavedFavs;
      }
      localStorage.setItem('favoritesItems', JSON.stringify(newSavedFavs));
      return newFavState;
    });
  };

  // ✅ ฟังก์ชันจัดการการเพิ่มสินค้า (แก้ไขแล้ว: บันทึกปุ๊บ เด้งกลับปั๊บ)
  const handleAddToCart = (item) => {
    if (targetListId) {
      // 🟢 กรณี 1: มี ID ส่งมา (มาจาก Create/Edit)
      try {
        const allLists = JSON.parse(localStorage.getItem('myLists')) || [];
        const listIndex = allLists.findIndex(l => l.id.toString() === targetListId.toString());

        if (listIndex > -1) {
          // สร้าง object สินค้าใหม่
          const newItem = {
            id: Date.now(), // สร้าง ID ให้สินค้าในลิสต์
            name: item.name,
            qty: 1, // เริ่มต้น 1 ชิ้น
            img: item.image,
            price: item.price,
            retailer: item.retailer || 'Unknown' 
          };

          // เพิ่มลงใน Array items ของลิสต์นั้น
          if (!allLists[listIndex].items) allLists[listIndex].items = [];
          allLists[listIndex].items.push(newItem);

          // บันทึกกลับ LocalStorage
          localStorage.setItem('myLists', JSON.stringify(allLists));

          // ✨ เด้งกลับไปหน้าก่อนหน้าทันที (Create/Edit)
          navigate(-1);
          
        } else {
          alert('ไม่พบรายการนี้ในระบบ');
        }
      } catch (error) {
        console.error("Error adding to list:", error);
        alert('เกิดข้อผิดพลาดในการบันทึก');
      }

    } else {
      // 🔵 กรณี 2: ไม่มี ID (หน้าปกติ) -> เปิด Modal เลือก List
      setSelectedProduct(item);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="products-page">
      <Navbar />
      
      {/* ถ้ามาจากหน้า Edit/Create แสดงปุ่มย้อนกลับแบบชัดเจน */}
      {targetListId && (
        <div style={{ padding: '10px 24px', background: '#ecfdf5' }}>
            <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '5px', border: 'none', background: 'transparent', color: '#10b981', cursor: 'pointer', fontWeight: '600' }}>
                <ArrowLeft size={20} /> กลับไปที่รายการ
            </button>
        </div>
      )}

      <header className="products-header">
        <div className="products-header-content">
          <h1>{targetListId ? 'เพิ่มสินค้าลงรายการ' : 'หมวดหมู่สินค้า'}</h1>
          <p>เลือกสินค้าที่คุณต้องการ{targetListId ? 'เพิ่มลงในลิสต์ของคุณ' : 'เพื่อเปรียบเทียบราคา'}</p>
        </div>
      </header>

      <div className="products-container">
        
        <div className="results-toolbar">
            <h2>
                {activeCategory === 'ทั้งหมด' ? 'สินค้าทั้งหมด' : `รายการ: ${activeCategory}`} 
                <span className="count-badge">{displayProducts.length}</span>
            </h2>
            
            <div className="filter-tools">
                <div className="tool-wrapper" ref={filterRef}>
                    <button className={`tool-btn ${showFilterMenu || (priceFilter.min || priceFilter.max) ? 'active' : ''}`} onClick={() => setShowFilterMenu(!showFilterMenu)}>
                        <SlidersHorizontal size={18}/> ตัวกรอง {(priceFilter.min || priceFilter.max) && <span className="dot-indicator"></span>}
                    </button>
                    {showFilterMenu && (
                        <div className="dropdown-popup filter-popup">
                            <h4>ช่วงราคา (บาท)</h4>
                            <div className="price-inputs">
                                <input type="number" placeholder="ต่ำสุด" value={priceFilter.min} onChange={(e) => setPriceFilter({...priceFilter, min: e.target.value})}/>
                                <span>-</span>
                                <input type="number" placeholder="สูงสุด" value={priceFilter.max} onChange={(e) => setPriceFilter({...priceFilter, max: e.target.value})}/>
                            </div>
                            <div className="filter-actions">
                                <button className="btn-reset" onClick={() => { setPriceFilter({ min: '', max: '' }); setShowFilterMenu(false); }}>ล้างค่า</button>
                                <button className="btn-apply" onClick={() => setShowFilterMenu(false)}>ตกลง</button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="tool-wrapper" ref={sortRef}>
                    <button className={`tool-btn ${showSortMenu ? 'active' : ''}`} onClick={() => setShowSortMenu(!showSortMenu)}>
                        เรียงตาม: {sortOption === 'price_asc' ? 'ราคา: ต่ำ - สูง' : sortOption === 'price_desc' ? 'ราคา: สูง - ต่ำ' : 'ยอดนิยม'} <ChevronDown size={16} />
                    </button>
                    {showSortMenu && (
                        <div className="dropdown-popup sort-popup">
                            <button className={sortOption === 'popular' ? 'selected' : ''} onClick={() => { setSortOption('popular'); setShowSortMenu(false); }}>ยอดนิยม {sortOption === 'popular' && <Check size={16}/>}</button>
                            <button className={sortOption === 'price_asc' ? 'selected' : ''} onClick={() => { setSortOption('price_asc'); setShowSortMenu(false); }}>ราคา: ต่ำ - สูง {sortOption === 'price_asc' && <Check size={16}/>}</button>
                            <button className={sortOption === 'price_desc' ? 'selected' : ''} onClick={() => { setSortOption('price_desc'); setShowSortMenu(false); }}>ราคา: สูง - ต่ำ {sortOption === 'price_desc' && <Check size={16}/>}</button>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {loading ? <div className="loading-state">กำลังค้นหาสินค้า...</div> : (
            displayProducts.length > 0 ? (
                <>
                    <div className="products-grid">
                        {currentItems.map((item, index) => { 
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
                                        {/* ✅ เรียกใช้ handleAddToCart */}
                                        <button 
                                            className="btn-add-std" 
                                            onClick={() => handleAddToCart(item)} 
                                            style={{marginTop: 'auto'}}
                                        >
                                            {targetListId ? 'เพิ่มเลย +' : 'เพิ่มลงรายการ'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '40px', padding: '20px' }}>
                            <button onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #e5e7eb', background: 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={20} /></button>
                            {renderPaginationButtons()}
                            <button onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #e5e7eb', background: 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={20} /></button>
                        </div>
                    )}
                </>
            ) : (
                <div className="no-results">
                    <p style={{fontSize: '1.2rem', marginBottom: '10px'}}>ไม่พบสินค้าในหมวดหมู่นี้</p>
                    <button className="btn-reset-all" onClick={() => { setPriceFilter({min:'', max:''}); setActiveCategory('ทั้งหมด'); }}>กลับไปดูสินค้าทั้งหมด</button>
                </div>
            )
        )}
      </div>

      <AddToListModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} product={selectedProduct} />
      <Footer />
    </div>
  );
};

export default Products;