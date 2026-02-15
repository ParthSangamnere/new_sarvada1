import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronUp, Pause, Play, RotateCcw, Zap } from 'lucide-react'
import { useFloodRisk } from '../state/FloodRiskContext'
import { useAuditLog } from '../hooks/useAuditLog'

const TARGET_CUSECS = 85000
const TARGET_RAIN = 45
const BASE_INTERVAL_MS = 400
const STEP_CUSECS = 1500
const STEP_RAIN = 1
const SPEEDS = [1, 2, 5]

const BRIDGE_ALERT = {
  id: 'SIM-BRIDGE',
  name: 'Victoria Bridge',
  type: 'infrastructure',
  message: 'Bridge submerged • Traffic closed • Redirecting evac routes',
  lat: 19.9932,
  lng: 73.7921,
  groundMsl: 593.1,
  timestamp: new Date().toISOString(),
  status: 'critical',
}

const SOS_INJECTIONS = [
  {
    id: 'SIM-SOS-1',
    name: 'Ram Kund Ghat',
    type: 'trapped',
    message: 'Pilgrims stranded on upper steps, water rising rapidly.',
    lat: 19.9938,
    lng: 73.7915,
    groundMsl: 592.5,
    timestamp: new Date().toISOString(),
    status: 'pending',
  },
  {
    id: 'SIM-SOS-2',
    name: 'Holkar Bridge Market',
    type: 'medical',
    message: 'Multiple injuries reported as vehicles stall in surge.',
    lat: 19.9965,
    lng: 73.805,
    groundMsl: 594.5,
    timestamp: new Date().toISOString(),
    status: 'pending',
  },
  {
    id: 'SIM-SOS-3',
    name: 'Tapovan Riverside',
    type: 'trapped',
    message: 'Families signaling from rooftop; current too strong for boats.',
    lat: 19.995,
    lng: 73.782,
    groundMsl: 590.1,
    timestamp: new Date().toISOString(),
    status: 'pending',
  },
]

export default function SimulationController() {
  const {
    damCusecs,
    setDamCusecs,
    setRiskLevel,
    setCitizenReports,
    setSimulatedRainfall,
    isSimulating,
    setIsSimulating,
    systemStatus,
    setSystemStatus,
    resetSimulation,
    citizenReports,
  } = useFloodRisk()
  const { addLog } = useAuditLog()

  const [speed, setSpeed] = useState(1)
  const [simRain, setSimRain] = useState(0)
  const [collapsed, setCollapsed] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef(null)
  const triggersRef = useRef({ alert: false, bridge: false, sos: false })
  const initialReportsRef = useRef(citizenReports)

  const progressPct = useMemo(() => Math.min(100, (damCusecs / TARGET_CUSECS) * 100), [damCusecs])

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  useEffect(() => clearTimer, [])

  const handleTriggers = (nextCusecs) => {
    if (!triggersRef.current.alert && nextCusecs > 30000) {
      triggersRef.current.alert = true
      setRiskLevel('alert')
      setSystemStatus('ALERT')
      addLog({ action: 'Simulation Threshold', value: 'Cusecs > 30,000 (Alert)', user: 'SIM-ENGINE' })
    }
    if (!triggersRef.current.bridge && nextCusecs > 60000) {
      triggersRef.current.bridge = true
      setRiskLevel('critical')
      setSystemStatus('CRITICAL')
      setCitizenReports((prev) => [BRIDGE_ALERT, ...prev])
      addLog({ action: 'Bridge Closure', value: 'Victoria Bridge submerged', user: 'SIM-ENGINE' })
    }
    if (!triggersRef.current.sos && nextCusecs > 75000) {
      triggersRef.current.sos = true
      setCitizenReports((prev) => [...SOS_INJECTIONS, ...prev])
      addLog({ action: 'Critical SOS Injection', value: '3 high-priority SOS triggered', user: 'SIM-ENGINE' })
    }
  }

  const tick = () => {
    setDamCusecs((current) => {
      const next = Math.min(current + STEP_CUSECS * speed, TARGET_CUSECS)
      handleTriggers(next)
      if (next >= TARGET_CUSECS) {
        clearTimer()
        setIsPaused(true)
        setSystemStatus('CRITICAL')
      }
      return next
    })

    setSimRain((prev) => {
      const next = Math.min(prev + STEP_RAIN * speed, TARGET_RAIN)
      setSimulatedRainfall(next)
      return next
    })
  }

  const startSimulation = () => {
    clearTimer()
    if (!isSimulating) {
      // Fresh start
      triggersRef.current = { alert: false, bridge: false, sos: false }
      setSystemStatus('SIMULATION')
      addLog({ action: 'Simulation Started', value: `Speed ${speed}x`, user: 'ADMIN-01' })
    } else {
      // Resume from pause
      addLog({ action: 'Simulation Resumed', value: `Resumed at ${Math.round(damCusecs).toLocaleString()} cusecs`, user: 'ADMIN-01' })
    }
    setIsSimulating(true)
    setIsPaused(false)
    setSimulatedRainfall(simRain)
    intervalRef.current = setInterval(tick, BASE_INTERVAL_MS)
  }

  const stopSimulation = () => {
    clearTimer()
    // Keep isSimulating=true so catchment data (and AI Optimizer) stays frozen
    setIsPaused(true)
    addLog({ action: 'Simulation Paused', value: `Paused at ${Math.round(damCusecs).toLocaleString()} cusecs`, user: 'ADMIN-01' })
  }

  const handleReset = () => {
    clearTimer()
    resetSimulation()
    setRiskLevel('alert')
    setSimRain(0)
    setIsPaused(false)
    triggersRef.current = { alert: false, bridge: false, sos: false }
    setCitizenReports(initialReportsRef.current)
    addLog({ action: 'Simulation Reset', value: 'Restored to Feb 2026 baseline', user: 'ADMIN-01' })
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={collapsed ? 'collapsed' : 'expanded'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
          className="pointer-events-auto flex w-full max-w-5xl flex-col rounded-2xl border border-cyan-500/40 bg-slate-900/80 text-sm text-slate-100 shadow-[0_10px_60px_rgba(14,165,233,0.25)] backdrop-blur-md"
        >
          {/* Collapsed header bar — always visible */}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 transition hover:bg-cyan-500/5 rounded-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/90 to-sky-400/80 text-slate-950 shadow-neon">
                <Zap size={16} />
              </div>
              <div className="text-left">
                <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-200">Simulation Mode</p>
                <p className="text-sm font-semibold text-slate-100">Monsoon Fast-Forward · 6-hour cinematic run</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {collapsed && (
                <span className="font-mono text-xs text-cyan-300">{Math.round(damCusecs).toLocaleString()} cusecs · {progressPct.toFixed(0)}%</span>
              )}
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-500/40 bg-cyan-500/10 text-cyan-200 transition hover:bg-cyan-500/20">
                {collapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>
          </button>

          {/* Expandable body */}
          {!collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="flex flex-col gap-3 px-4 pb-4"
            >
              <div className="flex flex-wrap items-center justify-end gap-2">
                <div className="flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100">
                  Target: 85,000 cusecs · 45mm/hr
                </div>
                <div className="flex items-center gap-1 rounded-xl border border-slate-700/60 bg-slate-900/70 px-2 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" /> Smooth step 400ms
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/70 px-3 py-2">
                  <span className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Dam Discharge</span>
                  <span className="font-mono text-lg font-semibold text-cyan-200">{Math.round(damCusecs).toLocaleString()} cusecs</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/70 px-3 py-2">
                  <span className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Simulated Rainfall</span>
                  <span className="font-mono text-lg font-semibold text-sky-200">{simRain.toFixed(1)} mm/hr</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/70 px-3 py-2">
                  <span className="text-[11px] uppercase tracking-[0.16em] text-slate-400">System Status</span>
                  <span className="font-mono text-sm font-semibold text-emerald-200">{systemStatus}</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/70 px-3 py-2">
                  <span className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Speed</span>
                  <div className="flex items-center gap-1">
                    {SPEEDS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSpeed(s)}
                        className={`rounded-lg px-2 py-1 text-xs font-semibold transition ${s === speed ? 'bg-cyan-500/20 text-cyan-100 border border-cyan-400/60' : 'bg-slate-800/80 text-slate-300 border border-slate-700/60 hover:border-cyan-400/50'}`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative h-3 flex-1 rounded-full bg-slate-800/80">
                  <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-400 to-rose-400" style={{ width: `${progressPct}%` }} />
                </div>
                <span className="text-xs font-mono text-slate-300">{progressPct.toFixed(0)}%</span>
              </div>

              <div className="flex items-center gap-2">
                {(!isSimulating || isPaused) ? (
                  <button
                    type="button"
                    onClick={startSimulation}
                    className="flex items-center gap-2 rounded-xl bg-cyan-500/20 px-4 py-2 text-sm font-semibold text-cyan-50 ring-1 ring-cyan-400/60 transition hover:bg-cyan-500/30"
                  >
                    <Play size={16} /> {isPaused ? 'Resume' : 'Start Simulation'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopSimulation}
                    className="flex items-center gap-2 rounded-xl bg-amber-500/20 px-4 py-2 text-sm font-semibold text-amber-50 ring-1 ring-amber-400/60 transition hover:bg-amber-500/30"
                  >
                    <Pause size={16} /> Pause
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-2 rounded-xl bg-slate-800/70 px-4 py-2 text-sm font-semibold text-slate-200 ring-1 ring-slate-700/60 transition hover:bg-slate-800"
                >
                  <RotateCcw size={16} /> Reset to Live Data
                </button>
                <div className="ml-auto text-[11px] uppercase tracking-[0.16em] text-slate-400">Smooth 400ms steps · Past solid / future dashed visuals stay intact</div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
