/**
 * 1AA Store - Structured Address & Location Data Architecture
 * Separate Billing Address and Shipping Address with delivery preference toggles
 */

export interface StructuredAddress {
  recipientName: string;
  phone: string; // Validated 10-digit Indian mobile
  email?: string;
  street: string; // Apartment, Building, Flat, Street address
  landmark?: string;
  city: string;
  state: string; // Indian State / UT
  country: "India";
  postalCode: string; // 6-digit Indian PIN Code
  coordinates: {
    lat: number;
    lng: number;
  };
  deliveryPreference: {
    type: "residential" | "commercial"; // Residential (any day) vs Commercial (weekdays only)
    gateCode?: string;
    safePlaceDrop: boolean; // Authorization to drop at security/gate if shop closed
    timeWindow?: "morning" | "afternoon" | "anytime";
  };
}

export interface OrderAddressPackage {
  shippingAddress: StructuredAddress;
  billingAddress: StructuredAddress;
  billingSameAsShipping: boolean;
  gstin?: string;
}

export const INDIAN_STATES: string[] = [
  "Karnataka",
  "Maharashtra",
  "Delhi",
  "Tamil Nadu",
  "Telangana",
  "Gujarat",
  "Uttar Pradesh",
  "West Bengal",
  "Rajasthan",
  "Kerala",
  "Andhra Pradesh",
  "Madhya Pradesh",
  "Haryana",
  "Punjab",
  "Bihar",
  "Odisha",
  "Assam",
  "Goa",
  "Chandigarh",
  "Jammu and Kashmir"
];

export const PINCODE_DATABASE: Record<string, { city: string; state: string; lat: number; lng: number }> = {
  // Mysore
  "570001": { city: "Mysore", state: "Karnataka", lat: 12.3051, lng: 76.6552 },
  "570007": { city: "Mysore (Kesare)", state: "Karnataka", lat: 12.3385, lng: 76.6715 },
  "570015": { city: "Mysore (Hebbal)", state: "Karnataka", lat: 12.3619, lng: 76.6022 },
  "570020": { city: "Mysore (Kuvempunagar)", state: "Karnataka", lat: 12.2885, lng: 76.6292 },
  // Bangalore
  "560001": { city: "Bangalore", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  "560002": { city: "Bangalore (Chickpet)", state: "Karnataka", lat: 12.9698, lng: 77.5760 },
  "560053": { city: "Bangalore (Sultanpet)", state: "Karnataka", lat: 12.9733, lng: 77.5744 },
  "560034": { city: "Bangalore (Koramangala)", state: "Karnataka", lat: 12.9352, lng: 77.6245 },
  "560066": { city: "Bangalore (Whitefield)", state: "Karnataka", lat: 12.9698, lng: 77.7500 },
  // Mumbai
  "400001": { city: "Mumbai", state: "Maharashtra", lat: 18.9322, lng: 72.8335 },
  "400003": { city: "Mumbai (Crawford Market)", state: "Maharashtra", lat: 18.9482, lng: 72.8347 },
  "400069": { city: "Mumbai (Andheri East)", state: "Maharashtra", lat: 19.1136, lng: 72.8697 },
  // Delhi
  "110001": { city: "New Delhi", state: "Delhi", lat: 28.6315, lng: 77.2167 },
  "110006": { city: "Delhi (Chandni Chowk)", state: "Delhi", lat: 28.6506, lng: 77.2303 },
  "110020": { city: "Delhi (Okhla)", state: "Delhi", lat: 28.5300, lng: 77.2700 },
  // Chennai
  "600001": { city: "Chennai (George Town)", state: "Tamil Nadu", lat: 13.0900, lng: 80.2900 },
  "600002": { city: "Chennai", state: "Tamil Nadu", lat: 13.0600, lng: 80.2700 },
  // Hyderabad
  "500001": { city: "Hyderabad", state: "Telangana", lat: 17.3850, lng: 78.4867 },
  "500003": { city: "Secunderabad", state: "Telangana", lat: 17.4399, lng: 78.4983 },
  // Ahmedabad
  "380001": { city: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714 },
  // Kolkata
  "700001": { city: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639 },
  // Pune
  "411001": { city: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567 },
};

export function lookupPincode(pincode: string): { city: string; state: string; lat: number; lng: number } | null {
  const clean = pincode.replace(/\D/g, "");
  if (clean.length !== 6) return null;
  if (PINCODE_DATABASE[clean]) return PINCODE_DATABASE[clean];

  // Heuristic based on first digits if exact match not in lookup table
  const first = clean[0];
  if (first === "5") return { city: "Southern Region Hub", state: "Karnataka", lat: 12.9716, lng: 77.5946 };
  if (first === "4") return { city: "Western Region Hub", state: "Maharashtra", lat: 19.0760, lng: 72.8777 };
  if (first === "1") return { city: "Northern Region Hub", state: "Delhi", lat: 28.6139, lng: 77.2090 };
  if (first === "6") return { city: "Tamil Nadu / Kerala Hub", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 };
  if (first === "7") return { city: "Eastern Region Hub", state: "West Bengal", lat: 22.5726, lng: 88.3639 };
  if (first === "3") return { city: "Gujarat / Rajasthan Hub", state: "Gujarat", lat: 23.0225, lng: 72.5714 };

  return { city: "India Central Hub", state: "India", lat: 20.5937, lng: 78.9629 };
}
