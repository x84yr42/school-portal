import { auth } from "@/lib/auth";

export async function Header() {
  const session = await auth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-8">
      <h1 className="text-xl font-semibold text-gray-900">Admin Portal</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{session?.user?.name}</span>
        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
          {session?.user?.role}
        </span>
      </div>
    </header>
  );
}
