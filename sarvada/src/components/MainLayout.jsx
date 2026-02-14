import { AnimatePresence, motion } from 'framer-motion'
import PropTypes from 'prop-types'
import { useMemo, useState } from 'react'
import Sidebar from './Sidebar'
import TopHeader from './TopHeader'
import MapContainer from './MapContainer'
import FloodImpactPanel from './FloodImpactPanel'
import { useFloodRisk } from '../state/FloodRiskContext'

/**
 * War-room dashboard shell orchestrating the sidebar, header, and core panels.
 * @param {object} props
 * @param {Array<{ id: string; label: string; icon: 'shield' | 'map' | 'activity' | 'bell' | 'settings' }>} props.navItems
 * @param {string} props.systemStatus
 * @param {number} props.damLevel
 */
export default function MainLayout({ navItems, systemStatus, damLevel }) {
  const [activeNav, setActiveNav] = useState(navItems?.[0])
  const { theme } = useFloodRisk()

  const alerts = useMemo(
    () => [
      { id: 'a1', title: 'Spillway Gate #2', detail: 'Telemetry shows rising inflow.', time: '09:12:04' },
      { id: 'a2', title: 'Downstream Sensors', detail: 'Two nodes offline; rerouting data.', time: '09:11:28' },
      { id: 'a3', title: 'Rain Cell (NW)', detail: 'Projected 38mm in 50 min.', time: '09:10:55' },
    ],
    [],
  )

  const analytics = useMemo(
    () => [
      { label: 'Flow Rate', value: '1.38 m^3/s', delta: '+3.2%' },
      { label: 'Evac Routes', value: '12/14 Ready', delta: '+2' },
      { label: 'Sensors Live', value: '128', delta: '+4' },
    ],
    [],
  )

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-transparent text-slate-100">
      <Sidebar activeItem={activeNav} items={navItems} onSelect={setActiveNav} />
      <div className="relative flex-1 overflow-hidden px-5 py-4">
        <TopHeader systemStatus={systemStatus} damLevel={damLevel} />

        <AnimatePresence mode="wait">
          <motion.main
            key={activeNav?.id}
            className="mt-4 grid h-[calc(100vh-6.5rem)] grid-cols-1 gap-4 md:grid-cols-12"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 200, damping: 24 }}
          >
            <motion.section
              layout
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
                  <div key={alert.id} className="rounded-xl border border-slate-800/70 bg-slate-900/60 px-3 py-3">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-100">{alert.title}</p>
                      <span className="font-mono text-[11px] text-slate-500">{alert.time}</span>
                    </div>
                    <p className="text-sm text-slate-400">{alert.detail}</p>
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.section
              layout
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

            <motion.section layout className="col-span-12 md:col-span-3">
              <FloodImpactPanel />
            </motion.section>
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  )
}

MainLayout.propTypes = {
  navItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.oneOf(['shield', 'map', 'activity', 'bell', 'settings']).isRequired,
    }),
  ).isRequired,
  systemStatus: PropTypes.string.isRequired,
  damLevel: PropTypes.number.isRequired,
}
