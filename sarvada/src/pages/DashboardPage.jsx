import { motion } from 'framer-motion'
import MapContainer from '../components/MapContainer'
import FloodImpactPanel from '../components/FloodImpactPanel'
import { useFloodRisk } from '../state/FloodRiskContext'
import { useMemo } from 'react'

/**
 * Main Dashboard - The command center overview with map and real-time data
 */
export default function DashboardPage() {
  const { theme } = useFloodRisk()

  const alerts = useMemo(
    () => [
      { id: 'a1', title: 'Spillway Gate #2', detail: 'Telemetry shows rising inflow.', time: '09:12:04' },
      { id: 'a2', title: 'Downstream Sensors', detail: 'Two nodes offline; rerouting data.', time: '09:11:28' },
      { id: 'a3', title: 'Rain Cell (NW)', detail: 'Projected 38mm in 50 min.', time: '09:10:55' },
    ],
    [],
  )

  return (
    <div className="grid h-full grid-cols-1 gap-4 md:grid-cols-12">
      {/* Left Panel - Alerts Feed */}
      <motion.section
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24 }}
        className="glass-surface col-span-12 md:col-span-3 flex flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md"
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
        <div className="flex flex-col gap-3 overflow-y-auto pr-1">
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-slate-800/70 bg-slate-900/60 px-3 py-3"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-100">{alert.title}</p>
                <span className="font-mono text-[11px] text-slate-500">{alert.time}</span>
              </div>
              <p className="text-sm text-slate-400">{alert.detail}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Center Panel - 3D Map */}
      <motion.section
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24, delay: 0.1 }}
        className="glass-surface col-span-12 md:col-span-6 relative flex min-h-[320px] flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md"
      >
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
        <div className="flex flex-1 overflow-hidden rounded-xl">
          <MapContainer />
        </div>
      </motion.section>

      {/* Right Panel - Flood Impact */}
      <motion.section
        layout
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24, delay: 0.15 }}
        className="col-span-12 md:col-span-3"
      >
        <FloodImpactPanel />
      </motion.section>
    </div>
  )
}
