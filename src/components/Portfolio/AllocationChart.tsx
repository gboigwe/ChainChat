/**
 * Allocation Chart Component
 * Pie/donut chart for asset allocation
 */

import React from 'react';
import { AllocationData } from '../../types/portfolio';
import { formatCurrency } from '../../utils/portfolioCalculations';

interface AllocationChartProps {
  allocation: AllocationData[];
  isLoading?: boolean;
}

const AllocationChart: React.FC<AllocationChartProps> = ({
  allocation,
  isLoading = false,
}) => {
  if (isLoading) {
    return <div className="allocation-chart loading"><div className="skeleton-loader"></div></div>;
  }

  if (allocation.length === 0) {
    return <div className="allocation-chart empty"><p>No allocation data</p></div>;
  }

  const size = 200;
  const center = size / 2;
  const radius = size / 2 - 20;
  const innerRadius = radius * 0.6;

  let currentAngle = -90;
  const paths = allocation.map((item, index) => {
    const angle = (item.percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;

    const path = describeArc(center, center, radius, innerRadius, startAngle, endAngle);
    currentAngle = endAngle;

    const color = item.color || `hsl(${index * (360 / allocation.length)}, 70%, 60%)`;

    return { ...item, path, color };
  });

  return (
    <div className="allocation-chart">
      <h3 className="section-title">Asset Allocation</h3>
      <div className="chart-content">
        <svg width={size} height={size} className="donut-chart">
          {paths.map((item, index) => (
            <path
              key={index}
              d={item.path}
              fill={item.color}
              className="donut-segment"
            />
          ))}
        </svg>

        <div className="allocation-legend">
          {allocation.map((item, index) => (
            <div key={index} className="legend-item">
              <span className="legend-color" style={{ backgroundColor: paths[index].color }} />
              <div className="legend-details">
                <span className="legend-token">{item.token}</span>
                <span className="legend-percentage">{item.percentage.toFixed(1)}%</span>
                <span className="legend-value">{formatCurrency(item.value)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function describeArc(
  x: number,
  y: number,
  radius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const innerStart = polarToCartesian(x, y, innerRadius, endAngle);
  const innerEnd = polarToCartesian(x, y, innerRadius, startAngle);

  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArc, 0, end.x, end.y,
    'L', innerEnd.x, innerEnd.y,
    'A', innerRadius, innerRadius, 0, largeArc, 1, innerStart.x, innerStart.y,
    'Z'
  ].join(' ');
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

export default AllocationChart;
