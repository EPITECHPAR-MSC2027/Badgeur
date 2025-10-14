import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
// import reportWebVitals from './reportWebVitals';
import './style/theme.css'
import './style/pointage.css'
import Upbar from './component/Upbar'
import Home from './pages/Home'
import Pointage from './pages/Pointage'
import Planning from './pages/Planning'
import Calendrier from './pages/Calendrier'
import Profil from './pages/Profil'
import ParamTre from './pages/Parametre'
import Login from './pages/Login'
import GererEquipe from './pages/GererEquipe'
import Analytics from './pages/Analytics'
import authService from './services/authService'
import Admin from './pages/Admin';

function App() {
  const [currentPage, setCurrentPage] = useState('login')
  const roleId = parseInt(localStorage.getItem('roleId'));

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'main'
    document.documentElement.setAttribute('data-theme', savedTheme)
    
    // Vérifier si l'utilisateur est déjà connecté
    if (authService.isAuthenticated()) {
      setCurrentPage('home')
    }
  }, [])

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <Login onSubmit={() => setCurrentPage('home')} />
      case 'home':
        return <Home />
      case 'pointage':
        return <Pointage />
      case 'planning':
        return <Planning />
      case 'calendrier':
        return <Calendrier />
      case 'profil':
        return <Profil />
      case 'parameter':
        return <ParamTre />
      case 'gererEquipe':
        return <GererEquipe />
      case 'analytics':
        return <Analytics />
      case 'admin':
        // Vérifier que seuls les admins peuvent accéder à cette page
        return roleId === 2 ? <Admin /> : <Home />;
      default:
        return <Home />
    }
  }

  return (
    <div className="App">
      {currentPage !== 'login' && (
        <Upbar currentPage={currentPage} onNavigate={setCurrentPage} />
      )}
      {renderPage()}
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
