import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #080c10;
    --surface: #0d1117;
    --border: #1e2a38;
    --green: #00ff87;
    --cyan: #00e5ff;
    --red: #ff7b72;
    --text: #e6edf3;
    --muted: #6e7f8e;
    --mono: 'Space Mono', monospace;
    --display: 'Syne', sans-serif;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; } 50% { opacity: 0; }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes gridMove {
    from { background-position: 0 0; }
    to   { background-position: 60px 60px; }
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%       { transform: translateX(-8px); }
    40%       { transform: translateX(8px); }
    60%       { transform: translateX(-5px); }
    80%       { transform: translateX(5px); }
  }

  .jr-page {
    min-height: 100vh;
    background: var(--bg);
    font-family: var(--display);
    color: var(--text);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    position: relative;
    overflow: hidden;
  }
  .jr-grid {
    position: fixed; inset: 0;
    background-image:
      linear-gradient(rgba(0,229,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,229,255,0.025) 1px, transparent 1px);
    background-size: 60px 60px;
    animation: gridMove 10s linear infinite;
    pointer-events: none;
  }
  .jr-orb {
    position: fixed; border-radius: 50%;
    filter: blur(100px); pointer-events: none;
  }
  .jr-orb-1 {
    width: 450px; height: 450px;
    background: radial-gradient(circle, rgba(0,229,255,0.07), transparent 70%);
    top: -100px; right: -100px;
  }
  .jr-orb-2 {
    width: 350px; height: 350px;
    background: radial-gradient(circle, rgba(0,255,135,0.05), transparent 70%);
    bottom: -80px; left: -80px;
  }

  .jr-back {
    position: fixed; top: 24px; left: 32px;
    display: flex; align-items: center; gap: 8px;
    font-family: var(--mono); font-size: 13px;
    color: var(--muted); cursor: pointer;
    transition: color 0.2s; z-index: 10;
    background: none; border: none;
  }
  .jr-back:hover { color: var(--cyan); }

  .jr-logo {
    position: fixed; top: 24px; right: 32px;
    font-family: var(--mono); font-size: 14px; font-weight: 700;
    color: var(--green); display: flex; align-items: center; gap: 8px;
    z-index: 10; cursor: pointer; background: none; border: none;
  }
  .jr-logo-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--green); animation: blink 1.5s infinite;
  }

  /* CARD */
  .jr-card {
    position: relative; z-index: 1;
    width: 100%; max-width: 480px;
    animation: fadeUp 0.5s ease both;
  }

  .jr-box {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 32px 80px rgba(0,0,0,0.5);
  }

  /* TOP SECTION */
  .jr-top {
    padding: 44px 44px 36px;
    border-bottom: 1px solid var(--border);
  }
  .jr-icon-ring {
    width: 72px; height: 72px; border-radius: 50%;
    background: rgba(0,229,255,0.06);
    border: 1px solid rgba(0,229,255,0.15);
    display: flex; align-items: center; justify-content: center;
    margin: 0 0 24px; font-size: 28px;
  }
  .jr-title {
    font-size: 30px; font-weight: 800;
    letter-spacing: -1.5px; margin-bottom: 10px; line-height: 1.1;
  }
  .jr-title span { color: var(--cyan); }
  .jr-subtitle {
    font-size: 14px; color: var(--muted); line-height: 1.6;
  }

  /* TABS */
  .jr-tabs {
    display: flex; gap: 0;
    border-bottom: 1px solid var(--border);
  }
  .jr-tab {
    flex: 1; padding: 14px;
    border: none; background: none;
    font-family: var(--display); font-size: 13px; font-weight: 700;
    color: var(--muted); cursor: pointer;
    transition: all 0.2s;
    border-bottom: 2px solid transparent;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .jr-tab:hover { color: var(--text); }
  .jr-tab.active {
    color: var(--cyan);
    border-bottom-color: var(--cyan);
    background: rgba(0,229,255,0.03);
  }

  /* BODY */
  .jr-body { padding: 36px 44px 44px; }

  /* INPUT GROUP */
  .jr-field { margin-bottom: 20px; }
  .jr-label {
    display: block; font-family: var(--mono);
    font-size: 10px; letter-spacing: 2px;
    text-transform: uppercase; color: var(--muted);
    margin-bottom: 10px;
    display: flex; align-items: center; gap: 6px;
  }
  .jr-label::before {
    content: ''; display: inline-block;
    width: 12px; height: 1px; background: var(--muted);
  }

  /* CODE INPUT — big spaced boxes */
  .jr-code-input-wrap {
    display: flex; gap: 10px; justify-content: center;
  }
  .jr-code-char {
    width: 56px; height: 64px;
    background: #0b0f14;
    border: 1px solid var(--border);
    border-radius: 10px;
    font-family: var(--mono); font-size: 24px; font-weight: 700;
    color: var(--cyan); text-align: center;
    outline: none; caret-color: var(--cyan);
    transition: border-color 0.2s, box-shadow 0.2s;
    text-transform: uppercase;
  }
  .jr-code-char:focus {
    border-color: rgba(0,229,255,0.5);
    box-shadow: 0 0 0 3px rgba(0,229,255,0.08);
  }
  .jr-code-char.filled { border-color: rgba(0,229,255,0.3); }
  .jr-code-char.error-char {
    border-color: rgba(255,123,114,0.5);
    animation: shake 0.4s ease;
  }

  /* OR divider */
  .jr-or {
    display: flex; align-items: center; gap: 12px;
    margin: 24px 0;
  }
  .jr-or-line { flex: 1; height: 1px; background: var(--border); }
  .jr-or-text {
    font-family: var(--mono); font-size: 11px;
    color: var(--muted); letter-spacing: 2px;
  }

  /* LINK INPUT */
  .jr-link-input {
    width: 100%; background: #0b0f14;
    border: 1px solid var(--border); border-radius: 10px;
    padding: 12px 16px; color: var(--text);
    font-family: var(--mono); font-size: 13px;
    outline: none; transition: border-color 0.2s;
  }
  .jr-link-input:focus { border-color: rgba(0,229,255,0.4); }
  .jr-link-input::placeholder { color: var(--muted); }
  .jr-link-input.error { border-color: rgba(255,123,114,0.5); }

  /* PASTE HINT */
  .jr-paste-hint {
    margin-top: 8px;
    font-family: var(--mono); font-size: 11px; color: var(--muted);
    display: flex; align-items: center; gap: 6px;
  }
  .jr-paste-hint kbd {
    padding: 2px 6px; background: #1e2a38;
    border-radius: 4px; font-size: 10px; color: var(--text);
  }

  /* ERROR */
  .jr-error {
    padding: 12px 16px;
    background: rgba(255,123,114,0.08);
    border: 1px solid rgba(255,123,114,0.2);
    border-radius: 8px; font-family: var(--mono);
    font-size: 13px; color: var(--red);
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 20px;
  }

  /* SUBMIT */
  .jr-btn-join {
    width: 100%; padding: 15px;
    background: transparent;
    border: 1px solid var(--cyan);
    border-radius: 10px;
    font-family: var(--display); font-size: 16px; font-weight: 700;
    color: var(--cyan); cursor: pointer; transition: all 0.25s;
    display: flex; align-items: center; justify-content: center; gap: 10px;
  }
  .jr-btn-join:hover:not(:disabled) {
    background: rgba(0,229,255,0.08);
    box-shadow: 0 0 30px rgba(0,229,255,0.15);
    transform: translateY(-1px);
  }
  .jr-btn-join:disabled { opacity: 0.5; cursor: not-allowed; }

  .jr-spinner {
    width: 18px; height: 18px;
    border: 2px solid rgba(0,229,255,0.25); border-top-color: var(--cyan);
    border-radius: 50%; animation: spin 0.7s linear infinite;
  }

  /* RECENT ROOMS */
  .jr-recent {
    margin-top: 28px;
    padding-top: 24px;
    border-top: 1px solid var(--border);
  }
  .jr-recent-label {
    font-family: var(--mono); font-size: 10px;
    letter-spacing: 2px; text-transform: uppercase;
    color: var(--muted); margin-bottom: 12px;
  }
  .jr-recent-item {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 14px; border-radius: 8px;
    border: 1px solid var(--border); margin-bottom: 8px;
    cursor: pointer; transition: all 0.2s;
    background: transparent;
    width: 100%; text-align: left;
  }
  .jr-recent-item:hover {
    border-color: rgba(0,229,255,0.3);
    background: rgba(0,229,255,0.03);
  }
  .jr-recent-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--border); flex-shrink: 0;
  }
  .jr-recent-code {
    font-family: var(--mono); font-size: 14px;
    font-weight: 700; color: var(--text); letter-spacing: 2px;
  }
  .jr-recent-time {
    margin-left: auto;
    font-family: var(--mono); font-size: 11px; color: var(--muted);
  }
  .jr-recent-arrow {
    font-size: 12px; color: var(--muted);
    transition: color 0.2s; margin-left: 4px;
  }
  .jr-recent-item:hover .jr-recent-arrow { color: var(--cyan); }
`;

const API = "http://localhost:5000/api/room";

// Extract room ID from either a raw code or a full URL
function parseRoomId(input) {
  const trimmed = input.trim();
  // If it looks like a URL, extract the last path segment
  try {
    const url = new URL(trimmed);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || "";
  } catch {
    // Not a URL — treat as raw code
    return trimmed;
  }
}

export default function JoinRoom() {
  const navigate = useNavigate();

  // Tab: "code" | "link"
  const [tab, setTab] = useState("code");

  // 6-char code inputs
  const [chars, setChars] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  // Link input
  const [linkInput, setLinkInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shakeError, setShakeError] = useState(false);

  // Recent rooms from localStorage
  const recentRooms = (() => {
    try {
      return JSON.parse(localStorage.getItem("recentRooms") || "[]");
    } catch { return []; }
  })();

  const saveRecent = (roomId) => {
    const existing = recentRooms.filter((r) => r.id !== roomId);
    const updated = [{ id: roomId, time: Date.now() }, ...existing].slice(0, 3);
    localStorage.setItem("recentRooms", JSON.stringify(updated));
  };

  const triggerError = (msg) => {
    setError(msg);
    setShakeError(true);
    setTimeout(() => setShakeError(false), 500);
  };

  // ── Handle individual char boxes ──
  const handleCharChange = (index, value) => {
    const char = value.replace(/[^a-zA-Z0-9_-]/g, "").slice(-1);
    const next = [...chars];
    next[index] = char.toUpperCase();
    setChars(next);
    setError("");
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleCharKeyDown = (index, e) => {
    if (e.key === "Backspace" && !chars[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") handleJoin();
  };

  const handleCharPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^a-zA-Z0-9_-]/g, "").toUpperCase().slice(0, 6);
    const next = [...chars];
    for (let i = 0; i < 6; i++) next[i] = pasted[i] || "";
    setChars(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  // ── Join logic ──
  const handleJoin = async () => {
    setError("");

    let roomId = "";

    if (tab === "code") {
      roomId = chars.join("").trim();
      if (roomId.length < 6) {
        triggerError("Please enter the full 6-character room code.");
        return;
      }
    } else {
      if (!linkInput.trim()) {
        triggerError("Please paste a room link or code.");
        return;
      }
      roomId = parseRoomId(linkInput);
      if (!roomId) {
        triggerError("Could not extract a valid room ID from that link.");
        return;
      }
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      // If logged in, verify room exists on backend
      if (token) {
        const res = await fetch(`${API}/join`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ roomId }),
        });

        const data = await res.json();

        if (!res.ok) {
          triggerError(data.message || "Room not found. Check the code and try again.");
          return;
        }
      }
      // If not logged in, navigate directly (socket auth handles it)

      saveRecent(roomId);
      navigate(`/room/${roomId}`);

    } catch (err) {
      triggerError("Could not connect to server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (ts) => {
    const diff = Math.floor((Date.now() - ts) / 60000);
    if (diff < 1) return "just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="jr-page">
        <div className="jr-grid" />
        <div className="jr-orb jr-orb-1" />
        <div className="jr-orb jr-orb-2" />

        <button className="jr-back" onClick={() => navigate("/")}>← Back</button>
        <button className="jr-logo" onClick={() => navigate("/")}>
          <span className="jr-logo-dot" /> LiveCode
        </button>

        <div className="jr-card">
          <div className="jr-box">

            {/* HEADER */}
            <div className="jr-top">
              <div className="jr-icon-ring">🔗</div>
              <h1 className="jr-title">Join a <span>Room</span></h1>
              <p className="jr-subtitle">
                Enter a 6-character room code or paste a share link to jump straight in.
              </p>
            </div>

            {/* TABS */}
            <div className="jr-tabs">
              <button
                className={`jr-tab ${tab === "code" ? "active" : ""}`}
                onClick={() => { setTab("code"); setError(""); }}
              >
                <span>#</span> Room Code
              </button>
              <button
                className={`jr-tab ${tab === "link" ? "active" : ""}`}
                onClick={() => { setTab("link"); setError(""); }}
              >
                <span>🔗</span> Paste Link
              </button>
            </div>

            {/* BODY */}
            <div className="jr-body">

              {error && (
                <div className="jr-error">
                  <span>⚠</span> {error}
                </div>
              )}

              {tab === "code" ? (
                <>
                  <div className="jr-field">
                    <label className="jr-label">Room Code</label>
                    <div className="jr-code-input-wrap" onPaste={handleCharPaste}>
                      {chars.map((ch, i) => (
                        <input
                          key={i}
                          ref={(el) => (inputRefs.current[i] = el)}
                          className={`jr-code-char ${ch ? "filled" : ""} ${shakeError ? "error-char" : ""}`}
                          value={ch}
                          maxLength={1}
                          onChange={(e) => handleCharChange(i, e.target.value)}
                          onKeyDown={(e) => handleCharKeyDown(i, e)}
                          autoFocus={i === 0}
                        />
                      ))}
                    </div>
                    <p style={{ marginTop: 10, textAlign: "center", fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>
                      You can also paste the full code at once
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="jr-field">
                    <label className="jr-label">Room Link or Code</label>
                    <input
                      className={`jr-link-input ${shakeError ? "error" : ""}`}
                      placeholder="http://localhost:5173/room/xk9f2  or  xk9f2"
                      value={linkInput}
                      onChange={(e) => { setLinkInput(e.target.value); setError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                      autoFocus
                    />
                    <p className="jr-paste-hint">
                      <kbd>Ctrl+V</kbd> to paste the link your teammate shared
                    </p>
                  </div>
                </>
              )}

              <button className="jr-btn-join" onClick={handleJoin} disabled={loading}>
                {loading
                  ? <><span className="jr-spinner" /> Joining...</>
                  : <>→ Join Room</>
                }
              </button>

              {/* RECENT ROOMS */}
              {recentRooms.length > 0 && (
                <div className="jr-recent">
                  <div className="jr-recent-label">Recent Rooms</div>
                  {recentRooms.map((r) => (
                    <button
                      key={r.id}
                      className="jr-recent-item"
                      onClick={() => navigate(`/room/${r.id}`)}
                    >
                      <span className="jr-recent-dot" />
                      <span className="jr-recent-code">{r.id}</span>
                      <span className="jr-recent-time">{formatTime(r.time)}</span>
                      <span className="jr-recent-arrow">→</span>
                    </button>
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}