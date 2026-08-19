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
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return res.status(400).json({ error: 'Username 3-20 karakter, hanya huruf/angka/underscore' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password minimal 6 karakter' });
  }

  const key = username.toLowerCase();
  const existing = await kv.get(`user:${key}`);
  if (existing) {
    return res.status(409).json({ error: 'Username sudah dipakai, coba yang lain' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await kv.set(`user:${key}`, JSON.stringify({
    username,
    passwordHash,
    createdAt: Date.now(),
  }));
  await kv.sadd('usernames', key);

  const token = crypto.randomBytes(32).toString('hex');
  await kv.set(`session:${token}`, key, { ex: 60 * 60 * 24 * 7 }); // 7 hari

  return res.status(200).json({ token, username });
}
