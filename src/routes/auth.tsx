import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Staff Login | AMARC" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Account created. Check your email to confirm, then sign in.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in successfully.");
        navigate({ to: "/admin" });
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  const inputCls =
    "w-full rounded-sm border border-border bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-amber";

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-5">
      <div className="w-full max-w-md border border-border bg-surface p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center bg-amber font-display text-lg font-bold text-primary-foreground">
            A
          </span>
          <div>
            <p className="font-display text-lg font-bold tracking-tight">AMARC staff</p>
            <p className="label-mono text-[9px] text-muted-foreground">Dashboard access</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <input required name="email" type="email" placeholder="Email" className={inputCls} />
          <input
            required
            name="password"
            type="password"
            placeholder="Password"
            minLength={6}
            className={inputCls}
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full min-h-[44px] rounded-sm bg-amber px-5 py-3 text-sm font-semibold text-primary-foreground transition-all md:hover:brightness-110 disabled:opacity-60"
          >
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-5 inline-flex min-h-[36px] items-center text-sm text-muted-foreground underline underline-offset-4 md:hover:text-amber"
        >
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
