import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Activity, Ambulance, Check } from 'lucide-react'
import { useFloodRisk } from '../state/FloodRiskContext'
import { useAuditLog } from '../hooks/useAuditLog'

export default function CitizenSOSPanel() {
  const { waterSurfaceElevation, citizenReports, setCitizenReports } = useFloodRisk()
  const { addLog } = useAuditLog()

  const reports = useMemo(() => {
    const prioritized = [...(citizenReports ?? [])].map((report) => {
      const verified = waterSurfaceElevation > report.groundMsl
      return { ...report, verified }
    })

    const priorityScore = (r) => {
      if (r.type === 'trapped') return 0
      if (r.type === 'medical') return 1
      return 2
    }

    return prioritized
      .sort((a, b) => priorityScore(a) - priorityScore(b))
      .sort((a, b) => (a.status === 'resolved') - (b.status === 'resolved'))
  }, [citizenReports, waterSurfaceElevation])

  const activeCount = reports.filter((r) => r.status !== 'resolved').length

  const updateStatus = (id, next) => {
    setCitizenReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: next } : r)))
    if (next === 'enroute') {
      addLog({ action: 'SOS Dispatch', value: `Dispatched to ${id}`, user: 'ADMIN-01' })
    }
  }

  const triggerFlyTo = (report) => {
    const detail = { lng: report.lng, lat: report.lat, zoom: 16.5, pitch: 68, bearing: -15 }
    window.dispatchEvent(new CustomEvent('sos-flyto', { detail }))
  }

  const badgeForType = (type) => {
    if (type === 'trapped') return 'border-rose-500/60 bg-rose-500/15 text-rose-100'
    if (type === 'medical') return 'border-amber-500/60 bg-amber-500/15 text-amber-100'
    return 'border-sky-500/60 bg-sky-500/15 text-sky-100'
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
          <Activity size={18} className="text-sky-300" />
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Citizen Sentinel</p>
            <p className="text-sm font-semibold text-slate-100">Verified SOS Feed</p>
          </div>
        </div>
        <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-100">
          Active: {activeCount}
        </span>
      </div>

      <div className="mt-3 space-y-2 max-h-80 overflow-y-auto pr-1">
        {reports.map((report) => {
          const verifiedBadge = report.verified ? 'MODEL VERIFIED' : 'UNVERIFIED'
          const verifiedClass = report.verified
            ? 'border-blue-500/70 bg-blue-500/15 text-sky-100'
            : 'border-slate-700/60 bg-slate-900/50 text-slate-300'
          const dispatchColor =
            report.status === 'enroute'
              ? 'border-sky-500/70 bg-sky-500/10 text-sky-100'
              : report.status === 'resolved'
                ? 'border-emerald-600/60 bg-emerald-600/10 text-emerald-100'
                : 'border-rose-600/50 bg-rose-600/10 text-rose-100'
          return (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border-l-4 px-3 py-3 ${report.verified ? 'border-blue-500/70 bg-slate-900/60' : 'border-slate-700/80 bg-slate-950/60'} `}
              onClick={() => triggerFlyTo(report)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${report.type === 'trapped' ? 'bg-rose-400 animate-pulse' : report.type === 'medical' ? 'bg-amber-300 animate-pulse' : 'bg-sky-300'}`} />
                  <p className="font-semibold text-slate-100">{report.name}</p>
                </div>
                <span className={`rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${badgeForType(report.type)}`}>
                  {report.type}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-200">{report.message}</p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>MSL {report.groundMsl.toFixed(2)}m</span>
                <span className="font-mono">{new Date(report.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className={`rounded-md border px-2 py-1 ${verifiedClass}`}>{verifiedBadge}</span>
                <div className="flex items-center gap-2">
                  <span className={`hidden rounded-md border px-2 py-1 text-[11px] font-semibold uppercase tracking-wide md:inline-flex ${dispatchColor}`}>
                    {report.status}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      updateStatus(report.id, 'enroute')
                    }}
                    className={`flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${report.status === 'enroute' ? 'border-sky-500/70 bg-sky-500/10 text-sky-100' : 'border-slate-700/60 bg-slate-800/50 text-slate-200'}`}
                  >
                    <Ambulance size={12} /> Dispatch
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      updateStatus(report.id, 'resolved')
                    }}
                    className={`flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${report.status === 'resolved' ? 'border-emerald-500/80 bg-emerald-900/40 text-emerald-100' : 'border-slate-700/60 bg-slate-800/50 text-slate-200'}`}
                  >
                    <Check size={12} /> Resolved
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
