/**
 * Godavari River Channel Path for Nashik Region
 * Centerline manually traced on geojson.io over satellite imagery.
 * Loaded from godavariTrace.json (GeoJSON FeatureCollection with LineString features).
 * Format: [longitude, latitude] — Mapbox convention.
 */
import * as turf from '@turf/turf'
import traceData from './godavariTrace.json'

/**
 * Build a single continuous coordinate array from all LineString features
 * in the hand-traced GeoJSON file.
 */
const _buildPath = () => {
  const coords = []
  for (const feature of traceData.features) {
    if (feature.geometry?.type === 'LineString') {
      coords.push(...feature.geometry.coordinates)
    }
  }
  return coords
}

/** Full hand-traced Godavari River centerline through Nashik */
export const GODAVARI_RIVER_PATH = _buildPath()

/**
 * River channel properties
 */
export const RIVER_PROPERTIES = {
  /** Normal river width in meters */
  normalWidth: 80,
  /** Maximum flood width in meters */
  maxFloodWidth: 1200,
  /** River bed elevation (MSL in meters) */
  riverbedElevation: 585,
  /** Flow direction */
  flowDirection: 'downstream',
}

/**
 * Create a GeoJSON LineString Feature from the river centerline.
 */
export function getRiverLineString() {
  return turf.lineString(GODAVARI_RIVER_PATH)
}

/**
 * Calculate river polygon using Turf.js buffer.
 * Produces a smooth, geographically-accurate polygon that follows
 * every bend of the centerline.
 *
 * @param {number} waterLevel - Current Water Surface Elevation (MSL)
 * @returns {object} GeoJSON Feature (Polygon or MultiPolygon)
 */
export function getRiverPolygon(waterLevel) {
  const depth = Math.max(0, waterLevel - RIVER_PROPERTIES.riverbedElevation)

  // Width scales with depth: thin at normal flow, wide at flood
  const widthFactor = Math.min(1, depth / 15) // 0→1 over 15 m depth
  const halfWidthMeters =
    (RIVER_PROPERTIES.normalWidth +
      (RIVER_PROPERTIES.maxFloodWidth - RIVER_PROPERTIES.normalWidth) *
        Math.pow(widthFactor, 1.5)) /
    2

  // Turf buffer takes radius in km
  const radiusKm = halfWidthMeters / 1000

  const line = getRiverLineString()
  const buffered = turf.buffer(line, radiusKm, { units: 'kilometers', steps: 16 })

  return buffered
}

/**
 * Get flood extent zones (concentric bands for visual layering)
 * @param {number} waterLevel - Current WSE (MSL)
 * @returns {Array<{level: number, feature: object, color: string, opacity: number}>}
 */
export function getFloodZones(waterLevel) {
  const zones = []
  const depth = Math.max(0, waterLevel - RIVER_PROPERTIES.riverbedElevation)

  const zoneCount = 5
  for (let i = 0; i < zoneCount; i++) {
    const zoneFactor = (i + 1) / zoneCount
    const zoneDepth = depth * zoneFactor
    const zoneLevel = RIVER_PROPERTIES.riverbedElevation + zoneDepth

    zones.push({
      level: zoneLevel,
      feature: getRiverPolygon(zoneLevel),
      color: interpolateFloodColor(zoneFactor),
      opacity: 0.3 + zoneFactor * 0.4,
    })
  }
  return zones
}

/** Interpolate color by severity factor 0→1 */
function interpolateFloodColor(factor) {
  if (factor < 0.25) return '#10b981'
  if (factor < 0.5) return '#3b82f6'
  if (factor < 0.75) return '#f59e0b'
  return '#ef4444'
}
