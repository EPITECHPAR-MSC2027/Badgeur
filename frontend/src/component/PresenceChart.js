import React, { useEffect, useRef } from 'react';

function PresenceChart({ data }) {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (!data || !chartRef.current) return;

        // Destroy existing chart
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        // Calculate daily presence data
        const dailyData = {};
        data.forEach(event => {
            const date = new Date(event.badgedAt);
            const day = date.getDate();
            if (!dailyData[day]) {
                dailyData[day] = { presence: 0, absence: 0 };
            }
            dailyData[day].presence += 1;
        });

        // Convert to arrays for chart
        const days = Object.keys(dailyData).map(Number).sort((a, b) => a - b);
        const presenceData = days.map(day => dailyData[day].presence);
        const absenceData = days.map(day => Math.max(0, 1 - dailyData[day].presence)); // Simplified absence calculation

        // Create chart using Chart.js
        import('chart.js').then(({ Chart, registerables }) => {
            Chart.register(...registerables);
            
            chartInstance.current = new Chart(chartRef.current, {
                type: 'bar',
                data: {
                    labels: days.map(day => day.toString()),
                    datasets: [
                        {
                            label: 'Présence',
                            data: presenceData,
                            backgroundColor: '#10b981',
                            borderColor: '#059669',
                            borderWidth: 1
                        },
                        {
                            label: 'Absence',
                            data: absenceData,
                            backgroundColor: '#ef4444',
                            borderColor: '#dc2626',
                            borderWidth: 1
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
                            max: 1,
                            ticks: {
                                callback: function(value) {
                                    return (value * 100) + '%';
                                }
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Jours du mois'
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

    return (
        <div className="chart-wrapper">
            <canvas ref={chartRef}></canvas>
        </div>
    );
}

export default PresenceChart;
