import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, Loader2, X, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { safeReturnTo } from "@/lib/authReturnTo";
import { toast } from "sonner";

function GoogleAccountModal({ isOpen, onClose, onSelectAccount }) {
  const [customEmail, setCustomEmail] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  if (!isOpen) return null;

  const accounts = [
    { name: "Biprash Pandey", email: "biprashpandey@gmail.com", avatarBg: "#ea4335" },
    { name: "Champion User", email: "user.champion@gmail.com", avatarBg: "#4285f4" },
  ];

  const handleSelect = (email, name) => {
    setIsAuthenticating(true);
    setTimeout(() => {
      onSelectAccount(email, name);
    }, 600);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    handleSelect(customEmail.trim(), customEmail.split("@")[0]);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <GoogleIcon className="w-5 h-5" />
              <h3 className="font-heading text-sm font-bold text-foreground">Sign in with Google</h3>
            </div>
            <button onClick={onClose} className="rounded-full p-1 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-muted-foreground">Choose an account to continue to <strong>LOVE MEEE</strong></p>

          {isAuthenticating ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs font-semibold text-foreground">Signing in with Google…</p>
            </div>
          ) : (
            <div className="space-y-2">
              {accounts.map(acc => (
                <button
                  key={acc.email}
                  onClick={() => handleSelect(acc.email, acc.name)}
                  className="w-full flex items-center gap-3 rounded-2xl border border-border bg-muted/30 p-3 hover:bg-muted/60 transition-all text-left active:scale-98"
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ background: acc.avatarBg }}
                  >
                    {acc.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground truncate">{acc.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{acc.email}</p>
                  </div>
                </button>
              ))}

              <div className="pt-2">
                <form onSubmit={handleCustomSubmit} className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Use another Google account..."
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="h-10 text-xs"
                  />
                  <Button type="submit" disabled={!customEmail.trim()} className="w-full h-9 text-xs font-bold">
                    Sign in with this Google account
                  </Button>
                </form>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const returnTo = safeReturnTo();

  const handlePostLoginRedirect = () => {
    const hasGoal = !!localStorage.getItem('love_meee_goals');
    const target = (returnTo && returnTo !== '/login') ? returnTo : (hasGoal ? '/' : '/onboarding');
    navigate(target);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      login(email, password);
      toast.success("Welcome back! 🎉");
      handlePostLoginRedirect();
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = (selectedEmail, selectedName) => {
    loginWithGoogle(selectedEmail, selectedName);
    toast.success(`Signed in with Google as ${selectedEmail}! 🎉`);
    setShowGoogleModal(false);
    handlePostLoginRedirect();
  };

  return (
    <>
      <AuthLayout
        icon={LogIn}
        title="Welcome back"
        subtitle="Log in to your account"
        footer={
          <>
            Don't have an account?{" "}
            <Link
              to={"/register" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : "")}
              className="text-primary font-medium hover:underline"
            >
              Create one
            </Link>
          </>
        }
      >
        <Button
          variant="outline"
          className="w-full h-12 text-sm font-medium mb-6 shadow-sm hover:border-primary/50 transition-colors"
          onClick={() => setShowGoogleModal(true)}
        >
          <GoogleIcon className="w-5 h-5 mr-2" />
          Continue with Google
        </Button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-3 text-muted-foreground">or</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12"
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Logging in...
              </>
            ) : (
              "Log in"
            )}
          </Button>
        </form>
      </AuthLayout>

      <GoogleAccountModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSelectAccount={handleGoogleSuccess}
      />
    </>
  );
}
