export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  baseCost: number;     // Base Price (Actual DeoDap Wholesale Price with Tax)
  fairPrice: number;    // 1AA Final Wholesale Price (Base Price + Flat 20% Margin)
  marketPrice: number;  // Amazon / Flipkart Retail Benchmark
  courierCost?: number; // Doorstep Courier Freight (Included)
  landedCost?: number;  // Base Price with Tax
  margin1AAPercent?: number; // Flat 20% Transparent 1AA Wholesale Margin
  margin1AAAmount?: number;  // 1AA Operating Margin per unit (20%)
  amazonPrice?: number; // Real-time Amazon India Benchmark
  flipkartPrice?: number;// Real-time Flipkart Benchmark
  chickpetPrice?: number;// Real-time Wholesale Trade Market Benchmark
  wholesaleMarketPrice?: number; // Real-time Wholesale Market Rate
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
  trackingNumber?: string;
  courierPartner?: string;
  destinationCity?: string;
  currentStage?: number;
}

export type TrackingStageStatus = 'completed' | 'in_progress' | 'pending';

export interface TrackingStage {
  id: number;
  title: string;
  shortDesc: string;
  detailedNotes: string[];
  location: string;
  timestamp: string;
  status: TrackingStageStatus;
  leadTimeHours: number;
}

export interface PackageTrackingInfo {
  orderRef: string;
  courierPartner: string;
  awbDocket: string;
  bookingDate: string;
  deliverySpeed: 'standard' | 'express';
  originHub: string;
  destinationCity: string;
  currentStageId: number;
  overallStatus: 'Remittance Verifying' | 'Bench QA In Progress' | 'Packed & Barcoded' | 'Handed Over to Courier' | 'Line-Haul In-Transit' | 'Out for Delivery' | 'Delivered';
  estimatedArrival: string;
  stages: TrackingStage[];
  gpsCoordinates: {
    origin: { lat: number; lng: number; label: string };
    destination: { lat: number; lng: number; label: string };
    current: { lat: number; lng: number; label: string; progressPercent: number };
  };
  telemetry: {
    temperature: string;
    shockIndex: string;
    humidity: string;
    vehicleFlightId: string;
    driverHotline?: string;
  };
  cartSummary?: {
    totalUnits: number;
    totalAmount: number;
    itemsCount: number;
  };
}

