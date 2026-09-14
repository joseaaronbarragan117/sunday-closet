'use client';

import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeSvgProps {
  value: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  className?: string;
  lineColor?: string;
  background?: string;
}

export const BarcodeSvg: React.FC<BarcodeSvgProps> = ({
  value,
  width = 1.6,
  height = 38,
  displayValue = true,
  fontSize = 12,
  className = '',
  lineColor = '#000000',
  background = 'transparent',
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value.trim(), {
          format: 'CODE128',
          width,
          height,
          displayValue,
          fontSize,
          margin: 0,
          background,
          lineColor,
          font: 'monospace',
          textMargin: 2,
        });
      } catch (err) {
        console.warn(`[BarcodeSvg] Error generating CODE 128 for "${value}":`, err);
      }
    }
  }, [value, width, height, displayValue, fontSize, lineColor, background]);

  if (!value || !value.trim()) {
    return <span className="text-xs text-slate-500 italic">Sin SKU</span>;
  }

  return (
    <div className={`inline-flex items-center justify-center px-2 py-1 bg-white rounded-lg shadow-xs ${className}`}>
      <svg ref={svgRef} className="max-w-full h-auto" />
    </div>
  );
};
