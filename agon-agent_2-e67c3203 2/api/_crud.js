import supabase from './db-client.js';

export function handlerFor(table, opts = {}) {
  return async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(204).end();
    try {
      if (req.method === 'GET') {
        const { id, ...filters } = req.query || {};
        let q = supabase.from(table).select(opts.select || '*');
        for (const [k, v] of Object.entries(filters)) {
          if (v === undefined || v === '' || v === 'undefined' || v === 'null') continue;
          q = q.eq(k, v);
        }
        if (id) {
          const { data, error } = await q.eq('id', id).maybeSingle();
          if (error) throw error;
          return res.status(200).json(data);
        }
        if (opts.order) q = q.order(opts.order, { ascending: opts.asc !== false, nullsFirst: false });
        else q = q.order('id', { ascending: true });
        if (opts.limit) q = q.limit(opts.limit);
        const { data, error } = await q;
        if (error) throw error;
        return res.status(200).json(data || []);
      }
      if (req.method === 'POST') {
        const body = req.body || {};
        const payload = Array.isArray(body) ? body : { ...body };
        if (!Array.isArray(payload)) {
          delete payload.id;
          if (opts.touch) payload.updated_at = new Date().toISOString();
        }
        const { data, error } = await supabase.from(table).insert(payload).select();
        if (error) throw error;
        return res.status(201).json(Array.isArray(body) ? data : (data && data[0]));
      }
      if (req.method === 'PUT') {
        const { id, ...rest } = req.body || {};
        if (!id) return res.status(400).json({ error: 'id manquant' });
        delete rest.created_at;
        if (opts.touch) rest.updated_at = new Date().toISOString();
        const { data, error } = await supabase.from(table).update(rest).eq('id', id).select();
        if (error) throw error;
        return res.status(200).json(data && data[0]);
      }
      if (req.method === 'DELETE') {
        const delId = (req.body && req.body.id) || (req.query && req.query.id);
        if (!delId) return res.status(400).json({ error: 'id manquant' });
        const { error } = await supabase.from(table).delete().eq('id', delId);
        if (error) throw error;
        return res.status(200).json({ ok: true });
      }
      return res.status(405).json({ error: 'Methode non autorisee' });
    } catch (err) {
      console.error('API ' + table + ':', err);
      return res.status(500).json({ error: err.message || 'Erreur serveur' });
    }
  };
}

export default handlerFor;
