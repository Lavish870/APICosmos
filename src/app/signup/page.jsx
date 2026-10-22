
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import LiquidNavbar from "../../components/LiquidNavbar";
import "./page.css";

const API_BASE_URL = "http://localhost:5000/api/auth";

function AuthPageContent() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function saveLogin(data) {
    if (data.token) {
      localStorage.setItem("apicosmos-token", data.token);
    }

    if (data.user) {
      localStorage.setItem("apicosmos-user", JSON.stringify(data.user));
    }

    window.dispatchEvent(new Event("apicosmos-auth-change"));
    router.push("/");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/login" : "/signup";
      const body = isLogin
        ? { email, password }
        : { name, email, password };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Something went wrong.");
      }

      saveLogin(data);
    } catch (error) {
      setMessage(error.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSuccess(credentialResponse) {
    if (!credentialResponse?.credential) {
      setMessage("Google login failed. Please try again.");
      return;
    }

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Google login failed.");
      }

      saveLogin(data);
    } catch (error) {
      setMessage(error.message || "Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function switchMode(loginMode) {
    setIsLogin(loginMode);
    setMessage("");
    setName("");
    setEmail("");
    setPassword("");
  }

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  return (
    <main className="cosmos-auth-page">
      <LiquidNavbar />

      <section className="cosmos-auth-scene" aria-hidden="true">
        <div className="cosmos-auth-grid">
          {Array.from({ length: 324 }, (_, index) => (
            <span key={index} />
          ))}
        </div>
        <div className="cosmos-auth-glow" />
      </section>

      <section className="cosmos-auth-card">
        <div className="cosmos-auth-brand">
          <div className="cosmos-auth-logo">A</div>
          <p className="cosmos-auth-eyebrow">APICOSMOS ACCESS</p>
        </div>

        <h1 className="cosmos-auth-heading">
          {isLogin ? "Welcome back." : "Create your account."}
        </h1>

        <p className="cosmos-auth-subtitle">
          {isLogin
            ? "Sign in to explore your API universe."
            : "Join the universe and start exploring APIs."}
        </p>

        <div className="cosmos-auth-tabs" role="tablist" aria-label="Authentication options">
          <button
            type="button"
            role="tab"
            aria-selected={isLogin}
            className={isLogin ? "active" : ""}
            onClick={() => switchMode(true)}
          >
            Login
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={!isLogin}
            className={!isLogin ? "active" : ""}
            onClick={() => switchMode(false)}
          >
            Sign up
          </button>
        </div>

        <form className="cosmos-auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="cosmos-auth-field">
              <label htmlFor="auth-name">Full name</label>
              <input
                id="auth-name"
                type="text"
                placeholder="Enter your name"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
          )}

          <div className="cosmos-auth-field">
            <label htmlFor="auth-email">Email address</label>
            <input
              id="auth-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="cosmos-auth-field">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              placeholder="Enter your password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {message && (
            <p className="cosmos-auth-message" role="alert">
              {message}
            </p>
          )}

          <button className="cosmos-auth-submit" type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : isLogin
                ? "Login to APICosmos"
                : "Create account"}
          </button>
        </form>

        <div className="cosmos-auth-divider">
          <span />
          <p>OR CONTINUE WITH</p>
          <span />
        </div>

        <div className="cosmos-auth-google">
          {googleClientId ? (
            <GoogleOAuthProvider clientId={googleClientId}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setMessage("Google login failed. Please try again.")}
                theme="outline"
                shape="rectangular"
                size="large"
                text="continue_with"
                width="320"
              />
            </GoogleOAuthProvider>
          ) : (
            <p className="cosmos-auth-message">
              Google login is not configured. Check your frontend environment variables.
            </p>
          )}
        </div>

        <p className="cosmos-auth-switch">
          {isLogin ? "New to APICosmos?" : "Already have an account?"}{" "}
          <button type="button" onClick={() => switchMode(!isLogin)}>
            {isLogin ? "Create an account" : "Login"}
          </button>
        </p>

        <button
          type="button"
          className="cosmos-auth-back"
          onClick={() => router.push("/")}
        >
          ← Back to home
        </button>
      </section>

      <p className="cosmos-auth-footer">EXPLORE. BUILD. CONNECT.</p>
    </main>
  );
}

export default function SignupPage() {
  return <AuthPageContent />;
}
