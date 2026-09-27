import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, Plus, Check } from 'lucide-react';
import { MODELES } from '../lib/modeles';
import { Btn, Prudence } from '../components/ui';

// Bibliothèque des modèles : le domaine ne change que les modèles,
// champs, clauses et règles — le moteur reste universel.
export default function Modeles() {
  const nav = useNavigate();
  const [ouvert, setOuvert] = useState<string | null>('pacte_prive');

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">Bibliothèque de modèles</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-400">
          Le même moteur universel (engagements, échéances, événements, preuves, alertes, scénarios) s’applique à tous les domaines.
          Seuls les modèles, champs, clauses types et règles changent. Chaque modèle est une trame informative — faites valider les enjeux importants par un professionnel.
        </p>
      </div>

      <Prudence compact />

      <div className="space-y-3">
        {MODELES.map((m) => {
          const estOuvert = ouvert === m.code;
          return (
            <div key={m.code} className={`overflow-hidden rounded-2xl border transition ${estOuvert ? 'border-white/20 bg-white/[0.03]' : 'border-white/8 bg-white/[0.02]'}`}>
              <button onClick={() => setOuvert(estOuvert ? null : m.code)} className="flex w-full cursor-pointer items-center gap-4 p-4 text-left sm:p-5">
                <span className="h-12 w-1.5 shrink-0 rounded-full" style={{ background: m.couleur }} />
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-slate-300">
                  <Layers className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-white">{m.nom}</span>
                  <span className="mt-0.5 block truncate text-sm text-slate-400">{m.description}</span>
                </span>
                <span className="hidden shrink-0 gap-4 text-center sm:flex">
                  <span><strong className="block text-lg text-white">{m.clauses.length}</strong><span className="text-[11px] uppercase text-slate-500">Clauses</span></span>
                  <span><strong className="block text-lg text-white">{m.engagements.length}</strong><span className="text-[11px] uppercase text-slate-500">Engagements</span></span>
                  <span><strong className="block text-lg text-white">{m.roles.length}</strong><span className="text-[11px] uppercase text-slate-500">Rôles</span></span>
                </span>
              </button>
              {estOuvert && (
                <div className="border-t border-white/8 p-4 sm:p-5">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">Clauses types</p>
                      <ul className="space-y-1.5">
                        {m.clauses.map((c, i) => (
                          <li key={i} className="rounded-xl bg-white/[0.03] px-3 py-2 text-xs text-slate-300">
                            <span className="font-semibold text-amber-200/80">{c.categorie}</span> — {c.titre}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">Engagements types</p>
                      <ul className="space-y-1.5">
                        {m.engagements.map((e, i) => (
                          <li key={i} className="rounded-xl bg-white/[0.03] px-3 py-2 text-xs text-slate-300">
                            <Check className="mr-1.5 inline h-3 w-3 text-emerald-400" />{e.titre}
                            <span className="block pl-5 text-slate-500">{e.quand_texte}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">Rôles & vigilance</p>
                      <p className="rounded-xl bg-white/[0.03] px-3 py-2 text-xs text-slate-300">
                        {m.roles.map((r) => `${r.role} (${r.qualite})`).join(' · ')}
                      </p>
                      <ul className="mt-2 space-y-1.5">
                        {m.vigilance.map((v, i) => (
                          <li key={i} className="rounded-xl bg-sky-500/8 px-3 py-2 text-xs text-sky-100/80">{v}</li>
                        ))}
                      </ul>
                      <div className="mt-3">
                        <Btn onClick={() => nav('/nouveau')}><Plus className="h-4 w-4" /> Utiliser ce modèle</Btn>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-slate-500">
        Un domaine manque ? Le modèle « Accord universel » couvre tout le reste — <Link to="/nouveau" className="text-amber-300 hover:underline">créer un contrat</Link>.
      </p>
    </div>
  );
}
