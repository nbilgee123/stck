import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const CSVUpload = ({ onUpload, loading }) => {
  const { t } = useLanguage();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (file.type === "text/csv" || file.name.endsWith('.csv')) {
          setSelectedFile(file);
        } else {
          alert('CSV файл сонгоно уу');
        }
      }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "text/csv" || file.name.endsWith('.csv')) {
        setSelectedFile(file);
      } else {
        alert('CSV файл сонгоно уу');
      }
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
      setSelectedFile(null);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
  };

  return (
    <div className="card">
      <h2>{t('csv.title')}</h2>
      <p>{t('csv.description')}</p>
      
      <div 
        className={`file-upload ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input').click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        {selectedFile ? (
          <div>
            <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
              📄 {selectedFile.name}
            </div>
            <div style={{ color: '#666', marginBottom: '1rem' }}>
              Хэмжээ: {(selectedFile.size / 1024).toFixed(1)} KB
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                className="btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpload();
                }}
                disabled={loading}
              >
                {loading ? t('csv.uploading') : t('csv.upload')}
              </button>
              <button 
                className="btn btn-secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
              >
                {t('csv.clear')}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
            <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
              {dragActive ? t('csv.dragActive') : t('csv.dragDrop')}
            </div>
            <div style={{ color: '#666' }}>
              Дэмжигдэх формат: CSV файл
            </div>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: '2rem', backgroundColor: '#f8f9fa' }}>
        <h3>{t('csv.format.title')}</h3>
        <p>{t('csv.format.description')}</p>
        <ul style={{ textAlign: 'left', margin: '1rem 0' }}>
          <li><strong>{t('csv.format.columns.company')}</strong></li>
          <li><strong>{t('csv.format.columns.ticker')}</strong></li>
          <li><strong>{t('csv.format.columns.sector')}</strong></li>
          <li><strong>{t('csv.format.columns.year')}</strong></li>
          <li><strong>{t('csv.format.columns.revenue')}</strong></li>
          <li><strong>{t('csv.format.columns.profit')}</strong></li>
          <li><strong>{t('csv.format.columns.assets')}</strong></li>
          <li><strong>{t('csv.format.columns.liabilities')}</strong></li>
          <li><strong>{t('csv.format.columns.dividends')}</strong></li>
        </ul>
        
        <div style={{ marginTop: '1rem' }}>
          <h4>{t('csv.format.example')}:</h4>
          <pre style={{ 
            backgroundColor: '#e9ecef', 
            padding: '1rem', 
            borderRadius: '5px',
            fontSize: '0.9rem',
            overflow: 'auto'
          }}>
{t('csv.format.sample')}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default CSVUpload;
