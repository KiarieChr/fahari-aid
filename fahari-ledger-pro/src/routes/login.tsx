import { createFileRoute, useNavigate, Navigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Loader2, AlertCircle, Eye, EyeOff, Building2 } from "lucide-react";
import { isAuthenticated, login } from "@/api/auth";
import { ApiError } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBranding } from "@/context/BrandingContext";
import loginBg from "@/assets/login-bg.jpg";


export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — Jesus Enthroned Network" },
      {
        name: "description",
        content: "Sign in to the Church Management Portal.",
      },
    ],
  }),
  component: LoginPage,
});

// Helper to convert hex to rgba for dynamic brand tinting
function hexToRgba(hex: string, alpha: number) {
  if (!hex) return `rgba(30, 58, 138, ${alpha})`;
  const cleanHex = hex.replace("#", "");
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return `rgba(30, 58, 138, ${alpha})`;
}

function LoginPage() {
  const { branding } = useBranding();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (typeof window !== "undefined" && isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const {
    name = "Fahari Academia",
    short_name = "Fahari",
    logo_url = null,
    primary_color = "#2544a0",
    tagline = "Manage your institution efficiently",
  } = branding || {};

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage("Email address or username is required.");
      return;
    }
    if (!password) {
      setErrorMessage("Password is required.");
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      navigate({ to: "/" });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setErrorMessage("Invalid email or password.");
        } else if (err.status === 403) {
          setErrorMessage("Your account is inactive. Contact an administrator.");
        } else {
          setErrorMessage(err.message || "An unexpected error occurred.");
        }
      } else {
        setErrorMessage("Unable to reach the server. Check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const tintedInputBg = hexToRgba(primary_color, 0.08);
  const tintedCardBorder = hexToRgba(primary_color, 0.15);

  return (
    <div
      className="flex min-h-screen w-full items-center justify-center p-4 sm:p-6 md:p-8"
      style={{
        background: `radial-gradient(circle at 50% 20%, ${hexToRgba(
          primary_color,
          0.12
        )} 0%, #e2e8f0 75%, #cbd5e1 100%)`,
      }}
    >
      {/* Centered Split-Screen Card */}
      <div className="relative flex flex-col md:flex-row w-full max-w-[1020px] min-h-[540px] rounded-[28px] md:rounded-[36px] overflow-hidden shadow-2xl bg-white border border-white/60">
        {/* Left Panel (Visual/Brand) - Desktop only */}
        <div className="relative hidden md:flex md:w-1/2 flex-col justify-between p-8 lg:p-12 text-left overflow-hidden">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center linear-to-bl scale-105 "
            style={{
              backgroundImage:
                `url(${loginBg})`,
            }}
          />

          {/* New Gradient Overlay + Blur */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, ${hexToRgba(
                primary_color,
                0.85
              )} 0%, ${hexToRgba(primary_color, 0.45)} 100%)`,
            }}
          />

          {/* Subtle Vignette Depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/35 pointer-events-none" />

          {/* Centered Branding Hero Block (Maintains original row layout, centered in container) */}
          <div className="relative z-10 my-auto flex items-center justify-center w-full">
            <div className="flex items-center gap-4">
              {/* Left Side: Logo / Icon Container */}
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-lg overflow-hidden">
                {logo_url ? (
                  <img src={logo_url} alt="Logo" className="h-10 w-10 object-contain" />
                ) : (
                  <Building2 className="h-8 w-8 text-white/90" />
                )}
              </div>

              {/* Right Side: Text Stack */}
              <div className="flex flex-col text-left min-w-0">
                <h1 className="text-lg uppercase lg:text-xl font-bold text-white tracking-tight leading-tight truncate">
                  {name}
                </h1>
                {tagline && (
                  <p className="text-xs sm:text-sm text-white/80 font-medium mt-1 leading-snug">
                    {tagline}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Standalone Secondary Software Element (Bottom Anchor) */}
          <div className="relative z-10 mt-auto pt-8">
            <div className="inline-block rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 px-3.5 py-1.5 text-xs text-white/85 font-medium">
              Fahari Eklesia - Church Management System
            </div>
          </div>
        </div>

        {/* Right Panel (Form) */}
        <div className="flex flex-col justify-between w-full md:w-1/2 p-6 sm:p-10 md:p-12 lg:p-14 bg-white">
          {/* Mobile Top Brand Header */}
          <div className="md:hidden flex items-center justify-center gap-3.5 mb-6 text-center">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm"
              style={{ backgroundColor: primary_color }}
            >
              {logo_url ? (
                <img src={logo_url} alt={name} className="h-8 w-8 object-contain rounded-lg p-0.5" />
              ) : (
                <Building2 className="h-6 w-6 text-white" />
              )}
            </div>
            <div className="text-left">
              <span className="font-bold text-md uppercase font-display text-slate-800 block leading-tight">
                {name}
              </span>
              <span className="text-xs text-muted-foreground font-medium pl-6">
                {tagline}
              </span>
            </div>
          </div>

          {/* Main Form Content Container */}
          <div className="my-auto space-y-6">
            {/* Header */}
            <div className="text-center space-y-1">
              <h2
                className="text-2xl md:text-3xl font-bold font-display tracking-tight"
                style={{ color: primary_color }}
              >
                Sign In
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                Welcome back to the portal
              </p>
            </div>

            {/* Error Alert */}
            {errorMessage && (
              <Alert
                variant="destructive"
                role="alert"
                className="border-destructive/40 bg-destructive/10 rounded-xl py-2 px-3.5 text-xs"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <AlertDescription className="text-xs ml-1 font-medium">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Email / Username Field */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-xs font-semibold"
                  style={{ color: primary_color }}
                >
                  Email / Username
                </Label>
                <Input
                  id="email"
                  type="text"
                  autoComplete="username"
                  autoFocus
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="h-11 rounded-xl text-sm border focus-visible:ring-1 transition-all"
                  style={{
                    backgroundColor: tintedInputBg,
                    borderColor: tintedCardBorder,
                  }}
                />
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="text-xs font-semibold"
                  style={{ color: primary_color }}
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="h-11 rounded-xl text-sm border pr-10 focus-visible:ring-1 transition-all"
                    style={{
                      backgroundColor: tintedInputBg,
                      borderColor: tintedCardBorder,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground p-1 focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between pt-0.5">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  <label
                    htmlFor="remember"
                    className="text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer select-none"
                  >
                    Remember me
                  </label>
                </div>

                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold hover:underline transition-colors"
                  style={{ color: primary_color }}
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 md:h-12 rounded-xl font-semibold text-white shadow-md hover:brightness-105 active:scale-[0.99] transition-all text-sm md:text-base mt-2"
                style={{ backgroundColor: primary_color }}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              {/* Footer Onboarding Link */}
              <div className="text-center pt-2">
                <span className="text-xs text-muted-foreground">
                  New to {short_name || "Fahari"}?{" "}
                </span>
                <Link
                  to="/register"
                  className="text-xs font-semibold hover:underline transition-colors"
                  style={{ color: primary_color }}
                >
                  Become a Member of {short_name || "Fahari"}
                </Link>
              </div>
            </form>
          </div>

          {/* Global Footer (Bottom of Right Panel) */}
          <div className="pt-8 text-center space-y-0.5 select-none">
            <p className="text-xs font-medium text-muted-foreground">
              Powered by{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Royal Software Solutions
              </span>
            </p>
            <p className="text-[11px] text-muted-foreground/75">
              Fahari Eklesia - Institution Management System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
