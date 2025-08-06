// src/components/LoginPage.js
import React, { useState } from 'react';

function LoginPage({ setPage, onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (response.ok) {
                onLoginSuccess(data.user);
            } else {
                setError(data.message || 'Login failed.');
            }
        } catch (err) {
            setError('Could not connect to the server.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Login to Udhaar+</h2>
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Username</label>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required />
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition duration-200 disabled:bg-green-300 font-semibold">
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            <p className="text-center mt-4">
                New here?{' '}
                <button onClick={() => setPage('register')} className="text-green-600 hover:underline font-semibold">Create an account</button>
            </p>
        </div>
    );
}

export default LoginPage;
