import React from 'react';
import { Product } from '../types';

/**
 * Generates an elegant, high-contrast SVG data URI fallback for a product
 * ensuring zero broken images under any network condition.
 */
export function getProductSvgFallback(name: string, sku: string, category: string): string {
  // Category-specific iconography
  let iconPath = '';
  switch (category) {
    case 'Kitchen & Travel':
    case 'Kitchen & Dining':
      // Kettle / Utensil motif
      iconPath = '<path d="M60 70 L140 70 L130 140 L70 140 Z" fill="%230047AB" opacity="0.6"/><path d="M75 55 L125 55 L120 70 L80 70 Z" fill="%23FF8C00"/><path d="M140 85 C155 85, 160 115, 130 120" stroke="%23FF8C00" stroke-width="8" fill="none"/>';
      break;
    case 'Automotive & Tools':
    case 'Home Improvement':
      // Tool / Hardware motif
      iconPath = '<path d="M70 70 L120 120 L110 130 L60 80 Z" fill="%230047AB"/><path d="M110 70 L130 50 C140 60, 140 70, 130 80 Z" fill="%23FF8C00"/><circle cx="80" cy="120" r="15" fill="%23FF8C00" opacity="0.8"/>';
      break;
    case 'Appliances & Comfort':
      // Heating / Power motif
      iconPath = '<rect x="65" y="60" width="70" height="80" rx="12" fill="%230047AB" opacity="0.6"/><path d="M90 75 L105 95 L95 95 L110 125" stroke="%23FF8C00" stroke-width="6" stroke-linecap="round" fill="none"/>';
      break;
    case 'Hydration & Gifting':
      // Flask / Bottle motif
      iconPath = '<rect x="75" y="70" width="50" height="75" rx="8" fill="%230047AB" opacity="0.6"/><rect x="85" y="55" width="30" height="15" rx="4" fill="%23FF8C00"/><circle cx="100" cy="105" r="10" fill="%23FF8C00"/>';
      break;
    case 'Monsoon & Travel':
      // Umbrella / Protection motif
      iconPath = '<path d="M60 100 C60 65, 140 65, 140 100 Z" fill="%230047AB"/><path d="M100 100 L100 135 C100 145, 90 145, 85 140" stroke="%23FF8C00" stroke-width="6" fill="none"/>';
      break;
    default:
      // General 1AA Industrial box motif
      iconPath = '<rect x="65" y="65" width="70" height="70" rx="12" fill="%230047AB" opacity="0.5"/><path d="M65 85 L135 85 M100 65 L100 135" stroke="%23FF8C00" stroke-width="4"/>';
      break;
  }

  const encodedTitle = encodeURIComponent(name.slice(0, 32));
  const encodedSku = encodeURIComponent(sku);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="%23080e1e"/>
        <stop offset="100%" stop-color="%23030712"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(%23bgGrad)"/>
    <circle cx="200" cy="110" r="65" fill="%230047AB" opacity="0.12"/>
    <g transform="translate(100, 10)">
      ${iconPath}
    </g>
    <text x="50%" y="220" text-anchor="middle" font-family="-apple-system, sans-serif" font-weight="700" font-size="14" fill="%23f8fafc">
      ${encodedTitle}
    </text>
    <text x="50%" y="245" text-anchor="middle" font-family="monospace" font-weight="600" font-size="11" fill="%23FF8C00">
      ${encodedSku} • 1AA FACTORY DIRECT
    </text>
    <rect x="150" y="260" width="100" height="18" rx="9" fill="%230047AB" opacity="0.4"/>
    <text x="50%" y="273" text-anchor="middle" font-family="-apple-system, sans-serif" font-weight="600" font-size="9" fill="%2338bdf8">
      100% PRE-DISPATCH QA
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${svg}`;
}

/**
 * React onError handler for product <img> tags
 */
export function handleImgError(
  e: React.SyntheticEvent<HTMLImageElement>,
  product: Product
) {
  const target = e.currentTarget;
  const fallback = getProductSvgFallback(product.name, product.sku, product.category);
  if (target.src !== fallback) {
    target.src = fallback;
    target.classList.add('p-2');
  }
}
