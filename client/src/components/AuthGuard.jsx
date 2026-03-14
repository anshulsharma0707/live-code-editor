import { useState, useEffect } from "react";
import API_BASE from "../config";
import { useNavigate } from "react-router-dom";

const modalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');

  @keyframes guardFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes guardSlideUp {
    from { opacity: 0; transform: translateY(28px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes guardSpin { to { transform: rotate(360deg); } }
  @keyframes guardBlink { 0%,100%{opacity:1} 50%{opacity:0} }

  .guard-overlay {
    position: fixed; inset: 0;
    background: rgba(8,12,16,0.92);
    backdrop-filter: blur(12px);
    display: flex; align-items: center; justify-content: center;
    z-index: 9999;
    animation: guardFadeIn 0.3s ease;
    font-family: 'Syne', sans-serif;
  }

  .guard-card {
    width: 100%; max-width: 400px;
    margin: 20px;
    background: #0d1117;
    border: 1px solid #1e2a38;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(0,255,135,0.04);
    animation: guardSlideUp 0.35s ease;
  }

  .guard-top {
    background: rgba(0,255,135,0.04);
    border-bottom: 1px solid #1e2a38;
    padding: 32px 36px 28px;
    text-align: center;
  }
  .guard-logo {
    font-family: 'Space Mono', monospace;
    font-size: 13px; font-weight: 700; color: #00ff87;
    display: flex; align-items: center; justify-content: center; gap: 7px;
    margin-bottom: 24px;
  }
  .guard-logo-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #00ff87; animation: guardBlink 1.5s infinite;
  }
  .guard-lock { font-size: 36px; margin-bottom: 16px; }
  .guard-title {
    font-size: 22px; font-weight: 800;
    letter-spacing: -1px; color: #e6edf3;
    margin-bottom: 8px;
  }
  .guard-subtitle {
    font-size: 13px; color: #6e7f8e; line-height: 1.6;
  }
  .guard-subtitle span { color: #00ff87; font-weight: 700; }

  .guard-body { padding: 28px 36px 32px; }

  .guard-tabs {
    display: flex; gap: 4px;
    background: #080c10; border-radius: 10px; padding: 4px;
    margin-bottom: 24px;
  }
  .guard-tab {
    flex: 1; padding: 9px;
    border: none; background: none;
    font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700;
    color: #6e7f8e; border-radius: 7px; cursor: pointer;
    transition: all 0.2s;
  }
  .guard-tab.active { background: #1e2a38; color: #e6edf3; }

  .guard-field { margin-bottom: 14px; }
  .guard-label {
    display: block; font-family: 'Space Mono', monospace;
    font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
    color: #6e7f8e; margin-bottom: 7px;
  }
  .guard-input {
    width: 100%; background: #080c10;
    border: 1px solid #1e2a38; border-radius: 9px;
    padding: 11px 14px; color: #e6edf3;
    font-family: 'Space Mono', monospace; font-size: 13px;
    outline: none; transition: border-color 0.2s;
    box-sizing: border-box;
  }
  .guard-input:focus { border-color: rgba(0,255,135,0.4); }

  .guard-error {
    padding: 10px 14px; margin-bottom: 14px;
    background: rgba(255,123,114,0.08);
    border: 1px solid rgba(255,123,114,0.2);
    border-radius: 8px;
    font-family: 'Space Mono', monospace; font-size: 12px;
    color: #ff7b72;
    display: flex; align-items: center; gap: 8px;
  }
  .guard-success {
    padding: 10px 14px; margin-bottom: 14px;
    background: rgba(0,255,135,0.06);
    border: 1px solid rgba(0,255,135,0.2);
    border-radius: 8px;
    font-family: 'Space Mono', monospace; font-size: 12px;
    color: #00ff87;
    display: flex; align-items: center; gap: 8px;
  }

  .guard-submit {
    width: 100%; padding: 13px;
    background: #00ff87; border: none; border-radius: 9px;
    font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700;
    color: #000; cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    margin-top: 4px;
  }
  .guard-submit:hover:not(:disabled) {
    background: #00ff9f; transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(0,255,135,0.3);
  }
  .guard-submit:disabled { opacity: 0.55; cursor: not-allowed; }

  .guard-spinner {
    width: 15px; height: 15px;
    border: 2px solid rgba(0,0,0,0.25); border-top-color: #000;
    border-radius: 50%; animation: guardSpin 0.6s linear infinite;
  }

  .guard-back {
    width: 100%; margin-top: 12px; padding: 10px;
    background: transparent; border: 1px solid #1e2a38;
    border-radius: 9px; font-family: 'Syne', sans-serif;
    font-size: 13px; font-weight: 600; color: #6e7f8e;
    cursor: pointer; transition: all 0.2s;
  }
  .guard-back:hover { color: #e6edf3; border-color: #2a3a4a; }
`;

const API = `${API_BASE}/api/auth`;

export default function AuthGuard({ children, actionLabel = "continue" }) {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checked, setChecked] = useState(false);

  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) {
      setIsLoggedIn(true);
    }
    setChecked(true);
  }, []);

  const switchMode = (m) => {
    setMode(m); setError(""); setSuccess("");
  };

  const validate = () => {
    if (!email || !password) return "Email and password are required.";
    if (!email.includes("@")) return "Enter a valid email.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (mode === "register" && !name.trim()) return "Name is required to register.";
    return null;
  };

  const submit = async () => {
    setError(""); setSuccess("");
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/login" : "/register";
      const body = mode === "login"
        ? { email, password }
        : { name, email, password };

      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong. Please try again.");
        return;
      }

      if (mode === "register") {
        setSuccess("Account created! Please log in now.");
        setMode("login");
        setName(""); setPassword("");
        return;
      }

      // Login success
      const userData = { name: data.user.name, email: data.user.email, _id: data.user._id };
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", data.token);
      setIsLoggedIn(true);

    } catch {
      setError("Could not connect to server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") submit(); };

  // Still checking localStorage
  if (!checked) return null;

  // Already logged in — render the actual page
  if (isLoggedIn) return children;

  // Not logged in — show blocking auth modal
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: modalStyle }} />
      <div className="guard-overlay">
        <div className="guard-card">

          <div className="guard-top">
            <div className="guard-logo">
              <span className="guard-logo-dot" /> LiveCode
            </div>
            <div className="guard-lock">🔒</div>
            <div className="guard-title">Login Required</div>
            <div className="guard-subtitle">
              You need to be logged in to <span>{actionLabel}</span>.<br />
              Sign in or create a free account below.
            </div>
          </div>

          <div className="guard-body">
            <div className="guard-tabs">
              <button className={`guard-tab ${mode === "login" ? "active" : ""}`} onClick={() => switchMode("login")}>
                Login
              </button>
              <button className={`guard-tab ${mode === "register" ? "active" : ""}`} onClick={() => switchMode("register")}>
                Register
              </button>
            </div>

            {error   && <div className="guard-error">  <span>⚠</span> {error}   </div>}
            {success && <div className="guard-success"> <span>✓</span> {success} </div>}

            {mode === "register" && (
              <div className="guard-field">
                <label className="guard-label">Full Name</label>
                <input className="guard-input" placeholder="John Doe"
                  value={name} onChange={(e) => setName(e.target.value)} onKeyDown={handleKey} />
              </div>
            )}

            <div className="guard-field">
              <label className="guard-label">Email</label>
              <input className="guard-input" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={handleKey} />
            </div>

            <div className="guard-field">
              <label className="guard-label">Password</label>
              <input type="password" className="guard-input" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKey} />
            </div>

            <button className="guard-submit" onClick={submit} disabled={loading}>
              {loading
                ? <><span className="guard-spinner" /> {mode === "login" ? "Signing in..." : "Creating account..."}</>
                : mode === "login" ? "Sign In →" : "Create Account →"
              }
            </button>

            <button className="guard-back" onClick={() => navigate("/")}>
              ← Go back to Home
            </button>
          </div>

        </div>
      </div>
    </>
  );
}