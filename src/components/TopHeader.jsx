import { motion } from 'framer-motion'
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
      className="glass-surface grid-noise relative z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/60 px-5 py-3 backdrop-blur-md"
      initial={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ type: 'tween', duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Left — Brand */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/80 to-cyan-400/60 shadow-neon">
          <span className="text-[15px] font-extrabold tracking-tight text-slate-950">S</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[13px] font-bold tracking-[0.18em] text-slate-50">SARVADA</span>
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.22em] text-slate-400">
            <Activity size={13} className="text-sky-400" />
            Command Center
          </div>
        </div>
      </div>

      {/* Center — Simulation Mode banner (only visible during simulation) */}
      {isSimulating && (
        <div className="mx-auto flex items-center gap-2 rounded-xl border border-cyan-500/50 bg-cyan-500/10 px-4 py-2 text-cyan-100 shadow-neon">
          <AlertTriangle size={14} className="text-cyan-200" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">Simulation Mode</span>
        </div>
      )}

      {/* Right — Scrolling ticker */}
      <div className="ml-auto flex-1 min-w-0 overflow-hidden relative" style={{ maskImage: 'linear-gradient(to right, transparent, black 3%, black 97%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 3%, black 97%, transparent)' }}>
        <div className="ticker-track flex w-max items-center gap-3 text-sm">
          {/* First copy */}
          <div className="flex items-center gap-2 rounded-xl border border-sky-400/60 bg-gradient-to-r from-sky-950/80 to-slate-800/70 px-3 py-2 shadow-lg shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-100">Time</span>
            <span className="font-mono text-sm font-extrabold text-white">{timeString}</span>
          </div>
          <span className="text-slate-500 shrink-0">•</span>
          <div className="flex items-center gap-2 rounded-xl border border-slate-500/70 bg-slate-800/70 px-3 py-2 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200">Dam Level</span>
            <span className="font-mono text-sm font-extrabold text-white">{damLevel}%</span>
          </div>
          <span className="text-slate-500 shrink-0">•</span>
          <div className="flex items-center gap-2 rounded-xl border border-sky-500/60 bg-slate-800/70 px-3 py-2 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200">Catchment Rain</span>
            <span className="font-mono text-sm font-extrabold text-sky-100">
              {isCatchmentLoading ? 'Loading…' : `${rainfall.toFixed(1)} mm/hr`}
            </span>
          </div>
          <span className="text-slate-500 shrink-0">•</span>
          <button
            type="button"
            onClick={cycleRisk}
            className="flex items-center gap-2 rounded-xl border border-slate-500/60 bg-slate-800/60 px-3 py-2 text-left transition hover:border-slate-400/70 shrink-0"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200">System Status</span>
            <span className={`inline-flex items-center gap-2 rounded-lg px-2 py-1 text-xs font-bold uppercase tracking-wide ${statusClasses} pulse-glow`}>
              {statusLabel}
            </span>
          </button>
          <span className="text-slate-500 shrink-0">•</span>
          <div className="flex items-center gap-2 rounded-xl border border-sky-400/60 bg-sky-500/20 px-3 py-2 text-sky-50 shadow-neon shrink-0">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-50">Predicted Inflow</span>
            <span className="font-mono font-extrabold text-white">
              {isCatchmentLoading ? '—' : `${Math.round(inflow).toLocaleString()} cusecs`}
            </span>
          </div>
          <span className="text-slate-500 shrink-0">•</span>
          <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] shrink-0 ${telemetryDegraded ? 'border-amber-400/70 bg-amber-500/20 text-amber-50' : 'border-emerald-400/60 bg-emerald-500/15 text-emerald-100'}`}>
            {telemetryDegraded ? <AlertTriangle size={14} className="text-amber-200" /> : <AlertTriangle size={14} className="text-emerald-200" />}
            {telemetryDegraded ? 'Data Integrity at Risk' : 'Telemetry Nominal'}
          </div>
          <span className="text-slate-500 shrink-0">•</span>
          <div className="flex items-center gap-2 rounded-xl border border-rose-400/50 bg-rose-500/15 px-3 py-2 text-rose-50 shadow-neon shrink-0">
            <LifeBuoy size={16} className="text-rose-200" />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em]">SOS</span>
            <span className="font-mono text-sm font-extrabold text-white">{activeSos}</span>
          </div>
          <span className="text-slate-500 shrink-0">•</span>
          <button
            type="button"
            onClick={() => onOpenSitrep?.()}
            className="flex items-center gap-2 rounded-lg border border-blue-400/70 bg-blue-600/25 px-3 py-1.5 text-left text-blue-100 shadow-[0_0_20px_rgba(59,130,246,0.35)] transition hover:bg-blue-600/35 hover:text-white shrink-0"
          >
            <FileText size={16} className="text-blue-200" />
            <span className="text-[10px] font-extrabold uppercase tracking-[0.22em]">Generate Sitrep</span>
          </button>
          <span className="w-12 shrink-0" />
          {/* Duplicate copy for seamless loop */}
          <div className="flex items-center gap-2 rounded-xl border border-sky-400/60 bg-gradient-to-r from-sky-950/80 to-slate-800/70 px-3 py-2 shadow-lg shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-100">Time</span>
            <span className="font-mono text-sm font-extrabold text-white">{timeString}</span>
          </div>
          <span className="text-slate-500 shrink-0">•</span>
          <div className="flex items-center gap-2 rounded-xl border border-slate-500/70 bg-slate-800/70 px-3 py-2 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200">Dam Level</span>
            <span className="font-mono text-sm font-extrabold text-white">{damLevel}%</span>
          </div>
          <span className="text-slate-500 shrink-0">•</span>
          <div className="flex items-center gap-2 rounded-xl border border-sky-500/60 bg-slate-800/70 px-3 py-2 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200">Catchment Rain</span>
            <span className="font-mono text-sm font-extrabold text-sky-100">
              {isCatchmentLoading ? 'Loading…' : `${rainfall.toFixed(1)} mm/hr`}
            </span>
          </div>
          <span className="text-slate-500 shrink-0">•</span>
          <button
            type="button"
            onClick={cycleRisk}
            className="flex items-center gap-2 rounded-xl border border-slate-500/60 bg-slate-800/60 px-3 py-2 text-left transition hover:border-slate-400/70 shrink-0"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200">System Status</span>
            <span className={`inline-flex items-center gap-2 rounded-lg px-2 py-1 text-xs font-bold uppercase tracking-wide ${statusClasses} pulse-glow`}>
              {statusLabel}
            </span>
          </button>
          <span className="text-slate-500 shrink-0">•</span>
          <div className="flex items-center gap-2 rounded-xl border border-sky-400/60 bg-sky-500/20 px-3 py-2 text-sky-50 shadow-neon shrink-0">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-50">Predicted Inflow</span>
            <span className="font-mono font-extrabold text-white">
              {isCatchmentLoading ? '—' : `${Math.round(inflow).toLocaleString()} cusecs`}
            </span>
          </div>
          <span className="text-slate-500 shrink-0">•</span>
          <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] shrink-0 ${telemetryDegraded ? 'border-amber-400/70 bg-amber-500/20 text-amber-50' : 'border-emerald-400/60 bg-emerald-500/15 text-emerald-100'}`}>
            {telemetryDegraded ? <AlertTriangle size={14} className="text-amber-200" /> : <AlertTriangle size={14} className="text-emerald-200" />}
            {telemetryDegraded ? 'Data Integrity at Risk' : 'Telemetry Nominal'}
          </div>
          <span className="text-slate-500 shrink-0">•</span>
          <div className="flex items-center gap-2 rounded-xl border border-rose-400/50 bg-rose-500/15 px-3 py-2 text-rose-50 shadow-neon shrink-0">
            <LifeBuoy size={16} className="text-rose-200" />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em]">SOS</span>
            <span className="font-mono text-sm font-extrabold text-white">{activeSos}</span>
          </div>
          <span className="text-slate-500 shrink-0">•</span>
          <button
            type="button"
            onClick={() => onOpenSitrep?.()}
            className="flex items-center gap-2 rounded-lg border border-blue-400/70 bg-blue-600/25 px-3 py-1.5 text-left text-blue-100 shadow-[0_0_20px_rgba(59,130,246,0.35)] transition hover:bg-blue-600/35 hover:text-white shrink-0"
          >
            <FileText size={16} className="text-blue-200" />
            <span className="text-[10px] font-extrabold uppercase tracking-[0.22em]">Generate Sitrep</span>
          </button>
          <span className="w-12 shrink-0" />
        </div>
      </div>
    </motion.header>
  )
}

TopHeader.propTypes = {
  systemStatus: PropTypes.string,
  damLevel: PropTypes.number,
  onOpenSitrep: PropTypes.func,
}
