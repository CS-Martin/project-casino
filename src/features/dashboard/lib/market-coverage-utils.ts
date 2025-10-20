export interface CasinoStateStats {
  state: string;
  tracked: number;
  untracked: number;
  total: number;
}

export interface TransformedCasinoData {
  state: string;
  tracked: number;
  untracked: number;
  total: number;
  coverage: number;
  gap: number;
  opportunity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * Transforms casino state statistics into market coverage data
 * @param casinoStats - Raw casino statistics from the database
 * @returns Transformed data with coverage calculations and opportunity levels
 */
export function transformCasinoData(casinoStats: CasinoStateStats[]): TransformedCasinoData[] {
  return casinoStats.map((stat) => {
    const coverage = stat.total > 0 ? (stat.tracked / stat.total) * 100 : 0;
    const gap = stat.total > 0 ? (stat.untracked / stat.total) * 100 : 0;

    // Determine opportunity level based on coverage percentage
    let opportunity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    if (coverage < 10) {
      opportunity = 'CRITICAL';
    } else if (coverage < 40) {
      opportunity = 'HIGH';
    } else if (coverage < 70) {
      opportunity = 'MEDIUM';
    } else {
      opportunity = 'LOW';
    }

    return {
      state: stat.state,
      tracked: stat.tracked,
      untracked: stat.untracked,
      total: stat.total,
      coverage: Math.round(coverage * 10) / 10, // Round to 1 decimal place
      gap: Math.round(gap * 10) / 10, // Round to 1 decimal place
      opportunity,
    };
  });
}

/**
 * Filters and sorts market coverage data by opportunity level
 * @param data - Transformed casino data
 * @param sortBy - Sort criteria
 * @returns Filtered and sorted data
 */
export function filterAndSortMarketData(
  data: TransformedCasinoData[],
  sortBy: 'coverage' | 'gap' | 'total' | 'opportunity' = 'gap'
): TransformedCasinoData[] {
  return [...data].sort((a, b) => {
    switch (sortBy) {
      case 'coverage':
        return b.coverage - a.coverage;
      case 'gap':
        return b.gap - a.gap;
      case 'total':
        return b.total - a.total;
      case 'opportunity':
        const opportunityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return opportunityOrder[a.opportunity] - opportunityOrder[b.opportunity];
      default:
        return 0;
    }
  });
}

/**
 * Calculates summary statistics for market coverage data
 * @param data - Transformed casino data
 * @returns Summary statistics
 */
export function calculateMarketSummary(data: TransformedCasinoData[]) {
  const totalStates = data.length;
  const criticalStates = data.filter((item) => item.opportunity === 'CRITICAL').length;
  const highStates = data.filter((item) => item.opportunity === 'HIGH').length;
  const mediumStates = data.filter((item) => item.opportunity === 'MEDIUM').length;
  const lowStates = data.filter((item) => item.opportunity === 'LOW').length;

  const totalCasinos = data.reduce((sum, item) => sum + item.total, 0);
  const totalTracked = data.reduce((sum, item) => sum + item.tracked, 0);
  const totalUntracked = data.reduce((sum, item) => sum + item.untracked, 0);

  const overallCoverage = totalCasinos > 0 ? (totalTracked / totalCasinos) * 100 : 0;
  const overallGap = totalCasinos > 0 ? (totalUntracked / totalCasinos) * 100 : 0;

  return {
    totalStates,
    criticalStates,
    highStates,
    mediumStates,
    lowStates,
    totalCasinos,
    totalTracked,
    totalUntracked,
    overallCoverage: Math.round(overallCoverage * 10) / 10,
    overallGap: Math.round(overallGap * 10) / 10,
  };
}
