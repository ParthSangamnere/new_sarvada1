import { createContext, useContext, useMemo, useState } from 'react'
import { calculateWSE, assessFloodImpact } from '../data/nashikTopography'

const FloodRiskContext = createContext(undefined)

const RISK_THEMES = {
  active: {
    label: 'Active',
    tint: 'emerald',
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-200',
    ring: 'ring-emerald-400/60',
    glow: 'shadow-[0_0_24px_rgba(16,185,129,0.38)]',
    metricBg: 'bg-emerald-500/15',
    metricText: 'text-emerald-100',
  },
  alert: {
    label: 'Alert',
    tint: 'amber',
    bg: 'bg-amber-500/15',
    text: 'text-amber-100',
    ring: 'ring-amber-400/60',
    glow: 'shadow-[0_0_24px_rgba(251,191,36,0.38)]',
    metricBg: 'bg-amber-500/15',
    metricText: 'text-amber-100',
  },
  critical: {
    label: 'Critical',
    tint: 'rose',
    bg: 'bg-rose-500/15',
    text: 'text-rose-100',
    ring: 'ring-rose-400/60',
    glow: 'shadow-[0_0_24px_rgba(244,63,94,0.42)]',
    metricBg: 'bg-rose-500/15',
    metricText: 'text-rose-100',
  },
}

/**
 * Provides globally shared flood-risk signal, hydro-elevation data, and derived theming.
 * @param {object} props
 * @param {React.ReactNode} props.children
 */
export function FloodRiskProvider({ children }) {
  const [riskLevel, setRiskLevel] = useState('alert')
  const [damCusecs, setDamCusecs] = useState(35000) // Initial discharge in cusecs

  const theme = useMemo(() => RISK_THEMES[riskLevel] ?? RISK_THEMES.alert, [riskLevel])

  // Calculate real-time WSE and flood impacts
  const waterSurfaceElevation = useMemo(() => calculateWSE(damCusecs), [damCusecs])
  const floodImpacts = useMemo(() => assessFloodImpact(waterSurfaceElevation), [waterSurfaceElevation])
  const criticalLandmarks = useMemo(
    () => floodImpacts.filter((impact) => impact.isFlooded && impact.riskLevel !== 'warning'),
    [floodImpacts],
  )

  const value = useMemo(
    () => ({
      riskLevel,
      setRiskLevel,
      theme,
      // Hydro-elevation data
      damCusecs,
      setDamCusecs,
      waterSurfaceElevation,
      floodImpacts,
      criticalLandmarks,
    }),
    [riskLevel, theme, damCusecs, waterSurfaceElevation, floodImpacts, criticalLandmarks],
  )

  return <FloodRiskContext.Provider value={value}>{children}</FloodRiskContext.Provider>
}

/**
 * Hook to access the current flood-risk state, hydro-elevation data, and styling tokens.
 * @returns {{
 *   riskLevel: string;
 *   setRiskLevel: (level: 'active' | 'alert' | 'critical') => void;
 *   theme: object;
 *   damCusecs: number;
 *   setDamCusecs: (cusecs: number) => void;
 *   waterSurfaceElevation: number;
 *   floodImpacts: Array;
 *   criticalLandmarks: Array;
 * }}
 */
export function useFloodRisk() {
  const context = useContext(FloodRiskContext)
  if (!context) {
    throw new Error('useFloodRisk must be used within FloodRiskProvider')
  }
  return context
}
