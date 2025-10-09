import React, { useState } from 'react';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';

const Login = ({ onLogin, onBack }) => {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/login', {
        username,
        password
      }, {
        withCredentials: true
      });

      if (response.data.status === 'success') {
        onLogin(response.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>{t('login.title')}</h2>
          {onBack && (
            <button 
              className="btn btn-secondary btn-small"
              onClick={onBack}
            >
              {t('login.back')}
            </button>
          )}
        </div>
        <p>{t('login.description')}</p>
        
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">{t('login.username')}:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder={t('login.usernamePlaceholder')}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">{t('login.password')}:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={t('login.passwordPlaceholder')}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn"
            disabled={loading}
          >
            {loading ? t('login.loggingIn') : t('login.login')}
          </button>
        </form>
        
        <div className="login-info">
          <p><strong>{t('login.example')}:</strong></p>
          <p>{t('login.username')}: <code>{t('login.usernamePlaceholder')}</code></p>
          <p>{t('login.password')}: <code>{t('login.passwordPlaceholder')}</code></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
