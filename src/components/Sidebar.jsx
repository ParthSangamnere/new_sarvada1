import { AnimatePresence, motion } from 'framer-motion'
import { Activity, Bell, ChevronLeft, ChevronRight, FileText, LifeBuoy, Map, Settings, Shield, ShieldAlert, Zap } from 'lucide-react'
import { useState } from 'react'
import PropTypes from 'prop-types'

const icons = {
  shield: Shield,
  map: Map,
  activity: Activity,
  bell: Bell,
  lifebuoy: LifeBuoy,
  integrity: ShieldAlert,
  sitrep: FileText,
  simulation: Zap,
  settings: Settings,
}

/**
 * Collapsible command-center sidebar with icon + label navigation.
 * Uses pure CSS transitions for width/opacity to avoid layout thrash.
 */
export default function Sidebar({ activeItem, items, onSelect, expanded, onToggleExpand }) {
  const [hoveredItem, setHoveredItem] = useState(null)

  return (
    <aside
      style={{ width: expanded ? 220 : 72 }}
      className="sidebar-root relative flex h-screen flex-shrink-0 flex-col border-r border-slate-800/70 bg-slate-900/60 pb-6 pt-5 backdrop-blur-md overflow-hidden"
    >
      {/* Logo + Brand — click to toggle expand/collapse */}
      <button
        type="button"
        onClick={onToggleExpand}
        className={`flex items-center gap-3 px-3 cursor-pointer transition-all duration-300 ease-out ${expanded ? 'justify-start' : 'justify-center'}`}
        aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        <motion.div
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-sky-500/80 to-sky-400/60 text-lg font-semibold text-slate-950 shadow-neon"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          S
        </motion.div>
        <div
          className={`sidebar-label flex flex-col overflow-hidden whitespace-nowrap ${expanded ? 'sidebar-label--visible' : ''}`}
        >
          <span className="text-[13px] font-bold tracking-[0.12em] text-slate-100">SARVADA</span>
          <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500">Command Center</span>
        </div>
      </button>

      {/* Navigation */}
      <nav className="mt-6 flex flex-1 flex-col gap-1.5 px-2">
        {items.map((item) => {
          const Icon = icons[item.icon]
          const isActive = activeItem?.id === item.id
          const isHovered = hoveredItem === item.id
          return (
            <div key={item.id} className="relative">
              <button
                type="button"
                onClick={() => onSelect?.(item)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-300 ease-out hover:bg-slate-800/70 ${expanded ? 'justify-start' : 'justify-center'}`}
                aria-label={item.label}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-glow"
                    className="absolute inset-0 rounded-xl bg-sky-500/20"
                    transition={{ type: 'tween', duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  />
                )}
                {isActive && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute left-0 h-5 w-1 rounded-full bg-sky-400 shadow-neon"
                    transition={{ type: 'tween', duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  />
                )}
                <Icon
                  className="relative z-10 flex-shrink-0"
                  size={20}
                  strokeWidth={2.4}
                  color={isActive ? '#38bdf8' : '#e2e8f0'}
                />
                <span
                  className={`sidebar-label relative z-10 truncate text-[13px] font-medium ${isActive ? 'text-sky-200' : 'text-slate-300'} ${expanded ? 'sidebar-label--visible' : ''}`}
                >
                  {item.label}
                </span>
              </button>

              {/* Tooltip — only when collapsed */}
              {!expanded && isHovered && (
                <div
                  className="sidebar-tooltip pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg border border-sky-500/30 bg-slate-900/95 px-3 py-2 text-sm font-medium text-slate-100 shadow-lg backdrop-blur-md"
                >
                  {item.label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-slate-900/95" />
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer brand */}
      <div className="flex flex-col items-center gap-1 text-center px-2">
        <div className={`sidebar-label flex flex-col items-center ${expanded ? 'sidebar-label--visible' : ''}`}>
          <span className="text-[10px] font-bold tracking-[0.14em] text-slate-200">
            {expanded ? 'SARVADA v1.0' : 'SRVD'}
          </span>
          {expanded && (
            <span className="text-[9px] uppercase tracking-[0.16em] text-slate-500">Disaster Command Platform</span>
          )}
        </div>
      </div>
    </aside>
  )
}

Sidebar.propTypes = {
  activeItem: PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    icon: PropTypes.oneOf(Object.keys(icons)).isRequired,
  }),
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.oneOf(Object.keys(icons)).isRequired,
    }),
  ).isRequired,
  onSelect: PropTypes.func,
  expanded: PropTypes.bool.isRequired,
  onToggleExpand: PropTypes.func.isRequired,
}
