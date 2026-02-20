import { useEffect, useRef, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import PropTypes from 'prop-types'
import { useFloodRisk } from '../state/FloodRiskContext'
import { NASHIK_TOPOGRAPHY } from '../data/nashikTopography'
import { getRiverPolygon, GODAVARI_RIVER_PATH, RIVER_PROPERTIES } from '../data/godavariRiver'
import { BRIDGES, SAFE_SHELTERS } from '../data/logisticsData'

// Simple haversine distance (km)
const haversineKm = (a, b) => {
  const toRad = (deg) => (deg * Math.PI) / 180
  const R = 6371
  const dLat = toRad(b[1] - a[1])
  const dLon = toRad(b[0] - a[0])
  const lat1 = toRad(a[1])
  const lat2 = toRad(b[1])
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

const findNearestShelter = (point) => {
  let best = SAFE_SHELTERS[0]
  let bestDist = Infinity
  SAFE_SHELTERS.forEach((s) => {
    const d = haversineKm(point, s.coordinates)
    if (d < bestDist) {
      bestDist = d
      best = s
    }
  })
  return best
}
/**
 * MapContainer initializes and manages a Mapbox GL instance for 3D visualization
 * with real-world topographic inundation simulation.
 */
export default function MapContainer({ mapStyle = 'satellite-streets-v12', enableControls = false }) {
  const mapContainer = useRef(null)
  const mapInstance = useRef(null)
  const sosMarkersRef = useRef([])
  const resizeObserver = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { waterSurfaceElevation, floodImpacts, citizenReports } = useFloodRisk()

  // Trigger map resize when container dimensions change
  const handleResize = useCallback(() => {
    if (mapInstance.current) {
      mapInstance.current.resize()
    }
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (!mapInstance.current || !e?.detail) return
      const { lng, lat, zoom = 16, pitch = 60, bearing = 0 } = e.detail
      mapInstance.current.flyTo({ center: [lng, lat], zoom, pitch, bearing, speed: 0.8 })
    }

    window.addEventListener('sos-flyto', handler)
    return () => window.removeEventListener('sos-flyto', handler)
  }, [])

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
        style: `mapbox://styles/mapbox/${mapStyle}`,
        center: [73.7900, 20.0060], // Nashik - centered on Godavari near Panchavati
        zoom: 13.5,
        pitch: 45, // 3D tilt - user can adjust with right-click drag
        bearing: 0, // Start facing north - user can rotate
        antialias: true,
        dragRotate: true, // Enable rotation with right-click or Ctrl+drag
        touchPitch: true, // Enable pitch on touch devices
      })

      // Add navigation controls if enabled (zoom, compass, pitch, rotate)
      if (enableControls) {
        mapInstance.current.addControl(new mapboxgl.NavigationControl({
          showCompass: true,
          showZoom: true,
          visualizePitch: true,
        }), 'top-right')
        
        // Add fullscreen control
        mapInstance.current.addControl(new mapboxgl.FullscreenControl(), 'top-right')
        
        // Add scale control
        mapInstance.current.addControl(new mapboxgl.ScaleControl({
          maxWidth: 100,
          unit: 'metric',
        }), 'bottom-left')
      }

      // Resolve loading state when map is fully initialized
      mapInstance.current.on('load', () => {
        // Force a resize to ensure the canvas matches the container
        mapInstance.current.resize()

        // Add terrain source for elevation-based query
        if (!mapInstance.current.getSource('mapbox-dem')) {
          mapInstance.current.addSource('mapbox-dem', {
            type: 'raster-dem',
            url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
            tileSize: 512,
          })
          mapInstance.current.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 })
        }

        // Add river-based water layer - follows Godavari channel
        if (!mapInstance.current.getLayer('river-water')) {
          // Initialize river polygon at normal level using turf.buffer
          const initialFeature = getRiverPolygon(RIVER_PROPERTIES.riverbedElevation)
          
          mapInstance.current.addSource('river-water', {
            type: 'geojson',
            data: initialFeature,
          })

          // Main river water fill
          mapInstance.current.addLayer({
            id: 'river-water',
            type: 'fill',
            source: 'river-water',
            paint: {
              'fill-color': '#06b6d4', // Cyan water color
              'fill-opacity': 0.7,
            },
          })

          // River glow outline
          mapInstance.current.addLayer({
            id: 'river-glow',
            type: 'line',
            source: 'river-water',
            paint: {
              'line-color': '#22d3ee',
              'line-width': 4,
              'line-opacity': 0.8,
              'line-blur': 6,
            },
          })

          // Add river centerline for reference
          mapInstance.current.addSource('river-centerline', {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: GODAVARI_RIVER_PATH,
              },
            },
          })

          mapInstance.current.addLayer({
            id: 'river-centerline',
            type: 'line',
            source: 'river-centerline',
            paint: {
              'line-color': '#0891b2',
              'line-width': 2,
              'line-opacity': 0.4,
              'line-dasharray': [3, 3],
            },
          })

          // Animated ripples at dam source
          const damLocation = {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: GODAVARI_RIVER_PATH[0], // Dam / upstream start of trace
            },
            properties: {
              name: 'Gangapur Dam - Water Source',
              type: 'dam',
            },
          }

          mapInstance.current.addSource('dam-source', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [damLocation],
            },
          })

          // Pulsing dam marker
          mapInstance.current.addLayer({
            id: 'dam-pulse',
            type: 'circle',
            source: 'dam-source',
            paint: {
              'circle-radius': 20,
              'circle-color': '#06b6d4',
              'circle-opacity': 0.4,
              'circle-blur': 1,
            },
          })

          mapInstance.current.addLayer({
            id: 'dam-marker',
            type: 'circle',
            source: 'dam-source',
            paint: {
              'circle-radius': 12,
              'circle-color': '#0891b2',
              'circle-opacity': 0.9,
              'circle-stroke-width': 3,
              'circle-stroke-color': '#ffffff',
            },
          })
        }

        // Add landmark risk zones (circles around landmarks showing proximity to water)
        if (!mapInstance.current.getLayer('risk-zones')) {
          mapInstance.current.addSource('risk-zones', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: NASHIK_TOPOGRAPHY.map(landmark => ({
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: landmark.coordinates,
                },
                properties: {
                  name: landmark.name,
                  msl: landmark.msl,
                  riskFactor: landmark.risk_factor,
                  category: landmark.category,
                },
              })),
            },
          })

          // Add circles showing risk zones with gradient glow
          mapInstance.current.addLayer({
            id: 'risk-zones',
            type: 'circle',
            source: 'risk-zones',
            paint: {
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['get', 'riskFactor'],
                0, 10,
                1, 18,
              ],
              'circle-color': [
                'interpolate',
                ['linear'],
                ['get', 'riskFactor'],
                0, '#10b981',    // Emerald - safe
                0.3, '#3b82f6',  // Blue - low risk
                0.6, '#f59e0b',  // Amber - moderate risk
                0.8, '#f97316',  // Orange - high risk
                1.0, '#ef4444',  // Red - critical risk
              ],
              'circle-opacity': 0.75,
              'circle-stroke-width': 3,
              'circle-stroke-color': '#ffffff',
              'circle-stroke-opacity': 0.9,
              'circle-blur': 0.3,
            },
          })

          // Add outer glow ring for landmarks
          mapInstance.current.addLayer({
            id: 'risk-zones-glow',
            type: 'circle',
            source: 'risk-zones',
            paint: {
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['get', 'riskFactor'],
                0, 16,
                1, 26,
              ],
              'circle-color': [
                'interpolate',
                ['linear'],
                ['get', 'riskFactor'],
                0, '#10b981',
                0.3, '#3b82f6',
                0.6, '#f59e0b',
                0.8, '#f97316',
                1.0, '#ef4444',
              ],
              'circle-opacity': 0.2,
              'circle-blur': 1.5,
            },
          })

          // Add labels for landmarks
          mapInstance.current.addLayer({
            id: 'landmark-labels',
            type: 'symbol',
            source: 'risk-zones',
            layout: {
              'text-field': ['get', 'name'],
              'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
              'text-size': 11,
              'text-offset': [0, 1.5],
              'text-anchor': 'top',
            },
            paint: {
              'text-color': '#ffffff',
              'text-halo-color': '#000000',
              'text-halo-width': 2,
              'text-halo-blur': 1,
            },
          })
        }

        // Add flooded marker layer with pulsing effect
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
              'circle-radius': 12,
              'circle-color': '#ef4444',
              'circle-opacity': 0.95,
              'circle-stroke-width': 4,
              'circle-stroke-color': '#ffffff',
              'circle-stroke-opacity': 1,
            },
          })

          // Add outer pulse ring for flooded areas
          mapInstance.current.addLayer({
            id: 'flooded-markers-pulse',
            type: 'circle',
            source: {
              type: 'geojson',
              data: {
                type: 'FeatureCollection',
                features: [],
              },
            },
            paint: {
              'circle-radius': 20,
              'circle-color': '#ef4444',
              'circle-opacity': 0.3,
              'circle-blur': 1,
            },
          })
        }

        // Bridges status layer
        if (!mapInstance.current.getSource('bridges-status')) {
          mapInstance.current.addSource('bridges-status', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [] },
          })

          mapInstance.current.addLayer({
            id: 'bridges-status',
            type: 'circle',
            source: 'bridges-status',
            paint: {
              'circle-radius': 8,
              'circle-color': [
                'match',
                ['get', 'status'],
                'CLOSED', '#f43f5e',
                'DANGER', '#f59e0b',
                /* default */ '#10b981',
              ],
              'circle-stroke-width': 2,
              'circle-stroke-color': '#0f172a',
              'circle-opacity': 0.9,
            },
          })
        }

        // Shelter routes layer
        if (!mapInstance.current.getSource('shelter-routes')) {
          mapInstance.current.addSource('shelter-routes', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [] },
          })

          mapInstance.current.addLayer({
            id: 'shelter-routes',
            type: 'line',
            source: 'shelter-routes',
            paint: {
              'line-color': '#22c55e',
              'line-width': 3,
              'line-opacity': 0.9,
              'line-blur': 0.5,
            },
          })
        }


        // Add click interactions for landmarks
        mapInstance.current.on('click', 'risk-zones', (e) => {
          if (e.features.length > 0) {
            const feature = e.features[0]
            const coordinates = feature.geometry.coordinates.slice()
            const { name, msl, riskFactor, category } = feature.properties

            // Create popup with landmark information
            new mapboxgl.Popup({ closeButton: true, closeOnClick: true })
              .setLngLat(coordinates)
              .setHTML(`
                <div style="padding: 8px; min-width: 200px;">
                  <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1e293b;">${name}</h3>
                  <div style="font-size: 12px; color: #475569; line-height: 1.6;">
                    <p style="margin: 4px 0;"><strong>Elevation:</strong> ${msl}m MSL</p>
                    <p style="margin: 4px 0;"><strong>Category:</strong> ${category}</p>
                    <p style="margin: 4px 0;"><strong>Risk Level:</strong> ${(riskFactor * 100).toFixed(0)}%</p>
                    <p style="margin: 4px 0;"><strong>Status:</strong> 
                      <span style="color: ${riskFactor > 0.7 ? '#ef4444' : riskFactor > 0.4 ? '#f59e0b' : '#10b981'};">
                        ${riskFactor > 0.7 ? 'High Risk' : riskFactor > 0.4 ? 'Moderate' : 'Safe'}
                      </span>
                    </p>
                  </div>
                </div>
              `)
              .addTo(mapInstance.current)
          }
        })

        // Change cursor on hover
        mapInstance.current.on('mouseenter', 'risk-zones', () => {
          mapInstance.current.getCanvas().style.cursor = 'pointer'
        })
        mapInstance.current.on('mouseleave', 'risk-zones', () => {
          mapInstance.current.getCanvas().style.cursor = ''
        })

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
      if (resizeObserver.current) {
        resizeObserver.current.disconnect()
        resizeObserver.current = null
      }
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [mapStyle])

  // Observe container resize to keep map in sync with layout changes
  useEffect(() => {
    const container = mapContainer.current
    if (!container) return

    resizeObserver.current = new ResizeObserver(() => {
      handleResize()
    })
    resizeObserver.current.observe(container)

    return () => {
      if (resizeObserver.current) {
        resizeObserver.current.disconnect()
      }
    }
  }, [handleResize])

  // Update inundation visualization when water elevation changes
  useEffect(() => {
    if (!mapInstance.current || !mapInstance.current.isStyleLoaded()) {
      return
    }

    const flooded = floodImpacts.filter((impact) => impact.isFlooded)

    // Update bridge status markers
    const bridgeFeatures = BRIDGES.map((b) => {
      const status = waterSurfaceElevation > b.msl ? 'CLOSED' : b.msl - waterSurfaceElevation <= 0.5 ? 'DANGER' : 'OPEN'
      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: b.coordinates },
        properties: { id: b.id, name: b.name, status, msl: b.msl },
      }
    })

    const bridgeSource = mapInstance.current.getSource('bridges-status')
    if (bridgeSource) {
      bridgeSource.setData({ type: 'FeatureCollection', features: bridgeFeatures })
    }

    // Update shelter routes for flooded landmarks
    const routeFeatures = flooded.map((impact) => {
      const shelter = findNearestShelter(impact.landmark.coordinates)
      return {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [impact.landmark.coordinates, shelter.coordinates],
        },
        properties: {
          landmark: impact.landmark.name,
          shelter: shelter.name,
          depth: impact.submergenceDepth,
        },
      }
    })

    const routeSource = mapInstance.current.getSource('shelter-routes')
    if (routeSource) {
      routeSource.setData({ type: 'FeatureCollection', features: routeFeatures })
    }

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

    // Update pulse layer too
    const pulseSource = mapInstance.current.getSource('flooded-markers-pulse')
    if (pulseSource) {
      pulseSource.setData(floodedGeoJSON)
    }

    // Update water visualization based on WSE - River expansion method
    const RIVERBED = RIVER_PROPERTIES.riverbedElevation
    const waterHeight = waterSurfaceElevation
    const heightAboveRiverbed = Math.max(0, waterHeight - RIVERBED)

    // Update river-based water simulation
    const riverSource = mapInstance.current.getSource('river-water')
    if (riverSource) {
      // Get new river GeoJSON Feature based on current water level (turf.buffer)
      const updatedFeature = getRiverPolygon(waterHeight)
      riverSource.setData(updatedFeature)

      // Change water color based on danger level
      let waterColor = '#06b6d4' // Normal cyan
      let glowColor = '#22d3ee'
      let opacity = 0.7

      if (heightAboveRiverbed > 15) {
        waterColor = '#ef4444' // Red for critical
        glowColor = '#f87171'
        opacity = 0.85
      } else if (heightAboveRiverbed > 10) {
        waterColor = '#f59e0b' // Amber for warning
        glowColor = '#fb923c'
        opacity = 0.8
      } else if (heightAboveRiverbed > 5) {
        waterColor = '#3b82f6' // Blue for moderate
        glowColor = '#60a5fa'
        opacity = 0.75
      }

      if (mapInstance.current.getLayer('river-water')) {
        mapInstance.current.setPaintProperty('river-water', 'fill-color', waterColor)
        mapInstance.current.setPaintProperty('river-water', 'fill-opacity', opacity)
      }

      if (mapInstance.current.getLayer('river-glow')) {
        mapInstance.current.setPaintProperty('river-glow', 'line-color', glowColor)
        const glowWidth = 4 + (heightAboveRiverbed * 0.5)
        mapInstance.current.setPaintProperty('river-glow', 'line-width', Math.min(glowWidth, 12))
      }

      // Update dam pulse based on discharge
      if (mapInstance.current.getLayer('dam-pulse')) {
        // Larger pulse = more discharge
        const pulseSize = 20 + (heightAboveRiverbed * 3)
        mapInstance.current.setPaintProperty('dam-pulse', 'circle-radius', pulseSize)
        mapInstance.current.setPaintProperty('dam-pulse', 'circle-color', waterColor)
      }
    }

    // Update risk zone colors based on current flood status
    if (mapInstance.current.getLayer('risk-zones')) {
      const floodedIds = new Set(flooded.map(f => f.landmark.id))
      
      // Update circle colors to show flooded areas differently
      mapInstance.current.setPaintProperty('risk-zones', 'circle-color', [
        'case',
        ['in', ['get', 'name'], ['literal', flooded.map(f => f.landmark.name)]],
        '#ef4444', // Red for flooded
        [
          'interpolate',
          ['linear'],
          ['get', 'riskFactor'],
          0, '#10b981',    // Green - safe
          0.3, '#3b82f6',  // Blue - low risk
          0.6, '#f59e0b',  // Amber - moderate risk
          0.8, '#f97316',  // Orange - high risk
          1.0, '#ff6b6b',  // Light red - critical risk
        ],
      ])
    }

    // Render citizen SOS markers as HTML with neon pulses
    sosMarkersRef.current.forEach((marker) => marker.remove())
    sosMarkersRef.current = []

    const sosData = (citizenReports ?? []).map((report) => ({
      ...report,
      verified: waterSurfaceElevation > report.groundMsl,
    }))

    sosData.forEach((report) => {
      const el = document.createElement('div')
      el.className = 'sos-marker'
      if (report.verified) el.classList.add('verified')
      if (report.status === 'enroute') el.classList.add('enroute')
      if (report.status === 'resolved') el.classList.add('resolved')
      el.title = `${report.name} • ${report.status.toUpperCase()}${report.verified ? ' • VERIFIED' : ''}`

      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([report.lng, report.lat])
        .addTo(mapInstance.current)

      sosMarkersRef.current.push(marker)
    })

    console.log(`WSE Updated: ${waterSurfaceElevation}m MSL | Height: ${heightAboveRiverbed.toFixed(1)}m | Flooded Areas: ${flooded.length}`)
  }, [waterSurfaceElevation, floodImpacts, citizenReports])

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
    <div className="relative w-full h-full min-h-[420px] overflow-hidden rounded-xl border border-slate-800/70 bg-slate-950">
      <div ref={mapContainer} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
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

MapContainer.propTypes = {
  mapStyle: PropTypes.string,
  enableControls: PropTypes.bool,
}
