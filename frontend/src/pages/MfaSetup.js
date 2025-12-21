import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/MfaSetup.css';
import API_URL from '../config/api';

function MfaSetup() {
    const [step, setStep] = useState(1);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [factorId, setFactorId] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [refreshToken, setRefreshToken] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [mfaAlreadyEnabled, setMfaAlreadyEnabled] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);

    const navigate = useNavigate();

    const userEmail = localStorage.getItem('email') || '';
    const userName = `${localStorage.getItem('firstName') || ''} ${localStorage.getItem('lastName') || ''}`.trim();

    useEffect(() => {
        checkMfaStatus();
    }, []);

    const checkMfaStatus = async () => {
        try {
            const storedAccessToken = localStorage.getItem('accessToken');
            const storedRefreshToken = localStorage.getItem('refreshToken');

            if (!storedAccessToken) {
                setCheckingStatus(false);
                return;
            }

            const response = await fetch(`${API_URL}/login/mfa-status`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${storedAccessToken}`,
                    'X-Refresh-Token': storedRefreshToken || ''
                }
            });

            if (response.ok) {
                const data = await response.json();
                setMfaAlreadyEnabled(data.mfaEnabled);
            }
        } catch (error) {
            console.error('Erreur lors de la vérification du statut MFA:', error);
        } finally {
            setCheckingStatus(false);
        }
    };

    const handleStartEnroll = async (e) => {
        e.preventDefault();
        setError('');

        if (!password) {
            setError('Veuillez entrer votre mot de passe.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/login/mfa-setup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: userEmail,
                    password: password
                })
            });

            if (!res.ok) {
                if (res.status === 401) {
                    throw new Error('Mot de passe incorrect.');
                }
                throw new Error('Échec de la configuration MFA. Veuillez réessayer.');
            }

            const data = await res.json();
            setQrCode(data.qrCode);
            setSecret(data.secret);
            setFactorId(data.factorId);
            setAccessToken(data.accessToken);
            setRefreshToken(data.refreshToken);
            setPassword('');
            setStep(2);
        } catch (err) {
            setError(err.message || 'Erreur lors de la configuration MFA');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/login/mfa-verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ factorId, code: verificationCode, accessToken, refreshToken })
            });

            if (!res.ok) {
                throw new Error('Code de vérification invalide. Veuillez réessayer.');
            }

            setSuccess('Authentification à deux facteurs activée avec succès!');
            setTimeout(() => {
                navigate('/profil');
            }, 2000);
        } catch (err) {
            setError(err.message || 'Erreur lors de la vérification');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/profil');
    };

    // Loading state while checking MFA status
    if (checkingStatus) {
        return (
            <div className="mfa-setup-container">
                <h1 className="mfa-setup-title">Configuration MFA</h1>
                <div className="mfa-setup-card">
                    <div className="mfa-user-header">
                        <div className="mfa-user-avatar">🔐</div>
                        <div className="mfa-user-info">
                            <div className="mfa-user-name">{userName || 'Utilisateur'}</div>
                            <div className="mfa-user-email">{userEmail}</div>
                        </div>
                    </div>
                    <p className="mfa-description" style={{ textAlign: 'center' }}>
                        Vérification du statut MFA...
                    </p>
                </div>
            </div>
        );
    }

    // MFA already enabled state
    if (mfaAlreadyEnabled) {
        return (
            <div className="mfa-setup-container">
                <h1 className="mfa-setup-title">Configuration MFA</h1>
                <div className="mfa-setup-card">
                    <div className="mfa-user-header">
                        <div className="mfa-user-avatar">🔐</div>
                        <div className="mfa-user-info">
                            <div className="mfa-user-name">{userName || 'Utilisateur'}</div>
                            <div className="mfa-user-email">{userEmail}</div>
                        </div>
                    </div>

                    <div className="mfa-already-enabled">
                        <div className="mfa-already-enabled-icon">✅</div>
                        <h2 className="mfa-section-title" style={{ textAlign: 'center' }}>
                            MFA déjà activé
                        </h2>
                        <p className="mfa-description" style={{ textAlign: 'center' }}>
                            L'authentification à deux facteurs est déjà activée sur ce compte.
                        </p>
                        <div className="mfa-info-box">
                            <p className="mfa-description" style={{ margin: 0, textAlign: 'center' }}>
                                Si vous souhaitez désactiver ou réinitialiser votre MFA, veuillez contacter le support IT.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleBack}
                        className="mfa-button-primary"
                    >
                        ← Retour au profil
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="mfa-setup-container">
            <h1 className="mfa-setup-title">Configuration MFA</h1>

            <div className="mfa-setup-card">
                {/* Header with user info */}
                <div className="mfa-user-header">
                    <div className="mfa-user-avatar">🔐</div>
                    <div className="mfa-user-info">
                        <div className="mfa-user-name">{userName || 'Utilisateur'}</div>
                        <div className="mfa-user-email">{userEmail}</div>
                    </div>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="mfa-success-message">✅ {success}</div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mfa-error-message">⚠️ {error}</div>
                )}

                {step === 1 ? (
                    <form className="mfa-form" onSubmit={handleStartEnroll}>
                        <h2 className="mfa-section-title">
                            Qu'est-ce que l'authentification à deux facteurs?
                        </h2>

                        <p className="mfa-description">
                            L'authentification à deux facteurs (MFA) ajoute une couche de sécurité supplémentaire
                            à votre compte. En plus de votre mot de passe, vous devrez entrer un code temporaire
                            généré par une application d'authentification.
                        </p>

                        <div className="mfa-info-box">
                            <h3 className="mfa-section-subtitle">📱 Applications recommandées</h3>
                            <ul className="mfa-apps-list">
                                <li>Google Authenticator</li>
                                <li>Microsoft Authenticator</li>
                                <li>Authy</li>
                                <li>1Password</li>
                            </ul>
                        </div>

                        {/* Password confirmation */}
                        <div className="mfa-info-box">
                            <h3 className="mfa-section-subtitle">🔑 Confirmez votre identité</h3>
                            <p className="mfa-description" style={{ marginBottom: 12 }}>
                                Pour des raisons de sécurité, veuillez entrer votre mot de passe.
                            </p>
                            <label className="mfa-label">Mot de passe</label>
                            <div className="mfa-input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Entrez votre mot de passe"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="mfa-input"
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="mfa-password-toggle"
                                    aria-label="Afficher/masquer le mot de passe"
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="mfa-button-primary"
                            disabled={loading || !password}
                        >
                            {loading ? 'Chargement...' : 'Commencer la configuration →'}
                        </button>

                        <button
                            type="button"
                            onClick={handleBack}
                            className="mfa-button-secondary"
                            disabled={loading}
                        >
                            ← Retour au profil
                        </button>
                    </form>
                ) : (
                    <div className="mfa-form">
                        <h2 className="mfa-section-title">Scannez le QR Code</h2>

                        <p className="mfa-description">
                            Ouvrez votre application d'authentification et scannez le code ci-dessous.
                        </p>

                        {qrCode && (
                            <div className="mfa-qr-container">
                                <div
                                    dangerouslySetInnerHTML={{ __html: qrCode }}
                                    className="mfa-qr-code"
                                />
                            </div>
                        )}

                        <div className="mfa-info-box">
                            <label className="mfa-label">Clé secrète (entrée manuelle)</label>
                            <div className="mfa-secret-box">{secret}</div>
                            <p className="mfa-secret-help">
                                Si vous ne pouvez pas scanner le QR code, entrez cette clé manuellement dans votre application.
                            </p>
                        </div>

                        <form className="mfa-form" onSubmit={handleVerify}>
                            <label className="mfa-label">Code de vérification</label>
                            <input
                                type="text"
                                placeholder="000000"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="mfa-input mfa-code-input"
                                maxLength={6}
                                required
                                disabled={loading}
                            />
                            <p className="mfa-code-help">
                                Entrez le code à 6 chiffres affiché dans votre application
                            </p>

                            <button
                                type="submit"
                                className="mfa-button-primary"
                                disabled={loading || verificationCode.length !== 6}
                            >
                                {loading ? 'Vérification...' : 'Vérifier et activer MFA'}
                            </button>
                        </form>

                        <button
                            onClick={handleBack}
                            className="mfa-button-secondary"
                            disabled={loading}
                        >
                            ← Annuler
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MfaSetup;