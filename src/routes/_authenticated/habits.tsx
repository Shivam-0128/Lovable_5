import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/habits")({
  head: () => ({
    meta: [
      { title: "My habits — Tally" },
      { name: "description", content: "Your daily habits, private and shared." },
      { property: "og:title", content: "My habits — Tally" },
      { property: "og:description", content: "Your daily habits, private and shared." },
    ],
  }),
  component: MyHabits,
});

function MyHabits() {
  const { userId } = Route.useRouteContext();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [when, setWhen] = useState("");
  const [shared, setShared] = useState(false);

  const habits = useQuery({
    queryKey: ["my-habits", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("habits")
        .select("id,name,is_shared")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("habits").insert({
        user_id: userId,
        name: name.trim().slice(0, 200),
        when_i_do_it: when.trim().slice(0, 2000),
        is_shared: shared,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setName(""); setWhen(""); setShared(false);
      qc.invalidateQueries({ queryKey: ["my-habits"] });
      qc.invalidateQueries({ queryKey: ["community"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return toast.error("Please enter a habit name");
    add.mutate();
  }

  return (
    <div className="space-y-10">
      <h1 className="text-4xl">My habits</h1>
      <form onSubmit={submit} className="space-y-4 rounded-xl border bg-card p-6">
        <div className="space-y-1.5">
          <Label htmlFor="hname">Habit name</Label>
          <Input id="hname" value={name} onChange={(e) => setName(e.target.value)} maxLength={200} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="hwhen">When I do it</Label>
          <Textarea id="hwhen" value={when} onChange={(e) => setWhen(e.target.value)} maxLength={2000}
            placeholder="When you usually do it, and what makes you more likely to" />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="hshare" checked={shared} onCheckedChange={(v) => setShared(v === true)} />
          <Label htmlFor="hshare">Share with the community</Label>
        </div>
        <Button type="submit" disabled={add.isPending}>Add habit</Button>
      </form>

      <ul className="divide-y rounded-xl border bg-card">
        {habits.data?.length === 0 && <li className="p-5 text-muted-foreground">No habits yet.</li>}
        {habits.data?.map((h) => (
          <li key={h.id} className="flex items-center justify-between p-5">
            <Link to="/habits/$id" params={{ id: h.id }} className="font-medium hover:text-primary hover:underline">
              {h.name}
            </Link>
            <span className={h.is_shared
              ? "rounded-full bg-shared px-3 py-0.5 text-xs font-semibold text-shared-foreground"
              : "rounded-full bg-muted px-3 py-0.5 text-xs font-semibold text-muted-foreground"}>
              {h.is_shared ? "Shared" : "Private"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
