/**
 * 1AA 50% Accuracy Voice & Text Fuzzy Search Engine
 * Handles vernacular accents, phonetic variations, misheard speech,
 * stop word stripping, stem matching, Levenshtein edit distance, and 50% token coverage.
 */

// Common spoken conversational filler & stop words to ignore in search queries
const STOP_WORDS = new Set([
  "a", "an", "the", "in", "on", "at", "for", "to", "of", "with", "and", "or",
  "is", "are", "was", "were", "be", "been", "being",
  "i", "me", "my", "we", "our", "you", "your", "he", "she", "it", "they",
  "want", "need", "show", "find", "search", "give", "get", "looking", "look",
  "please", "can", "could", "would", "like", "item", "items", "product", "products",
  "chahiye", "dikhao", "batao", "karo", "do", "hai", "kuch", "wala", "wali", "wale",
  "tori", "kodi", "beku", "undu", "kaatu", "chupinchu"
]);

// Calculate Levenshtein distance for typo/speech misrecognition tolerance
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Check if a single query token fuzzy-matches any target token
export function tokenMatches(queryToken: string, targetTokens: string[]): boolean {
  if (queryToken.length < 2) return false;
  
  for (const target of targetTokens) {
    // 1. Exact match
    if (target === queryToken) return true;
    
    // 2. Substring containment
    if (queryToken.length >= 3 && target.includes(queryToken)) return true;
    if (target.length >= 3 && queryToken.includes(target)) return true;
    
    // 3. Prefix/Stem match (e.g. "bottle" & "bottles", "clean" & "cleaning")
    if (queryToken.length >= 4 && target.length >= 4) {
      const minPrefix = Math.min(queryToken.length, target.length) - 1;
      if (queryToken.slice(0, minPrefix) === target.slice(0, minPrefix)) {
        return true;
      }
    }
    
    // 4. Levenshtein edit distance for speech recognition slips
    // For 4-6 char words, allow distance <= 1 (e.g. "teether" vs "teethr", "lamp" vs "lamb", "brush" vs "brash")
    // For 7+ char words, allow distance <= 2 (e.g. "dispenser" vs "dispensor", "chopper" vs "choper")
    if (queryToken.length >= 4 && target.length >= 4 && Math.abs(queryToken.length - target.length) <= 2) {
      const maxDist = queryToken.length >= 7 ? 2 : 1;
      if (levenshteinDistance(queryToken, target) <= maxDist) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Returns a score >= 0 if the product matches the query with at least 50% accuracy.
 * Returns -1 if it does not meet the 50% threshold.
 * Higher score = more relevant product.
 */
export function matchWith50PercentAccuracy(
  query: string, 
  product: { name: string; sku: string; category: string; highlight?: string; tags?: string[] }
): { matched: boolean; score: number } {
  if (!query || query.trim() === "") {
    return { matched: true, score: 0 };
  }

  const cleanQuery = query.toLowerCase().trim();
  const targetText = [
    product.name,
    product.sku,
    product.category,
    product.highlight || "",
    ...(product.tags || [])
  ].join(" ").toLowerCase();

  // 1. Direct SKU exact match
  if (product.sku.toLowerCase() === cleanQuery) {
    return { matched: true, score: 1000 };
  }

  // 2. Full exact substring match gets highest score
  if (targetText.includes(cleanQuery)) {
    return { matched: true, score: 500 + cleanQuery.length };
  }

  // 3. Tokenize query and remove stop words
  const rawQueryTokens = cleanQuery
    .replace(/[^a-z0-9\s]/gi, " ")
    .split(/\s+/)
    .filter(t => t.length > 1);

  const meaningfulQueryTokens = rawQueryTokens.filter(t => !STOP_WORDS.has(t));
  const queryTokensToUse = meaningfulQueryTokens.length > 0 ? meaningfulQueryTokens : rawQueryTokens;

  if (queryTokensToUse.length === 0) {
    return { matched: true, score: 0 };
  }

  // Tokenize target product text
  const targetTokens = targetText
    .replace(/[^a-z0-9\s]/gi, " ")
    .split(/\s+/)
    .filter(t => t.length > 1);

  // Count how many query tokens matched
  let matchedTokensCount = 0;
  for (const qToken of queryTokensToUse) {
    if (tokenMatches(qToken, targetTokens)) {
      matchedTokensCount++;
    }
  }

  // 50% ACCURACY RULE:
  // If at least 50% of the query tokens matched the product:
  // e.g. for 1 token: 1/1 = 100% >= 50% -> MATCH!
  // for 2 tokens: 1/2 = 50% >= 50% -> MATCH!
  // for 3 tokens: 2/3 = 66% >= 50% -> MATCH!
  // for 4 tokens: 2/4 = 50% >= 50% -> MATCH!
  const matchRatio = matchedTokensCount / queryTokensToUse.length;
  const is50PercentOrMore = matchRatio >= 0.50;

  if (is50PercentOrMore && matchedTokensCount > 0) {
    // Score based on ratio + matched count + name match bonus
    const nameLower = product.name.toLowerCase();
    const nameMatchBonus = queryTokensToUse.some(t => nameLower.includes(t)) ? 50 : 0;
    const score = Math.round(matchRatio * 100) + (matchedTokensCount * 10) + nameMatchBonus;
    return { matched: true, score };
  }

  return { matched: false, score: -1 };
}
