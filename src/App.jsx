import './App.css'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import MainLayout from './components/MainLayout'
import LandingPage from './components/LandingPage'
import { FloodRiskProvider, useFloodRisk } from './state/FloodRiskContext'
import { AuditLogProvider, useAuditLog } from './hooks/useAuditLog'
import { DAM_REGISTRY, PRIMARY_DAM_ID } from './data/damRegistry'

const navItems = [
  { id: 'shield', label: 'Overview', icon: 'shield' },
  { id: 'sitrep', label: 'Executive Sitrep', icon: 'sitrep' },
  { id: 'simulation', label: 'Simulation', icon: 'simulation' },
  { id: 'map', label: 'Map', icon: 'map' },
  { id: 'activity', label: 'Performance', icon: 'activity' },
  { id: 'bell', label: 'Alerts', icon: 'bell' },
  { id: 'sos', label: 'Citizen Sentinel', icon: 'lifebuoy' },
  { id: 'integrity', label: 'Integrity', icon: 'integrity' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
]

function App() {
  const primaryDam = DAM_REGISTRY.find((d) => d.id === PRIMARY_DAM_ID) ?? DAM_REGISTRY[0]
  const [isEntered, setIsEntered] = useState(false)
  return (
    <AuditLogProvider>
      <FloodRiskProvider>
        <DamAuditWatcher />
        <AnimatePresence mode="wait">
          {!isEntered ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <LandingPage onEnter={() => setIsEntered(true)} />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="h-full"
            >
              <MainLayout navItems={navItems} systemStatus="LIVE" damLevel={primaryDam?.storagePct ?? 0} />
            </motion.div>
          )}
        </AnimatePresence>
      </FloodRiskProvider>
    </AuditLogProvider>
  )
}

function DamAuditWatcher() {
  const { damCusecs } = useFloodRisk()
  const { addLog } = useAuditLog()
  const prev = useRef(damCusecs)

  useEffect(() => {
    if (prev.current !== damCusecs) {
      addLog({ action: 'Manual Discharge Change', value: `Set to ${Math.round(damCusecs).toLocaleString()} cusecs`, user: 'ADMIN-01' })
      prev.current = damCusecs
    }
  }, [damCusecs, addLog])

  return null
}

export default App
