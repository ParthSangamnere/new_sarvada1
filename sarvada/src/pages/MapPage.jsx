import { motion } from 'framer-motion'
import { RotateCcw, ZoomIn, ZoomOut, Compass, Eye, Layers } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import MapContainer from '../components/MapContainer'
import { useFloodRisk } from '../state/FloodRiskContext'

/**
 * Full-screen interactive Map Page with controls
 */
export default function MapPage() {
  const { waterSurfaceElevation, floodImpacts } = useFloodRisk()
  const [showControls, setShowControls] = useState(true)
  const [mapStyle, setMapStyle] = useState('satellite-streets-v12')
  const mapContainerRef = useRef(null)

  const flooded = floodImpacts.filter(i => i.isFlooded)
  const critical = floodImpacts.filter(i => i.riskLevel === 'critical')

  const mapStyles = [
    { id: 'satellite-streets-v12', label: 'Satellite', icon: '🛰️' },
    { id: 'streets-v12', label: 'Streets', icon: '🗺️' },
    { id: 'outdoors-v12', label: 'Terrain', icon: '⛰️' },
    { id: 'light-v11', label: 'Light', icon: '☀️' },
    { id: 'dark-v11', label: 'Dark', icon: '🌙' },
  ]

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Map Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-shrink-0 items-start justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Interactive Flood Map</h2>
          <p className="text-sm text-slate-400">3D visualization of Godavari inundation zones</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-sky-700/40 bg-sky-900/20 px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-sky-400"></div>
              <span className="text-xs font-semibold text-sky-300">WSE: {waterSurfaceElevation.toFixed(1)}m MSL</span>
            </div>
          </div>
          
          {flooded.length > 0 && (
            <div className="rounded-lg border border-rose-700/40 bg-rose-900/20 px-3 py-2">
              <span className="text-xs font-semibold text-rose-300">{flooded.length} Areas Flooded</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Map Container with Controls */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="relative flex-1 overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950"
      >
        {/* Map */}
        <MapContainer mapStyle={mapStyle} enableControls={true} />

        {/* Map Style Selector */}
        <div className="absolute left-4 top-4 flex flex-col gap-2 rounded-xl border border-slate-800/70 bg-slate-900/90 p-2 backdrop-blur-md">
          <div className="flex items-center gap-2 border-b border-slate-700/50 pb-2">
            <Layers size={16} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-300">Map Style</span>
          </div>
          {mapStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => setMapStyle(style.id)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all ${
                mapStyle === style.id
                  ? 'bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/50'
                  : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
              }`}
            >
              <span>{style.icon}</span>
              <span className="font-medium">{style.label}</span>
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 rounded-xl border border-slate-800/70 bg-slate-900/90 p-4 backdrop-blur-md">
          <div className="mb-3 flex items-center gap-2">
            <Eye size={16} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-300">Legend</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-sky-400"></div>
              <span className="text-xs text-slate-300">Water Level</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-rose-500"></div>
              <span className="text-xs text-slate-300">Flooded Area</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-500"></div>
              <span className="text-xs text-slate-300">High Risk Zone</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
              <span className="text-xs text-slate-300">Safe Zone</span>
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="absolute right-4 top-4 w-64 rounded-xl border border-slate-800/70 bg-slate-900/90 p-4 backdrop-blur-md">
          <h3 className="mb-3 text-sm font-semibold text-slate-100">Flood Impact Summary</h3>
          <div className="space-y-3">
            <div className="rounded-lg border border-slate-800/50 bg-slate-950/40 p-2">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">Total Landmarks</p>
              <p className="text-xl font-bold text-slate-200">{floodImpacts.length}</p>
            </div>
            <div className="rounded-lg border border-rose-800/50 bg-rose-950/40 p-2">
              <p className="text-[10px] uppercase tracking-wide text-rose-400">Currently Flooded</p>
              <p className="text-xl font-bold text-rose-300">{flooded.length}</p>
            </div>
            <div className="rounded-lg border border-amber-800/50 bg-amber-950/40 p-2">
              <p className="text-[10px] uppercase tracking-wide text-amber-400">Critical Risk</p>
              <p className="text-xl font-bold text-amber-300">{critical.length}</p>
            </div>
          </div>

          {/* Flooded Locations List */}
          {flooded.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold text-slate-300">Affected Areas:</p>
              <div className="max-h-32 space-y-1 overflow-y-auto pr-1">
                {flooded.map((impact) => (
                  <div
                    key={impact.landmark.id}
                    className="rounded border border-rose-800/30 bg-rose-950/20 px-2 py-1 text-[10px] text-rose-200"
                  >
                    <p className="font-medium">{impact.landmark.name}</p>
                    <p className="text-rose-300/70">{impact.submergenceDepth.toFixed(1)}m deep</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="absolute bottom-4 right-4 rounded-lg border border-slate-800/70 bg-slate-900/90 px-4 py-2 backdrop-blur-md">
          <p className="text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Tip:</span> Use mouse to rotate • Scroll to zoom • Right-click drag to tilt
          </p>
        </div>
      </motion.div>
    </div>
  )
}
