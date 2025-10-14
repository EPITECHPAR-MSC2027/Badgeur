# Service d'Authentification JWT

Ce service gère l'authentification JWT pour l'application Badgeur.

## Utilisation

### Import du service

```javascript
import authService from '../services/authService'
```

### Méthodes disponibles

#### `isAuthenticated()`
Vérifie si l'utilisateur est connecté.

```javascript
if (authService.isAuthenticated()) {
    // L'utilisateur est connecté
}
```

#### `getAccessToken()`
Récupère le token d'accès depuis le localStorage.

```javascript
const token = authService.getAccessToken()
```

#### `logout()`
Déconnecte l'utilisateur et supprime tous les tokens du localStorage.

```javascript
authService.logout()
```

### Requêtes HTTP authentifiées

Le service fournit des méthodes pour faire des requêtes HTTP avec authentification automatique :

#### `get(url, options)`
```javascript
const response = await authService.get('/api/users')
const data = await response.json()
```

#### `post(url, data, options)`
```javascript
const response = await authService.post('/api/badge-events', {
    timestamp: new Date().toISOString()
})
```

#### `put(url, data, options)`
```javascript
const response = await authService.put('/api/users/123', {
    firstName: 'Nouveau prénom'
})
```

#### `delete(url, options)`
```javascript
const response = await authService.delete('/api/users/123')
```

#### `authenticatedFetch(url, options)`
Méthode générique pour les requêtes personnalisées.

```javascript
const response = await authService.authenticatedFetch('/api/custom-endpoint', {
    method: 'PATCH',
    body: JSON.stringify(data)
})
```

## Gestion des erreurs

Le service gère automatiquement les erreurs 401 (Non autorisé) :
- Si une requête retourne 401, l'utilisateur est automatiquement déconnecté
- La page est rechargée pour rediriger vers la page de connexion

## Stockage des données

Le service stocke les données suivantes dans le localStorage :
- `accessToken` : Token JWT d'accès
- `refreshToken` : Token de rafraîchissement (optionnel)
- `firstName` : Prénom de l'utilisateur
- `lastName` : Nom de l'utilisateur
- `email` : Email de l'utilisateur
- `roleId` : ID du rôle de l'utilisateur
- `userId` : ID de l'utilisateur

## Exemple d'utilisation complète

```javascript
import React, { useState, useEffect } from 'react'
import authService from '../services/authService'

function MyComponent() {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const response = await authService.get('/api/data')
            if (response.ok) {
                const result = await response.json()
                setData(result)
            }
        } catch (error) {
            console.error('Erreur lors du chargement:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (formData) => {
        try {
            const response = await authService.post('/api/submit', formData)
            if (response.ok) {
                alert('Données sauvegardées avec succès!')
                loadData() // Recharger les données
            }
        } catch (error) {
            alert('Erreur lors de la sauvegarde')
        }
    }

    if (loading) return <div>Chargement...</div>

    return (
        <div>
            {/* Votre interface utilisateur */}
        </div>
    )
}
```
