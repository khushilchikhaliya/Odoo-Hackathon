import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { useCurrency } from '../context/CurrencyContext';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

export function CategoryDoughnutChart({ categories }) {
  const { formatPrice } = useCurrency();
  const validCategories = categories.filter(c => c.amount > 0);

  if (validCategories.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400">
        <p className="text-sm">No expenses logged yet</p>
        <p className="text-xs text-slate-500 mt-1">Add activities or transport/stay costs to see chart</p>
      </div>
    );
  }

  const data = {
    labels: validCategories.map(c => c.name),
    datasets: [
      {
        data: validCategories.map(c => c.amount),
        backgroundColor: validCategories.map(c => c.color || '#3B82F6'),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 14,
          font: {
            family: 'Plus Jakarta Sans',
            size: 11,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.raw || 0;
            return ` ${label}: ${formatPrice(value)}`;
          },
        },
      },
    },
    cutout: '68%',
  };

  return (
    <div className="h-72 relative">
      <Doughnut data={data} options={options} />
    </div>
  );
}

export function DayByDayBarChart({ dayBreakdown, dailyBudget }) {
  const { formatPrice, getSymbol } = useCurrency();

  if (!dayBreakdown || dayBreakdown.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400">
        <p className="text-sm">No daily timeline data</p>
      </div>
    );
  }

  const data = {
    labels: dayBreakdown.map(d => `Day ${d.dayNumber}`),
    datasets: [
      {
        label: 'Daily Estimated Cost',
        data: dayBreakdown.map(d => d.cost),
        backgroundColor: dayBreakdown.map(d => (d.isOverbudget ? '#EF4444' : '#10B981')),
        borderRadius: 6,
        maxBarThickness: 32,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: (items) => {
            const idx = items[0].dataIndex;
            return `Day ${dayBreakdown[idx].dayNumber} (${dayBreakdown[idx].date})`;
          },
          label: (context) => {
            const cost = context.raw || 0;
            const diff = dailyBudget ? cost - dailyBudget : 0;
            return [
              ` Cost: ${formatPrice(cost)}`,
              dailyBudget ? ` Target: ${formatPrice(dailyBudget)} (${diff > 0 ? `+${formatPrice(diff)} over` : `${formatPrice(Math.abs(diff))} under`})` : ''
            ];
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#f1f5f9',
        },
        ticks: {
          font: {
            size: 11,
          },
          callback: (value) => `${getSymbol()}${value}`,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
  };

  return (
    <div className="h-72 relative">
      <Bar data={data} options={options} />
    </div>
  );
}
