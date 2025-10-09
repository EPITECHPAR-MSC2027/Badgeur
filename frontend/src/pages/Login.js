import React, { useState } from 'react'
import loginIllustration from '../assets/login.png'

function Login({ onSubmit }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const containerStyle = {
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: 20,
        background: 'var(--color-primary)',
        borderRadius: 14,
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        marginTop: 20
    }

    const leftStyle = {
        background: 'linear-gradient(135deg, #c9f7e4, #8ed1c3)',
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 420
    }

    const rightStyle = { padding: '28px 28px 36px 28px' }

    const inputStyle = {
        width: '100%',
        border: 'none',
        borderBottom: '2px solid #d9d9d9',
        outline: 'none',
        padding: '10px 0',
        fontSize: 16,
        background: 'transparent'
    }

    const labelStyle = { color: 'var(--color-second-text)', fontSize: 14, marginTop: 18 }
    const buttonStyle = {
        marginTop: 28,
        width: '100%',
        background: '#1f8b4c',
        color: 'white',
        border: 'none',
        padding: '12px 16px',
        borderRadius: 8,
        fontWeight: 700,
        cursor: 'pointer'
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch('/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
            if (!res.ok) throw new Error('Identifiants invalides')
            const data = await res.json()
            localStorage.setItem('accessToken', data.accessToken)
            if (onSubmit) onSubmit(data)
        } catch (err) {
            alert(err.message || 'Erreur de connexion')
        }
    }

    return (
        <div className="App">
            <div style={containerStyle}>
                <div style={leftStyle}>
                    <div>
                        <h2 style={{ marginTop: 0 }}>Bienvenue !</h2>
                        <p style={{ color: 'var(--color-secondary)' }}>Connectez-vous pour accéder à votre espace.</p>
                    </div>
                    <img src={loginIllustration} alt="Illustration" style={{ width: '70%' }} />
                </div>
                <div style={rightStyle}>
                    <h1 style={{ marginTop: 0 }}>Connexion</h1>
                    <form onSubmit={handleSubmit}>
                        <div style={labelStyle}>Email</div>
                        <input
                            style={inputStyle}
                            type="email"
                            placeholder="nom@exemple.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <div style={labelStyle}>Mot de passe</div>
                        <div style={{ position: 'relative' }}>
                            <input
                                style={{ ...inputStyle, paddingRight: 36 }}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Votre mot de passe"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                aria-label="Afficher/masquer le mot de passe"
                                onClick={() => setShowPassword(v => !v)}
                                style={{ position: 'absolute', right: 0, top: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-third)' }}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>

                        <button type="submit" style={buttonStyle}>Se connecter</button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login


