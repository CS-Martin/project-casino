/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as casinos_index from "../casinos/index.js";
import type * as casinos_mutations_createCasino from "../casinos/mutations/createCasino.js";
import type * as casinos_mutations_createMultipleCasinos from "../casinos/mutations/createMultipleCasinos.js";
import type * as casinos_mutations_deleteCasino from "../casinos/mutations/deleteCasino.js";
import type * as casinos_mutations_updateCasino from "../casinos/mutations/updateCasino.js";
import type * as casinos_queries_getAllCasino from "../casinos/queries/getAllCasino.js";
import type * as casinos_queries_getCasinoById from "../casinos/queries/getCasinoById.js";
import type * as casinos_queries_getCasinosByState from "../casinos/queries/getCasinosByState.js";
import type * as crons from "../crons.js";
import type * as offers_index from "../offers/index.js";
import type * as states_index from "../states/index.js";
import type * as states_mutations_createState from "../states/mutations/createState.js";
import type * as states_mutations_getOrCreateState from "../states/mutations/getOrCreateState.js";
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
  "casinos/index": typeof casinos_index;
  "casinos/mutations/createCasino": typeof casinos_mutations_createCasino;
  "casinos/mutations/createMultipleCasinos": typeof casinos_mutations_createMultipleCasinos;
  "casinos/mutations/deleteCasino": typeof casinos_mutations_deleteCasino;
  "casinos/mutations/updateCasino": typeof casinos_mutations_updateCasino;
  "casinos/queries/getAllCasino": typeof casinos_queries_getAllCasino;
  "casinos/queries/getCasinoById": typeof casinos_queries_getCasinoById;
  "casinos/queries/getCasinosByState": typeof casinos_queries_getCasinosByState;
  crons: typeof crons;
  "offers/index": typeof offers_index;
  "states/index": typeof states_index;
  "states/mutations/createState": typeof states_mutations_createState;
  "states/mutations/getOrCreateState": typeof states_mutations_getOrCreateState;
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
