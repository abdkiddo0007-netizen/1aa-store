import { Product } from '../types';

export const CATALOG_PRODUCTS: Product[] = [
  {
    id: "prod-001",
    sku: "1AA-KETL-FOLD",
    name: "Collapsible Travel Electric Kettle (0.6L Silicone)",
    category: "Kitchen & Travel",
    baseCost: 399,
    fairPrice: 499, // 399 + 100
    marketPrice: 1499,
    cartonSize: 40,
    inStock: 680,
    highlight: "Food-grade silicone, dual-voltage rapid boil",
    image: "/products/1aa-ketl-fold.jpg",
    dimensions: "18 x 13 x 17 cm (Expands to 18 cm, collapses to 9 cm)",
    weight: "480g / unit",
    warranty: "6 Months Factory Replacement",
    material: "BPA-Free Food Grade Silicone + 304 Stainless Steel Base",
    leadTime: "Same Day Mysore Dispatch",
    specs: [
      "Dual Voltage 110V - 220V with auto-cutoff boil dry protection",
      "0.6L optimal capacity for tea, coffee, instant noodles & baby milk",
      "Food-grade heat-resistant foldable silicone body (up to 230°C)",
      "Detachable power cord for compact bag & luggage stowing"
    ]
  },
  {
    id: "prod-002",
    sku: "1AA-VAC-120W",
    name: "Wireless Handheld Car Vacuum Cleaner (120W USB)",
    category: "Automotive & Tools",
    baseCost: 180,
    fairPrice: 280, // 180 + 100
    marketPrice: 999,
    cartonSize: 50,
    inStock: 1240,
    highlight: "6000PA high cyclonic suction with HEPA filter",
    image: "/products/1aa-vac-120w.jpg",
    dimensions: "37 x 10 x 11 cm",
    weight: "360g / unit",
    warranty: "6 Months Factory Replacement",
    material: "Reinforced Impact-Resistant ABS & Washable HEPA Filter",
    leadTime: "Same Day Mysore Dispatch",
    specs: [
      "Heavy-duty 120W motor generating true 6000PA cyclonic suction",
      "Type-C USB Fast Rechargeable with 2000mAh dual Li-ion cells",
      "Dual nozzle attachment: Crevice tool & stiff bristle brush included",
      "One-click dust bin release with washable stainless-steel HEPA filter"
    ]
  },
  {
    id: "prod-003",
    sku: "1AA-TOOL-27PC",
    name: "27-Piece Precision Home Repair Tool Kit with Claw Hammer",
    category: "Home Improvement",
    baseCost: 965,
    fairPrice: 1065, // 965 + 100
    marketPrice: 2999,
    cartonSize: 10,
    inStock: 340,
    highlight: "Hardened carbon steel tools in blow-molded case",
    image: "/products/1aa-tool-27pc.jpg",
    dimensions: "32 x 24 x 7 cm",
    weight: "1.85 kg / set",
    warranty: "12 Months Structural Guarantee",
    material: "Heat-Treated High Carbon Alloy Steel + Ergonomic TPR Grips",
    leadTime: "Same Day Mysore Dispatch",
    specs: [
      "Includes 8oz claw hammer, 6-inch combination pliers, tape measure (3m)",
      "Magnetic bit driver with 10 interchangeable screwdriver bits & precision drivers",
      "Utility knife with retractable safety blade and electrical test pen",
      "High-density blow-molded storage case with positive snap-locks"
    ]
  },
  {
    id: "prod-004",
    sku: "1AA-HEAT-900W",
    name: "Compact Wall-Outlet Ceramic Room Heater (900W)",
    category: "Appliances & Comfort",
    baseCost: 148,
    fairPrice: 248, // 148 + 100
    marketPrice: 549,
    cartonSize: 50,
    inStock: 820,
    highlight: "Direct wall-plug design with digital thermostat",
    image: "/products/1aa-heat-900w.jpg",
    dimensions: "13.5 x 13.5 x 11.5 cm",
    weight: "420g / unit",
    warranty: "6 Months Factory Replacement",
    material: "Flame-Retardant ABS Ceramic PTC Heating Element",
    leadTime: "Same Day Mysore Dispatch",
    specs: [
      "Energy-efficient 900W ceramic PTC element with rapid 3-second warmth",
      "Adjustable digital LED temperature display (15°C to 32°C)",
      "Programmable 12-hour automatic shutoff timer",
      "180-degree rotating 3-pin plug fits any Indian wall outlet directly"
    ]
  },
  {
    id: "prod-005",
    sku: "1AA-FLSK-SET3",
    name: "Stainless Steel Vacuum Flask Set with 3 Cups (500ml)",
    category: "Hydration & Gifting",
    baseCost: 205,
    fairPrice: 305, // 205 + 100
    marketPrice: 1499,
    cartonSize: 30,
    inStock: 1560,
    highlight: "12-hour thermal lock with 3 insulated serving cups",
    image: "/products/1aa-flsk-set3.jpg",
    dimensions: "28 x 18 x 7 cm (Gift Box Dimensions)",
    weight: "610g / set",
    warranty: "6 Months Thermal Retention Guarantee",
    material: "SUS 304 Food-Grade Double-Wall Vacuum Stainless Steel",
    leadTime: "Same Day Mysore Dispatch",
    specs: [
      "Double-walled vacuum insulation: Hot for 12 hours, Cold for 24 hours",
      "Comes packaged with 3 insulated stainless-steel serving cups",
      "Leakproof push-button dispenser stopper prevents accidental spills",
      "Delivered in a premium matte presentation gift box with handle"
    ]
  },
  {
    id: "prod-006",
    sku: "1AA-SOLR-STKE",
    name: "Waterproof Solar Garden Stake Lights (2-Pack)",
    category: "Outdoor & Decor",
    baseCost: 260,
    fairPrice: 360, // 260 + 100
    marketPrice: 1299,
    cartonSize: 40,
    inStock: 910,
    highlight: "Automatic dusk-to-dawn sensor, all-weather ABS",
    image: "/products/1aa-solr-stke.jpg",
    dimensions: "42 x 10 x 10 cm each",
    weight: "340g / pair",
    warranty: "6 Months Weatherproof Replacement",
    material: "IP65 Weatherproof UV-Stabilized Polycarbonate & ABS",
    leadTime: "Same Day Mysore Dispatch",
    specs: [
      "High-efficiency monocrystalline solar panel charges in 6-8 hours",
      "Built-in light sensor provides automatic illumination from dusk to dawn",
      "Emits warm 3000K ambient ray with decorative star-burst lens pattern",
      "No wiring or electrical installation needed — just press into lawn or soil"
    ]
  },
  {
    id: "prod-007",
    sku: "1AA-LNCH-STEL",
    name: "Leakproof Insulated Stainless Steel Bento Lunch Box",
    category: "Kitchen & Dining",
    baseCost: 234,
    fairPrice: 334, // 234 + 100
    marketPrice: 469,
    cartonSize: 36,
    inStock: 740,
    highlight: "Food-grade 304 stainless steel interior with airtight locks",
    image: "/products/1aa-lnch-stel.jpg",
    dimensions: "26 x 19 x 6.5 cm",
    weight: "520g / unit",
    warranty: "6 Months Seal Integrity Guarantee",
    material: "SUS 304 Stainless Steel Tray + BPA-Free PP Outer Shell",
    leadTime: "Same Day Mysore Dispatch",
    specs: [
      "Removable 4-compartment SUS 304 stainless steel tray with deep partitions",
      "Silicone gasket airtight ring prevents gravy and soup leakage",
      "Bottom base cavity can hold hot water to gently reheat meals",
      "Includes reusable stainless steel spoon and chopstick set in lid compartment"
    ]
  },
  {
    id: "prod-008",
    sku: "1AA-UMBR-CAPS",
    name: "5-Fold Ultra-Compact Capsule Pocket Umbrella",
    category: "Monsoon & Travel",
    baseCost: 237,
    fairPrice: 337, // 237 + 100
    marketPrice: 599,
    cartonSize: 60,
    inStock: 1100,
    highlight: "Reinforced windproof frame with waterproof capsule case",
    image: "/products/1aa-umbr-caps.jpg",
    dimensions: "18 x 5 cm (Collapsed capsule length)",
    weight: "220g / unit",
    warranty: "6 Months Frame Guarantee",
    material: "210T Teflon Coated Pongee + Aviation-Grade Aluminum Alloy Ribs",
    leadTime: "Same Day Mysore Dispatch",
    specs: [
      "Ultra-compact 5-fold mechanism collapses down to only 18 cm",
      "Black vinyl inner coating provides UPF 50+ blocking 99% of UV rays",
      "Heavy wind-resistant flexible fiberglass rib construction",
      "Comes with waterproof molded capsule shell to keep bags and pockets dry"
    ]
  },
  {
    id: "prod-009",
    sku: "1AA-SOAP-PUMP",
    name: "2-in-1 Kitchen Sink Soap Pump Dispenser with Sponge Caddy",
    category: "Kitchen & Dining",
    baseCost: 75,
    fairPrice: 175, // 75 + 100
    marketPrice: 299,
    cartonSize: 60,
    inStock: 1450,
    highlight: "One-hand instant press pump with drainage tray & sponge included",
    image: "/products/1aa-soap-pump.jpg",
    dimensions: "14 x 9.5 x 10.5 cm",
    weight: "180g / unit",
    warranty: "6 Months Pump Mechanism Guarantee",
    material: "Food-Grade BPA-Free ABS Polymer + Hydrophobic Sponge",
    leadTime: "Same Day Mysore Dispatch",
    specs: [
      "Innovative one-hand push design dispenses precise dish soap onto sponge",
      "Generous 385ml transparent reservoir prevents frequent refills",
      "Hollow ventilated drainage tray keeps counter top dry and hygienic",
      "High-density scouring sponge included in master carton packing"
    ]
  },
  {
    id: "prod-010",
    sku: "1AA-NAIL-GUN",
    name: "Manual Heavy-Duty Wall Fastener Concrete Steel Nail Gun",
    category: "Home Improvement",
    baseCost: 680,
    fairPrice: 780, // 680 + 100
    marketPrice: 1999,
    cartonSize: 10,
    inStock: 420,
    highlight: "Low-noise manual ceiling & masonry rivet fastener with steel pins",
    image: "/products/1aa-nail-gun.jpg",
    dimensions: "33 x 11 x 3 cm",
    weight: "1.15 kg / set",
    warranty: "12 Months Mechanical Core Guarantee",
    material: "Industrial Forged Tungsten Alloy Steel + Rubber Anti-Slip Grip",
    leadTime: "Same Day Mysore Dispatch",
    specs: [
      "Shoots through red brick, concrete walls & 3mm steel plate in 0.1 seconds",
      "Integrated 5-stage silencing muffler eliminates excessive job-site noise",
      "No electricity, compressors, or gas canisters needed — purely manual kinetic drive",
      "Includes safety goggles, cleaning brush, protective gloves & starter drive pins"
    ]
  },
  {
    id: "prod-011",
    sku: "1AA-SHOE-COVR",
    name: "Waterproof Silicone Elastic Rain Shoe Covers (Reusable Non-Slip)",
    category: "Monsoon & Travel",
    baseCost: 85,
    fairPrice: 185, // 85 + 100
    marketPrice: 349,
    cartonSize: 100,
    inStock: 2100,
    highlight: "100% thick silicone stretch with anti-skid tire tread sole",
    image: "/products/1aa-shoe-covr.jpg",
    dimensions: "Universal stretch fit (Size Medium & Large)",
    weight: "160g / pair",
    warranty: "100% Waterproof Tear Guarantee",
    material: "100% High-Elastic Tensile Food-Grade Silicone",
    leadTime: "Same Day Mysore Dispatch",
    specs: [
      "Seamless molded silicone construction blocks 100% of rain, slush & mud",
      "Deep tire-pattern tread pattern prevents slip on wet tiles and smooth roads",
      "Foldable into pocket or bag; wash clean with simple tap water rinse",
      "Fits sneakers, formal leather shoes, and daily footwear seamlessly"
    ]
  },
  {
    id: "prod-012",
    sku: "1AA-COB-LIGHT",
    name: "Multi-Function COB Keychain Rechargeable Work Light & Opener",
    category: "Automotive & Tools",
    baseCost: 95,
    fairPrice: 195, // 95 + 100
    marketPrice: 499,
    cartonSize: 100,
    inStock: 1850,
    highlight: "800-lumen floodlight, 180° folding stand, magnet base & carabiner",
    image: "/products/1aa-cob-light.jpg",
    dimensions: "6 x 4.2 x 2 cm",
    weight: "45g / unit",
    warranty: "6 Months Electronic Circuit Replacement",
    material: "Aviation-Grade Anodized Aluminum Alloy + High-Lumen COB Matrix",
    leadTime: "Same Day Mysore Dispatch",
    specs: [
      "High-output 800-lumen wide-angle COB LED with 4 lighting modes",
      "Strong neodymium magnetic back mounts onto any car hood or metal surface",
      "Built-in heavy-duty bottle opener, carabiner clip & standard tripod screw hole",
      "USB Type-C fast rechargeable with integrated 500mAh lithium polymer battery"
    ]
  },
];
