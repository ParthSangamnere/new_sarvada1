import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useFloodRisk } from '../state/FloodRiskContext'
import { NASHIK_TOPOGRAPHY } from '../data/nashikTopography'

/**
 * MapContainer initializes and manages a Mapbox GL instance for 3D visualization
 * with real-world topographic inundation simulation.
 */
export default function MapContainer() {
  const mapContainer = useRef(null)
  const mapInstance = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { waterSurfaceElevation, floodImpacts } = useFloodRisk()

  useEffect(() => {
    // Validate and set the Mapbox access token
    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
    if (!token) {
      const errorMsg = 'Missing VITE_MAPBOX_ACCESS_TOKEN in environment variables'
      setError(errorMsg)
      console.error(errorMsg)
      setIsLoading(false)
      return
    }

    mapboxgl.accessToken = token

    // Prevent re-initialization if map already exists
    if (mapInstance.current) {
      return
    }

    try {
      // Initialize map with Nashik coordinates and 3D perspective
      mapInstance.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [73.7898, 19.9975], // Nashik, India
        zoom: 13,
        pitch: 45, // 3D perspective
        bearing: 0,
        antialias: true,
      })

      // Resolve loading state when map is fully initialized
      mapInstance.current.on('load', () => {
        // Add terrain source for elevation-based query
        if (!mapInstance.current.getSource('mapbox-dem')) {
          mapInstance.current.addSource('mapbox-dem', {
            type: 'raster-dem',
            url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
            tileSize: 512,
          })
          mapInstance.current.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 })
        }

        // Add water layer for inundation visualization
        if (!mapInstance.current.getLayer('water-layer')) {
          mapInstance.current.addLayer({
            id: 'water-layer',
            type: 'fill-extrusion',
            source: {
              type: 'geojson',
              data: {
                type: 'FeatureCollection',
                features: NASHIK_TOPOGRAPHY.map((landmark) => ({
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: landmark.coordinates,
                  },
                  properties: {
                    name: landmark.name,
                    msl: landmark.msl,
                  },
                })),
              },
            },
            paint: {
              'fill-extrusion-color': '#38bdf8',
              'fill-extrusion-height': 50,
              'fill-extrusion-base': 0,
              'fill-extrusion-opacity': 0.6,
            },
          })
        }

        // Add flooded marker layer
        if (!mapInstance.current.getLayer('flooded-markers')) {
          mapInstance.current.addLayer({
            id: 'flooded-markers',
            type: 'circle',
            source: {
              type: 'geojson',
              data: {
                type: 'FeatureCollection',
                features: [],
              },
            },
            paint: {
              'circle-radius': 6,
              'circle-color': '#ec4844',
              'circle-opacity': 0.8,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff',
            },
          })
        }

        setIsLoading(false)
        console.log('Mapbox GL with terrain initialized successfully')
      })

      // Error handling
      mapInstance.current.on('error', (e) => {
        console.error('Mapbox error:', e)
        setError('Failed to load map. Check your API key and connectivity.')
      })
    } catch (err) {
      console.error('Failed to initialize Mapbox:', err)
      setError('Failed to initialize map instance')
      setIsLoading(false)
    }

    // Cleanup on unmount
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [])

  // Update inundation visualization when water elevation changes
  useEffect(() => {
    if (!mapInstance.current || !mapInstance.current.isStyleLoaded()) {
      return
    }

    const flooded = floodImpacts.filter((impact) => impact.isFlooded)

    // Update flooded markers
    const floodedGeoJSON = {
      type: 'FeatureCollection',
      features: flooded.map((impact) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: impact.landmark.coordinates,
        },
        properties: {
          name: impact.landmark.name,
          depth: impact.submergenceDepth,
          riskLevel: impact.riskLevel,
        },
      })),
    }

    const source = mapInstance.current.getSource('flooded-markers')
    if (source) {
      source.setData(floodedGeoJSON)
    }

    // Update water layer height based on WSE
    const RIVERBED = 585.0
    const waterHeight = Math.max(0, waterSurfaceElevation - RIVERBED)

    if (mapInstance.current.getLayer('water-layer')) {
      mapInstance.current.setPaintProperty('water-layer', 'fill-extrusion-height', waterHeight)
      mapInstance.current.setPaintProperty('water-layer', 'fill-extrusion-base', RIVERBED)
    }

    console.log(`WSE Updated: ${waterSurfaceElevation}m | Flooded Areas: ${flooded.length}`)
  }, [waterSurfaceElevation, floodImpacts])

  if (error) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-rose-500/40 bg-rose-500/10">
        <div className="text-center">
          <p className="text-sm font-semibold text-rose-200">Mapbox Configuration Error</p>
          <p className="mt-2 text-xs text-rose-100/80">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-slate-800/70 bg-slate-950">
      <div ref={mapContainer} className="h-full w-full" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-600 border-t-sky-400" />
            <p className="text-sm font-medium text-slate-300">Loading 3D Map...</p>
          </div>
        </div>
      )}
    </div>
  )
}
