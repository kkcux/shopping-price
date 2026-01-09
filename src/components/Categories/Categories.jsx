import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../Home/Navbar';
import Footer from '../Home/Footer';
import './Categories.css'; // นำเข้าไฟล์ CSS ที่แยกไว้
import {
  Heart, Check,
  Search,
  ChevronDown,
  ChevronLeft, ChevronRight,
  LayoutGrid,
  Store,
  X
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

  // --- State สำหรับ Filter & Menu ---
  const [showCatMenu, setShowCatMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [nameFilter, setNameFilter] = useState('');
  
  // --- State สำหรับ Pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  const catMenuRef = useRef(null);

  // ตารางจับคู่ชื่อหมวดหมู่
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

  // Debounce Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setNameFilter(searchTerm);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // ปิดเมนูเมื่อคลิกข้างนอก
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (catMenuRef.current && !catMenuRef.current.contains(event.target)) setShowCatMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // โหลด Favorites
  useEffect(() => {
    const savedFavs = JSON.parse(localStorage.getItem('favoritesItems')) || [];
    const favMap = {};
    savedFavs.forEach(item => { if (item.data) favMap[item.data] = true; });
    setFavorites(favMap);
  }, []);

  // โหลดข้อมูลสินค้า
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Start fetching data...");
        const response = await fetch('/data/all_retailers_products_merged_v1.jsonl');
        
        if (!response.ok) throw new Error('Network response was not ok');

        const text = await response.text();
        const lines = text.trim().split('\n');
        
        const products = lines
          .filter(line => line.trim() !== '') 
          .map(line => {
            try { return JSON.parse(line); } catch (e) { return null; }
          })
          .filter(item => item !== null && item.name);

        setAllProducts(products);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Logic กรองสินค้า
  useEffect(() => {
    let processed = [...allProducts];

    // 1. กรองหมวดหมู่
    if (activeCategory !== 'ทั้งหมด') {
        const targetCategories = categoryMapping[activeCategory] || [];
        if (targetCategories.length > 0) {
            processed = processed.filter(item => item.category && targetCategories.includes(item.category));
        }
    }

    // 2. กรองชื่อ
    if (nameFilter.trim() !== '') {
        processed = processed.filter(p => 
            p.name && p.name.toLowerCase().includes(nameFilter.toLowerCase())
        );
    }
    
    setDisplayProducts(processed);
    setCurrentPage(1);
  }, [allProducts, activeCategory, nameFilter]);

  // --- Pagination Logic ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = displayProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(displayProducts.length / itemsPerPage);

  const changePage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // 🟢 เพิ่ม Scroll to Top กลับมาตามคำขอ
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderPaginationButtons = () => {
    const siblingCount = 1;
    const totalPageNumbers = siblingCount + 5;

    if (totalPages <= totalPageNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1).map(page => renderPageButton(page));
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    const buttons = [];

    buttons.push(renderPageButton(firstPageIndex));

    if (shouldShowLeftDots) {
      buttons.push(<span key="left-dots" className="pagination-dots">...</span>);
    } else {
        for (let i = 2; i < leftSiblingIndex; i++) {
            buttons.push(renderPageButton(i));
        }
    }

    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
       if (i !== firstPageIndex && i !== lastPageIndex) {
           buttons.push(renderPageButton(i));
       }
    }

    if (shouldShowRightDots) {
      buttons.push(<span key="right-dots" className="pagination-dots">...</span>);
    } else {
         for (let i = rightSiblingIndex + 1; i < lastPageIndex; i++) {
             buttons.push(renderPageButton(i));
         }
    }

    buttons.push(renderPageButton(lastPageIndex));

    return buttons;
  };

  const renderPageButton = (pageNumber) => (
    <button
      key={pageNumber}
      onClick={() => changePage(pageNumber)}
      className={`pagination-btn ${currentPage === pageNumber ? 'active' : ''}`}
    >
      {pageNumber}
    </button>
  );

  const clearSearch = () => {
      setSearchTerm('');
      setNameFilter('');
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

  const handleSelectCategory = (cat) => {
      setActiveCategory(cat);
      setShowCatMenu(false);
  };

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
        
        <div className="results-toolbar">
            <h2>
                {activeCategory === 'ทั้งหมด' ? 'สินค้าทั้งหมด' : activeCategory} 
                <span className="count-badge">{loading ? '...' : displayProducts.length}</span>
            </h2>
            
            <div className="filter-tools">
                {/* 1. ช่องค้นหา */}
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

                {/* 2. ปุ่มเลือกหมวดหมู่ */}
                <div className="tool-wrapper" ref={catMenuRef}>
                    <button 
                        className={`tool-btn ${showCatMenu ? 'active' : ''}`}
                        onClick={() => setShowCatMenu(!showCatMenu)}
                        style={{ minWidth: '160px', justifyContent: 'space-between' }}
                    >
                        <span style={{display:'flex', alignItems:'center', gap:'8px'}}>
                            <LayoutGrid size={18} />
                            {activeCategory === 'ทั้งหมด' ? 'หมวดหมู่: ทั้งหมด' : activeCategory}
                        </span>
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
                                    {activeCategory === cat && <ChevronDown size={16} style={{transform: 'rotate(-90deg)'}}/>} 
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* ตารางแสดงสินค้า */}
        {loading ? (
             <div className="cat-product-grid">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="product-card-std skeleton-card">
                        <div className="skeleton-img skeleton-pulse"></div>
                        <div className="skeleton-line-long skeleton-pulse"></div>
                        <div className="skeleton-line-short skeleton-pulse"></div>
                    </div>
                ))}
             </div>
        ) : (
            displayProducts.length > 0 ? (
                <>
                    <div className="cat-product-grid">
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
                                            <div className="retailer-info">
                                                <Store size={14} /> 
                                                {item.retailer || item.store}
                                            </div>
                                        )}

                                        <button className="btn-add-std" onClick={() => { setSelectedProduct(item); setIsModalOpen(true); }} style={{marginTop: 'auto'}}>
                                            เพิ่มลงรายการ
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination-container">
                            <button 
                                onClick={() => changePage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="pagination-nav-btn"
                            >
                                <ChevronLeft size={20} />
                            </button>

                            {renderPaginationButtons()}

                            <button 
                                onClick={() => changePage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="pagination-nav-btn"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="no-results">
                    <p>ไม่พบสินค้าที่คุณค้นหา</p>
                    <button className="btn-reset-all" onClick={() => { setSearchTerm(''); setActiveCategory('ทั้งหมด'); }}>
                        ดูสินค้าทั้งหมด
                    </button>
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