import { kv } from '@vercel/kv';

// Ambil username dari header Authorization: Bearer <token>
export async function getUserFromToken(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;
  const username = await kv.get(`session:${token}`);
  return username || null;
}

// ID percakapan antara 2 user, urutan diabaikan (a-b sama dengan b-a)
export function conversationId(a, b) {
  return [a, b].sort().join('__');
}
