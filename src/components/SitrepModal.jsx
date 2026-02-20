import { useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, FileText, Printer, Download, X } from 'lucide-react'
import { useFloodRisk } from '../state/FloodRiskContext'
import { BRIDGES } from '../data/logisticsData'

export default function SitrepModal({ open, onClose }) {
  const { waterSurfaceElevation, floodImpacts, catchmentData, citizenReports, damCusecs, riskLevel } = useFloodRisk()

  const timestamp = useMemo(
    () => new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true }),
    [],
  )

  const incidentId = useMemo(() => `GS-2026-NSK-${Date.now()}`, [])

  const metrics = useMemo(() => {
    const submerged = (floodImpacts ?? []).filter((f) => f.isFlooded)
    const rainfall = catchmentData?.currentRainfall ?? 0
    const activeSOSCount = (citizenReports ?? []).filter((r) => r.status !== 'resolved').length
    const closedBridges = BRIDGES.filter((b) => waterSurfaceElevation > b.msl)
    const isUpstreamCritical = riskLevel === 'critical' || waterSurfaceElevation >= 596

    const advisory = isUpstreamCritical
      ? 'Immediate evacuation of low-lying zones. Enforce bridge closures and pre-position NDRF boats.'
      : waterSurfaceElevation >= 594
        ? 'Maintain traffic metering at Holkar; alert Ram Kund vendors; keep pumps on standby.'
        : 'Maintain monitoring posture; keep upstream gates under watch; ready public address systems.'

    return {
      submerged,
      rainfall,
      activeSOSCount,
      closedBridges,
      advisory,
      isUpstreamCritical,
    }
  }, [catchmentData, citizenReports, floodImpacts, riskLevel, waterSurfaceElevation])

  const generateReport = () => {
    return [
      'GOVERNMENT OF MAHARASHTRA | NASHIK DISTRICT DISASTER MANAGEMENT AUTHORITY',
      'OFFICIAL SITUATION REPORT (SITREP)',
      `Incident ID: ${incidentId}`,
      `Timestamp (IST): ${timestamp}`,
      '',
      'I. HYDROLOGICAL SUMMARY',
      `- Rainfall: ${metrics.rainfall.toFixed(1)} mm/hr`,
      `- Water Surface Elevation: ${waterSurfaceElevation.toFixed(2)} m MSL`,
      `- Discharge (Official): ${Math.round(damCusecs).toLocaleString()} cusecs`,
      `- Upstream Critical: ${metrics.isUpstreamCritical ? 'YES' : 'NO'}`,
      '',
      'II. INFRASTRUCTURE IMPACT',
      `- Closed Bridges (${metrics.closedBridges.length}): ${metrics.closedBridges.map((b) => b.name).join(', ') || 'None'}`,
      `- Submerged Landmarks (${metrics.submerged.length}): ${metrics.submerged.map((s) => s.name).join(', ') || 'None'}`,
      `- Flooded Areas (count): ${floodImpacts?.filter((f) => f.isFlooded).length ?? 0}`,
      '',
      'III. PUBLIC SAFETY & RESCUE',
      `- Active SOS Signals: ${metrics.activeSOSCount}`,
      `- Verification Cadence: 15-minute circuit`,
      `- Shelter Activation: ${metrics.submerged.length > 0 ? 'Tapovan + Panchvati Schools' : 'Standby'}`,
      '',
      'IV. STRATEGIC ADVISORY',
      `- ${metrics.advisory}`,
      '',
      'V. COMMAND & CONTROL',
      '- ICP: Nashik Collectorate (War-Room)',
      '- Comms: VHF Ch. 3 | WhatsApp Ops Room',
      '- Logistics: 6 boats staged; 2 high-clearance vehicles',
      '',
      'Digital Signature: ___________________________',
      'Authority: District Collector / Incident Commander',
    ].join('\n')
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateReport())
    } catch (err) {
      console.error('Failed to copy SITREP', err)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([generateReport()], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${incidentId}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handlePrint = () => {
    // Small delay to ensure render; print targets .sitrep-print scope
    requestAnimationFrame(() => setTimeout(() => window.print(), 50))
  }

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    if (open) {
      window.addEventListener('keydown', onEsc)
    }
    return () => window.removeEventListener('keydown', onEsc)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm no-print"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -20, opacity: 0, scale: 0.97, filter: 'blur(4px)' }}
            animate={{ y: 0, opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ y: -15, opacity: 0, scale: 0.97, filter: 'blur(4px)' }}
            transition={{ type: 'tween', duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="my-4 flex w-[min(1080px,96vw)] max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-md sitrep-print"
          >
            <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-800 px-6 py-3 bg-slate-900/80">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Executive Sitrep</p>
                <p className="text-base font-semibold text-slate-100">Government of Maharashtra | Nashik District Disaster Management Authority</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-slate-700/60 bg-slate-800/70 p-2 text-slate-300 hover:bg-slate-700/70"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0 grid grid-cols-1 gap-4 px-5 py-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 md:col-span-2">
                <div className="rounded-xl bg-white p-4 text-slate-900 shadow-inner sitrep-document">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                    <span>Government of Maharashtra | Nashik District Disaster Management Authority</span>
                    <span>{timestamp} (IST)</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-700">Official Situation Report (SITREP)</p>
                      <p className="text-lg font-bold text-slate-900">Incident ID: {incidentId}</p>
                    </div>
                    <div className="rounded-lg border border-slate-300 px-3 py-1.5 text-right text-xs">
                      <p className="font-semibold text-slate-700">Status</p>
                      <p className="font-mono text-sm text-slate-900">{metrics.isUpstreamCritical ? 'CRITICAL' : 'ACTIVE'}</p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Rainfall</p>
                      <p className="text-base font-semibold text-slate-900">{metrics.rainfall.toFixed(1)} mm/hr</p>
                      <p className="text-[10px] text-slate-500">Catchment (IST)</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">WSE</p>
                      <p className="text-base font-semibold text-slate-900">{waterSurfaceElevation.toFixed(2)} m MSL</p>
                      <p className="text-[10px] text-slate-500">Datum: Riverbed</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Discharge</p>
                      <p className="text-base font-semibold text-slate-900">{Math.round(damCusecs).toLocaleString()} cusecs</p>
                      <p className="text-[10px] text-slate-500">Gangapur gates</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Upstream Critical</p>
                      <p className="text-base font-semibold text-slate-900">{metrics.isUpstreamCritical ? 'Yes' : 'No'}</p>
                      <p className="text-[10px] text-slate-500">Auto escalation</p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-3 text-sm text-slate-900">
                    <section>
                      <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-slate-700">I. Hydrological Summary</p>
                      <ul className="ml-4 list-disc">
                        <li>Catchment Rainfall: {metrics.rainfall.toFixed(1)} mm/hr</li>
                        <li>Water Surface Elevation: {waterSurfaceElevation.toFixed(2)} m MSL</li>
                        <li>Discharge (Official): {Math.round(damCusecs).toLocaleString()} cusecs</li>
                        <li>Upstream Critical: {metrics.isUpstreamCritical ? 'Yes' : 'No'}</li>
                      </ul>
                    </section>

                    <section>
                      <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-slate-700">II. Infrastructure</p>
                      <ul className="ml-4 list-disc">
                        <li>Closed Bridges ({metrics.closedBridges.length}): {metrics.closedBridges.map((b) => b.name).join(', ') || 'None'}</li>
                        <li>Submerged Landmarks ({metrics.submerged.length}): {metrics.submerged.length > 0 ? metrics.submerged.map((s) => s.name).join(', ') : 'None reported'}</li>
                        <li>Flooded Parcels: {floodImpacts?.filter((f) => f.isFlooded).length ?? 0}</li>
                      </ul>
                    </section>

                    <section>
                      <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-slate-700">III. Public Safety</p>
                      <ul className="ml-4 list-disc">
                        <li>Active SOS Signals: {metrics.activeSOSCount}</li>
                        <li>Shelter Activation: {metrics.submerged.length > 0 ? 'Tapovan + Panchvati Schools' : 'Standby'}</li>
                        <li>Upstream Critical: {metrics.isUpstreamCritical ? 'Yes' : 'No'}</li>
                      </ul>
                    </section>

                    <section>
                      <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-slate-700">IV. Advisory</p>
                      <p className="ml-1 max-w-3xl text-sm leading-relaxed">{metrics.advisory}</p>
                      <p className="ml-1 text-xs text-slate-500">Verification cadence: 15-minute telemetry + citizen callbacks</p>
                    </section>

                    <section className="pt-1">
                      <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-slate-700">Digital Signature</p>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700">
                          <p className="font-semibold text-slate-800">Authorized Signatory</p>
                          <div className="mt-4 border-t border-slate-300 pt-1">District Collector, Nashik</div>
                          <p className="text-[10px] text-slate-500">Seal / e-Sign</p>
                        </div>
                        <div className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700">
                          <p className="font-semibold text-slate-800">Incident Commander</p>
                          <div className="mt-4 border-t border-slate-300 pt-1">NDRF Lead, Godavari Sector</div>
                          <p className="text-[10px] text-slate-500">Seal / e-Sign</p>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>

                <div className="mt-3 rounded-xl border border-slate-200 bg-white/95 p-2.5 text-slate-800 shadow-inner">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Plain-text SITREP</span>
                    <span>{incidentId}</span>
                  </div>
                  <pre className="mt-1.5 max-h-36 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-100/80 p-2.5 text-[11px] font-mono text-slate-800">
{generateReport()}
                  </pre>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                <p className="text-sm font-semibold text-slate-200">Actions</p>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 transition hover:border-sky-500/60 hover:text-sky-100"
                >
                  <span className="flex items-center gap-2"><Copy size={14} /> Copy Data</span>
                  <span className="text-[11px] uppercase tracking-wide text-slate-400">Ctrl+C</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 transition hover:border-sky-500/60 hover:text-sky-100"
                >
                  <span className="flex items-center gap-2"><Download size={14} /> Download TXT</span>
                  <span className="text-[11px] uppercase tracking-wide text-slate-400">TXT</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 transition hover:border-emerald-500/60 hover:text-emerald-100"
                >
                  <span className="flex items-center gap-2"><Printer size={14} /> Print / Save as PDF</span>
                  <span className="text-[11px] uppercase tracking-wide text-slate-400">Ctrl+P</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-1 rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2 text-sm text-slate-200 transition hover:border-slate-500"
                >
                  Close
                </button>
                <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3 text-xs text-slate-400">
                  <p>Formal memo ready for District Collector / NDRF circulation. Use Print for PDF export.</p>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 border-t border-slate-800 bg-slate-900/80 px-5 py-2 text-xs text-slate-400">
              For immediate administrative distribution • SARVADA War-Room Dashboard
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

SitrepModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}
