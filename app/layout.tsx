import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'Summit Gear Co. dashboard',
  description: 'A deliberately slow page, fixed step by step',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
