import { AnimatePresence, motion } from 'framer-motion'
import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import TopHeader from './TopHeader'
import DashboardPage from '../pages/DashboardPage'
import MapPage from '../pages/MapPage'
import PerformancePage from '../pages/PerformancePage'
import AlertsPage from '../pages/AlertsPage'
import SettingsPage from '../pages/SettingsPage'
import CitizenSentinelPage from '../pages/CitizenSentinelPage'
import IntegrityPage from '../pages/IntegrityPage'
import SitrepModal from './SitrepModal'
import { useFloodRisk } from '../state/FloodRiskContext'
import { useAuditLog } from '../hooks/useAuditLog'

/**
 * War-room dashboard shell orchestrating the sidebar, header, and core panels.
 * @param {object} props
 * @param {Array<{ id: string; label: string; icon: 'shield' | 'map' | 'activity' | 'bell' | 'settings' }>} props.navItems
 * @param {string} props.systemStatus
 * @param {number} props.damLevel
 */
export default function MainLayout({ navItems, systemStatus, damLevel }) {
  const [activeNav, setActiveNav] = useState(navItems?.[0])
  const [showSitrep, setShowSitrep] = useState(false)
  const { theme } = useFloodRisk()
  const { addLog } = useAuditLog()

  const handleNavSelect = (item) => {
    if (item.id === 'sitrep') {
      setShowSitrep(true)
      addLog({ action: 'SITREP Generated', value: 'Executive Situation Report opened', user: 'ADMIN-01' })
      return
    }
    setActiveNav(item)
  }

  useEffect(() => {
    const openHandler = () => {
      setShowSitrep(true)
      addLog({ action: 'SITREP Generated', value: 'Executive Situation Report opened', user: 'ADMIN-01' })
    }
    window.addEventListener('open-sitrep', openHandler)
    return () => window.removeEventListener('open-sitrep', openHandler)
  }, [addLog])

  // Render the appropriate page based on active navigation
  const renderPage = () => {
    switch (activeNav?.id) {
      case 'shield':
        return <DashboardPage damLevel={damLevel} />
      case 'simulation':
        return <DashboardPage damLevel={damLevel} />
      case 'map':
        return <MapPage />
      case 'activity':
        return <PerformancePage />
      case 'bell':
        return <AlertsPage />
      case 'sos':
        return <CitizenSentinelPage />
      case 'integrity':
        return <IntegrityPage />
      case 'settings':
        return <SettingsPage />
      default:
        return <DashboardPage />
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-transparent text-slate-100">
      <Sidebar activeItem={activeNav} items={navItems} onSelect={handleNavSelect} />
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div className="flex-shrink-0 px-6 pt-5 pb-3">
          <TopHeader systemStatus={systemStatus} damLevel={damLevel} onOpenSitrep={() => setShowSitrep(true)} />
        </div>

        <AnimatePresence mode="wait">
          <motion.main
            key={activeNav?.id}
            className="flex-1 overflow-y-auto px-6 pb-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 200, damping: 24 }}
          >
            {renderPage()}
          </motion.main>
        </AnimatePresence>
        <SitrepModal open={showSitrep} onClose={() => setShowSitrep(false)} />
      </div>
    </div>
  )
}

MainLayout.propTypes = {
  navItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.oneOf(['shield', 'map', 'activity', 'bell', 'lifebuoy', 'integrity', 'sitrep', 'simulation', 'settings']).isRequired,
    }),
  ).isRequired,
  systemStatus: PropTypes.string.isRequired,
  damLevel: PropTypes.number.isRequired,
}
