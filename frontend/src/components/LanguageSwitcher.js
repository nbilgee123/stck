import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSwitcher = () => {
  const { language, changeLanguage } = useLanguage();

  const handleLanguageChange = (e) => {
    changeLanguage(e.target.value);
  };

  return (
    <div className="language-switcher">
      <select 
        value={language} 
        onChange={handleLanguageChange}
        className="language-select"
      >
        <option value="mn">🇲🇳 Монгол</option>
        <option value="en">🇺🇸 English</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;
