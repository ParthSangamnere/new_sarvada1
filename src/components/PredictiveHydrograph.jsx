import { useMemo } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import PropTypes from 'prop-types'
import { useFloodRisk } from '../state/FloodRiskContext'

const HOURS_BACK = 6
const TOTAL_POINTS = 24
const INFLOW_FACTOR = 1500 // cusecs per mm/hr
const RIVER_CAPACITY = 18000 // cusecs threshold for caution coloring

const formatOffsetLabel = (offset) => {
  if (offset === 0) return 'now'
  const hours = Math.abs(offset)
  const unit = hours === 1 ? 'hr' : 'hrs'
  return offset > 0 ? `in ${hours} ${unit}` : `${hours} ${unit} ago`
}

const buildSeries = ({ forecast, currentRainfall, damCusecs }) => {
  const tail = forecast[forecast.length - 1]?.rainMmHr ?? Math.max(currentRainfall * 0.7, 0)

  return Array.from({ length: TOTAL_POINTS }, (_, idx) => {
    const offset = idx - HOURS_BACK // -6 to +17
    const isFuture = offset > 0

    let rainMmHr
    if (offset < 0) {
      const decay = Math.pow(0.82, Math.abs(offset))
      rainMmHr = Math.max(currentRainfall * decay, 0)
    } else if (offset < forecast.length) {
      rainMmHr = Math.max(forecast[offset]?.rainMmHr ?? 0, 0)
    } else {
      const tailDecay = Math.pow(0.85, offset - forecast.length + 1)
      rainMmHr = Math.max(tail * tailDecay, 0)
    }

    const inflow = Math.round(rainMmHr * INFLOW_FACTOR)
    const outflow = Math.max(0, Math.round(damCusecs))

    return {
      time: offset === 0 ? 'NOW' : offset < 0 ? `T${offset}` : `T+${offset}`,
      offset,
      rainMmHr,
      inflow,
      outflow,
      inflowPast: isFuture ? null : inflow,
      inflowFuture: isFuture ? inflow : null,
      outflowPast: isFuture ? null : outflow,
      outflowFuture: isFuture ? outflow : null,
      danger: inflow > outflow,
    }
  })
}

const findPeak = (series) => series.reduce((peak, point) => (point.inflow > (peak?.inflow ?? -Infinity) ? point : peak), null)

const findRecession = (series, peakOffset) => {
  const afterPeak = series.filter((p) => p.offset > peakOffset)
  return afterPeak.find((p) => p.inflow <= p.outflow) ?? null
}

const findIntersection = (series) => {
  const idx = series.findIndex((p) => p.inflow > p.outflow)
  return idx === -1 ? null : series[idx]
}

const formatCountdown = (point) => {
  if (!point) return '—'
  if (point.offset === 0) return 'now'
  const hours = Math.abs(point.offset)
  const label = hours >= 24 ? `${(hours / 24).toFixed(1)} days` : `${hours}h`
  return point.offset > 0 ? label : `${label} ago`
}

const tooltipFormatter = (value, name) => {
  if (name === 'Inflow') return [`${value.toLocaleString()} cusecs`, 'Inflow']
  if (name === 'Outflow') return [`${value.toLocaleString()} cusecs`, 'Outflow']
  return value
}

export default function PredictiveHydrograph({ className = '' }) {
  const { catchmentData, damCusecs, isCatchmentLoading } = useFloodRisk()

  const rainfallForecast = catchmentData?.hourlyForecast ?? []
  const currentRainfall = catchmentData?.currentRainfall ?? 0

  const series = useMemo(
    () => buildSeries({ forecast: rainfallForecast, currentRainfall, damCusecs }),
    [rainfallForecast, currentRainfall, damCusecs],
  )

  const peakPoint = useMemo(() => findPeak(series), [series])
  const recessionPoint = useMemo(() => (peakPoint ? findRecession(series, peakPoint.offset) : null), [series, peakPoint])
  const intersectionPoint = useMemo(() => findIntersection(series), [series])

  return (
    <div className={`rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Temporal Flow Analytics</p>
          <p className="text-lg font-semibold text-slate-100">Predictive Hydrograph</p>
          <p className="text-xs text-slate-400">24h window: past 6h, now, next 17h</p>
        </div>
        <span className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-cyan-100">
          {isCatchmentLoading ? 'Syncing…' : 'Updated'}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-200 md:grid-cols-4">
        <div className="rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Time to peak</p>
          <p className="font-mono text-lg text-cyan-200">{formatCountdown(peakPoint)}</p>
          <p className="text-xs text-slate-500">Peak inflow {peakPoint ? peakPoint.inflow.toLocaleString() : '—'} cusecs</p>
        </div>
        <div className="rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Recession</p>
          <p className="font-mono text-lg text-emerald-200">{formatCountdown(recessionPoint)}</p>
          <p className="text-xs text-slate-500">Inflow falls below outflow</p>
        </div>
        <div className="rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Intersection</p>
          <p className="font-mono text-lg text-rose-200">{formatCountdown(intersectionPoint)}</p>
          <p className="text-xs text-slate-500">First hour inflow exceeds outflow</p>
        </div>
        <div className="rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Current discharge</p>
          <p className="font-mono text-lg text-rose-200">{Math.round(damCusecs).toLocaleString()} cusecs</p>
          <p className="text-xs text-slate-500">Manual gate setting</p>
        </div>
      </div>

      <div className="mt-4 h-72 w-full rounded-xl border border-slate-800/70 bg-slate-950/40 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={series} margin={{ top: 10, right: 16, left: 0, bottom: 10 }}>
            <defs>
              <linearGradient id="inflowFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#1e293b' }} />
            <YAxis
              yAxisId="left"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(v) => `${Math.round(v / 1000)}k`}
              axisLine={{ stroke: '#1e293b' }}
              tickLine={false}
              label={{ value: 'Inflow (cusecs)', angle: -90, position: 'insideLeft', fill: '#cbd5e1', fontSize: 11 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(v) => `${Math.round(v / 1000)}k`}
              axisLine={{ stroke: '#1e293b' }}
              tickLine={false}
              label={{ value: 'Outflow (cusecs)', angle: 90, position: 'insideRight', fill: '#cbd5e1', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12 }}
              labelStyle={{ color: '#e2e8f0', fontWeight: 600 }}
              formatter={tooltipFormatter}
            />
            <ReferenceLine x="NOW" stroke="#e2e8f0" strokeDasharray="4 4" label={{ value: 'NOW', fill: '#e2e8f0', fontSize: 11 }} />
            <ReferenceLine y={RIVER_CAPACITY} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: 'River capacity', fill: '#94a3b8', fontSize: 11 }} />

            <Area
              yAxisId="left"
              dataKey="inflowPast"
              type="monotone"
              stroke="#22d3ee"
              fill="url(#inflowFill)"
              strokeWidth={2.4}
              connectNulls
            />
            <Area
              yAxisId="left"
              dataKey="inflowFuture"
              type="monotone"
              stroke="#22d3ee"
              fill="url(#inflowFill)"
              strokeDasharray="6 4"
              strokeWidth={2.4}
              connectNulls
            />

            <Line yAxisId="right" type="monotone" dataKey="outflowPast" stroke="#f43f5e" strokeWidth={2.2} dot={false} connectNulls />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="outflowFuture"
              stroke="#f43f5e"
              strokeWidth={2.2}
              strokeDasharray="6 4"
              dot={false}
              connectNulls
            />

            {intersectionPoint && <ReferenceLine x={intersectionPoint.time} stroke="#f43f5e" strokeDasharray="2 6" />}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
        <span className="flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1">
          <span className="h-2 w-2 rounded-full bg-cyan-300" /> Inflow (predictive)
        </span>
        <span className="flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1">
          <span className="h-2 w-2 rounded-full bg-rose-300" /> Outflow (manual gates)
        </span>
        <span className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1">
          <span className="h-2 w-2 rounded-full bg-emerald-400" /> Past = solid · Future = dashed
        </span>
      </div>
    </div>
  )
}

PredictiveHydrograph.propTypes = {
  className: PropTypes.string,
}
