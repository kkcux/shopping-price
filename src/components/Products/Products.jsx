import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
// import Navbar from '../Home/Navbar'; 
import Footer from '../Home/Footer';
import './Products.css';
import {
  Heart, ChevronDown, ChevronLeft, ChevronRight,
  Search, X, LayoutGrid, Store, Filter, Star, Flame, Tag, CheckCircle2, Plus
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast'; // ✅ Import Toast

import AddToListModal from '../Home/AddToListModal';
import { getCategorySlug, categorySlugMap } from '../../utils/categoryMap';
import { useFavorites } from '../../context/FavoritesContext';
import { basePath } from '../../utils/basePath';

const Products = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // ✅ รับ ID เป้าหมายจาก URL (ถ้ามี)
  const { id: targetListId } = useParams();

  // --- State ---
  const [activeCategory, setActiveCategory] = useState(
    location.state?.selectedCategory || 'ทั้งหมด'
  );
  const [specialFilter, setSpecialFilter] = useState('all'); 
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const [allProducts, setAllProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Use Context
  const { favorites: contextFavorites, isFavorite, toggleFavorite } = useFavorites();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [searchTerm, setSearchTerm] = useState(''); 
  const [nameFilter, setNameFilter] = useState('');
  const [showCatMenu, setShowCatMenu] = useState(false);

  // 🔥 Full Search Index State
  const [fullSearchIndex, setFullSearchIndex] = useState(null);
  const [isSearchingIndex, setIsSearchingIndex] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  const catMenuRef = useRef(null);
  const filterMenuRef = useRef(null);

  /* 
  const categoryMapping = {
    "อาหารสด & แช่แข็ง": ["อาหารสดและแช่แข็ง", "ผักและผลไม้", "เบเกอรี่"],
     ...
  };
  */
  // Use shared mapping
  const categoriesList = ['ทั้งหมด', ...Object.keys(categorySlugMap).filter(k=>k!=='อื่นๆ')];

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (catMenuRef.current && !catMenuRef.current.contains(event.target)) setShowCatMenu(false);
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) setShowFilterMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* Removed local favorites effect */

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setAllProducts([]); 

      try {
        let url = '';
        if (activeCategory === 'ทั้งหมด') {
            url = `${basePath}/data/categories/mixed_products.json`;
        } else {
            const slug = getCategorySlug(activeCategory);
            url = `${basePath}/data/categories/${slug}.json`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        let products = [];
        if (Array.isArray(data)) {
            products = data;
        } else if (data.recommended) {
            products = [...data.recommended, ...data.popular, ...data.promo];
        }

        // Filter out nulls and ensure basic fields
        products = products.filter(item => item && item.name).map(item => {
            if(!item.tags) {
                const randomVal = Math.random();
                item.tags = [];
                if (randomVal > 0.8) item.tags.push('recommended');
                else if (randomVal > 0.6) item.tags.push('popular');
                else if (randomVal > 0.4) item.tags.push('promo');
            }
            return item;
        });

        setAllProducts(products);
      } catch (error) { console.error("Error loading products:", error); } 
      finally { setLoading(false); }
    };
    fetchData();
  }, [activeCategory]);

  useEffect(() => {
    const processData = async () => {
        let processed = [];

        // 1. Determine Source Data
        if (activeCategory === 'ทั้งหมด' && nameFilter.trim() !== '') {
            // Priority: Use Full Index if available
            if (fullSearchIndex) {
                 const PREFIX = "https://st.bigc-cs.com/cdn-cgi/image/format=webp,quality=85/public/media/catalog/product/";
                 processed = fullSearchIndex.map(p => ({
                     name: p.n,
                     price: p.p,
                     image: p.i ? p.i.replace('{|}', PREFIX) : null,
                     category: p.c,
                     retailer: p.r,
                     tags: [] 
                 }));
            } else {
                // Fallback to loaded 2000 items while loading index
                processed = [...allProducts];
                // Trigger lazy load if not started
                if (!isSearchingIndex) {
                    setIsSearchingIndex(true);
                    fetch(`${basePath}/data/categories/all_products_lite.json`)
                        .then(res => res.json())
                        .then(data => {
                            setFullSearchIndex(data);
                            setIsSearchingIndex(false);
                        })
                        .catch(err => {
                            console.error("Failed to load search index", err);
                            setIsSearchingIndex(false);
                        });
                }
            }
        } else {
             processed = [...allProducts];
        }

        // 2. Search Filter
        if (nameFilter.trim() !== '') {
            processed = processed.filter(p => 
                p.name && p.name.toLowerCase().includes(nameFilter.toLowerCase())
            );
        }

        // 3. Special Filters
        if (specialFilter !== 'all') {
            if (specialFilter === 'favorites') {
                processed = processed.filter(item => isFavorite(item.name));
            } else {
                processed = processed.filter(p => p.tags && p.tags.includes(specialFilter));
            }
        }

        setDisplayProducts(processed);
        setCurrentPage(1);
    };

    processData();
  }, [allProducts, nameFilter, specialFilter, contextFavorites, fullSearchIndex]);

  // --- Handlers ---
  const changePage = (newPage) => {
    const totalPages = Math.ceil(displayProducts.length / itemsPerPage);
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /* Removed local toggleFav */

  // ✅ ฟังก์ชันเพิ่มสินค้า (แก้ไขให้รองรับ temp_editing)
  const handleAddToCart = (item) => {
    if (targetListId) {
      try {
        const newItem = {
          name: item.name,
          qty: 1,
          img: item.image,
          price: item.price,
          retailer: item.retailer || 'Unknown' 
        };

        // 🟢 สร้าง Key ชั่วคราวตาม ID ที่ส่งมา
        const TEMP_KEY = `temp_editing_${targetListId}`;
        const tempString = localStorage.getItem(TEMP_KEY);

        if (tempString) {
            // A. เจอของที่ฝากไว้ (จากหน้า Edit)
            const tempData = JSON.parse(tempString);
            
            // เช็คว่ามีของซ้ำไหม
            const existingIndex = tempData.items.findIndex(i => i.name === item.name);
            if (existingIndex > -1) {
                tempData.items[existingIndex].qty += 1;
            } else {
                tempData.items.push(newItem);
            }

            // บันทึกกลับลงกล่อง
            localStorage.setItem(TEMP_KEY, JSON.stringify(tempData));
            
            // กลับไปหน้า Edit ทันที
            navigate(-1);

        } else if (targetListId === 'new') {
            // B. สร้างรายการใหม่ (Create Flow)
            const draftString = localStorage.getItem('current_draft');
            const draft = draftString ? JSON.parse(draftString) : { items: [] };
            
            const existingIndex = draft.items.findIndex(i => i.name === item.name);
            if (existingIndex > -1) draft.items[existingIndex].qty += 1;
            else draft.items.push(newItem);

            localStorage.setItem('current_draft', JSON.stringify(draft));
            navigate(-1);

        } else {
            // C. กรณีอื่นๆ (Fallback: เพิ่มลง DB ตรงๆ หรือแจ้งเตือน)
            // ถ้า User ไม่ได้กด Edit เข้ามา แต่กด URL เข้ามาตรงๆ อาจจะให้แจ้งเตือน
            // หรือถ้าจะให้เพิ่มลง LocalStorage เลยก็ได้ แต่ตาม Flow ควรมีกล่องฝาก
            alert('ไม่พบข้อมูลการแก้ไข (Session Expired) กรุณากลับไปหน้าแก้ไขแล้วลองใหม่');
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
    setSpecialFilter('all');
  };

  const getSpecialFilterLabel = () => {
    const filter = specialFiltersList.find(f => f.id === specialFilter);
    return filter ? filter.label : 'ตัวกรอง';
  };

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
            <div style={{marginBottom: '16px', display: 'flex', justifyContent: 'flex-start'}}>
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
            </h2>
            
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
                        <button onClick={clearSearch} className="search-clear-btn"><X size={16} /></button>
                    )}
                </div>

                <div className="filter-dropdown-group">
                    <div className="tool-wrapper" ref={catMenuRef}>
                        <button 
                            className={`tool-btn tool-btn-first ${showCatMenu ? 'active' : ''}`}
                            onClick={() => setShowCatMenu(!showCatMenu)}
                            style={{ justifyContent: 'space-between' }}
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

                    <div className="tool-wrapper" ref={filterMenuRef}>
                        <button 
                            className={`tool-btn tool-btn-last ${showFilterMenu || specialFilter !== 'all' ? 'active' : ''}`}
                            onClick={() => setShowFilterMenu(!showFilterMenu)}
                            style={{ justifyContent: 'space-between' }}
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
        </div>

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
                            const isFav = isFavorite(item.name);
                            return (
                                <div key={index} className="product-card-std">
                                    <button className={`fav-btn-std ${isFav ? 'active' : ''}`} onClick={() => toggleFavorite(item)}>
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
                                            {targetListId ? (
                                              <>
                                                <Plus size={18} />
                                                เพิ่มเลย
                                              </>
                                            ) : (
                                              'เพิ่มลงรายการ'
                                            )}
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