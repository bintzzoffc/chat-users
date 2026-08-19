import { kv } from '@vercel/kv';
import { getUserFromToken } from '../lib/auth.js';

export default async function handler(req, res) {
  const me = await getUserFromToken(req);
  if (!me) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const list = await kv.smembers(`conversations:${me}`);
  return res.status(200).json({ conversations: list || [] });
}
