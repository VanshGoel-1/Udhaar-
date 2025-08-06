// src/components/HistoryPage.js
import React, { useState, useEffect } from 'react';

function HistoryPage({ user }) {
    const [customerData, setCustomerData] = useState({
        current_balance: 0,
        active_orders: [],
        history: []
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCustomerData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`http://localhost:5000/api/customer/${user.id}/data`);
                if (response.ok) {
                    const data = await response.json();
                    setCustomerData(data);
                }
            } catch (error) {
                console.error('Failed to fetch customer data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCustomerData();
    }, [user.id]);

    if (isLoading) {
        return <div className="text-center p-8">Loading history...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Transaction History</h2>
                <p className="text-gray-600">Your complete transaction record</p>
            </div>

            {/* Current Balance Summary */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Current Balance</h3>
                <p className="text-3xl font-bold">
                    ₹{Math.abs(customerData.current_balance).toFixed(2)}
                    <span className="text-sm ml-2">
                        {customerData.current_balance > 0 ? '(Outstanding)' : '(Credit)'}
                    </span>
                </p>
            </div>

            {/* Active Orders */}
            {customerData.active_orders.length > 0 && (
                <div className="bg-white p-4 rounded-lg border">
                    <h3 className="text-lg font-semibold mb-3">Active Orders</h3>
                    <div className="space-y-3">
                        {customerData.active_orders.map(order => (
                            <div key={order.id} className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
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

            {/* Transaction History */}
            <div className="bg-white p-4 rounded-lg border">
                <h3 className="text-lg font-semibold mb-3">All Transactions</h3>
                {customerData.history.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No transactions yet</p>
                ) : (
                    <div className="space-y-2">
                        {customerData.history.map(transaction => (
                            <div key={transaction.id} className="flex justify-between items-center p-3 border-b last:border-b-0 hover:bg-gray-50">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${
                                            transaction.type === 'purchase' ? 'bg-red-500' : 'bg-green-500'
                                        }`}></div>
                                        <p className="font-medium">{transaction.shop_name}</p>
                                    </div>
                                    <p className="text-sm text-gray-600 ml-5">{transaction.description}</p>
                                    <p className="text-xs text-gray-500 ml-5">
                                        {new Date(transaction.timestamp).toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className={`font-semibold text-lg ${
                                        transaction.type === 'purchase' ? 'text-red-600' : 'text-green-600'
                                    }`}>
                                        {transaction.type === 'purchase' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                                    </p>
                                    <p className="text-xs text-gray-500 capitalize">{transaction.type}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default HistoryPage;