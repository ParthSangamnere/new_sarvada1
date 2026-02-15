import { motion } from 'framer-motion'
import { Brain } from 'lucide-react'
import PropTypes from 'prop-types'
import { useMemo } from 'react'
import { useFloodRisk } from '../state/FloodRiskContext'

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

export default function AiOptimizerPanel({ damLevel = 88, criticalThreshold = 594 }) {
  const { catchmentData, isCatchmentLoading, damCusecs, setDamCusecs } = useFloodRisk()

  const rainfall = catchmentData?.currentRainfall ?? 0

  const { optimalCusecs, reasoning } = useMemo(() => {
    const base = 10_000
    const incremental = rainfall * 1500
    const candidate = base + incremental
    const optimal = clamp(candidate, 5_000, 60_000)
    const text = isCatchmentLoading
      ? 'Calibrating with live telemetry…'
      : `Catchment rain at ${rainfall.toFixed(1)} mm/hr. Dam at ${damLevel}%. Releasing ${Math.round(optimal).toLocaleString()} cusecs to hold WSE below ${criticalThreshold}m MSL.`
    return { optimalCusecs: optimal, reasoning: text }
  }, [rainfall, damLevel, criticalThreshold, isCatchmentLoading])

  const handleExecute = () => {
    setDamCusecs(optimalCusecs)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      className="rounded-2xl border border-blue-500/50 bg-slate-900/80 p-4 shadow-[0_0_15px_rgba(59,130,246,0.2)] backdrop-blur"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Brain size={24} className="text-sky-300" />
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">AI Optimizer</p>
            <p className="text-lg font-semibold text-slate-100">Safe Release Recommendation</p>
          </div>
        </div>
        <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-100 animate-pulse">
          AI Active
        </span>
      </div>

      <div className="mt-4 flex items-baseline gap-3">
        <p className="text-xs uppercase tracking-wide text-slate-400">Optimal Discharge</p>
        <motion.span
          key={optimalCusecs}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 20 }}
          className="font-mono text-3xl font-bold text-sky-200"
        >
          {Math.round(optimalCusecs).toLocaleString()} cusecs
        </motion.span>
      </div>

      <motion.p
        key={reasoning}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 20 }}
        className="mt-3 font-mono text-sm text-slate-200"
      >
        {reasoning}
      </motion.p>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <span>Current slider: <span className="font-mono text-slate-200">{damCusecs.toLocaleString()} cusecs</span></span>
        <span>Rainfall: <span className="font-mono text-sky-200">{isCatchmentLoading ? '…' : `${rainfall.toFixed(1)} mm/hr`}</span></span>
      </div>

      <button
        type="button"
        onClick={handleExecute}
        className="mt-4 w-full rounded-xl border border-sky-500/60 bg-sky-600/20 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-sky-100 transition hover:border-sky-400 hover:bg-sky-500/25"
      >
        Authorize Optimal Release
      </button>
    </motion.div>
  )
}

AiOptimizerPanel.propTypes = {
  damLevel: PropTypes.number,
  criticalThreshold: PropTypes.number,
}
