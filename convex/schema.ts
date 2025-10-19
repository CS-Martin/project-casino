import { defineSchema } from 'convex/server';
import { casino } from './casino/casino.model';
import { offer } from './offer/offer.model';
import { state } from './state/state.model';

export default defineSchema({
  casino,
  offer,
  state,
});
