// src/components/RegisterPage.js
import React, { useState } from 'react';

function RegisterPage({ setPage }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('customer');
    const [shopName, setShopName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        let payload = { username, password, name, role };
        if (role === 'shopkeeper') {
            payload.shop_name = shopName;
        }
        try {
            const response = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (response.ok) {
                alert('Registration successful! Please log in.');
                setPage('login');
            } else {
                setError(data.message || 'Registration failed.');
            }
        } catch (err) {
            setError('Could not connect to the server.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Create Your Account</h2>
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</p>}
            }
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">I am a...</label>
                    <select value={role} onChange={e => setRole(e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option value="customer">Customer / Resident</option>
                        <option value="shopkeeper">Shopkeeper</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Full Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
                </div>
                {role === 'shopkeeper' && (
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Shop Name</label>
                        <input type="text" value={shopName} onChange={e => setShopName(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
                    </div>
                )}
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Username</label>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition duration-200 disabled:bg-green-300 font-semibold">
                    {isLoading ? 'Creating Account...' : 'Register'}
                </button>
            </form>
            <p className="text-center mt-4">
                Already have an account?{' '}
                <button onClick={() => setPage('login')} className="text-green-600 hover:underline font-semibold">Login here</button>
            </p>
        </div>
    );
}

export default RegisterPage;
