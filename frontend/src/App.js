import React, { useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import Upbar from './component/Upbar';
import Admin from './pages/Admin';
import Calendrier from './pages/Calendrier';
import GererEquipe from './pages/GererEquipe';
import Home from './pages/Home';
import Login from './pages/Login';
import MfaSetup from './pages/MfaSetup';
import Planning from './pages/Planning';
import Pointage from './pages/Pointage';
import Profil from './pages/Profil';
import ReservationVehicule from './pages/ReservationVehicule';
import CreateAnnouncement from './pages/CreateAnnouncement';
import Announcements from './pages/Announcements';
import Trombinoscope from './pages/Trombinoscope';
import UserAnalytics from './pages/UserAnalytics';
import UserProfile from './pages/UserProfile';
import authService from './services/authService';
import Notifications from './pages/Notifications';

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
            {window.location.pathname !== '/login' &&
                window.location.pathname !== '/login/mfa-setup' &&
                window.location.pathname !== '/mfa-setup' && (
                    <Upbar />
                )}

            <Routes>
                <Route path="/login" element={<Login />} />

                <Route
                    path="/login/mfa-setup"
                    element={
                        <RequireAuth>
                            <MfaSetup />
                        </RequireAuth>
                    }
                />
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
                    path="/notification"
                    element={
                        <RequireAuth>
                            <Notifications />
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
                            <Profil />
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
                <Route
                    path="/reservation-vehicule"
                    element={
                        <RequireAuth>
                            <ReservationVehicule />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/create-announcement"
                    element={
                        <RequireAuth>
                            <CreateAnnouncement />
                    path="/trombinoscope"
                    element={
                        <RequireAuth>
                            <Trombinoscope />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/announcements"
                    element={
                        <RequireAuth>
                            <Announcements />
                    path="/user-profile/:userId"
                    element={
                        <RequireAuth>
                            <UserProfile />
                        </RequireAuth>
                    }
                />

                <Route path="*" element={<Navigate to={authService.isAuthenticated() ? '/home' : '/login'} replace />} />
            </Routes>
        </div>
    );
}

export default App;