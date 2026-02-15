import { AnimatePresence, motion } from 'framer-motion'
import { useMemo } from 'react'
import { useFloodRisk } from '../state/FloodRiskContext'
import { NASHIK_TOPOGRAPHY } from '../data/nashikTopography'

const ECONOMIC_WEIGHTS = {
  commercial: 550_000,
  residential: 220_000,
  infrastructure: 800_000,
  'sacred-site': 350_000,
  cultural: 300_000,
  default: 250_000,
}

const riskBadge = (depth) => {
  if (depth <= 0) return { label: 'Safe', className: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100' }
  if (depth <= 0.5) return { label: 'Ghat Inundation', className: 'border-amber-500/50 bg-amber-500/15 text-amber-100' }
  return { label: 'Structural Entry', className: 'border-rose-500/50 bg-rose-500/15 text-rose-100' }
}

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)

const CATEGORY_LABELS = {
  commercial: 'Commercial / Markets',
  residential: 'Housing & Property',
  infrastructure: 'Roads & Infrastructure',
  'sacred-site': 'Heritage & Ghats',
  cultural: 'Cultural Assets',
  agriculture: 'Agriculture',
}

export default function StructuralImpactReport() {
  const { waterSurfaceElevation } = useFloodRisk()

  const { submerged, totalLoss, breakdown } = useMemo(() => {
    const impacted = NASHIK_TOPOGRAPHY.filter((l) => waterSurfaceElevation > l.msl).map((l) => {
      const depth = Number((waterSurfaceElevation - l.msl).toFixed(2))
      const base = ECONOMIC_WEIGHTS[l.category] ?? ECONOMIC_WEIGHTS.default
      const loss = base * Math.max(depth, 0) * (l.risk_factor ?? 1)
      return { ...l, depth, loss }
    })

    const lossSum = impacted.reduce((acc, l) => acc + l.loss, 0)

    const byCategory = impacted.reduce((acc, l) => {
      const key = l.category in CATEGORY_LABELS ? l.category : 'default'
      acc[key] = (acc[key] ?? 0) + l.loss
      return acc
    }, /** @type {Record<string, number>} */ ({}))

    // Ensure required buckets exist even if zero to present PDF-like summary rows
    const ensured = {
      commercial: byCategory.commercial ?? 0,
      residential: byCategory.residential ?? 0,
      infrastructure: byCategory.infrastructure ?? 0,
      'sacred-site': byCategory['sacred-site'] ?? 0,
      cultural: byCategory.cultural ?? 0,
      agriculture: byCategory.agriculture ?? 0, // no current data, shown as 0 unless added
      default: byCategory.default ?? 0,
    }

    return { submerged: impacted, totalLoss: lossSum, breakdown: ensured }
  }, [waterSurfaceElevation])

  return (
    <div className="glass-surface mt-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Structural Impact</p>
          <p className="text-lg font-semibold text-slate-100">Commercial & Heritage Risk</p>
          <p className="text-xs text-slate-500">Reactive to current WSE and dam discharge</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Estimated Economic Loss</p>
          <p className="font-mono text-xl font-bold text-rose-200">{formatCurrency(totalLoss)}</p>
          <p className="text-[11px] text-slate-500">Dynamic • depth-weighted</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-800/60 bg-slate-950/40 p-3">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span>Landmarks Under Water</span>
          <span className="font-mono text-sky-200">{submerged.length}</span>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <AnimatePresence initial={false}>
          {submerged.map((site) => {
            const badge = riskBadge(site.depth)
            return (
              <motion.div
                key={site.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                className="rounded-lg border border-slate-800/70 bg-slate-900/60 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-100">{site.name}</p>
                    <p className="text-[11px] text-slate-400">MSL: <span className="font-mono text-slate-200">{site.msl.toFixed(1)} m</span></p>
                    <span className={`inline-flex items-center gap-2 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">Depth</p>
                    <p className="font-mono text-lg font-bold text-rose-300">{site.depth.toFixed(2)} m</p>
                    <p className="text-[11px] text-slate-500">Loss: <span className="font-mono text-amber-200">{formatCurrency(site.loss)}</span></p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {submerged.length === 0 && (
          <div className="rounded-lg border border-emerald-700/40 bg-emerald-900/20 p-3 text-sm text-emerald-100">
            ✓ All registered heritage and commercial sites are safe at current WSE.
          </div>
        )}
      </div>

      {/* Loss basis summary (PDF-style rows) */}
      <div className="mt-4 rounded-xl border border-slate-800/70 bg-slate-900/60 p-3">
        <div className="flex items-center justify-between pb-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Loss Basis</p>
            <p className="text-xs text-slate-500">Roads, housing, heritage, and commercial exposures</p>
          </div>
          <span className="rounded-lg border border-slate-700/50 bg-slate-800/70 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-200">
            Explained
          </span>
        </div>
        <div className="divide-y divide-slate-800/60 text-sm">
          {Object.entries(breakdown).map(([key, value]) => {
            const label = CATEGORY_LABELS[key] ?? 'Other'
            return (
              <div key={key} className="flex items-center justify-between py-2">
                <div className="flex flex-col">
                  <span className="text-slate-200">{label}</span>
                  <span className="text-[11px] text-slate-500">
                    Basis: {key === 'infrastructure' ? 'Roads/bridges/utilities' : key === 'residential' ? 'Housing & property' : key === 'commercial' ? 'Markets/business frontage' : key === 'agriculture' ? 'Crop fields (none in registry)' : 'Cultural/heritage assets'}
                  </span>
                </div>
                <span className="font-mono text-amber-200">{formatCurrency(value)}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
