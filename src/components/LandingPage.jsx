import { motion } from 'framer-motion'
import PropTypes from 'prop-types'
import { Shield, ArrowRight } from 'lucide-react'

const acronymItems = [
  { key: 'S', label: 'System', desc: 'Unified emergency command layer' },
  { key: 'A', label: 'Alert', desc: 'Live telemetry and early warning' },
  { key: 'R', label: 'Relief', desc: 'Coordinated response and logistics' },
  { key: 'V', label: 'Vulnerability', desc: 'Digital twin exposure modeling' },
  { key: 'A', label: 'Analysis', desc: 'AI-driven mitigation playbooks' },
  { key: 'D', label: 'Dam', desc: 'Reservoir intelligence and discharge' },
  { key: 'A', label: 'Admissions', desc: 'Official governance-grade reporting' },
]

export default function LandingPage({ onEnter }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 text-slate-100">
      <div className="landing-grid absolute inset-0 opacity-80" aria-hidden="true" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.08),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(14,165,233,0.12),transparent_28%)]" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/60 to-slate-950" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-5xl px-6 py-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-500/40 bg-sky-500/10 shadow-[0_0_30px_rgba(56,189,248,0.35)]"
        >
          <Shield className="text-sky-300" size={26} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
          className="mt-6 text-5xl font-extrabold tracking-tight text-slate-50 sm:text-6xl"
        >
          SARVADA
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
          className="mt-3 font-mono text-sm uppercase tracking-[0.24em] text-sky-200/80"
        >
          System for Alert, Relief, and Vulnerability Analysis
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
          className="mt-4 text-lg text-slate-300 sm:text-xl"
        >
          Digital Twin for Nashik District — hydrology, infrastructure, and citizen signals fused into one operational picture.
        </motion.p>

        <div className="relative mx-auto mt-10 max-w-3xl overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-900/60 p-6 backdrop-blur">
          <div className="scan-line absolute inset-x-6 h-[2px] bg-sky-400/50" aria-hidden="true" />
          <motion.ul
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          >
            {acronymItems.map((item, idx) => (
              <motion.li
                key={`${item.label}-${idx}`}
                variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                className="flex items-center gap-3 rounded-xl border border-slate-800/70 bg-slate-900/50 px-4 py-3 text-left"
              >
                <span className="font-mono text-lg font-semibold text-sky-300">{item.key}</span>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-100">{item.label}</span>
                  <span className="text-xs text-slate-400">{item.desc}</span>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </div>

        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5, ease: 'easeOut' }}
          type="button"
          onClick={onEnter}
          className="group relative mx-auto mt-10 flex items-center justify-center gap-3 rounded-2xl border border-sky-500/70 bg-sky-600/20 px-6 py-4 text-sm font-semibold uppercase tracking-[0.22em] text-sky-100 shadow-[0_0_26px_rgba(56,189,248,0.35)] transition duration-200 hover:shadow-[0_0_36px_rgba(56,189,248,0.6)]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-500/50 bg-sky-500/10">
            <ArrowRight className="transition-transform duration-200 group-hover:translate-x-1" size={18} />
          </span>
          ENTER COMMAND CENTER
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5, ease: 'easeOut' }}
          className="mt-8 text-xs uppercase tracking-[0.24em] text-slate-500"
        >
          Authorized Access Only | Nashik District Disaster Management Authority
        </motion.div>
      </div>
    </div>
  )
}

LandingPage.propTypes = {
  onEnter: PropTypes.func,
}
