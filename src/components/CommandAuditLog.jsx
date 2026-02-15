import { useMemo } from 'react'
import { useAuditLog } from '../hooks/useAuditLog'

export default function CommandAuditLog() {
  const { logs } = useAuditLog()

  const sorted = useMemo(() => logs, [logs])

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-4 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Command Audit</p>
          <p className="text-lg font-semibold text-slate-100">Tamper-Evident Log</p>
        </div>
        <span className="rounded-full border border-sky-500/50 bg-sky-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-100">
          Immutable
        </span>
      </div>
      <div className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
        {sorted.length === 0 && <p className="text-sm text-slate-400">No entries yet.</p>}
        {sorted.map((entry) => (
          <div key={entry.id} className="rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-slate-200">{entry.id}</span>
              <span className="font-mono">{new Date(entry.timestamp).toLocaleTimeString()}</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-100">{entry.action}</p>
            {entry.value && <p className="text-xs text-slate-400">{entry.value}</p>}
            <p className="mt-1 text-[11px] text-slate-500">By {entry.user ?? 'ADMIN-01'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
