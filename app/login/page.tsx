"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const idToken = await credential.user.getIdToken();

      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        throw new Error("Could not start a session. Please try again.");
      }

      router.push(next);
      router.refresh();
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container-low px-5">
      <div className="w-full max-w-md glass-effect rounded-2xl p-10">
        <div className="text-center mb-10">
          <span className="font-display text-2xl tracking-widest text-on-surface uppercase">
            Lumière
          </span>
          <p className="text-on-surface-variant mt-2">Admin &amp; Supplier Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-xs font-semibold tracking-[0.1em] uppercase text-on-surface-variant">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-outline-variant bg-white/70 px-4 py-3 text-on-surface outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
              placeholder="you@company.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-xs font-semibold tracking-[0.1em] uppercase text-on-surface-variant">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-outline-variant bg-white/70 px-4 py-3 text-on-surface outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-error bg-error-container/40 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="reflection-sweep mt-2 py-3.5 rounded-lg bg-on-surface text-white text-xs font-semibold tracking-[0.2em] uppercase hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
