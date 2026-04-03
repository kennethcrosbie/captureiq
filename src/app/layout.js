import '../styles/globals.css';
import Sidebar from '../components/Sidebar';

export const metadata = {
  title: 'CaptureIQ — AI Capture & Editorial Pipeline',
  description: 'AI-powered footage analysis, editorial intelligence, and ARC compliance screening for 2K Games.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-brand-navy text-white min-h-screen">
        <Sidebar />
        <main className="ml-60 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
