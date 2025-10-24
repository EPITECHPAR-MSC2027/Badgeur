import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Upbar from './component/Upbar';
import Home from './pages/Home';
import Pointage from './pages/Pointage';
import Planning from './pages/Planning';
import Calendrier from './pages/Calendrier';
import Profil from './pages/Profil';
import ParamTre from './pages/Parametre';
import Login from './pages/Login';
import GererEquipe from './pages/GererEquipe';
import Admin from './pages/Admin';
import UserAnalytics from './pages/UserAnalytics';
import authService from './services/authService';

function App() {
  const navigate = useNavigate();
  const roleId = parseInt(localStorage.getItem('roleId'), 10);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'main';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Ne rediriger automatiquement que si l'utilisateur arrive sur la racine
    if (window.location.pathname === '/') {
      if (authService.isAuthenticated()) {
        navigate('/home', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [navigate]);

  const RequireAuth = ({ children }) => {
    return authService.isAuthenticated() ? children : <Navigate to="/login" replace />;
  };

  const RequireAdmin = ({ children }) => {
    return authService.isAuthenticated() && roleId === 2 ? children : <Navigate to="/home" replace />;
  };

  return (
    <div className="App">
      {window.location.pathname !== '/login' && (
        <Upbar />
      )}

      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/home"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        <Route
          path="/pointage"
          element={
            <RequireAuth>
              <Pointage />
            </RequireAuth>
          }
        />
        <Route
          path="/planning"
          element={
            <RequireAuth>
              <Planning />
            </RequireAuth>
          }
        />
        <Route
          path="/calendrier"
          element={
            <RequireAuth>
              <Calendrier />
            </RequireAuth>
          }
        />
        <Route
          path="/profil"
          element={
            <RequireAuth>
              <Profil />
            </RequireAuth>
          }
        />
        <Route
          path="/parametre"
          element={
            <RequireAuth>
              <ParamTre />
            </RequireAuth>
          }
        />
        <Route
          path="/gerer-equipe"
          element={
            <RequireAuth>
              <GererEquipe />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <Admin />
            </RequireAdmin>
          }
        />
        <Route
          path="/analytics"
          element={
            <RequireAuth>
              <UserAnalytics />
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to={authService.isAuthenticated() ? '/home' : '/login'} replace />} />
      </Routes>
    </div>
  );
}

export default App;


