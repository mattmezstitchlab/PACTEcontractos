import { useEffect, useState } from 'react';
import {
  AlertTriangle, ArrowRight, BadgeCheck, Bell, CalendarClock, Check,
  ChevronRight, FileText, Landmark, Loader2, Plus, Scale, ShieldAlert,
  Sparkles, Upload, Users, X, Info, FilePlus2, Search,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// ---------- Petits composants UI partagés ----------

export function Spinner({ label = 'Chargement…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-slate-400">
      <Loader2 className="h-7 w-7 animate-spin text-amber-300" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function Empty({ icon, titre, texte, action }: { icon?: React.ReactNode; titre: string; texte: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-12 text-center">
      <div className="mb-1 text-slate-500">{icon}</div>
      <p className="font-medium text-slate-200">{titre}</p>
      <p className="max-w-md text-sm text-slate-400">{texte}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function Btn(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'soft' | 'danger' | 'outline' }) {
  const { variant = 'primary', className = '', ...rest } = props;
  const styles: Record<string, string> = {
    primary: 'bg-amber-300 text-slate-950 hover:bg-amber-200 font-semibold shadow-[0_8px_30px_-8px_rgba(252,211,77,.5)]',
    ghost: 'text-slate-300 hover:text-white hover:bg-white/5',
    soft: 'bg-white/5 text-slate-100 hover:bg-white/10 border border-white/10',
    danger: 'bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25',
    outline: 'border border-slate-600 text-slate-200 hover:border-amber-300/60 hover:text-amber-200',
  };
  return (
    <button
      {...rest}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
    />
  );
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

export const inputCls =
  'w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-amber-300/70 focus:ring-2 focus:ring-amber-300/20 transition';

export const selectCls = inputCls + ' cursor-pointer';

export function Modal({ titre, sousTitre, onClose, children, large }: {
  titre: string; sousTitre?: string; onClose: () => void; children: React.ReactNode; large?: boolean;
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className={`max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-slate-700 bg-[#141c2e] shadow-2xl sm:rounded-3xl ${large ? 'sm:max-w-4xl' : 'sm:max-w-2xl'}`}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-700/60 bg-[#141c2e]/95 px-6 py-4 backdrop-blur">
          <div>
            <h2 className="font-display text-xl font-semibold text-white">{titre}</h2>
            {sousTitre && <p className="mt-0.5 text-sm text-slate-400">{sousTitre}</p>}
          </div>
          <button onClick={onClose} className="cursor-pointer rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export function BadgeSante({ sante }: { sante: string | null | undefined }) {
  if (sante === 'critique') return <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-300"><ShieldAlert className="h-3.5 w-3.5" /> Critique</span>;
  if (sante === 'attention') return <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300"><AlertTriangle className="h-3.5 w-3.5" /> À surveiller</span>;
  return <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300"><BadgeCheck className="h-3.5 w-3.5" /> Sain</span>;
}

export function BadgeStatut({ statut }: { statut: string | null | undefined }) {
  const map: Record<string, string> = {
    brouillon: 'bg-slate-500/15 text-slate-300',
    actif: 'bg-emerald-500/15 text-emerald-300',
    suspendu: 'bg-amber-500/15 text-amber-300',
    termine: 'bg-sky-500/15 text-sky-300',
    archive: 'bg-slate-700/40 text-slate-400',
  };
  const labels: Record<string, string> = { brouillon: 'Brouillon', actif: 'Actif', suspendu: 'Suspendu', termine: 'Terminé', archive: 'Archivé' };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[statut || ''] || map.brouillon}`}>{labels[statut || ''] || statut || '—'}</span>;
}

// Bandeau de prudence juridique — affiché partout où l'app analyse ou suggère.
export function Prudence({ compact }: { compact?: boolean }) {
  return (
    <div className={`flex gap-3 rounded-2xl border border-sky-400/20 bg-sky-500/8 p-4 text-sky-100/90 ${compact ? 'text-xs' : 'text-sm'}`}>
      <Scale className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" />
      <p>
        <strong className="font-semibold text-sky-200">Information, pas consultation juridique.</strong>{' '}
        Contractos organise vos faits, clauses et preuves et signale des points de vigilance. Il ne prédit aucune
        décision de justice et ne remplace ni avocat, ni notaire, ni professionnel du droit — consultez-les en cas
        d’enjeu ou de doute.
      </p>
    </div>
  );
}

export function SectionTitre({ icon, titre, sous, action }: { icon?: React.ReactNode; titre: string; sous?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        {icon && <div className="mt-0.5 rounded-xl bg-white/5 p-2 text-amber-300">{icon}</div>}
        <div>
          <h2 className="font-display text-lg font-semibold text-white">{titre}</h2>
          {sous && <p className="mt-0.5 max-w-2xl text-sm text-slate-400">{sous}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3800);
    return () => clearTimeout(t);
  }, [toast]);
  const el = toast ? (
    <div className={`fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-medium shadow-2xl backdrop-blur ${toast.type === 'ok' ? 'border-emerald-400/30 bg-emerald-950/90 text-emerald-200' : 'border-red-400/30 bg-red-950/90 text-red-200'}`}>
      {toast.type === 'ok' ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
      {toast.msg}
    </div>
  ) : null;
  return { toastEl: el, ok: (msg: string) => setToast({ type: 'ok', msg }), err: (msg: string) => setToast({ type: 'err', msg }) };
}

export { AlertTriangle, ArrowRight, BadgeCheck, Bell, CalendarClock, Check, ChevronRight, FileText, Landmark, Plus, Scale, ShieldAlert, Sparkles, Upload, Users, Info, FilePlus2, Search };
export { Link };
