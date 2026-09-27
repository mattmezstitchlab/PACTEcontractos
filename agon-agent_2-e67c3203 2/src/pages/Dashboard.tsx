import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, FileText, AlertTriangle, CalendarClock, Plus,
  ArrowRight, ShieldAlert, BadgeCheck, Activity, Scale, Sparkles,
} from 'lucide-react';
import { api } from '../lib/api';
import type { Contrat, Echeance, Alerte, Evenement } from '../lib/types';
import { fmtDate, fmtMontant, joursRestants, delaiHumain } from '../lib/format';
import { Spinner, BadgeSante, BadgeStatut, Prudence, SectionTitre, Btn } from '../components/ui';

export default function Dashboard() {
  const [contrats, setContrats] = useState<Contrat[]>([]);
  const [echeances, setEcheances] = useState<Echeance[]>([]);
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [c, e, a, ev] = await Promise.all([
          api.contrats.list(),
          api.echeances.list(),
          api.alertes.list({ statut: 'active' }),
          api.historique.list(),
        ]);
        setContrats(c);
        setEcheances(e);
        setAlertes(a);
        // historieuqe utilisé comme activité récente via evenements
        const evs = await api.evenements.list();
        setEvenements(evs.slice(0, 6));
        void ev;
      } catch (err: any) {
        setErreur(err.message || 'Chargement impossible');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = useMemo(() => {
    const actifs = contrats.filter((c) => c.statut === 'actif').length;
    const critiques = contrats.filter((c) => c.sante === 'critique').length;
    const attention = contrats.filter((c) => c.sante === 'attention').length;
    const montant = contrats.filter((c) => c.statut === 'actif').reduce((s, c) => s + (c.montant_total || 0), 0);
    return { total: contrats.length, actifs, critiques, attention, montant };
  }, [contrats]);

  const prochaines = useMemo(() => {
    return echeances
      .filter((e) => e.statut !== 'realisee' && e.statut !== 'annulee' && e.date_limite)
      .map((e) => ({ ...e, j: joursRestants(e.date_limite) ?? 9999 }))
      .sort((a, b) => a.j - b.j)
      .slice(0, 6);
  }, [echeances]);

  const nomContrat = (id: number) => contrats.find((c) => c.id === id)?.titre || `Contrat #${id}`;

  if (loading) return <Spinner label="Ouverture du centre de pilotage…" />;
  if (erreur) return (
    <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-6 text-sm text-red-200">
      <p className="font-semibold">Impossible de charger les données.</p>
      <p className="mt-1">{erreur}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Héro */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-200/15 bg-gradient-to-br from-[#1b2440] via-[#141c2e] to-[#0e1420] p-6 sm:p-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/80">
              <LayoutDashboard className="h-4 w-4" /> Centre de pilotage
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Chaque contrat est un <span className="text-amber-300">organisme vivant</span>.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
              CONTRAT → PARTIES → ENGAGEMENTS → CONDITIONS → ÉVÉNEMENTS → ÉCHÉANCES → PREUVES → ALERTES →
              ACTIONS → HISTORIQUE → DOSSIER. Suivez ce qui a été promis, ce qui se passe et ce qui reste à prouver.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to="/nouveau"><Btn><Plus className="h-4 w-4" /> Nouveau contrat</Btn></Link>
              <Link to="/analyse"><Btn variant="soft"><Sparkles className="h-4 w-4" /> Analyser un document</Btn></Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat chiffre={String(stats.total)} label="Contrats" />
            <Stat chiffre={String(stats.actifs)} label="Actifs" accent="emerald" />
            <Stat chiffre={String(stats.attention)} label="À surveiller" accent="amber" />
            <Stat chiffre={String(stats.critiques)} label="Critiques" accent="red" />
          </div>
        </div>
      </div>

      <Prudence compact />

      {/* Contrats + échéances */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <SectionTitre
            icon={<FileText className="h-5 w-5" />}
            titre="Contrats suivis"
            sous="Santé calculée par le moteur de cohérence : engagements, échéances, événements, preuves."
            action={<Link to="/contrats" className="inline-flex items-center gap-1 text-sm font-medium text-amber-300 hover:text-amber-200">Tout voir <ArrowRight className="h-4 w-4" /></Link>}
          />
          {contrats.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center">
              <Scale className="mx-auto mb-3 h-8 w-8 text-slate-600" />
              <p className="font-medium text-slate-200">Aucun contrat pour l’instant</p>
              <p className="mt-1 text-sm text-slate-400">Créez votre premier engagement en 2 minutes, guidé pas à pas.</p>
              <Link to="/nouveau" className="mt-4 inline-block"><Btn><Plus className="h-4 w-4" /> Créer un contrat</Btn></Link>
            </div>
          ) : (
            <div className="space-y-3">
              {contrats.slice(0, 5).map((c) => (
                <Link key={c.id} to={`/contrats/${c.id}`} className="group block rounded-2xl border border-white/8 bg-white/[0.02] p-4 transition hover:border-amber-300/30 hover:bg-white/[0.04]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white group-hover:text-amber-200">{c.titre}</p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {[c.domaine, c.pays || c.droit_applicable, c.montant_total ? fmtMontant(c.montant_total, c.devise || 'EUR') : null].filter(Boolean).join(' · ') || 'Brouillon en cours'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <BadgeStatut statut={c.statut} />
                      <BadgeSante sante={c.sante} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {stats.montant > 0 && (
            <p className="mt-3 text-sm text-slate-400">
              Montants suivis (contrats actifs) : <strong className="text-slate-200">{fmtMontant(stats.montant)}</strong>
              <span className="text-slate-500"> — indicatif, devises mélangées possibles.</span>
            </p>
          )}
        </div>

        <div className="lg:col-span-2">
          <SectionTitre
            icon={<CalendarClock className="h-5 w-5" />}
            titre="Prochaines échéances"
            sous="Tous contrats confondus."
          />
          <div className="space-y-2.5">
            {prochaines.length === 0 && <p className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 text-sm text-slate-400">Aucune échéance à venir. Ajoutez des échéances à vos contrats pour les voir ici.</p>}
            {prochaines.map((e) => (
              <Link key={e.id} to={`/contrats/${e.contrat_id}?onglet=echeances`} className="block rounded-2xl border border-white/8 bg-white/[0.02] p-3.5 transition hover:border-amber-300/30">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-slate-100">{e.titre || 'Échéance'}</p>
                  <Delai j={e.j} />
                </div>
                <p className="mt-1 truncate text-xs text-slate-500">{nomContrat(e.contrat_id)} · {fmtDate(e.date_limite)}{e.montant ? ` · ${fmtMontant(e.montant, e.devise || 'EUR')}` : ''}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Alertes + activité */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <SectionTitre
            icon={<AlertTriangle className="h-5 w-5" />}
            titre="Alertes actives"
            sous="Issues du moteur de cohérence. Les faits d’abord, jamais de certitudes juridiques."
            action={<Link to="/alertes" className="inline-flex items-center gap-1 text-sm font-medium text-amber-300 hover:text-amber-200">Tout voir <ArrowRight className="h-4 w-4" /></Link>}
          />
          <div className="space-y-2.5">
            {alertes.length === 0 && (
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-4 text-sm text-emerald-200">
                <BadgeCheck className="h-5 w-5 shrink-0" /> Aucune alerte active. Le moteur veille : ouvrez un contrat pour lancer l’analyse.
              </div>
            )}
            {alertes.slice(0, 4).map((a) => (
              <Link key={a.id} to={`/contrats/${a.contrat_id}?onglet=alertes`} className="block rounded-2xl border border-white/8 bg-white/[0.02] p-3.5 transition hover:border-amber-300/30">
                <div className="flex items-center gap-2">
                  {a.gravite === 'critique'
                    ? <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
                    : <AlertTriangle className="h-4 w-4 shrink-0 text-amber-300" />}
                  <p className="truncate text-sm font-medium text-slate-100">{a.titre}</p>
                </div>
                <p className="mt-1 truncate text-xs text-slate-500">{nomContrat(a.contrat_id)}</p>
              </Link>
            ))}
          </div>
        </div>
        <div>
          <SectionTitre
            icon={<Activity className="h-5 w-5" />}
            titre="Activité récente"
            sous="Derniers événements enregistrés sur l’ensemble des contrats."
            action={<Link to="/evenements" className="inline-flex items-center gap-1 text-sm font-medium text-amber-300 hover:text-amber-200">Journal global <ArrowRight className="h-4 w-4" /></Link>}
          />
          <div className="space-y-2.5">
            {evenements.length === 0 && <p className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 text-sm text-slate-400">Aucun événement enregistré pour l’instant.</p>}
            {evenements.map((ev) => (
              <Link key={ev.id} to={`/contrats/${ev.contrat_id}?onglet=evenements`} className="block rounded-2xl border border-white/8 bg-white/[0.02] p-3.5 transition hover:border-amber-300/30">
                <p className="truncate text-sm font-medium text-slate-100">{ev.titre || 'Événement'}</p>
                <p className="mt-1 truncate text-xs text-slate-500">{nomContrat(ev.contrat_id)} · {fmtDate(ev.date_evenement || ev.created_at, true)}{ev.auteur ? ` · ${ev.auteur}` : ''}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ chiffre, label, accent }: { chiffre: string; label: string; accent?: 'emerald' | 'amber' | 'red' }) {
  const color = accent === 'emerald' ? 'text-emerald-300' : accent === 'amber' ? 'text-amber-300' : accent === 'red' ? 'text-red-400' : 'text-white';
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-center backdrop-blur">
      <p className={`font-display text-2xl font-bold ${color}`}>{chiffre}</p>
      <p className="text-[11px] uppercase tracking-wider text-slate-400">{label}</p>
    </div>
  );
}

function Delai({ j }: { j: number }) {
  if (j < 0) return <span className="shrink-0 rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-semibold text-red-300">{delaiHumain(j)}</span>;
  if (j <= 7) return <span className="shrink-0 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-300">{delaiHumain(j)}</span>;
  return <span className="shrink-0 rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-slate-400">{delaiHumain(j)}</span>;
}
