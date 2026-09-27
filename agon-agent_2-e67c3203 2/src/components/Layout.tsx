import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Users, GitBranch, Bell, FolderOpen,
  Plus, Scale, Menu, X, FlaskConical, Layers,
} from 'lucide-react';
import { useState } from 'react';

const LIENS = [
  { to: '/', label: 'Pilotage', icon: LayoutDashboard, exact: true },
  { to: '/contrats', label: 'Contrats', icon: FileText },
  { to: '/parties', label: 'Parties', icon: Users },
  { to: '/modeles', label: 'Modèles', icon: Layers },
  { to: '/evenements', label: 'Événements', icon: GitBranch },
  { to: '/alertes', label: 'Alertes', icon: Bell },
  { to: '/dossiers', label: 'Dossiers finaux', icon: FolderOpen },
  { to: '/analyse', label: 'Analyser un document', icon: FlaskConical },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [ouvert, setOuvert] = useState(false);
  const loc = useLocation();
  const dansContrat = loc.pathname.startsWith('/contrats/') && loc.pathname.split('/').length >= 3;

  return (
    <div className="min-h-screen bg-[#0e1420] text-slate-100">
      {/* Barre supérieure */}
      <header className="no-print sticky top-0 z-40 border-b border-white/8 bg-[#0e1420]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-200 to-amber-500 text-slate-950 shadow-lg">
              <Scale className="h-5 w-5" />
            </span>
            <span>
              <span className="font-display block text-lg font-bold leading-none tracking-tight text-white">CONTRACTOS</span>
              <span className="block text-[11px] uppercase tracking-[0.18em] text-amber-200/70">Système vivant d’engagements</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/nouveau"
              className="hidden items-center gap-2 rounded-xl bg-amber-300 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow transition hover:bg-amber-200 sm:inline-flex"
            >
              <Plus className="h-4 w-4" /> Nouveau contrat
            </Link>
            <button onClick={() => setOuvert(!ouvert)} className="cursor-pointer rounded-xl p-2.5 text-slate-300 hover:bg-white/5 lg:hidden">
              {ouvert ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {/* Navigation mobile */}
        {ouvert && (
          <nav className="border-t border-white/8 px-4 py-3 lg:hidden">
            <div className="grid grid-cols-2 gap-2">
              {LIENS.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={!!l.exact}
                  onClick={() => setOuvert(false)}
                  className={({ isActive }) => `flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm ${isActive ? 'bg-amber-300/15 text-amber-200' : 'text-slate-300 hover:bg-white/5'}`}
                >
                  <l.icon className="h-4 w-4" /> {l.label}
                </NavLink>
              ))}
              <Link to="/nouveau" onClick={() => setOuvert(false)} className="flex items-center gap-2 rounded-xl bg-amber-300 px-3 py-2.5 text-sm font-semibold text-slate-950">
                <Plus className="h-4 w-4" /> Nouveau contrat
              </Link>
            </div>
          </nav>
        )}
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
        {/* Sidebar desktop */}
        {!dansContrat && (
          <aside className="no-print sticky top-[76px] hidden h-fit w-60 shrink-0 lg:block">
            <nav className="space-y-1 rounded-2xl border border-white/8 bg-white/[0.02] p-3">
              {LIENS.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={!!l.exact}
                  className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-amber-300/15 text-amber-200' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                >
                  <l.icon className="h-4 w-4" /> {l.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-4 rounded-2xl border border-sky-400/15 bg-sky-500/5 p-4 text-xs leading-relaxed text-sky-100/70">
              <p className="mb-1 font-semibold text-sky-200">Positionnement</p>
              Contractos organise faits, clauses et preuves. Il n’invente aucune loi, ne promet aucune issue judiciaire
              et signale quand un professionnel doit valider.
            </div>
          </aside>
        )}

        {/* Contenu */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <footer className="no-print border-t border-white/8 py-6">
        <p className="mx-auto max-w-7xl px-6 text-center text-xs text-slate-500">
          CONTRACTOS — système vivant d’engagements · Vos données structurées restent la source de vérité ·
          Le document généré n’en est qu’une représentation lisible · Information générale, pas avis juridique.
        </p>
      </footer>
    </div>
  );
}
