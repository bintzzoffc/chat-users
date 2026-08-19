import { kv } from '@vercel/kv';
import { getUserFromToken, conversationId } from '../lib/auth.js';

export default async function handler(req, res) {
  const me = await getUserFromToken(req);
  if (!me) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const withUser = String(req.query.with || '').toLowerCase().trim();
    if (!withUser) {
      return res.status(400).json({ error: 'Parameter with wajib diisi' });
    }
    const cid = conversationId(me, withUser);
    const raw = (await kv.lrange(`chat:${cid}`, 0, -1)) || [];
    const messages = raw.map((m) => (typeof m === 'string' ? JSON.parse(m) : m));
    return res.status(200).json({ messages });
  }

  if (req.method === 'POST') {
    const { to, text } = req.body || {};
    if (!to || !text || !String(text).trim()) {
      return res.status(400).json({ error: 'Tujuan dan isi pesan wajib diisi' });
    }
    const toKey = String(to).toLowerCase().trim();
    if (toKey === me) {
      return res.status(400).json({ error: 'Tidak bisa mengirim pesan ke diri sendiri' });
    }

    const targetRaw = await kv.get(`user:${toKey}`);
    if (!targetRaw) {
      return res.status(404).json({ error: 'User tujuan tidak ditemukan' });
    }

    const cid = conversationId(me, toKey);
    const msg = {
      from: me,
      to: toKey,
      text: String(text).slice(0, 2000),
      ts: Date.now(),
    };
    await kv.rpush(`chat:${cid}`, JSON.stringify(msg));
    await kv.sadd(`conversations:${me}`, toKey);
    await kv.sadd(`conversations:${toKey}`, me);

    return res.status(200).json({ ok: true, message: msg });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
