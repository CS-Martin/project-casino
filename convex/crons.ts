// convex/crons.ts
// ----------------------------
// This file defines background jobs (cron tasks) in Convex.
// Cron jobs run automatically on a schedule, without needing user interaction.
// ----------------------------

import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

// Create a new cron job manager instance
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
crons.interval('Sync Xano API data every 24 hours', { minutes: 1 }, internal.xanoAPISync.fetchAndSyncOffers);

// 🔍 Schedule: AI-powered offer research every 4 hours
// ------------------------------------------
// This job automatically researches promotional offers for tracked casinos
// using AI to find current bonuses, free spins, and other promotions.
// Runs every 4 hours with a small batch size to focus on new casinos.
crons.interval('AI offer research every 4 hours', { minutes: 1 }, internal.offers.index.scheduledOfferResearch, {
  batchSize: 5,
});

export default crons;
