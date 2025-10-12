import React, { useState, useEffect } from 'react'
import authService from '../services/authService'

function Profil() {
    const [userData, setUserData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        roleId: null
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadUserData()
    }, [])

    const loadUserData = async () => {
        try {
            // Récupérer les données depuis localStorage (déjà stockées lors de la connexion)
            const firstName = localStorage.getItem('firstName') || ''
            const lastName = localStorage.getItem('lastName') || ''
            const email = localStorage.getItem('email') || ''
            const roleId = localStorage.getItem('roleId') || null

            setUserData({ firstName, lastName, email, roleId: parseInt(roleId) })
            
            // Optionnel : faire une requête API pour récupérer les données à jour
            // const response = await authService.get('/users/me')
            // if (response.ok) {
            //     const data = await response.json()
            //     setUserData(data)
            // }
        } catch (error) {
            console.error('Erreur lors du chargement des données utilisateur:', error)
        } finally {
            setLoading(false)
        }
    }

    const cardStyle = {
        backgroundColor: 'var(--color-primary)',
        borderRadius: 12,
        padding: 20,
        boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
        marginTop: 16,
        maxWidth: 600
    }

    const labelStyle = {
        color: 'var(--color-second-text)',
        fontSize: 14,
        marginBottom: 8,
        fontWeight: 600
    }

    const valueStyle = {
        color: 'var(--color-third)',
        fontSize: 16,
        marginBottom: 16,
        padding: '8px 12px',
        backgroundColor: 'var(--color-background)',
        borderRadius: 6,
        border: '1px solid #e0e0e0'
    }

    if (loading) {
        return (
            <div>
                <h1>Profil</h1>
                <div style={cardStyle}>
                    <p>Chargement des données...</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            <h1>Profil</h1>
            <div style={cardStyle}>
                <h2 style={{ marginTop: 0, marginBottom: 20 }}>Informations personnelles</h2>
                
                <div>
                    <div style={labelStyle}>Prénom</div>
                    <div style={valueStyle}>{userData.firstName}</div>
                </div>

                <div>
                    <div style={labelStyle}>Nom</div>
                    <div style={valueStyle}>{userData.lastName}</div>
                </div>

                <div>
                    <div style={labelStyle}>Email</div>
                    <div style={valueStyle}>{userData.email}</div>
                </div>

                <div>
                    <div style={labelStyle}>Rôle</div>
                    <div style={valueStyle}>
                        {userData.roleId === 1 ? 'Manager' : 'Employé'}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profil


