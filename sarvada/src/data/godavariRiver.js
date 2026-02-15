/**
 * Godavari River Channel Path for Nashik Region
 * Defines the river centerline and flow direction for realistic flood simulation
 */

/**
 * Accurate Godavari River Path through Nashik
 * Traced to match actual river course through the city
 * Passes near Ram Kund, ghats, and major landmarks
 */
export const GODAVARI_RIVER_PATH = [
  // Gangapur Dam (upstream)
  [73.72, 20.01],
  // Flows southeast approaching city
  [73.74, 20.005],
  [73.76, 20.000],
  // Approaches western edge of Nashik
  [73.775, 19.996],
  // Flows through Nashik near sacred sites
  [73.785, 19.994],
  // Ram Kund and Panchvati area
  [73.7895, 19.9975],
  // Nashik ghats and bridges
  [73.805, 19.9965],
  // Bends and continues east
  [73.82, 19.995],
  [73.85, 19.993],
  // Downstream
  [73.88, 19.991],
  [73.92, 19.989],
]

/**
 * River channel properties
 */
export const RIVER_PROPERTIES = {
  // Normal river width in meters
  normalWidth: 150,
  // Maximum flood width in meters
  maxFloodWidth: 1200,
  // River bed elevation (MSL in meters)
  riverbedElevation: 585,
  // Flow direction (west to east)
  flowDirection: 'downstream',
}

/**
 * Calculate river polygon based on water level
 * @param {number} waterLevel - Current water surface elevation (MSL)
 * @returns {Array} Array of coordinates forming the river polygon
 */
export function getRiverPolygon(waterLevel) {
  const depth = Math.max(0, waterLevel - RIVER_PROPERTIES.riverbedElevation)
  
  // Calculate width based on depth (exponential growth)
  // At normal flow: ~150m, at flood: up to 1200m
  const widthFactor = Math.min(1, depth / 15) // Normalize to 0-1
  const riverWidth = 
    RIVER_PROPERTIES.normalWidth + 
    (RIVER_PROPERTIES.maxFloodWidth - RIVER_PROPERTIES.normalWidth) * 
    Math.pow(widthFactor, 1.5)
  
  // Convert width from meters to degrees (approximate)
  const widthInDegrees = riverWidth / 111000 // 1 degree ≈ 111km
  
  // Create river banks (left and right)
  const leftBank = []
  const rightBank = []
  
  for (let i = 0; i < GODAVARI_RIVER_PATH.length; i++) {
    const [lon, lat] = GODAVARI_RIVER_PATH[i]
    
    // Calculate perpendicular direction
    let perpLon, perpLat
    if (i < GODAVARI_RIVER_PATH.length - 1) {
      const [nextLon, nextLat] = GODAVARI_RIVER_PATH[i + 1]
      const dx = nextLon - lon
      const dy = nextLat - lat
      const length = Math.sqrt(dx * dx + dy * dy)
      // Perpendicular vector (rotated 90 degrees)
      perpLon = -dy / length
      perpLat = dx / length
    } else {
      // Use previous segment's direction for last point
      const [prevLon, prevLat] = GODAVARI_RIVER_PATH[i - 1]
      const dx = lon - prevLon
      const dy = lat - prevLat
      const length = Math.sqrt(dx * dx + dy * dy)
      perpLon = -dy / length
      perpLat = dx / length
    }
    
    // Add points to banks
    leftBank.push([
      lon + perpLon * widthInDegrees / 2,
      lat + perpLat * widthInDegrees / 2,
    ])
    rightBank.push([
      lon - perpLon * widthInDegrees / 2,
      lat - perpLat * widthInDegrees / 2,
    ])
  }
  
  // Create closed polygon: left bank + reversed right bank
  return [...leftBank, ...rightBank.reverse(), leftBank[0]]
}

/**
 * Get flood extent zones (areas that will flood at different water levels)
 * @param {number} waterLevel - Current water surface elevation (MSL)
 * @returns {Array} Array of flood zones with risk levels
 */
export function getFloodZones(waterLevel) {
  const zones = []
  const depth = Math.max(0, waterLevel - RIVER_PROPERTIES.riverbedElevation)
  
  // Create concentric flood zones
  const zoneCount = 5
  for (let i = 0; i < zoneCount; i++) {
    const zoneFactor = (i + 1) / zoneCount
    const zoneDepth = depth * zoneFactor
    const zoneLevel = RIVER_PROPERTIES.riverbedElevation + zoneDepth
    
    zones.push({
      level: zoneLevel,
      polygon: getRiverPolygon(zoneLevel),
      color: interpolateFloodColor(zoneFactor),
      opacity: 0.3 + zoneFactor * 0.4,
    })
  }
  
  return zones
}

/**
 * Interpolate color based on flood severity
 */
function interpolateFloodColor(factor) {
  // Green -> Yellow -> Orange -> Red
  if (factor < 0.25) return '#10b981' // Emerald
  if (factor < 0.5) return '#3b82f6' // Blue
  if (factor < 0.75) return '#f59e0b' // Amber
  return '#ef4444' // Red
}
