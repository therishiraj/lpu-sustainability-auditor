import { Redis } from '@upstash/redis';

// Reads KV_REST_API_URL / KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_URL / _TOKEN)
// automatically from your Vercel environment variables.
const redis = Redis.fromEnv();

const PEER_RESEARCH_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

function peerResearchKey(institution) {
  return `peer-research:${institution.name.toLowerCase().replace(/\s+/g, '-')}`;
}

export async function getCachedPeerResearch(institution) {
  const key = peerResearchKey(institution);
  try {
    const cached = await redis.get(key);
    return cached || null;
  } catch (err) {
    console.warn('Cache read failed, falling back to live search:', err);
    return null;
  }
}

export async function setCachedPeerResearch(institution, result) {
  const key = peerResearchKey(institution);
  try {
    await redis.set(key, result, { ex: PEER_RESEARCH_TTL_SECONDS });
  } catch (err) {
    console.warn('Cache write failed (non-fatal):', err);
  }
}
