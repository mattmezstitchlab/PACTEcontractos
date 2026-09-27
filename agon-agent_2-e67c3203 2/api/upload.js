import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Methode non autorisee' });
  try {
    const { fileName, fileBase64, contentType } = req.body || {};
    if (!fileName || !fileBase64) return res.status(400).json({ error: 'Fichier manquant' });
    const buffer = Buffer.from(fileBase64, 'base64');
    if (buffer.length > 6 * 1024 * 1024) return res.status(400).json({ error: 'Fichier trop volumineux (6 Mo max)' });
    const safe = String(Date.now() + '-' + fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
    const { error } = await supabase.storage.from('preuves').upload(safe, buffer, {
      contentType: contentType || 'application/octet-stream',
      upsert: true,
    });
    if (error) throw error;
    const { data } = supabase.storage.from('preuves').getPublicUrl(safe);
    return res.status(200).json({ url: data.publicUrl, path: safe });
  } catch (err) {
    console.error('API upload:', err);
    return res.status(500).json({ error: err.message || 'Echec du televersement' });
  }
}
