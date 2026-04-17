import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import RelojPage from './pages/RelojPage';
import CalendarioPage from './pages/CalendarioPage';
import NominasPage from './pages/NominasPage';
import HistorialPage from './pages/HistorialPage';
import LoginPage from './pages/LoginPage';
import AdminLogsPage from './pages/AdminLogsPage';
import AdminCalendariosPage from './pages/AdminCalendariosPage';
import AdminHomePage from './pages/AdminHomePage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Landing page - employee code entry + section directory */}
                <Route path="/" element={<LandingPage />} />

                {/* Employee sections - require employee code in session */}
                <Route
                    path="/reloj"
                    element={
                        <ProtectedRoute requiredAuth="employee">
                            <RelojPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/calendario"
                    element={
                        <ProtectedRoute requiredAuth="employee">
                            <CalendarioPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/nominas"
                    element={
                        <ProtectedRoute requiredAuth="employee">
                            <NominasPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/historial"
                    element={
                        <ProtectedRoute requiredAuth="employee">
                            <HistorialPage />
                        </ProtectedRoute>
                    }
                />

                {/* Admin auth */}
                <Route path="/login" element={<LoginPage />} />

                {/* Admin home - requires superuser JWT, shows section buttons */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute requiredAuth="superuser">
                            <AdminHomePage />
                        </ProtectedRoute>
                    }
                />

                {/* Admin sections - require superuser JWT */}
                <Route
                    path="/admin/logs"
                    element={
                        <ProtectedRoute requiredAuth="superuser">
                            <AdminLogsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/calendarios"
                    element={
                        <ProtectedRoute requiredAuth="superuser">
                            <AdminCalendariosPage />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
