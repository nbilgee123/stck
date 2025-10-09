import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import CompanyDetail from './CompanyDetail';

const CompanyList = ({ companies, loading, onAddToPortfolio }) => {
  const { t } = useLanguage();
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showAddForm, setShowAddForm] = useState(null);
  const [shares, setShares] = useState(1);
  const [purchasePrice, setPurchasePrice] = useState(0);

  const handleAddToPortfolio = (companyId) => {
    onAddToPortfolio(companyId, shares, purchasePrice);
    setShowAddForm(null);
    setShares(1);
    setPurchasePrice(0);
  };

  if (loading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  if (companies.length === 0) {
    return (
      <div className="card">
        <h3>{t('company.title')} олдсонгүй</h3>
        <p>CSV файл импорт хийж компанийн өгөгдөл аваарай.</p>
      </div>
    );
  }

  if (selectedCompany) {
    return (
      <div>
        <button 
          className="btn btn-secondary"
          onClick={() => setSelectedCompany(null)}
          style={{ marginBottom: '1rem' }}
        >
          ← {t('common.back')} {t('company.title')}
        </button>
        <CompanyDetail companyId={selectedCompany.id} />
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <h2>Companies ({companies.length})</h2>
        <p>Click on a company to view detailed analysis and Snowflake chart.</p>
      </div>

      <div className="grid">
        {companies.map((company) => (
          <div key={company.id} className="company-card">
            <div className="company-header">
              <h3 className="company-name">{company.name}</h3>
              <span className="company-ticker">{company.ticker}</span>
            </div>
            
            <div className="company-sector">{company.sector}</div>
            
            {company.latest_year && (
              <div className="company-metrics">
                <div className="metric">
                  <span className="metric-label">{t('company.year')}:</span>
                  <span className="metric-value">{company.latest_year}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">{t('company.revenue')}:</span>
                  <span className="metric-value">
                    {company.revenue ? `₮${(company.revenue / 1000000).toFixed(1)}M` : 'N/A'}
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">{t('company.profit')}:</span>
                  <span className="metric-value">
                    {company.profit ? `₮${(company.profit / 1000000).toFixed(1)}M` : 'N/A'}
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">{t('company.assets')}:</span>
                  <span className="metric-value">
                    {company.assets ? `₮${(company.assets / 1000000).toFixed(1)}M` : 'N/A'}
                  </span>
                </div>
              </div>
            )}

            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button 
                className="btn btn-small"
                onClick={() => setSelectedCompany(company)}
              >
                {t('company.viewDetails')}
              </button>
              
              {showAddForm === company.id ? (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="number"
                    placeholder={t('company.shares')}
                    value={shares}
                    onChange={(e) => setShares(parseInt(e.target.value) || 1)}
                    style={{ width: '80px', padding: '0.25rem' }}
                    min="1"
                  />
                  <input
                    type="number"
                    placeholder={t('company.price')}
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                    style={{ width: '100px', padding: '0.25rem' }}
                    min="0"
                    step="0.01"
                  />
                  <button 
                    className="btn btn-small"
                    onClick={() => handleAddToPortfolio(company.id)}
                  >
                    {t('company.add')}
                  </button>
                  <button 
                    className="btn btn-small btn-secondary"
                    onClick={() => setShowAddForm(null)}
                  >
                    {t('company.cancel')}
                  </button>
                </div>
              ) : (
                <button 
                  className="btn btn-small btn-secondary"
                  onClick={() => setShowAddForm(company.id)}
                >
                  {t('company.addToPortfolio')}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompanyList;
