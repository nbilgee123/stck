import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import CompanyDetail from './CompanyDetail';

const Portfolio = ({ portfolio, loading, onRemove }) => {
  const { t } = useLanguage();
  const [selectedCompany, setSelectedCompany] = useState(null);

  if (loading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  if (selectedCompany) {
    return (
      <div>
        <button 
          className="btn btn-secondary"
          onClick={() => setSelectedCompany(null)}
          style={{ marginBottom: '1rem' }}
        >
          ← {t('common.back')} {t('portfolio.title')}
        </button>
        <CompanyDetail companyId={selectedCompany.company.id} />
      </div>
    );
  }

  if (portfolio.length === 0) {
    return (
      <div className="card">
        <h3>{t('portfolio.empty')}</h3>
        <p>{t('portfolio.emptyDescription')}</p>
      </div>
    );
  }

  const totalValue = portfolio.reduce((sum, item) => {
    return sum + (item.shares * item.purchase_price);
  }, 0);

  return (
    <div>
      <div className="card">
        <h2>{t('portfolio.title')}</h2>
        <div className="portfolio-summary">
          <div className="summary-item">
            <span className="summary-label">{t('portfolio.summary.totalCompanies')}:</span>
            <span className="summary-value">{portfolio.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">{t('portfolio.summary.totalInvestment')}:</span>
            <span className="summary-value">₮{totalValue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>{t('portfolio.holdings')}</h3>
        {portfolio.map((item) => (
          <div key={item.id} className="portfolio-item">
            <div className="portfolio-info">
              <div className="portfolio-company">
                <h4>{item.company.name}</h4>
                <span className="company-ticker">{item.company.ticker}</span>
              </div>
              <div className="portfolio-details">
                <div className="detail-row">
                  <span>{t('portfolio.shares')}:</span>
                  <span>{item.shares}</span>
                </div>
                <div className="detail-row">
                  <span>{t('portfolio.purchasePrice')}:</span>
                  <span>₮{item.purchase_price.toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span>{t('portfolio.totalValue')}:</span>
                  <span>₮{(item.shares * item.purchase_price).toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span>{t('portfolio.added')}:</span>
                  <span>{new Date(item.added_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div className="portfolio-actions">
              <button 
                className="btn btn-small"
                onClick={() => setSelectedCompany(item)}
              >
                {t('portfolio.viewAnalysis')}
              </button>
              <button 
                className="btn btn-small btn-danger"
                onClick={() => onRemove(item.id)}
              >
                {t('portfolio.remove')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Portfolio;
