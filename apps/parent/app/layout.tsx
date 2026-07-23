import { BottomNav } from "@/components/bottom-nav";
import { AuthProvider } from "@/components/auth-provider";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 pb-20">
        <AuthProvider>
          <main>{children}</main>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
