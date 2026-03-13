import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { trpc } from "../utils/trpc.js";
import { useAuth } from "../utils/auth.js";

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const widgetRef = useRef<HTMLDivElement>(null);

  const authMutation = trpc.auth.telegramAuth.useMutation({
    onSuccess: (data) => {
      login(data.token, data.user);
      navigate("/", { replace: true });
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
      return;
    }

    (window as any).onTelegramAuth = (user: any) => {
      authMutation.mutate(user);
    };

    if (widgetRef.current) {
      const script = document.createElement("script");
      script.src = "https://telegram.org/js/telegram-widget.js?22";
      script.async = true;
      script.setAttribute(
        "data-telegram-login",
        import.meta.env.VITE_TELEGRAM_BOT_USERNAME || "YourBotUsername"
      );
      script.setAttribute("data-size", "large");
      script.setAttribute("data-radius", "8");
      script.setAttribute("data-onauth", "onTelegramAuth(user)");
      script.setAttribute("data-request-access", "write");
      widgetRef.current.appendChild(script);
    }

    return () => {
      delete (window as any).onTelegramAuth;
    };
  }, [isAuthenticated]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo"><GraduationCap size={32} /></div>
          <h1 className="auth-title">IELTS Writing Mastery</h1>
          <p className="auth-subtitle">From 6.5 to 7.5+ — practice that actually works</p>
        </div>

        <div className="auth-body" style={{ textAlign: "center", padding: "var(--space-6) var(--space-4)" }}>
          <p style={{ marginBottom: "1.5rem", color: "var(--text-secondary)" }}>
            Sign in with your Telegram account to start practising
          </p>
          <div ref={widgetRef} style={{ display: "flex", justifyContent: "center" }} />
          {authMutation.isPending && (
            <p style={{ marginTop: "1rem", color: "var(--text-tertiary)" }}>Signing in…</p>
          )}
          {authMutation.isError && (
            <p className="auth-error" style={{ marginTop: "1rem" }}>
              Authentication failed. Please try again.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
