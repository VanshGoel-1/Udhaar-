// src/App.js
import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// Import all our components from the 'components' folder
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ShopkeeperDashboard from './components/ShopkeeperDashboard';
import CustomerDashboard from './components/CustomerDashboard';
import HomePage from './components/HomePage';
import OrdersPage from './components/OrdersPage';
import HistoryPage from './components/HistoryPage';
import ProfilePage from './components/ProfilePage';


// Icon component for the bottom navigation
const NavIcon = ({ path, label, isActive }) => (
    <div className={`flex flex-col items-center w-full pt-2 pb-1 ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={path}></path>
        </svg>
        <span className="text-xs mt-1">{label}</span>
    </div>
);


function App() {
    const [user, setUser] = useState(null);
    const [page, setPage] = useState('login'); // login, register, dashboard
    const [activeTab, setActiveTab] = useState('home'); // For customer navigation
    const [socket, setSocket] = useState(null);

    // Check for a logged-in user in sessionStorage when the app first loads
    useEffect(() => {
        const storedUser = sessionStorage.getItem('udhaarUser');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setPage('dashboard');
            
            const newSocket = io('http://localhost:5000'); 
            setSocket(newSocket);

            if(parsedUser.role === 'shopkeeper') {
                newSocket.emit('join_shop_room', { shop_id: parsedUser.shop_id });
            }
        }
        
        // This is a placeholder for a more robust cleanup function
        return () => {
            if(socket) socket.disconnect();
        }
    }, []);

    const handleLoginSuccess = (userData) => {
        sessionStorage.setItem('udhaarUser', JSON.stringify(userData));
        setUser(userData);
        setPage('dashboard');
        window.location.reload(); 
    };

    const handleLogout = () => {
        sessionStorage.removeItem('udhaarUser');
        setUser(null);
        setPage('login');
        if(socket) socket.disconnect();
    };
    
    // This is a placeholder for the pages we will build next
    const renderCustomerPage = () => {
        switch(activeTab) {
            case 'home':
                return <HomePage user={user} />;
            case 'orders':
                return <OrdersPage user={user} />;
            case 'history':
                return <HistoryPage user={user} />;
            case 'profile':
                return <ProfilePage user={user} onLogout={handleLogout} />;
            default:
                return <HomePage user={user} />;
        }
    }

    const renderMainContent = () => {
        if (!user) {
            if (page === 'register') {
                return <RegisterPage setPage={setPage} />;
            }
            return <LoginPage setPage={setPage} onLoginSuccess={handleLoginSuccess} />;
        }

        if (user.role === 'shopkeeper') {
            return <ShopkeeperDashboard user={user} onLogout={handleLogout} socket={socket} />;
        }
        
        return (
            <div className="pb-20">
                {renderCustomerPage()}
                <div className="fixed bottom-0 left-0 right-0 bg-white shadow-t-md border-t">
                    <div className="flex justify-around">
                        <button onClick={() => setActiveTab('home')} className="flex-1">
                            <NavIcon path="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" label="Home" isActive={activeTab === 'home'} />
                        </button>
                        <button onClick={() => setActiveTab('orders')} className="flex-1">
                            <NavIcon path="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" label="Orders" isActive={activeTab === 'orders'} />
                        </button>
                        <button onClick={() => setActiveTab('history')} className="flex-1">
                            <NavIcon path="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" label="History" isActive={activeTab === 'history'} />
                        </button>
                         <button onClick={() => setActiveTab('profile')} className="flex-1">
                            {/* THIS IS THE CORRECTED LINE */}
                            <NavIcon path="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" label="Profile" isActive={activeTab === 'profile'} />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans">
             <header className="bg-green-600 text-white p-4 shadow-lg sticky top-0 z-10">
                <div className="container mx-auto text-center">
                    <h1 className="text-2xl font-bold tracking-wider">🛍 Udhaar+</h1>
                </div>
            </header>
            <main className="container mx-auto p-4 pb-20">
                <div className="bg-white p-6 rounded-xl shadow-lg min-h-[75vh]">
                    {renderMainContent()}
                </div>
            </main>
        </div>
    );
}

export default App;
