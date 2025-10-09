import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';

const PerformanceChart = () => {
  const { t } = useLanguage();
  const [timePeriod, setTimePeriod] = useState('1Y');

  // Sample performance data
  const performanceData = [
    { date: '2024-01', portfolio: -5.2, sp500: -2.1 },
    { date: '2024-02', portfolio: -3.8, sp500: -1.5 },
    { date: '2024-03', portfolio: -1.2, sp500: 0.8 },
    { date: '2024-04', portfolio: 2.1, sp500: 1.2 },
    { date: '2024-05', portfolio: 4.5, sp500: 2.8 },
    { date: '2024-06', portfolio: 6.8, sp500: 3.2 },
    { date: '2024-07', portfolio: 8.2, sp500: 4.1 },
    { date: '2024-08', portfolio: 9.5, sp500: 3.8 },
    { date: '2024-09', portfolio: 11.2, sp500: 4.5 },
    { date: '2024-10', portfolio: 12.6, sp500: 5.1 },
    { date: '2024-11', portfolio: 14.8, sp500: 5.8 },
    { date: '2024-12', portfolio: 16.2, sp500: 6.2 },
    { date: '2025-01', portfolio: 18.5, sp500: 6.8 },
    { date: '2025-02', portfolio: 20.1, sp500: 7.2 },
    { date: '2025-03', portfolio: 22.3, sp500: 7.8 },
    { date: '2025-04', portfolio: 24.8, sp500: 8.1 },
    { date: '2025-05', portfolio: 26.5, sp500: 8.5 },
    { date: '2025-06', portfolio: 28.2, sp500: 8.8 },
    { date: '2025-07', portfolio: 30.1, sp500: 9.2 },
    { date: '2025-08', portfolio: 32.5, sp500: 9.5 },
    { date: '2025-09', portfolio: 35.2, sp500: 9.8 },
    { date: '2025-10', portfolio: 38.8, sp500: 10.1 }
  ];

  const timePeriods = [
    { key: '7D', label: '7D' },
    { key: '1M', label: '1M' },
    { key: '3M', label: '3M' },
    { key: 'YTD', label: 'YTD' },
    { key: '1Y', label: '1Y' }
  ];

  const formatDate = (dateStr) => {
    const [year, month] = dateStr.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${year.slice(-2)}`;
  };

  // const formatTooltipValue = (value, name) => {
  //   const formattedValue = value > 0 ? `+${value.toFixed(1)}%` : `${value.toFixed(1)}%`;
  //   const label = name === 'portfolio' ? 'Portfolio' : 'S&P 500 (US)';
  //   return [formattedValue, label];
  // };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-date">{formatDate(label)}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name === 'portfolio' ? 'Portfolio' : 'S&P 500 (US)'}: {entry.value > 0 ? '+' : ''}{entry.value.toFixed(1)}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="performance-chart-container">
      <div className="chart-header">
        <div className="chart-title">
          <h3>{t('demo.performanceChart.title')}</h3>
        </div>
        <div className="time-period-selector">
          {timePeriods.map((period) => (
            <button
              key={period.key}
              className={`time-period-btn ${timePeriod === period.key ? 'active' : ''}`}
              onClick={() => setTimePeriod(period.key)}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color portfolio"></div>
          <span>{t('demo.performanceChart.portfolio')}</span>
          <span className="legend-value">12.6%</span>
        </div>
        <div className="legend-item">
          <div className="legend-color sp500"></div>
          <span>{t('demo.performanceChart.sp500')}</span>
          <span className="legend-value">n/a</span>
        </div>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              stroke="#666"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={['dataMin - 5', 'dataMax + 5']}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine 
              x="2025-03" 
              stroke="#667eea" 
              strokeDasharray="2 2"
              label={{ value: "Mar 01", position: "top", fill: "#667eea", fontSize: 12 }}
            />
            <Line
              type="monotone"
              dataKey="portfolio"
              stroke="#44ff44"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 4, fill: "#44ff44", stroke: "#fff", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="sp500"
              stroke="#888"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#888", stroke: "#fff", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-summary">
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-label">{t('demo.performanceChart.unrealizedReturns')}</div>
            <div className="summary-value positive">US$180,466</div>
            <div className="summary-percentage positive">81.9%</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">{t('demo.performanceChart.realizedReturns')}</div>
            <div className="summary-value positive">US$52,591</div>
            <div className="summary-percentage positive">23.9%</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">{t('demo.performanceChart.dividends')}</div>
            <div className="summary-value positive">US$12,046</div>
            <div className="summary-percentage positive">5.5%</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">{t('demo.performanceChart.currencyImpact')}</div>
            <div className="summary-value negative">-US$952</div>
            <div className="summary-percentage negative">-0.4%</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">{t('demo.performanceChart.estimatedDividends')}</div>
            <div className="summary-value positive">US$4,862/yr</div>
            <div className="summary-percentage positive">1.4% Yield</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;
