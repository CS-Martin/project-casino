// convex/crons.ts
// ----------------------------
// This file defines background jobs (cron tasks) in Convex.
// Cron jobs run automatically on a schedule, without needing user interaction.
// ----------------------------

import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

// Create a new cron job manager instance
const crons = cronJobs();

// 🕐 Schedule: Sync Xano API data every hour
// ------------------------------------------
// This job automatically calls our internal function
// `xanoAPISync.fetchAndSyncOffers` to pull the latest casino offers
// from the external Xano API and update the Convex database.
//
// You can adjust the interval — for example:
// { minutes: 30 } → every 30 minutes
// { hours: 6 } → every 6 hours
// { days: 1 } → once a day
crons.interval('Sync Xano API data hourly', { minutes: 1 }, internal.xanoAPISync.fetchAndSyncOffers);

export default crons;
