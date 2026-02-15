import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'

const COORDS = { lat: 19.9392, lon: 73.5307 }
const TEN_MINUTES_MS = 10 * 60 * 1000
const FALLBACK_RAIN_MMHR = 4.2 // Historical monsoon average for fallback

const buildPredictedInflow = (rainMmHr) => rainMmHr * 1200 * 0.6 // cusecs

const buildFallbackData = (reason = 'missing-api-key') => {
  const hourly = Array.from({ length: 6 }, (_, i) => ({
    time: `+${i + 1}h`,
    rainMmHr: Math.max(0, FALLBACK_RAIN_MMHR - i * 0.3),
  }))

  return {
    currentRainfall: FALLBACK_RAIN_MMHR,
    predictedInflow: buildPredictedInflow(FALLBACK_RAIN_MMHR),
    hourlyForecast: hourly,
    description: 'Historical monsoon average (fallback)',
    temp: null,
    isFallback: true,
    reason,
    updatedAt: new Date().toISOString(),
  }
}

export function useCatchmentData(refreshMs = TEN_MINUTES_MS) {
  const [data, setData] = useState(() => buildFallbackData('initializing'))
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true
    const apiKey = import.meta.env.VITE_OPENWEATHER_KEY

    const fetchData = async () => {
      if (!apiKey) {
        console.warn('[useCatchmentData] Missing VITE_OPENWEATHER_KEY; using fallback averages')
        if (isMounted) {
          setData(buildFallbackData('missing-api-key'))
          setIsLoading(false)
          setError(new Error('Missing VITE_OPENWEATHER_KEY'))
        }
        return
      }

      try {
        setIsLoading(true)
        const params = {
          lat: COORDS.lat,
          lon: COORDS.lon,
          appid: apiKey,
          units: 'metric',
        }

        const [currentRes, forecastRes] = await Promise.all([
          axios.get('https://api.openweathermap.org/data/2.5/weather', { params }),
          axios.get('https://api.openweathermap.org/data/2.5/forecast', { params }),
        ])

        const current = currentRes.data
        const forecast = forecastRes.data

        const rain1h = current?.rain?.['1h'] ?? 0
        const description = current?.weather?.[0]?.description ?? 'No description'
        const temp = current?.main?.temp ?? null

        const hourlyForecast = (forecast?.list ?? []).slice(0, 6).map((entry) => {
          const rain3h = entry?.rain?.['3h'] ?? 0
          const rainMmHr = rain3h / 3 // convert 3h accumulation to mm/hr
          return {
            time: entry?.dt_txt ?? 'N/A',
            rainMmHr,
          }
        })

        if (!isMounted) return

        setData({
          currentRainfall: rain1h,
          predictedInflow: buildPredictedInflow(rain1h),
          hourlyForecast,
          description,
          temp,
          isFallback: false,
          updatedAt: new Date().toISOString(),
        })
        setError(null)
      } catch (err) {
        console.error('[useCatchmentData] Fetch failed, using fallback', err)
        if (!isMounted) return
        setData(buildFallbackData('request-failed'))
        setError(err)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchData()
    const interval = setInterval(fetchData, refreshMs)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [refreshMs])

  return useMemo(
    () => ({
      data,
      isLoading,
      error,
    }),
    [data, isLoading, error],
  )
}

export default useCatchmentData
