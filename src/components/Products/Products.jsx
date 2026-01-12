import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../Home/Navbar';
import Footer from '../Home/Footer';
import './Products.css';
import {
  Heart,
  ChevronDown,
  ChevronLeft, ChevronRight,
  ArrowLeft,
  Search, X, LayoutGrid,
  Store 
} from 'lucide-react';

import AddToListModal from '../Home/AddToListModal';

const Products = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: targetListId } = useParams(); 

  // --- State ---
  const [activeCategory, setActiveCategory] = useState(
    location.state?.selectedCategory || 'ทั้งหมด'
  );
  const [allProducts, setAllProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [favorites, setFavorites] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [searchTerm, setSearchTerm] = useState(''); 
  const [nameFilter, setNameFilter] = useState('');
  const [showCatMenu, setShowCatMenu] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  const catMenuRef = useRef(null);

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
  const categoriesList = ['ทั้งหมด', ...Object.keys(categoryMapping)];

  // --- Effects ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setNameFilter(searchTerm);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (catMenuRef.current && !catMenuRef.current.contains(event.target)) setShowCatMenu(false);
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
        const lines = text.trim().split('\n'); 
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
    if (nameFilter.trim() !== '') {
        processed = processed.filter(p => 
            p.name && p.name.toLowerCase().includes(nameFilter.toLowerCase())
        );
    }
    setDisplayProducts(processed);
    setCurrentPage(1);
  }, [allProducts, activeCategory, nameFilter]);

  // --- Handlers ---
  const changePage = (newPage) => {
    const totalPages = Math.ceil(displayProducts.length / itemsPerPage);
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

  const handleAddToCart = (item) => {
    if (targetListId) {
      try {
        const allLists = JSON.parse(localStorage.getItem('myLists')) || [];
        const listIndex = allLists.findIndex(l => l.id.toString() === targetListId.toString());

        if (listIndex > -1) {
          const newItem = {
            id: Date.now(),
            name: item.name,
            qty: 1,
            img: item.image,
            price: item.price,
            retailer: item.retailer || 'Unknown' 
          };
          if (!allLists[listIndex].items) allLists[listIndex].items = [];
          allLists[listIndex].items.push(newItem);
          localStorage.setItem('myLists', JSON.stringify(allLists));
          navigate(-1);
        } else {
          alert('ไม่พบรายการนี้ในระบบ');
        }
      } catch (error) {
        console.error("Error adding to list:", error);
        alert('เกิดข้อผิดพลาดในการบันทึก');
      }
    } else {
      setSelectedProduct(item);
      setIsModalOpen(true);
    }
  };

  const handleSelectCategory = (cat) => {
    setActiveCategory(cat);
    setShowCatMenu(false);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setNameFilter('');
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5;
    const totalPages = Math.ceil(displayProducts.length / itemsPerPage);
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

  // Variables for render
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = displayProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(displayProducts.length / itemsPerPage);

  return (
    <div className="products-page">
      {/* <Navbar /> */}
      
      <header className="products-header">
        <div className="products-header-container">
          
          {/* ✅ ปุ่มย้อนกลับ (White Capsule) */}
          {targetListId && (
            <div className="header-back-wrapper">
                <button 
                className="btn-link-action"
                onClick={() => {
                    navigate(-1);
                }}
            >
                <ChevronLeft />
                 กลับไปที่รายการ
            </button>
            </div>
          )}

          <div className="products-header-content">
            <h1>{targetListId ? 'เพิ่มสินค้าลงรายการ' : 'สินค้าทั้งหมด'}</h1>
            <p>เลือกสินค้าที่คุณต้องการ{targetListId ? 'เพิ่มลงในลิสต์ของคุณ' : 'เพื่อเปรียบเทียบราคา'}</p>
          </div>

        </div>
      </header>

      <div className="products-container">
        <div className="results-toolbar">
            <div className="toolbar-left">
                <h2>
                    {activeCategory === 'ทั้งหมด' ? 'สินค้าทั้งหมด' : activeCategory} 
                    <span className="count-badge">{displayProducts.length}</span>
                </h2>
            </div>
            
            <div className="filter-tools">
                <div className="search-wrapper">
                    <Search size={18} className="search-icon" />
                    <input 
                        type="text"
                        placeholder="ค้นหาชื่อสินค้า..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input-field"
                    />
                    {searchTerm && (
                        <button onClick={clearSearch} className="search-clear-btn">
                            <X size={16} />
                        </button>
                    )}
                </div>

                <div className="tool-wrapper" ref={catMenuRef}>
                    <button 
                        className={`tool-btn ${showCatMenu ? 'active' : ''}`}
                        onClick={() => setShowCatMenu(!showCatMenu)}
                    >
                        <LayoutGrid size={18} />
                        <span className="hide-mobile">{activeCategory === 'ทั้งหมด' ? 'หมวดหมู่' : activeCategory}</span>
                        <ChevronDown size={16} />
                    </button>
                    {showCatMenu && (
                        <div className="dropdown-popup cat-menu-popup">
                            {categoriesList.map((cat, idx) => (
                                <button 
                                    key={idx}
                                    className={activeCategory === cat ? 'selected' : ''} 
                                    onClick={() => handleSelectCategory(cat)}
                                >
                                    {cat} 
                                </button>
                            ))}
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
                                        {(item.retailer || item.store) && (
                                            <div className="retailer-info" style={{fontSize: '0.8rem', color:'#6b7280', display:'flex', alignItems:'center', gap:'4px', marginBottom:'4px'}}>
                                                <Store size={12} /> 
                                                {item.retailer || item.store}
                                            </div>
                                        )}
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
                    <p style={{fontSize: '1.2rem', marginBottom: '10px'}}>ไม่พบสินค้าที่ค้นหา</p>
                    <button className="btn-reset-all" onClick={() => { setSearchTerm(''); setActiveCategory('ทั้งหมด'); }}>ดูสินค้าทั้งหมด</button>
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