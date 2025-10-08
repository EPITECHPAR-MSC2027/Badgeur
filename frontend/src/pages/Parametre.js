import React, { useState, useEffect } from 'react';
import '../style/theme.css'
import '../index.css'

function ParamTre() {
    const [selectedTheme, setSelectedTheme] = useState('main');

    const themes = [
        { value: 'main', label: 'Principal' },
        { value: 'azure', label: 'Azure' },
        { value: 'pink-matcha', label: 'Rose Matcha' },
        { value: 'coffee', label: 'Café' },
        { value: 'deep-blue', label: 'Bleu Profond' },
        { value: 'cyber', label: 'Cyber' },
        { value: 'warm', label: 'Chaleureux' },
        { value: 'desert', label: 'Désert' },
        { value: 'starlight', label: 'Lumière des Étoiles' }
    ];

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', selectedTheme);
    }, [selectedTheme]);

    const handleThemeChange = (event) => {
        setSelectedTheme(event.target.value);
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Paramètres</h1>
                
                <div>
                    <h2>Thème</h2>
                    <p>Choisissez votre thème préféré :</p>
                    <select 
                        value={selectedTheme} 
                        onChange={handleThemeChange}
                        style={{
                            padding: '8px 12px',
                            fontSize: '16px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            backgroundColor: 'var(--color-background)',
                            color: 'var(--color-secondary)'
                        }}
                    >
                        {themes.map(theme => (
                            <option key={theme.value} value={theme.value}>
                                {theme.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <h2> Je suis H2</h2>
                    <p>Je suis text totalement normal.</p>
                    <p> Je suis un sous-texte</p>
                </div>

            </header>
        </div>
    );
}

export default ParamTre;
