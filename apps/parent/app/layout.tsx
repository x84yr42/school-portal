import { BottomNav } from "@/components/bottom-nav";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 pb-20">
        <main>{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
