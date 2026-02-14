import { motion } from 'framer-motion'
import { AlertCircle, Zap } from 'lucide-react'
import { useFloodRisk } from '../state/FloodRiskContext'

/**
 * Real-time flood impact display showing inundated landmarks and risk metrics.
 */
export default function FloodImpactPanel() {
  const { waterSurfaceElevation, floodImpacts, damCusecs, setDamCusecs, criticalLandmarks } = useFloodRisk()

  const flooded = floodImpacts.filter((impact) => impact.isFlooded)
  const maxDepth = flooded.length > 0 ? Math.max(...flooded.map((f) => f.submergenceDepth)) : 0

  const handleCusecsChange = (e) => {
    setDamCusecs(Number(e.target.value))
  }

  return (
    <motion.div
      className="glass-surface flex flex-col gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <div>
        <h3 className="text-lg font-semibold text-slate-100">Inundation Analysis</h3>
        <p className="text-xs text-slate-400">Real-time flood impact assessment</p>
      </div>

      {/* Water Elevation Readout */}
      <div className="rounded-xl border border-slate-800/70 bg-slate-950/60 p-3">
        <div className="flex items-baseline justify-between">
          <span className="text-xs uppercase tracking-wide text-slate-400">Water Surface Elevation</span>
          <motion.span
            key={waterSurfaceElevation}
            className="font-mono text-lg font-bold text-sky-300"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 220 }}
          >
            {waterSurfaceElevation.toFixed(1)}m MSL
          </motion.span>
        </div>
      </div>

      {/* Dam Discharge Control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs uppercase tracking-wide text-slate-400">Dam Discharge</label>
          <span className="font-mono font-semibold text-amber-200">{damCusecs.toLocaleString()} cusecs</span>
        </div>
        <input
          type="range"
          min="5000"
          max="100000"
          step="5000"
          value={damCusecs}
          onChange={handleCusecsChange}
          className="w-full cursor-pointer accent-amber-500"
        />
        <div className="flex text-[10px] text-slate-500">
          <span>5k</span>
          <span className="flex-1 text-center">50k</span>
          <span className="text-right">100k</span>
        </div>
      </div>

      {/* Impact Statistics */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-slate-800/50 bg-slate-950/40 p-2">
          <p className="text-[10px] uppercase tracking-wide text-slate-500">Flooded Areas</p>
          <motion.p
            key={flooded.length}
            className="text-xl font-bold text-rose-300"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            {flooded.length}/{floodImpacts.length}
          </motion.p>
        </div>
        <div className="rounded-lg border border-slate-800/50 bg-slate-950/40 p-2">
          <p className="text-[10px] uppercase tracking-wide text-slate-500">Max Depth</p>
          <motion.p
            key={maxDepth}
            className="text-xl font-bold text-sky-300"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            {maxDepth.toFixed(2)}m
          </motion.p>
        </div>
      </div>

      {/* Critical Landmarks */}
      {criticalLandmarks.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-300">
            <AlertCircle size={14} />
            Critical Risk ({criticalLandmarks.length})
          </div>
          <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
            {criticalLandmarks.map((impact) => (
              <div
                key={impact.landmark.id}
                className="rounded-lg border border-rose-700/40 bg-rose-900/20 px-2 py-1.5 text-xs"
              >
                <p className="font-semibold text-rose-200">{impact.landmark.name}</p>
                <p className="text-rose-100/70">
                  {impact.submergenceDepth.toFixed(2)}m underwater • {impact.riskLevel.toUpperCase()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Flooded Landmarks List */}
      {flooded.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
            <Zap size={14} />
            Inundated Landmarks ({flooded.length})
          </div>
          <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
            {flooded.map((impact) => (
              <div
                key={impact.landmark.id}
                className="flex items-center justify-between rounded-lg border border-amber-700/40 bg-amber-900/20 px-2 py-1.5 text-xs"
              >
                <span className="font-medium text-amber-200">{impact.landmark.name}</span>
                <span className="font-mono text-amber-100/70">{impact.submergenceDepth.toFixed(2)}m</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {flooded.length === 0 && (
        <div className="rounded-lg border border-emerald-700/40 bg-emerald-900/20 p-3 text-center">
          <p className="text-xs font-semibold text-emerald-300">✓ All Areas Safe</p>
          <p className="text-xs text-emerald-200/70">Current water level does not threaten landmarks</p>
        </div>
      )}
    </motion.div>
  )
}
