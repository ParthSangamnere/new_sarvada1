import { motion } from 'framer-motion'
import { Activity, TrendingUp, Zap, Droplet, AlertTriangle, CheckCircle } from 'lucide-react'
import { useFloodRisk } from '../state/FloodRiskContext'

/**
 * Performance Analytics Dashboard - System health and metrics
 */
export default function PerformancePage() {
  const { waterSurfaceElevation, damCusecs, floodImpacts } = useFloodRisk()

  const systemMetrics = [
    {
      id: 'sensor-health',
      icon: Activity,
      label: 'Sensor Network',
      value: '98.5%',
      status: 'optimal',
      trend: '+2.1%',
      color: 'emerald',
    },
    {
      id: 'data-latency',
      icon: Zap,
      label: 'Data Latency',
      value: '1.2s',
      status: 'good',
      trend: '-0.3s',
      color: 'sky',
    },
    {
      id: 'prediction-accuracy',
      icon: TrendingUp,
      label: 'Prediction Accuracy',
      value: '94.7%',
      status: 'optimal',
      trend: '+1.8%',
      color: 'emerald',
    },
    {
      id: 'water-flow',
      icon: Droplet,
      label: 'Flow Rate',
      value: '1,380 m³/s',
      status: 'monitoring',
      trend: '+3.2%',
      color: 'amber',
    },
  ]

  const recentEvents = [
    { id: 1, type: 'success', message: 'All sensors synchronized successfully', time: '2 min ago' },
    { id: 2, type: 'warning', message: 'Water level increased by 0.5m in 15 minutes', time: '8 min ago' },
    { id: 3, type: 'info', message: 'Dam discharge adjusted to 35,000 cusecs', time: '15 min ago' },
    { id: 4, type: 'success', message: 'Predictive model updated with latest rainfall data', time: '22 min ago' },
    { id: 5, type: 'info', message: 'Evacuation route #7 marked as ready', time: '31 min ago' },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'optimal':
        return 'border-emerald-700/40 bg-emerald-900/20 text-emerald-300'
      case 'good':
        return 'border-sky-700/40 bg-sky-900/20 text-sky-300'
      case 'monitoring':
        return 'border-amber-700/40 bg-amber-900/20 text-amber-300'
      case 'warning':
        return 'border-orange-700/40 bg-orange-900/20 text-orange-300'
      default:
        return 'border-slate-700/40 bg-slate-900/20 text-slate-300'
    }
  }

  const getEventIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={16} className="text-emerald-400" />
      case 'warning':
        return <AlertTriangle size={16} className="text-amber-400" />
      default:
        return <Activity size={16} className="text-sky-400" />
    }
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-shrink-0"
      >
        <h2 className="text-2xl font-bold text-slate-100">Performance Analytics</h2>
        <p className="text-sm text-slate-400">System health, metrics, and operational status</p>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid flex-shrink-0 grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {systemMetrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className={`rounded-xl border p-4 ${getStatusColor(metric.status)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Icon size={20} />
                  <span className="text-xs uppercase tracking-wide opacity-80">{metric.label}</span>
                </div>
                <span className="text-xs font-semibold opacity-70">{metric.trend}</span>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold">{metric.value}</p>
                <p className="mt-1 text-xs capitalize opacity-70">{metric.status}</p>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Current System State */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid flex-shrink-0 grid-cols-1 gap-4 md:grid-cols-3"
      >
        <div className="rounded-xl border border-slate-800/70 bg-slate-900/60 p-4 backdrop-blur-md">
          <p className="text-xs uppercase tracking-wide text-slate-400">Water Surface Elevation</p>
          <p className="mt-2 font-mono text-3xl font-bold text-sky-300">{waterSurfaceElevation.toFixed(1)}m</p>
          <p className="mt-1 text-xs text-slate-500">MSL (Mean Sea Level)</p>
        </div>

        <div className="rounded-xl border border-slate-800/70 bg-slate-900/60 p-4 backdrop-blur-md">
          <p className="text-xs uppercase tracking-wide text-slate-400">Dam Discharge Rate</p>
          <p className="mt-2 font-mono text-3xl font-bold text-amber-300">{damCusecs.toLocaleString()}</p>
          <p className="mt-1 text-xs text-slate-500">cusecs (cubic feet per second)</p>
        </div>

        <div className="rounded-xl border border-slate-800/70 bg-slate-900/60 p-4 backdrop-blur-md">
          <p className="text-xs uppercase tracking-wide text-slate-400">Flooded Locations</p>
          <p className="mt-2 font-mono text-3xl font-bold text-rose-300">
            {floodImpacts.filter(i => i.isFlooded).length}/{floodImpacts.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">landmarks affected</p>
        </div>
      </motion.div>

      {/* Recent Activity Log */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-800/70 bg-slate-900/60 p-4 backdrop-blur-md"
      >
        <div className="flex-shrink-0 pb-3">
          <h3 className="text-lg font-semibold text-slate-100">Recent System Events</h3>
          <p className="text-xs text-slate-400">Live activity feed from all monitoring systems</p>
        </div>
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-2">
          {recentEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              className="flex items-start gap-3 rounded-lg border border-slate-800/50 bg-slate-950/40 p-3"
            >
              <div className="flex-shrink-0 pt-0.5">{getEventIcon(event.type)}</div>
              <div className="flex-1">
                <p className="text-sm text-slate-200">{event.message}</p>
                <p className="mt-1 text-xs text-slate-500">{event.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
