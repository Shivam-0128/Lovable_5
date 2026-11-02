import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/community")({
  head: () => ({
    meta: [
      { title: "Community — Tally" },
      { name: "description", content: "Habits your group has chosen to share." },
      { property: "og:title", content: "Community — Tally" },
      { property: "og:description", content: "Habits your group has chosen to share." },
    ],
  }),
  component: Community,
});

function Community() {
  const shared = useQuery({
    queryKey: ["community"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("habits")
        .select("id,name,when_i_do_it,profiles(display_name),completions(count)")
        .eq("is_shared", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-4xl">Community</h1>
      {shared.data?.length === 0 && <p className="text-muted-foreground">No shared habits yet.</p>}
      <ul className="space-y-4">
        {shared.data?.map((h) => (
          <li key={h.id} className="rounded-xl border bg-card p-6">
            <Link to="/habits/$id" params={{ id: h.id }} className="font-display text-2xl hover:text-primary hover:underline">
              {h.name}
            </Link>
            <div className="mt-1 text-sm text-muted-foreground">by {h.profiles?.display_name}</div>
            <p className="mt-3 whitespace-pre-wrap">{h.when_i_do_it || "—"}</p>
            <div className="mt-3 text-sm">
              <span className="text-muted-foreground">Days done:</span>{" "}
              <strong>{h.completions?.[0]?.count ?? 0}</strong>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
