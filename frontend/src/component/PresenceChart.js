import React from 'react';
import {
    Chart as ChartJS,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(
    ArcElement,
    Title,
    Tooltip,
    Legend
);

function PresenceChart({ data }) {
    // Calculate total days with presence and absence
    const dailyData = {};
    data.forEach(event => {
        const date = new Date(event.badgedAt);
        const day = date.getDate();
        if (!dailyData[day]) {
            dailyData[day] = true; // Mark as present
        }
    });

    // Count presence and absence days
    const presenceDays = Object.keys(dailyData).length;
    
    // Get total days in the current month (we need to infer month from data or context)
    const currentDate = data.length > 0 ? new Date(data[0].badgedAt) : new Date();
    const totalDays = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const absenceDays = totalDays - presenceDays;

    const chartData = {
        labels: ['Présence', 'Absence'],
        datasets: [
            {
                label: 'Jours',
                data: [presenceDays, absenceDays],
                backgroundColor: ['#10b981', '#ef4444'],
                borderColor: ['#059669', '#dc2626'],
                borderWidth: 2,
                hoverOffset: 4
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: {
                        size: 14
                    },
                    padding: 15
                }
            },
            title: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const percentage = ((value / totalDays) * 100).toFixed(2);
                        return `${label}: ${value} jours (${percentage}%)`;
                    }
                }
            }
        },
        cutout: '60%' // Makes it a donut (inner circle)
    };

    return (
        <div className="chart-wrapper">
            <Doughnut data={chartData} options={options} />
        </div>
    );
}

export default PresenceChart;
