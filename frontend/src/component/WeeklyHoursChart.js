import React, { useEffect, useRef } from 'react';

function WeeklyHoursChart({ data }) {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (!data || !chartRef.current) return;

        // Destroy existing chart
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

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

        // Create chart using Chart.js
        import('chart.js').then(({ Chart, registerables }) => {
            Chart.register(...registerables);
            
            chartInstance.current = new Chart(chartRef.current, {
                type: 'line',
                data: {
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
                },
                options: {
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
                }
            });
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [data]);

    // Helper function to get week number
    const getWeekNumber = (date) => {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    };

    return (
        <div className="chart-wrapper">
            <canvas ref={chartRef}></canvas>
        </div>
    );
}

export default WeeklyHoursChart;
