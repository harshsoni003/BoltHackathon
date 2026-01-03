import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartDataPoint } from '@/services/analyticsService';
import { motion } from 'framer-motion';

interface AnalyticsChartProps {
  data: ChartDataPoint[];
  topDate: { date: string; numberOfCalls: number };
  isLoading?: boolean;
}

const AnalyticsChart = ({ data, topDate, isLoading }: AnalyticsChartProps) => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="h-80 border-gray-100 rounded-xl shadow-sm">
            <div className="p-6 space-y-4">
              <div className="animate-pulse h-6 w-40 bg-gray-100 rounded"></div>
              <div className="animate-pulse h-48 bg-gray-50 rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="h-80 rounded-xl border-dashed border-2 flex items-center justify-center bg-gray-50/50">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-500">No session data available yet</p>
        </div>
      </Card>
    );
  }

  const maxCalls = Math.max(...data.map(d => d.calls), 1);
  const minCalls = Math.min(...data.map(d => d.calls), 0);
  const callRange = maxCalls - minCalls;

  const generatePath = (dataPoints: ChartDataPoint[]) => {
    if (dataPoints.length < 2) return `M0,100 L100,100`;
    const points = dataPoints.map((point, index) => {
      const x = (index / (dataPoints.length - 1)) * 100;
      const y = 85 - ((point.calls - minCalls) / callRange) * 70;
      return `${x},${y}`;
    });
    return `M${points.join('L')}`;
  };

  const generateFillPath = (dataPoints: ChartDataPoint[]) => {
    if (dataPoints.length < 2) return `M0,100 L100,100 Z`;
    const points = dataPoints.map((point, index) => {
      const x = (index / (dataPoints.length - 1)) * 100;
      const y = 85 - ((point.calls - minCalls) / callRange) * 70;
      return `${x},${y}`;
    });
    return `M0,85 L${points.join('L')} L100,85 Z`;
  };

  const getPointCoordinates = (index: number, value: number) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 85 - ((value - minCalls) / callRange) * 70;
    return { x, y };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Call Engagement */}
      <Card className="rounded-xl border border-gray-200 shadow-sm bg-white overflow-hidden">
        <CardHeader className="p-5 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-gray-900">Call Engagement</CardTitle>
            {topDate.numberOfCalls > 0 && (
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                PEAK: {topDate.numberOfCalls} calls
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <div className="h-64 w-full relative">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="overflow-visible">
              <defs>
                <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line
                  key={i}
                  x1="0"
                  y1={15 + i * 17.5}
                  x2="100"
                  y2={15 + i * 17.5}
                  stroke="#e5e7eb"
                  strokeWidth="0.3"
                  strokeDasharray="2,2"
                />
              ))}

              {/* Area fill */}
              <path d={generateFillPath(data)} fill="url(#blueGradient)" />

              {/* Line */}
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                d={generatePath(data)}
                stroke="rgb(59, 130, 246)"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {data.map((point, i) => {
                const { x, y } = getPointCoordinates(i, point.calls);
                return (
                  <g key={i}>
                    <motion.circle
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 * i, duration: 0.3 }}
                      cx={x}
                      cy={y}
                      r={hoveredPoint === i ? "2" : "1.5"}
                      fill="white"
                      stroke="rgb(59, 130, 246)"
                      strokeWidth="2"
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setHoveredPoint(i)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                    {hoveredPoint === i && (
                      <g>
                        <rect
                          x={x - 8}
                          y={y - 12}
                          width="16"
                          height="8"
                          fill="rgb(59, 130, 246)"
                          rx="2"
                        />
                        <text
                          x={x}
                          y={y - 6}
                          textAnchor="middle"
                          fill="white"
                          fontSize="4"
                          fontWeight="bold"
                        >
                          {point.calls}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* X-axis labels */}
            <div className="flex justify-between mt-3">
              {data.map((p, i) => (
                <span key={i} className="text-[10px] text-gray-400 font-medium">
                  {new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Rate */}
      <Card className="rounded-xl border border-gray-200 shadow-sm bg-white overflow-hidden">
        <CardHeader className="p-5 pb-3 border-b border-gray-100">
          <CardTitle className="text-base font-bold text-gray-900">Outcome Precision</CardTitle>
          <p className="text-xs text-gray-500 mt-1">Call success metrics over time</p>
        </CardHeader>
        <CardContent className="p-5">
          <div className="h-64 w-full relative">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="overflow-visible">
              <defs>
                <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line
                  key={i}
                  x1="0"
                  y1={15 + i * 17.5}
                  x2="100"
                  y2={15 + i * 17.5}
                  stroke="#e5e7eb"
                  strokeWidth="0.3"
                  strokeDasharray="2,2"
                />
              ))}

              {/* Area fill */}
              <path
                d={data.map((p, i) => {
                  const x = (i / (data.length - 1)) * 100;
                  const y = 85 - (p.successRate / 100) * 70;
                  return i === 0 ? `M0,85 L${x},${y}` : `L${x},${y}`;
                }).join('') + ' L100,85 Z'}
                fill="url(#greenGradient)"
              />

              {/* Line */}
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 0.2, ease: "easeInOut" }}
                d={data.map((p, i) => {
                  const x = (i / (data.length - 1)) * 100;
                  const y = 85 - (p.successRate / 100) * 70;
                  return i === 0 ? `M${x},${y}` : `L${x},${y}`;
                }).join('')}
                stroke="rgb(16, 185, 129)"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {data.map((point, i) => {
                const x = (i / (data.length - 1)) * 100;
                const y = 85 - (point.successRate / 100) * 70;
                return (
                  <g key={i}>
                    <motion.circle
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 * i + 0.2, duration: 0.3 }}
                      cx={x}
                      cy={y}
                      r={hoveredPoint === i ? "2" : "1.5"}
                      fill="white"
                      stroke="rgb(16, 185, 129)"
                      strokeWidth="2"
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setHoveredPoint(i)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                    {hoveredPoint === i && (
                      <g>
                        <rect
                          x={x - 8}
                          y={y - 12}
                          width="16"
                          height="8"
                          fill="rgb(16, 185, 129)"
                          rx="2"
                        />
                        <text
                          x={x}
                          y={y - 6}
                          textAnchor="middle"
                          fill="white"
                          fontSize="4"
                          fontWeight="bold"
                        >
                          {point.successRate}%
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Summary stats */}
            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-gray-100 pt-4">
              <div className="text-center">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Resolution</p>
                <p className="text-base font-bold text-gray-900 mt-1">High</p>
              </div>
              <div className="text-center border-x border-gray-100">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Efficiency</p>
                <p className="text-base font-bold text-gray-900 mt-1">
                  {Math.round(data.reduce((acc, d) => acc + d.successRate, 0) / data.length)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Stability</p>
                <p className="text-base font-bold text-gray-900 mt-1">Ultra</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsChart;