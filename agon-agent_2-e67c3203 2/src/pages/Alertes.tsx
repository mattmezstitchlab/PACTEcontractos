import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, Eye, XCircle } from 'lucide-react';
import { api, logAction } from '../lib/api';
import type { Alerte, Contrat } from '../lib/types';
import { Spinner, Empty, Prudence, useToast } from '../components/ui';
import { CarteAlerte } from '../components/contrat/OngletAlertes';

// Centre global des alertes.
export default function Alertes() {
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [contrats, setContrats] = useState<Contrat[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState('active');
  const { toastEl, ok, err } = useToast();

  const charger = () => {
    Promise.all([api.alertes.list(), api.contrats.list()])
      .then(([a, c]) => { setAlertes(a); setContrats(c); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { charger(); }, []);

  const nom = (id: number) => contrats.find((c) => c.id === id)?.titre || `Contrat #${id}`;

  const liste = useMemo(() => {
    let l = filtre === 'toutes' ? [...alertes] : alertes.filter((a) => (filtre === 'active' ? a.statut === 'active' : a.statut !== 'active'));
    const ordre = { critique: 0, attention: 1, info: 2 };
    return l.sort((a, b) => (ordre[a.gravite as keyof typeof ordre] ?? 3) - (ordre[b.gravite as keyof typeof ordre] ?? 3));
  }, [alertes, filtre]);

  const statut = async (a: Alerte, s: string) => {
    try {
      await api.alertes.update(a.id, { statut: s });
      await logAction(a.contrat_id, 'alerte_statut', 'alerte', a.id, { de: a.statut, vers: s });
      charger();
      ok('Alerte mise à jour.');
    } catch (e: any) { err(e.message); }
  };

  if (loading) return <Spinner label="Chargement des alertes…" />;

  return (
    <div className="space-y-5">
      {toastEl}
      <div>
        <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">Centre des alertes</h1>
        <p className="mt-1 text-sm text-slate-400">
          {alertes.filter((a) => a.statut === 'active').length} active(s) · {alertes.filter((a) => a.statut === 'active' && a.gravite === 'critique').length} critique(s).
          Les alertes signalent des faits à vérifier — jamais des conclusions juridiques.
        </p>
      </div>

      <Prudence compact />

      <div className="flex gap-2">
        {[{ v: 'active', l: 'Actives' }, { v: 'traitees', l: 'Traitées' }, { v: 'toutes', l: 'Toutes' }].map((f) => (
          <button key={f.v} onClick={() => setFiltre(f.v)} className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-medium transition ${filtre === f.v ? 'bg-amber-300 text-slate-950' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
            {f.l}
          </button>
        ))}
      </div>

      {liste.length === 0 ? (
        <Empty icon={<Bell className="h-8 w-8" />} titre="Aucune alerte" texte="Ouvrez un contrat et lancez l’analyse de cohérence pour générer des alertes." />
      ) : (
        <div className="space-y-2.5">
          {liste.map((a) => (
            <div key={a.id}>
              <CarteAlerte gravite={a.gravite} titre={a.titre || ''} message={a.message || ''}
                meta={nom(a.contrat_id)}
                piste={a.action_suggeree}
                actions={<>
                  <Link to={`/contrats/${a.contrat_id}?onglet=alertes`} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-300/10">Ouvrir le contrat</Link>
                  {a.statut === 'active' && <>
                    <button onClick={() => statut(a, 'reconnue')} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/5"><Eye className="h-3.5 w-3.5" /> Reconnaître</button>
                    <button onClick={() => statut(a, 'resolue')} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/10"><Check className="h-3.5 w-3.5" /> Résoudre</button>
                    <button onClick={() => statut(a, 'ignoree')} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-white/5"><XCircle className="h-3.5 w-3.5" /> Ignorer</button>
                  </>}
                  {a.statut !== 'active' && (
                    <button onClick={() => statut(a, 'active')} className="cursor-pointer rounded-lg px-2.5 py-1.5 text-xs text-amber-300 hover:underline">Réactiver</button>
                  )}
                </>}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
