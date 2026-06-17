import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="flex min-h-screen bg-warm-white">
      <DashboardSidebar user={session.user} />
      <main className="min-w-0 flex-1 overflow-x-hidden lg:ml-0">
        <div className="px-4 pb-8 pt-16 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  );
}
