import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/theme.css';
import '../index.css';
import API_URL from '../config/api';

function MfaSetup() {
    const [step, setStep] = useState(1); // 1: confirm to start, 2: QR code & verification
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [factorId, setFactorId] = useState('');
    const [accessToken, setAccessToken] = useState(''); // Store the access token
    const [verificationCode, setVerificationCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const navigate = useNavigate();

    // Get user data from localStorage (already authenticated)
    const userEmail = localStorage.getItem('email') || '';
    const userName = `${localStorage.getItem('firstName') || ''} ${localStorage.getItem('lastName') || ''}`.trim();

    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0 20px'
    }

    const cardStyle = {
        backgroundColor: 'var(--color-primary)',
        borderRadius: 12,
        padding: 24,
        boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
        marginTop: 16,
        maxWidth: 600,
        width: '100%'
    }

    const labelStyle = {
        color: 'var(--color-second-text)',
        fontSize: 14,
        marginBottom: 8,
        fontWeight: 600,
        display: 'block'
    }

    const inputStyle = {
        width: '100%',
        padding: '12px 16px',
        fontSize: '16px',
        borderRadius: '6px',
        border: '1px solid #ccc',
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-secondary)',
        boxSizing: 'border-box'
    }

    const codeInputStyle = {
        ...inputStyle,
        fontSize: '18px',
        textAlign: 'center',
        letterSpacing: '8px',
        fontWeight: 600
    }

    const buttonStyle = {
        padding: '12px 24px',
        fontSize: '16px',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 600,
        transition: 'all 0.3s ease',
        backgroundColor: 'var(--color-secondary)',
        color: 'var(--color-primary)',
        width: '100%',
        marginTop: 16
    }

    const secondaryButtonStyle = {
        ...buttonStyle,
        backgroundColor: 'transparent',
        border: '2px solid var(--color-secondary)',
        color: 'var(--color-secondary)'
    }

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
            setAccessToken(data.accessToken); // Store the access token
            setPassword(''); // Clear password from memory
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
                body: JSON.stringify({ factorId, code: verificationCode, accessToken }) // Include accessToken
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

    return (
        <div style={containerStyle}>
            <h1 style={{ marginTop: '1.5em' }}>Configuration MFA</h1>

            <div style={cardStyle}>
                {/* Header with user info */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginBottom: 24,
                    paddingBottom: 20,
                    borderBottom: '1px solid #e0e0e0'
                }}>
                    <div style={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-primary)',
                        fontSize: 24
                    }}>
                        🔐
                    </div>
                    <div>
                        <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-third)' }}>
                            {userName || 'Utilisateur'}
                        </div>
                        <div style={{ fontSize: 14, color: 'var(--color-second-text)' }}>
                            {userEmail}
                        </div>
                    </div>
                </div>

                {/* Success Message */}
                {success && (
                    <div style={{
                        padding: '12px 16px',
                        backgroundColor: '#d4edda',
                        border: '1px solid #c3e6cb',
                        borderRadius: 6,
                        color: '#155724',
                        marginBottom: 20,
                        textAlign: 'center',
                        fontWeight: 600
                    }}>
                        ✅ {success}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div style={{
                        padding: '12px 16px',
                        backgroundColor: '#f8d7da',
                        border: '1px solid #f5c6cb',
                        borderRadius: 6,
                        color: '#721c24',
                        marginBottom: 20,
                        textAlign: 'center'
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleStartEnroll}>
                        <h2 style={{ marginTop: 0, marginBottom: 16, color: 'var(--color-third)' }}>
                            Qu'est-ce que l'authentification à deux facteurs?
                        </h2>

                        <p style={{ color: 'var(--color-second-text)', lineHeight: 1.6, marginBottom: 20 }}>
                            L'authentification à deux facteurs (MFA) ajoute une couche de sécurité supplémentaire
                            à votre compte. En plus de votre mot de passe, vous devrez entrer un code temporaire
                            généré par une application d'authentification.
                        </p>

                        <div style={{
                            backgroundColor: 'var(--color-background)',
                            borderRadius: 8,
                            padding: 16,
                            marginBottom: 20
                        }}>
                            <h3 style={{ marginTop: 0, marginBottom: 12, color: 'var(--color-third)', fontSize: 16 }}>
                                📱 Applications recommandées
                            </h3>
                            <ul style={{
                                margin: 0,
                                paddingLeft: 20,
                                color: 'var(--color-second-text)',
                                lineHeight: 1.8
                            }}>
                                <li>Google Authenticator</li>
                                <li>Microsoft Authenticator</li>
                                <li>Authy</li>
                                <li>1Password</li>
                            </ul>
                        </div>

                        {/* Password confirmation */}
                        <div style={{
                            backgroundColor: 'var(--color-background)',
                            borderRadius: 8,
                            padding: 16,
                            marginBottom: 20
                        }}>
                            <h3 style={{ marginTop: 0, marginBottom: 12, color: 'var(--color-third)', fontSize: 16 }}>
                                🔑 Confirmez votre identité
                            </h3>
                            <p style={{
                                fontSize: 14,
                                color: 'var(--color-second-text)',
                                marginTop: 0,
                                marginBottom: 12
                            }}>
                                Pour des raisons de sécurité, veuillez entrer votre mot de passe.
                            </p>
                            <label style={labelStyle}>Mot de passe</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Entrez votre mot de passe"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={inputStyle}
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    style={{
                                        position: 'absolute',
                                        right: 12,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: 18,
                                        padding: 0
                                    }}
                                    aria-label="Afficher/masquer le mot de passe"
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            style={{
                                ...buttonStyle,
                                opacity: !password ? 0.6 : 1,
                                cursor: !password ? 'not-allowed' : 'pointer'
                            }}
                            disabled={loading || !password}
                        >
                            {loading ? 'Chargement...' : 'Commencer la configuration →'}
                        </button>

                        <button
                            type="button"
                            onClick={handleBack}
                            style={secondaryButtonStyle}
                            disabled={loading}
                            onMouseOver={(e) => !loading && (e.target.style.backgroundColor = 'var(--color-background)')}
                            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                            ← Retour au profil
                        </button>
                    </form>
                ) : (
                    <div>
                        <h2 style={{ marginTop: 0, marginBottom: 16, color: 'var(--color-third)' }}>
                            Scannez le QR Code
                        </h2>

                        <p style={{ color: 'var(--color-second-text)', marginBottom: 20 }}>
                            Ouvrez votre application d'authentification et scannez le code ci-dessous.
                        </p>

                        {qrCode && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                padding: 20,
                                backgroundColor: '#fff',
                                borderRadius: 8,
                                border: '2px solid #e0e0e0',
                                marginBottom: 20
                            }}>
                                <div
                                    dangerouslySetInnerHTML={{ __html: qrCode }}
                                    style={{ maxWidth: 200, width: '100%', height: 'auto' }}
                                />
                            </div>
                        )}

                        <div style={{
                            backgroundColor: 'var(--color-background)',
                            borderRadius: 8,
                            padding: 16,
                            marginBottom: 24
                        }}>
                            <label style={labelStyle}>Clé secrète (entrée manuelle)</label>
                            <div style={{
                                backgroundColor: '#fff',
                                border: '1px solid #ccc',
                                borderRadius: 4,
                                padding: '10px 12px',
                                fontFamily: 'monospace',
                                fontSize: 14,
                                letterSpacing: 2,
                                textAlign: 'center',
                                wordBreak: 'break-all',
                                color: 'var(--color-third)'
                            }}>
                                {secret}
                            </div>
                            <p style={{
                                fontSize: 12,
                                color: 'var(--color-second-text)',
                                marginTop: 8,
                                marginBottom: 0
                            }}>
                                Si vous ne pouvez pas scanner le QR code, entrez cette clé manuellement dans votre application.
                            </p>
                        </div>

                        <form onSubmit={handleVerify}>
                            <label style={labelStyle}>Code de vérification</label>
                            <input
                                type="text"
                                placeholder="000000"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                style={codeInputStyle}
                                maxLength={6}
                                required
                                disabled={loading}
                            />
                            <p style={{
                                fontSize: 13,
                                color: 'var(--color-second-text)',
                                marginTop: 8,
                                textAlign: 'center'
                            }}>
                                Entrez le code à 6 chiffres affiché dans votre application
                            </p>

                            <button
                                type="submit"
                                style={{
                                    ...buttonStyle,
                                    opacity: verificationCode.length !== 6 ? 0.6 : 1,
                                    cursor: verificationCode.length !== 6 ? 'not-allowed' : 'pointer'
                                }}
                                disabled={loading || verificationCode.length !== 6}
                            >
                                {loading ? 'Vérification...' : 'Vérifier et activer MFA'}
                            </button>
                        </form>

                        <button
                            onClick={handleBack}
                            style={secondaryButtonStyle}
                            disabled={loading}
                            onMouseOver={(e) => !loading && (e.target.style.backgroundColor = 'var(--color-background)')}
                            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
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