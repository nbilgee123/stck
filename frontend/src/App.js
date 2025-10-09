import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import CompanyList from './components/CompanyList';
// import CompanyDetail from './components/CompanyDetail';
import Portfolio from './components/Portfolio';
import CSVUpload from './components/CSVUpload';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import SnowflakeChart from './components/SnowflakeChart';
import PerformanceChart from './components/PerformanceChart';
import LanguageSwitcher from './components/LanguageSwitcher';
import './App.css';

function AppContent() {
  const [activeTab, setActiveTab] = useState('companies');
  const [companies, setCompanies] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { t } = useLanguage();

  const API_BASE = process.env.NODE_ENV === 'production' 
    ? 'https://mongolian-stocks-api.onrender.com' 
    : 'http://localhost:5000';

  useEffect(() => {
    checkAuthStatus();
    fetchCompanies();
    fetchPortfolio();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE}/auth/status`, {
        withCredentials: true
      });
      if (response.data.authenticated) {
        setUser(response.data.user);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/companies`);
      setCompanies(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch companies: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPortfolio = async () => {
    try {
      const response = await axios.get(`${API_BASE}/portfolio`);
      setPortfolio(response.data);
    } catch (err) {
      console.error('Failed to fetch portfolio:', err);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE}/logout`, {}, {
        withCredentials: true
      });
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setUser(null);
    }
  };

  const handleCSVUpload = async (file) => {
    if (!user || user.role !== 'admin') {
      setError('CSV импорт хийх эрх байхгүй байна. Админ эрхтэй хүн нэвтрэнэ үү.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_BASE}/import_csv`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });

      setSuccess(`Амжилттай импорт хийлээ: ${response.data.imported_count} бичлэг`);
      fetchCompanies(); // Refresh companies list
    } catch (err) {
      setError('CSV импорт амжилтгүй: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPortfolio = async (companyId, shares = 1, purchasePrice = 0) => {
    try {
      await axios.post(`${API_BASE}/portfolio`, {
        company_id: companyId,
        shares: shares,
        purchase_price: purchasePrice
      });
      
      setSuccess('Company added to portfolio successfully');
      fetchPortfolio();
    } catch (err) {
      setError('Failed to add to portfolio: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleRemoveFromPortfolio = async (portfolioId) => {
    try {
      await axios.delete(`${API_BASE}/portfolio/${portfolioId}`);
      setSuccess('Company removed from portfolio successfully');
      fetchPortfolio();
    } catch (err) {
      setError('Failed to remove from portfolio: ' + (err.response?.data?.error || err.message));
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  if (authLoading) {
    return (
      <div className="App">
        <div className="container">
          <div className="loading">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!user) {
    return (
      <div className="App">
        <div className="container">
          <header className="header">
            <div className="header-content">
              <div className="header-top">
                <a href="/" className="logo">
                  <div className="logo-icon">S</div>
                  {t('header.title')}
                </a>
                
                <nav>
                  <ul className="nav-menu">
                    <li className="nav-item"><button className="nav-link">{t('header.nav.dashboard')}</button></li>
                    <li className="nav-item"><button className="nav-link active">{t('header.nav.portfolios')}</button></li>
                    <li className="nav-item"><button className="nav-link">{t('header.nav.watchlist')}</button></li>
                    <li className="nav-item"><button className="nav-link">{t('header.nav.community')}</button></li>
                    <li className="nav-item"><button className="nav-link">{t('header.nav.discover')}</button></li>
                    <li className="nav-item"><button className="nav-link">{t('header.nav.screener')}</button></li>
                  </ul>
                </nav>
                
                <div className="search-box">
                  <span className="search-icon">🔍</span>
                  <input 
                    type="text" 
                    className="search-input" 
                    placeholder={t('header.search.placeholder')}
                  />
                  <div className="search-placeholder">{t('header.search.description')}</div>
                </div>
                
                <div className="header-actions">
                  <LanguageSwitcher />
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setActiveTab('login')}
                  >
                    {t('header.login')}
                  </button>
                </div>
              </div>
              <div className="header-banner">
                <div className="banner-content">
                  <div className="banner-text">
                    {t('header.banner.text')}
                  </div>
                  <button className="banner-button">{t('header.banner.button')}</button>
                </div>
              </div>
            </div>
          </header>

          {activeTab === 'login' ? (
            <Login 
              onLogin={handleLogin} 
              onBack={() => setActiveTab('companies')}
            />
          ) : (
            <div className="main-content">
              <div className="content-wrapper">
                <div className="left-column">
                  {/* Portfolio Header */}
                  <div className="portfolio-header">
                    <div className="portfolio-title">
                      <h1>{t('demo.title')}</h1>
                      <span className="portfolio-badge">📊</span>
                    </div>
                    <div className="portfolio-meta">
                      <span className="update-time">{t('demo.updated')}</span>
                    </div>
                  </div>

                  {/* Portfolio Tabs */}
                  <div className="portfolio-tabs">
                    <button className={`tab ${activeTab === 'companies' ? 'active' : ''}`} onClick={() => setActiveTab('companies')}>
                      {t('demo.tabs.holdings')}
                    </button>
                    <button className={`tab ${activeTab === 'portfolio' ? 'active' : ''}`} onClick={() => setActiveTab('portfolio')}>
                      {t('demo.tabs.returns')}
                    </button>
                    <button className="tab">{t('demo.tabs.narratives')}</button>
                    <button className="tab">
                      {t('demo.tabs.updates')} <span className="badge">10</span>
                    </button>
                    <button className="tab">{t('demo.tabs.dividends')}</button>
                    <button className="tab">{t('demo.tabs.analysis')}</button>
                  </div>

                  {/* Performance Section */}
                  <div className="performance-section">
                    <h2>{t('demo.performance.title')}</h2>
                    <div className="performance-metrics">
                      <div className="metric-card">
                        <div className="metric-value">₮337,954</div>
                        <div className="metric-label">{t('demo.performance.totalValue')} • {companies.length} {t('demo.performance.holdings')}</div>
                      </div>
                      <div className="metric-card">
                        <div className="metric-value">₮244,152</div>
                        <div className="metric-label">{t('demo.performance.totalReturns')} 110.8%</div>
                      </div>
                      <div className="metric-card">
                        <div className="metric-value">24.5%</div>
                        <div className="metric-label">{t('demo.performance.annualised')}</div>
                      </div>
                    </div>
                  </div>

                  {/* Performance Chart */}
                  <PerformanceChart />

                  {/* Tab Content */}
                  <div className="tab-content">
                    {activeTab === 'companies' && (
                      <CompanyList 
                        companies={companies} 
                        loading={loading}
                        onAddToPortfolio={handleAddToPortfolio}
                      />
                    )}
                    
                    {activeTab === 'portfolio' && (
                      <Portfolio 
                        portfolio={portfolio} 
                        loading={loading}
                        onRemove={handleRemoveFromPortfolio}
                      />
                    )}
                  </div>
                </div>

                <div className="right-column">
                  {/* Snowflake Chart */}
                  <div className="snowflake-section">
                    <h3>{t('demo.snowflake.title')} <span className="info-icon">ℹ️</span></h3>
                    <div className="snowflake-container">
                      <SnowflakeChart data={[
                        { metric: t('metrics.valuation'), value: 75 },
                        { metric: t('metrics.futureGrowth'), value: 60 },
                        { metric: t('metrics.pastPerformance'), value: 85 },
                        { metric: t('metrics.financialHealth'), value: 70 },
                        { metric: t('metrics.dividendQuality'), value: 45 }
                      ]} />
                    </div>
                    <div className="snowflake-description">
                      {t('demo.snowflake.description')}
                    </div>
                    <div className="snowflake-stats">
                      <span className="holdings-count">{companies.length} {t('demo.snowflake.holdings')}</span>
                      <div className="performance-indicators">
                        <span className="negative">20</span>
                        <span className="positive">38</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show admin panel if admin user
  if (user.role === 'admin') {
    return (
      <div className="App">
        <div className="container">
          <div className="header">
            <h1>Simply Wall St Demo - Админ</h1>
            <p>Монголын хувьцааны портфолио шинжилгээ</p>
          </div>
          <AdminPanel user={user} onLogout={handleLogout} />
        </div>
      </div>
    );
  }

  // Show regular user interface
  return (
    <div className="App">
      <div className="container">
        <div className="header">
          <h1>Simply Wall St Demo</h1>
          <p>Монголын хувьцааны портфолио шинжилгээ</p>
          <div className="user-info">
            <span>Тавтай морил, {user.username}!</span>
            <button className="btn btn-small btn-secondary" onClick={handleLogout}>
              Гарах
            </button>
          </div>
        </div>

        {error && (
          <div className="error">
            {error}
            <button onClick={clearMessages} style={{ float: 'right', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>×</button>
          </div>
        )}

        {success && (
          <div className="success">
            {success}
            <button onClick={clearMessages} style={{ float: 'right', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>×</button>
          </div>
        )}

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'companies' ? 'active' : ''}`}
            onClick={() => setActiveTab('companies')}
          >
            Компаниуд ({companies.length})
          </button>
          <button 
            className={`tab ${activeTab === 'portfolio' ? 'active' : ''}`}
            onClick={() => setActiveTab('portfolio')}
          >
            Портфолио ({portfolio.length})
          </button>
          {user.role === 'admin' && (
            <button 
              className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              CSV импорт
            </button>
          )}
        </div>

        <div className="tab-content">
          {activeTab === 'companies' && (
            <CompanyList 
              companies={companies} 
              loading={loading}
              onAddToPortfolio={handleAddToPortfolio}
            />
          )}
          
          {activeTab === 'portfolio' && (
            <Portfolio 
              portfolio={portfolio} 
              loading={loading}
              onRemove={handleRemoveFromPortfolio}
            />
          )}
          
          {activeTab === 'upload' && user.role === 'admin' && (
            <CSVUpload 
              onUpload={handleCSVUpload}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
