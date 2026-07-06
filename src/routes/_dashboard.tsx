import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { getAdminExists } from "@/lib/auth.functions";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/_dashboard")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) return;
    const { exists } = await getAdminExists();
    throw redirect({ to: exists ? "/login" : "/register" });
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <div className="hidden md:block">
        <AppSidebar />
      </div>
      <main className="relative flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}
