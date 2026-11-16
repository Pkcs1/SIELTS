import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import '../index.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
});

export const metadata: Metadata = {
  title: 'SIELTS — Interactive IELTS Academy & Simulator',
  description:
    'Interactive IELTS learning platform with all 17 question type strategies, multi-accent neural audio, computer-delivered simulations, and AI study coach.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased selection:bg-[#FF6B2C]/20 selection:text-[#C2410C]">
        {children}
      </body>
    </html>
  );
}
