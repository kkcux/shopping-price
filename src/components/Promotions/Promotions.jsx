import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Heart, Plus, Search, LayoutGrid, ListFilter, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../Home/Navbar';
import Footer from '../Home/Footer';
import AddToListModal from '../Home/AddToListModal';
import AuthRequiredModal from '../Home/AuthRequiredModal';
import { useFavorites } from '../../context/FavoritesContext';
import { supabase } from '../../../supabaseClient';
import './Promotions.css';

const sortOptions = [
  { value: 'popular', label: 'สินค้าแนะนำ' },
  { value: 'price-low', label: 'ราคาต่ำสุด' },
  { value: 'price-high', label: 'ราคาสูงสุด' },
];

const Promotions = () => {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite, currentUser } = useFavorites();

  const [promotionProducts, setPromotionProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showStoreMenu, setShowStoreMenu] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const [selectedStore, setSelectedStore] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30; 

  const sortMenuRef = useRef(null);
  const storeMenuRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('promo_products')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3000);

        if (error) throw error;

        const formattedData = (data || []).map((item) => ({
          id: item.id,
          name: item.base_name || 'ไม่มีชื่อสินค้า',
          image: item.image || '',
          store: item.store_name ? item.store_name.toUpperCase() : 'UNKNOWN',
          price: Number(item.price) || 0,
          originalPrice: Number(item.original_price) || undefined,
          createdAt: item.created_at,
          popularity: item.id,
          promotionText: item.promotion 
        }));

        setPromotionProducts(formattedData);
      } catch (err) {
        setError(`โหลดข้อมูลไม่สำเร็จ: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) setShowSortMenu(false);
      if (storeMenuRef.current && !storeMenuRef.current.contains(event.target)) setShowStoreMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayedProducts = useMemo(() => {
    let result = promotionProducts.filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(searchTerm.trim().toLowerCase());
      
      if (selectedStore === 'all') return nameMatch;

      const normalizedTargetStore = selectedStore.toUpperCase().replace(/[^A-Zก-๙]/g, '');
      const normalizedProductStore = p.store.toUpperCase().replace(/[^A-Zก-๙]/g, '');
      
      let storeMatch = normalizedProductStore.includes(normalizedTargetStore);

      if (selectedStore === 'BIGC') {
        storeMatch = storeMatch || normalizedProductStore.includes('บิ๊กซี') || normalizedProductStore.includes('BIGC') || normalizedProductStore.includes('BIG C');
      } else if (selectedStore === 'LOTUS') {
        storeMatch = storeMatch || normalizedProductStore.includes('โลตัส');
      } else if (selectedStore === 'MAKRO') {
        storeMatch = storeMatch || normalizedProductStore.includes('แม็คโคร');
      }
      
      return nameMatch && storeMatch;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === 'latest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return a.popularity - b.popularity;
    });

    return result;
  }, [searchTerm, sortBy, selectedStore, promotionProducts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, selectedStore]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = displayedProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(displayedProducts.length / itemsPerPage);

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

    if (shouldShowLeftDots) buttons.push(<span key="left-dots" className="pagination-dots">...</span>);
    else for (let i = 2; i < leftSiblingIndex; i++) buttons.push(renderPageButton(i));

    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
       if (i !== firstPageIndex && i !== lastPageIndex) buttons.push(renderPageButton(i));
    }

    if (shouldShowRightDots) buttons.push(<span key="right-dots" className="pagination-dots">...</span>);
    else for (let i = rightSiblingIndex + 1; i < lastPageIndex; i++) buttons.push(renderPageButton(i));

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

  const handleToggleFavorite = (product) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    toggleFavorite(product);
  };

  const handleOpenAddModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="promotion-page">
      <Navbar />

      <header className="promotion-hero">
        <div className="promotion-hero-inner">
          <h1>PROMOTION</h1>
          <p>เลือกสินค้าที่มีราคาโปรโมชั่นจากร้านค้าต่าง ๆ ได้จากที่นี่</p>
        </div>
      </header>

      <main className="promotion-main">
        <section className="promotion-toolbar">
          <h2 className="promotion-title">สินค้าทั้งหมด</h2>

          <div className="promotion-controls">
            <div className="promotion-search">
              <Search size={18} />
              <input
                type="text"
                placeholder="ค้นหาสินค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="promotion-dropdown-wrapper" ref={storeMenuRef}>
              <button className="promotion-btn-green" onClick={() => setShowStoreMenu(!showStoreMenu)}>
                <LayoutGrid size={18} />
                <span>ประเภทร้านค้า : {
                  selectedStore === 'all' ? 'ทั้งหมด' : 
                  selectedStore === 'LOTUS' ? 'Lotus' : 
                  selectedStore === 'BIGC' ? 'Big C' : 'Makro'
                }</span>
                <ChevronDown size={16} />
              </button>
              {showStoreMenu && (
                <div className="promotion-menu">
                  <button 
                    className={selectedStore === 'all' ? 'active' : ''}
                    onClick={() => { setSelectedStore('all'); setShowStoreMenu(false); }}
                  >
                    ทั้งหมด
                  </button>
                  <button 
                    className={selectedStore === 'MAKRO' ? 'active' : ''}
                    onClick={() => { setSelectedStore('MAKRO'); setShowStoreMenu(false); }}
                  >
                    Makro
                  </button>
                  <button 
                    className={selectedStore === 'LOTUS' ? 'active' : ''}
                    onClick={() => { setSelectedStore('LOTUS'); setShowStoreMenu(false); }}
                  >
                    Lotus
                  </button>
                  <button 
                    className={selectedStore === 'BIGC' ? 'active' : ''}
                    onClick={() => { setSelectedStore('BIGC'); setShowStoreMenu(false); }}
                  >
                    Big C
                  </button>
                </div>
              )}
            </div>

            <div className="promotion-dropdown-wrapper" ref={sortMenuRef}>
              <button className="promotion-btn-green" onClick={() => setShowSortMenu(!showSortMenu)}>
                <ListFilter size={18} />
                <span>{sortOptions.find(o => o.value === sortBy)?.label}</span>
                <ChevronDown size={16} />
              </button>
              {showSortMenu && (
                <div className="promotion-menu">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      className={sortBy === option.value ? 'active' : ''}
                      onClick={() => { setSortBy(option.value); setShowSortMenu(false); }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {loading ? (
          <p style={{ textAlign: 'center', marginTop: '50px' }}>กำลังโหลดข้อมูลสินค้าโปรโมชั่น...</p>
        ) : error ? (
          <p className="error-text" style={{ textAlign: 'center', color: 'red' }}>{error}</p>
        ) : displayedProducts.length === 0 ? (
          <p style={{ textAlign: 'center', marginTop: '50px' }}>ไม่พบสินค้าที่ค้นหา</p>
        ) : (
          <>
            <div className="promotion-grid">
              {currentItems.map((product) => {
                const favorite = isFavorite(product.name);
                const hasDiscount = product.originalPrice && product.originalPrice > product.price;

                return (
                  <article className="promotion-card" key={product.id}>
                    {/* ✅ ลอจิกแสดงข้อความโปรโมชั่น เอา Inline CSS ออกแล้ว */}
                    {product.promotionText ? (
                      <div className="promotion-discount-badge">
                        {product.promotionText}
                      </div>
                    ) : hasDiscount ? (
                      <div className="promotion-discount-badge">
                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </div>
                    ) : null}

                    <button
                      type="button"
                      className={`fav-btn ${favorite ? 'active' : ''}`}
                      onClick={() => handleToggleFavorite(product)}
                    >
                      <Heart size={20} fill={favorite ? '#ef4444' : 'none'} stroke={favorite ? "#ef4444" : "currentColor"} />
                    </button>

                    <div className="promotion-image-wrap">
                      {product.image ? (
                        <img src={product.image} alt={product.name} loading="lazy" />
                      ) : (
                        <div style={{ width: '100%', height: '150px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           <span style={{ color: '#999' }}>ไม่มีรูป</span>
                        </div>
                      )}
                    </div>

                    <div className="promotion-info">
                      
                      <h4 className="promotion-name">{product.name}</h4>
                      
                      <div className="promotion-price-container">
                        <div className="promotion-price-row">
                          <span className="promotion-currency">฿</span>
                          <span className="promotion-price">{product.price.toLocaleString()}</span>
                        </div>
                        {hasDiscount && (
                          <span className="promotion-original-price">
                            ฿{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <button 
                      type="button" 
                      className="promotion-add-btn" 
                      onClick={() => handleOpenAddModal(product)}
                      style={{ marginTop: 'auto' }}
                    >
                      <Plus size={18} />
                      เพิ่ม
                    </button>
                  </article>
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
        )}
      </main>

      <AddToListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
      />
      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={() => navigate('/login')}
      />
      <Footer />
    </div>
  );
};

export default Promotions;