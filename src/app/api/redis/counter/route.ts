import { redis } from '@/lib/redis';

export const POST = async () => {
  await redis.incr('counter');

  return new Response('OK');
};

export const GET = async () => {
  const count = await redis.get<number>('counter');
  return Response.json({ count: count ?? 0 });
};
