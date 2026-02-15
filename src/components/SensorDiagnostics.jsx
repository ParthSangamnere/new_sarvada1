import { Signal, Battery, Radio } from 'lucide-react'
import { SENSOR_NETWORK } from '../data/sensorNetwork'

const statusColor = (status) => {
  if (status === 'online') return 'border-emerald-500/50 bg-emerald-500/10 text-emerald-100'
  if (status === 'degraded') return 'border-amber-500/60 bg-amber-500/10 text-amber-100'
  return 'border-rose-500/60 bg-rose-500/10 text-rose-100'
}

const barWidth = (value) => `${Math.round(Math.min(Math.max(value, 0), 1) * 100)}%`

export default function SensorDiagnostics() {
  const anyUncertain = SENSOR_NETWORK.some((s) => s.status !== 'online')

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-4 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Telemetry</p>
          <p className="text-lg font-semibold text-slate-100">Sensor Health Grid</p>
        </div>
        {anyUncertain && (
          <span className="rounded-full border border-amber-500/50 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-100">
            Uncertain Data
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {SENSOR_NETWORK.map((sensor) => (
          <div key={sensor.id} className="rounded-xl border border-slate-800/70 bg-slate-950/50 p-3 shadow-[0_0_15px_rgba(15,23,42,0.5)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-100">{sensor.name}</p>
                <p className="text-[11px] text-slate-500">{sensor.location}</p>
              </div>
              <span className={`rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${statusColor(sensor.status)}`}>
                {sensor.status}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs text-slate-300">
              <span className="flex items-center gap-1"><Battery size={12} className="text-emerald-300" /> {Math.round(sensor.battery * 100)}%</span>
              <span className="flex items-center gap-1"><Signal size={12} className="text-sky-300" /> {Math.round(sensor.signal * 100)}%</span>
              <span className="flex items-center gap-1"><Radio size={12} className="text-slate-300" /> {sensor.lastSeen}</span>
            </div>
            <div className="mt-2 space-y-2">
              <div className="h-1.5 rounded-full bg-slate-800">
                <div className="h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-300" style={{ width: barWidth(sensor.battery) }} />
              </div>
              <div className="h-1.5 rounded-full bg-slate-800">
                <div className="h-1.5 rounded-full bg-gradient-to-r from-sky-400 to-cyan-300" style={{ width: barWidth(sensor.signal) }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
