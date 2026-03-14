import React, { useState, useEffect, useMemo } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import ForecastChart from './Chart'
import StatsPanel from './StatsPanel'
import HorizonSlider from './HorizonSlider'

const JAN_START = new Date('2024-01-01T00:00:00Z')
const JAN_END = new Date('2024-01-31T23:59:59Z')

export default function Dashboard() {
  const [actuals, setActuals] = useState(null)
  const [forecasts, setForecasts] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [startDate, setStartDate] = useState(new Date('2024-01-01'))
  const [endDate, setEndDate] = useState(new Date('2024-01-07'))
  const [horizonHours, setHorizonHours] = useState(4)

  // Load data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [actualsResp, forecastsResp] = await Promise.all([
          fetch('/data/actuals.json'),
          fetch('/data/forecasts.json')
        ])
        if (!actualsResp.ok || !forecastsResp.ok) {
          throw new Error('Data files not found. Please run: npm run fetch-data')
        }
        const actualsData = await actualsResp.json()
        const forecastsData = await forecastsResp.json()
        setActuals(actualsData)
        setForecasts(forecastsData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Filter actuals by date range
  const filteredActuals = useMemo(() => {
    if (!actuals) return []
    const start = startDate.getTime()
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)
    const endTime = end.getTime()

    return actuals.filter(d => {
      const t = new Date(d.startTime).getTime()
      return t >= start && t <= endTime
    })
  }, [actuals, startDate, endDate])

  // For each target time in the filtered range, find the latest forecast
  // that was published at least `horizonHours` before the target time
  const filteredForecasts = useMemo(() => {
    if (!forecasts || filteredActuals.length === 0) return []

    // Get unique target times from actuals
    const targetTimes = filteredActuals.map(a => a.startTime)

    // Group forecasts by startTime for faster lookup
    const forecastsByTarget = {}
    for (const f of forecasts) {
      if (!forecastsByTarget[f.startTime]) {
        forecastsByTarget[f.startTime] = []
      }
      forecastsByTarget[f.startTime].push(f)
    }

    const result = []
    for (const targetTime of targetTimes) {
      const available = forecastsByTarget[targetTime]
      if (!available) continue

      const targetMs = new Date(targetTime).getTime()
      const horizonMs = horizonHours * 60 * 60 * 1000

      // Find forecasts published at least horizonHours before target
      const eligible = available.filter(f => {
        const publishMs = new Date(f.publishTime).getTime()
        return (targetMs - publishMs) >= horizonMs
      })

      if (eligible.length === 0) continue

      // Pick the latest published forecast among eligible ones
      eligible.sort((a, b) => new Date(b.publishTime) - new Date(a.publishTime))
      result.push({
        startTime: targetTime,
        generation: eligible[0].generation,
        publishTime: eligible[0].publishTime
      })
    }

    return result
  }, [forecasts, filteredActuals, horizonHours])

  // Compute stats
  const stats = useMemo(() => {
    if (filteredActuals.length === 0 || filteredForecasts.length === 0) {
      return { mae: 0, rmse: 0, mape: 0, dataPoints: 0 }
    }

    // Match by startTime
    const forecastMap = {}
    for (const f of filteredForecasts) {
      forecastMap[f.startTime] = f.generation
    }

    const errors = []
    const absPercentErrors = []

    for (const a of filteredActuals) {
      if (forecastMap[a.startTime] !== undefined) {
        const err = Math.abs(a.generation - forecastMap[a.startTime])
        errors.push(err)
        if (a.generation !== 0) {
          absPercentErrors.push((err / Math.abs(a.generation)) * 100)
        }
      }
    }

    if (errors.length === 0) return { mae: 0, rmse: 0, mape: 0, dataPoints: 0 }

    const mae = errors.reduce((s, e) => s + e, 0) / errors.length
    const rmse = Math.sqrt(errors.reduce((s, e) => s + e * e, 0) / errors.length)
    const mape = absPercentErrors.length > 0
      ? absPercentErrors.reduce((s, e) => s + e, 0) / absPercentErrors.length
      : 0

    return {
      mae: Math.round(mae),
      rmse: Math.round(rmse),
      mape: Math.round(mape * 10) / 10,
      dataPoints: errors.length
    }
  }, [filteredActuals, filteredForecasts])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p className="loading-text">Loading wind power data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <p className="error-title">Unable to Load Data</p>
        <p className="error-message">{error}</p>
        <button className="retry-button" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Controls */}
      <div className="controls-bar fade-in">
        <div className="glass-card">
          <div className="control-group">
            <label className="control-label" htmlFor="start-date">Start Date</label>
            <DatePicker
              id="start-date"
              selected={startDate}
              onChange={date => date && setStartDate(date)}
              onChangeRaw={e => e.preventDefault()}
              minDate={JAN_START}
              maxDate={endDate}
              dateFormat="dd MMM yyyy"
              className="date-input"
              calendarClassName="dark-calendar"
            />
          </div>
        </div>

        <div className="glass-card">
          <div className="control-group">
            <label className="control-label" htmlFor="end-date">End Date</label>
            <DatePicker
              id="end-date"
              selected={endDate}
              onChange={date => date && setEndDate(date)}
              onChangeRaw={e => e.preventDefault()}
              minDate={startDate}
              maxDate={JAN_END}
              dateFormat="dd MMM yyyy"
              className="date-input"
              calendarClassName="dark-calendar"
            />
          </div>
        </div>

        <div className="glass-card">
          <HorizonSlider
            value={horizonHours}
            onChange={setHorizonHours}
          />
        </div>
      </div>

      {/* Stats */}
      <StatsPanel stats={stats} />

      {/* Chart */}
      <div className="chart-section glass-card fade-in fade-in-delay-2">
        <div className="card-title">
          <span className="card-title-icon blue"></span>
          Generation Overview
        </div>
        <ForecastChart
          actuals={filteredActuals}
          forecasts={filteredForecasts}
        />
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-dot actual"></span>
            Actual Generation
          </div>
          <div className="legend-item">
            <span className="legend-dot forecast"></span>
            Forecasted Generation
          </div>
        </div>
      </div>
    </div>
  )
}
