'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { Key } from 'lucide-react';

export default function ClientLayout({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showLoginForm, setShowLoginForm] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // Check localStorage on mount
    useEffect(() => {
        const storedAuth = localStorage.getItem('isAuthenticated');
        if (storedAuth === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        if (username === 'admin' && password === 'X36n80ac') {
            setIsAuthenticated(true);
            document.cookie = "admin_auth=true; path=/";
            setShowLoginForm(false);
            setUsername('');
            setPassword('');
        } else {
            alert('Invalid credentials');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        document.cookie = "admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    };

    return (
        <div className="container">
            <Script
                src="https://www.googletagmanager.com/gtag/js?id=G-RJC174XHZS"
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', 'G-RJC174XHZS');
                `}
            </Script>

            {/* Menu */}
            <div className="menu">
                <div className="logo">
                    <img src="/logo.png" alt="Logo" className="logo-image" />
                </div>

                <ul>
                    <li><Link href="/">Home</Link></li>
                    <li><Link href="/directory">Directory</Link></li>
                    {isAuthenticated && 
                        <>
                        <li><Link href="/users">Users</Link></li>
                        <li><Link href="/groups">Groups</Link></li>
                    </>
                    }
                </ul>

                {/* Admin login/logout control */}
                <div className="key-icon-wrapper">
                    {!isAuthenticated ? (
                        <Key size={20} onClick={() => setShowLoginForm(!showLoginForm)} />
                    ) : (
                        <button onClick={handleLogout} className="logout-button">Logout</button>
                    )}
                </div>

                <footer className="menu-footer">
                    © 2025 Cam Titley
                </footer>
            </div>

            {/* Main Content */}
            <div className="content">
                {children}

                {!isAuthenticated && showLoginForm && (
                    <div className="login-popup">
                        <h3>Admin Login</h3>
                        <form onSubmit={handleLogin}>
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button type="submit">Login</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
