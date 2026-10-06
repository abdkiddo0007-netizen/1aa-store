export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  baseCost: number;     // Direct Factory Sourcing Price
  fairPrice: number;    // Landed Cost + 25% Flat Margin (Inclusive of Courier)
  marketPrice: number;  // Amazon / Flipkart Retail Benchmark
  courierCost?: number; // Built-in Courier & Freight allocation from Mysore Central Hub
  landedCost?: number;  // baseCost + courierCost
  margin1AAPercent?: number; // 1AA Guaranteed Transparent Margin (25%)
  margin1AAAmount?: number;  // 1AA Net Profit per unit
  amazonPrice?: number; // Real-time Amazon India Benchmark
  flipkartPrice?: number;// Real-time Flipkart Benchmark
  chickpetPrice?: number;// Offline Bangalore Chickpet / Mysore Wholesale Benchmark
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

