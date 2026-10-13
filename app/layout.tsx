import type { Metadata } from 'next';
import './globals.css';
import { StoreProvider } from '../lib/store';
import { AuthProvider } from '../lib/auth';
import Navbar from '../components/Navbar';

export const metadata: Metadata = {
  title: 'Blood Donation Drive Coordinator',
  description: 'Manage donors, camps, appointments, reports + Gemini AI planning.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <StoreProvider>
            <Navbar />
            <main className="container">{children}</main>
            <footer className="footer">
              <span>Blood Donation Drive Coordinator · Final eligibility must be confirmed by qualified healthcare personnel.</span>
            </footer>
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
