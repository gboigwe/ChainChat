/**
 * Performance Chart Component
 * Interactive line chart for portfolio performance visualization
 */

import React, { useState } from 'react';
import { PortfolioSnapshot, TIME_RANGES, TimeRange } from '../../types/portfolio';
import { formatCurrency } from '../../utils/portfolioCalculations';

interface PerformanceChartProps {
  snapshots: PortfolioSnapshot[];
  isLoading?: boolean;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  snapshots,
  isLoading = false,
}) => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>(TIME_RANGES[2]); // 30D default
  const [hoveredPoint, setHoveredPoint] = useState<PortfolioSnapshot | null>(null);

  if (isLoading) {
    return (
      <div className="performance-chart loading">
        <div className="skeleton-loader"></div>
      </div>
    );
  }

  if (snapshots.length === 0) {
    return (
      <div className="performance-chart empty">
        <p>No performance data available</p>
      </div>
    );
  }

  // Filter snapshots based on selected range
  const filteredSnapshots = filterSnapshotsByRange(snapshots, selectedRange);

  // Calculate chart dimensions
  const maxValue = Math.max(...filteredSnapshots.map((s) => s.totalValue));
  const minValue = Math.min(...filteredSnapshots.map((s) => s.totalValue));
  const valueRange = maxValue - minValue;

  // Generate SVG path for line chart
  const chartWidth = 800;
  const chartHeight = 300;
  const padding = 40;

  const xScale = (index: number) =>
    padding + (index / (filteredSnapshots.length - 1)) * (chartWidth - 2 * padding);

  const yScale = (value: number) =>
    chartHeight -
    padding -
    ((value - minValue) / valueRange) * (chartHeight - 2 * padding);

  const pathData = filteredSnapshots
    .map((snapshot, index) => {
      const x = xScale(index);
      const y = yScale(snapshot.totalValue);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <div className="performance-chart">
      <div className="chart-header">
        <h3 className="chart-title">Performance History</h3>
        <div className="time-range-selector">
          {TIME_RANGES.map((range) => (
            <button
              key={range.value}
              className={`range-button ${selectedRange.value === range.value ? 'active' : ''}`}
              onClick={() => setSelectedRange(range)}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {hoveredPoint && (
        <div className="chart-tooltip">
          <p className="tooltip-date">{hoveredPoint.timestamp.toLocaleDateString()}</p>
          <p className="tooltip-value">{formatCurrency(hoveredPoint.totalValue)}</p>
        </div>
      )}

      <div className="chart-container">
        <svg
          width={chartWidth}
          height={chartHeight}
          className="chart-svg"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          {/* Grid lines */}
          <g className="grid-lines">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = chartHeight - padding - ratio * (chartHeight - 2 * padding);
              return (
                <line
                  key={ratio}
                  x1={padding}
                  y1={y}
                  x2={chartWidth - padding}
                  y2={y}
                  stroke="#e0e0e0"
                  strokeWidth="1"
                  strokeDasharray="4"
                />
              );
            })}
          </g>

          {/* Axis labels */}
          <g className="axis-labels">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = chartHeight - padding - ratio * (chartHeight - 2 * padding);
              const value = minValue + ratio * valueRange;
              return (
                <text key={ratio} x={padding - 10} y={y} textAnchor="end" fontSize="12">
                  {formatCurrency(value, 'USD').replace('$', '')}
                </text>
              );
            })}
          </g>

          {/* Area under curve */}
          <path
            d={`${pathData} L ${xScale(filteredSnapshots.length - 1)} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z`}
            fill="url(#gradient)"
            opacity="0.2"
          />

          {/* Line chart */}
          <path
            d={pathData}
            fill="none"
            stroke="#667eea"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {filteredSnapshots.map((snapshot, index) => (
            <circle
              key={index}
              cx={xScale(index)}
              cy={yScale(snapshot.totalValue)}
              r="5"
              fill="#667eea"
              stroke="white"
              strokeWidth="2"
              className="data-point"
              onMouseEnter={() => setHoveredPoint(snapshot)}
            />
          ))}

          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#667eea" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#667eea" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

/**
 * Filter snapshots by time range
 */
function filterSnapshotsByRange(
  snapshots: PortfolioSnapshot[],
  range: TimeRange
): PortfolioSnapshot[] {
  if (range.days === -1) {
    return snapshots; // All time
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - range.days);

  return snapshots.filter((snapshot) => snapshot.timestamp >= cutoffDate);
}

export default PerformanceChart;
