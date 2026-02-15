import { AnimatePresence, motion } from 'framer-motion'
import PropTypes from 'prop-types'
import { useState } from 'react'
import Sidebar from './Sidebar'
import TopHeader from './TopHeader'
import DashboardPage from '../pages/DashboardPage'
import MapPage from '../pages/MapPage'
import PerformancePage from '../pages/PerformancePage'
import AlertsPage from '../pages/AlertsPage'
import SettingsPage from '../pages/SettingsPage'
import { useFloodRisk } from '../state/FloodRiskContext'

/**
 * War-room dashboard shell orchestrating the sidebar, header, and core panels.
 * @param {object} props
 * @param {Array<{ id: string; label: string; icon: 'shield' | 'map' | 'activity' | 'bell' | 'settings' }>} props.navItems
 * @param {string} props.systemStatus
 * @param {number} props.damLevel
 */
export default function MainLayout({ navItems, systemStatus, damLevel }) {
  const [activeNav, setActiveNav] = useState(navItems?.[0])
  const { theme } = useFloodRisk()

  // Render the appropriate page based on active navigation
  const renderPage = () => {
    switch (activeNav?.id) {
      case 'shield':
        return <DashboardPage />
      case 'map':
        return <MapPage />
      case 'activity':
        return <PerformancePage />
      case 'bell':
        return <AlertsPage />
      case 'settings':
        return <SettingsPage />
      default:
        return <DashboardPage />
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-transparent text-slate-100">
      <Sidebar activeItem={activeNav} items={navItems} onSelect={setActiveNav} />
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div className="flex-shrink-0 px-6 pt-5 pb-3">
          <TopHeader systemStatus={systemStatus} damLevel={damLevel} />
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
      </div>
    </div>
  )
}

MainLayout.propTypes = {
  navItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.oneOf(['shield', 'map', 'activity', 'bell', 'settings']).isRequired,
    }),
  ).isRequired,
  systemStatus: PropTypes.string.isRequired,
  damLevel: PropTypes.number.isRequired,
}
