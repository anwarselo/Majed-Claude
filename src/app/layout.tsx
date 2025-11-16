import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Business Microsite Generator',
  description: 'Create crawlable microsites for your business that ChatGPT can discover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}

