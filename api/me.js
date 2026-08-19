import { getUserFromToken } from '../lib/auth.js';

export default async function handler(req, res) {
  const username = await getUserFromToken(req);
  if (!username) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return res.status(200).json({ username });
}
