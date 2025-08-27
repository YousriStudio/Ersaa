import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ersa Training',
  description: 'Professional development courses designed to elevate your career and unlock your potential',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <head>
        <link rel="stylesheet" href="/fontawesome/css/all.min.css" />
      </head>
      <body className="font-cairo">
        {children}
      </body>
    </html>
  );
}
