/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as casino_discovery_logs_index from "../casino_discovery_logs/index.js";
import type * as casino_discovery_logs_mutations_createDiscoveryLog from "../casino_discovery_logs/mutations/createDiscoveryLog.js";
import type * as casino_discovery_logs_queries_getDiscoveryLogs from "../casino_discovery_logs/queries/getDiscoveryLogs.js";
import type * as casinos_actions_scheduledCasinoDiscovery from "../casinos/actions/scheduledCasinoDiscovery.js";
import type * as casinos_index from "../casinos/index.js";
import type * as casinos_mutations_createCasino from "../casinos/mutations/createCasino.js";
import type * as casinos_mutations_createMultipleCasinos from "../casinos/mutations/createMultipleCasinos.js";
import type * as casinos_mutations_deleteCasino from "../casinos/mutations/deleteCasino.js";
import type * as casinos_mutations_toggleTrackCasino from "../casinos/mutations/toggleTrackCasino.js";
import type * as casinos_mutations_updateCasino from "../casinos/mutations/updateCasino.js";
import type * as casinos_mutations_updateOfferCheckTimestamp from "../casinos/mutations/updateOfferCheckTimestamp.js";
import type * as casinos_queries_getAllCasino from "../casinos/queries/getAllCasino.js";
import type * as casinos_queries_getCasinoById from "../casinos/queries/getCasinoById.js";
import type * as casinos_queries_getCasinoDetailWithOffers from "../casinos/queries/getCasinoDetailWithOffers.js";
import type * as casinos_queries_getCasinoStats from "../casinos/queries/getCasinoStats.js";
import type * as casinos_queries_getCasinosByState from "../casinos/queries/getCasinosByState.js";
import type * as casinos_queries_getCasinosByStateStats from "../casinos/queries/getCasinosByStateStats.js";
import type * as casinos_queries_getCasinosForOfferResearch from "../casinos/queries/getCasinosForOfferResearch.js";
import type * as casinos_queries_getCasinosPaginated from "../casinos/queries/getCasinosPaginated.js";
import type * as casinos_queries_getCasinosSearchable from "../casinos/queries/getCasinosSearchable.js";
import type * as casinos_queries_getCasinosWithOfferStats from "../casinos/queries/getCasinosWithOfferStats.js";
import type * as crons from "../crons.js";
import type * as offer_research_logs_index from "../offer_research_logs/index.js";
import type * as offer_research_logs_mutations_createResearchLog from "../offer_research_logs/mutations/createResearchLog.js";
import type * as offer_research_logs_queries_getResearchLogs from "../offer_research_logs/queries/getResearchLogs.js";
import type * as offers_actions_processOfferResearchBatchAction from "../offers/actions/processOfferResearchBatchAction.js";
import type * as offers_index from "../offers/index.js";
import type * as offers_mutations_createOffers from "../offers/mutations/createOffers.js";
import type * as offers_mutations_processOfferResearchBatch from "../offers/mutations/processOfferResearchBatch.js";
import type * as offers_mutations_triggerOfferResearch from "../offers/mutations/triggerOfferResearch.js";
import type * as offers_queries_getOfferKpis from "../offers/queries/getOfferKpis.js";
import type * as offers_queries_getOfferResearchLogs from "../offers/queries/getOfferResearchLogs.js";
import type * as offers_queries_getOfferResearchStatus from "../offers/queries/getOfferResearchStatus.js";
import type * as offers_queries_getOfferTimeline from "../offers/queries/getOfferTimeline.js";
import type * as offers_queries_getOfferTypeBreakdown from "../offers/queries/getOfferTypeBreakdown.js";
import type * as states_index from "../states/index.js";
import type * as states_mutations_createState from "../states/mutations/createState.js";
import type * as states_mutations_getOrCreateState from "../states/mutations/getOrCreateState.js";
import type * as states_queries_getAllStates from "../states/queries/getAllStates.js";
import type * as states_queries_getStateById from "../states/queries/getStateById.js";
import type * as xanoAPISync from "../xanoAPISync.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "casino_discovery_logs/index": typeof casino_discovery_logs_index;
  "casino_discovery_logs/mutations/createDiscoveryLog": typeof casino_discovery_logs_mutations_createDiscoveryLog;
  "casino_discovery_logs/queries/getDiscoveryLogs": typeof casino_discovery_logs_queries_getDiscoveryLogs;
  "casinos/actions/scheduledCasinoDiscovery": typeof casinos_actions_scheduledCasinoDiscovery;
  "casinos/index": typeof casinos_index;
  "casinos/mutations/createCasino": typeof casinos_mutations_createCasino;
  "casinos/mutations/createMultipleCasinos": typeof casinos_mutations_createMultipleCasinos;
  "casinos/mutations/deleteCasino": typeof casinos_mutations_deleteCasino;
  "casinos/mutations/toggleTrackCasino": typeof casinos_mutations_toggleTrackCasino;
  "casinos/mutations/updateCasino": typeof casinos_mutations_updateCasino;
  "casinos/mutations/updateOfferCheckTimestamp": typeof casinos_mutations_updateOfferCheckTimestamp;
  "casinos/queries/getAllCasino": typeof casinos_queries_getAllCasino;
  "casinos/queries/getCasinoById": typeof casinos_queries_getCasinoById;
  "casinos/queries/getCasinoDetailWithOffers": typeof casinos_queries_getCasinoDetailWithOffers;
  "casinos/queries/getCasinoStats": typeof casinos_queries_getCasinoStats;
  "casinos/queries/getCasinosByState": typeof casinos_queries_getCasinosByState;
  "casinos/queries/getCasinosByStateStats": typeof casinos_queries_getCasinosByStateStats;
  "casinos/queries/getCasinosForOfferResearch": typeof casinos_queries_getCasinosForOfferResearch;
  "casinos/queries/getCasinosPaginated": typeof casinos_queries_getCasinosPaginated;
  "casinos/queries/getCasinosSearchable": typeof casinos_queries_getCasinosSearchable;
  "casinos/queries/getCasinosWithOfferStats": typeof casinos_queries_getCasinosWithOfferStats;
  crons: typeof crons;
  "offer_research_logs/index": typeof offer_research_logs_index;
  "offer_research_logs/mutations/createResearchLog": typeof offer_research_logs_mutations_createResearchLog;
  "offer_research_logs/queries/getResearchLogs": typeof offer_research_logs_queries_getResearchLogs;
  "offers/actions/processOfferResearchBatchAction": typeof offers_actions_processOfferResearchBatchAction;
  "offers/index": typeof offers_index;
  "offers/mutations/createOffers": typeof offers_mutations_createOffers;
  "offers/mutations/processOfferResearchBatch": typeof offers_mutations_processOfferResearchBatch;
  "offers/mutations/triggerOfferResearch": typeof offers_mutations_triggerOfferResearch;
  "offers/queries/getOfferKpis": typeof offers_queries_getOfferKpis;
  "offers/queries/getOfferResearchLogs": typeof offers_queries_getOfferResearchLogs;
  "offers/queries/getOfferResearchStatus": typeof offers_queries_getOfferResearchStatus;
  "offers/queries/getOfferTimeline": typeof offers_queries_getOfferTimeline;
  "offers/queries/getOfferTypeBreakdown": typeof offers_queries_getOfferTypeBreakdown;
  "states/index": typeof states_index;
  "states/mutations/createState": typeof states_mutations_createState;
  "states/mutations/getOrCreateState": typeof states_mutations_getOrCreateState;
  "states/queries/getAllStates": typeof states_queries_getAllStates;
  "states/queries/getStateById": typeof states_queries_getStateById;
  xanoAPISync: typeof xanoAPISync;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
