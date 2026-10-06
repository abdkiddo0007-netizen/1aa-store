import { useState, useRef, useEffect } from "react";
import { CATALOG_PRODUCTS } from "../data/catalog";
import { Product } from "../types";
import { haptics } from "../utils/haptics";
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Truck, 
  Phone, 
  MessageSquare, 
  ShoppingBag,
  ExternalLink,
  MapPin,
  Calculator,
  CheckCircle2,
  Copy,
  Plus,
  Eye,
  Check,
  Navigation,
  Radio,
  Volume2,
  VolumeX,
  Languages
} from "lucide-react";

interface AIAssistantAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (sku: string, delta: number) => void;
  onSelectProduct: (product: Product) => void;
  selectedHotline: "7598077003" | "7406231167";
  activeCartTotal?: number;
  activeCartUnits?: number;
  onTrackOrder?: (orderRef: string) => void;
}

interface ChatMessage {
  id: string;
  sender: "agent" | "user";
  text: string;
  time: string;
  suggestedProducts?: Product[];
  actionType?: "escalate" | "delivery" | "payment" | "catalog" | "sample" | "calculator" | "tracking";
  trackingRef?: string;
  transitInfo?: {
    city: string;
    expressDays: string;
    standardDays: string;
    courier: string;
  };
  calcResult?: {
    productName: string;
    units: number;
    unitPrice: number;
    totalAmount: number;
    retailValue: number;
    potentialProfit: number;
    marginPercent: number;
  };
}

// Transit SLA Database from Mysore Central Hub
const CITY_TRANSIT_DB: Record<string, { express: string; standard: string; courier: string }> = {
  bangalore: { express: "1–2 Days", standard: "3–5 Days", courier: "BlueDart Surface / Delhivery Air" },
  mysore: { express: "Same Day / Next Day", standard: "1–2 Days", courier: "Local Dispatch / Express Cargo" },
  chennai: { express: "2–3 Days", standard: "5–7 Days", courier: "BlueDart Apex Priority" },
  hyderabad: { express: "2–3 Days", standard: "5–7 Days", courier: "Delhivery Air / Surface Cargo" },
  kochi: { express: "2–3 Days", standard: "5–7 Days", courier: "BlueDart Air / SafeExpress" },
  mumbai: { express: "3–4 Days", standard: "7–9 Days", courier: "BlueDart Apex Air / Trackon" },
  pune: { express: "3–4 Days", standard: "7–9 Days", courier: "Delhivery Air / BlueDart" },
  ahmedabad: { express: "3–4 Days", standard: "8–10 Days", courier: "BlueDart / SafeExpress" },
  delhi: { express: "3–5 Days", standard: "10–12 Days", courier: "Priority Air Cargo / Delhivery" },
  jaipur: { express: "3–5 Days", standard: "10–12 Days", courier: "BlueDart / SafeExpress" },
  lucknow: { express: "4–5 Days", standard: "10–13 Days", courier: "Delhivery / BlueDart Air" },
  kolkata: { express: "4–6 Days", standard: "11–14 Days", courier: "BlueDart Apex Air Cargo" },
  patna: { express: "4–6 Days", standard: "12–14 Days", courier: "Delhivery Surface / Air" },
  guwahati: { express: "5–7 Days", standard: "13–15 Days", courier: "Priority Air Express" },
};

export default function AIAssistantAgentModal({
  isOpen,
  onClose,
  onAddToCart,
  onSelectProduct,
  selectedHotline,
  activeCartTotal = 0,
  activeCartUnits = 0,
  onTrackOrder,
}: AIAssistantAgentModalProps) {
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [addedSku, setAddedSku] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<"en" | "hi" | "kn" | "ta">("en");
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "agent",
      text: "Hello! 👋 I am your **1AA Sourcing AI Agent** live from our Mysore Central Facility.\n\nI can help you:\n• Explore **trending toys & STEM games** (87 factory SKUs)\n• Calculate **wholesale carton profits** & margins\n• Check **exact delivery transit times** for your city\n• Arrange **pre-dispatch bench QA tested samples**\n• Verify **Abdul Darvesh (Axis Bank & UPI)** remittance\n• Connect you directly with senior management on WhatsApp",
      time: "Just now",
      actionType: "delivery",
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleSpeech = (msgId: string, text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (speakingId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`•]/g, " ");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (selectedLang === "hi") utterance.lang = "hi-IN";
    else if (selectedLang === "kn") utterance.lang = "kn-IN";
    else if (selectedLang === "ta") utterance.lang = "ta-IN";
    else utterance.lang = "en-IN";

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  // Multilingual Quick Action Chips
  const MULTILINGUAL_CHIPS: Record<"en" | "hi" | "kn" | "ta", { label: string; query: string }[]> = {
    en: [
      { label: "🛰️ Track My Package (Live Radar)", query: "How do I track my package in real-time?" },
      { label: "🧸 Trending Toys (87 SKUs)", query: "What are the trending toys?" },
      { label: "🚀 High Margin Items (>58%)", query: "Show me high margin products for resellers" },
      { label: "⚡ Smart Tech & Electronics", query: "Show me electronics and smart tech gadgets" },
      { label: "🍳 Kitchen & Utility", query: "Show me popular kitchen and home utility items" },
      { label: "🚚 Delivery Timelines", query: "What are your delivery timelines?" },
      { label: "📍 Check City Transit ETA", query: "Check delivery transit time for my city" },
      { label: "💰 Cost + ₹100 Model", query: "How does your pricing model work?" },
      { label: "📦 Sample Pack & Bench QA", query: "Can I order 1 piece sample first?" },
      { label: "🏦 Bank Remittance & UPI QR", query: "What are your verified payment details?" },
      { label: "👤 Speak with Abdul Darvesh", query: "I want to talk to Abdul Darvesh directly" },
    ],
    hi: [
      { label: "🛰️ पार्सल लाइव ट्रैक करें", query: "मेरा पार्सल लाइव कैसे ट्रैक करें?" },
      { label: "🧸 ट्रेंडिंग खिलौने (87 SKUs)", query: "ट्रेंडिंग खिलौने कौन से हैं?" },
      { label: "🚀 ज्यादा मुनाफे वाले प्रोडक्ट्स (>58%)", query: "रीसेलर के लिए ज्यादा मुनाफे वाले प्रोडक्ट्स दिखाएं" },
      { label: "🚚 डिलीवरी का समय व SLA", query: "डिलीवरी का समय और नियम क्या हैं?" },
      { label: "📦 1 पीस सैंपल ऑर्डर करें", query: "क्या मैं पहले 1 पीस सैंपल मंगा सकता हूँ?" },
      { label: "🏦 बैंक व UPI QR डिटेल्स", query: "अब्दुल दरवेश का बैंक खाता और UPI डिटेल बताएं" },
      { label: "👤 अब्दुल दरवेश से बात करें", query: "मुझे अब्दुल दरवेश से सीधे बात करनी है" },
    ],
    kn: [
      { label: "🛰️ ಲೈವ್ ಪಾರ್ಸೆಲ್ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ", query: "ನನ್ನ ಪಾರ್ಸೆಲ್ ಅನ್ನು ಲೈವ್ ಟ್ರ್ಯಾಕ್ ಮಾಡುವುದು ಹೇಗೆ?" },
      { label: "🧸 ಟ್ರೆಂಡಿಂಗ್ ಆಟಿಕೆಗಳು (87 SKUs)", query: "ಟ್ರೆಂಡಿಂಗ್ ಆಟಿಕೆಗಳನ್ನು ತೋರಿಸಿ" },
      { label: "🚀 ಅತಿ ಹೆಚ್ಚು ಲಾಭದ ಐಟಂಗಳು", query: "ಹೆಚ್ಚು ಲಾಭದ ಪ್ರಾಡಕ್ಟ್‌ಗಳನ್ನು ತೋರಿಸಿ" },
      { label: "🚚 ವಿತರಣಾ ಸಮಯ (10-15 ದಿನಗಳು)", query: "ಡೆಲಿವರಿ ಸಮಯ ಎಷ್ಟು ದಿನ?" },
      { label: "📦 1 ಪೀಸ್ ಸ್ಯಾಂಪಲ್ ಆರ್ಡರ್", query: "ನಾನು ಮೊದಲು 1 ಪೀಸ್ ಸ್ಯಾಂಪಲ್ ಪಡೆಯಬಹುದೇ?" },
      { label: "🏦 ಬ್ಯಾಂಕ್ & UPI ವಿವರಗಳು", query: "ಅಬ್ದುಲ್ ದರ್ವೇಶ್ ಅವರ ಬ್ಯಾಂಕ್ ವಿವರ ತಿಳಿಸಿ" },
      { label: "👤 ಅಬ್ದುಲ್ ದರ್ವೇಶ್ ಅವರೊಂದಿಗೆ ಮಾತನಾಡಿ", query: "ನಾನು ನೇರವಾಗಿ ಅಬ್ದುಲ್ ದರ್ವೇಶ್ ಅವರೊಂದಿಗೆ ಮಾತನಾಡಬೇಕು" },
    ],
    ta: [
      { label: "🛰️ பார்சல் லைவ் டிராக்கிங்", query: "எனது பார்சலை லைவாக டிராக்கிங் செய்வது எப்படி?" },
      { label: "🧸 டிரெண்டிங் பொம்மைகள் (87 SKUs)", query: "டிரெண்டிங் பொம்மைகளைக் காட்டுங்கள்" },
      { label: "🚀 அதிக லாபம் தரும் பொருட்கள்", query: "அதிக லாபம் தரும் பொருட்களைக் காட்டுங்கள்" },
      { label: "🚚 டெலிவரி நேரம் & SLA", query: "டெலிவரி கால அளவு என்ன?" },
      { label: "📦 1 பீஸ் மாதிரி ஆர்டர்", query: "நான் 1 பீஸ் மாதிரி ஆர்டர் செய்யலாமா?" },
      { label: "🏦 வங்கி & UPI விவரம்", query: "அப்துல் தர்வேஷ் வங்கி மற்றும் UPI விவரங்கள் என்ன?" },
      { label: "👤 அப்துல் தர்வேஷிடம் பேசவும்", query: "அப்துல் தர்வேஷிடம் நேரடியாக பேச வேண்டும்" },
    ],
  };

  const quickChips = MULTILINGUAL_CHIPS[selectedLang] || MULTILINGUAL_CHIPS.en;

  // Natural Language Understanding & Answer Generation
  const processQuery = (userQuery: string): Partial<ChatMessage> => {
    const q = userQuery.toLowerCase().trim();
    let replyText = "";
    let suggested: Product[] | undefined = undefined;
    let action: "escalate" | "delivery" | "payment" | "catalog" | "sample" | "calculator" | "tracking" | undefined = undefined;
    let transitInfo: ChatMessage["transitInfo"] = undefined;
    let calcResult: ChatMessage["calcResult"] = undefined;

    // Check if query is looking up a specific city
    for (const [cityKey, data] of Object.entries(CITY_TRANSIT_DB)) {
      if (q.includes(cityKey)) {
        const cityName = cityKey.charAt(0).toUpperCase() + cityKey.slice(1);
        replyText = 
          `📍 **Transit SLA to ${cityName} (from Mysore Central Hub):**\n\n` +
          `• ⚡ **Express Priority Air:** **${data.express}** post-payment confirmation.\n` +
          `• 🚛 **Standard Surface Cargo:** **${data.standard}** post-payment confirmation.\n` +
          `• 📦 **Logistics Partners:** ${data.courier}.\n\n` +
          `*Note: Physical bench testing and packing begins immediately upon Axis Bank / UPI payment verification.*`;
        transitInfo = {
          city: cityName,
          expressDays: data.express,
          standardDays: data.standard,
          courier: data.courier,
        };
        action = "delivery";
        return { text: replyText, suggestedProducts: suggested, actionType: action, transitInfo };
      }
    }

    // 0. Real-time Cargo & Package Tracking
    if (
      q.includes("track") ||
      q.includes("where is my") ||
      q.includes("package") ||
      q.includes("parcel") ||
      q.includes("awb") ||
      q.includes("docket") ||
      q.includes("consignment") ||
      q.includes("lorry receipt") ||
      q.includes("dispatch status") ||
      q.startsWith("1aa-")
    ) {
      const refMatch = userQuery.match(/1AA-[A-Za-z0-9-]+/i);
      const matchedRef = refMatch ? refMatch[0].toUpperCase() : undefined;

      replyText = 
        `🛰️ **1AA Real-Time Cargo Radar & Package Tracking:**\n\n` +
        `Every consignment departing our Mysore Central Facility is monitored across our **6-Stage Quality & Transit Pipeline**:\n\n` +
        `1️⃣ **Remittance Verified**: Reconciled by Abdul Darvesh in Axis Bank (A/c 922010002282280)\n` +
        `2️⃣ **Mysore Bench QA**: 100% pre-dispatch physical testing (Zero Defect Certification)\n` +
        `3️⃣ **Export Packaging**: 5-ply reinforced outer carton with holographic tamper seals\n` +
        `4️⃣ **Courier Handover**: Transferred to BlueDart Apex Air / Delhivery Express Cargo\n` +
        `5️⃣ **Line-Haul In-Transit**: Active satellite GPS radar with temperature & shock sensors\n` +
        `6️⃣ **Out for Delivery**: Doorstep delivery with 4-digit verification OTP\n\n` +
        `Click **Launch Live Satellite Radar** below to view real-time checkpoint telemetry, GPS flight path, and print your commercial Lorry Receipt (LR)!`;
      action = "tracking";
      return { text: replyText, actionType: action, trackingRef: matchedRef };
    }

    // 1. Trending Toys & STEM Games (Fix for User Bug)
    if (
      q.includes("toy") ||
      q.includes("kid") ||
      q.includes("game") ||
      q.includes("stem") ||
      q.includes("puzzle") ||
      q.includes("play") ||
      q.includes("baby") ||
      q.includes("doll") ||
      q.includes("clay")
    ) {
      suggested = CATALOG_PRODUCTS.filter(
        (p) =>
          p.category === "Toys & STEM Games" ||
          p.name.toLowerCase().includes("toy") ||
          p.name.toLowerCase().includes("game") ||
          p.name.toLowerCase().includes("stem") ||
          p.name.toLowerCase().includes("puzzle") ||
          p.highlight.toLowerCase().includes("toy") ||
          p.highlight.toLowerCase().includes("kid")
      ).slice(0, 6);

      replyText = 
        `🧸 **Trending Toys & STEM Games from Mysore Facility (81+ SKUs in Stock):**\n\n` +
        `Here are **${suggested.length} of our top-selling toys & educational games** with high consumer demand and **40% to 65% retail margins** for shopkeepers.\n\n` +
        `Every unit is pre-inspected at our Mysore bench facility. Click **Add to Cart** or tap any item to inspect full specs:`;
      action = "catalog";
    }
    // 2. High margin / Reseller Top Picks
    else if (q.includes("high margin") || q.includes("reseller") || q.includes("best margin") || q.includes("highest profit") || q.includes("top pick")) {
      suggested = CATALOG_PRODUCTS.filter(
        (p) => ((p.marketPrice - p.fairPrice) / p.marketPrice) >= 0.58
      ).slice(0, 6);
      replyText = 
        `🚀 **Highest-ROI Products for Resellers (>58% Gross Margin):**\n\n` +
        `These items provide the maximum price delta between 1AA direct factory pricing and Amazon/Flipkart retail rates:`;
      action = "catalog";
    }
    // 3. Electronics & Smart Tech
    else if (
      q.includes("electronic") ||
      q.includes("tech") ||
      q.includes("watch") ||
      q.includes("smart") ||
      q.includes("trimmer") ||
      q.includes("headphone") ||
      q.includes("speaker") ||
      q.includes("cable") ||
      q.includes("charger") ||
      q.includes("gadget")
    ) {
      suggested = CATALOG_PRODUCTS.filter(
        (p) =>
          p.category === "Electronics & Smart Tech" ||
          p.category === "Appliances & Comfort" ||
          p.name.toLowerCase().includes("smart") ||
          p.name.toLowerCase().includes("wireless") ||
          p.name.toLowerCase().includes("trimmer")
      ).slice(0, 6);
      replyText = 
        `⚡ **Direct Factory Electronics & Smart Tech:**\n\n` +
        `Here are trending personal electronics and smart tech gadgets ready for immediate Mysore dispatch:`;
      action = "catalog";
    }
    // 4. Kitchen, Home & Utility
    else if (
      q.includes("kitchen") ||
      q.includes("home") ||
      q.includes("kettle") ||
      q.includes("clean") ||
      q.includes("mop") ||
      q.includes("dining") ||
      q.includes("cook") ||
      q.includes("utility")
    ) {
      suggested = CATALOG_PRODUCTS.filter(
        (p) =>
          p.category === "Home, Kitchen & Utility" ||
          p.category === "Kitchen & Dining" ||
          p.category === "Kitchen & Travel" ||
          p.category === "Home Improvement"
      ).slice(0, 6);
      replyText = 
        `🍳 **Home, Kitchen & Smart Utility Fast Movers:**\n\n` +
        `Popular daily household essentials with proven retail velocity and zero defect returns:`;
      action = "catalog";
    }
    // 5. Stationery & Desk Supplies
    else if (
      q.includes("stationery") ||
      q.includes("pen") ||
      q.includes("pencil") ||
      q.includes("desk") ||
      q.includes("book") ||
      q.includes("geometry") ||
      q.includes("note")
    ) {
      suggested = CATALOG_PRODUCTS.filter(
        (p) => p.category === "Stationery & Desk Supplies"
      ).slice(0, 6);
      replyText = 
        `✏️ **Stationery & Desk Supplies (School & Office Wholesale):**\n\n` +
        `High-volume school and institutional stationery items available at direct factory base rates:`;
      action = "catalog";
    }
    // 6. Jewellery & Accessories
    else if (
      q.includes("jewel") ||
      q.includes("necklace") ||
      q.includes("earring") ||
      q.includes("ring") ||
      q.includes("bangle") ||
      q.includes("accessories")
    ) {
      suggested = CATALOG_PRODUCTS.filter(
        (p) => p.category === "Jewellery & Accessories"
      ).slice(0, 6);
      replyText = 
        `💎 **Fashion Jewellery & Accessories:**\n\n` +
        `Top trending fashion jewellery, earrings, and lifestyle accessories direct from primary manufacturers:`;
      action = "catalog";
    }
    // 7. Budget / Under 150 items
    else if (q.includes("under 150") || q.includes("under 100") || q.includes("cheap") || q.includes("low cost") || q.includes("budget")) {
      suggested = CATALOG_PRODUCTS.filter((p) => p.fairPrice <= 150).slice(0, 6);
      replyText = 
        `⚡ **High-Velocity Fast Movers (Under ₹150):**\n\n` +
        `These items have ultra-low entry costs, making them perfect for fast counter sales and impulse purchases:`;
      action = "catalog";
    }
    // 8. Delivery timeline inquiry / city check
    else if (q.includes("delivery") || q.includes("shipping") || q.includes("timeline") || q.includes("how long") || q.includes("days") || q.includes("dispatch") || q.includes("transit") || q.includes("city")) {
      replyText = 
        "📦 **Official 1AA Delivery & Shipment Policy:**\n\n" +
        "• 🚛 **Standard Surface Delivery:** **10 to 15 Days** post-payment confirmation (Insured Heavy Cargo via BlueDart, Delhivery & SafeExpress).\n" +
        "• ⚡ **Express Priority Air Dispatch:** **Within 7 Days** post-payment confirmation (Priority Air Freight).\n\n" +
        "⚙️ **Dispatch SLA:** All parcels are dispatched from our **Mysore Central Facility** within 24 hours of payment verification. Every piece passes bench testing with zero dead-on-arrival (DOA) guarantee.\n\n" +
        "👉 *Type your city name (e.g., Bangalore, Delhi, Mumbai, Hyderabad, Kolkata) to see exact transit days!*";
      action = "delivery";
    }
    // 9. Sample pack & quality testing
    else if (q.includes("sample") || q.includes("1 piece") || q.includes("test") || q.includes("quality") || q.includes("bench") || q.includes("trial")) {
      replyText = 
        "🧪 **1AA Pre-Dispatch Sample Order Protocol:**\n\n" +
        "• **Single Piece Sample:** You can order a 1-piece sample at the standard transparent Fair Price (Cost + ₹100).\n" +
        "• **Mysore Bench QA Video:** Before sealing the box, our team tests the product (battery, motor, ports, finish) and sends an unboxing test video directly to your WhatsApp.\n" +
        "• **Carton Restock Rebate:** When you subsequently place a carton order (50+ units), the ₹100 sample handling fee is credited back in full on your invoice!";
      action = "sample";
    }
    // 10. Wholesale Carton & Profit Margin Calculation
    else if (q.includes("calculate") || q.includes("margin") || q.includes("carton") || q.includes("box") || q.includes("profit") || q.includes("roi") || q.includes("bulk")) {
      const sampleProd = CATALOG_PRODUCTS.find(p => p.sku === "1AA-TY-001") || CATALOG_PRODUCTS[0];
      const units = 50; // 1 carton
      const unitPrice = sampleProd.fairPrice - 25; // Tier discount
      const totalAmount = unitPrice * units;
      const retailValue = sampleProd.marketPrice * units;
      const potentialProfit = retailValue - totalAmount;
      const marginPercent = Math.round((potentialProfit / retailValue) * 100);

      replyText = 
        `💡 **Sample Wholesale Carton Calculation:**\n\n` +
        `• **Product:** ${sampleProd.name} [${sampleProd.sku}]\n` +
        `• **Carton Quantity:** 50 units (1 Master Box)\n` +
        `• **Factory Fair Price:** ₹${unitPrice}/pc (incl. ₹25/unit B2B Volume Rebate)\n` +
        `• **Total Procurement Cost:** ₹${totalAmount.toLocaleString("en-IN")}\n` +
        `• **Retail Value (Flipkart/Amazon MRP):** ₹${retailValue.toLocaleString("en-IN")}\n` +
        `• **Your Gross Reseller Margin:** **₹${potentialProfit.toLocaleString("en-IN")} (${marginPercent}% Profit)**\n\n` +
        `Would you like to customize quantities or add items to your cart?`;
      action = "calculator";
      calcResult = {
        productName: sampleProd.name,
        units,
        unitPrice,
        totalAmount,
        retailValue,
        potentialProfit,
        marginPercent,
      };
      suggested = [sampleProd];
    }
    // 11. Escalation / Speak with Abdul Darvesh
    else if (q.includes("human") || q.includes("speak") || q.includes("talk") || q.includes("person") || q.includes("abdul") || q.includes("darvesh") || q.includes("call") || q.includes("contact") || q.includes("whatsapp") || q.includes("number")) {
      replyText = 
        "🤝 **Direct Escalation to Abdul Darvesh (Mysore Hub):**\n\n" +
        "You can chat live on WhatsApp or call our facility desks directly. I have prepared an instant escalation button below with your requirements and cart summary pre-attached so Abdul Darvesh has all details immediately:";
      action = "escalate";
    }
    // 12. Payment / Bank / UPI details
    else if (q.includes("payment") || q.includes("bank") || q.includes("upi") || q.includes("qr") || q.includes("account") || q.includes("pay") || q.includes("axis") || q.includes("scanner")) {
      replyText = 
        "🏦 **Official Payment & Remittance Channels (0% Surcharge):**\n\n" +
        "All remittances go directly to our verified commercial accounts:\n" +
        "• **Primary Account Holder:** **Abdul Darvesh**\n" +
        "• **Bank Name:** **Axis Bank**\n" +
        "• **Account Number:** **`922010002282280`**\n" +
        "• **IFSC Code:** **`UTIB0004543`** (Savings A/c)\n" +
        "• **Official UPI ID:** **`7406231167@axisbank`**\n" +
        "• **PhonePe Verified QR:** Accessible via the **UPI Pay** button.\n\n" +
        "🧾 Invoices and payment confirmation are transmitted to your WhatsApp & Email within 15 minutes of UTR entry.";
      action = "payment";
    }
    // 13. Pricing / Cost + 100 model
    else if (q.includes("pricing") || q.includes("cost") || q.includes("100") || q.includes("model") || q.includes("fee")) {
      replyText = 
        "💎 **1AA Open-Ledger Factory Pricing Architecture:**\n\n" +
        "• **Factory Base Cost:** Direct manufacturing and import landed rate without intermediary commissions.\n" +
        "• **1AA Fair Price:** Base Cost + Flat ₹100 handling fee per unit.\n" +
        "• **No Hidden Marketplace Cuts:** Marketplaces take 30% to 50% cuts. 1AA passes that direct savings to you.\n" +
        "• **Volume Rebate:** 50+ units: -₹25/pc | 100+ units: -₹50/pc!";
      action = "catalog";
    }
    // 14. Fallback search across catalog
    else {
      const matched = CATALOG_PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.highlight.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      ).slice(0, 6);

      if (matched.length > 0) {
        suggested = matched;
        replyText = `🔍 Found **${matched.length} matching items** from our Mysore stock for "${userQuery}":`;
        action = "catalog";
      } else {
        replyText = 
          `Thank you for asking about "${userQuery}".\n\n` +
          "Our platform maintains **225 factory-direct SKUs** in Mysore. All shipments take **10-15 days (Standard)** or **within 7 days (Express)** post-payment confirmation to Abdul Darvesh (Axis Bank).\n\n" +
          "Would you like me to connect you with **Abdul Darvesh** on WhatsApp for specialized procurement or custom volume pricing?";
        action = "escalate";
      }
    }

    return { text: replyText, suggestedProducts: suggested, actionType: action, transitInfo, calcResult };
  };

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    haptics.light();

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const result = processQuery(query);
      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: "agent",
        text: result.text || "",
        time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        suggestedProducts: result.suggestedProducts,
        actionType: result.actionType,
        transitInfo: result.transitInfo,
        calcResult: result.calcResult,
      };
      setMessages((prev) => [...prev, agentMsg]);
      setIsTyping(false);
      haptics.medium();
    }, 380);
  };

  const getEscalationWhatsAppUrl = () => {
    const lastUserQuery = messages.filter((m) => m.sender === "user").pop()?.text || "Inquiry regarding 1AA sourcing";
    let text = 
      `🚨 *CUSTOMER SOURCING INQUIRY VIA 1AA AI AGENT*\n` +
      `Date: ${new Date().toLocaleDateString("en-IN")} ${new Date().toLocaleTimeString("en-IN")}\n\n` +
      `*Customer Question/Need:*\n"${lastUserQuery}"\n\n`;

    if (activeCartUnits > 0) {
      text += `*Active Cart Summary:*\n• Total Units: ${activeCartUnits} pcs\n• Order Total: Rs. ${activeCartTotal.toLocaleString("en-IN")}\n\n`;
    }

    text += 
      `*Delivery Policy Noted:*\n• Standard: 10–15 Days | Express: Within 7 Days post-payment\n\n` +
      `Hello Abdul Darvesh, please assist me with my order fulfillment / quotation!`;

    return `https://wa.me/91${selectedHotline}?text=${encodeURIComponent(text)}`;
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    haptics.success();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddAllToCart = (products: Product[]) => {
    products.forEach((p) => {
      onAddToCart(p.sku, 1);
    });
    haptics.success();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-obsidian-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col h-[88vh] max-h-[760px] backdrop-blur-2xl">
        
        {/* Apple-Style Glass Chat Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-obsidian-900 via-obsidian-850 to-obsidian-900 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-blue to-brand-orange p-0.5 shadow-glow-orange">
                <div className="w-full h-full rounded-2xl bg-obsidian-950 flex items-center justify-center text-white">
                  <Bot className="w-5 h-5 text-brand-orange" />
                </div>
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-obsidian-950 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm sm:text-base">1AA Sourcing AI Agent</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                  Mysore Hub Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400">225+ Factory SKUs • SLA Delivery • Human Escalation</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Human Escalation */}
            <a
              href={getEscalationWhatsAppUrl()}
              target="_blank"
              rel="noreferrer"
              onClick={() => haptics.light()}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all cursor-pointer"
              title="Escalate directly to Abdul Darvesh on WhatsApp"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Talk to Abdul Darvesh</span>
            </a>

            <button
              onClick={() => {
                haptics.light();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Delivery SLA Header Strip */}
        <div className="bg-gradient-to-r from-brand-blue/20 via-brand-orange/20 to-brand-blue/20 border-b border-white/[0.08] px-4 py-2 text-center text-[11px] text-slate-300 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Truck className="w-3.5 h-3.5 text-brand-orange shrink-0" />
            <span>
              <strong>Delivery SLA:</strong> Standard: <span className="text-white font-bold">10-15 Days</span> • Express: <span className="text-brand-orange font-bold">&lt;7 Days</span> (Post-Payment)
            </span>
          </div>

          {activeCartUnits > 0 && (
            <div className="text-[10px] font-mono bg-white/[0.08] px-2.5 py-0.5 rounded-full text-slate-200">
              Cart: <strong>{activeCartUnits} pcs</strong> (₹{activeCartTotal.toLocaleString("en-IN")})
            </div>
          )}
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((m) => (
            <div 
              key={m.id} 
              className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div className="flex items-end gap-2 max-w-[95%] sm:max-w-[88%]">
                {m.sender === "agent" && (
                  <div className="w-6 h-6 rounded-full bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center text-brand-orange shrink-0 mb-1">
                    <Sparkles className="w-3 h-3" />
                  </div>
                )}

                <div 
                  className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap ${
                    m.sender === "user"
                      ? "bg-gradient-to-r from-brand-orange to-brand-orange-light text-obsidian-950 font-medium rounded-br-none shadow-glow-orange"
                      : "bg-white/[0.05] border border-white/10 text-slate-200 rounded-bl-none shadow-md backdrop-blur-md"
                  }`}
                >
                  {m.text}

                  {/* Transit Card Component if City Lookup */}
                  {m.transitInfo && (
                    <div className="mt-3 p-3 rounded-xl bg-obsidian-950/80 border border-brand-blue/30 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <span className="flex items-center gap-1.5 text-brand-orange">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Destination: {m.transitInfo.city}</span>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                          Direct Surface / Air Route
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                        <div className="p-2 rounded-lg bg-white/[0.03] border border-white/10">
                          <div className="text-slate-400 text-[10px]">Express Air</div>
                          <div className="text-brand-orange font-bold">{m.transitInfo.expressDays}</div>
                        </div>
                        <div className="p-2 rounded-lg bg-white/[0.03] border border-white/10">
                          <div className="text-slate-400 text-[10px]">Standard Surface</div>
                          <div className="text-white font-bold">{m.transitInfo.standardDays}</div>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Courier: {m.transitInfo.courier}
                      </div>
                    </div>
                  )}

                  {/* Wholesale Calculation Card */}
                  {m.calcResult && (
                    <div className="mt-3 p-3.5 rounded-xl bg-obsidian-950/90 border border-emerald-500/30 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                        <span className="flex items-center gap-1.5">
                          <Calculator className="w-3.5 h-3.5" />
                          <span>Wholesale Bulk ROI Analysis</span>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                          {m.calcResult.marginPercent}% Net Margin
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                        <div className="bg-white/[0.04] p-2 rounded-lg">
                          <div className="text-[10px] text-slate-400">Your Procurement</div>
                          <div className="text-white font-bold">₹{m.calcResult.totalAmount.toLocaleString("en-IN")}</div>
                        </div>
                        <div className="bg-white/[0.04] p-2 rounded-lg">
                          <div className="text-[10px] text-slate-400">Est. Resale Value</div>
                          <div className="text-emerald-400 font-bold">₹{m.calcResult.retailValue.toLocaleString("en-IN")}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/10 text-slate-300">
                        <span>Projected Reseller Profit:</span>
                        <span className="text-emerald-400 font-bold font-mono">+₹{m.calcResult.potentialProfit.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  )}

                  {/* Suggested Products Grid */}
                  {m.suggestedProducts && m.suggestedProducts.length > 0 && (
                    <div className="mt-3.5 pt-3.5 border-t border-white/10 space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-semibold text-white">Suggested Stock Items ({m.suggestedProducts.length})</span>
                        <button
                          onClick={() => handleAddAllToCart(m.suggestedProducts!)}
                          className="px-2.5 py-1 rounded-full bg-brand-orange/20 hover:bg-brand-orange text-brand-orange hover:text-obsidian-950 font-bold text-[10px] transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add All ({m.suggestedProducts.length}) to Cart</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {m.suggestedProducts.map((p) => {
                          const margin = p.marketPrice - p.fairPrice;
                          const marginPct = Math.round((margin / p.marketPrice) * 100);
                          const isJustAdded = addedSku === p.sku;

                          return (
                            <div 
                              key={p.id}
                              className="p-3 rounded-2xl bg-obsidian-950/80 border border-white/10 flex flex-col justify-between hover:border-brand-orange/50 transition-all group"
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  className="w-14 h-14 rounded-xl object-cover bg-obsidian-900 border border-white/10 shrink-0 cursor-pointer group-hover:scale-105 transition-transform"
                                  onClick={() => {
                                    haptics.selection();
                                    onSelectProduct(p);
                                  }}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1 text-[9px] text-brand-orange font-mono font-bold">
                                    <span>{p.sku}</span>
                                    <span className="text-white/20">•</span>
                                    <span className="text-emerald-400">{p.inStock} in stock</span>
                                  </div>
                                  <div 
                                    className="font-bold text-white text-xs truncate group-hover:text-brand-orange transition-colors cursor-pointer mt-0.5"
                                    onClick={() => {
                                      haptics.selection();
                                      onSelectProduct(p);
                                    }}
                                  >
                                    {p.name}
                                  </div>
                                  <div className="flex items-baseline gap-2 mt-1">
                                    <span className="font-mono font-black text-brand-orange text-xs sm:text-sm">₹{p.fairPrice}</span>
                                    <span className="text-[10px] text-slate-500 line-through">₹{p.marketPrice}</span>
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                                      Save ₹{margin} ({marginPct}%)
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Card Action Buttons */}
                              <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-white/[0.06]">
                                <button
                                  onClick={() => {
                                    haptics.selection();
                                    onSelectProduct(p);
                                  }}
                                  className="flex-1 py-1.5 px-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Specs</span>
                                </button>

                                <button
                                  onClick={() => {
                                    haptics.success();
                                    onAddToCart(p.sku, 1);
                                    setAddedSku(p.sku);
                                    setTimeout(() => setAddedSku(null), 1500);
                                  }}
                                  className={`flex-1 py-1.5 px-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                                    isJustAdded 
                                      ? "bg-emerald-500 text-obsidian-950 font-black shadow-glow-emerald"
                                      : "bg-brand-orange text-obsidian-950 hover:bg-brand-orange-light shadow-glow-orange"
                                  }`}
                                >
                                  {isJustAdded ? (
                                    <>
                                      <Check className="w-3 h-3 stroke-[3]" />
                                      <span>Added!</span>
                                    </>
                                  ) : (
                                    <>
                                      <ShoppingBag className="w-3 h-3" />
                                      <span>+ Add to Cart</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Contextual Action Cards inside Agent Messages */}
                  {m.actionType === "escalate" && (
                    <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-2">
                      <a
                        href={getEscalationWhatsAppUrl()}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => haptics.success()}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-obsidian-950 font-bold text-xs uppercase tracking-wider transition-all shadow-glow-emerald cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat Live with Abdul Darvesh (WhatsApp)</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {/* Tracking Action Card */}
                  {m.actionType === "tracking" && onTrackOrder && (
                    <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-obsidian-950 to-brand-blue/10 border border-emerald-500/30 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Satellite Telemetry Active</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                          Live Radar Ready
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Track the exact 6-stage checkpoint progress, live sensor telemetry, and print your official Lorry Receipt (LR) consignment slip.
                      </p>
                      <button
                        onClick={() => {
                          haptics.selection();
                          onTrackOrder(m.trackingRef || "");
                          onClose();
                        }}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-obsidian-950 font-black text-xs flex items-center justify-center gap-2 shadow-glow-emerald transition-all cursor-pointer active:scale-95"
                      >
                        <Radio className="w-3.5 h-3.5" />
                        <span>Launch Live Satellite Package Radar</span>
                      </button>
                    </div>
                  )}

                  {/* Copy & Speech Buttons */}
                  {m.sender === "agent" && (
                    <div className="mt-2.5 flex items-center justify-end gap-3">
                      <button
                        onClick={() => toggleSpeech(m.id, m.text)}
                        className={`text-[10px] flex items-center gap-1 transition-colors cursor-pointer ${
                          speakingId === m.id ? "text-brand-orange font-bold animate-pulse" : "text-slate-500 hover:text-slate-300"
                        }`}
                        title="Listen to response (Voice Readout)"
                      >
                        {speakingId === m.id ? <VolumeX className="w-3 h-3 text-brand-orange" /> : <Volume2 className="w-3 h-3" />}
                        <span>{speakingId === m.id ? "Stop Voice" : "Listen"}</span>
                      </button>

                      <button
                        onClick={() => copyToClipboard(m.text, m.id)}
                        className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {copiedId === m.id ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy info</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {m.sender === "user" && (
                  <div className="w-6 h-6 rounded-full bg-brand-blue/30 border border-brand-blue/50 flex items-center justify-center text-brand-blue-light shrink-0 mb-1">
                    <User className="w-3 h-3" />
                  </div>
                )}
              </div>

              <span className="text-[9px] text-slate-500 mt-1 px-1 font-mono">
                {m.time}
              </span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-slate-400 text-xs italic">
              <Bot className="w-4 h-4 text-brand-orange animate-spin" />
              <span>1AA AI is cross-referencing Mysore dispatch schedules & stock...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Multilingual Selector Bar */}
        <div className="px-4 py-2 border-t border-white/[0.08] bg-obsidian-950/90 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Languages className="w-3.5 h-3.5 text-brand-orange" />
            <span className="font-semibold text-white text-[11px]">AI Language:</span>
          </div>
          <div className="flex items-center gap-1.5">
            {[
              { id: "en", label: "English" },
              { id: "hi", label: "हिंदी" },
              { id: "kn", label: "ಕನ್ನಡ" },
              { id: "ta", label: "தமிழ்" },
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => {
                  haptics.selection();
                  setSelectedLang(lang.id as any);
                }}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  selectedLang === lang.id
                    ? "bg-brand-orange text-obsidian-950 shadow-glow-orange"
                    : "bg-white/[0.04] text-slate-400 hover:text-white border border-white/10"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-4 py-2 border-t border-white/[0.06] bg-obsidian-950/60 overflow-x-auto flex items-center gap-2 no-scrollbar shrink-0">
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip.query)}
              className="py-1.5 px-3 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 hover:border-brand-orange text-[11px] text-slate-300 hover:text-white font-medium whitespace-nowrap transition-all shrink-0 active:scale-95 cursor-pointer"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-obsidian-950 border-t border-white/10 flex items-center gap-2 shrink-0">
          <input
            type="text"
            placeholder="Ask trending toys, city delivery ETA, wholesale margin, or sample pack..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            className="flex-1 py-3 px-4 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-brand-orange text-xs sm:text-sm text-white outline-none placeholder:text-slate-500 transition-colors"
          />

          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="w-11 h-11 rounded-2xl bg-gradient-to-r from-brand-orange to-brand-orange-light text-obsidian-950 font-bold flex items-center justify-center transition-all shadow-glow-orange disabled:opacity-40 disabled:pointer-events-none active:scale-95 cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
