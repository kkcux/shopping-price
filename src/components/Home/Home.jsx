import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import {
  Search, Plus, Heart, Beef, PackageSearch, Home as HomeIcon,
  Sparkles, Baby, Tv, Hammer, Dog, ChevronLeft, ChevronRight,
  Flame, Star, Tag, LayoutGrid
} from 'lucide-react';

import AddToListModal from './AddToListModal';
import AuthRequiredModal from './AuthRequiredModal';
import { useFavorites } from '../../context/FavoritesContext';
import { supabase } from '../../../supabaseClient'; 

const ProductSection = ({ title, icon, items = [], isFavorite, toggleFav, loading, onAddToCart, onViewAll }) => {
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
            {items && items.length > 0 ? items.map((item, index) => {
              const isFav = isFavorite ? isFavorite(item.name) : false;
              const hasDiscount = item.originalPrice && item.originalPrice > item.price;

              return (
                <div key={item.id || index} className="product-card" style={{ position: 'relative' }}>
                  
                  {/* ✅ เพิ่มป้ายโปรโมชั่นสีแดงที่มุมซ้ายบน สำหรับแถวที่มีข้อมูลนี้ */}
                  {item.promotionText ? (
                    <div style={{ position: 'absolute', top: '8px', left: '8px', background: '#ef4444', color: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', zIndex: 10, whiteSpace: 'nowrap' }}>
                      {item.promotionText}
                    </div>
                  ) : hasDiscount ? (
                    <div style={{ position: 'absolute', top: '8px', left: '8px', background: '#ef4444', color: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', zIndex: 10, whiteSpace: 'nowrap' }}>
                      -{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
                    </div>
                  ) : null}

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
            }) : <div style={{padding: '20px'}}>ไม่พบสินค้า</div>}
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
  const { isFavorite, toggleFavorite, currentUser } = useFavorites();
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [recommended, setRecommended] = useState([]);
  const [popular, setPopular] = useState([]);
  const [promo, setPromo] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);     
  const [showSuggestions, setShowSuggestions] = useState(false); 
  const searchContainerRef = useRef(null); 

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const { data: recData } = await supabase
          .from('products')
          .select('id, base_name, image, price')
          .order('id', { ascending: false })
          .limit(10);

        const { data: popData } = await supabase
          .from('products')
          .select('id, base_name, image, price')
          .order('price', { ascending: true }) 
          .limit(10);

        // ✅ ดึง promotion และ original_price มาด้วย
        const { data: promoData } = await supabase
          .from('promo_products')
          .select('id, base_name, image, price, original_price, promotion')
          .order('created_at', { ascending: false })
          .limit(10);

        const formatProduct = (item) => ({
          id: item.id,
          name: item.base_name || 'ไม่มีชื่อสินค้า',
          image: item.image || '',
          price: Number(item.price) || 0,
        });

        // ✅ Format ข้อมูลโปรโมชั่นแยกต่างหาก เพื่อเก็บ promotionText 
        const formatPromoProduct = (item) => ({
          id: item.id,
          name: item.base_name || 'ไม่มีชื่อสินค้า',
          image: item.image || '',
          price: Number(item.price) || 0,
          originalPrice: Number(item.original_price) || undefined,
          promotionText: item.promotion
        });

        setRecommended((recData || []).map(formatProduct));
        setPopular((popData || []).map(formatProduct));
        setPromo((promoData || []).map(formatPromoProduct));

      } catch (error) {
        console.error("Error fetching data from Supabase:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // ระบบเดาคำค้นหา
  useEffect(() => {
    const fetchSuggestions = setTimeout(async () => {
      const term = searchTerm.trim();
      
      if (term.length > 0) {
        try {
          const searchPattern = `%${term.replace(/\s+/g, '%')}%`;

          const { data, error } = await supabase
            .from('products')
            .select('id, base_name, image')
            .ilike('base_name', searchPattern)
            .limit(6);

          if (error) throw error;

          if (data && data.length > 0) {
            const formatted = data.map(item => ({
              id: item.id,
              name: item.base_name || 'ไม่มีชื่อสินค้า',
              image: item.image || "https://placehold.co/300x300?text=No+Image"
            }));
            
            const uniqueSuggestions = Array.from(new Map(formatted.map(item => [item.name, item])).values());
            
            setSuggestions(uniqueSuggestions);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        } catch (err) {
          console.error("Search suggestion error:", err);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); 

    return () => clearTimeout(fetchSuggestions);
  }, [searchTerm]);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setShowSuggestions(false);
      navigate('/categories', { 
        state: { searchTerm: searchTerm, selectedCategory: 'ทั้งหมด' } 
      });
    }
  };

  const handleSelectSuggestion = (productName) => {
    setSearchTerm(productName);
    setShowSuggestions(false);
    navigate('/categories', { 
        state: { searchTerm: productName, selectedCategory: 'ทั้งหมด' } 
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleViewAll = (filterType) => {
    if (filterType === 'promo') {
        navigate('/promotion');
    } else {
        navigate('/categories', { state: { selectedFilter: filterType, selectedCategory: 'ทั้งหมด' } });
    }
  };

  const categories = [
    { displayName: "อาหารสด & แช่แข็ง", dbName: "อาหารสดและเบเกอรี่", icon: <Beef size={28} /> },
    { displayName: "อาหารแห้ง", dbName: "ของแห้งและเครื่องปรุง", icon: <PackageSearch size={28} /> },
    { displayName: "ของใช้ในบ้าน", dbName: "บ้านและไลฟ์สไตล์", icon: <HomeIcon size={28} /> },
    { displayName: "สุขภาพ & ความงาม", dbName: "ความงามและของใช้ส่วนตัว", icon: <Sparkles size={28} /> },
    { displayName: "แม่และเด็ก", dbName: "แม่และเด็ก", icon: <Baby size={28} /> },
    { displayName: "เครื่องใช้ไฟฟ้า", dbName: "เครื่องใช้ไฟฟ้า อุปกรณ์อิเล็กทรอนิกส์", icon: <Tv size={28} /> },
    { displayName: "เครื่องมือช่าง", dbName: "บ้านและไลฟ์สไตล์", icon: <Hammer size={28} /> }, 
    { displayName: "สัตว์เลี้ยง", dbName: "อาหารและอุปกรณ์สัตว์เลี้ยง", icon: <Dog size={28} /> },
  ];

  const handleCategoryClick = (dbCategoryName) => {
    navigate('/categories', { state: { selectedCategory: dbCategoryName } });
  };

  const handleToggleFavorite = (product) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    toggleFavorite(product);
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
            <strong> 70,000+ </strong>
            รายการ เพื่อดีลที่คุ้มที่สุด
          </p>
          
          <div className="search-container-relative" ref={searchContainerRef}>
            <div className="search-box-wrapper">
              <input 
                  type="text" 
                  placeholder="ค้นหาชื่อสินค้าที่ต้องการ..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  onKeyDown={handleKeyDown}
                  onFocus={() => { if(searchTerm && suggestions.length > 0) setShowSuggestions(true); }}
              />
              <button className="search-btn" onClick={handleSearch}>
                <Search size={22} />
              </button>
            </div>

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
                onClick={() => handleCategoryClick(cat.dbName)}
              >
                <div className="cat-icon-box">{cat.icon}</div>
                <span className="cat-text">{cat.displayName}</span>
              </div>
            ))}
          </div>
        </section>

        <ProductSection
          title="สินค้าโปรโมชั่น"
          icon={<Tag size={24} color="var(--primary)" />}
          items={promo} 
          isFavorite={isFavorite}
          toggleFav={handleToggleFavorite}
          loading={loading}
          onAddToCart={(p) => { setSelectedProduct(p); setIsModalOpen(true); }}
          onViewAll={() => handleViewAll('promo')} 
        />

        <ProductSection
          title="สินค้าแนะนำ"
          icon={<Star size={24} color="var(--primary)" />}
          items={recommended}
          isFavorite={isFavorite}
          toggleFav={handleToggleFavorite}
          loading={loading}
          onAddToCart={(p) => { setSelectedProduct(p); setIsModalOpen(true); }}
          onViewAll={() => handleViewAll('recommended')} 
        />
        
        <ProductSection
          title="สินค้ายอดนิยม"
          icon={<Flame size={24} color="#ea580c" />}
          items={popular}
          isFavorite={isFavorite}
          toggleFav={handleToggleFavorite}
          loading={loading}
          onAddToCart={(p) => { setSelectedProduct(p); setIsModalOpen(true); }}
          onViewAll={() => handleViewAll('popular')} 
        />
      </main>

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
    </div>
  );
};

export default Home;