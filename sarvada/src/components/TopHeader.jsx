import { AnimatePresence, motion } from 'framer-motion'
import PropTypes from 'prop-types'
import { useEffect, useMemo, useState } from 'react'
import { Activity } from 'lucide-react'
import { useFloodRisk } from '../state/FloodRiskContext'

/**
 * Glassmorphic command bar with live status readouts.
 * @param {object} props
 * @param {string} props.systemStatus - High-level operational status.
 * @param {number} props.damLevel - Current dam capacity percentage.
 */
export default function TopHeader({ systemStatus = 'LIVE', damLevel = 88 }) {
  const { riskLevel, setRiskLevel, theme } = useFloodRisk()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const timeString = useMemo(
    () =>
      now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    [now],
  )

  const cycleRisk = () => {
    const order = ['active', 'alert', 'critical']
    const next = order[(order.indexOf(riskLevel) + 1) % order.length]
    setRiskLevel(next)
  }

  return (
    <motion.header
      layout
      className="glass-surface grid-noise relative z-10 flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-900/60 px-5 py-4 backdrop-blur-md"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 240, damping: 22 }}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/80 to-cyan-400/60 text-lg font-bold text-slate-950 shadow-neon">
          GS
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Godavari Sentinel</span>
          <div className="flex items-center gap-2 text-xl font-semibold text-slate-50">
            <Activity size={18} className="text-sky-300" />
            War-Room Dashboard
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-2 rounded-xl border border-sky-500/30 bg-gradient-to-r from-slate-900/80 to-slate-800/60 px-4 py-2.5 shadow-lg">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-300">Current Time</span>
          <span className="font-mono text-base font-bold text-sky-300">{timeString}</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-700/50 bg-slate-900/40 px-3 py-2 backdrop-blur-sm">
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Dam Level</span>
          <span className="font-mono text-sm font-semibold text-slate-400">{damLevel}%</span>
        </div>
        <button
          type="button"
          onClick={cycleRisk}
          className="flex items-center gap-2 rounded-xl border border-slate-700/40 bg-slate-900/30 px-3 py-2 text-left backdrop-blur-sm transition hover:border-slate-600/60"
        >
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">System Status</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={riskLevel}
              className={`inline-flex items-center gap-2 rounded-lg px-2 py-1 text-xs font-semibold uppercase tracking-wide ${theme.bg} ${theme.text} ring-1 ${theme.ring} pulse-glow`}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            >
              {theme.label}
            </motion.span>
          </AnimatePresence>
        </button>
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-emerald-200 shadow-neon">
          <span className="text-[11px] uppercase tracking-[0.18em] text-emerald-200/80">Status</span>
          <span className="font-mono font-bold">{systemStatus}</span>
        </div>
      </div>
    </motion.header>
  )
}

TopHeader.propTypes = {
  systemStatus: PropTypes.string,
  damLevel: PropTypes.number,
}
