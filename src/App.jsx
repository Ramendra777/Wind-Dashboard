import React from 'react'
import Dashboard from './components/Dashboard'

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-icon">🌬️</div>
            <div>
              <h1>Wind Forecast Monitor</h1>
              <p className="header-subtitle">UK National Wind Power Generation · January 2024</p>
            </div>
          </div>
          <span className="header-badge">Live Dashboard</span>
        </div>
      </header>
      <main className="main-content">
        <Dashboard />
      </main>
    </div>
  )
}
