import { useState } from "react";
import API_BASE from "../config";

const modalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');

  @keyframes modalIn {
    from { opacity: 0; transform: translateY(20px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .lc-modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.75);
    backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    z-index: 999;
  }
  .lc-modal-box {
    background: #0d1117;
    border: 1px solid #1e2a38;
    border-radius: 16px;
    width: 380px;
    padding: 40px 36px;
    animation: modalIn 0.3s ease forwards;
    position: relative;
    box-shadow: 0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(0,255,135,0.05);
    font-family: 'Syne', sans-serif;
  }
  .lc-modal-close {
    position: absolute; top: 16px; right: 18px;
    background: none; border: none;
    color: #6e7f8e; font-size: 20px; cursor: pointer;
    transition: color 0.2s; line-height: 1;
  }
  .lc-modal-close:hover { color: #e6edf3; }
  .lc-modal-logo {
    font-family: 'Space Mono', monospace;
    font-size: 14px; font-weight: 700;
    color: #00ff87;
    margin-bottom: 28px;
    display: flex; align-items: center; gap: 8px;
  }
  .lc-modal-logo-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #00ff87;
  }
  .lc-modal-title {
    font-size: 26px; font-weight: 800;
    letter-spacing: -1px;
    margin-bottom: 6px;
    color: #e6edf3;
  }
  .lc-modal-sub {
    font-size: 13px; color: #6e7f8e;
    margin-bottom: 28px;
  }
  .lc-modal-tabs {
    display: flex; gap: 4px;
    margin-bottom: 28px;
    background: #111820;
    border-radius: 8px; padding: 4px;
  }
  .lc-modal-tab {
    flex: 1; padding: 8px;
    border: none; background: none;
    font-family: 'Syne', sans-serif;
    font-size: 13px; font-weight: 700;
    color: #6e7f8e;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .lc-modal-tab.active {
    background: #1e2a38;
    color: #e6edf3;
  }
  .lc-modal-field { margin-bottom: 14px; }
  .lc-modal-label {
    display: block;
    font-size: 11px; font-weight: 700;
    letter-spacing: 1px; text-transform: uppercase;
    color: #6e7f8e;
    margin-bottom: 6px;
    font-family: 'Space Mono', monospace;
  }
  .lc-modal-input {
    width: 100%;
    background: #0b0f14;
    border: 1px solid #1e2a38;
    border-radius: 8px;
    padding: 10px 14px;
    color: #e6edf3;
    font-size: 14px;
    font-family: 'Space Mono', monospace;
    outline: none;
    transition: border-color 0.2s;
    box-sizing: border-box;
  }
  .lc-modal-input:focus { border-color: rgba(0,255,135,0.4); }
  .lc-modal-input.error { border-color: rgba(255,123,114,0.5); }
  .lc-modal-submit {
    width: 100%;
    margin-top: 8px;
    padding: 12px;
    background: #00ff87;
    border: none;
    border-radius: 8px;
    font-family: 'Syne', sans-serif;
    font-size: 15px; font-weight: 700;
    color: #000;
    cursor: pointer;
    transition: all 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .lc-modal-submit:hover:not(:disabled) {
    background: #00ff9f;
    transform: translateY(-1px);
    box-shadow: 0 6px 24px rgba(0,255,135,0.3);
  }
  .lc-modal-submit:disabled { opacity: 0.6; cursor: not-allowed; }
  .lc-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(0,0,0,0.3);
    border-top-color: #000;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  .lc-error-box {
    background: rgba(255,123,114,0.08);
    border: 1px solid rgba(255,123,114,0.2);
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 13px;
    color: #ff7b72;
    margin-bottom: 16px;
    font-family: 'Space Mono', monospace;
    display: flex; align-items: center; gap: 8px;
  }
  .lc-success-box {
    background: rgba(0,255,135,0.06);
    border: 1px solid rgba(0,255,135,0.2);
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 13px;
    color: #00ff87;
    margin-bottom: 16px;
    font-family: 'Space Mono', monospace;
    display: flex; align-items: center; gap: 8px;
  }
`;

const API_URL = `${API_BASE}/api/auth`;

const AuthModal = ({ closeModal, setUser }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const switchMode = (m) => {
    setMode(m);
    setError("");
    setSuccess("");
  };

  const validate = () => {
    if (!email || !password) return "Email aur password dono required hain.";
    if (!email.includes("@")) return "Valid email enter karo.";
    if (password.length < 6) return "Password kam se kam 6 characters ka hona chahiye.";
    if (mode === "register" && !name.trim()) return "Name required hai registration ke liye.";
    return null;
  };

  const submit = async () => {
    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/login" : "/register";
      const body = mode === "login"
        ? { email, password }
        : { name, email, password };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Kuch galat ho gaya, dobara try karo.");
        return;
      }

      // REGISTER SUCCESS → auto switch to login
      if (mode === "register") {
        setSuccess("Account ban gaya! Ab login karo.");
        setMode("login");
        setName("");
        setPassword("");
        return;
      }

      // LOGIN SUCCESS → save token + user in localStorage
      const userData = {
        name: data.user.name,
        email: data.user.email,
        _id: data.user._id,
      };
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", data.token);
      setUser(userData);
      closeModal();

    } catch (err) {
      setError("Server se connect nahi ho paya. Backend chal raha hai?");
    } finally {
      setLoading(false);
    }
  };

  // Enter key submit
  const handleKeyDown = (e) => { if (e.key === "Enter") submit(); };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: modalStyle }} />
      <div className="lc-modal-overlay" onClick={closeModal}>
        <div className="lc-modal-box" onClick={(e) => e.stopPropagation()}>
          <button className="lc-modal-close" onClick={closeModal}>✕</button>

          <div className="lc-modal-logo">
            <span className="lc-modal-logo-dot" />
            LiveCode
          </div>

          <div className="lc-modal-title">
            {mode === "login" ? "Welcome back" : "Create account"}
          </div>
          <div className="lc-modal-sub">
            {mode === "login"
              ? "Sign in to access your rooms"
              : "Join thousands of developers collaborating"}
          </div>

          <div className="lc-modal-tabs">
            <button className={`lc-modal-tab ${mode === "login" ? "active" : ""}`} onClick={() => switchMode("login")}>Login</button>
            <button className={`lc-modal-tab ${mode === "register" ? "active" : ""}`} onClick={() => switchMode("register")}>Register</button>
          </div>

          {error && <div className="lc-error-box"><span>⚠</span> {error}</div>}
          {success && <div className="lc-success-box"><span>✓</span> {success}</div>}

          {mode === "register" && (
            <div className="lc-modal-field">
              <label className="lc-modal-label">Full Name</label>
              <input className="lc-modal-input" placeholder="Arjun Kumar" value={name}
                onChange={(e) => setName(e.target.value)} onKeyDown={handleKeyDown} />
            </div>
          )}

          <div className="lc-modal-field">
            <label className="lc-modal-label">Email</label>
            <input className={`lc-modal-input ${error && !email ? "error" : ""}`}
              placeholder="you@example.com" value={email}
              onChange={(e) => setEmail(e.target.value)} onKeyDown={handleKeyDown} />
          </div>

          <div className="lc-modal-field">
            <label className="lc-modal-label">Password</label>
            <input type="password" className={`lc-modal-input ${error && !password ? "error" : ""}`}
              placeholder="••••••••" value={password}
              onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown} />
          </div>

          <button className="lc-modal-submit" onClick={submit} disabled={loading}>
            {loading
              ? <><span className="lc-spinner" /> {mode === "login" ? "Logging in..." : "Creating..."}</>
              : mode === "login" ? "Sign In →" : "Create Account →"
            }
          </button>
        </div>
      </div>
    </>
  );
};

export default AuthModal;