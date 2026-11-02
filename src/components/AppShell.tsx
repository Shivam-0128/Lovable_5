import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const linkCls =
  "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent";
const activeCls = "bg-sidebar-accent text-sidebar-primary";

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/signin", replace: true });
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 flex-col gap-2 bg-sidebar p-5 text-sidebar-foreground md:flex">
        <div className="mb-6 font-display text-2xl">Tally</div>
        <Link to="/habits" className={linkCls} activeProps={{ className: activeCls }}>
          My habits
        </Link>
        <Link to="/community" className={linkCls} activeProps={{ className: activeCls }}>
          Community
        </Link>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-card px-6 py-3">
          <nav className="flex gap-4 text-sm font-medium">
            <Link to="/habits" activeProps={{ className: "text-primary underline underline-offset-4" }}>
              My habits
            </Link>
            <Link to="/community" activeProps={{ className: "text-primary underline underline-offset-4" }}>
              Community
            </Link>
          </nav>
          <Button variant="outline" size="sm" onClick={signOut}>
            Sign out
          </Button>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">{children}</main>
      </div>
    </div>
  );
}
