import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

const PEER_INSTITUTION_TTL_SECONDS = 60 * 60 * 24 * 90; // 90 days — static reference data

function institutionKey(name) {
  return `peer-institution:${name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`;
}

export async function getCachedPeerInstitution(name) {
  try {
    return await redis.get(institutionKey(name));
  } catch (err) {
    console.warn('Cache read failed, will research live instead:', err);
    return null;
  }
}

export async function setCachedPeerInstitution(name, data) {
  try {
    await redis.set(institutionKey(name), data, { ex: PEER_INSTITUTION_TTL_SECONDS });
  } catch (err) {
    console.warn('Cache write failed (non-fatal):', err);
  }
}
