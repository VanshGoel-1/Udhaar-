// src/components/OrdersPage.js
import React, { useState, useEffect } from 'react';

function OrdersPage({ user }) {
    const [view, setView] = useState('shopList'); // shopList, productList, orderSuccess
    const [shops, setShops] = useState([]);
    const [selectedShop, setSelectedShop] = useState(null);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [cart, setCart] = useState([]);

    useEffect(() => {
        const fetchShops = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/shops');
                const data = await response.json();
                if (response.ok) setShops(data);
            } catch (error) { 
                console.error("Failed to fetch shops", error); 
            } finally { 
                setIsLoading(false); 
            }
        };

        if (view === 'shopList') {
            fetchShops();
        }
    }, [view]);

    useEffect(() => {
        let timer;
        if (view === 'orderSuccess') {
            timer = setTimeout(() => {
                backToShops();
            }, 3000);
        }
        return () => clearTimeout(timer);
    }, [view]);

    const fetchProductsForShop = async (shop) => {
        setIsLoading(true);
        setSelectedShop(shop);
        try {
            const response = await fetch(`/api/products?shop_id=${shop.id}`);
            const data = await response.json();
            if (response.ok) {
                setProducts(data);
                setView('productList');
            }
        } catch (error) { 
            console.error("Failed to fetch products", error); 
        } finally { 
            setIsLoading(false); 
        }
    };
    
    const backToShops = () => {
        setView('shopList');
        setSelectedShop(null);
        setProducts([]);
        setCart([]);
    };

    const updateCartQuantity = (product, newQuantity) => {
        setCart(currentCart => {
            if (newQuantity <= 0) return currentCart.filter(item => item.id !== product.id);
            const existingItem = currentCart.find(item => item.id === product.id);
            if (existingItem) {
                return currentCart.map(item => item.id === product.id ? { ...item, quantity: newQuantity } : item);
            }
            return [...currentCart, { ...product, quantity: 1 }];
        });
    };

    const placeOrder = async () => {
        if (cart.length === 0) return alert('Your cart is empty.');
        setIsLoading(true);
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customer_id: user.id, shop_id: selectedShop.id, items: cart })
            });
            if (response.ok) setView('orderSuccess');
            else alert('Failed to place order.');
        } catch (error) {
            alert('Could not connect to server.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

    if (view === 'orderSuccess') {
        return (
            <div className="text-center py-12">
                <svg className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="mt-4 text-3xl font-bold text-gray-800">Order Placed Successfully!</h2>
                <p className="mt-2 text-gray-600">The shopkeeper has been notified. Redirecting...</p>
            </div>
        );
    }

    if (view === 'productList' && selectedShop) {
        return (
            <div>
                <div className="flex justify-between items-center mb-4">
                    <button onClick={backToShops} className="text-green-600 hover:underline font-semibold">← Back to Shops</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <h2 className="text-3xl font-bold mb-1">{selectedShop.shop_name}</h2>
                        <p className="text-gray-500 mb-4">Owned by {selectedShop.owner_name}</p>
                        <div className="bg-white rounded-lg border max-h-[60vh] overflow-y-auto">
                            {isLoading ? <p className="p-4">Loading...</p> : products.map(product => {
                                const cartItem = cart.find(item => item.id === product.id);
                                const quantityInCart = cartItem ? cartItem.quantity : 0;
                                return (
                                    <li key={product.id} className="p-4 flex justify-between items-center list-none border-b">
                                        <div>
                                            <p className="font-semibold">{product.name}</p>
                                            <p className="text-sm text-gray-500">₹{product.price.toFixed(2)}</p>
                                        </div>
                                        {quantityInCart === 0 ? (
                                            <button onClick={() => updateCartQuantity(product, 1)} className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 text-sm">+ Add</button>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => updateCartQuantity(product, quantityInCart - 1)} className="bg-gray-200 w-8 h-8 rounded-full">-</button>
                                                <span className="font-bold w-8 text-center">{quantityInCart}</span>
                                                <button onClick={() => updateCartQuantity(product, quantityInCart + 1)} className="bg-gray-200 w-8 h-8 rounded-full">+</button>
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </div>
                    </div>
                    <div className="md:col-span-1">
                        <div className="bg-gray-50 p-4 rounded-lg border sticky top-8">
                            <h3 className="text-2xl font-bold mb-4">Your Cart</h3>
                            {cart.length === 0 ? <p>Your cart is empty.</p> : (
                                <>
                                    <ul className="mb-4 max-h-60 overflow-y-auto">
                                        {cart.map(item => (
                                            <li key={item.id} className="py-2 flex justify-between">
                                                <span>{item.name} x {item.quantity}</span>
                                                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="border-t pt-4">
                                        <div className="flex justify-between font-bold text-xl">
                                            <span>Total</span>
                                            <span>₹{cartTotal.toFixed(2)}</span>
                                        </div>
                                        <button onClick={placeOrder} disabled={isLoading} className="w-full mt-4 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-green-300">
                                            {isLoading ? 'Placing...' : 'Place Order'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold">Place New Order</h2>
                <p className="text-gray-600">Choose a shop to start ordering</p>
            </div>
            <div className="space-y-4">
                {isLoading ? <p>Loading shops...</p> : shops.map(shop => (
                    <div key={shop.id} onClick={() => fetchProductsForShop(shop)} className="p-6 bg-gray-50 border rounded-lg hover:bg-green-50 cursor-pointer">
                        <h3 className="text-xl font-semibold text-green-700">{shop.shop_name}</h3>
                        <p className="text-sm text-gray-600">Proprietor: {shop.owner_name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default OrdersPage;