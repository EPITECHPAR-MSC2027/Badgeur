import React from 'react';

function KPICard({ title, value, description, comparison }) {
    const getComparisonIcon = (type) => {
        if (type === 'positive') return '📈';
        if (type === 'negative') return '📉';
        return null;
    };

    const getComparisonColor = (type) => {
        if (type === 'positive') return '#10b981';
        if (type === 'negative') return '#ef4444';
        return 'var(--color-second-text)';
    };

    return (
        <div className="kpi-card">
            <div className="kpi-header">
                <h4 className="kpi-title">{title}</h4>
                {comparison && (
                    <span 
                        className="kpi-comparison-icon"
                        style={{ color: getComparisonColor(comparison) }}
                    >
                        {getComparisonIcon(comparison)}
                    </span>
                )}
            </div>
            <div className="kpi-value">{value}</div>
            <div className="kpi-description">{description}</div>
        </div>
    );
}

export default KPICard;
