import { defineSchema } from 'convex/server';
import { casinos } from './casinos/casinos.model';
import { offers } from './offers/offers.model';
import { states } from './states/states.model';

export default defineSchema({
  casinos,
  offers,
  states,
});
