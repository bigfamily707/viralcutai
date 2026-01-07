import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MockChartData } from '../types';

interface EngagementChartProps {
  data: MockChartData[];
}

const EngagementChart: React.FC<EngagementChartProps> = ({ data }) => {
  return (
    <div className="w-full h-48 mt-4 min-w-[300px]" style={{ width: '100%', height: 192 }}>
      <h3 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Engagement Analysis</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 5,
            right: 0,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="time" hide />
          <YAxis hide />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '8px', color: '#f8fafc' }}
            itemStyle={{ color: '#a78bfa' }}
          />
          <Area type="monotone" dataKey="engagement" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorEngagement)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EngagementChart;