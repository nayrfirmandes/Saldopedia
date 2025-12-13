"use client";

import { memo, useMemo } from 'react';

interface SparklineProps {
  change: number;
  className?: string;
}

function Sparkline({ change, className = '' }: SparklineProps) {
  const isPositive = change >= 0;
  const color = isPositive ? '#22c55e' : '#ef4444';
  
  const points = useMemo(() => {
    const seed = Math.abs(change * 1000) % 100;
    const pts: number[] = [];
    const volatility = Math.min(Math.abs(change) * 2, 30);
    
    for (let i = 0; i < 12; i++) {
      const noise = Math.sin(seed + i * 0.8) * volatility;
      const trend = isPositive ? (i / 11) * 20 : ((11 - i) / 11) * 20;
      pts.push(50 + noise + (isPositive ? trend - 10 : -trend + 10));
    }
    return pts;
  }, [change, isPositive]);

  const pathD = useMemo(() => {
    const width = 80;
    const height = 32;
    const stepX = width / (points.length - 1);
    
    let d = `M 0 ${height - (points[0] / 100) * height}`;
    for (let i = 1; i < points.length; i++) {
      const x = i * stepX;
      const y = height - (points[i] / 100) * height;
      d += ` L ${x} ${y}`;
    }
    return d;
  }, [points]);

  return (
    <svg 
      viewBox="0 0 80 32" 
      className={`w-20 h-8 ${className}`}
      preserveAspectRatio="none"
    >
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default memo(Sparkline);
