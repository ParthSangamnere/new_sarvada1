import { AnimatePresence, motion } from 'framer-motion'
import PropTypes from 'prop-types'
import { useEffect, useMemo, useState } from 'react'
import { Activity, LifeBuoy, FileText, AlertTriangle } from 'lucide-react'
import { useFloodRisk } from '../state/FloodRiskContext'
import { SENSOR_NETWORK } from '../data/sensorNetwork'

/**
 * Glassmorphic command bar with live status readouts.
 * @param {object} props
 * @param {string} props.systemStatus - High-level operational status. Context overrides during simulation.
 * @param {number} props.damLevel - Current dam capacity percentage.
 */
export default function TopHeader({ systemStatus: systemStatusProp = 'LIVE', damLevel = 88, onOpenSitrep }) {
  const {
    riskLevel,
    setRiskLevel,
    theme,
    catchmentData,
    isCatchmentLoading,
    citizenReports,
    systemStatus,
    isSimulating,
  } = useFloodRisk()
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

  const rainfall = catchmentData?.currentRainfall ?? 0
  const inflow = catchmentData?.predictedInflow ?? 0
  const activeSos = useMemo(
    () => (citizenReports ?? []).filter((r) => r.status !== 'resolved').length,
    [citizenReports],
  )
  const telemetryDegraded = useMemo(() => SENSOR_NETWORK.some((s) => s.status !== 'online'), [])

  // Auto-status override based on live rainfall
  const effectiveStatus = isSimulating ? 'SIMULATION' : systemStatus ?? systemStatusProp
  const statusLabel = rainfall > 15 ? 'HEAVY INFLOW' : rainfall > 10 ? 'ALERT' : effectiveStatus
  const statusClasses =
    rainfall > 15
      ? 'border-rose-500/40 bg-rose-500/15 text-rose-100 ring-1 ring-rose-400/60 animate-pulse'
      : rainfall > 10
        ? 'border-amber-500/40 bg-amber-500/15 text-amber-100 ring-1 ring-amber-400/60'
        : effectiveStatus === 'SIMULATION'
          ? 'border-cyan-400/50 bg-cyan-500/15 text-cyan-100 ring-1 ring-cyan-300/60'
          : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'

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
        {isSimulating && (
          <div className="flex items-center gap-2 rounded-xl border border-cyan-500/50 bg-cyan-500/10 px-3 py-2 text-cyan-100 shadow-neon">
            <AlertTriangle size={14} className="text-cyan-200" />
            <span className="text-[11px] uppercase tracking-[0.18em]">Simulation Mode</span>
          </div>
        )}
        <div className="flex items-center gap-2 rounded-xl border border-slate-700/50 bg-slate-900/40 px-3 py-2 backdrop-blur-sm">
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Dam Level</span>
          <span className="font-mono text-sm font-semibold text-slate-400">{damLevel}%</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-sky-700/50 bg-slate-900/40 px-3 py-2 backdrop-blur-sm">
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Catchment Rain</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={isCatchmentLoading ? 'loading-rain' : rainfall}
              className="font-mono text-sm font-semibold text-sky-300"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ type: 'spring', stiffness: 240, damping: 18 }}
            >
              {isCatchmentLoading ? 'Loading…' : `${rainfall.toFixed(1)} mm/hr`}
            </motion.span>
          </AnimatePresence>
        </div>
        <button
          type="button"
          onClick={cycleRisk}
          className="flex items-center gap-2 rounded-xl border border-slate-700/40 bg-slate-900/30 px-3 py-2 text-left backdrop-blur-sm transition hover:border-slate-600/60"
        >
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">System Status</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={statusLabel}
              className={`inline-flex items-center gap-2 rounded-lg px-2 py-1 text-xs font-semibold uppercase tracking-wide ${statusClasses} pulse-glow`}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            >
              {statusLabel}
            </motion.span>
          </AnimatePresence>
        </button>
        <div className="flex items-center gap-2 rounded-xl border border-sky-500/40 bg-sky-500/10 px-3 py-2 text-sky-200 shadow-neon">
          <span className="text-[11px] uppercase tracking-[0.18em] text-sky-200/80">Predicted Inflow</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={isCatchmentLoading ? 'loading-inflow' : inflow}
              className="font-mono font-bold"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ type: 'spring', stiffness: 240, damping: 18 }}
            >
              {isCatchmentLoading ? '—' : `${Math.round(inflow).toLocaleString()} cusecs`}
            </motion.span>
          </AnimatePresence>
        </div>
        <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${telemetryDegraded ? 'border-amber-500/60 bg-amber-500/10 text-amber-100 animate-pulse' : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'}`}>
          {telemetryDegraded ? <AlertTriangle size={14} className="text-amber-300" /> : <AlertTriangle size={14} className="text-emerald-300" />}
          {telemetryDegraded ? 'Data Integrity at Risk' : 'Telemetry Nominal'}
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-rose-100 shadow-neon">
          <LifeBuoy size={16} className="text-rose-300" />
          <span className="text-[11px] uppercase tracking-[0.18em]">SOS</span>
          <span className="font-mono text-sm font-bold">{activeSos}</span>
        </div>
        <button
          type="button"
          onClick={() => onOpenSitrep?.()}
          className="flex items-center gap-2 rounded-lg border border-blue-500/60 bg-blue-600/15 px-3 py-1.5 text-left text-blue-200 shadow-[0_0_20px_rgba(59,130,246,0.25)] transition hover:bg-blue-600/25 hover:text-white"
        >
          <FileText size={16} className="text-blue-300" />
          <span className="text-[10px] font-bold uppercase tracking-[0.22em]">Generate Sitrep</span>
        </button>
      </div>
    </motion.header>
  )
}

TopHeader.propTypes = {
  systemStatus: PropTypes.string,
  damLevel: PropTypes.number,
  onOpenSitrep: PropTypes.func,
}
