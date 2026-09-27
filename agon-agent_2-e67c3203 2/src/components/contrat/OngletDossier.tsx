import { useMemo, useState } from 'react';
import { FolderOpen, Printer, FileText, ListChecks, Users, CalendarClock, History, FileCheck2, Scale, Download } from 'lucide-react';
import type { Clause, Contrat, ContratPartie, Echeance, Engagement, Evenement, Preuve, Version } from '../../lib/types';
import { fmtDate, fmtDateLong, fmtMontant, typeEvenementLabel, typePreuveLabel } from '../../lib/format';
import { api, logAction } from '../../lib/api';
import { Btn, Prudence, useToast } from '../ui';

// Dossier final : le document généré est une REPRÉSENTATION LISIBLE des
// données structurées — jamais l'unique source de vérité. Impression / PDF
// via le navigateur, sommaire complet, mentions de prudence.
export default function OngletDossier({ contrat, liens, clauses, engagements, echeances, evenements, preuves, versions }: {
  contrat: Contrat;
  liens: ContratPartie[];
  clauses: Clause[];
  engagements: Engagement[];
  echeances: Echeance[];
  evenements: Evenement[];
  preuves: Preuve[];
  versions: Version[];
}) {
  const { toastEl, ok } = useToast();
  const [sections, setSections] = useState<Record<string, boolean>>({
    identite: true, parties: true, clauses: true, engagements: true,
    echeances: true, evenements: true, preuves: true, signatures: true, versions: true,
  });

  const toggle = (k: string) => setSections((s) => ({ ...s, [k]: !s[k] }));

  const groupes = useMemo(() => {
    const g = new Map<string, Clause[]>();
    for (const c of [...clauses].sort((a, b) => (a.ordre || 0) - (b.ordre || 0))) {
      const k = c.categorie || 'DIVERS';
      if (!g.has(k)) g.set(k, []);
      g.get(k)!.push(c);
    }
    return [...g.entries()];
  }, [clauses]);

  const imprimer = async () => {
    await logAction(contrat.id, 'dossier_genere', 'contrat', contrat.id, { sections: Object.keys(sections).filter((k) => sections[k]) });
    ok('Dossier préparé — utilisez l’impression / PDF du navigateur.');
    setTimeout(() => window.print(), 400);
  };

  const exporterJSON = () => {
    const dossier = {
      genere_le: new Date().toISOString(),
      application: 'CONTRACTOS — dossier final (représentation lisible, source de vérité = données structurées)',
      contrat, parties: liens, clauses, engagements, echeances, evenements, preuves, versions,
    };
    const blob = new Blob([JSON.stringify(dossier, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `contractos-dossier-${contrat.id}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    void api;
  };

  const nomPartie = (id: number | null) => liens.find((l) => l.partie_id === id)?.partie?.nom || '—';

  return (
    <div className="space-y-4">
      {toastEl}
      <div className="no-print flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
        <div>
          <p className="font-semibold text-white">Dossier final du contrat</p>
          <p className="mt-0.5 text-sm text-slate-400">Cochez les sections, imprimez ou exportez. Le document reste une représentation lisible des données.</p>
        </div>
        <span className="flex gap-2">
          <Btn variant="soft" onClick={exporterJSON}><Download className="h-4 w-4" /> Export JSON</Btn>
          <Btn onClick={imprimer}><Printer className="h-4 w-4" /> Imprimer / PDF</Btn>
        </span>
      </div>

      <div className="no-print flex flex-wrap gap-2">
        {[
          ['identite', 'Identité'], ['parties', 'Parties'], ['clauses', 'Clauses'],
          ['engagements', 'Engagements'], ['echeances', 'Échéances'], ['evenements', 'Événements'],
          ['preuves', 'Preuves'], ['signatures', 'Signatures'], ['versions', 'Versions'],
        ].map(([k, l]) => (
          <button key={k} onClick={() => toggle(k)} className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium transition ${sections[k] ? 'bg-amber-300 text-slate-950' : 'bg-white/5 text-slate-500'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* ============ DOCUMENT IMPRIMABLE ============ */}
      <div className="print-bg-white overflow-hidden rounded-3xl border border-white/10 bg-white text-slate-900 shadow-2xl">
        <div className="bg-slate-950 px-6 py-8 text-white sm:px-10 print-bg-white print-text-black">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-300 print-text-black">Contractos — Dossier final</p>
          <h1 className="font-display mt-2 text-2xl font-bold sm:text-3xl print-text-black">{contrat.titre}</h1>
          <p className="mt-2 text-sm text-slate-400 print-text-black">
            {contrat.domaine || 'Accord'} · v{contrat.version_courante || 1} · Généré le {fmtDateLong(new Date().toISOString())}
          </p>
          <p className="mt-3 max-w-3xl rounded-xl bg-white/5 p-3 text-xs leading-relaxed text-slate-300 print-text-black">
            Ce document est une représentation lisible, générée automatiquement à partir des données structurées du dossier Contractos.
            En cas de divergence, les données horodatées et les pièces versées priment. Document informatif : il ne constitue pas un avis juridique.
          </p>
        </div>

        <div className="space-y-8 px-6 py-8 sm:px-10">
          {sections.identite && (
            <DocSection icon={<FileText className="h-4 w-4" />} titre="1. Identité du contrat">
              <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
                <DT k="Objet" v={contrat.objet || '—'} />
                <DT k="Domaine" v={contrat.domaine || '—'} />
                <DT k="Statut" v={contrat.statut} />
                <DT k="Pays" v={contrat.pays || 'Non renseigné (recommandé)'} />
                <DT k="Droit applicable" v={contrat.droit_applicable || 'Non renseigné (recommandé)'} />
                <DT k="Ville" v={contrat.ville || '—'} />
                <DT k="Période" v={`${fmtDate(contrat.date_debut)} → ${fmtDate(contrat.date_fin)}${contrat.duree ? ` (${contrat.duree})` : ''}`} />
                <DT k="Montant total" v={contrat.montant_total ? fmtMontant(contrat.montant_total, contrat.devise || 'EUR') : '—'} />
              </dl>
              {contrat.notes && <p className="mt-3 rounded-xl bg-slate-100 p-3 text-sm">Notes : {contrat.notes}</p>}
            </DocSection>
          )}

          {sections.parties && (
            <DocSection icon={<Users className="h-4 w-4" />} titre={`2. Parties (${liens.length})`}>
              <div className="grid gap-3 sm:grid-cols-2">
                {liens.map((l) => (
                  <div key={l.id} className="rounded-xl border border-slate-200 p-4 text-sm">
                    <p className="font-bold">{l.partie?.nom}</p>
                    <p className="text-slate-600">{l.role}{l.qualite ? ` — ${l.qualite}` : ''}</p>
                    {l.partie && <p className="mt-1.5 text-xs text-slate-500">
                      {[l.partie.adresse, l.partie.ville, l.partie.pays].filter(Boolean).join(', ')}
                      {l.partie.email ? ` · ${l.partie.email}` : ''}{l.partie.telephone ? ` · ${l.partie.telephone}` : ''}
                      {l.partie.identifiant_national ? ` · ${l.partie.identifiant_national}` : ''}
                      {l.partie.representant_nom ? ` · Rep. : ${l.partie.representant_nom} (${l.partie.representant_qualite || ''})` : ''}
                    </p>}
                    {l.relation && <p className="mt-1 text-xs"><strong>Relation :</strong> {l.relation}</p>}
                    {l.engagement_resume && <p className="mt-1 text-xs"><strong>Engagement :</strong> {l.engagement_resume}</p>}
                    <p className="mt-1.5 text-xs font-semibold">Signature : {l.signature_statut === 'signee' ? `Signé le ${fmtDate(l.signature_date)}` : l.signature_statut === 'refusee' ? 'Refusée' : 'En attente'}</p>
                  </div>
                ))}
              </div>
            </DocSection>
          )}

          {sections.clauses && (
            <DocSection icon={<FileText className="h-4 w-4" />} titre={`3. Clauses (${clauses.length})`}>
              {groupes.length === 0 ? <p className="text-sm text-slate-500">Aucune clause structurée.</p> : groupes.map(([cat, items]) => (
                <div key={cat} className="mb-4">
                  <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-slate-500">{cat}</p>
                  {items.map((c, i) => (
                    <div key={c.id} className="mb-2 rounded-xl bg-slate-50 p-3.5 text-sm">
                      <p className="font-semibold">{i + 1}. {c.titre}</p>
                      <p className="mt-1 whitespace-pre-wrap leading-relaxed text-slate-700">{c.contenu}</p>
                      {c.incertitude && <p className="mt-1.5 text-xs italic text-amber-700">Incertitude signalée : {c.incertitude}</p>}
                    </div>
                  ))}
                </div>
              ))}
            </DocSection>
          )}

          {sections.engagements && (
            <DocSection icon={<ListChecks className="h-4 w-4" />} titre={`4. Engagements suivis (${engagements.length})`}>
              {engagements.length === 0 ? <p className="text-sm text-slate-500">Aucun engagement.</p> : (
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead><tr className="border-b-2 border-slate-200 text-left text-xs uppercase text-slate-500">
                    <th className="py-2 pr-3">Engagement</th><th className="py-2 pr-3">Qui → Pour qui</th><th className="py-2 pr-3">Quand</th><th className="py-2">Statut</th>
                  </tr></thead>
                  <tbody>
                    {engagements.map((g) => (
                      <tr key={g.id} className="border-b border-slate-100 align-top">
                        <td className="py-2.5 pr-3"><strong>{g.titre}</strong>{g.description ? <><br /><span className="text-slate-600">{g.description}</span></> : null}{g.conditions ? <><br /><span className="text-xs text-slate-500">Conditions : {g.conditions}</span></> : null}{g.si_non_rempli ? <><br /><span className="text-xs text-slate-500">Si non rempli : {g.si_non_rempli}</span></> : null}</td>
                        <td className="py-2.5 pr-3">{g.qui_partie_id ? nomPartie(g.qui_partie_id) : g.qui_texte || '—'} → {g.pour_qui_partie_id ? nomPartie(g.pour_qui_partie_id) : g.pour_qui_texte || '—'}</td>
                        <td className="py-2.5 pr-3">{g.date_echeance ? fmtDate(g.date_echeance) : g.quand_texte || '—'}{g.lieu ? <><br />{g.lieu}</> : null}</td>
                        <td className="py-2.5">{g.statut}{g.preuve_attendue ? <><br /><span className="text-xs text-slate-500">Preuve : {g.preuve_attendue}</span></> : null}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </DocSection>
          )}

          {sections.echeances && (
            <DocSection icon={<CalendarClock className="h-4 w-4" />} titre={`5. Échéances (${echeances.length})`}>
              {echeances.length === 0 ? <p className="text-sm text-slate-500">Aucune échéance.</p> : (
                <table className="w-full text-left text-sm">
                  <thead><tr className="border-b-2 border-slate-200 text-xs uppercase text-slate-500">
                    <th className="py-2 pr-3">Échéance</th><th className="py-2 pr-3">Type</th><th className="py-2 pr-3">Date limite</th><th className="py-2 pr-3">Montant</th><th className="py-2">Statut</th>
                  </tr></thead>
                  <tbody>
                    {echeances.map((e) => (
                      <tr key={e.id} className="border-b border-slate-100">
                        <td className="py-2 pr-3 font-medium">{e.titre}</td>
                        <td className="py-2 pr-3">{e.type}</td>
                        <td className="py-2 pr-3">{fmtDate(e.date_limite)}</td>
                        <td className="py-2 pr-3">{e.montant ? fmtMontant(e.montant, e.devise || contrat.devise || 'EUR') : '—'}</td>
                        <td className="py-2">{e.statut}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </DocSection>
          )}

          {sections.evenements && (
            <DocSection icon={<History className="h-4 w-4" />} titre={`6. Journal des événements (${evenements.length})`}>
              {evenements.length === 0 ? <p className="text-sm text-slate-500">Aucun événement.</p> : (
                <ol className="space-y-2.5">
                  {[...evenements].sort((a, b) => new Date(a.date_evenement || a.created_at).getTime() - new Date(b.date_evenement || b.created_at).getTime()).map((ev) => (
                    <li key={ev.id} className="rounded-xl bg-slate-50 p-3 text-sm">
                      <p><span className="font-semibold">{fmtDate(ev.date_evenement || ev.created_at, true)}</span> — <strong>{typeEvenementLabel(ev.type)}</strong> : {ev.titre}{ev.auteur ? ` (${ev.auteur})` : ''}</p>
                      {ev.description && <p className="mt-0.5 whitespace-pre-wrap text-slate-700">{ev.description}</p>}
                    </li>
                  ))}
                </ol>
              )}
            </DocSection>
          )}

          {sections.preuves && (
            <DocSection icon={<FileCheck2 className="h-4 w-4" />} titre={`7. Chaîne documentaire (${preuves.length} pièces)`}>
              {preuves.length === 0 ? <p className="text-sm text-slate-500">Aucune pièce versée.</p> : (
                <table className="w-full text-left text-sm">
                  <thead><tr className="border-b-2 border-slate-200 text-xs uppercase text-slate-500">
                    <th className="py-2 pr-3">#</th><th className="py-2 pr-3">Pièce</th><th className="py-2 pr-3">Type</th><th className="py-2 pr-3">Date</th><th className="py-2">Empreinte</th>
                  </tr></thead>
                  <tbody>
                    {preuves.map((p, i) => (
                      <tr key={p.id} className="border-b border-slate-100">
                        <td className="py-2 pr-3 font-mono">{preuves.length - i}</td>
                        <td className="py-2 pr-3 font-medium">{p.titre}</td>
                        <td className="py-2 pr-3">{typePreuveLabel(p.type)}</td>
                        <td className="py-2 pr-3">{fmtDate(p.date_preuve || p.created_at)}</td>
                        <td className="py-2 font-mono text-xs">{p.empreinte || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </DocSection>
          )}

          {sections.signatures && (
            <DocSection icon={<Scale className="h-4 w-4" />} titre="8. Signatures">
              <div className="grid gap-4 sm:grid-cols-2">
                {liens.map((l) => (
                  <div key={l.id} className="rounded-xl border border-slate-300 p-4">
                    <p className="text-sm font-bold">{l.partie?.nom}</p>
                    <p className="text-xs text-slate-500">{l.role}</p>
                    <div className="mt-8 border-t border-slate-300 pt-2 text-xs text-slate-500">
                      Signature {l.signature_statut === 'signee' ? `— signé le ${fmtDate(l.signature_date)}` : '— date : …… / …… / …………'}
                    </div>
                  </div>
                ))}
              </div>
            </DocSection>
          )}

          {sections.versions && versions.length > 0 && (
            <DocSection icon={<FolderOpen className="h-4 w-4" />} titre={`9. Versions conservées (${versions.length})`}>
              <ul className="space-y-1.5 text-sm">
                {[...versions].sort((a, b) => (a.numero || 0) - (b.numero || 0)).map((v) => (
                  <li key={v.id} className="rounded-xl bg-slate-50 px-3 py-2">
                    <strong>v{v.numero}</strong> — {v.titre} <span className="text-slate-500">({fmtDate(v.created_at)} · {v.statut})</span>
                    {v.resume && <><br /><span className="text-slate-600">{v.resume}</span></>}
                  </li>
                ))}
              </ul>
            </DocSection>
          )}

          <div className="rounded-2xl border-2 border-slate-900 p-4 text-xs leading-relaxed text-slate-600">
            <p className="font-bold text-slate-900">Mentions importantes</p>
            <p className="mt-1">
              Fait pour servir et valoir ce que de droit, à partir des données horodatées du dossier Contractos.
              Le présent dossier ne préjuge d’aucune interprétation juridique définitive et ne remplace ni l’avis d’un avocat,
              ni les actes authentiques éventuellement requis (notaire, enregistrement). En cas de litige, seules les pièces
              originales et le droit applicable {contrat.droit_applicable ? `(${contrat.droit_applicable})` : 'identifié au dossier'} permettront d’apprécier la situation.
            </p>
          </div>
        </div>
      </div>

      <div className="no-print"><Prudence /></div>
    </div>
  );
}

function DocSection({ icon, titre, children }: { icon: React.ReactNode; titre: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 border-b-2 border-slate-900 pb-2 text-base font-bold uppercase tracking-wide">
        <span className="text-slate-500">{icon}</span> {titre}
      </h2>
      {children}
    </section>
  );
}

function DT({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 font-semibold text-slate-500">{k} :</dt>
      <dd>{v}</dd>
    </div>
  );
}
