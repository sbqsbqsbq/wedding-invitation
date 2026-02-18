import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wedding Invitation | Daeyeong & Jiin',
  description: 'Wedding Invitation',
};

export default function EnLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
