import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Mail, Lock, User, Building2 } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthField } from "@/components/auth/AuthField";
import { AuthButton } from "@/components/auth/AuthButton";
import { Checkbox } from "@/components/ui/checkbox";
import { useBranding } from "@/context/BrandingContext";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register Member Profile — Institution Portal" },
      {
        name: "description",
        content: "Register your profile and join the institution management portal.",
      },
    ],
  }),
  component: RegisterPage,
});

interface FormState {
  fullName: string;
  organization: string;
  email: string;
  password: string;
}

function RegisterPage() {
  const navigate = useNavigate();
  const { branding } = useBranding();
  const {
    name = "Jesus Enthroned Network",
    short_name = "J.E.N",
    primary_color = "#1e3a8a",
  } = branding || {};

  const [form, setForm] = useState<FormState>({
    fullName: "",
    organization: "",
    email: "",
    password: "",
  });
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState | "agree", string>>>({});
  const [loading, setLoading] = useState(false);

  const update = (key: keyof FormState) => (v: string) =>
    setForm((s) => ({ ...s, [key]: v }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!form.fullName.trim()) next.fullName = "Full name is required";
    if (!form.organization.trim()) next.organization = "Branch, Campus or Fellowship is required";
    if (!form.email) next.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email address";
    if (!form.password) next.password = "Password is required";
    else if (form.password.length < 8) next.password = "Use at least 8 characters";
    if (!agree) next.agree = "You must accept the terms to continue";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1100));
    setLoading(false);
    toast.success("Profile registered successfully! Welcome to " + (short_name || "the portal"));
    navigate({ to: "/login" });
  };

  return (
    <AuthLayout
      title={`Join ${short_name || "the Community"}`}
      subtitle={`Register your profile to access ${name} and stay connected.`}
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold underline-offset-4 hover:underline transition-colors"
            style={{ color: primary_color }}
          >
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AuthField
            label="Full Name"
            placeholder="e.g. Samuel Mwangi"
            icon={<User className="h-4 w-4" />}
            autoComplete="name"
            value={form.fullName}
            onChange={(e) => update("fullName")(e.target.value)}
            error={errors.fullName}
          />
          <AuthField
            label="Branch / Fellowship"
            placeholder="e.g. Main Campus / Youth"
            icon={<Building2 className="h-4 w-4" />}
            autoComplete="organization"
            value={form.organization}
            onChange={(e) => update("organization")(e.target.value)}
            error={errors.organization}
          />
        </div>
        <AuthField
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          icon={<Mail className="h-4 w-4" />}
          autoComplete="email"
          value={form.email}
          onChange={(e) => update("email")(e.target.value)}
          error={errors.email}
        />
        <AuthField
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          icon={<Lock className="h-4 w-4" />}
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => update("password")(e.target.value)}
          error={errors.password}
          hint="Use a mix of letters, numbers, and symbols."
        />

        <div className="space-y-1">
          <label className="inline-flex cursor-pointer items-start gap-2 text-sm text-foreground/80">
            <Checkbox
              checked={agree}
              onCheckedChange={(v) => setAgree(Boolean(v))}
              className="mt-0.5"
            />
            <span className="text-xs sm:text-sm">
              I agree to the{" "}
              <span className="font-semibold" style={{ color: primary_color }}>Terms of Service</span> and{" "}
              <span className="font-semibold" style={{ color: primary_color }}>Privacy Policy</span>.
            </span>
          </label>
          {errors.agree ? (
            <p className="text-xs font-medium text-destructive">{errors.agree}</p>
          ) : null}
        </div>

        <AuthButton
          type="submit"
          loading={loading}
          style={{ backgroundColor: primary_color }}
        >
          {loading ? "Registering profile…" : `Register with ${short_name || "Portal"}`}
        </AuthButton>
      </form>
    </AuthLayout>
  );
}
