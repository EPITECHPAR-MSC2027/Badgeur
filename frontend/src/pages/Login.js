import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

    // MFA state
    const [mfaRequired, setMfaRequired] = useState(false);
    const [mfaCode, setMfaCode] = useState('');
    const [mfaData, setMfaData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (!res.ok) throw new Error('Identifiants invalides');
            const data = await res.json();

            // Check if MFA is required
            if (data.mfaRequired) {
                setMfaRequired(true);
                setMfaData({
                    factorId: data.factorId,
                    challengeId: data.challengeId,
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken,
                    // Store user info for after MFA
                    userId: data.userId,
                    roleId: data.roleId,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email
                });
                setLoading(false);
                return;
            }

            // No MFA required - complete login
            completeLogin(data);

        } catch (err) {
            setError(err.message || 'Erreur de connexion');
            setLoading(false);
        }
    };

    const handleMfaSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/login/mfa-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    factorId: mfaData.factorId,
                    challengeId: mfaData.challengeId,
                    code: mfaCode,
                    accessToken: mfaData.accessToken,
                    refreshToken: mfaData.refreshToken
                })
            });

            if (!res.ok) {
                const errorData = await res.text();
                throw new Error(errorData || 'Code MFA invalide');
            }

            const data = await res.json();
            completeLogin(data);

        } catch (err) {
            setError(err.message || 'Code MFA invalide');
            setLoading(false);
        }
    };

    const completeLogin = (data) => {
        // Store user information
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken || '');
        localStorage.setItem('firstName', data.firstName);
        localStorage.setItem('lastName', data.lastName);
        localStorage.setItem('roleId', data.roleId);
        localStorage.setItem('email', data.email);
        localStorage.setItem('userId', data.userId);
        // Stocker teamId s'il existe, sinon stocker une chaîne vide
        localStorage.setItem('teamId', data.teamId != null ? data.teamId.toString() : '');

        if (onSubmit) onSubmit(data);
        navigate('/home');
    };

    const handleBackToLogin = () => {
        setMfaRequired(false);
        setMfaCode('');
        setMfaData(null);
        setError('');
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
                    <span>© 2026 Badgeur</span>
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

                {/* Error message */}
                {error && (
                    <div className="login-error">
                        ⚠️ {error}
                    </div>
                )}

                {!mfaRequired ? (
                    // Normal login form
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
                                    disabled={loading}
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
                                    disabled={loading}
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

                        <button type="submit" className="login-submit-button" disabled={loading}>
                            {loading ? 'Connexion...' : 'Se connecter →'}
                        </button>
                    </form>
                ) : (
                    // MFA verification form
                    <form onSubmit={handleMfaSubmit}>
                        <div className="login-form-group">
                            <h1 className="login-title">Vérification MFA</h1>
                            <p className="login-subtitle">
                                Entrez le code à 6 chiffres de votre application d'authentification
                            </p>

                            <div className="login-mfa-icon">🔐</div>

                            <label className="login-label">Code de vérification</label>
                            <div className="login-input-wrapper">
                                <input
                                    className="login-input login-mfa-input"
                                    type="text"
                                    placeholder="000000"
                                    value={mfaCode}
                                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    maxLength={6}
                                    required
                                    disabled={loading}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="login-submit-button"
                            disabled={loading || mfaCode.length !== 6}
                        >
                            {loading ? 'Vérification...' : 'Vérifier →'}
                        </button>

                        <button
                            type="button"
                            className="login-back-button"
                            onClick={handleBackToLogin}
                            disabled={loading}
                        >
                            ← Retour à la connexion
                        </button>
                    </form>
                )}

                <div className="login-support">
                    Problème de connexion? <Link to="/support">Contactez le support IT</Link>
                </div>
            </div>
        </div>
    );
}

export default Login;