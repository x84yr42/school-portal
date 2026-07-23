import { auth } from "@/lib/auth";

export async function Header() {
  const session = await auth();

  return (
    <header className="flex h-14 items-center justify-between border-b border-[#e6e6e6] bg-white px-8">
      <div />
      <div className="flex items-center gap-4">
        <span className="text-body-sm font-[330] text-black">{session?.user?.name}</span>
        <span className="inline-flex items-center radius-pill bg-black px-3 py-1 text-[13px] font-[480] text-white">
          {session?.user?.role}
        </span>
      </div>
    </header>
  );
}
