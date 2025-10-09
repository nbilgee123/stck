import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import SnowflakeChart from './SnowflakeChart';

const CompanyDetail = ({ companyId }) => {
  const { t } = useLanguage();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCompanyDetails();
  }, [companyId]);

  const fetchCompanyDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/company/${companyId}`);
      setCompany(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch company details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!company) {
    return <div className="error">{t('company.title')} олдсонгүй</div>;
  }

  return (
    <div>
      <div className="card">
        <div className="company-header">
          <div>
            <h1 className="company-name">{company.name}</h1>
            <div className="company-ticker" style={{ display: 'inline-block', marginTop: '0.5rem' }}>
              {company.ticker}
            </div>
            <div className="company-sector" style={{ marginTop: '0.5rem' }}>
              Sector: {company.sector}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Snowflake шинжилгээ</h2>
        <p>Компанийн гол гүйцэтгэлийн үзүүлэлтүүдийн цогц шинжилгээ</p>
        <div className="snowflake-container">
          <SnowflakeChart data={company.snowflake_data} />
        </div>
      </div>

      <div className="card">
        <h2>Санхүүгийн үзүүлэлт</h2>
        <div className="metrics-grid">
          <div className="metric-card">
            <h3>{t('metrics.valuation')}</h3>
            <div className="metric-score">{company.metrics.valuation}/100</div>
            <div className="metric-bar">
              <div 
                className="metric-fill" 
                style={{ width: `${company.metrics.valuation}%` }}
              ></div>
            </div>
          </div>
          
          <div className="metric-card">
            <h3>{t('metrics.futureGrowth')}</h3>
            <div className="metric-score">{company.metrics.future_growth}/100</div>
            <div className="metric-bar">
              <div 
                className="metric-fill" 
                style={{ width: `${company.metrics.future_growth}%` }}
              ></div>
            </div>
          </div>
          
          <div className="metric-card">
            <h3>{t('metrics.pastPerformance')}</h3>
            <div className="metric-score">{company.metrics.past_performance}/100</div>
            <div className="metric-bar">
              <div 
                className="metric-fill" 
                style={{ width: `${company.metrics.past_performance}%` }}
              ></div>
            </div>
          </div>
          
          <div className="metric-card">
            <h3>{t('metrics.financialHealth')}</h3>
            <div className="metric-score">{company.metrics.financial_health}/100</div>
            <div className="metric-bar">
              <div 
                className="metric-fill" 
                style={{ width: `${company.metrics.financial_health}%` }}
              ></div>
            </div>
          </div>
          
          <div className="metric-card">
            <h3>{t('metrics.dividendQuality')}</h3>
            <div className="metric-score">{company.metrics.dividend_quality}/100</div>
            <div className="metric-bar">
              <div 
                className="metric-fill" 
                style={{ width: `${company.metrics.dividend_quality}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Санхүүгийн түүх</h2>
        <div className="financial-table">
          <table>
            <thead>
              <tr>
                <th>{t('company.year')}</th>
                <th>{t('company.revenue')}</th>
                <th>{t('company.profit')}</th>
                <th>{t('company.assets')}</th>
                <th>{t('company.liabilities')}</th>
                <th>{t('company.dividends')}</th>
              </tr>
            </thead>
            <tbody>
              {company.financials.map((financial, index) => (
                <tr key={index}>
                  <td>{financial.year}</td>
                  <td>₮{(financial.revenue / 1000000).toFixed(1)}M</td>
                  <td>₮{(financial.profit / 1000000).toFixed(1)}M</td>
                  <td>₮{(financial.assets / 1000000).toFixed(1)}M</td>
                  <td>₮{(financial.liabilities / 1000000).toFixed(1)}M</td>
                  <td>₮{(financial.dividends / 1000000).toFixed(1)}M</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetail;
