import './styles/common.css';
import ClientLayout from './ClientLayout';

export const metadata = {
    title: 'TIPT Toolkit',
    description: 'TIPT Toolkit is a collection of tools for the TIPT phone system.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <ClientLayout>{children}</ClientLayout>
            </body>
        </html>
    );
}