import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Login.css';
import primeBankLogo from '../assets/primebank.png';
import icon from '../assets/icon.png';
import emailIcon from '../assets/email.svg';
import lockIcon from '../assets/lock.svg';
import API_URL from '../config/api';

function Login({ onSubmit }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (!res.ok) throw new Error('Identifiants invalides');
            const data = await res.json();

            // Stocker les informations utilisateur
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken || '');
            localStorage.setItem('firstName', data.firstName);
            localStorage.setItem('lastName', data.lastName);
            localStorage.setItem('roleId', data.roleId);
            localStorage.setItem('email', data.email);
            localStorage.setItem('userId', data.userId);

            if (onSubmit) onSubmit(data);
            navigate('/home');

        } catch (err) {
            alert(err.message || 'Erreur de connexion');
        }
    };

    return (
        <div className="login-background">
            <div className="app-header">
                <div className="header-brand">
                    <img src={icon} alt="Icon" className="header-icon" />
                    <span className="header-title">BADGEUR</span>
                </div>
            </div>
            
            {/* Partie gauche - Informations avec lignes dorées */}
            <div className="login-page">
                <div className="decorative-lines"></div>
                
                <h1>
                    Gérez votre temps<br />
                    <span className="highlight">avec précision</span>
                </h1>
                <p>
                    Solution complète de gestion du temps pour les professionnels RH. 
                    Optimisez vos processus et gagnez en efficacité.
                </p>
                <div className="login-footer">
                    <span>© 2024 Badgeur</span>
                    <span>Tous droits réservés</span>
                </div>
            </div>

            {/* Partie droite - Formulaire avec fond hexagonal */}
            <div className="login-container">
                <div className="geometric-background"></div>
                {/* Logo en haut à gauche */}
                <img 
                    src={primeBankLogo} 
                    alt="Logo" 
                    className="login-logo" 
                />
                
                <form onSubmit={handleSubmit}>
                    <div className="login-form-group">
                    <h1 className="login-title">Connexion</h1>
                    <p className="login-subtitle">Accédez à votre espace de gestion du temps</p>
                        <label className="login-label">Adresse Email</label>
                        <div className="login-input-wrapper">
                            <img src={emailIcon} alt="Email" className="login-input-icon" />
                            <input
                                className="login-input"
                                type="email"
                                placeholder="nom@banque.fr"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="login-form-group">
                        <label className="login-label">Mot de passe</label>
                        <div className="login-input-wrapper">
                            <img src={lockIcon} alt="Password" className="login-input-icon" />
                            <input
                                className="login-input"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="login-password-toggle"
                                onClick={() => setShowPassword(v => !v)}
                                aria-label="Afficher/masquer le mot de passe"
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="login-submit-button">
                        Se connecter →
                    </button>
                </form>

                <div className="login-support">
                    Problème de connexion? <a href="#support">Contactez le support IT</a>
                </div>
            </div>
        </div>
    );
}

export default Login;