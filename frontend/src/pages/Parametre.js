import React, { useState, useEffect } from 'react';
import '../style/theme.css'
import '../index.css'

function ParamTre() {
    const [selectedTheme, setSelectedTheme] = useState(() => localStorage.getItem('theme') || 'main');
    const [dyslexicMode, setDyslexicMode] = useState(() => localStorage.getItem('dyslexicMode') === 'true');

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
        localStorage.setItem('theme', selectedTheme)
    }, [selectedTheme]);

    useEffect(() => {
        if (dyslexicMode) {
            document.body.classList.add('dyslexic-mode');
        } else {
            document.body.classList.remove('dyslexic-mode');
        }
        localStorage.setItem('dyslexicMode', dyslexicMode.toString());
    }, [dyslexicMode]);

    const handleThemeChange = (event) => {
        setSelectedTheme(event.target.value);
    };

    const handleDyslexicModeToggle = (event) => {
        setDyslexicMode(event.target.checked);
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

                <div style={{ marginTop: '30px' }}>
                    <h2>Accessibilité</h2>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px',
                        padding: '10px',
                        backgroundColor: 'var(--color-primary)',
                        borderRadius: '8px',
                        border: '1px solid var(--color-third)'
                    }}>
                        <input
                            type="checkbox"
                            id="dyslexicMode"
                            checked={dyslexicMode}
                            onChange={handleDyslexicModeToggle}
                            style={{
                                width: '20px',
                                height: '20px',
                                cursor: 'pointer',
                                accentColor: 'var(--color-secondary)'
                            }}
                        />
                        <label 
                            htmlFor="dyslexicMode" 
                            style={{ 
                                cursor: 'pointer',
                                fontSize: '16px',
                                color: 'var(--color-secondary)',
                                margin: 0
                            }}
                        >
                            Mode dyslexique (police adaptée)
                        </label>
                    </div>
                    <p style={{ marginTop: '10px', fontSize: '14px', color: 'var(--color-second-text)' }}>
                        Active une police spécialement conçue pour faciliter la lecture aux personnes dyslexiques
                    </p>
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
