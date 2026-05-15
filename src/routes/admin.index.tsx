import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { isCurrentUserAdmin } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { ShieldCheck, LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — TIJCEF Assessment 2026" },
      { name: "robots", content: "noindex" },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      throw redirect({ to: "/admin/login" });
    }
  },
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const checkAdmin = useServerFn(isCurrentUserAdmin);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setEmail(data.user?.email ?? null);
      try {
        const res = await checkAdmin();
        setIsAdmin(res.isAdmin);
        if (res.bootstrapped) {
          toast.success("You've been set as the first admin.");
        }
      } catch {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [checkAdmin]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login" });
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center px-4">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-semibold">Access denied</h1>
          <p className="text-muted-foreground">
            Your account ({email}) is not authorized as an admin.
          </p>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="size-4 mr-2" /> Sign out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-background/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 grid place-items-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="font-semibold leading-none">TIJCEF Admin</p>
              <p className="text-xs text-muted-foreground">{email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="size-4 mr-2" /> Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground mb-8">
          Phase 2 dashboard (stats, questions CRUD, leaderboard, exports) is coming next.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {["Volunteers", "Questions", "Avg. Score"].map((label) => (
            <div
              key={label}
              className="rounded-xl border border-border/60 bg-card p-6"
            >
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-3xl font-bold mt-2">—</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
