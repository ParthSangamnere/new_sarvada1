import { motion } from 'framer-motion'
import { AlertTriangle, Droplet, GaugeCircle } from 'lucide-react'
import { DAM_REGISTRY } from '../data/damRegistry'

const getRiskClasses = (pct) => {
  if (pct >= 95) return { badge: 'bg-rose-500/20 text-rose-100 border border-rose-500/50', dot: 'bg-rose-400 shadow-neon' }
  if (pct >= 90) return { badge: 'bg-amber-500/20 text-amber-100 border border-amber-500/50', dot: 'bg-amber-400' }
  return { badge: 'bg-emerald-500/15 text-emerald-100 border border-emerald-500/40', dot: 'bg-emerald-400' }
}

export default function MultiDamStatusPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GaugeCircle size={18} className="text-sky-300" />
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Official Storage</p>
            <p className="text-sm font-semibold text-slate-100">Feb 2026 Government Data</p>
          </div>
        </div>
        <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-100">
          Discharge: 0 cusecs
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {DAM_REGISTRY.map((dam) => {
          const risk = getRiskClasses(dam.storagePct)
          return (
            <motion.div
              key={dam.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 20 }}
              className="rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${risk.dot}`} />
                  <p className="font-semibold text-slate-100">{dam.name}</p>
                </div>
                <span className={`rounded-lg px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${risk.badge}`}>
                  {dam.storagePct.toFixed(2)}%
                </span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-400">
                <div className="rounded-lg border border-slate-800/60 bg-slate-900/40 px-2 py-2">
                  <div className="flex items-center gap-1 text-[11px] uppercase tracking-wide">
                    <Droplet size={12} className="text-sky-300" />
                    Storage
                  </div>
                  <p className="mt-1 font-mono text-sm text-slate-100">{dam.storagePct.toFixed(2)}% (official)</p>
                  <p className="text-[10px] text-slate-500">Mcft not provided in PDF</p>
                </div>
                <div className="rounded-lg border border-slate-800/60 bg-slate-900/40 px-2 py-2">
                  <div className="flex items-center gap-1 text-[11px] uppercase tracking-wide">
                    <AlertTriangle size={12} className="text-amber-300" />
                    Risk
                  </div>
                  <p className="mt-1 font-mono text-sm text-slate-100">{dam.storagePct >= 90 ? 'High' : 'Normal'}</p>
                  <p className="text-[10px] text-slate-500">Threshold: 90%+</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
