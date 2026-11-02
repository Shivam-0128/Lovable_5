import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Tally — community habit tracker" },
      { name: "description", content: "Track daily habits with friends, keep some private, share others and discuss." },
      { property: "og:title", content: "Tally — community habit tracker" },
      { property: "og:description", content: "Track daily habits with friends, keep some private, share others and discuss." },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    throw redirect({ to: data.user ? "/habits" : "/signin" });
  },
});
