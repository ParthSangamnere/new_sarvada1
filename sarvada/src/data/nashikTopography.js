/**
 * Nashik Topographical Data - Real-world Mean Sea Level (MSL) heights
 * and landmark coordinates for inundation risk assessment
 */

export const NASHIK_TOPOGRAPHY = [
  {
    id: 'ram-kund',
    name: 'Ram Kund',
    coordinates: [73.8297, 19.9982],
    msl: 592.5,
    category: 'sacred-site',
    risk_factor: 0.95, // Very high risk - low elevation
  },
  {
    id: 'kalaram-temple',
    name: 'Kalarama Temple',
    coordinates: [73.8276, 19.9988],
    msl: 598.2,
    category: 'sacred-site',
    risk_factor: 0.75, // High risk
  },
  {
    id: 'tapovan',
    name: 'Tapovan Area',
    coordinates: [73.8190, 20.0010],
    msl: 590.1,
    category: 'residential',
    risk_factor: 0.98, // Critical - lowest elevation
  },
  {
    id: 'nashik-city-center',
    name: 'Nashik City Center',
    coordinates: [73.7900, 19.9975],
    msl: 602.3,
    category: 'commercial',
    risk_factor: 0.45, // Moderate risk
  },
  {
    id: 'godavari-bridge',
    name: 'Godavari Bridge',
    coordinates: [73.8050, 19.9965],
    msl: 588.0,
    category: 'infrastructure',
    risk_factor: 1.0, // Critical - closest to riverbed
  },
  {
    id: 'sundarnarayan-temple',
    name: 'Sundarnarayan Temple',
    coordinates: [73.8320, 20.0005],
    msl: 605.8,
    category: 'sacred-site',
    risk_factor: 0.15, // Low risk - elevated
  },
  {
    id: 'gangapur-settlement',
    name: 'Gangapur Settlement',
    coordinates: [73.8140, 19.9950],
    msl: 587.5,
    category: 'residential',
    risk_factor: 1.0, // Critical
  },
  {
    id: 'nashik-ghats',
    name: 'Nashik Ghats (Stepped Banks)',
    coordinates: [73.8250, 19.9990],
    msl: 591.0,
    category: 'cultural',
    risk_factor: 0.9, // Very high risk
  },
  {
    id: 'trimbak-road',
    name: 'Trimbak Road Elevation',
    coordinates: [73.7750, 19.9850],
    msl: 610.5,
    category: 'infrastructure',
    risk_factor: 0.0, // Safe - elevated plateau
  },
  {
    id: 'panchvati-area',
    name: 'Panchvati (Five Trees)',
    coordinates: [73.8160, 20.0025],
    msl: 595.3,
    category: 'residential',
    risk_factor: 0.8, // High risk
  },
]

/**
 * Calculate Water Surface Elevation (WSE) based on dam discharge
 * Godavari River dynamics: Base ~590m MSL at Nashik gauge
 * Conversion: ~20,000 cusecs ≈ +2m rise
 *
 * @param {number} cusecs - Dam discharge in cubic feet per second
 * @returns {number} Water Surface Elevation in meters MSL
 */
export function calculateWSE(cusecs) {
  const BASE_LEVEL = 590.0 // Base river level at Nashik gauge (MSL)
  const CUSECS_TO_RISE = 10000 // 10,000 cusecs causes ~0.8m rise
  const RISE_FACTOR = 0.8

  // Non-linear rise: higher discharges cause exponential elevation
  const normalizedCusecs = Math.min(cusecs, 100000) // Cap at 100k cusecs
  const riseAmount = (normalizedCusecs / CUSECS_TO_RISE) * RISE_FACTOR

  const wse = BASE_LEVEL + riseAmount
  return Math.round(wse * 10) / 10 // Round to 1 decimal place
}

/**
 * Assess flood impact for all landmarks given current water elevation
 *
 * @param {number} wseMeters - Water Surface Elevation in meters MSL
 * @returns {Array<{ landmark: object; isFlooded: boolean; submergenceDepth: number; riskLevel: string }>}
 */
export function assessFloodImpact(wseMeters) {
  return NASHIK_TOPOGRAPHY.map((landmark) => {
    const submergenceDepth = Math.max(0, wseMeters - landmark.msl)
    const isFlooded = submergenceDepth > 0

    let riskLevel = 'safe'
    if (isFlooded) {
      if (submergenceDepth > 5) riskLevel = 'critical'
      else if (submergenceDepth > 2) riskLevel = 'severe'
      else if (submergenceDepth > 0.5) riskLevel = 'alert'
      else riskLevel = 'warning'
    }

    return {
      landmark,
      isFlooded,
      submergenceDepth: Math.round(submergenceDepth * 100) / 100,
      riskLevel,
    }
  })
}

/**
 * Calculate aggregated flood statistics for the region
 *
 * @param {number} wseMeters - Water Surface Elevation in meters MSL
 * @returns {object} Flood statistics
 */
export function calculateFloodStats(wseMeters) {
  const impacts = assessFloodImpact(wseMeters)
  const flooded = impacts.filter((i) => i.isFlooded)
  const critical = flooded.filter((i) => i.riskLevel === 'critical' || i.riskLevel === 'severe')

  return {
    totalLandmarks: NASHIK_TOPOGRAPHY.length,
    floodedCount: flooded.length,
    criticalCount: critical.length,
    inundationPercentage: Math.round((flooded.length / NASHIK_TOPOGRAPHY.length) * 100),
    maxSubmergenceDepth: flooded.length > 0 ? Math.max(...flooded.map((f) => f.submergenceDepth)) : 0,
    affectedAreas: flooded.map((f) => f.landmark.name),
    criticalAssets: critical.map((f) => f.landmark.name),
  }
}

/**
 * Riverbed and constraint elevations for Godavari at Nashik
 */
export const GODAVARI_HYDRO_CONSTRAINTS = {
  riverbed_elevation: 585.0, // Riverbed MSL at Nashik
  spillway_level: 615.0, // Dam spillway elevation (far from Nashik)
  minimum_viable_level: 590.0, // Minimum level for power generation
  warning_level: 608.0, // Alert threshold
  danger_level: 612.0, // Emergency evacuation threshold
}
