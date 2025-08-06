// src/components/ShopkeeperDashboard.js
import React, { useState, useEffect, useCallback } from 'react';

const Icon = ({ path, className }) => (
    <svg className={`w-6 h-6 mr-3 text-gray-500 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={path}></path>
    </svg>
);

const ProductManager = ({ user, products, setProducts }) => {
    const [newProductName, setNewProductName] = useState('');
    const [newProductPrice, setNewProductPrice] = useState('');
    const [newProductCategory, setNewProductCategory] = useState('General');
    const [isLoading, setIsLoading] = useState(false);

    const handleAddProduct = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newProductName, price: newProductPrice, category: newProductCategory, shop_id: user.shop_id })
            });
            const newProduct = await response.json();
            if (response.ok) {
                setProducts(prev => [...prev, newProduct].sort((a,b) => a.name.localeCompare(b.name)));
                setNewProductName(''); setNewProductPrice(''); setNewProductCategory('General');
            } else { alert('Failed to add product.'); }
        } catch (error) { alert('Could not connect to server.'); } 
        finally { setIsLoading(false); }
    };

    return (
        <div>
            <div className="bg-gray-50 p-4 rounded-lg mb-6 border">
                <h3 className="text-xl font-semibold mb-3">Add New Product</h3>
                <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div className="lg:col-span-2"><label className="block text-sm font-medium text-gray-700">Product Name</label><input type="text" value={newProductName} onChange={e => setNewProductName(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-md" required /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Category</label><select value={newProductCategory} onChange={e => setNewProductCategory(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-md bg-white"><option>General</option><option>Snacks</option><option>Beverages</option><option>Dairy</option><option>Groceries</option><option>Toiletries</option></select></div>
                    <div><label className="block text-sm font-medium text-gray-700">Price (₹)</label><input type="number" step="0.01" value={newProductPrice} onChange={e => setNewProductPrice(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-md" required /></div>
                    <button type="submit" disabled={isLoading} className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 h-10 w-full lg:w-auto">{isLoading ? 'Adding...' : '+ Add Product'}</button>
                </form>
            </div>
            <h3 className="text-2xl font-bold mb-4">Your Product List</h3>
            <div className="bg-white rounded-lg border max-h-96 overflow-y-auto">
                {products.length === 0 ? (<p className="p-4 text-gray-500">You haven't added any products yet.</p>) : (
                    <ul className="divide-y divide-gray-200">{products.map(product => (<li key={product.id} className="p-4 flex justify-between items-center"><div><p className="font-semibold text-gray-800">{product.name}</p><p className="text-sm text-gray-500">{product.category}</p></div><div className="text-lg font-medium text-gray-900">₹{product.price.toFixed(2)}</div></li>))}</ul>
                )}
            </div>
        </div>
    );
};

function ShopkeeperDashboard({ user, onLogout }) {
    const [view, setView] = useState('orders');
    const [data, setData] = useState({ orders: [], products: [], customers: [] });
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [ordersRes, productsRes] = await Promise.all([
                fetch(`http://localhost:5000/api/shop/${user.shop_id}/orders`),
                fetch(`http://localhost:5000/api/products?shop_id=${user.shop_id}`)
            ]);
            
            const customersRes = await fetch(`http://localhost:5000/api/udhaar/summary?shop_id=${user.shop_id}`);
            
            setData({
                orders: await ordersRes.json(),
                products: await productsRes.json(),
                customers: customersRes.ok ? await customersRes.json() : []
            });
        } catch (error) { console.error("Failed to fetch shop data:", error); } 
        finally { setIsLoading(false); }
    }, [user.shop_id]);

    useEffect(() => {
        fetchData();
        
        // Set up socket event listeners for real-time updates
        if (user.socket) {
            user.socket.on('new_order', (orderData) => {
                // Refresh orders when a new order comes in
                fetchData();
            });
            
            user.socket.on('order_update', (updateData) => {
                // Refresh orders when status changes
                fetchData();
            });
        }
        
        return () => {
            if (user.socket) {
                user.socket.off('new_order');
                user.socket.off('order_update');
            }
        };
    }, [fetchData]);

    const handleUpdateOrderStatus = async (orderId, status) => {
        await fetch(`http://localhost:5000/api/order/${orderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        fetchData(); // Refetch all data to ensure consistency
    };

    const renderView = () => {
        if (isLoading) return <div className="text-center p-10">Loading Dashboard...</div>;
        switch (view) {
            case 'orders':
                return (
                    <div>
                        <h3 className="text-2xl font-bold mb-4">Recent Orders</h3>
                        <div className="space-y-4">
                            {data.orders.length === 0 ? <p>No orders yet.</p> : data.orders.map(order => (
                                <div key={order.id} className="p-4 border rounded-lg bg-gray-50">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-gray-800">{order.customer_name} - Order #{order.id}</p>
                                            <p className="text-sm text-gray-600">Total: ₹{order.total_amount.toFixed(2)}</p>
                                            <ul className="text-sm text-gray-500 mt-1 list-disc pl-5">{order.items.map(item => <li key={item.id}>{item.name} x {item.quantity}</li>)}</ul>
                                        </div>
                                        <span className={`px-3 py-1 text-sm rounded-full font-semibold ${order.status === 'completed' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>{order.status}</span>
                                    </div>
                                    <div className="mt-3 pt-3 border-t">
                                        {order.status === 'pending' && <button onClick={() => handleUpdateOrderStatus(order.id, 'accepted')} className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm mr-2 hover:bg-blue-600">Accept</button>}
                                        {order.status === 'accepted' && <button onClick={() => handleUpdateOrderStatus(order.id, 'out-for-delivery')} className="bg-indigo-500 text-white px-3 py-1 rounded-lg text-sm mr-2 hover:bg-indigo-600">Out for Delivery</button>}
                                        {order.status === 'out-for-delivery' && <button onClick={() => handleUpdateOrderStatus(order.id, 'completed')} className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm mr-2 hover:bg-green-600">Mark Completed</button>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'products':
                return <ProductManager user={user} products={data.products} setProducts={(newProducts) => setData(d => ({...d, products: newProducts}))} />;
            case 'customers':
                 return (
                    <div>
                        <h3 className="text-2xl font-bold mb-4">Customer Balances</h3>
                        <div className="space-y-4">
                            {data.customers.length === 0 ? <p>No customer data yet.</p> : data.customers.map(c => (
                                <div key={c.customer_id} className="p-4 border rounded-lg flex justify-between items-center">
                                    <p className="font-bold">{c.customer_name}</p>
                                    <p className={`font-semibold ${c.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>Balance: ₹{c.balance.toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/4 pr-0 md:pr-8 md:border-r mb-6 md:mb-0">
                <h2 className="text-xl font-bold mb-2">{user.shop_name}</h2>
                <p className="text-gray-600 mb-6">Welcome, {user.name}!</p>
                <nav className="space-y-2">
                    <button onClick={() => setView('orders')} className={`w-full flex items-center p-3 rounded-lg text-left ${view === 'orders' ? 'bg-green-100 text-green-800' : 'hover:bg-gray-100'}`}><Icon path="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /> Orders</button>
                    <button onClick={() => setView('products')} className={`w-full flex items-center p-3 rounded-lg text-left ${view === 'products' ? 'bg-green-100 text-green-800' : 'hover:bg-gray-100'}`}><Icon path="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /> Products</button>
                    <button onClick={() => setView('customers')} className={`w-full flex items-center p-3 rounded-lg text-left ${view === 'customers' ? 'bg-green-100 text-green-800' : 'hover:bg-gray-100'}`}><Icon path="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a3.002 3.002 0 013.39-2.486M12 13a4 4 0 100-8 4 4 0 000 8z" /> Customers</button>
                </nav>
                <button onClick={onLogout} className="w-full mt-8 text-left p-3 text-red-600 hover:bg-red-50 rounded-lg flex items-center"><Icon path="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /> Logout</button>
            </div>
            <div className="w-full md:w-3/4 md:pl-8">
                {renderView()}
            </div>
        </div>
    );
}

export default ShopkeeperDashboard;
