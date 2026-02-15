import { AnimatePresence, motion } from 'framer-motion'
import { Activity, Bell, FileText, LifeBuoy, Map, Settings, Shield, ShieldAlert, Zap } from 'lucide-react'
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
 * Command-center sidebar with icon-only navigation and an active neon indicator.
 * @param {object} props
 * @param {{ id: string; label: string; icon: keyof typeof icons; }} props.activeItem
 * @param {Array<{ id: string; label: string; icon: keyof typeof icons; }>} props.items
 * @param {(item: { id: string; label: string; icon: keyof typeof icons; }) => void} props.onSelect
 */
export default function Sidebar({ activeItem, items, onSelect }) {
  const [hoveredItem, setHoveredItem] = useState(null)

  return (
    <aside className="flex h-screen w-20 flex-col items-center gap-6 border-r border-slate-800/70 bg-slate-900/60 pb-6 pt-5 backdrop-blur-md">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-b from-sky-500/80 to-sky-400/60 text-xl font-semibold text-slate-950 shadow-neon">
        GS
      </div>
      <nav className="flex flex-1 flex-col items-center gap-3">
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
                className="relative flex h-12 w-12 items-center justify-center rounded-2xl transition-colors duration-200 hover:bg-slate-800/70"
                aria-label={item.label}
              >
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      layoutId="nav-glow"
                      className="absolute inset-0 rounded-2xl bg-sky-500/25"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                    />
                  )}
                </AnimatePresence>
                <Icon
                  className="relative z-10"
                  size={22}
                  strokeWidth={2.4}
                  color={isActive ? '#38bdf8' : '#e2e8f0'}
                />
                {isActive && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute left-0 h-5 w-1 rounded-full bg-sky-400 shadow-neon"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  />
                )}
              </button>
              
              {/* Tooltip */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg border border-sky-500/30 bg-slate-900/95 px-3 py-2 text-sm font-medium text-slate-100 shadow-lg backdrop-blur-md"
                  >
                    {item.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-slate-900/95"></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </nav>
      <div className="flex flex-col items-center gap-2 text-center text-[10px] uppercase tracking-[0.18em] text-slate-400">
        <span className="font-semibold text-slate-200">War-Room</span>
        <span>Command</span>
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
}
