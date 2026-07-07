import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Dumbbell } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — Turbo tracker" },
      { name: "description", content: "Sign in to Turbo tracker to track your workouts." },
    ],
  }),
  component: Login,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});

function Login() {
  const navigate = useNavigate();
  const { user, loading, signIn } = useAuth();
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const data = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      email: data.get("email"),
      password: data.get("password"),
    });
    if (!parsed.success) {
      const fe: typeof errors = {};
      for (const issue of parsed.error.issues) {
        fe[issue.path[0] as "email" | "password"] = issue.message;
      }
      setErrors(fe);
      setSubmitting(false);
      return;
    }
    const err = await signIn(parsed.data.email, parsed.data.password);
    if (err) {
      setErrors({ form: err });
      setSubmitting(false);
    } else {
      navigate({ to: "/dashboard" });
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to keep the streak going.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Email" name="email" type="email" error={errors.email} />
        <Field label="Password" name="password" type="password" error={errors.password} />
        {errors.form ? (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {errors.form}
          </div>
        ) : null}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-volt py-3 font-semibold text-volt-foreground hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Signing in..." : "Log in"}
        </button>
        <p className="text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link to="/signup" className="text-volt hover:underline">
            Create account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
        <Link to="/" className="mb-8 flex items-center gap-2 self-start">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-volt text-volt-foreground">
            <Dumbbell className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <span className="font-display text-2xl tracking-wide">turbo tracker</span>
        </Link>
        <h1 className="font-display text-4xl">{title}</h1>
        <p className="mt-1 text-muted-foreground">{subtitle}</p>
        <div className="mt-8 rounded-2xl border border-border bg-card p-6">{children}</div>
      </div>
    </div>
  );
}

export function Field({
  label,
  name,
  type = "text",
  error,
}: {
  label: string;
  name: string;
  type?: string;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input
        name={name}
        type={type}
        className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-foreground outline-none focus:border-volt focus:ring-1 focus:ring-volt"
      />
      {error ? <span className="mt-1 block text-xs text-destructive">{error}</span> : null}
    </label>
  );
}
