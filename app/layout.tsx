import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RentBack Admin',
  description: 'Admin & staff console for RentBack.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
