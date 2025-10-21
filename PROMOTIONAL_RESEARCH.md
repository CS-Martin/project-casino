I want to implement an incremental promotional offer research system using Convex and AI for a casino intelligence platform. The goal is to efficiently update promotional offers for tracked casinos in batches while scaling to thousands of casinos.

Requirements:

1. Database Schema Updates:

- Add a last_offer_check nullable timestamp field to the Casinos table to record the last research time for each casino.
- Use the existing Offers table for casino promotional offers with fields like offer name, type, amount, and a new source field to tag "ai_research".

2. Batch Selection of Casinos:

- Query the Casinos table to select a batch (e.g., 30 casinos) for promotional research prioritizing:
  a. Casinos where is_tracked = true and last_offer_check is either null or the oldest timestamps (least recently checked).
  b. Only when no more such casinos exist (all tracked casinos have been researched recently), proceed to select casinos where is_tracked = false similarly ordered by last_offer_check.
- This ensures user-tracked casinos get priority for offer refreshing before background coverage of untracked casinos.
- Implement efficient indexing and use Convex pagination if necessary to limit batch size and optimize query performance.

3. AI Research Integration:

- Implement a service function that takes the batch of casinos and generates an AI prompt to research current casino promotional offers focusing on official sources.
- The AI response should extract structured offers with necessary details for each casino.
- refer to my implementation of AI agent in @discover-casino.ts

4. Offer Comparison and Update:

- Implement logic to compare newly researched promotional offers with existing entries in the Offers table at an individual offer level.
- Consider that casinos can have multiple offers, including multi-day packages represented as separate offer records with metadata for sequencing or grouping.
- Use fuzzy matching on key offer attributes including:
  a. Offer name (with tolerance for minor variations)
  b. Offer type (deposit bonus, free spins, lossback, package step)
  c. Bonus amount and expected deposit
- For each researched offer:
  a. Find a matching existing offer by fuzzy similarity of these attributes.
  b. If a match exists, compare bonus amounts and other metrics to decide if the offer is improved. Update the existing offer accordingly.
  c. If no match is found, insert the offer as a new record linked to the casino.
- Mark the source as "ai_research" for all updated or inserted offers and update the last_offer_check timestamp at the casino level to track research recency.
- Optionally, flag offers no longer present in recent AI research as deprecated for further review or removal.
- Structure the logic to handle partial updates within multi-offer packages (e.g., updating only certain days in a welcome bonus package).

5. Scheduling and Execution:
   -Write a Convex cron job to run this batch process periodically (e.g., daily).
   -Ensure the batch size and frequency allow control over API costs and rate limits.
   -Provide an API endpoint or mutation for manual triggering of the offer refresh for specific casinos or batches.

6. Error Handling and Logging:

Implement error handling for AI calls and database updates.

Log AI research results and issues for monitoring.

7. Extensibility:

Structure code to allow easy adjustment of batch size, intervals, and AI prompt refinements.

Design to accommodate future enhancements such as multi-state research, user preferences, or additional offer metrics.
