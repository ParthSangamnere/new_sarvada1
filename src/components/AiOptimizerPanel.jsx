import { motion } from 'framer-motion'
import { Brain, Shield, AlertTriangle } from 'lucide-react'
import PropTypes from 'prop-types'
import { useMemo } from 'react'
import { useFloodRisk } from '../state/FloodRiskContext'
import { calculateWSE, assessFloodImpact, NASHIK_TOPOGRAPHY } from '../data/nashikTopography'
import { INFRASTRUCTURE_REGISTRY } from '../data/infrastructureRegistry'

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const LOSS_WEIGHTS = {
  commercial: 550_000,
  residential: 220_000,
  infrastructure: 800_000,
  'sacred-site': 350_000,
  cultural: 300_000,
  default: 250_000,
}

function estimateLossAtWSE(wse) {
  return NASHIK_TOPOGRAPHY
    .filter((l) => wse > l.msl)
    .reduce((total, l) => {
      const depth = wse - l.msl
      const base = LOSS_WEIGHTS[l.category] ?? LOSS_WEIGHTS.default
      return total + base * depth * (l.risk_factor ?? 1)
    }, 0)
}

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)

export default function AiOptimizerPanel({ criticalThreshold = 594 }) {
  const { catchmentData, isCatchmentLoading, damCusecs, setDamCusecs, primaryDam } = useFloodRisk()

  const rainfall = catchmentData?.currentRainfall ?? 0
  const damLevel = primaryDam?.storagePct ?? 67.6

  const { optimalCusecs, reasoning, recommendationType, impactPreview } = useMemo(() => {
    // --- Step 1: Demand-driven release requirement ---
    const inflowDemand = rainfall * 1200 * 0.6
    const storagePressure =
      damLevel >= 95 ? 15_000 :
      damLevel >= 90 ? 8_000 :
      damLevel >= 85 ? 3_000 : 0
    const rawDemand = inflowDemand + storagePressure

    // --- Step 2: Flood-safe discharge ceiling ---
    // Find the max cusecs before a currently-safe landmark gets flooded
    const baseWSE = calculateWSE(0)
    const allLandmarks = [
      ...NASHIK_TOPOGRAPHY.map((l) => ({ name: l.name, msl: l.msl })),
      ...INFRASTRUCTURE_REGISTRY.map((l) => ({ name: l.name, msl: l.plinthMSL })),
    ]
    const unflooded = allLandmarks.filter((l) => l.msl > baseWSE)
    const lowestSafe = unflooded.length > 0 ? Math.min(...unflooded.map((l) => l.msl)) : baseWSE
    const maxRise = Math.max(0, lowestSafe - baseWSE)
    // Reverse WSE formula: rise = (cusecs / 10000) * 0.8 → cusecs = rise / 0.8 * 10000
    const safeCeiling = Math.floor((maxRise / 0.8) * 10_000)

    // --- Step 3: Determine optimal release ---
    // Core principle: release must match inflow to prevent dam overtopping.
    // The safe ceiling is a *preference*, not an absolute cap.
    let optimal, recType
    if (rawDemand <= 0 && damLevel < 80) {
      // No inflow, dam comfortable → no release needed
      optimal = 0
      recType = 'safe'
    } else if (rawDemand <= safeCeiling) {
      // Demand fits within safe corridor → no downstream flooding from release
      optimal = Math.round(rawDemand)
      recType = 'safe'
    } else {
      // Inflow exceeds safe corridor → must release to prevent dam overflow
      // Release matches inflow demand; severity depends on how far over ceiling
      optimal = Math.round(rawDemand)
      if (damLevel >= 90 || rawDemand > safeCeiling * 3) {
        recType = 'emergency'
      } else if (damLevel >= 85 || rawDemand > safeCeiling * 1.5) {
        recType = 'caution'
      } else {
        recType = 'caution'
      }
    }
    optimal = clamp(optimal, 0, 100_000)

    // --- Step 4: Impact preview at recommended discharge ---
    const recWSE = calculateWSE(optimal)
    const baseImpacts = assessFloodImpact(baseWSE)
    const recImpacts = assessFloodImpact(recWSE)
    const baseFlooded = baseImpacts.filter((i) => i.isFlooded).length
    const recFlooded = recImpacts.filter((i) => i.isFlooded).length
    const additionalFlooded = recFlooded - baseFlooded
    const expectedLoss = estimateLossAtWSE(recWSE)
    const baseLoss = estimateLossAtWSE(baseWSE)
    const additionalLoss = expectedLoss - baseLoss

    // --- Step 5: Reasoning ---
    const recWSEText = recWSE.toFixed(1)
    let text
    if (isCatchmentLoading) {
      text = 'Calibrating with live telemetry…'
    } else if (recType === 'safe' && optimal === 0) {
      text = `No rain (${rainfall.toFixed(1)} mm/hr). Dam at ${damLevel}%. No release needed — holding WSE at ${baseWSE.toFixed(1)}m MSL.`
    } else if (recType === 'safe') {
      text = `Rain at ${rainfall.toFixed(1)} mm/hr. Dam at ${damLevel}%. Safe release of ${optimal.toLocaleString()} cusecs keeps WSE at ${recWSEText}m MSL — all areas dry.`
    } else if (recType === 'caution') {
      text = `Rain at ${rainfall.toFixed(1)} mm/hr. Dam at ${damLevel}%. Inflow of ${Math.round(inflowDemand).toLocaleString()} cusecs exceeds safe corridor. Releasing ${optimal.toLocaleString()} cusecs to match inflow — WSE ${recWSEText}m MSL. Monitor low-lying areas.`
    } else {
      text = `Rain at ${rainfall.toFixed(1)} mm/hr. Dam at ${damLevel}%. EMERGENCY: Inflow of ${Math.round(inflowDemand).toLocaleString()} cusecs. Releasing ${optimal.toLocaleString()} cusecs — WSE ${recWSEText}m MSL. Downstream flooding expected, evacuate risk zones.`
    }

    return {
      optimalCusecs: optimal,
      reasoning: text,
      recommendationType: recType,
      impactPreview: { wse: recWSE, floodedCount: recFlooded, additionalFlooded, expectedLoss, additionalLoss },
    }
  }, [rainfall, damLevel, isCatchmentLoading])

  const handleExecute = () => {
    setDamCusecs(optimalCusecs)
  }

  const recConfig = {
    safe: {
      label: 'Safe Release Recommendation',
      badge: 'AI Active',
      badgeCls: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100',
      button: 'Authorize Optimal Release',
      border: 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]',
    },
    caution: {
      label: 'Controlled Release Advisory',
      badge: 'Caution',
      badgeCls: 'border-amber-500/40 bg-amber-500/10 text-amber-100',
      button: 'Authorize Controlled Release',
      border: 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
    },
    emergency: {
      label: 'Emergency Release Required',
      badge: 'Emergency',
      badgeCls: 'border-rose-500/40 bg-rose-500/10 text-rose-100 animate-pulse',
      button: 'Authorize Emergency Release',
      border: 'border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.25)]',
    },
  }

  const cfg = recConfig[recommendationType]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ type: 'tween', duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
      className={`rounded-2xl border bg-slate-900/80 p-4 backdrop-blur ${cfg.border}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Brain size={24} className="text-sky-300" />
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">AI Optimizer</p>
            <p className="text-lg font-semibold text-slate-100">{cfg.label}</p>
          </div>
        </div>
        <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${cfg.badgeCls}`}>
          {cfg.badge}
        </span>
      </div>

      <div className="mt-4 flex items-baseline gap-3">
        <p className="text-xs uppercase tracking-wide text-slate-400">Optimal Discharge</p>
        <motion.span
          key={optimalCusecs}
          initial={{ opacity: 0, y: 6, filter: 'blur(3px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ type: 'tween', duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="font-mono text-3xl font-bold text-sky-200"
        >
          {Math.round(optimalCusecs).toLocaleString()} cusecs
        </motion.span>
      </div>

      <motion.p
        key={reasoning}
        initial={{ opacity: 0, y: 6, filter: 'blur(3px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ type: 'tween', duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
        className="mt-3 font-mono text-sm text-slate-200"
      >
        {reasoning}
      </motion.p>

      {/* Downstream Impact Preview — synced with flood-impact model */}
      {impactPreview.additionalLoss > 0 ? (
        <div className={`mt-3 rounded-xl border p-2.5 text-xs ${
          recommendationType === 'emergency'
            ? 'border-rose-700/40 bg-rose-900/20 text-rose-200'
            : recommendationType === 'caution'
            ? 'border-amber-700/40 bg-amber-900/20 text-amber-200'
            : 'border-slate-700/40 bg-slate-800/30 text-slate-300'
        }`}>
          <div className="flex items-center gap-1.5 font-semibold">
            <AlertTriangle size={13} />
            Downstream Impact From This Discharge
          </div>
          <div className="mt-1.5 flex justify-between">
            <span>WSE: <span className="font-mono">{impactPreview.wse.toFixed(1)}m</span></span>
            <span>Landmarks at risk: <span className="font-mono">{impactPreview.floodedCount}</span></span>
          </div>
          <div className="mt-1 flex justify-between">
            <span>Added loss: <span className="font-mono">{formatCurrency(impactPreview.additionalLoss)}</span></span>
            {impactPreview.additionalFlooded > 0 && (
              <span className="text-rose-300">+{impactPreview.additionalFlooded} newly flooded</span>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-3 rounded-xl border border-emerald-700/40 bg-emerald-900/20 p-2.5 text-xs text-emerald-200">
          <div className="flex items-center gap-1.5 font-semibold">
            <Shield size={13} />
            No additional flood impact from this discharge
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <span>Current slider: <span className="font-mono text-slate-200">{damCusecs.toLocaleString()} cusecs</span></span>
        <span>Rainfall: <span className="font-mono text-sky-200">{isCatchmentLoading ? '…' : `${rainfall.toFixed(1)} mm/hr`}</span></span>
      </div>

      <button
        type="button"
        onClick={handleExecute}
        className={`mt-4 w-full rounded-xl border px-4 py-3 text-sm font-semibold uppercase tracking-wide transition ${
          recommendationType === 'emergency'
            ? 'border-rose-500/60 bg-rose-600/20 text-rose-100 hover:border-rose-400 hover:bg-rose-500/25'
            : recommendationType === 'caution'
            ? 'border-amber-500/60 bg-amber-600/20 text-amber-100 hover:border-amber-400 hover:bg-amber-500/25'
            : 'border-sky-500/60 bg-sky-600/20 text-sky-100 hover:border-sky-400 hover:bg-sky-500/25'
        }`}
      >
        {cfg.button}
      </button>
    </motion.div>
  )
}

AiOptimizerPanel.propTypes = {
  criticalThreshold: PropTypes.number,
}
