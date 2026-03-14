# Wind Forecast Monitor 🌬️

A premium forecast monitoring dashboard for **UK national wind power generation** (January 2024). Compare actual wind generation against forecasted values with configurable forecast horizons, interactive date ranges, and comprehensive error statistics.

> **AI Tools Disclosure**: This project was built with assistance from AI coding tools.

![Wind Forecast Monitor Dashboard](screenshot.png)

---

## Features

- 📊 **Interactive Time-Series Chart** — Actual (blue) vs Forecasted (green dashed) wind generation
- 📅 **Date Range Picker** — Select any date range within January 2024
- 🎚 **Forecast Horizon Slider** — Configure minimum forecast lead time (0–48 hours)
- 📈 **Live Statistics** — MAE, RMSE, MAPE, and matched data points
- 🌙 **Premium Dark Theme** — Glassmorphism cards, smooth animations, responsive design
- 📱 **Mobile-Friendly** — Works seamlessly on all screen sizes

---

## Project Structure

```
wind-forecast-monitor/
├── index.html                          # App entry point
├── package.json                        # Dependencies & scripts
├── vite.config.js                      # Vite configuration
├── scripts/
│   └── fetch-data.js                   # Data fetcher from BMRS API
├── public/
│   └── data/
│       ├── actuals.json                # Actual wind generation (FUELHH)
│       └── forecasts.json              # Wind forecasts (WINDFOR)
├── src/
│   ├── main.jsx                        # React entry
│   ├── App.jsx                         # App shell with header
│   ├── index.css                       # Design system & styles
│   └── components/
│       ├── Dashboard.jsx               # Main dashboard (state, logic)
│       ├── Chart.jsx                   # Chart.js line chart
│       ├── StatsPanel.jsx              # MAE/RMSE/MAPE cards
│       └── HorizonSlider.jsx           # Forecast horizon slider
├── notebooks/
│   ├── forecast_error_analysis.ipynb   # Forecast error analysis
│   └── wind_reliability_analysis.ipynb # Wind reliability & MW recommendation
└── README.md
```

---

## Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **Python 3.8+** with `pandas`, `numpy`, `matplotlib` (for notebooks)

### 1. Install Dependencies

```bash
npm install
```

### 2. Fetch Data

Download January 2024 wind power data from the BMRS API:

```bash
npm run fetch-data
```

This fetches:
- **Actual generation** (FUELHH dataset, filtered for `fuelType: "WIND"`) → `public/data/actuals.json`
- **Forecasts** (WINDFOR dataset, forecast horizon 0–48h) → `public/data/forecasts.json`

### 3. Start the Application

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production

```bash
npm run build
npm run preview
```

---

## How It Works

### Forecast Selection Logic

For a given **target time** and **forecast horizon** (e.g., 4 hours):

1. Find all forecasts for that target time
2. Filter to those published **at least** 4 hours before the target
3. Select the **latest** published forecast among eligible ones

Example: For target time `24/05/24 18:00` with a 4-hour horizon, only forecasts published before `24/05/24 14:00` are considered.

### Data Sources

| Dataset | API Endpoint | Description |
|---------|-------------|-------------|
| FUELHH  | [BMRS FUELHH Stream](https://bmrs.elexon.co.uk/api-documentation/endpoint/datasets/FUELHH/stream) | Half-hourly actual generation by fuel type |
| WINDFOR | [BMRS WINDFOR Stream](https://bmrs.elexon.co.uk/api-documentation/endpoint/datasets/WINDFOR/stream) | Wind generation forecasts |

---

## Analysis Notebooks

### 1. Forecast Error Analysis (`notebooks/forecast_error_analysis.ipynb`)

- Overall error statistics (MAE, Median, P90, P95, P99, RMSE, MAPE)
- Error distribution (signed & percentage)
- Error vs forecast horizon (how accuracy degrades)
- Error by time of day
- Error heatmap (hour × day)

### 2. Wind Reliability Analysis (`notebooks/wind_reliability_analysis.ipynb`)

- Time series overview with percentile bands
- Generation duration curve
- Capacity factor analysis
- Diurnal wind patterns
- Ramp rate / volatility analysis
- **MW reliability recommendation** at various confidence levels

---

## Tech Stack

- **Frontend**: React 18 + Vite 6
- **Charts**: Chart.js + react-chartjs-2 with time-series adapter
- **Dates**: date-fns + react-datepicker
- **Styling**: Vanilla CSS (dark theme, glassmorphism)
- **Analysis**: Python, pandas, numpy, matplotlib

---

## License

MIT
