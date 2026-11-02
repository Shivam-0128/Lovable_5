import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { currentStreak, lastSevenDays } from "@/lib/habit-stats";

export const Route = createFileRoute("/_authenticated/habits/$id")({
  head: () => ({
    meta: [
      { title: "Habit — Tally" },
      { name: "description", content: "Track a habit over the last 7 days and discuss it." },
      { property: "og:title", content: "Habit — Tally" },
      { property: "og:description", content: "Track a habit over the last 7 days and discuss it." },
    ],
  }),
  component: HabitPage,
});

function HabitPage() {
  const { id } = Route.useParams();
  const { userId } = Route.useRouteContext();
  const qc = useQueryClient();
  const [comment, setComment] = useState("");

  const habit = useQuery({
    queryKey: ["habit", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("habits")
        .select("id,name,when_i_do_it,user_id,is_shared,profiles(display_name)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const done = useQuery({
    queryKey: ["completions", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("completions").select("day").eq("habit_id", id);
      if (error) throw error;
      return data.map((r) => r.day);
    },
  });

  const comments = useQuery({
    queryKey: ["comments", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("id,body,created_at,profiles(display_name)")
        .eq("habit_id", id)
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const toggle = useMutation({
    mutationFn: async ({ day, checked }: { day: string; checked: boolean }) => {
      const { error } = checked
        ? await supabase.from("completions").insert({ habit_id: id, day })
        : await supabase.from("completions").delete().eq("habit_id", id).eq("day", day);
      if (error) throw error;
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["completions", id] });
      qc.invalidateQueries({ queryKey: ["community"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const post = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("comments")
        .insert({ habit_id: id, user_id: userId, body: comment.trim().slice(0, 2000) });
      if (error) throw error;
    },
    onSuccess: () => {
      setComment("");
      qc.invalidateQueries({ queryKey: ["comments", id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    post.mutate();
  }

  if (habit.isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!habit.data) return <p className="text-muted-foreground">This habit isn't available.</p>;

  const h = habit.data;
  const isOwner = h.user_id === userId;
  const doneDays = done.data ?? [];
  const doneSet = new Set(doneDays);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl">{h.name}</h1>
        {!isOwner && <p className="mt-1 text-sm text-muted-foreground">by {h.profiles?.display_name}</p>}
        <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-muted-foreground">When I do it</h2>
        <p className="mt-1 whitespace-pre-wrap">{h.when_i_do_it || "—"}</p>
      </div>

      <div className="flex gap-8 rounded-xl border bg-card p-6">
        <div><span className="text-muted-foreground">Days done:</span> <strong className="font-display text-2xl">{doneDays.length}</strong></div>
        <div><span className="text-muted-foreground">Current streak:</span> <strong className="font-display text-2xl">{currentStreak(doneDays)}</strong></div>
      </div>

      <section>
        <h2 className="mb-3 text-2xl">Last 7 days</h2>
        <ul className="space-y-2">
          {lastSevenDays().map((day) => (
            <li key={day} className="flex items-center gap-3">
              <Checkbox
                id={`d-${day}`}
                checked={doneSet.has(day)}
                disabled={!isOwner || toggle.isPending}
                onCheckedChange={(v) => toggle.mutate({ day, checked: v === true })}
              />
              <Label htmlFor={`d-${day}`} className="font-mono">{day}</Label>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl">Comments</h2>
        <ul className="space-y-3">
          {comments.data?.length === 0 && <li className="text-muted-foreground">No comments yet.</li>}
          {comments.data?.map((c) => (
            <li key={c.id} className="rounded-lg border bg-card p-4">
              <div className="text-sm font-semibold text-primary">{c.profiles?.display_name}</div>
              <p className="mt-1 whitespace-pre-wrap">{c.body}</p>
            </li>
          ))}
        </ul>
        <form onSubmit={submit} className="space-y-2">
          <Label htmlFor="comment">Comment</Label>
          <Textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={2000} />
          <Button type="submit" disabled={post.isPending}>Post comment</Button>
        </form>
      </section>
    </div>
  );
}
