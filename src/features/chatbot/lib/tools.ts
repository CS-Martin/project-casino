/**
 * Tool Definitions for OpenAI Function Calling
 *
 * Defines the available tools that the chatbot can use
 */

import OpenAI from 'openai';

/**
 * Available tools for the chatbot
 * These are read-only query tools - no mutation operations
 */
export const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_casino_stats',
      description:
        'Get overall casino statistics including total casinos, tracked/untracked counts, and coverage gap percentage across all states',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_casinos_by_state',
      description:
        'Get casino distribution BY STATE showing which states have the most casinos, with tracked/untracked breakdown for each state. Use this when asked about state coverage, state comparisons, or which state has the most casinos.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_casinos',
      description:
        'Search for casinos by name and/or state. When 1-2 casinos are found, their offers are automatically included. IMPORTANT: Only use casino name and state in the query, omit filler words like "in", "at", "for", "casino". Examples: "BetMGM Michigan" (not "BetMGM in Michigan"), "DraftKings" (not "casino DraftKings").',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description:
              'Clean search query with just casino name and/or state. Examples: "BetMGM Michigan", "DraftKings New Jersey", "Caesars"',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results',
            default: 10,
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_casino_details',
      description: 'Get detailed information about a specific casino including all its offers',
      parameters: {
        type: 'object',
        properties: {
          casinoId: {
            type: 'string',
            description: 'The ID of the casino',
          },
        },
        required: ['casinoId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_offer_kpis',
      description:
        'Get key performance indicators for offers including total offers, active offers, and research stats',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_offer_timeline',
      description: 'Get timeline of research activity over a specified period',
      parameters: {
        type: 'object',
        properties: {
          timeRange: {
            type: 'string',
            enum: ['7d', '30d', '90d'],
            description: 'Time range for the timeline',
            default: '30d',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_best_offers',
      description: 'Get the best current promotional offers sorted by value',
      parameters: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            description: 'Maximum number of offers to return',
            default: 10,
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_ai_usage_stats',
      description: 'Get AI usage statistics including costs, tokens, and success rates',
      parameters: {
        type: 'object',
        properties: {
          hours: {
            type: 'number',
            description: 'Number of hours to look back',
            default: 24,
          },
        },
      },
    },
  },
];
