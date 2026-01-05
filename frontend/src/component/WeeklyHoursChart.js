import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

function WeeklyHoursChart({ data }) {
    // Helper function to get week number
    const getWeekNumber = (date) => {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    };

    // Calculate weekly hours
    const weeklyData = {};
    data.forEach(event => {
        const date = new Date(event.badgedAt);
        const weekNumber = getWeekNumber(date);
        const weekKey = `S${weekNumber}`;
        
        if (!weeklyData[weekKey]) {
            weeklyData[weekKey] = [];
        }
        weeklyData[weekKey].push(date);
    });

    // Calculate average hours per week
    const weeks = Object.keys(weeklyData).sort();
    const hoursData = weeks.map(week => {
        const weekEvents = weeklyData[week];
        if (weekEvents.length < 2) return 0;
        
        // Group by day and calculate daily hours
        const dailyHours = {};
        weekEvents.forEach(event => {
            const day = event.toDateString();
            if (!dailyHours[day]) dailyHours[day] = [];
            dailyHours[day].push(event);
        });

        // Calculate total hours for the week
        let totalHours = 0;
        Object.values(dailyHours).forEach(dayEvents => {
            if (dayEvents.length >= 2) {
                const sorted = dayEvents.sort((a, b) => a - b);
                const hours = (sorted[sorted.length - 1] - sorted[0]) / (1000 * 60 * 60);
                totalHours += Math.max(0, hours);
            }
        });

        return totalHours;
    });

    const chartData = {
        labels: weeks,
        datasets: [
            {
                label: 'Heures travaillées',
                data: hoursData,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Heures'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Semaines'
                }
            }
        }
    };

    return (
        <div className="chart-wrapper">
            <Line data={chartData} options={options} />
        </div>
    );
}

export default WeeklyHoursChart;
