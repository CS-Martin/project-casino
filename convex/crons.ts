// convex/crons.ts
// ----------------------------
// This file defines background jobs (cron tasks) in Convex.
// Cron jobs run automatically on a schedule, without needing user interaction.
// ----------------------------

import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

// 🕐 Schedule: Sync Xano API data every 3 hours
// ------------------------------------------
// This job automatically calls our internal function
// `xanoAPISync.fetchAndSyncOffers` to pull the latest casino offers
// from the external Xano API and update the Convex database.
//
// You can adjust the interval — for example:
// { minutes: 30 } → every 30 minutes
// { hours: 6 } → every 6 hours
// { days: 1 } → once a day
crons.interval('Sync Xano API data every 24 hours', { hours: 30 }, internal.xanoAPISync.fetchAndSyncOffers);

// 🔍 Schedule: AI-powered offer research every 6 hours
// ------------------------------------------
// This job automatically researches promotional offers for tracked casinos
// using AI to find current bonuses, free spins, and other promotions.
// Runs every 6 hours with a small batch size to focus on new casinos.
crons.interval('AI offer research every 3 hours', { hours: 3 }, internal.offers.index.scheduledOfferResearch, {
  batchSize: 5,
});

// 🏢 Schedule: AI-powered casino discovery every 12 hours
// ------------------------------------------
// This job automatically discovers new online casinos across different states
// using AI to find new gaming platforms, their licensing info, and websites.
// Runs every 8 hours to keep the casino database up-to-date.
crons.interval('AI casino discovery every 3 hours', { hours: 3 }, internal.casinos.index.scheduledCasinoDiscovery);

export default crons;
