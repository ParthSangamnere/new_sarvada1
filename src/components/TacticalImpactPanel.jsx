import { motion } from 'framer-motion'
import { ClipboardList, Download } from 'lucide-react'
import { useMemo } from 'react'
import { useFloodRisk } from '../state/FloodRiskContext'
import { INFRASTRUCTURE_REGISTRY } from '../data/infrastructureRegistry'

export default function TacticalImpactPanel() {
  const { waterSurfaceElevation } = useFloodRisk()

  const { impacted, populationAtRisk } = useMemo(() => {
    const impactedStructures = INFRASTRUCTURE_REGISTRY.map((item) => {
      const depth = Number((waterSurfaceElevation - item.plinthMSL).toFixed(2))
      const submerged = depth > 0
      const structuralRisk = depth > 1.5
      return {
        ...item,
        depth,
        submerged,
        structuralRisk,
        status: submerged ? 'SUBMERGED' : 'DRY',
      }
    })
    const popRisk = impactedStructures.filter((i) => i.submerged && i.category === 'residential').length
    return { impacted: impactedStructures, populationAtRisk: popRisk }
  }, [waterSurfaceElevation])

  const flooded = impacted.filter((i) => i.submerged)

  const exportSitrep = () => {
    const payload = flooded.map(({ id, name, category, plinthMSL, depth, usage }) => ({
      id,
      name,
      category,
      plinthMSL,
      submergenceDepth: depth,
      usage,
    }))
    // NDRF tactical export
    // eslint-disable-next-line no-console
    console.log('SITREP_EXPORT', payload)
  }

  const statusBadge = (item) => {
    if (item.depth > 1.5) return '⚠️ STRUCTURAL FAILURE RISK'
    if (item.depth > 0) return '🚨 EVACUATE'
    return 'DRY'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      className="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-4 backdrop-blur-md"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList size={18} className="text-sky-300" />
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Tactical Ops</p>
            <p className="text-sm font-semibold text-slate-100">Structure Inundation Report</p>
          </div>
        </div>
        <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-100">
          Pop at Risk: {populationAtRisk}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span>Live WSE: <span className="font-mono text-sky-200">{waterSurfaceElevation.toFixed(2)} m MSL</span></span>
        <button
          type="button"
          onClick={exportSitrep}
          className="inline-flex items-center gap-2 rounded-lg border border-sky-500/60 bg-sky-600/20 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-sky-100 transition hover:border-sky-400 hover:bg-sky-500/25"
        >
          <Download size={14} /> Export SITREP
        </button>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2">
        {impacted.map((item) => (
          <div
            key={item.id}
            className={`rounded-xl border px-3 py-3 ${item.submerged ? 'border-rose-600/50 bg-rose-900/20' : 'border-slate-800/70 bg-slate-950/40'}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${item.submerged ? 'bg-rose-400 animate-pulse' : 'bg-emerald-400'}`} />
                <p className="font-semibold text-slate-100">{item.name}</p>
              </div>
              <span className="font-mono text-[11px] text-slate-400">{item.usage}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-slate-300">
              <span className="font-mono">Plinth: {item.plinthMSL.toFixed(2)} m</span>
              <span className={`font-mono ${item.submerged ? 'text-rose-200' : 'text-emerald-200'}`}>
                Depth: {item.depth > 0 ? item.depth.toFixed(2) : '0.00'} m
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-400">Status: {statusBadge(item)}</div>
          </div>
        ))}
      </div>

      {flooded.length === 0 && (
        <div className="mt-2 rounded-lg border border-emerald-700/40 bg-emerald-900/20 p-3 text-sm text-emerald-100">
          ✓ All tracked structures are dry at current WSE.
        </div>
      )}
    </motion.div>
  )
}
