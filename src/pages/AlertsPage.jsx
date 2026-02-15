import { motion } from 'framer-motion'
import { Bell, AlertTriangle, AlertCircle, Info, CheckCircle, Clock } from 'lucide-react'
import { useState } from 'react'
import { useFloodRisk } from '../state/FloodRiskContext'

/**
 * Alerts & Notifications Page - Critical warnings and system notifications
 */
export default function AlertsPage() {
  const { floodImpacts, waterSurfaceElevation, theme } = useFloodRisk()
  const [filter, setFilter] = useState('all') // all, critical, warning, info

  const alerts = [
    {
      id: 'alert-001',
      type: 'critical',
      title: 'Spillway Gate #2 Malfunction',
      message: 'Telemetry shows rising inflow beyond expected parameters. Immediate inspection required.',
      location: 'Gangapur Dam - Gate #2',
      time: '09:12:04',
      timestamp: new Date(Date.now() - 3 * 60000),
      status: 'active',
    },
    {
      id: 'alert-002',
      type: 'warning',
      title: 'Downstream Sensor Network Disruption',
      message: 'Two nodes offline in Panchvati area. Rerouting data through backup channels.',
      location: 'Panchvati Monitoring Station',
      time: '09:11:28',
      timestamp: new Date(Date.now() - 5 * 60000),
      status: 'active',
    },
    {
      id: 'alert-003',
      type: 'warning',
      title: 'Heavy Rainfall Detected (NW Sector)',
      message: 'Projected 38mm rainfall in 50 minutes. Upstream catchment area may experience increased inflow.',
      location: 'Trimbakeshwar Region',
      time: '09:10:55',
      timestamp: new Date(Date.now() - 7 * 60000),
      status: 'active',
    },
    {
      id: 'alert-004',
      type: 'info',
      title: 'Water Level Threshold Exceeded',
      message: `Current WSE: ${waterSurfaceElevation.toFixed(1)}m MSL. Monitoring enhanced for critical landmarks.`,
      location: 'Ram Kund, Panchvati',
      time: '09:08:15',
      timestamp: new Date(Date.now() - 10 * 60000),
      status: 'monitoring',
    },
    {
      id: 'alert-005',
      type: 'critical',
      title: 'Evacuation Advisory - Ram Kund Area',
      message: 'Water approaching critical threshold. Recommend evacuation of low-lying areas within 30 minutes.',
      location: 'Ram Kund Ghat',
      time: '09:05:00',
      timestamp: new Date(Date.now() - 13 * 60000),
      status: 'active',
    },
    {
      id: 'alert-006',
      type: 'success',
      title: 'Sensor Calibration Complete',
      message: 'All upstream sensors have been successfully recalibrated. Data accuracy improved.',
      location: 'Gangapur Dam',
      time: '08:55:30',
      timestamp: new Date(Date.now() - 23 * 60000),
      status: 'resolved',
    },
    {
      id: 'alert-007',
      type: 'info',
      title: 'Dam Discharge Adjustment',
      message: 'Discharge rate increased to 35,000 cusecs to maintain optimal reservoir levels.',
      location: 'Gangapur Dam Control',
      time: '08:50:12',
      timestamp: new Date(Date.now() - 28 * 60000),
      status: 'monitoring',
    },
  ]

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="text-rose-400" size={20} />
      case 'warning':
        return <AlertCircle className="text-amber-400" size={20} />
      case 'success':
        return <CheckCircle className="text-emerald-400" size={20} />
      default:
        return <Info className="text-sky-400" size={20} />
    }
  }

  const getAlertStyle = (type) => {
    switch (type) {
      case 'critical':
        return 'border-rose-700/50 bg-rose-900/20 hover:bg-rose-900/30'
      case 'warning':
        return 'border-amber-700/50 bg-amber-900/20 hover:bg-amber-900/30'
      case 'success':
        return 'border-emerald-700/50 bg-emerald-900/20 hover:bg-emerald-900/30'
      default:
        return 'border-sky-700/50 bg-sky-900/20 hover:bg-sky-900/30'
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">Active</span>
      case 'monitoring':
        return <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">Monitoring</span>
      case 'resolved':
        return <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">Resolved</span>
      default:
        return null
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true
    return alert.type === filter
  })

  const criticalCount = alerts.filter(a => a.type === 'critical' && a.status === 'active').length
  const warningCount = alerts.filter(a => a.type === 'warning' && a.status === 'active').length

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-shrink-0 items-start justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Alerts & Notifications</h2>
          <p className="text-sm text-slate-400">Real-time system warnings and operational updates</p>
        </div>
        <div className={`flex items-center gap-2 rounded-lg px-4 py-3 ${theme.bg} ${theme.text} ring-1 ${theme.ring}`}>
          <Bell size={18} />
          <span className="font-semibold">{criticalCount + warningCount} Active</span>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-shrink-0 gap-2"
      >
        {['all', 'critical', 'warning', 'info'].map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition-all ${
              filter === filterType
                ? 'bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/50'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800/70'
            }`}
          >
            {filterType}
            {filterType !== 'all' && (
              <span className="ml-2 text-xs opacity-70">
                ({alerts.filter(a => a.type === filterType).length})
              </span>
            )}
          </button>
        ))}
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid flex-shrink-0 grid-cols-1 gap-3 md:grid-cols-3"
      >
        <div className="rounded-xl border border-rose-700/40 bg-rose-900/20 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-rose-300">Critical Alerts</span>
            <AlertTriangle size={16} className="text-rose-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-rose-200">{criticalCount}</p>
        </div>

        <div className="rounded-xl border border-amber-700/40 bg-amber-900/20 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-amber-300">Warnings</span>
            <AlertCircle size={16} className="text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-200">{warningCount}</p>
        </div>

        <div className="rounded-xl border border-sky-700/40 bg-sky-900/20 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-sky-300">Total Alerts</span>
            <Bell size={16} className="text-sky-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-sky-200">{alerts.length}</p>
        </div>
      </motion.div>

      {/* Alerts List */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-800/70 bg-slate-900/60 p-4 backdrop-blur-md"
      >
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-2">
          {filteredAlerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + index * 0.03 }}
              className={`rounded-lg border p-4 transition-all ${getAlertStyle(alert.type)}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 pt-1">{getAlertIcon(alert.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-100">{alert.title}</h4>
                      {getStatusBadge(alert.status)}
                    </div>
                    <p className="mt-1 text-sm text-slate-300">{alert.message}</p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {alert.time}
                      </span>
                      <span>📍 {alert.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
