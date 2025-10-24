import React from 'react';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

function TeamStatsChart({ teamData }) {
    if (!teamData || teamData.length === 0) {
        return (
            <div className="chart-wrapper">
                <p>Aucune donnée disponible</p>
            </div>
        );
    }

    // Calculate team statistics
    const totalMembers = teamData.length;
    const membersWithData = teamData.filter(member => member.events && member.events.length > 0).length;
    const membersWithoutData = totalMembers - membersWithData;

    const chartData = {
        labels: ['Membres avec données', 'Membres sans données'],
        datasets: [
            {
                data: [membersWithData, membersWithoutData],
                backgroundColor: [
                    '#10b981',
                    '#ef4444'
                ],
                borderColor: [
                    '#059669',
                    '#dc2626'
                ],
                borderWidth: 2
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
            },
            title: {
                display: true,
                text: 'Répartition des données d\'équipe'
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed;
                        const percentage = ((value / totalMembers) * 100).toFixed(1);
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        }
    };

    return (
        <div className="chart-wrapper">
            <Pie data={chartData} options={options} />
        </div>
    );
}

export default TeamStatsChart;
