import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../Home/Navbar';
import Footer from '../Home/Footer';
import './Categories.css';
import {
  Heart, Search, ChevronDown, ChevronLeft, ChevronRight,
  LayoutGrid, Store, X, Star, Flame, Tag, Filter, Package
} from 'lucide-react';
import AddToListModal from '../Home/AddToListModal';
import AuthRequiredModal from '../Home/AuthRequiredModal';
import { getCategorySlug, categorySlugMap } from '../../utils/categoryMap';
import { useFavorites } from '../../context/FavoritesContext';
import { basePath } from '../../utils/basePath';

const Categories = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState(location.state?.selectedCategory || 'ทั้งหมด');
  const [specialFilter, setSpecialFilter] = useState(location.state?.selectedFilter || 'all'); 
  const [searchTerm, setSearchTerm] = useState(location.state?.searchTerm || ''); 
  
  const [allProducts, setAllProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Use Context
  const { favorites: contextFavorites, isFavorite, toggleFavorite, currentUser } = useFavorites();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [showCatMenu, setShowCatMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false); 
  
  const [nameFilter, setNameFilter] = useState('');
  
  // 🔥 Full Search Index State
  const [fullSearchIndex, setFullSearchIndex] = useState(null);
  const [isSearchingIndex, setIsSearchingIndex] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const catMenuRef = useRef(null);
  const filterMenuRef = useRef(null);

  // Safety check for categorySlugMap
  const safeSlugMap = categorySlugMap || {};
  const categoriesList = ['ทั้งหมด', ...Object.keys(safeSlugMap).filter(k=>k!=='อื่นๆ')];
  
  const specialFiltersList = [
    { id: 'all', label: 'ตัวกรอง', icon: null },
    { id: 'favorites', label: 'สินค้าที่บันทึกไว้', icon: <Heart size={16} fill="#ef4444" stroke="#ef4444" /> },
    { id: 'recommended', label: 'สินค้าแนะนำ', icon: <Star size={16} className="text-yellow-500" /> },
    { id: 'popular', label: 'สินค้ายอดนิยม', icon: <Flame size={16} className="text-orange-500" /> },
    { id: 'promo', label: 'สินค้าโปรโมชั่น', icon: <Tag size={16} className="text-emerald-500" /> },
    { id: 'pack', label: 'สินค้าแพ็ค', icon: <Package size={16} className="text-sky-500" /> },
  ];

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

  // ✅ Fetch Data Logic - Changed to fetch by Category
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setAllProducts([]); // Reset

      try {
        let url = '';
        if (activeCategory === 'ทั้งหมด') {
            url = `${basePath}/data/categories/mixed_products.json`;
        } else {
            const slug = getCategorySlug(activeCategory);
            url = `${basePath}/data/categories/${slug}.json`;
        }

        console.log(`Fetching products for: ${activeCategory} -> ${url}`);
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response not ok');
        
        const data = await response.json();
        
        // Handle different data structures
        let products = [];
        if (Array.isArray(data)) {
            products = data;
        } else if (data.recommended) {
            // it's the home_products structure
            products = [...data.recommended, ...data.popular, ...data.promo];
        }

        // Filter out nulls and ensure basic fields
        const packRegex = /(แพ็ค|แพค|แพ็ก|pack)\b/i;
        products = products
          .filter(item => item && item.name)
          .map(item => {
            const name = item.name || '';
            let tags = Array.isArray(item.tags) ? [...item.tags] : [];

            // ถ้าไม่มีแท็กเลย ให้สุ่ม recommended / popular / promo แบบเดิม
            if (tags.length === 0) {
              const randomVal = Math.random();
              if (randomVal > 0.8) tags.push('recommended');
              else if (randomVal > 0.6) tags.push('popular');
              else if (randomVal > 0.4) tags.push('promo');
            }

            // ถ้าชื่อสินค้าดูเหมือนเป็นแพ็ค ให้ติดแท็ก pack เพิ่ม
            if (packRegex.test(name) && !tags.includes('pack')) {
              tags.push('pack');
            }

            return { ...item, tags };
          });

        setAllProducts(products);

      } catch (error) {
        console.error("Error fetching category data:", error);
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeCategory]); // Re-fetch when category changes

  // ✅ Client-side Filtering (Search / Special Filters)
  // ✅ Client-side Filtering (Search / Special Filters)
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

        // 2. Apply Name Filter
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
  }, [
    allProducts,
    nameFilter,
    specialFilter,
    contextFavorites,
    fullSearchIndex,
    activeCategory,
    isFavorite,
    isSearchingIndex,
  ]);

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
        for (let i = 2; i < leftSiblingIndex; i++) { buttons.push(renderPageButton(i)); }
    }

    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
       if (i !== firstPageIndex && i !== lastPageIndex) { buttons.push(renderPageButton(i)); }
    }

    if (shouldShowRightDots) {
      buttons.push(<span key="right-dots" className="pagination-dots">...</span>);
    } else {
         for (let i = rightSiblingIndex + 1; i < lastPageIndex; i++) { buttons.push(renderPageButton(i)); }
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

  /* Removed local toggleFav */

  const handleSelectCategory = (cat) => {
      setActiveCategory(cat);
      setShowCatMenu(false);
  };

  const getSpecialFilterLabel = () => {
      const filter = specialFiltersList.find(f => f.id === specialFilter);
      return filter ? filter.label : 'ตัวกรอง';
  };

  const handleToggleFavorite = (product) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    toggleFavorite(product);
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
                        <button onClick={clearSearch} className="search-clear-btn">
                            <X size={16} />
                        </button>
                    )}
                </div>

                <div className="filter-dropdown-group">
                    <div className="tool-wrapper" ref={catMenuRef}>
                        <button 
                            className={`tool-btn tool-btn-first ${showCatMenu ? 'active' : ''}`}
                            onClick={() => setShowCatMenu(!showCatMenu)}
                            style={{ justifyContent: 'space-between' }}
                        >
                            <span className="tool-btn-text">
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
                            <span className="tool-btn-text">
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
                        <div className="skeleton-line-short skeleton-pulse"></div>
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
                                    <button className={`fav-btn-std ${isFav ? 'active' : ''}`} onClick={() => handleToggleFavorite(item)}>
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
                    <button className="btn-reset-all" onClick={() => { setSearchTerm(''); setActiveCategory('ทั้งหมด'); setSpecialFilter('all'); }}>
                        ล้างตัวกรองทั้งหมด
                    </button>
                </div>
            )
        )}
      </div>

      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={() => navigate('/login')}
      />
      <AddToListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
      />
      <Footer />
    </div>
  );
};


class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error("Uncaught error:", error, errorInfo); }
  render() {
    if (this.state.hasError) return (
      <div style={{padding:'50px', textAlign:'center', color: '#333'}}>
        <h1>⚠️ พบข้อผิดพลาด</h1>
        <p>ไม่สามารถแสดงผลหน้านี้ได้</p>
        <pre style={{color:'red', background:'#eee', padding:'10px', display:'inline-block', textAlign:'left'}}>
          {this.state.error && this.state.error.toString()}
        </pre>
        <br/><br/>
        <button onClick={() => window.location.href='/'} style={{padding:'10px 20px', cursor:'pointer'}}>กลับหน้าหลัก</button>
      </div>
    );
    return this.props.children;
  }
}

export default function CategoriesWithBoundary() {
    return (
        <ErrorBoundary>
            <Categories />
        </ErrorBoundary>
    );
}