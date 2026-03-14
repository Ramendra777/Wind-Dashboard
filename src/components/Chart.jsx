import React, { useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  TimeScale,
} from 'chart.js'
import 'chartjs-adapter-date-fns'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  TimeScale
)

export default function ForecastChart({ actuals, forecasts }) {
  const chartData = useMemo(() => {
    if (!actuals || actuals.length === 0) return null

    const actualPoints = actuals.map(d => ({
      x: new Date(d.startTime),
      y: d.generation
    }))

    const forecastPoints = forecasts.map(d => ({
      x: new Date(d.startTime),
      y: d.generation
    }))

    return {
      datasets: [
        {
          label: 'Actual Generation',
          data: actualPoints,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.08)',
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#3b82f6',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
          fill: true,
          tension: 0.3,
          order: 1,
        },
        {
          label: 'Forecasted Generation',
          data: forecastPoints,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.06)',
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#10b981',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
          fill: true,
          tension: 0.3,
          borderDash: [6, 3],
          order: 2,
        }
      ]
    }
  }, [actuals, forecasts])

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        type: 'time',
        time: {
          displayFormats: {
            hour: 'dd MMM HH:mm',
            day: 'dd MMM',
          },
          tooltipFormat: 'dd MMM yyyy HH:mm',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.04)',
          drawBorder: false,
        },
        ticks: {
          color: '#64748b',
          font: { family: 'Inter', size: 11 },
          maxTicksLimit: 10,
          maxRotation: 0,
        },
        border: {
          display: false,
        }
      },
      y: {
        title: {
          display: true,
          text: 'Generation (MW)',
          color: '#94a3b8',
          font: { family: 'Inter', size: 12, weight: 500 },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.04)',
          drawBorder: false,
        },
        ticks: {
          color: '#64748b',
          font: { family: 'Inter', size: 11 },
          callback: (val) => val.toLocaleString() + ' MW',
        },
        border: {
          display: false,
        }
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        titleFont: { family: 'Inter', size: 12, weight: 600 },
        bodyFont: { family: 'Inter', size: 11 },
        displayColors: true,
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.parsed.y?.toLocaleString()} MW`
          }
        }
      }
    },
    animation: {
      duration: 800,
      easing: 'easeOutCubic',
    },
  }), [])

  if (!chartData) {
    return (
      <div className="no-data">
        <div className="no-data-icon">📊</div>
        <p>No data available for the selected range</p>
      </div>
    )
  }

  return (
    <div className="chart-container">
      <Line data={chartData} options={options} />
    </div>
  )
}
