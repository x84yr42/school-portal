import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      <div className="pl-64">
        <Header />
        <main className="mx-auto max-w-[1280px] p-8">{children}</main>
      </div>
    </div>
  );
}
