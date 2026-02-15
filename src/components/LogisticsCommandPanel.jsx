import { motion } from 'framer-motion'
import { MapPin, ShieldCheck, AlertTriangle, Route, Download } from 'lucide-react'
import { useMemo } from 'react'
import { useFloodRisk } from '../state/FloodRiskContext'
import { BRIDGES, SAFE_SHELTERS } from '../data/logisticsData'

const bridgeStatus = (waterSurfaceElevation, msl) => {
  if (waterSurfaceElevation > msl) return 'CLOSED'
  if (msl - waterSurfaceElevation <= 0.5) return 'DANGER'
  return 'OPEN'
}

const statusClasses = (status) => {
  switch (status) {
    case 'CLOSED':
      return 'border-rose-600/50 bg-rose-900/30 text-rose-100'
    case 'DANGER':
      return 'border-amber-500/50 bg-amber-900/25 text-amber-100'
    default:
      return 'border-emerald-500/40 bg-emerald-900/20 text-emerald-100'
  }
}

export default function LogisticsCommandPanel() {
  const { waterSurfaceElevation, floodImpacts } = useFloodRisk()

  const { bridges, closedCount, evacuationZones } = useMemo(() => {
    const statuses = BRIDGES.map((b) => {
      const status = bridgeStatus(waterSurfaceElevation, b.msl)
      return { ...b, status }
    })
    const closed = statuses.filter((b) => b.status === 'CLOSED').length
    const evacZones = floodImpacts.filter((i) => i.isFlooded).length
    return { bridges: statuses, closedCount: closed, evacuationZones: evacZones }
  }, [waterSurfaceElevation, floodImpacts])

  const handleSitrep = () => {
    try {
      window.dispatchEvent(new CustomEvent('open-sitrep'))
    } catch (e) {
      // no-op
    }
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
          <ShieldCheck size={18} className="text-sky-300" />
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Logistics</p>
            <p className="text-sm font-semibold text-slate-100">NDRF Route & Bridge Status</p>
          </div>
        </div>
        <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-100">
          Live
        </span>
      </div>

      <div className="mt-3 text-xs text-slate-400">
        WSE: <span className="font-mono text-sky-200">{waterSurfaceElevation.toFixed(2)} m</span>
      </div>

      <div className="mt-3 space-y-2">
        {bridges.map((bridge) => (
          <div key={bridge.id} className={`rounded-xl border px-3 py-2 ${statusClasses(bridge.status)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${bridge.status === 'CLOSED' ? 'bg-rose-400 animate-pulse' : bridge.status === 'DANGER' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                <p className="font-semibold text-slate-100">{bridge.name}</p>
              </div>
              <span className="font-mono text-[11px]">MSL {bridge.msl.toFixed(1)}m</span>
            </div>
            <div className="mt-1 text-xs text-slate-200">Status: {bridge.status}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-slate-800/70 bg-slate-950/40 p-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
          <Route size={14} className="text-sky-300" /> Safe Havens
        </div>
        <div className="mt-2 space-y-1 text-xs text-slate-300">
          {SAFE_SHELTERS.map((shelter) => (
            <div key={shelter.id} className="flex items-center justify-between rounded-lg border border-slate-800/60 bg-slate-900/50 px-2 py-1">
              <div className="flex items-center gap-2">
                <MapPin size={12} className="text-emerald-300" />
                <span>{shelter.name}</span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">{shelter.msl} m</span>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleSitrep}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-sky-500/60 bg-sky-600/20 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-sky-100 transition hover:border-sky-400 hover:bg-sky-500/25"
      >
        <Download size={16} /> Generate SITREP
      </button>
    </motion.div>
  )
}
