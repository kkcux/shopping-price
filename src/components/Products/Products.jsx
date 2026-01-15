import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../Home/Navbar'; // เปิดใช้ถ้าต้องการ
import Footer from '../Home/Footer';
import './Products.css';
import {
  Heart,
  ChevronDown,
  ChevronLeft, ChevronRight,
  Search, X, LayoutGrid,
  Store,
  Filter, // เพิ่ม icon
  Star,
  Flame,
  Tag
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
  // 🟢 เพิ่ม State สำหรับตัวกรองพิเศษ
  const [specialFilter, setSpecialFilter] = useState('all'); 
  const [showFilterMenu, setShowFilterMenu] = useState(false);

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
  const filterMenuRef = useRef(null); // 🟢 เพิ่ม Ref

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

  // 🟢 รายการตัวกรองพิเศษ
  const specialFiltersList = [
    { id: 'all', label: 'ตัวกรอง', icon: null },
    { id: 'favorites', label: 'สินค้าที่บันทึกไว้', icon: <Heart size={16} fill="#ef4444" stroke="#ef4444" /> },
    { id: 'recommended', label: 'สินค้าแนะนำ', icon: <Star size={16} className="text-yellow-500" /> },
    { id: 'popular', label: 'สินค้ายอดนิยม', icon: <Flame size={16} className="text-orange-500" /> },
    { id: 'promo', label: 'สินค้าโปรโมชั่น', icon: <Tag size={16} className="text-emerald-500" /> },
  ];

  // --- Effects ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setNameFilter(searchTerm);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Click Outside เพื่อปิดเมนู
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (catMenuRef.current && !catMenuRef.current.contains(event.target)) setShowCatMenu(false);
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) setShowFilterMenu(false); // 🟢 เพิ่ม check
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

  // Fetch Data (จำลอง Tag สำหรับ Filter)
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
          .map(line => { 
              try { 
                  const item = JSON.parse(line); 
                  // 🟢 จำลอง Tag เพื่อให้ Filter ทำงานได้
                  const randomVal = Math.random();
                  item.tags = [];
                  if (randomVal > 0.8) item.tags.push('recommended');
                  else if (randomVal > 0.6) item.tags.push('popular');
                  else if (randomVal > 0.4) item.tags.push('promo');
                  return item;
              } catch (e) { return null; } 
          })
          .filter(item => item !== null && item.name);
        setAllProducts(products);
      } catch (error) { console.error("Error loading products:", error); } 
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  // Logic กรองสินค้า (รวม Special Filter)
  useEffect(() => {
    let processed = [...allProducts];

    // 1. Category
    if (activeCategory !== 'ทั้งหมด') {
        const targetCategories = categoryMapping[activeCategory] || [];
        if (targetCategories.length > 0) processed = processed.filter(item => item.category && targetCategories.includes(item.category));
    }

    // 2. Name
    if (nameFilter.trim() !== '') {
        processed = processed.filter(p => 
            p.name && p.name.toLowerCase().includes(nameFilter.toLowerCase())
        );
    }

    // 3. 🟢 Special Filter
    if (specialFilter !== 'all') {
        if (specialFilter === 'favorites') {
            processed = processed.filter(item => favorites[item.name]);
        } else {
            processed = processed.filter(p => p.tags && p.tags.includes(specialFilter));
        }
    }

    setDisplayProducts(processed);
    setCurrentPage(1);
  }, [allProducts, activeCategory, nameFilter, specialFilter, favorites]); // เพิ่ม deps

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
      // (Code เดิมสำหรับการเพิ่มลง List)
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
    setSpecialFilter('all'); // Reset filter ด้วย
  };

  const getSpecialFilterLabel = () => {
    const filter = specialFiltersList.find(f => f.id === specialFilter);
    return filter ? filter.label : 'ตัวกรอง';
  };

  // --- Pagination Logic ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = displayProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(displayProducts.length / itemsPerPage);

  const renderPageButton = (pageNumber) => (
    <button
      key={pageNumber}
      onClick={() => changePage(pageNumber)}
      className={`pagination-btn ${currentPage === pageNumber ? 'active' : ''}`}
    >
      {pageNumber}
    </button>
  );

  const renderPaginationButtons = () => {
    // (Logic เดิม)
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
    if (shouldShowLeftDots) buttons.push(<span key="left-dots" className="pagination-dots">...</span>);
    else for (let i = 2; i < leftSiblingIndex; i++) buttons.push(renderPageButton(i));
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) if (i !== firstPageIndex && i !== lastPageIndex) buttons.push(renderPageButton(i));
    if (shouldShowRightDots) buttons.push(<span key="right-dots" className="pagination-dots">...</span>);
    else for (let i = rightSiblingIndex + 1; i < lastPageIndex; i++) buttons.push(renderPageButton(i));
    buttons.push(renderPageButton(lastPageIndex));
    return buttons;
  };

  return (
    <div className="products-page">
      {/* <Navbar /> */}
      
      <header className="cat-header">
        <div className="cat-header-content">
          {targetListId ? (
            <div style={{marginBottom: '16px', display: 'flex', justifyContent: 'center'}}>
                 <button className="btn-link-action" onClick={() => navigate(-1)} style={{color: '#14532d'}}>
                    <ChevronLeft /> กลับไปที่รายการ
                </button>
            </div>
          ) : null}
          <h1>{targetListId ? 'เพิ่มสินค้าลงรายการ' : 'สินค้าทั้งหมด'}</h1>
          <p>เลือกสินค้าที่คุณต้องการ{targetListId ? 'เพิ่มลงในลิสต์ของคุณ' : 'เพื่อเปรียบเทียบราคา'}</p>
        </div>
      </header>

      <div className="cat-container">
        <div className="results-toolbar">
            <h2>
                {activeCategory === 'ทั้งหมด' ? 'สินค้าทั้งหมด' : activeCategory} 
                <span className="count-badge">{loading ? '...' : displayProducts.length}</span>
            </h2>
            
            <div className="filter-tools">
                {/* 1. Search Bar */}
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
                        <button onClick={clearSearch} className="search-clear-btn"><X size={16} /></button>
                    )}
                </div>

                {/* 2. Category Dropdown */}
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
                                <button key={idx} className={activeCategory === cat ? 'selected' : ''} onClick={() => handleSelectCategory(cat)}>
                                    {cat} 
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* 3. 🟢 Filter Dropdown (เพิ่มส่วนนี้) */}
                <div className="tool-wrapper" ref={filterMenuRef}>
                    <button 
                        className={`tool-btn ${showFilterMenu || specialFilter !== 'all' ? 'active' : ''}`}
                        onClick={() => setShowFilterMenu(!showFilterMenu)}
                        style={{ minWidth: '150px', justifyContent: 'space-between' }}
                    >
                        <span style={{display:'flex', alignItems:'center', gap:'8px'}}>
                            <Filter size={18} />
                            {getSpecialFilterLabel()}
                        </span>
                        <ChevronDown size={16} />
                    </button>

                    {showFilterMenu && (
                        <div className="dropdown-popup" style={{width: '200px'}}>
                            {specialFiltersList.map((filter) => (
                                <button 
                                    key={filter.id}
                                    className={specialFilter === filter.id ? 'selected' : ''} 
                                    onClick={() => {
                                        setSpecialFilter(filter.id);
                                        setShowFilterMenu(false);
                                    }}
                                >
                                    <span style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                        {filter.icon}
                                        {filter.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>

        {/* Product Grid & Loading Logic (เหมือนเดิม) */}
        {loading ? (
             <div className="cat-product-grid">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="product-card-std skeleton-card">
                         <div className="skeleton-img skeleton-pulse"></div>
                         <div className="skeleton-line-long skeleton-pulse"></div>
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
                        <div className="pagination-container">
                            <button onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1} className="pagination-nav-btn">
                                <ChevronLeft size={20} />
                            </button>
                            {renderPaginationButtons()}
                            <button onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages} className="pagination-nav-btn">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="no-results">
                    <p>ไม่พบสินค้าที่คุณค้นหา</p>
                    <button className="btn-reset-all" onClick={() => { setSearchTerm(''); setActiveCategory('ทั้งหมด'); setSpecialFilter('all'); }}>
                        ล้างตัวกรองทั้งหมด
                    </button>
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