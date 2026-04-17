import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import '../styles/LoginPage.css';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('Username y password son requeridos');
            return;
        }

        try {
            setLoading(true);
            const response = await apiService.login(username, password);

            if (response.status === 'ok') {
                navigate('/admin');
            } else {
                setError(response.message || 'Error al autenticar');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Error al autenticar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>Admin Portal</h1>
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="admin"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="****"
                            disabled={loading}
                        />
                    </div>

                    {error && <div className="alert alert-error">{error}</div>}

                    <button type="submit" disabled={loading} className="btn-login">
                        {loading ? 'Autenticando...' : 'Ingresar'}
                    </button>
                </form>

                <p className="login-footer">
                    <a href="/">Volver al reloj</a>
                </p>
            </div>
        </div>
    );
}
