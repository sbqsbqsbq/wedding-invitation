import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wedding Invitation | Daeyeong & Jeen",
  description: "Wedding Invitation",
};

export default function EnLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
