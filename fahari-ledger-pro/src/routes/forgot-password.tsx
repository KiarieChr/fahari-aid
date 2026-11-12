import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthField } from "@/components/auth/AuthField";
import { AuthButton } from "@/components/auth/AuthButton";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — Institution Portal" },
      {
        name: "description",
        content: "Request a secure password reset link for your account.",
      },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(undefined);
    if (!email) return setError("Email is required");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email");

    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setSent(true);
  };

  return (
    <AuthLayout
      title={sent ? "Check your inbox" : "Forgot your password?"}
      subtitle={
        sent
          ? "We've sent a secure reset link to your email."
          : "Enter your email and we'll send you a reset link."
      }
      footer={
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div className="rounded-2xl border border-success/30 bg-success/5 p-5">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 place-content-center rounded-xl bg-success/15 text-success">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Reset link sent</p>
              <p className="text-sm text-muted-foreground">
                If <span className="font-medium text-foreground">{email}</span> matches
                an account, you'll receive instructions shortly. The link expires in 30
                minutes.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <AuthField
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="you@institution.com"
            icon={<Mail className="h-4 w-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
          />
          <AuthButton type="submit" loading={loading}>
            {loading ? "Sending link…" : "Send reset link"}
          </AuthButton>
        </form>
      )}
    </AuthLayout>
  );
}
