import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { apiService } from '../services/api';
import { hasEmployeeCode } from '../utils/session';

/**
 * ProtectedRoute wrapper component.
 * Redirects based on the required auth type:
 *   - 'employee'  : requires empleadoCode in sessionStorage
 *   - 'superuser' : requires admin JWT token in localStorage
 *
 * Special case: /reloj allows direct access even without session.
 * The RelojPage itself handles the missing session by showing inline input.
 */
export default function ProtectedRoute({ children, requiredAuth }) {
    const location = useLocation();

    if (requiredAuth === 'employee') {
        // /reloj is special: allows direct access, page shows inline input
        if (location.pathname === '/reloj') {
            // Allow render regardless of session
        } else if (!hasEmployeeCode()) {
            return <Navigate to="/" replace />;
        }
    }

    if (requiredAuth === 'superuser') {
        if (!apiService.isAuthenticated()) {
            return <Navigate to="/login" replace />;
        }
    }

    return children;
}
