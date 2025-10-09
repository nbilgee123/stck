import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

const SnowflakeChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="loading">
        No data available for Snowflake chart
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis 
            dataKey="metric" 
            tick={{ fontSize: 12, fill: '#666' }}
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={{ fontSize: 10, fill: '#999' }}
            tickCount={6}
          />
          <Radar
            name="Performance"
            dataKey="value"
            stroke="#667eea"
            fill="#667eea"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Tooltip 
            formatter={(value, name) => [`${value}/100`, name]}
            labelFormatter={(label) => `${label}:`}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '5px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
      
      <div style={{ textAlign: 'center', marginTop: '1rem', color: '#666' }}>
        <p>Higher scores indicate better performance in each category</p>
      </div>
    </div>
  );
};

export default SnowflakeChart;
