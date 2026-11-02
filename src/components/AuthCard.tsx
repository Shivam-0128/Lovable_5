import type { ReactNode } from "react";

export function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border bg-card p-8 shadow-sm">
        <div className="mb-1 font-display text-lg text-primary">Tally</div>
        <h1 className="mb-6 text-3xl">{title}</h1>
        {children}
      </div>
    </div>
  );
}
