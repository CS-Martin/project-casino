import { redis } from '@/lib/redis';

export const POST = async () => {
  await redis.incr('counter');

  return new Response('OK');
};
