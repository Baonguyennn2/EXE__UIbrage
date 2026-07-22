import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { RiUser3Fill, RiArrowDownSLine } from 'react-icons/ri';

const API_URL = 'http://localhost:5000/api';

export default function ManualsPage() {
  const [manuals, setManuals] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const navigate = useNavigate();

  const categories = ['Tất cả', 'Cursor AI', 'Codex AI', 'Kiro AI', 'Claude AI', 'ChatGPT'];

  useEffect(() => {
    const fetchManuals = async () => {
      try {
        const res = await axios.get(`${API_URL}/manuals`);
        setManuals(res.data);
      } catch (error) {
        console.error('Failed to fetch manuals:', error);
      }
    };
    fetchManuals();
  }, []);

  const filteredManuals = activeCategory === 'Tất cả' 
    ? manuals 
    : manuals.filter(m => m.category === activeCategory);

  // Group by category for display
  const groupedManuals = filteredManuals.reduce((acc, manual) => {
    if (!acc[manual.category]) acc[manual.category] = [];
    acc[manual.category].push(manual);
    return acc;
  }, {});

  return (
    <div className="manuals-container">
      {/* Navbar */}
      <header className="manuals-header">
        <div className="logo" onClick={() => navigate('/')}>
          <img src="https://i.imgur.com/K30Q8jJ.png" alt="Genz Shop Logo" className="logo-img" />
          <div className="logo-text">
            <strong>Genz Shop</strong>
            <span>OCEAN EDITION</span>
          </div>
        </div>
        <nav className="manuals-nav">
          <a href="#">Cursor AI Pro</a>
          <a href="#">Codex AI</a>
          <a href="#">Claude</a>
          <a href="#">Check usage</a>
          <div className="nav-dropdown">
            <a href="#" className="active">Hướng dẫn <RiArrowDownSLine /></a>
          </div>
          <a href="#">Bảng Xếp Hạng</a>
        </nav>
        <div className="header-actions">
          <button className="lang-btn">VN</button>
          <button className="login-btn" onClick={() => navigate('/login')}>
            <RiUser3Fill /> Đăng nhập
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="manuals-hero">
        <h1 className="hero-title">Hướng dẫn sử dụng sản phẩm</h1>
        <div className="category-filters">
          {categories.map(cat => (
            <button 
              key={cat} 
              className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Content Section */}
      <section className="manuals-content">
        {Object.keys(groupedManuals).length === 0 ? (
          <div className="no-data">Không có hướng dẫn nào trong danh mục này.</div>
        ) : (
          Object.keys(groupedManuals).map(category => (
            <div key={category} className="category-section">
              <h2 className="category-title">{category}</h2>
              <p className="category-subtitle">Danh sách hướng dẫn theo từng mục của {category}</p>
              
              <div className="manual-list">
                {groupedManuals[category].map((manual, index) => (
                  <div key={manual.id} className="manual-card">
                    <div className="manual-card-header">
                      <span className="manual-index">{index + 1}</span>
                      <h3 className="manual-title">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" alt="Notion" className="notion-icon" />
                        {manual.title}
                      </h3>
                    </div>
                    <div className="manual-link-box">
                      <a href={manual.content_url} target="_blank" rel="noreferrer">
                        {manual.content_url}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
