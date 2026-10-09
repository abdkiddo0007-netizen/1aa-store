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
  CheckCircle2,
  Copy,
  Plus,
  Eye,
  Check,
  Navigation,
  Radio,
  Volume2,
  VolumeX,
  Languages,
  Rotate3d,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  Mic,
  Crown,
  MessageCirclePlus
} from "lucide-react";

interface AIAssistantAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (sku: string, delta: number) => void;
  onSelectProduct: (product: Product) => void;
  selectedHotline?: string;
  activeCartTotal?: number;
  activeCartUnits?: number;
  onTrackOrder?: (orderRef: string) => void;
  onOpenArProduct?: (product: Product) => void;
  currentUser?: {
    username: string;
    mobile: string;
    city: string;
    merchantType: string;
  } | null;
}

interface ChatMessage {
  id: string;
  sender: "agent" | "user";
  text: string;
  time: string;
  suggestedProducts?: Product[];
  actionType?: "escalate" | "delivery" | "payment" | "catalog" | "sample" | "calculator" | "tracking" | "ar_preview";
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
  onOpenArProduct,
  currentUser,
}: AIAssistantAgentModalProps) {
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [addedSku, setAddedSku] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<"en" | "hi" | "kn" | "ta">("en");
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"modal" | "docked">("modal");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<"gpt-4.5" | "deepseek-r1" | "gemini-flash">("gpt-4.5");
  const [isMicListening, setIsMicListening] = useState(false);

  const getWelcomeText = () => {
    const greeting = currentUser ? `Welcome back, **${currentUser.username}**! 👋` : `Hello & Welcome to 1AA! 👋`;
    return (
      `${greeting} I am your **1AA Sourcing AI Copilot** (ChatGPT Style) powered by direct factory feeds from our Mysore Central Facility.\n\n` +
      `**How I can assist your business today:**\n` +
      `• 🧸 **Trending Toys & STEM Games** (87 factory SKUs in stock)\n` +
      `• 🧮 **Wholesale ROI & Carton Profit Calculator**\n` +
      `• 🚚 **Exact Delivery Transit SLA** for your city\n` +
      `• 👓 **3D AR Product Tryout** ("Try Before You Buy")\n` +
      `• 📦 **Pre-dispatch Bench Tested Samples** (100% QA pass)\n` +
      `• 🏦 **Verified Axis Bank & UPI Remittance** (Abdul Darvesh)\n` +
      `• 👤 Direct escalation to senior management on WhatsApp`
    );
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "agent",
      text: getWelcomeText(),
      time: "Just now",
      actionType: "delivery",
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

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

  // Voice dictation in prompt bar
  const toggleMicInput = () => {
    haptics.light();
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please type your query.");
      return;
    }

    if (isMicListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsMicListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = selectedLang === "hi" ? "hi-IN" : selectedLang === "kn" ? "kn-IN" : selectedLang === "ta" ? "ta-IN" : "en-IN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsMicListening(true);
        haptics.medium();
      };

      recognition.onresult = (e: any) => {
        const spoken = e.results?.[0]?.[0]?.transcript;
        if (spoken) {
          setInput((prev) => (prev ? `${prev} ${spoken}` : spoken));
          haptics.success();
        }
        setIsMicListening(false);
      };

      recognition.onerror = () => {
        setIsMicListening(false);
      };

      recognition.onend = () => {
        setIsMicListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsMicListening(false);
    }
  };

  const handleNewChat = () => {
    haptics.medium();
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: "agent",
        text: getWelcomeText(),
        time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        actionType: "delivery",
      }
    ]);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  if (!isOpen) return null;

  // Multilingual Quick Action Chips
  const MULTILINGUAL_CHIPS: Record<"en" | "hi" | "kn" | "ta", { label: string; query: string }[]> = {
    en: [
      { label: "🛰️ Track My Package (Live Radar)", query: "How do I track my package in real-time?" },
      { label: "🧸 Trending Toys (87 SKUs)", query: "What are the trending toys?" },
      { label: "👓 3D AR Product Tryout", query: "Can I inspect products in 3D AR before buying?" },
      { label: "🚀 High Margin Items (>58%)", query: "Show me high margin products for resellers" },
      { label: "⚡ Smart Tech & Electronics", query: "Show me electronics and smart tech gadgets" },
      { label: "🍳 Kitchen & Utility", query: "Show me popular kitchen and home utility items" },
      { label: "🚚 Delivery Timelines", query: "What are your delivery timelines?" },
      { label: "📍 Check City Transit ETA", query: "Check delivery transit time for my city" },
      { label: "👑 20% Margin (Customer is King)", query: "How does your pricing model work and why is there no bargaining?" },
      { label: "📦 Sample Pack & Bench QA", query: "Can I order 1 piece sample first?" },
      { label: "🏦 Bank Remittance & UPI QR", query: "What are your verified payment details?" },
      { label: "👤 Speak with Abdul Darvesh", query: "I want to talk to Abdul Darvesh directly" },
    ],
    hi: [
      { label: "🛰️ पार्सल लाइव ट्रैक करें", query: "मेरा पार्सल लाइव कैसे ट्रैक करें?" },
      { label: "🧸 ट्रेंडिंग खिलौने (87 SKUs)", query: "ट्रेंडिंग खिलौने कौन से हैं?" },
      { label: "👓 3D AR में देखें", query: "क्या मैं प्रोडक्ट्स को 3D AR में देख सकता हूँ?" },
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
    let action: ChatMessage["actionType"] = undefined;
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

    // 0.5. AR Try Before You Buy
    if (q.includes("ar") || q.includes("3d") || q.includes("try before you buy") || q.includes("camera") || q.includes("inspect")) {
      suggested = [
        CATALOG_PRODUCTS.find(p => p.sku === "1AA-KETL-FOLD") || CATALOG_PRODUCTS[0],
        CATALOG_PRODUCTS.find(p => p.sku === "1AA-RC-DRIFT4WD") || CATALOG_PRODUCTS[1],
        CATALOG_PRODUCTS.find(p => p.sku === "1AA-VAC-120W") || CATALOG_PRODUCTS[2],
      ];
      replyText = 
        `🕶️ **1AA 3D AR Studio ("Try Before You Buy"):**\n\n` +
        `You can inspect any product in full **360° interactive 3D orbit** or project it in real size directly onto your desk or warehouse floor using your camera!\n\n` +
        `• 📐 **Real Dimensional Overlays**: Exact height, width, and volume measurements.\n` +
        `• 🔬 **Studio / Hologram / Wireframe Modes**: Inspect industrial fit & finish.\n` +
        `• 📱 **Live AR Camera**: Tap **Inspect in 3D AR** on any product below to start!`;
      action = "ar_preview";
      return { text: replyText, suggestedProducts: suggested, actionType: action };
    }

    // 1. Trending Toys & STEM Games
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
        `🧸 **Trending Toys & STEM Games from Mysore Facility (87+ SKUs in Stock):**\n\n` +
        `Here are **${suggested.length} of our top-selling toys & educational games** with high consumer demand and **40% to 65% retail margins** for shopkeepers.\n\n` +
        `Every unit is pre-inspected at our Mysore bench facility. Click **Add to Cart**, tap **3D AR** to test in your space, or inspect full specs:`;
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
    // 5. Delivery SLA Timelines
    else if (q.includes("delivery") || q.includes("timeline") || q.includes("how long") || q.includes("when will") || q.includes("dispatch") || q.includes("shipping")) {
      replyText = 
        `🚚 **1AA Official Delivery Policy & Timelines:**\n\n` +
        `• 📦 **Standard Dispatch & Delivery:** **10–15 Days** post-payment confirmation.\n` +
        `• ⚡ **Express Priority Shipping:** **Within 7 Days** post-payment confirmation.\n` +
        `• 🏢 **Dispatch Hub:** Mysore Central Facility, Karnataka, India.\n` +
        `• 🛡️ **Quality Protocol:** Every single box undergoes physical bench QA testing before being taped and handed to BlueDart / Delhivery.\n\n` +
        `*Would you like to check the exact transit ETA for your specific city? Type your city name (e.g. Bangalore, Delhi, Mumbai, Hyderabad).*`;
      action = "delivery";
    }
    // 6. Pricing Model / Customer is King
    else if (q.includes("bargain") || q.includes("negotiat") || q.includes("discount") || q.includes("pricing") || q.includes("20%") || q.includes("25%") || q.includes("king")) {
      replyText = 
        `👑 **Customer is King: No-Bargain Fair Price Policy**\n\n` +
        `At 1AA, we do not artificially inflate prices just to offer fake discounts. Our formula is 100% transparent:\n\n` +
        `📐 **Base Price (with Tax) + Doorstep Courier Freight + Flat 20% 1AA Operating Margin = Final Wholesale Price**\n\n` +
        `• Why bargain when you are already getting genuine factory-floor wholesale rates?\n` +
        `• You save **40% to 70%** compared to Amazon, Flipkart, and local middlemen.\n` +
        `• All items come with guaranteed Zero-DOA pre-dispatch inspection at our Mysore facility.`;
      action = "payment";
    }
    // 7. Payment / Bank Remittance / UPI Details
    else if (q.includes("payment") || q.includes("bank") || q.includes("upi") || q.includes("account") || q.includes("qr") || q.includes("axis") || q.includes("pay")) {
      replyText = 
        `🏦 **1AA Official & Verified Remittance Channels:**\n\n` +
        `Please transfer order amounts strictly to the following verified business account:\n\n` +
        `• **Account Holder:** Abdul Darvesh\n` +
        `• **Bank Name:** Axis Bank\n` +
        `• **Account Number:** \`922010002282280\`\n` +
        `• **IFSC Code:** \`UTIB0004543\`\n` +
        `• **Branch:** Axis Bank Mysore\n` +
        `• **UPI ID:** \`7406231167@axisbank\`\n` +
        `• **Direct Owner Hotline:** +91 74062 31167\n\n` +
        `⚠️ *Packing and dispatch SLA begins immediately upon receipt of payment screenshot on WhatsApp.*`;
      action = "payment";
    }
    // 8. Human Escalation / Speak with Abdul Darvesh
    else if (q.includes("abdul") || q.includes("human") || q.includes("person") || q.includes("talk") || q.includes("call") || q.includes("whatsapp") || q.includes("contact") || q.includes("owner")) {
      replyText = 
        `👤 **Direct Escalation to Senior Leadership:**\n\n` +
        `You can connect directly with **Abdul Darvesh** for bulk container orders, custom brand white-labeling, or credit accounts:\n\n` +
        `• 📱 **WhatsApp & Call:** +91 74062 31167\n` +
        `• ✉️ **Email:** 1aaavailablealways@gmail.com\n\n` +
        `Tap the button below to start a pre-filled direct WhatsApp discussion.`;
      action = "escalate";
    }
    // 9. Sample Pack Inquiry
    else if (q.includes("sample") || q.includes("1 piece") || q.includes("one piece") || q.includes("single")) {
      suggested = CATALOG_PRODUCTS.slice(0, 4);
      replyText = 
        `📦 **1AA Sample Order Policy:**\n\n` +
        `Yes! You can order **1 piece sample** of any product to physically inspect the build quality, retail packaging, and materials before placing full master carton orders.\n\n` +
        `• Samples include full door courier freight.\n` +
        `• Tested on our Mysore QA bench before dispatch.\n` +
        `• Sample costs are credited back to your account when you order full cartons!`;
      action = "sample";
    }
    // Default Fallback
    else {
      suggested = CATALOG_PRODUCTS.slice(0, 4);
      replyText = 
        `I understand you're inquiring about **"${userQuery}"**.\n\n` +
        `As your **1AA Sourcing AI Copilot**, I have real-time access to our 225+ direct factory catalog lines, Mysore inventory levels, and logistics SLA timetables.\n\n` +
        `Here are quick actions you can take, or ask me for specific categories like **Toys**, **Smart Tech**, **Kitchen Utility**, or **City Delivery ETA**:`;
      action = "catalog";
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

    if (currentUser) {
      text += `*Registered Merchant:*\n• Name: ${currentUser.username}\n• Mobile: ${currentUser.mobile}\n• City: ${currentUser.city}\n• Tier: ${currentUser.merchantType}\n\n`;
    }

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

  // Docked vs Modal Container Styles
  const isDocked = viewMode === "docked";

  return (
    <div 
      className={
        isDocked
          ? "fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-50 w-[94vw] sm:w-[460px] h-[640px] max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-white/20 bg-obsidian-950/95 backdrop-blur-2xl animate-in slide-in-from-bottom-5 duration-300"
          : "fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200"
      }
      onClick={(e) => {
        if (!isDocked && e.target === e.currentTarget) {
          haptics.light();
          onClose();
        }
      }}
    >
      <div 
        className={
          isDocked
            ? "w-full h-full flex flex-row overflow-hidden relative"
            : "relative w-full max-w-4xl bg-obsidian-900 border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-row h-[92dvh] sm:h-[88vh] max-h-[820px] backdrop-blur-2xl"
        }
      >
        
        {/* --- CHATGPT STYLE SIDEBAR --- */}
        <div 
          className={`
            ${sidebarOpen ? "w-64" : "w-0 md:w-64"} 
            transition-all duration-300 ease-in-out bg-obsidian-950 border-r border-white/10 flex flex-col shrink-0 overflow-hidden
            ${sidebarOpen ? "absolute inset-y-0 left-0 z-40 md:relative" : "hidden md:flex"}
          `}
        >
          {/* Sidebar Top: New Chat */}
          <div className="p-3 border-b border-white/10 space-y-2">
            <button
              onClick={handleNewChat}
              className="w-full py-2.5 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white font-bold text-xs flex items-center justify-between transition-all cursor-pointer group shadow-sm active:scale-95"
            >
              <span className="flex items-center gap-2">
                <MessageCirclePlus className="w-4 h-4 text-brand-orange group-hover:rotate-12 transition-transform" />
                <span>New Sourcing Chat</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">⌘K</span>
            </button>
          </div>

          {/* Quick Discussion Topics / Session Templates */}
          <div className="flex-1 p-2 space-y-1 overflow-y-auto text-xs">
            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Quick Sourcing Channels
            </div>

            {[
              { title: "🧸 Trending Toys (87 SKUs)", query: "What are the trending toys?" },
              { title: "👓 3D AR Tryout Studio", query: "Can I inspect products in 3D AR before buying?" },
              { title: "🚀 High Margin Reseller Items", query: "Show me high margin products for resellers" },
              { title: "🚚 Mysore Delivery SLA", query: "What are your delivery timelines?" },
              { title: "👑 20% Fair Price Guarantee", query: "How does your pricing model work and why is there no bargaining?" },
              { title: "📦 1-Piece Sample Pack", query: "Can I order 1 piece sample first?" },
              { title: "🏦 Axis Bank & UPI Remittance", query: "What are your verified payment details?" },
              { title: "👤 Speak with Abdul Darvesh", query: "I want to talk to Abdul Darvesh directly" },
            ].map((topic, idx) => (
              <button
                key={idx}
                onClick={() => {
                  handleSend(topic.query);
                  if (window.innerWidth < 768) setSidebarOpen(false);
                }}
                className="w-full text-left py-2 px-2.5 rounded-xl hover:bg-white/[0.06] text-slate-300 hover:text-white transition-all truncate flex items-center gap-2 cursor-pointer group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-brand-orange/60 group-hover:bg-brand-orange shrink-0" />
                <span className="truncate">{topic.title}</span>
              </button>
            ))}
          </div>

          {/* User Profile Card at Sidebar Bottom */}
          <div className="p-3 border-t border-white/10 bg-obsidian-900/60">
            {currentUser ? (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-orange to-brand-blue flex items-center justify-center text-obsidian-950 font-black text-xs shrink-0">
                  {currentUser.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-xs truncate flex items-center gap-1">
                    <span>{currentUser.username}</span>
                    <Crown className="w-3 h-3 text-amber-400 shrink-0" />
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize truncate">
                    Verified {currentUser.merchantType} • {currentUser.city}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-slate-300 shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="text-[11px]">
                  <span className="text-white font-semibold">Guest Merchant</span>
                  <div className="text-[9px] text-slate-400">Sign in for VIP rates</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- MAIN CHAT PANE --- */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-obsidian-900 relative">
          
          {/* Apple-Style Glass Chat Header */}
          <div className="sticky top-0 z-30 shrink-0 px-3.5 py-2.5 sm:px-5 sm:py-3 bg-obsidian-950/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between gap-2">
            
            <div className="flex items-center gap-2.5">
              {/* Toggle Sidebar Button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Toggle Sidebar"
              >
                {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
              </button>

              <div className="relative">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-brand-blue to-brand-orange p-0.5 shadow-glow-orange shrink-0">
                  <div className="w-full h-full rounded-2xl bg-obsidian-950 flex items-center justify-center text-white">
                    <Bot className="w-4 h-4 text-brand-orange" />
                  </div>
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-obsidian-950 animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-white text-xs sm:text-sm">1AA Sourcing Copilot</span>
                  
                  {/* Model Selector Dropdown */}
                  <select
                    value={selectedModel}
                    onChange={(e) => {
                      haptics.selection();
                      setSelectedModel(e.target.value as any);
                    }}
                    className="bg-white/[0.06] hover:bg-white/[0.1] text-emerald-400 font-mono font-bold text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30 outline-none cursor-pointer"
                    title="Select AI Model"
                  >
                    <option value="gpt-4.5" className="bg-obsidian-900 text-emerald-300">⚡ 1AA Omni-4.5 (Factory Engine)</option>
                    <option value="deepseek-r1" className="bg-obsidian-900 text-indigo-300">🧠 DeepSeek R1 Wholesale Reasoner</option>
                    <option value="gemini-flash" className="bg-obsidian-900 text-brand-orange">🌐 Gemini 2.5 Flash Telemetry</option>
                  </select>
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block">Mysore Central Facility • Live Inventory • Human Escalation</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Dual View Dock/Modal Toggle */}
              <button
                onClick={() => {
                  haptics.light();
                  setViewMode(isDocked ? "modal" : "docked");
                }}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white text-[11px] font-semibold transition-all cursor-pointer"
                title={isDocked ? "Expand to Full Modal" : "Dock as Copilot"}
              >
                {isDocked ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                <span>{isDocked ? "Full" : "Dock"}</span>
              </button>

              {/* Quick Human Escalation */}
              <a
                href={getEscalationWhatsAppUrl()}
                target="_blank"
                rel="noreferrer"
                onClick={() => haptics.light()}
                className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all cursor-pointer"
                title="Escalate directly to Abdul Darvesh on WhatsApp"
              >
                <Phone className="w-3 h-3" />
                <span>Talk to Owner</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  haptics.light();
                  onClose();
                }}
                className="w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.18] active:scale-95 text-slate-200 hover:text-white flex items-center justify-center border border-white/15 transition-all cursor-pointer shadow-md"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Delivery SLA Header Strip */}
          <div className="bg-gradient-to-r from-brand-blue/20 via-brand-orange/20 to-brand-blue/20 border-b border-white/[0.08] px-3.5 py-1.5 text-center text-[10px] sm:text-[11px] text-slate-300 flex items-center justify-between gap-2 flex-wrap shrink-0">
            <div className="flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-brand-orange shrink-0" />
              <span>
                <strong>Delivery Policy:</strong> Standard <span className="text-white font-bold">10-15 Days</span> • Express <span className="text-brand-orange font-bold">&lt;7 Days</span> post-payment
              </span>
            </div>

            {activeCartUnits > 0 && (
              <div className="text-[10px] font-mono bg-white/[0.08] px-2 py-0.5 rounded-full text-slate-200">
                Cart: <strong>{activeCartUnits} pcs</strong> (₹{activeCartTotal.toLocaleString("en-IN")})
              </div>
            )}
          </div>

          {/* Message Stream */}
          <div className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-4">
            {messages.map((m) => (
              <div 
                key={m.id} 
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div className="flex items-end gap-2 max-w-[96%] sm:max-w-[88%]">
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
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                          <div className="bg-white/[0.04] p-2 rounded-lg">
                            <div className="text-[10px] text-slate-400">⚡ Express Priority</div>
                            <div className="text-brand-orange font-bold">{m.transitInfo.expressDays}</div>
                          </div>
                          <div className="bg-white/[0.04] p-2 rounded-lg">
                            <div className="text-[10px] text-slate-400">🚛 Standard Surface</div>
                            <div className="text-white font-bold">{m.transitInfo.standardDays}</div>
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Couriers: <span className="text-slate-300 font-medium">{m.transitInfo.courier}</span>
                        </div>
                      </div>
                    )}

                    {/* Suggested Products Grid with 3D AR Button */}
                    {m.suggestedProducts && m.suggestedProducts.length > 0 && (
                      <div className="mt-3.5 pt-3.5 border-t border-white/10 space-y-2.5">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="font-semibold text-white">Suggested Stock Items ({m.suggestedProducts.length})</span>
                          <button
                            onClick={() => handleAddAllToCart(m.suggestedProducts!)}
                            className="px-2.5 py-1 rounded-full bg-brand-orange/20 hover:bg-brand-orange text-brand-orange hover:text-obsidian-950 font-bold text-[10px] transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add All ({m.suggestedProducts.length})</span>
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
                                      <span className="text-emerald-400">{p.inStock} ready</span>
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
                                      <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                                        Save {marginPct}%
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Card Action Buttons with 3D AR Trigger */}
                                <div className="grid grid-cols-3 gap-1.5 mt-2.5 pt-2 border-t border-white/[0.06]">
                                  {onOpenArProduct && (
                                    <button
                                      onClick={() => {
                                        haptics.selection();
                                        onOpenArProduct(p);
                                      }}
                                      className="py-1.5 px-1.5 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 text-indigo-300 hover:text-white border border-indigo-500/30 text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                                      title="Inspect in 3D AR (Try Before You Buy)"
                                    >
                                      <Rotate3d className="w-3 h-3 text-indigo-400" />
                                      <span>3D AR</span>
                                    </button>
                                  )}

                                  <button
                                    onClick={() => {
                                      haptics.selection();
                                      onSelectProduct(p);
                                    }}
                                    className="py-1.5 px-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
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
                                    className={`py-1.5 px-1.5 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
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
                                        <span>+ Cart</span>
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
          <div className="px-3 py-1.5 border-t border-white/[0.08] bg-obsidian-950/90 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Languages className="w-3 h-3 text-brand-orange" />
              <span className="font-semibold text-white text-[10px]">Language:</span>
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
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
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
          <div className="px-3 py-1.5 border-t border-white/[0.06] bg-obsidian-950/60 overflow-x-auto flex items-center gap-2 no-scrollbar shrink-0">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip.query)}
                className="py-1 px-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 hover:border-brand-orange text-[10px] text-slate-300 hover:text-white font-medium whitespace-nowrap transition-all shrink-0 active:scale-95 cursor-pointer"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input Bar with Voice Mic Dictation */}
          <div className="p-2.5 sm:p-3 bg-obsidian-950 border-t border-white/10 flex items-center gap-2 shrink-0">
            {/* Integrated Mic Button */}
            <button
              type="button"
              onClick={toggleMicInput}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer shrink-0 ${
                isMicListening
                  ? "bg-rose-500 border-rose-400 text-white animate-pulse shadow-glow-orange"
                  : "bg-white/[0.06] hover:bg-white/[0.12] border-white/10 text-slate-300 hover:text-white"
              }`}
              title={isMicListening ? "Listening... click to stop" : "Speak your sourcing question"}
            >
              {isMicListening ? <Mic className="w-4 h-4 text-white animate-bounce" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              placeholder="Ask trending toys, 3D AR, city ETA, wholesale ROI, sample pack..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              className="flex-1 py-2.5 px-3.5 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-brand-orange text-xs sm:text-sm text-white outline-none placeholder:text-slate-500 transition-colors"
            />

            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="w-10 h-10 rounded-2xl bg-gradient-to-r from-brand-orange to-brand-orange-light text-obsidian-950 font-bold flex items-center justify-center transition-all shadow-glow-orange disabled:opacity-40 disabled:pointer-events-none active:scale-95 cursor-pointer shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
