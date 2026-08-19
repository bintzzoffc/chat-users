import { kv } from '@vercel/kv';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password wajib diisi' });
  }

  const key = username.toLowerCase();
  const raw = await kv.get(`user:${key}`);
  if (!raw) {
    return res.status(401).json({ error: 'Username atau password salah' });
  }

  const user = typeof raw === 'string' ? JSON.parse(raw) : raw;
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ error: 'Username atau password salah' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  await kv.set(`session:${token}`, key, { ex: 60 * 60 * 24 * 7 });

  return res.status(200).json({ token, username: user.username });
}
