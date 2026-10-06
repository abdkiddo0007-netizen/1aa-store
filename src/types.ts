export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  baseCost: number;     // Direct Factory Sourcing Price
  fairPrice: number;    // Base Cost + ₹100 flat margin
  marketPrice: number;  // Amazon / Flipkart Retail Benchmark
  cartonSize: number;
  inStock: number;
  image: string;
  highlight: string;
  // Enhanced technical specifications
  dimensions?: string;
  weight?: string;
  warranty?: string;
  specs?: string[];
  material?: string;
  leadTime?: string;
  reviewsCount?: number;
  rating?: number;
}

export interface OrderMetrics {
  units: number;
  subtotal: number;
  volumeDiscount: number;
  finalAmount: number;
  marketValue: number;
  totalSavings: number;
  minOrderReached?: boolean;
  deficit?: number;
  isB2BVolumeEligible: boolean;
}

export interface ActiveOrderItem {
  product: Product;
  quantity: number;
  total: number;
}

export interface SavedOrder {
  id: string;
  orderRef: string;
  date: string;
  items: { sku: string; name: string; quantity: number; unitPrice: number; total: number }[];
  totalAmount: number;
  totalUnits: number;
  deliverySpeed: 'standard' | 'express';
  utrNumber?: string;
}
