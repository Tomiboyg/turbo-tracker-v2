import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { AuthShell, Field } from "./login";
import { useAuth } from "../context/AuthContext";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — Turbo tracker" },
      { name: "description", content: "Create a free Turbo tracker account and start logging." },
    ],
  }),
  component: Signup,
});

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});

function Signup() {
  const navigate = useNavigate();
  const { user, loading, signUp } = useAuth();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const data = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      name: data.get("name"),
      email: data.get("email"),
      password: data.get("password"),
    });
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const issue of parsed.error.issues) fe[issue.path[0] as string] = issue.message;
      setErrors(fe);
      setSubmitting(false);
      return;
    }
    const err = await signUp(parsed.data.name, parsed.data.email, parsed.data.password);
    if (err) {
      setErrors({ form: err });
      setSubmitting(false);
    } else {
      setSuccess(true);
    }
  };

  return (
    <AuthShell title="Start training" subtitle="Free forever. Your data stays yours.">
      {success ? (
        <div className="text-center">
          <div className="rounded-md bg-volt/10 p-4 text-sm text-volt">
            Account created! Check your email to confirm your account, then log in.
          </div>
          <Link
            to="/login"
            className="mt-4 inline-block rounded-md bg-volt px-6 py-3 font-semibold text-volt-foreground hover:opacity-90"
          >
            Go to login
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Name" name="name" error={errors.name} />
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
            {submitting ? "Creating account..." : "Create account"}
          </button>
          <p className="text-center text-sm text-muted-foreground">
            Already lifting with us?{" "}
            <Link to="/login" className="text-volt hover:underline">
              Log in
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
