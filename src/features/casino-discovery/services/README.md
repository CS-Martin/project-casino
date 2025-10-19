# Casino Duplicate Detection System

A sophisticated duplicate detection system designed to prevent saving duplicate casino entries from web search results, AI discoveries, and external data sources.

## 🎯 Problem Statement

When integrating multiple data sources (OpenAI web search, external APIs, manual entries), we often encounter variations of the same casino entity:

- **Web Search Result**: "BetMGM Online Casino"
- **Database Entry**: "BetMGM"
- **Result**: Should be flagged as duplicate to maintain data integrity

## 🛠️ Solution

The `CasinoDuplicateDetector` class implements a multi-strategy approach to identify duplicate casino entities across different naming conventions and data sources.

## 🔍 Matching Strategies

### 1. Exact Match (Fastest)

- **Purpose**: Identical names after normalization
- **Use Case**: Direct matches with different capitalization/punctuation
- **Example**:
  - "betmgm casino" vs "BetMGM" → **MATCH**
  - Normalized: "betmgm" vs "betmgm"

### 2. Contains Match (Most Effective for Web vs Database)

- **Purpose**: One name contains the other
- **Use Case**: Web search results with additional descriptors
- **Example**:
  - "BetMGM Online Casino" contains "BetMGM" → **MATCH**
  - "Caesars Sportsbook" contains "Caesars" → **MATCH**

### 3. Fuzzy Match (Handles Edge Cases)

- **Purpose**: Similar names using string similarity algorithm
- **Use Case**: Typos, minor variations, different word orders
- **Algorithm**: Dice's Coefficient (character bigram comparison)
- **Threshold**: 75% similarity required
- **Example**:
  - "Bet MGM" vs "BetMGM" → **HIGH SCORE** → MATCH
  - "Golden Nugget" vs "Gold Nugget" → **LOWER SCORE** → NO MATCH

## 📊 Strategy Priority

The system checks strategies in this order for optimal performance:

1. **Exact Match** → Fastest, most reliable
2. **Contains Match** → Catches most real-world duplicates
3. **Fuzzy Match** → Handles edge cases

## 🚀 Usage

### Basic Duplicate Check

```typescript
const isDuplicate = CasinoDuplicateDetector.isSameCasino('BetMGM Online Casino', 'BetMGM'); // Returns: true
```

### Detection with Reporting

```typescript
const result = CasinoDuplicateDetector.findDuplicateCasino(newCasino, existingCasinos);

if (result.duplicate) {
  console.log(`Duplicate found: ${result.reason}`);
  // Skip saving new casino
} else {
  // Safe to save new casino
}
```

### Integration Example

```typescript
// In your casino discovery service
for (const discoveredCasino of aiDiscoveredCasinos) {
  const duplicateResult = CasinoDuplicateDetector.findDuplicateCasino(discoveredCasino, existingDatabaseCasinos);

  if (duplicateResult.duplicate) {
    console.log(`⏭️ Skipped: "${discoveredCasino.name}" → "${duplicateResult.duplicate.name}"`);
    continue;
  }

  // Save to database
  await saveCasino(discoveredCasino);
}
```

### Result Structure

```typescript
{
  duplicate: Casino | null,    // Matching casino object if found
  reason: string,              // 'exact_match' | 'contains_match' | 'fuzzy_match' | 'no_match'
  score?: number               // Similarity score (0-1) for fuzzy matches
}
```

## ⚙️ Configuration

### Similarity Threshold

```typescript
// Adjust in class (default: 0.75)
private static threshold = 0.75;
```

### Normalization Rules

The system automatically removes common casino-related words:

- **Core Terms**: "online", "casino", "gaming", "play", "slots"
- **Sports Betting**: "sportsbook", "betting", "sports", "book"
- **Platform Terms**: "mobile", "app", "site"

## 🎪 Real-World Examples

| Web Search Result      | Database Entry    | Match Type     | Result              |
| ---------------------- | ----------------- | -------------- | ------------------- |
| "BetMGM Online Casino" | "BetMGM"          | Contains Match | ✅ DUPLICATE        |
| "draftkings casino"    | "DraftKings"      | Exact Match    | ✅ DUPLICATE        |
| "Caesars Sportsbook"   | "Caesars"         | Contains Match | ✅ DUPLICATE        |
| "Golden Nugget Online" | "Golden Nugget"   | Contains Match | ✅ DUPLICATE        |
| "BetMGM"               | "BetMGM Casino"   | Contains Match | ✅ DUPLICATE        |
| "New Casino XYZ"       | "Casino XYZ"      | Fuzzy Match    | ⚠️ DEPENDS ON SCORE |
| "Totally New Casino"   | "Existing Casino" | No Match       | ✅ UNIQUE           |

## 🔧 Customization

### Adjusting Threshold

```typescript
// For stricter matching (fewer false positives)
private static threshold = 0.85;

// For more lenient matching (fewer false negatives)
private static threshold = 0.65;
```

### Adding Normalization Rules

```typescript
// In normalizeCasinoName function
export function normalizeCasinoName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(online|casino|gaming|play|slots|sportsbook|betting|sports|book|mobile|app|site)\b/gi, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}
```

## 📊 Performance

- **Exact Match**: O(1) after normalization
- **Contains Match**: O(n) string comparison
- **Fuzzy Match**: O(n) with similarity calculation
- **Overall**: Optimized for typical casino database sizes (hundreds to thousands of entries)

## 🐛 Troubleshooting

### Common Issues

- **False Positives**: Increase threshold or review normalization rules
- **False Negatives**: Decrease threshold or add common word patterns
- **Performance**: Ensure state-based filtering is applied

### Debugging

```typescript
const result = CasinoDuplicateDetector.findDuplicateCasino(newCasino, existingCasinos);
console.log(`Match: ${result.reason}, Score: ${result.score}`);
// Logs: "Match: contains_match, Score: undefined"
```

## 🤝 Contributing

When adding new matching strategies:

1. Maintain the priority order (exact → contains → fuzzy)
2. Update the README with new strategy documentation
3. Add test cases for edge cases

---

This documentation provides:

- **Clear understanding** of the problem and solution
- **Practical examples** for implementation
- **Configuration guidance** for different use cases
- **Troubleshooting tips** for common issues
- **Comprehensive coverage** of all features

The comments in the code are now self-documenting and the README serves as a complete guide for developers working with the duplicate detection system.
