// src/components/ProfilePage.js
import React, { useState } from 'react';

function ProfilePage({ user, onLogout }) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user.name || '',
        address: user.address || '',
        society_name: user.society_name || '',
        monthly_limit: user.monthly_limit || 0
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'monthly_limit' ? parseFloat(value) || 0 : value
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        
        try {
            const response = await fetch(`http://localhost:5000/api/user/${user.id}/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            if (response.ok) {
                setMessage('Profile updated successfully!');
                setIsEditing(false);
                // Update the user data in session storage
                const updatedUser = { ...user, ...formData };
                sessionStorage.setItem('udhaarUser', JSON.stringify(updatedUser));
            } else {
                setMessage(data.message || 'Failed to update profile');
            }
        } catch (error) {
            setMessage('Could not connect to server');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: user.name || '',
            address: user.address || '',
            society_name: user.society_name || '',
            monthly_limit: user.monthly_limit || 0
        });
        setIsEditing(false);
        setMessage('');
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
                <p className="text-gray-600">Manage your account information</p>
            </div>

            {message && (
                <div className={`p-3 rounded-lg ${
                    message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                    {message}
                </div>
            )}

            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Account Information</h3>
                    {!isEditing && (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                        >
                            Edit Profile
                        </button>
                    )}
                </div>

                <form onSubmit={handleSave}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input 
                                type="text" 
                                value={user.username} 
                                disabled 
                                className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <input 
                                type="text" 
                                value={user.role} 
                                disabled 
                                className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-500 capitalize"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input 
                                type="text" 
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className={`w-full px-3 py-2 border rounded-lg ${
                                    isEditing ? 'focus:outline-none focus:ring-2 focus:ring-green-500' : 'bg-gray-50'
                                }`}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <textarea 
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                rows="3"
                                className={`w-full px-3 py-2 border rounded-lg ${
                                    isEditing ? 'focus:outline-none focus:ring-2 focus:ring-green-500' : 'bg-gray-50'
                                }`}
                                placeholder="Enter your full address"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Society Name</label>
                            <input 
                                type="text" 
                                name="society_name"
                                value={formData.society_name}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className={`w-full px-3 py-2 border rounded-lg ${
                                    isEditing ? 'focus:outline-none focus:ring-2 focus:ring-green-500' : 'bg-gray-50'
                                }`}
                                placeholder="Your society or building name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Credit Limit (₹)</label>
                            <input 
                                type="number" 
                                name="monthly_limit"
                                value={formData.monthly_limit}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                min="0"
                                step="100"
                                className={`w-full px-3 py-2 border rounded-lg ${
                                    isEditing ? 'focus:outline-none focus:ring-2 focus:ring-green-500' : 'bg-gray-50'
                                }`}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {isEditing && (
                        <div className="flex gap-3 mt-6">
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-green-300"
                            >
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button 
                                type="button" 
                                onClick={handleCancel}
                                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </form>
            </div>

            {user.role === 'shopkeeper' && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">Shop Information</h4>
                    <p className="text-blue-700">Shop Name: {user.shop_name}</p>
                    <p className="text-sm text-blue-600 mt-1">Shop ID: {user.shop_id}</p>
                </div>
            )}

            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-red-600">Danger Zone</h3>
                <button 
                    onClick={onLogout}
                    className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}

export default ProfilePage;