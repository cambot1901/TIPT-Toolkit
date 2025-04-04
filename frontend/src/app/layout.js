import Link from 'next/link';
import Script from 'next/script';
import './styles/common.css'; // Import the common CSS file

export const metadata = {
    title: 'TIPT Toolkit',
    description: 'TIPT Toolkit is a collection of tools for the TIPT phone system.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                {/* Google Analytics Script */}
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
            </head>
            <body>
                <div className="container">
                    {/* Left-Hand Menu */}
                    <div className="menu">
                        {/* Logo */}
                        <div className="logo">
                            <img src="/logo.png" alt="Logo" className="logo-image" />
                        </div>

                        <ul>
                            <li><Link href="/">Home</Link></li>
                            <li><Link href="/directory">Directory</Link></li>
                        </ul>

                        {/* Footer */}
                        <footer className="menu-footer">
                            © 2025 Cam Titley
                        </footer>
                    </div>

                    {/* Main Content */}
                    <div className="content">
                        {children}
                    </div>
                </div>
            </body>
        </html>
    );
}