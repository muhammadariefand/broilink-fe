import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const CombinedChart = ({ data1, data2, labels, yAxisConfig }) => {
  const chartData = {
    labels,
    datasets: [
      {
        type: data1.type,
        label: data1.label,
        data: data1.data,
        backgroundColor: data1.color + (data1.type === 'bar' ? '80' : ''),
        borderColor: data1.color,
        borderWidth: 2,
        yAxisID: 'y',
      },
      data2 && {
        type: data2.type,
        label: data2.label,
        data: data2.data,
        borderColor: data2.color,
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.4,
        yAxisID: 'y1',
      }
    ].filter(Boolean)
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        enabled: true,
      }
    },
    scales: {
      y: {
        type: 'linear',
        position: 'left',
        title: {
          display: true,
          text: yAxisConfig?.label1 || ''
        },
        max: yAxisConfig?.max1,
        ticks: {
          stepSize: yAxisConfig?.stepSize1
        }
      },
      y1: data2 && {
        type: 'linear',
        position: 'right',
        title: {
          display: true,
          text: yAxisConfig?.label2 || ''
        },
        max: yAxisConfig?.max2,
        ticks: {
          stepSize: yAxisConfig?.stepSize2
        },
        grid: {
          drawOnChartArea: false
        }
      }
    }
  };

  return (
    <div className="h-96">
      <Chart type="bar" data={chartData} options={options} />
    </div>
  );
};

export default CombinedChart;
