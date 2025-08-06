// src/components/HomePage.js
import React, { useState, useEffect } from 'react';

function HomePage({ user }) {
    const [customerData, setCustomerData] = useState({
        current_balance: 0,
        active_orders: [],
        history: []
    });
    const [shops, setShops] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [customerRes, shopsRes] = await Promise.all([
                    fetch(`http://localhost:5000/api/customer/${user.id}/data`),
                    fetch('http://localhost:5000/api/shops')
                ]);
                
                if (customerRes.ok) {
                    const customerData = await customerRes.json();
                    setCustomerData(customerData);
                }
                
                if (shopsRes.ok) {
                    const shopsData = await shopsRes.json();
                    setShops(shopsData);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user.id]);

    if (isLoading) {
        return <div className="text-center p-8">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800">Welcome, {user.name}!</h2>
                <p className="text-gray-600">Your neighborhood credit system</p>
            </div>

            {/* Current Balance Card */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Current Balance</h3>
                <p className="text-3xl font-bold">
                    ₹{Math.abs(customerData.current_balance).toFixed(2)}
                    <span className="text-sm ml-2">
                        {customerData.current_balance > 0 ? '(You owe)' : '(Credit)'}
                    </span>
                </p>
            </div>

            {/* Active Orders */}
            {customerData.active_orders.length > 0 && (
                <div className="bg-white p-4 rounded-lg border">
                    <h3 className="text-lg font-semibold mb-3">Active Orders</h3>
                    <div className="space-y-2">
                        {customerData.active_orders.map(order => (
                            <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <div>
                                    <p className="font-medium">{order.shop_name}</p>
                                    <p className="text-sm text-gray-600">Order #{order.id}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">₹{order.total_amount.toFixed(2)}</p>
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                        order.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                                        order.status === 'accepted' ? 'bg-blue-200 text-blue-800' :
                                        'bg-purple-200 text-purple-800'
                                    }`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Shop Access */}
            <div className="bg-white p-4 rounded-lg border">
                <h3 className="text-lg font-semibold mb-3">Available Shops</h3>
                <div className="grid grid-cols-1 gap-3">
                    {shops.slice(0, 3).map(shop => (
                        <div key={shop.id} className="p-3 bg-gray-50 rounded-lg border hover:bg-green-50 cursor-pointer transition-colors">
                            <h4 className="font-medium text-green-700">{shop.shop_name}</h4>
                            <p className="text-sm text-gray-600">Owner: {shop.owner_name}</p>
                        </div>
                    ))}
                    {shops.length > 3 && (
                        <p className="text-sm text-gray-500 text-center">
                            +{shops.length - 3} more shops available
                        </p>
                    )}
                </div>
            </div>

            {/* Recent Activity */}
            {customerData.history.length > 0 && (
                <div className="bg-white p-4 rounded-lg border">
                    <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
                    <div className="space-y-2">
                        {customerData.history.slice(0, 3).map(transaction => (
                            <div key={transaction.id} className="flex justify-between items-center p-2 border-b last:border-b-0">
                                <div>
                                    <p className="font-medium">{transaction.shop_name}</p>
                                    <p className="text-sm text-gray-600">{transaction.description}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`font-semibold ${
                                        transaction.type === 'purchase' ? 'text-red-600' : 'text-green-600'
                                    }`}>
                                        {transaction.type === 'purchase' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(transaction.timestamp).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default HomePage;