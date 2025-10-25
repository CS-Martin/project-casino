/**
 * Tool Executor
 *
 * Executes chatbot tools by calling the appropriate Convex queries
 */

import { ConvexHttpClient } from 'convex/browser';
import { api } from '@convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * List of US states for casino search parsing
 */
const US_STATES = ['Michigan', 'New Jersey', 'Pennsylvania', 'West Virginia'];

/**
 * State abbreviation mapping
 */
const STATE_ABBREVIATIONS: Record<string, string> = {
  michigan: 'MI',
  'new jersey': 'NJ',
  pennsylvania: 'PA',
  'west virginia': 'WV',
};

/**
 * Get state abbreviation from state name
 */
function getStateAbbreviation(stateName: string): string | null {
  return STATE_ABBREVIATIONS[stateName.toLowerCase()] || null;
}

/**
 * Extracts casino name and state from a search query
 */
function parseSearchQuery(query: string): { casinoName: string; stateName: string | null } {
  let casinoName = query;
  let stateName = null;

  // Check if query contains a state name
  for (const state of US_STATES) {
    if (query.toLowerCase().includes(state.toLowerCase())) {
      stateName = state;
      // Remove state from query to get just casino name
      casinoName = query.replace(new RegExp(state, 'gi'), '').trim();
      break;
    }
  }

  // Clean up common filler words from casino name
  casinoName = casinoName.replace(/\b(in|at|for|casino|casinos|the|list|show|all|down|me)\b/gi, '').trim();

  return { casinoName, stateName };
}

/**
 * Executes a chatbot tool and returns the result as a JSON string
 *
 * @param name - Tool name
 * @param args - Tool arguments
 * @returns Tool result as JSON string
 */
export async function executeTool(name: string, args: any): Promise<string> {
  switch (name) {
    case 'get_casino_stats': {
      const stats = await convex.query(api.casinos.index.getCasinoStats);
      return JSON.stringify(stats, null, 2);
    }

    case 'get_casinos_by_state': {
      const stateStats = await convex.query(api.casinos.index.getCasinosByStateStats);
      return JSON.stringify(stateStats, null, 2);
    }

    case 'search_casinos': {
      const { casinoName, stateName } = parseSearchQuery(args.query);

      // If only a state is provided (no casino name), return all casinos for that state
      if (stateName && (!casinoName || casinoName.trim() === '')) {
        const allCasinos = await convex.query(api.casinos.index.getCasinosSearchable, {
          searchTerm: '', // Empty search returns all
          paginationOpts: { numItems: 100, cursor: null }, // Get more results for state filtering
        });

        // Filter by state
        const stateAbbrev = getStateAbbreviation(stateName);
        const casinosInState = allCasinos.page.filter((casino: any) => {
          return (
            casino.state?.name?.toLowerCase() === stateName!.toLowerCase() ||
            casino.state?.abbreviation?.toLowerCase() === stateAbbrev?.toLowerCase()
          );
        });

        // Limit results
        const limitedCasinos = casinosInState.slice(0, args.limit || 20);
        return JSON.stringify(limitedCasinos, null, 2);
      }

      // First try: search with just the casino name (more flexible)
      let casinos = await convex.query(api.casinos.index.getCasinosSearchable, {
        searchTerm: casinoName,
        paginationOpts: { numItems: args.limit || 10, cursor: null },
      });

      // If we have a state and multiple results, filter by state
      if (stateName && casinos.page.length > 1) {
        const stateAbbrev = getStateAbbreviation(stateName);
        casinos.page = casinos.page.filter((casino: any) => {
          return (
            casino.state?.name?.toLowerCase() === stateName!.toLowerCase() ||
            casino.state?.abbreviation?.toLowerCase() === stateAbbrev?.toLowerCase()
          );
        });
      }

      // If still no results and we have both casino and state, try original query
      if (casinos.page.length === 0 && stateName) {
        casinos = await convex.query(api.casinos.index.getCasinosSearchable, {
          searchTerm: args.query,
          paginationOpts: { numItems: args.limit || 10, cursor: null },
        });
      }

      // If only 1-2 casinos found, also fetch their offers
      if (casinos.page.length <= 2 && casinos.page.length > 0) {
        const casinosWithOffers = await Promise.all(
          casinos.page.map(async (casino: any) => {
            try {
              const details = await convex.query(api.casinos.index.getCasinoDetailWithOffers, {
                casinoId: casino._id,
              });
              return {
                ...casino,
                offerDetails: details,
              };
            } catch (error) {
              console.error('[Chatbot] Error fetching offers for casino:', casino.name, error);
              return casino;
            }
          })
        );
        return JSON.stringify(casinosWithOffers, null, 2);
      }

      return JSON.stringify(casinos.page, null, 2);
    }

    case 'get_casino_details': {
      const details = await convex.query(api.casinos.index.getCasinoDetailWithOffers, {
        casinoId: args.casinoId,
      });
      return JSON.stringify(details, null, 2);
    }

    case 'get_offer_kpis': {
      const kpis = await convex.query(api.offers.index.getOfferKpis);
      return JSON.stringify(kpis, null, 2);
    }

    case 'get_offer_timeline': {
      const timeline = await convex.query(api.offers.index.getOfferTimeline, {
        timeRange: args.timeRange || '30d',
      });
      return JSON.stringify(timeline, null, 2);
    }

    case 'get_best_offers': {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/offers/best`);
      const offers = await response.json();
      const limitedOffers = offers.slice(0, args.limit || 10);
      return JSON.stringify(limitedOffers, null, 2);
    }

    case 'get_ai_usage_stats': {
      const since = Date.now() - (args.hours || 24) * 60 * 60 * 1000;
      const stats = await convex.query(api.ai_usage.index.getAIUsageStats, { since });
      return JSON.stringify(stats, null, 2);
    }

    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}
