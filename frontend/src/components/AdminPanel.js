import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import CSVUpload from './CSVUpload';

const AdminPanel = ({ user, onLogout }) => {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStats();
    fetchCompanies();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/admin/stats', {
        withCredentials: true
      });
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('http://localhost:5000/companies');
      setCompanies(response.data);
    } catch (err) {
      setError('Failed to fetch companies: ' + err.message);
    }
  };

  const handleCSVUpload = async (file) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('http://localhost:5000/import_csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });

      setSuccess(`${t('common.success')}: ${response.data.imported_count} бичлэг`);
      fetchStats();
      fetchCompanies();
    } catch (err) {
      setError('CSV импорт амжилтгүй: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCompany = async (companyId) => {
    if (!window.confirm(t('admin.companyManagement.confirmDelete'))) {
      return;
    }

    try {
      await axios.delete('http://localhost:5000/admin/companies', {
        data: { company_id: companyId },
        withCredentials: true
      });
      
      setSuccess('Компани амжилттай устгагдлаа');
      fetchStats();
      fetchCompanies();
    } catch (err) {
      setError('Компани устгах амжилтгүй: ' + (err.response?.data?.error || err.message));
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  return (
    <div>
      <div className="admin-header">
        <div className="admin-info">
          <h2>{t('admin.title')}</h2>
          <p>{t('admin.welcome')}, {user.username}!</p>
        </div>
        <button className="btn btn-secondary" onClick={onLogout}>
          {t('admin.logout')}
        </button>
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

      {stats && (
        <div className="card">
          <h3>{t('admin.stats.title')}</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{stats.company_count}</div>
              <div className="stat-label">{t('admin.stats.companies')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.financial_count}</div>
              <div className="stat-label">{t('admin.stats.financials')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.portfolio_count}</div>
              <div className="stat-label">{t('admin.stats.portfolios')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.recent_imports}</div>
              <div className="stat-label">{t('admin.stats.recentImports')}</div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h3>{t('admin.csvImport.title')}</h3>
        <p>{t('admin.csvImport.description')}</p>
        <CSVUpload onUpload={handleCSVUpload} loading={loading} />
      </div>

      <div className="card">
        <h3>{t('admin.companyManagement.title')}</h3>
        <p>{t('admin.companyManagement.description')}</p>
        
        {companies.length === 0 ? (
          <p>{t('admin.companyManagement.empty')}</p>
        ) : (
          <div className="admin-companies">
            {companies.map((company) => (
              <div key={company.id} className="admin-company-item">
                <div className="company-info">
                  <h4>{company.name}</h4>
                  <span className="ticker">{company.ticker}</span>
                  <span className="sector">{company.sector}</span>
                </div>
                <div className="company-actions">
                  <button 
                    className="btn btn-danger btn-small"
                    onClick={() => handleDeleteCompany(company.id)}
                  >
                    {t('admin.companyManagement.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {stats && stats.sector_stats.length > 0 && (
        <div className="card">
          <h3>{t('admin.sectorDistribution.title')}</h3>
          <div className="sector-stats">
            {stats.sector_stats.map((sector, index) => (
              <div key={index} className="sector-item">
                <span className="sector-name">{sector.sector}</span>
                <div className="sector-bar">
                  <div 
                    className="sector-fill" 
                    style={{ width: `${(sector.count / stats.company_count) * 100}%` }}
                  ></div>
                </div>
                <span className="sector-count">{sector.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
