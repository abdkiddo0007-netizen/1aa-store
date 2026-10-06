import { PackageTrackingInfo, SavedOrder } from "../types";

export const CITY_COORDINATES: Record<string, { lat: number; lng: number; label: string }> = {
  bangalore: { lat: 12.9716, lng: 77.5946, label: "Bengaluru Logistics Terminal, KA" },
  mysore: { lat: 12.2958, lng: 76.6394, label: "1AA Mysore Central Hub, Kesare, Mysore, KA" },
  mumbai: { lat: 19.0760, lng: 72.8777, label: "Mumbai Air Cargo Terminal (BOM), MH" },
  delhi: { lat: 28.6139, lng: 77.2090, label: "Delhi NCR Northern Gateway Cargo, DL" },
  hyderabad: { lat: 17.3850, lng: 78.4867, label: "Hyderabad Rajiv Gandhi Cargo Hub, TS" },
  chennai: { lat: 13.0827, lng: 80.2707, label: "Chennai Apex Air Sorting Center, TN" },
  pune: { lat: 18.5204, lng: 73.8567, label: "Pune Chakan Logistics Express Hub, MH" },
  ahmedabad: { lat: 23.0225, lng: 72.5714, label: "Ahmedabad Western Cargo Terminal, GJ" },
  kolkata: { lat: 22.5726, lng: 88.3639, label: "Kolkata Eastern Air Express Facility, WB" },
  kochi: { lat: 9.9312, lng: 76.2673, label: "Kochi Marine & Cargo Hub, KL" },
  jaipur: { lat: 26.9124, lng: 75.7873, label: "Jaipur Logistics Hub, RJ" },
  lucknow: { lat: 26.8467, lng: 80.9462, label: "Lucknow Central Cargo Depot, UP" },
  patna: { lat: 25.5941, lng: 85.1376, label: "Patna Eastern Distribution Center, BR" },
  guwahati: { lat: 26.1445, lng: 91.7362, label: "Guwahati North-East Air Cargo Hub, AS" }
};

export const DEMO_TRACKING_ORDERS: Record<string, PackageTrackingInfo> = {
  "1AA-EXP-MUM-8921": {
    orderRef: "1AA-EXP-MUM-8921",
    courierPartner: "BlueDart Apex Priority Air",
    awbDocket: "BD-MYS-74910284",
    bookingDate: "Today, 08:30 AM",
    deliverySpeed: "express",
    originHub: "1AA Mysore Central Facility, Kesare, Mysore",
    destinationCity: "Mumbai Hub, Maharashtra",
    currentStageId: 5,
    overallStatus: "Line-Haul In-Transit",
    estimatedArrival: "Tomorrow by 02:00 PM (Express SLA)",
    stages: [
      {
        id: 1,
        title: "Axis Bank Remittance Verified",
        shortDesc: "Payment reconciled by Abdul Darvesh",
        detailedNotes: [
          "Commercial invoice generated & cleared against Axis Bank A/c 922010002282280",
          "Transaction reference / UTR matched with zero financial deficit",
          "Order queue priority flagged: EXPRESS AIR (<7 Days SLA)"
        ],
        location: "1AA Treasury Desk, Mysore",
        timestamp: "Today, 08:45 AM",
        status: "completed",
        leadTimeHours: 0.5
      },
      {
        id: 2,
        title: "Mysore Facility Pick & Bench QA Passed",
        shortDesc: "100% pre-dispatch physical inspection passed",
        detailedNotes: [
          "Units picked from Mysore Central Warehouse (#195, 2nd Stage, Kesare)",
          "Electronic test: Voltage regulation, charging circuit & mechanism tested",
          "Zero cosmetic flaws / zero defect certificate signed by Head QA"
        ],
        location: "Mysore Central QA Bay #4",
        timestamp: "Today, 10:15 AM",
        status: "completed",
        leadTimeHours: 1.5
      },
      {
        id: 3,
        title: "Export Packing & Tamper-Proof Seal",
        shortDesc: "Packed into 5-ply heavy corrugated outer carton",
        detailedNotes: [
          "Heavy-duty internal bubble lining & moisture desiccants placed",
          "1AA Official Holographic security tape applied to all seams",
          "B2B GST Packing Slip & Consignment Barcode docket affixed"
        ],
        location: "Mysore Packing Station #2",
        timestamp: "Today, 11:30 AM",
        status: "completed",
        leadTimeHours: 1.2
      },
      {
        id: 4,
        title: "Handed Over to BlueDart Apex Cargo Hub",
        shortDesc: "Scanned at Bengaluru International Airport Freight Center",
        detailedNotes: [
          "Dedicated line vehicle KA-09-EA-4821 transferred cargo from Mysore to BLR Cargo Terminal",
          "Official AWB Docket BD-MYS-74910284 registered on national logistics grid",
          "Cleared security & X-ray screening for priority air cargo manifest"
        ],
        location: "BLR Airport Cargo Complex, Devanahalli",
        timestamp: "Today, 02:40 PM",
        status: "completed",
        leadTimeHours: 3.0
      },
      {
        id: 5,
        title: "Air Cargo Flight in Transit",
        shortDesc: "In flight onboard Cargo Flight 6E-8291 (BLR -> BOM)",
        detailedNotes: [
          "Departed Kempegowda International Airport (BLR) at 03:15 PM",
          "Scheduled touchdown at Chhatrapati Shivaji Maharaj Airport (BOM) Terminal 2 Cargo",
          "Real-time GPS telemetry and cabin shock sensors active"
        ],
        location: "Airspace Sector MH-South (En-Route to Mumbai)",
        timestamp: "Today, 03:50 PM (Active Now)",
        status: "in_progress",
        leadTimeHours: 2.0
      },
      {
        id: 6,
        title: "Final Mile Out for Delivery & OTP Handover",
        shortDesc: "Scheduled for local delivery courier assignment",
        detailedNotes: [
          "Local delivery associate contact will be sent via SMS / WhatsApp",
          "Handover requires 4-digit verification code sent to customer phone",
          "Consignment box verification before OTP handover supported"
        ],
        location: "BOM Western Suburbs Delivery Hub, Andheri East",
        timestamp: "Tomorrow, Expected 11:00 AM - 02:00 PM",
        status: "pending",
        leadTimeHours: 12.0
      }
    ],
    gpsCoordinates: {
      origin: { lat: 12.2958, lng: 76.6394, label: "1AA Mysore Central Hub" },
      destination: { lat: 19.0760, lng: 72.8777, label: "Mumbai Logistics Terminal (BOM)" },
      current: { lat: 17.4820, lng: 74.8900, label: "Flight 6E-Cargo BLR-BOM (Altitude 28,000 ft)", progressPercent: 78 }
    },
    telemetry: {
      temperature: "22.4°C (Optimal Ambient)",
      shockIndex: "0.04g (Smooth Flight)",
      humidity: "34% (Moisture Safe)",
      vehicleFlightId: "Air Cargo 6E-8291 (IndiGo / BlueDart Apex)",
      driverHotline: "+91 75980 77003 (Mysore Hub Dispatch Desk)"
    },
    cartSummary: {
      totalUnits: 36,
      totalAmount: 18450,
      itemsCount: 4
    }
  },

  "1AA-STD-DEL-4029": {
    orderRef: "1AA-STD-DEL-4029",
    courierPartner: "Delhivery Surface Freight Express",
    awbDocket: "DEL-MYS-98214710",
    bookingDate: "Yesterday, 04:10 PM",
    deliverySpeed: "standard",
    originHub: "1AA Mysore Central Facility, Kesare, Mysore",
    destinationCity: "Delhi NCR Northern Hub",
    currentStageId: 4,
    overallStatus: "Handed Over to Courier",
    estimatedArrival: "Within 6-8 Days (Standard 10-15d SLA)",
    stages: [
      {
        id: 1,
        title: "Axis Bank Remittance Verified",
        shortDesc: "NEFT / UPI payment verified by Abdul Darvesh",
        detailedNotes: [
          "Invoice settlement credited to Axis Bank A/c 922010002282280",
          "B2B Wholesale Master Carton booking registered",
          "Standard Surface Freight SLA (10–15 Days) initialized"
        ],
        location: "1AA Treasury Desk, Mysore",
        timestamp: "Yesterday, 04:30 PM",
        status: "completed",
        leadTimeHours: 0.5
      },
      {
        id: 2,
        title: "Mysore Facility Pick & Bench QA Passed",
        shortDesc: "Master carton batch inspection passed",
        detailedNotes: [
          "Full carton integrity verified from warehouse storage pallet",
          "Random sampling bench inspection completed with 100% compliance",
          "Packing manifest verified against SKU barcoded stickers"
        ],
        location: "Mysore Central Facility Bay #2",
        timestamp: "Yesterday, 06:45 PM",
        status: "completed",
        leadTimeHours: 2.0
      },
      {
        id: 3,
        title: "Export Packing & Tamper-Proof Seal",
        shortDesc: "Reinforced corner strapping & waterproofing applied",
        detailedNotes: [
          "Carton reinforced with heavy polypropylene strapping bands",
          "Tamper-proof barcode seals stamped with Mysore Hub ID MYS-1AA",
          "Consignment waybill generated for interstate cargo"
        ],
        location: "Mysore Central Packing Dock",
        timestamp: "Yesterday, 08:30 PM",
        status: "completed",
        leadTimeHours: 1.5
      },
      {
        id: 4,
        title: "Loaded onto Delhivery Line-Haul Transport",
        shortDesc: "Dispatched from Southern Hub towards Northern Corridor",
        detailedNotes: [
          "Vehicle Registration: KA-01-AK-9102 (Container Cargo)",
          "Driver Check-In: Certified Delhivery Freight Fleet",
          "Cleared Electronic Toll & E-Way Bill documentation"
        ],
        location: "Bengaluru Logistics Park (Hosur / Nelamangala Gateway)",
        timestamp: "Today, 11:20 AM (Active Now)",
        status: "in_progress",
        leadTimeHours: 14.0
      },
      {
        id: 5,
        title: "Inter-City Surface Line-Haul Transit",
        shortDesc: "In transit along National Logistics Highway Corridor",
        detailedNotes: [
          "Transiting through Central Distribution Hub (Nagpur / Bhopal)",
          "Satellite GPS tracking ping updated every 15 minutes",
          "Estimated arrival at Gurgaon Northern Sorting Center"
        ],
        location: "National Highway Northbound Corridor",
        timestamp: "Scheduled Next Checkpoint: Tomorrow Morning",
        status: "pending",
        leadTimeHours: 48.0
      },
      {
        id: 6,
        title: "Final Mile Out for Delivery & OTP Handover",
        shortDesc: "Local commercial delivery van dispatch",
        detailedNotes: [
          "Consignment handover at retail shop / warehouse doorstep",
          "Secure OTP verification ensures zero pilferage"
        ],
        location: "Delhi NCR Sorting Center (Okhla / Gurugram)",
        timestamp: "Expected in 6–8 business days",
        status: "pending",
        leadTimeHours: 24.0
      }
    ],
    gpsCoordinates: {
      origin: { lat: 12.2958, lng: 76.6394, label: "1AA Mysore Central Hub" },
      destination: { lat: 28.6139, lng: 77.2090, label: "Delhi NCR Logistics Hub" },
      current: { lat: 14.8020, lng: 76.8500, label: "Delhivery Line Container KA-01-AK-9102", progressPercent: 32 }
    },
    telemetry: {
      temperature: "27.8°C",
      shockIndex: "0.12g (Normal Road Grade)",
      humidity: "42%",
      vehicleFlightId: "Delhivery Container Truck KA-01-AK-9102",
      driverHotline: "+91 74062 31167 (1AA Sourcing Helpline)"
    },
    cartSummary: {
      totalUnits: 120,
      totalAmount: 32800,
      itemsCount: 6
    }
  },

  "1AA-QA-MYS-1104": {
    orderRef: "1AA-QA-MYS-1104",
    courierPartner: "1AA Mysore Direct Express / BlueDart",
    awbDocket: "1AA-MYS-TEST-8812",
    bookingDate: "Today, 11:15 AM",
    deliverySpeed: "express",
    originHub: "1AA Mysore Central Facility, Kesare, Mysore",
    destinationCity: "Bangalore Hub, Karnataka",
    currentStageId: 2,
    overallStatus: "Bench QA In Progress",
    estimatedArrival: "Within 24–48 Hours",
    stages: [
      {
        id: 1,
        title: "Axis Bank Remittance Verified",
        shortDesc: "Payment reconciled by Abdul Darvesh",
        detailedNotes: [
          "Direct transfer confirmed via Axis Bank UPI ID 7406231167@axisbank",
          "Official Tax Invoice stamped and allocated order queue #MYS-8812"
        ],
        location: "1AA Treasury Desk, Mysore",
        timestamp: "Today, 11:20 AM",
        status: "completed",
        leadTimeHours: 0.2
      },
      {
        id: 2,
        title: "Mysore Facility Pick & Bench QA In Progress",
        shortDesc: "Physical quality testing on test-bench active right now",
        detailedNotes: [
          "Technician on duty testing circuit continuity and packaging integrity",
          "Bench test ensures 0% DOA (Dead on Arrival) rate for retail clients",
          "Carton labeling ready for packaging line transfer"
        ],
        location: "Mysore Central QA Bay #1",
        timestamp: "Today, 11:45 AM (Active Now)",
        status: "in_progress",
        leadTimeHours: 1.0
      },
      {
        id: 3,
        title: "Export Packing & Tamper-Proof Seal",
        shortDesc: "Queued for protective wrap & barcoded seals",
        detailedNotes: [
          "Will be boxed in double-wall protective cartons",
          "Tamper-evident holographic security tape ready for application"
        ],
        location: "Mysore Packing Bay",
        timestamp: "Scheduled Today, 01:30 PM",
        status: "pending",
        leadTimeHours: 1.0
      },
      {
        id: 4,
        title: "Handover to Priority Logistics Hub",
        shortDesc: "Direct transfer to BlueDart / Delhivery regional hub",
        detailedNotes: ["Consignment manifest generated upon packaging handover"],
        location: "Mysore Central Dispatch Bay",
        timestamp: "Scheduled Today, 03:30 PM",
        status: "pending",
        leadTimeHours: 2.0
      },
      {
        id: 5,
        title: "Line-Haul Inter-City Transit",
        shortDesc: "Direct express highway transfer Mysore -> Bangalore",
        detailedNotes: ["Express transit along Mysore-Bengaluru Expressway"],
        location: "Mysore-Bengaluru Expressway Corridor",
        timestamp: "Scheduled Today Evening",
        status: "pending",
        leadTimeHours: 3.0
      },
      {
        id: 6,
        title: "Final Mile Out for Delivery & OTP Handover",
        shortDesc: "Doorstep delivery to Bangalore shopkeeper",
        detailedNotes: ["Verification OTP required on delivery"],
        location: "Bangalore Central Delivery Hub",
        timestamp: "Scheduled Tomorrow Morning",
        status: "pending",
        leadTimeHours: 12.0
      }
    ],
    gpsCoordinates: {
      origin: { lat: 12.2958, lng: 76.6394, label: "1AA Mysore Central Hub" },
      destination: { lat: 12.9716, lng: 77.5946, label: "Bangalore Commercial Hub" },
      current: { lat: 12.2958, lng: 76.6394, label: "1AA Mysore Central Facility QA Bench", progressPercent: 18 }
    },
    telemetry: {
      temperature: "24.1°C",
      shockIndex: "0.01g (Stationary Bench)",
      humidity: "40%",
      vehicleFlightId: "Mysore Facility Internal Conveyor",
      driverHotline: "+91 75980 77003"
    },
    cartSummary: {
      totalUnits: 24,
      totalAmount: 6480,
      itemsCount: 2
    }
  }
};

/**
 * Generate or retrieve tracking details for any order reference or saved order
 */
export function getTrackingForOrder(orderQuery: string, fallbackOrder?: Partial<SavedOrder>): PackageTrackingInfo {
  const clean = orderQuery.replace("#", "").trim();

  // 1. Direct Demo match
  if (DEMO_TRACKING_ORDERS[clean]) {
    return DEMO_TRACKING_ORDERS[clean];
  }

  // Check demo partial matches
  for (const [key, demo] of Object.entries(DEMO_TRACKING_ORDERS)) {
    if (key.toLowerCase().includes(clean.toLowerCase()) || clean.toLowerCase().includes(key.toLowerCase())) {
      return demo;
    }
  }

  // 2. Synthesize dynamic realistic tracking for any custom order ref or saved order
  const ref = clean || fallbackOrder?.orderRef || `1AA-${Math.floor(10000 + Math.random() * 90000)}`;
  const isExpress = fallbackOrder?.deliverySpeed === "express" || ref.toLowerCase().includes("exp") || ref.toLowerCase().includes("air");
  const courier = isExpress ? "BlueDart Apex Priority Air" : "Delhivery Surface Freight Cargo";
  const awb = isExpress ? `BD-MYS-${Math.floor(10000000 + Math.random() * 90000000)}` : `DEL-MYS-${Math.floor(10000000 + Math.random() * 90000000)}`;
  const destination = fallbackOrder?.destinationCity || "Your Destination Hub (All-India Delivery)";
  const units = fallbackOrder?.totalUnits || 48;
  const amount = fallbackOrder?.totalAmount || 14200;

  return {
    orderRef: ref,
    courierPartner: courier,
    awbDocket: awb,
    bookingDate: fallbackOrder?.date || "Confirmed Today",
    deliverySpeed: isExpress ? "express" : "standard",
    originHub: "1AA Mysore Central Facility, Kesare, Mysore, Karnataka - 570007",
    destinationCity: destination,
    currentStageId: 3,
    overallStatus: "Packed & Barcoded",
    estimatedArrival: isExpress ? "Within 3–5 Days (Express Air SLA)" : "Within 10–12 Days (Standard Surface SLA)",
    stages: [
      {
        id: 1,
        title: "Axis Bank Remittance Verified",
        shortDesc: "Verified by Abdul Darvesh (Axis Bank A/c 922010002282280)",
        detailedNotes: [
          `Payment of ₹${amount.toLocaleString("en-IN")} reconciled with zero bank charge deficit`,
          fallbackOrder?.utrNumber ? `Bank UTR: ${fallbackOrder.utrNumber} verified` : "UPI QR instant remittance cleared",
          `Dispatch priority: ${isExpress ? "EXPRESS AIR (<7 Days SLA)" : "STANDARD SURFACE (10–15 Days SLA)"}`
        ],
        location: "1AA Treasury Desk, Mysore",
        timestamp: "Confirmed at Booking",
        status: "completed",
        leadTimeHours: 0.5
      },
      {
        id: 2,
        title: "Mysore Facility Pick & Bench QA Passed",
        shortDesc: "100% pre-dispatch physical inspection completed",
        detailedNotes: [
          `All ${units} units inspected at Central Hub (#195, 2nd Stage, Kesare, Mysore)`,
          "Individual items undergo power-on, mechanism, and build quality checks",
          "Zero-defect seal applied before moving to boxing line"
        ],
        location: "Mysore Central QA Bay #3",
        timestamp: "Completed Today",
        status: "completed",
        leadTimeHours: 2.0
      },
      {
        id: 3,
        title: "Export Packaging & Tamper-Proof Barcode",
        shortDesc: "Consolidated in heavy 5-ply cartons with moisture barrier",
        detailedNotes: [
          "Heavy-duty corrugated master carton with reinforced corner guards",
          "Holographic 1AA tamper-proof tape applied",
          `Waybill Docket ${awb} attached with GST packing manifest`
        ],
        location: "Mysore Packing Station #1",
        timestamp: "Active Right Now",
        status: "in_progress",
        leadTimeHours: 1.5
      },
      {
        id: 4,
        title: "Courier Handover & Hub Dispatch",
        shortDesc: `Scheduled for handover to ${courier}`,
        detailedNotes: [
          "Courier feeder van scheduled for scheduled evening batch departure",
          "Direct transfer to Kempegowda Airport Air Cargo / Surface Terminal"
        ],
        location: "Mysore Central Dispatch Bay",
        timestamp: "Scheduled Next Handover",
        status: "pending",
        leadTimeHours: 4.0
      },
      {
        id: 5,
        title: "Line-Haul Inter-City Transit",
        shortDesc: "National logistics corridor transit with GPS radar",
        detailedNotes: [
          "Consignment logged into national sorting grid",
          "Automated scan checkpoints available 24x7 via courier portal"
        ],
        location: "Interstate Transit Corridor",
        timestamp: "Scheduled Post-Handover",
        status: "pending",
        leadTimeHours: isExpress ? 24.0 : 72.0
      },
      {
        id: 6,
        title: "Final Mile Out for Delivery & OTP Handover",
        shortDesc: "Delivered to shopkeeper / buyer address with secure OTP",
        detailedNotes: [
          "Local delivery driver contact shared in advance",
          "Secure 4-digit verification code required to release carton"
        ],
        location: destination,
        timestamp: isExpress ? "Expected in 3–5 Days" : "Expected in 10–12 Days",
        status: "pending",
        leadTimeHours: 24.0
      }
    ],
    gpsCoordinates: {
      origin: { lat: 12.2958, lng: 76.6394, label: "1AA Mysore Central Hub" },
      destination: { lat: 13.0827, lng: 80.2707, label: destination },
      current: { lat: 12.4500, lng: 76.9200, label: "1AA Mysore Facility Packing Dock", progressPercent: 45 }
    },
    telemetry: {
      temperature: "23.8°C",
      shockIndex: "0.02g (Stationary Packing)",
      humidity: "38%",
      vehicleFlightId: `${courier} Feeder Line`,
      driverHotline: "+91 75980 77003 (Mysore Hub Desk)"
    },
    cartSummary: {
      totalUnits: units,
      totalAmount: amount,
      itemsCount: fallbackOrder?.items?.length || 3
    }
  };
}
