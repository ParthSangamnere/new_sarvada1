import { motion } from 'framer-motion'
import { ShieldAlert, Activity, Map } from 'lucide-react'
import CitizenSOSPanel from '../components/CitizenSOSPanel'
import MapContainer from '../components/MapContainer'
import { useFloodRisk } from '../state/FloodRiskContext'
import { MOCK_CITIZEN_REPORTS } from '../data/mockCitizenReports'

export default function CitizenSentinelPage() {
  const { waterSurfaceElevation } = useFloodRisk()

  const stats = MOCK_CITIZEN_REPORTS.reduce(
    (acc, report) => {
      const verified = waterSurfaceElevation > report.msl
      acc.total += 1
      acc.verified += verified ? 1 : 0
      acc.trapped += report.type === 'trapped' ? 1 : 0
      return acc
    },
    { total: 0, verified: 0, trapped: 0 },
  )

  return (
    <div className="grid h-full grid-cols-1 gap-4 xl:grid-cols-12">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        className="xl:col-span-4 flex flex-col gap-4"
      >
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 px-4 py-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert size={18} className="text-rose-300" />
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Citizen Sentinel</p>
                <p className="text-lg font-semibold text-slate-50">Verified SOS Feed</p>
              </div>
            </div>
            <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-100">
              {stats.total} Active
            </span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-xl border border-slate-700/60 bg-slate-800/50 px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">Verified</p>
              <p className="text-lg font-bold text-emerald-300">{stats.verified}</p>
            </div>
            <div className="rounded-xl border border-slate-700/60 bg-slate-800/50 px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">Trapped</p>
              <p className="text-lg font-bold text-rose-300">{stats.trapped}</p>
            </div>
            <div className="rounded-xl border border-slate-700/60 bg-slate-800/50 px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">WSE</p>
              <p className="text-lg font-bold text-sky-300">{waterSurfaceElevation.toFixed(2)} m</p>
            </div>
          </div>
        </div>
        <CitizenSOSPanel />
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22, delay: 0.05 }}
        className="xl:col-span-8 flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md"
      >
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2 text-sm text-slate-200">
            <Activity size={18} className="text-sky-300" />
            <span className="font-semibold">Map View</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-800/50 px-3 py-2 text-xs text-slate-300">
            <Map size={16} className="text-sky-300" />
            <span>Pulsing SOS markers update with WSE</span>
          </div>
        </div>
        <div className="flex flex-1 overflow-hidden rounded-xl">
          <MapContainer enableControls />
        </div>
      </motion.section>
    </div>
  )
}
