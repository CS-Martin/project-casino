import { defineSchema } from 'convex/server';
import { casinos } from './casinos/casinos.model';
import { offers } from './offers/offers.model';
import { states } from './states/states.model';
import { offer_research_logs } from './offer_research_logs/offer_research_logs.model';

export default defineSchema({
  casinos,
  offers,
  states,
  offer_research_logs,
});
