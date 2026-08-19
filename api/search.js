import { kv } from '@vercel/kv';
import { getUserFromToken } from '../lib/auth.js';

export default async function handler(req, res) {
  const me = await getUserFromToken(req);
  if (!me) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const q = String(req.query.q || '').toLowerCase().trim();
  if (!q) {
    return res.status(200).json({ results: [] });
  }

  const all = await kv.smembers('usernames');
  const results = (all || [])
    .filter((u) => u !== me && u.includes(q))
    .slice(0, 20);

  return res.status(200).json({ results });
}
