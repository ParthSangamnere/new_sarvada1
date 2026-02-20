import { motion } from 'framer-motion'
import { AlertTriangle, Droplet, GaugeCircle, TrendingUp, TrendingDown, Minus, MapPin, Clock } from 'lucide-react'
import { DAM_DISTRICTS, REGION_TOTALS } from '../data/damRegistry'

const getRiskClasses = (pct) => {
  if (pct >= 90) return { badge: 'bg-amber-500/20 text-amber-100 border border-amber-500/50', dot: 'bg-amber-400', bar: 'from-amber-500 to-rose-500' }
  if (pct >= 75) return { badge: 'bg-emerald-500/15 text-emerald-100 border border-emerald-500/40', dot: 'bg-emerald-400', bar: 'from-sky-500 to-emerald-400' }
  if (pct >= 50) return { badge: 'bg-sky-500/15 text-sky-100 border border-sky-500/40', dot: 'bg-sky-400', bar: 'from-sky-600 to-sky-400' }
  return { badge: 'bg-rose-500/20 text-rose-100 border border-rose-500/50', dot: 'bg-rose-400', bar: 'from-rose-600 to-rose-400' }
}

const TrendIcon = ({ current, lastYear }) => {
  const diff = current - lastYear
  if (Math.abs(diff) < 1) return <Minus size={11} className="text-slate-500" />
  if (diff > 0) return <TrendingUp size={11} className="text-emerald-400" />
  return <TrendingDown size={11} className="text-rose-400" />
}

const StorageBar = ({ pct, risk }) => (
  <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-800/80">
    <div
      className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${risk.bar}`}
      style={{ width: `${Math.min(pct, 100)}%`, transition: 'width 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)' }}
    />
  </div>
)

const DISTRICT_COLORS = {
  Ahilyanagar: { accent: 'text-violet-300', border: 'border-violet-500/30', bg: 'bg-violet-500/8' },
  Jalgaon: { accent: 'text-amber-300', border: 'border-amber-500/30', bg: 'bg-amber-500/8' },
  Nashik: { accent: 'text-sky-300', border: 'border-sky-500/30', bg: 'bg-sky-500/8' },
}

export default function MultiDamStatusPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ type: 'tween', duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
      className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GaugeCircle size={18} className="text-sky-300" />
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Official Storage</p>
            <p className="text-sm font-semibold text-slate-100">20 Feb 2026 — Govt. of Maharashtra</p>
          </div>
        </div>
        <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-100">
          {REGION_TOTALS.damCount} Dams
        </span>
      </div>

      {/* Region Aggregate Bar */}
      <div className="mt-3 rounded-xl border border-slate-800/70 bg-slate-950/50 px-3 py-2.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="uppercase tracking-wide text-slate-400">Nashik Region Total</span>
          <span className="font-mono font-bold text-sky-200">{REGION_TOTALS.storagePct}%</span>
        </div>
        <div className="mt-1.5 relative h-2 w-full overflow-hidden rounded-full bg-slate-800/80">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-sky-500 to-emerald-400"
            style={{ width: `${REGION_TOTALS.storagePct}%`, transition: 'width 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)' }}
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
          <span>Storage: <span className="font-mono text-slate-300">{REGION_TOTALS.totalStorage.toLocaleString()} MCM</span></span>
          <span className="flex items-center gap-1">
            Last yr: <span className="font-mono text-slate-400">{REGION_TOTALS.lastYearPct}%</span>
            <TrendIcon current={REGION_TOTALS.storagePct} lastYear={REGION_TOTALS.lastYearPct} />
          </span>
        </div>
      </div>

      {/* District Groups */}
      <div className="mt-3 space-y-3">
        {DAM_DISTRICTS.map((group) => {
          const dc = DISTRICT_COLORS[group.district] ?? DISTRICT_COLORS.Nashik
          const avgPct = group.dams.reduce((s, d) => s + d.storagePct, 0) / group.dams.length
          return (
            <div key={group.district}>
              {/* District Header */}
              <div className={`flex items-center justify-between rounded-lg ${dc.bg} ${dc.border} border px-2.5 py-1.5`}>
                <div className="flex items-center gap-1.5">
                  <MapPin size={12} className={dc.accent} />
                  <span className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${dc.accent}`}>
                    {group.district}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {group.dams.length} dams · avg {avgPct.toFixed(1)}%
                </span>
              </div>

              {/* Dam Cards */}
              <div className="mt-1.5 space-y-1.5">
                {group.dams.map((dam) => {
                  const risk = getRiskClasses(dam.storagePct)
                  const diff = dam.storagePct - dam.lastYearPct
                  return (
                    <motion.div
                      key={dam.id}
                      initial={{ opacity: 0, y: 6, filter: 'blur(2px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      transition={{ type: 'tween', duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                      className="rounded-lg border border-slate-800/60 bg-slate-950/40 px-2.5 py-2"
                    >
                      {/* Row 1: Name + Storage % */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 rounded-full ${risk.dot}`} />
                          <p className="text-[12px] font-semibold text-slate-100">{dam.name}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${risk.badge}`}>
                            {dam.storagePct.toFixed(1)}%
                          </span>
                          <TrendIcon current={dam.storagePct} lastYear={dam.lastYearPct} />
                        </div>
                      </div>

                      {/* Row 2: Storage Bar */}
                      <div className="mt-1.5">
                        <StorageBar pct={dam.storagePct} risk={risk} />
                      </div>

                      {/* Row 3: Details */}
                      <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Droplet size={9} className="text-sky-400" />
                          <span className="font-mono text-slate-300">{dam.totalStorage.toFixed(0)}</span>
                          <span>/ {dam.liveStorageFRL.toFixed(0)} MCM</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className={`font-mono ${diff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {diff >= 0 ? '+' : ''}{diff.toFixed(1)}%
                          </span>
                          <span>vs last yr</span>
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500">
        <span className="flex items-center gap-1">
          <Clock size={10} className="text-slate-500" />
          Source: WRD Pravah · 20 Feb 2026
        </span>
        <span className="font-mono">Inflow: {REGION_TOTALS.totalInflow.toFixed(0)} MCM</span>
      </div>
    </motion.div>
  )
}
