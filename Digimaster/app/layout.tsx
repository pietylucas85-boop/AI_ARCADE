import React from 'react';

export const metadata = {
  title: 'Digimaster',
  description: 'AI Automation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
