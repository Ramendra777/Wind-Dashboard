import React from 'react'

export default function StatsPanel({ stats }) {
  return (
    <div className="stats-grid fade-in fade-in-delay-1">
      <div className="stat-card blue">
        <div className="stat-label">Mean Absolute Error</div>
        <div className="stat-value blue">{stats.mae.toLocaleString()}</div>
        <div className="stat-unit">MW</div>
      </div>
      <div className="stat-card green">
        <div className="stat-label">Root Mean Square Error</div>
        <div className="stat-value green">{stats.rmse.toLocaleString()}</div>
        <div className="stat-unit">MW</div>
      </div>
      <div className="stat-card purple">
        <div className="stat-label">Mean Abs % Error</div>
        <div className="stat-value purple">{stats.mape}%</div>
        <div className="stat-unit">MAPE</div>
      </div>
      <div className="stat-card amber">
        <div className="stat-label">Data Points</div>
        <div className="stat-value amber">{stats.dataPoints.toLocaleString()}</div>
        <div className="stat-unit">matched pairs</div>
      </div>
    </div>
  )
}
