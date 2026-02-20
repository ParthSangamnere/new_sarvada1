import { motion } from 'framer-motion'
import MapContainer from '../components/MapContainer'
import FloodImpactPanel from '../components/FloodImpactPanel'
import StructuralImpactReport from '../components/StructuralImpactReport'
import AiOptimizerPanel from '../components/AiOptimizerPanel'
import MultiDamStatusPanel from '../components/MultiDamStatusPanel'
import TacticalImpactPanel from '../components/TacticalImpactPanel'
import LogisticsCommandPanel from '../components/LogisticsCommandPanel'
import CitizenSOSPanel from '../components/CitizenSOSPanel'
import PredictiveHydrograph from '../components/PredictiveHydrograph'
import SimulationController from '../components/SimulationController'
import { useFloodRisk } from '../state/FloodRiskContext'
import { useMemo } from 'react'

/**
 * Main Dashboard - The command center overview with map and real-time data
 */
export default function DashboardPage() {
  const { theme, catchmentData, isCatchmentLoading } = useFloodRisk()

  const alerts = useMemo(() => {
    const rainfall = catchmentData?.currentRainfall ?? 0
    const inflow = catchmentData?.predictedInflow ?? 0
    const updatedTime = catchmentData?.updatedAt
      ? new Date(catchmentData.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      : '—'

    const severity = rainfall > 15 ? 'critical' : rainfall > 5 ? 'warning' : 'info'

    const telemetryAlert = {
      id: 'weather-live',
      title: 'Catchment Telemetry',
      detail: isCatchmentLoading
        ? 'Fetching live telemetry…'
        : `Detected ${rainfall.toFixed(1)}mm/hr at Trimbakeshwar • Predicted inflow ~ ${Math.round(inflow).toLocaleString()} cusecs` +
          (catchmentData?.isFallback ? ' (fallback avg)' : ''),
      time: isCatchmentLoading ? '—' : updatedTime,
      severity,
    }

    return [
      telemetryAlert,
      { id: 'a2', title: 'Downstream Sensors', detail: 'Two nodes offline; rerouting data.', time: '09:11:28', severity: 'warning' },
      { id: 'a3', title: 'Ops Synchronization', detail: 'Model refresh scheduled with latest inflow.', time: '09:10:55', severity: 'info' },
    ]
  }, [catchmentData, isCatchmentLoading])

  const severityClasses = {
    critical: 'border-rose-700/60 bg-rose-900/30 shadow-neon',
    warning: 'border-amber-700/60 bg-amber-900/25',
    info: 'border-slate-800/70 bg-slate-900/60',
  }

  return (
    <>
      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-12">
      {/* Left Panel - Alerts Feed */}
      {/* Left Column - Alerts + Separate Analysis */}
      <div className="col-span-12 md:col-span-3 flex flex-col gap-4">
      <motion.section
        layout
        initial={{ opacity: 0, x: -20, filter: 'blur(4px)' }}
        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
        transition={{ type: 'tween', duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="glass-surface flex max-h-[calc(100vh-120px)] flex-col gap-4 overflow-y-auto rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md"
      >
        <div className="flex items-center justify-between pb-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Alerts</p>
            <p className="text-lg font-semibold">Operations Feed</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${theme.bg} ${theme.text} ring-1 ${theme.ring}`}>
            {theme.label}
          </span>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 10, filter: 'blur(3px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              className={`rounded-xl border px-3 py-3 ${severityClasses[alert.severity ?? 'info']}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {alert.severity === 'critical' && <span className="h-2 w-2 animate-pulse rounded-full bg-rose-400 shadow-neon" />}
                  {alert.severity === 'warning' && <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />}
                  {alert.severity === 'info' && <span className="h-2 w-2 rounded-full bg-sky-400/80" />}
                  <p className="font-semibold text-slate-100">{alert.title}</p>
                </div>
                <span className="font-mono text-[11px] text-slate-500">{alert.time}</span>
              </div>
              <p className="text-sm text-slate-300">{alert.detail}</p>
            </motion.div>
          ))}
        </div>
        <StructuralImpactReport />
        <TacticalImpactPanel />
        <LogisticsCommandPanel />
      </motion.section>

      {/* Separate Inundation Analysis window */}
      <motion.section
        layout
        initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ type: 'tween', duration: 0.45, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
      >
        <FloodImpactPanel />
      </motion.section>
      </div>

      {/* Center Panel - 3D Map + Hydrograph */}
      <motion.section
        layout
        initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ type: 'tween', duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
        className="col-span-12 md:col-span-6 flex flex-col gap-4"
      >
        <div className="glass-surface relative flex h-[520px] flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between pb-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Map Center</p>
              <p className="text-lg font-semibold">Godavari Surface Picture</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-neon" />
              Live Synchronization
            </div>
          </div>
          <div className="relative flex-1 min-h-0 overflow-hidden rounded-xl">
            <MapContainer />
          </div>
        </div>
        <PredictiveHydrograph />
      </motion.section>

      {/* Right Panel - AI Optimizer + Multi-dam */}
      <motion.section
        layout
        initial={{ opacity: 0, x: 20, filter: 'blur(4px)' }}
        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
        transition={{ type: 'tween', duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay: 0.15 }}
        className="col-span-12 md:col-span-3 flex flex-col gap-4"
      >
        <AiOptimizerPanel />
        <MultiDamStatusPanel />
      </motion.section>
      </div>
      <SimulationController />
    </>
  )
}


