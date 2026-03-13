import { useState } from "react";
import { useNavigate } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #080c10;
    --surface: #0d1117;
    --surface2: #111820;
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
  @keyframes popIn {
    0%   { opacity: 0; transform: scale(0.92); }
    60%  { transform: scale(1.02); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; } 50% { opacity: 0; }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes gridMove {
    from { background-position: 0 0; }
    to   { background-position: 60px 60px; }
  }
  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(0,255,135,0.4); }
    50%       { box-shadow: 0 0 0 12px rgba(0,255,135,0); }
  }

  .cr-page {
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
  .cr-grid {
    position: fixed; inset: 0;
    background-image:
      linear-gradient(rgba(0,255,135,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,255,135,0.03) 1px, transparent 1px);
    background-size: 60px 60px;
    animation: gridMove 8s linear infinite;
    pointer-events: none;
  }
  .cr-orb {
    position: fixed; border-radius: 50%;
    filter: blur(100px); pointer-events: none;
  }
  .cr-orb-1 {
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(0,255,135,0.08), transparent 70%);
    top: -150px; left: -150px;
  }
  .cr-orb-2 {
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(0,229,255,0.06), transparent 70%);
    bottom: -100px; right: -100px;
  }

  .cr-back {
    position: fixed; top: 24px; left: 32px;
    display: flex; align-items: center; gap: 8px;
    font-family: var(--mono); font-size: 13px;
    color: var(--muted); cursor: pointer;
    transition: color 0.2s; z-index: 10;
    background: none; border: none;
  }
  .cr-back:hover { color: var(--green); }

  .cr-logo {
    position: fixed; top: 24px; right: 32px;
    font-family: var(--mono); font-size: 14px; font-weight: 700;
    color: var(--green); display: flex; align-items: center; gap: 8px;
    z-index: 10; cursor: pointer; background: none; border: none;
  }
  .cr-logo-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--green); animation: blink 1.5s infinite;
  }

  .cr-card {
    position: relative; z-index: 1;
    width: 100%; max-width: 520px;
    animation: fadeUp 0.5s ease both;
  }

  /* STEP 1 */
  .cr-create-box {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 52px 48px;
    text-align: center;
    box-shadow: 0 32px 80px rgba(0,0,0,0.5);
  }
  .cr-icon-ring {
    width: 80px; height: 80px; border-radius: 50%;
    background: rgba(0,255,135,0.06);
    border: 1px solid rgba(0,255,135,0.15);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 28px; font-size: 32px;
  }
  .cr-title {
    font-size: 32px; font-weight: 800;
    letter-spacing: -1.5px; margin-bottom: 12px; line-height: 1.1;
  }
  .cr-title span { color: var(--green); }
  .cr-desc {
    font-size: 15px; color: var(--muted);
    line-height: 1.7; margin-bottom: 36px;
  }
  .cr-btn-create {
    width: 100%; padding: 16px;
    background: var(--green); border: none; border-radius: 10px;
    font-family: var(--display); font-size: 16px; font-weight: 700;
    color: #000; cursor: pointer; transition: all 0.25s;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    animation: pulse 2.5s infinite;
  }
  .cr-btn-create:hover:not(:disabled) {
    background: #00ff9f; transform: translateY(-2px);
    box-shadow: 0 10px 36px rgba(0,255,135,0.35); animation: none;
  }
  .cr-btn-create:disabled { opacity: 0.6; cursor: not-allowed; animation: none; }
  .cr-spinner {
    width: 18px; height: 18px;
    border: 2px solid rgba(0,0,0,0.25); border-top-color: #000;
    border-radius: 50%; animation: spin 0.7s linear infinite;
  }
  .cr-error {
    margin-top: 16px; padding: 12px 16px;
    background: rgba(255,123,114,0.08);
    border: 1px solid rgba(255,123,114,0.2);
    border-radius: 8px; font-family: var(--mono);
    font-size: 13px; color: var(--red);
    display: flex; align-items: center; gap: 8px;
  }
  .cr-note {
    margin-top: 20px; font-size: 12px;
    color: var(--muted); font-family: var(--mono);
  }

  /* STEP 2 */
  .cr-result-box {
    background: var(--surface);
    border: 1px solid rgba(0,255,135,0.2);
    border-radius: 20px; overflow: hidden;
    box-shadow: 0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,255,135,0.05);
    animation: popIn 0.4s ease both;
  }
  .cr-result-top {
    background: rgba(0,255,135,0.05);
    border-bottom: 1px solid rgba(0,255,135,0.12);
    padding: 28px 36px;
    display: flex; align-items: center; gap: 16px;
  }
  .cr-success-icon {
    width: 48px; height: 48px; border-radius: 50%;
    background: rgba(0,255,135,0.1);
    border: 1px solid rgba(0,255,135,0.3);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; flex-shrink: 0;
  }
  .cr-result-top-text h3 {
    font-size: 18px; font-weight: 800;
    letter-spacing: -0.5px; margin-bottom: 4px;
  }
  .cr-result-top-text p { font-size: 13px; color: var(--muted); }
  .cr-result-body { padding: 32px 36px; }

  .cr-block { margin-bottom: 20px; }
  .cr-block-label {
    font-family: var(--mono); font-size: 10px;
    letter-spacing: 2px; text-transform: uppercase;
    color: var(--muted); margin-bottom: 8px;
    display: flex; align-items: center; gap: 6px;
  }
  .cr-block-label::before {
    content: ''; display: inline-block;
    width: 12px; height: 1px; background: var(--muted);
  }

  .cr-code-display {
    background: #0b0f14; border: 1px solid var(--border);
    border-radius: 12px; padding: 24px;
    display: flex; align-items: center; justify-content: space-between;
    gap: 16px; cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
  }
  .cr-code-display:hover {
    border-color: rgba(0,255,135,0.3); background: #0d1117;
  }
  .cr-code-val {
    font-family: var(--mono); font-size: 36px; font-weight: 700;
    letter-spacing: 8px; color: var(--green); line-height: 1;
  }
  .cr-copy-hint {
    font-family: var(--mono); font-size: 11px; color: var(--muted);
    white-space: nowrap; display: flex; align-items: center; gap: 6px;
  }
  .cr-copy-hint.copied { color: var(--green); }

  .cr-link-row {
    background: #0b0f14; border: 1px solid var(--border);
    border-radius: 10px; padding: 12px 16px;
    display: flex; align-items: center; gap: 12px;
    transition: border-color 0.2s; cursor: pointer;
  }
  .cr-link-row:hover { border-color: rgba(0,229,255,0.3); }
  .cr-link-text {
    flex: 1; font-family: var(--mono); font-size: 12px;
    color: var(--cyan); overflow: hidden;
    text-overflow: ellipsis; white-space: nowrap;
  }
  .cr-link-copy {
    font-family: var(--mono); font-size: 11px; color: var(--muted);
    white-space: nowrap; flex-shrink: 0;
    display: flex; align-items: center; gap: 4px; transition: color 0.2s;
  }
  .cr-link-row:hover .cr-link-copy { color: var(--cyan); }
  .cr-link-copy.copied { color: var(--green); }

  .cr-divider { height: 1px; background: var(--border); margin: 24px 0; }

  .cr-actions { display: flex; gap: 12px; }
  .cr-btn-go {
    flex: 1; padding: 14px; background: var(--green);
    border: none; border-radius: 10px;
    font-family: var(--display); font-size: 15px; font-weight: 700;
    color: #000; cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .cr-btn-go:hover {
    background: #00ff9f; transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(0,255,135,0.3);
  }
  .cr-btn-new {
    padding: 14px 20px; background: transparent;
    border: 1px solid var(--border); border-radius: 10px;
    font-family: var(--display); font-size: 15px; font-weight: 700;
    color: var(--muted); cursor: pointer; transition: all 0.2s; white-space: nowrap;
  }
  .cr-btn-new:hover { color: var(--text); }

  .cr-share-row {
    display: flex; align-items: center; gap: 12px; margin-top: 20px;
  }
  .cr-share-label {
    font-family: var(--mono); font-size: 11px;
    color: var(--muted); white-space: nowrap;
  }
  .cr-share-divider { flex: 1; height: 1px; background: var(--border); }
  .cr-share-btn {
    padding: 7px 14px; border: 1px solid var(--border);
    border-radius: 6px; background: transparent;
    font-family: var(--mono); font-size: 12px; color: var(--muted);
    cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; gap: 6px; white-space: nowrap;
  }
  .cr-share-btn:hover { border-color: var(--green); color: var(--green); }
`;

const API = "http://localhost:5000/api/room";

export default function CreateRoom() {
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const createRoom = async () => {
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please log in first before creating a room.");
        setLoading(false);
        return;
      }

      const res = await fetch(`${API}/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to create room. Please try again.");
        return;
      }

      setRoom({
        roomId: data.roomId,
        roomLink: `${window.location.origin}/room/${data.roomId}`,
      });

    } catch (err) {
      setError("Could not connect to server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(room.roomId);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/room/${room.roomId}`);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const link = `${window.location.origin}/room/${room.roomId}`;
    const msg = `Hey! Let's code together 🚀\nRoom Code: *${room.roomId}*\nJoin here: ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const goToRoom = () => navigate(`/room/${room.roomId}`);

  const resetRoom = () => {
    setRoom(null);
    setError("");
    setCodeCopied(false);
    setLinkCopied(false);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="cr-page">
        <div className="cr-grid" />
        <div className="cr-orb cr-orb-1" />
        <div className="cr-orb cr-orb-2" />

        <button className="cr-back" onClick={() => navigate("/")}>← Back</button>
        <button className="cr-logo" onClick={() => navigate("/")}>
          <span className="cr-logo-dot" /> LiveCode
        </button>

        <div className="cr-card">

          {!room ? (
            /* STEP 1 — Generate room */
            <div className="cr-create-box">
              <div className="cr-icon-ring">🚀</div>
              <h1 className="cr-title">Create a <span>Room</span></h1>
              <p className="cr-desc">
                One click to spin up a private coding room.<br />
                Get your room code and shareable link instantly.
              </p>

              <button className="cr-btn-create" onClick={createRoom} disabled={loading}>
                {loading
                  ? <><span className="cr-spinner" /> Creating room...</>
                  : <><span>＋</span> Generate Room</>
                }
              </button>

              {error && (
                <div className="cr-error"><span>⚠</span> {error}</div>
              )}

              <p className="cr-note">Login required • Room is instantly active</p>
            </div>

          ) : (
            /* STEP 2 — Room created */
            <div className="cr-result-box">

              <div className="cr-result-top">
                <div className="cr-success-icon">✓</div>
                <div className="cr-result-top-text">
                  <h3>Room is Ready! 🎉</h3>
                  <p>Share the code below and start collaborating</p>
                </div>
              </div>

              <div className="cr-result-body">

                {/* BIG ROOM CODE */}
                <div className="cr-block">
                  <div className="cr-block-label">Room Code</div>
                  <div className="cr-code-display" onClick={copyCode} title="Click to copy">
                    <span className="cr-code-val">{room.roomId}</span>
                    <span className={`cr-copy-hint ${codeCopied ? "copied" : ""}`}>
                      {codeCopied ? "✓ Copied!" : "⎘ Copy code"}
                    </span>
                  </div>
                </div>

                {/* SHAREABLE LINK */}
                <div className="cr-block">
                  <div className="cr-block-label">Shareable Link</div>
                  <div className="cr-link-row" onClick={copyLink} title="Click to copy link">
                    <span className="cr-link-text">
                      {window.location.origin}/room/{room.roomId}
                    </span>
                    <span className={`cr-link-copy ${linkCopied ? "copied" : ""}`}>
                      {linkCopied ? "✓ Copied!" : "⎘ Copy"}
                    </span>
                  </div>
                </div>

                <div className="cr-divider" />

                {/* ACTION BUTTONS */}
                <div className="cr-actions">
                  <button className="cr-btn-go" onClick={goToRoom}>
                    Open Editor →
                  </button>
                  <button className="cr-btn-new" onClick={resetRoom}>
                    + New Room
                  </button>
                </div>

                {/* SHARE ROW */}
                <div className="cr-share-row">
                  <span className="cr-share-label">Share via</span>
                  <div className="cr-share-divider" />
                  <button className="cr-share-btn" onClick={shareWhatsApp}>
                    <span>💬</span> WhatsApp
                  </button>
                  <button className="cr-share-btn" onClick={copyLink}>
                    <span>🔗</span> {linkCopied ? "Copied!" : "Copy Link"}
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}