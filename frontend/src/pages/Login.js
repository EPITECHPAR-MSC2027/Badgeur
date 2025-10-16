import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';   // ✅ AJOUT IMPORTANT
import '../style/Login.css';
import primeBankLogo from '../assets/primebank.png';
import icon from '../assets/icon.png';
import person from '../assets/person-icon.svg';
import emailIcon from '../assets/email.svg';
import lockIcon from '../assets/lock.svg';

function Login({ onSubmit }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (!res.ok) throw new Error('Identifiants invalides');
            const data = await res.json();

            // ✅ Stocker les informations utilisateur dans localStorage
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken || '');
            localStorage.setItem('firstName', data.firstName);
            localStorage.setItem('lastName', data.lastName);
            localStorage.setItem('roleId', data.roleId);
            localStorage.setItem('email', data.email);
            localStorage.setItem('userId', data.userId);

            // ✅ Appeler le callback si nécessaire
            if (onSubmit) onSubmit(data);

            // ✅ Redirection vers /home
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
                    <span className="header-title">Badgeur</span>
                </div>
            </div>
            <div className="login-page">
                <img 
                    src={primeBankLogo} 
                    alt="PrimeBank Logo" 
                    className="login-logo" 
                />
                <div className="login-container">
                    <img src={person} alt="Person Icon" className="login-person-icon"/>
                    <h1 className="login-title">Veuillez vous connecter à votre compte</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="login-form-group">
                            <label className="login-label">Email</label>
                            <div className="login-input-wrapper">
                                <img src={emailIcon} alt="Email" className="login-input-icon" />
                                <input
                                    className="login-input"
                                    type="email"
                                    placeholder="nom@exemple.com"
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
                                    placeholder="Votre mot de passe"
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
                            Se connecter
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
