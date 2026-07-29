import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GuideLoop · Next.js App Router',
  description: 'Multi-page guided tour example with sessionStorage persist',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
