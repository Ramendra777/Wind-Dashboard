import React from 'react'

export default function HorizonSlider({ value, onChange }) {
  return (
    <div className="slider-container">
      <label className="control-label" htmlFor="horizon-slider">
        Forecast Horizon
        <span className="slider-value">{value}h</span>
      </label>
      <input
        id="horizon-slider"
        type="range"
        className="horizon-slider"
        min={0}
        max={48}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="slider-ticks">
        <span className="slider-tick">0h</span>
        <span className="slider-tick">12h</span>
        <span className="slider-tick">24h</span>
        <span className="slider-tick">36h</span>
        <span className="slider-tick">48h</span>
      </div>
    </div>
  )
}
