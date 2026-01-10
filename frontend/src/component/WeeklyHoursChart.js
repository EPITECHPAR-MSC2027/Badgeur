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

    // Calculate total hours per week using the same logic as UserAnalytics
    // Sort weeks numerically (S1, S2, ..., S10, S11, etc.)
    const weeks = Object.keys(weeklyData).sort((a, b) => {
        const numA = parseInt(a.replace('S', ''));
        const numB = parseInt(b.replace('S', ''));
        return numA - numB;
    });
    const hoursData = weeks.map(week => {
        const weekEvents = weeklyData[week];
        if (weekEvents.length < 2) return 0;
        
        // Group by day and calculate daily hours using pairing logic (entry-exit)
        const eventsByDay = {};
        weekEvents.forEach(event => {
            const dayKey = event.toDateString();
            if (!eventsByDay[dayKey]) {
                eventsByDay[dayKey] = [];
            }
            eventsByDay[dayKey].push(event);
        });

        // Calculate total hours for the week using paired events (entry-exit)
        let totalHours = 0;
        let totalMinutes = 0;
        
        Object.values(eventsByDay).forEach(dayEvents => {
            // Sort events by time
            dayEvents.sort((a, b) => a - b);

            // Pair events (entry-exit, entry-exit, ...)
            for (let i = 0; i < dayEvents.length - 1; i += 2) {
                const entry = dayEvents[i];
                const exit = dayEvents[i + 1];
                const diffMs = exit - entry;
                const hours = Math.floor(diffMs / 3600000);
                const minutes = Math.floor((diffMs % 3600000) / 60000);
                totalHours += hours;
                totalMinutes += minutes;
            }
        });

        // Normalize minutes to hours
        totalHours += Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;
        
        // Return total hours as decimal (e.g., 35.5 for 35h30min)
        return totalHours + (remainingMinutes / 60);
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
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const hours = context.parsed.y;
                        const hoursInt = Math.floor(hours);
                        const minutes = Math.round((hours - hoursInt) * 60);
                        if (minutes > 0) {
                            return `${context.dataset.label}: ${hoursInt}h${minutes}min`;
                        }
                        return `${context.dataset.label}: ${hoursInt}h`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Heures'
                },
                ticks: {
                    callback: function(value) {
                        return value + 'h';
                    }
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
