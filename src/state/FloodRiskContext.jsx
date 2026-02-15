import { createContext, useContext, useMemo, useState } from 'react'
import { calculateWSE, assessFloodImpact } from '../data/nashikTopography'
import { useCatchmentData } from '../hooks/useCatchmentData'
import { DAM_REGISTRY, PRIMARY_DAM_ID } from '../data/damRegistry'
import { MOCK_CITIZEN_REPORTS } from '../data/mockCitizenReports'

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
  const [damCusecs, setDamCusecs] = useState(0) // Official discharge defaults to 0 cusecs
  const [citizenReports, setCitizenReports] = useState(MOCK_CITIZEN_REPORTS)
  const [isSimulating, setIsSimulating] = useState(false)
  const [systemStatus, setSystemStatus] = useState('LIVE')
  const [simulatedCatchmentData, setSimulatedCatchmentData] = useState(null)

  // Live meteorological feed for Trimbakeshwar catchment
  const {
    data: rawCatchmentData,
    isLoading: isCatchmentLoading,
    error: catchmentError,
  } = useCatchmentData()

  const setSimulatedRainfall = (rainMmHr) => {
    const nextRain = Math.max(0, rainMmHr)
    setSimulatedCatchmentData((prev) => {
      const base = prev ?? rawCatchmentData ?? {
        currentRainfall: 0,
        predictedInflow: 0,
        hourlyForecast: [],
        description: 'Simulation baseline',
        temp: null,
        isFallback: false,
      }
      return {
        ...base,
        currentRainfall: nextRain,
        predictedInflow: nextRain * 1200 * 0.6,
        description: 'Monsoon fast-forward simulation',
        updatedAt: new Date().toISOString(),
        isFallback: false,
      }
    })
  }

  const resetSimulation = () => {
    setIsSimulating(false)
    setSimulatedCatchmentData(null)
    setSystemStatus('LIVE')
    setDamCusecs(0)
  }

  const theme = useMemo(() => RISK_THEMES[riskLevel] ?? RISK_THEMES.alert, [riskLevel])

  // Official dam registry with percent-based storage; mcft not provided in supplied data
  const damRegistry = useMemo(() => {
    return DAM_REGISTRY.map((d) => {
      const risk = d.storagePct >= 95 ? 'critical' : d.storagePct >= 90 ? 'warning' : 'normal'
      return { ...d, risk }
    })
  }, [])

  const primaryDam = useMemo(
    () => damRegistry.find((d) => d.id === PRIMARY_DAM_ID) ?? damRegistry[0],
    [damRegistry],
  )

  const catchmentData = useMemo(
    () => (isSimulating && simulatedCatchmentData ? simulatedCatchmentData : rawCatchmentData),
    [isSimulating, simulatedCatchmentData, rawCatchmentData],
  )

  const effectiveCatchmentLoading = isSimulating ? false : isCatchmentLoading

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
      // Simulation controls
      isSimulating,
      setIsSimulating,
      systemStatus,
      setSystemStatus,
      setSimulatedRainfall,
      resetSimulation,
      waterSurfaceElevation,
      floodImpacts,
      criticalLandmarks,
      isCatchmentLoading: effectiveCatchmentLoading,
      damRegistry,
      primaryDam,
      // Citizen SOS feed
      citizenReports,
      setCitizenReports,
      // Meteorological inflow signals
      catchmentData,
      catchmentError,
    }),
    [
      riskLevel,
      isSimulating,
      systemStatus,
      catchmentData,
      effectiveCatchmentLoading,
      theme,
      damCusecs,
      waterSurfaceElevation,
      floodImpacts,
      criticalLandmarks,
      damRegistry,
      primaryDam,
      citizenReports,
      catchmentError,
    ],
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
