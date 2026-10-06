// Multi-Currency Sourcing Utility for 1AA Factory Direct Platform
// Supports INR (Base), USD, AED, SAR, EUR, GBP for domestic & international B2B buyers

export type CurrencyCode = "INR" | "USD" | "AED" | "SAR" | "EUR" | "GBP";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateAgainstInr: number; // 1 INR in target currency
  flag: string;
  decimals: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: {
    code: "INR",
    symbol: "₹",
    name: "Indian Rupee (INR)",
    rateAgainstInr: 1.0,
    flag: "🇮🇳",
    decimals: 0,
  },
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar (USD)",
    rateAgainstInr: 0.0114, // 1 USD ≈ ₹87.7
    flag: "🇺🇸",
    decimals: 2,
  },
  AED: {
    code: "AED",
    symbol: "AED ",
    name: "UAE Dirham (AED)",
    rateAgainstInr: 0.0418, // 1 AED ≈ ₹23.9
    flag: "🇦🇪",
    decimals: 2,
  },
  SAR: {
    code: "SAR",
    symbol: "SAR ",
    name: "Saudi Riyal (SAR)",
    rateAgainstInr: 0.0427, // 1 SAR ≈ ₹23.4
    flag: "🇸🇦",
    decimals: 2,
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    name: "Euro (EUR)",
    rateAgainstInr: 0.0105, // 1 EUR ≈ ₹95.2
    flag: "🇪🇺",
    decimals: 2,
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    name: "British Pound (GBP)",
    rateAgainstInr: 0.0089, // 1 GBP ≈ ₹112.3
    flag: "🇬🇧",
    decimals: 2,
  },
};

export function convertFromInr(amountInInr: number, targetCurrency: CurrencyCode): number {
  const config = CURRENCIES[targetCurrency] || CURRENCIES.INR;
  if (targetCurrency === "INR") return amountInInr;
  const converted = amountInInr * config.rateAgainstInr;
  return Number(converted.toFixed(config.decimals));
}

export function formatCurrencyPrice(amountInInr: number, targetCurrency: CurrencyCode = "INR"): string {
  const config = CURRENCIES[targetCurrency] || CURRENCIES.INR;
  if (targetCurrency === "INR") {
    return `₹${amountInInr.toLocaleString("en-IN")}`;
  }
  const val = convertFromInr(amountInInr, targetCurrency);
  return `${config.symbol}${val.toLocaleString("en-US", { minimumFractionDigits: config.decimals, maximumFractionDigits: config.decimals })}`;
}

export const formatCurrency = formatCurrencyPrice;
