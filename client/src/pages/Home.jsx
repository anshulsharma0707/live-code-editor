import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import AuthModal from "../components/AuthModal";

const styleSheet = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #080c10;
    --surface: #0d1117;
    --surface2: #111820;
    --border: #1e2a38;
    --green: #00ff87;
    --green-dim: #00c96a;
    --cyan: #00e5ff;
    --text: #e6edf3;
    --muted: #6e7f8e;
    --font-display: 'Syne', sans-serif;
    --font-mono: 'Space Mono', monospace;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--font-display); }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-12px); }
  }
  @keyframes scan {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  @keyframes glowPulse {
    0%, 100% { box-shadow: 0 0 20px rgba(0,255,135,0.15); }
    50%       { box-shadow: 0 0 45px rgba(0,255,135,0.4); }
  }
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
  @keyframes gridMove {
    from { background-position: 0 0; }
    to   { background-position: 60px 60px; }
  }

  .lc-page {
    min-height: 100vh;
    background: var(--bg);
    overflow-x: hidden;
    position: relative;
  }

  .lc-grid-bg {
    position: fixed; inset: 0;
    background-image:
      linear-gradient(rgba(0,255,135,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,255,135,0.03) 1px, transparent 1px);
    background-size: 60px 60px;
    animation: gridMove 8s linear infinite;
    pointer-events: none; z-index: 0;
  }

  .lc-scanline {
    position: fixed; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, var(--green), transparent);
    animation: scan 6s linear infinite;
    opacity: 0.15; pointer-events: none; z-index: 1;
  }

  /* NAVBAR */
  .lc-nav {
    position: sticky; top: 0; z-index: 100;
    display: flex; justify-content: space-between; align-items: center;
    padding: 18px 48px;
    background: rgba(8,12,16,0.85); backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
    animation: fadeIn 0.5s ease forwards;
  }
  .lc-logo {
    font-family: var(--font-mono); font-size: 20px; font-weight: 700;
    color: var(--green); letter-spacing: -0.5px;
    display: flex; align-items: center; gap: 8px; text-decoration: none;
  }
  .lc-logo-dot {
    width: 8px; height: 8px; background: var(--green);
    border-radius: 50%; animation: blink 1.5s infinite;
  }
  .lc-nav-links { display: flex; gap: 36px; list-style: none; }
  .lc-nav-links a {
    color: var(--muted); text-decoration: none; font-size: 14px;
    font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;
    transition: color 0.2s; position: relative;
  }
  .lc-nav-links a::after {
    content: ''; position: absolute; bottom: -4px; left: 0;
    width: 0; height: 1px; background: var(--green); transition: width 0.3s ease;
  }
  .lc-nav-links a:hover { color: var(--text); }
  .lc-nav-links a:hover::after { width: 100%; }
  .lc-nav-actions { display: flex; gap: 12px; align-items: center; }
  .lc-btn-ghost {
    padding: 8px 20px; border: 1px solid var(--border);
    background: transparent; color: var(--text); border-radius: 6px;
    font-family: var(--font-display); font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
  }
  .lc-btn-ghost:hover { border-color: var(--green); color: var(--green); }
  .lc-btn-primary {
    padding: 8px 22px; background: var(--green); color: #000;
    border: none; border-radius: 6px; font-family: var(--font-display);
    font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s;
    animation: glowPulse 3s infinite;
  }
  .lc-btn-primary:hover { background: #00ff9f; transform: translateY(-1px); }
  .lc-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: var(--green); color: #000; font-weight: 700; font-size: 13px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: transform 0.2s; font-family: var(--font-mono);
  }
  .lc-avatar:hover { transform: scale(1.1); }

  /* HERO */
  .lc-hero {
    position: relative; z-index: 2; min-height: 92vh;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 80px 48px 60px; text-align: center; overflow: hidden;
  }
  .lc-hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 6px 16px; border: 1px solid rgba(0,255,135,0.3);
    border-radius: 100px; background: rgba(0,255,135,0.05);
    font-size: 12px; font-family: var(--font-mono); color: var(--green);
    letter-spacing: 1px; margin-bottom: 32px;
    animation: fadeUp 0.6s ease 0.1s both;
  }
  .lc-hero-title {
    font-size: clamp(52px, 8vw, 96px); font-weight: 800;
    line-height: 1.0; letter-spacing: -3px; margin-bottom: 24px;
    animation: fadeUp 0.6s ease 0.25s both;
  }
  .lc-hero-title .green { color: var(--green); }
  .lc-hero-sub {
    max-width: 560px; font-size: 18px; color: var(--muted);
    line-height: 1.7; margin-bottom: 44px; font-weight: 400;
    animation: fadeUp 0.6s ease 0.4s both;
  }
  .lc-hero-cta {
    display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;
    animation: fadeUp 0.6s ease 0.55s both;
  }
  .lc-cta-primary {
    padding: 16px 40px; background: var(--green); color: #000; border: none;
    border-radius: 8px; font-family: var(--font-display); font-size: 16px;
    font-weight: 700; cursor: pointer; transition: all 0.25s;
    display: flex; align-items: center; gap: 10px;
    animation: glowPulse 3s infinite;
  }
  .lc-cta-primary:hover {
    background: #00ff9f; transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0,255,135,0.35);
  }
  .lc-cta-secondary {
    padding: 16px 40px; background: transparent; color: var(--text);
    border: 1px solid var(--border); border-radius: 8px;
    font-family: var(--font-display); font-size: 16px; font-weight: 700;
    cursor: pointer; transition: all 0.25s;
    display: flex; align-items: center; gap: 10px;
  }
  .lc-cta-secondary:hover {
    border-color: rgba(0,229,255,0.5); color: var(--cyan); transform: translateY(-2px);
  }
  .lc-hero-hint {
    margin-top: 24px; font-size: 13px; color: var(--muted);
    font-family: var(--font-mono); animation: fadeUp 0.6s ease 0.7s both;
  }
  .lc-orb {
    position: absolute; border-radius: 50%;
    pointer-events: none; filter: blur(80px); z-index: -1;
  }
  .lc-orb-1 {
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(0,255,135,0.12), transparent 70%);
    top: -100px; left: -100px; animation: float 8s ease-in-out infinite;
  }
  .lc-orb-2 {
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(0,229,255,0.08), transparent 70%);
    bottom: -50px; right: -50px; animation: float 10s ease-in-out infinite reverse;
  }

  /* CODE PREVIEW */
  .lc-preview-wrap {
    position: relative; z-index: 2; max-width: 900px;
    margin: 0 auto 80px; padding: 0 48px;
    animation: fadeUp 0.7s ease 0.8s both;
  }
  .lc-window {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; overflow: hidden;
    box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,255,135,0.05);
  }
  .lc-window-bar {
    display: flex; align-items: center; gap: 8px; padding: 14px 18px;
    background: #0d1117; border-bottom: 1px solid var(--border);
  }
  .lc-dot { width: 12px; height: 12px; border-radius: 50%; }
  .lc-dot-red   { background: #ff5f57; }
  .lc-dot-yell  { background: #febc2e; }
  .lc-dot-green { background: #2bc840; }
  .lc-window-title {
    flex: 1; text-align: center; font-family: var(--font-mono);
    font-size: 12px; color: var(--muted);
  }
  .lc-window-users { display: flex; gap: 4px; }
  .lc-user-dot {
    width: 22px; height: 22px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 9px; font-weight: 700; font-family: var(--font-mono); color: #000;
  }
  .lc-window-body { display: flex; }
  .lc-sidebar-mini {
    width: 160px; background: #0b0f14;
    border-right: 1px solid var(--border); padding: 16px 12px;
  }
  .lc-sidebar-mini h4 {
    font-size: 10px; letter-spacing: 1px; color: var(--muted);
    text-transform: uppercase; margin-bottom: 12px; font-family: var(--font-mono);
  }
  .lc-participant {
    display: flex; align-items: center; gap: 8px; padding: 6px 8px;
    border-radius: 6px; margin-bottom: 4px; background: rgba(255,255,255,0.03);
  }
  .lc-participant-avatar {
    width: 22px; height: 22px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 9px; font-weight: 700; color: #000; font-family: var(--font-mono);
  }
  .lc-participant-name { font-size: 11px; color: var(--text); font-family: var(--font-mono); }
  .lc-online-dot {
    width: 5px; height: 5px; border-radius: 50%; background: var(--green);
    margin-left: auto; animation: blink 2s infinite;
  }
  .lc-code-area {
    flex: 1; padding: 20px; font-family: var(--font-mono);
    font-size: 13px; line-height: 1.8; position: relative; overflow: hidden;
  }
  .lc-line { display: flex; align-items: flex-start; gap: 20px; }
  .lc-ln { color: #3a4a5a; min-width: 20px; text-align: right; user-select: none; }
  .lc-kw  { color: #ff7b72; }
  .lc-fn  { color: #d2a8ff; }
  .lc-str { color: #a5d6ff; }
  .lc-cm  { color: #3a4a5a; }
  .lc-var { color: var(--text); }
  .lc-op  { color: var(--muted); }
  .lc-green-text { color: var(--green); }
  .lc-cursor {
    display: inline-block; width: 2px; height: 14px;
    background: var(--cyan); margin-left: 2px; vertical-align: middle;
    animation: blink 1s infinite;
  }
  .lc-highlight-line {
    background: rgba(0,255,135,0.05); border-left: 2px solid var(--green);
    margin: 0 -20px; padding: 0 20px;
  }

  /* STATS */
  .lc-stats {
    position: relative; z-index: 2; display: flex;
    max-width: 700px; margin: 0 auto 100px; padding: 0 48px;
    border: 1px solid var(--border); border-radius: 12px;
    overflow: hidden; background: var(--surface);
    animation: fadeUp 0.6s ease 1s both;
  }
  .lc-stat { flex: 1; padding: 28px 20px; text-align: center; border-right: 1px solid var(--border); }
  .lc-stat:last-child { border-right: none; }
  .lc-stat-num {
    font-size: 36px; font-weight: 800; color: var(--green);
    font-family: var(--font-mono); display: block; line-height: 1; margin-bottom: 6px;
  }
  .lc-stat-label { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }

  /* FEATURES */
  .lc-features {
    position: relative; z-index: 2; padding: 0 48px 100px;
    max-width: 1200px; margin: 0 auto;
  }
  .lc-section-tag {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 12px; font-family: var(--font-mono); color: var(--green);
    letter-spacing: 2px; text-transform: uppercase; margin-bottom: 16px;
  }
  .lc-section-tag::before {
    content: ''; display: inline-block; width: 20px; height: 1px; background: var(--green);
  }
  .lc-section-title {
    font-size: clamp(32px, 5vw, 56px); font-weight: 800;
    letter-spacing: -2px; margin-bottom: 64px; line-height: 1.1;
  }
  .lc-section-title .acc { color: var(--green); }
  .lc-features-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 2px; background: var(--border);
    border: 1px solid var(--border); border-radius: 12px; overflow: hidden;
  }
  .lc-feature-card {
    background: var(--surface); padding: 36px 32px;
    position: relative; overflow: hidden; transition: background 0.3s;
  }
  .lc-feature-card:hover { background: var(--surface2); }
  .lc-feature-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, var(--green), var(--cyan));
    opacity: 0; transition: opacity 0.3s;
  }
  .lc-feature-card:hover::before { opacity: 1; }
  .lc-feature-icon {
    width: 48px; height: 48px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; margin-bottom: 20px;
    background: rgba(0,255,135,0.08); border: 1px solid rgba(0,255,135,0.15);
  }
  .lc-feature-num {
    position: absolute; top: 24px; right: 28px;
    font-family: var(--font-mono); font-size: 11px; color: var(--border); font-weight: 700;
  }
  .lc-feature-title { font-size: 18px; font-weight: 700; margin-bottom: 10px; letter-spacing: -0.3px; }
  .lc-feature-desc { font-size: 14px; color: var(--muted); line-height: 1.7; }

  /* HOW IT WORKS */
  .lc-how {
    position: relative; z-index: 2; padding: 0 48px 100px;
    max-width: 1200px; margin: 0 auto;
  }
  .lc-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; position: relative; }
  .lc-steps::before {
    content: ''; position: absolute; top: 32px; left: 15%; right: 15%; height: 1px;
    background: linear-gradient(90deg, transparent, var(--border), var(--green), var(--border), transparent);
  }
  .lc-step { text-align: center; padding: 32px 24px; }
  .lc-step-num {
    width: 64px; height: 64px; border-radius: 50%;
    background: var(--surface); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-mono); font-size: 20px; font-weight: 700; color: var(--green);
    margin: 0 auto 24px; position: relative; z-index: 1; transition: all 0.3s;
  }
  .lc-step:hover .lc-step-num {
    background: rgba(0,255,135,0.1); border-color: var(--green);
    box-shadow: 0 0 30px rgba(0,255,135,0.2);
  }
  .lc-step-title { font-size: 18px; font-weight: 700; margin-bottom: 12px; letter-spacing: -0.3px; }
  .lc-step-desc { font-size: 14px; color: var(--muted); line-height: 1.7; }

  /* ---- FOUNDER SECTION ---- */
  .lc-founder {
    position: relative; z-index: 2;
    max-width: 1200px; margin: 0 auto;
    padding: 0 48px 100px;
  }
  .lc-founder-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 48px 52px;
    display: flex;
    gap: 52px;
    align-items: center;
    position: relative;
    overflow: hidden;
    transition: border-color 0.3s;
  }
  .lc-founder-card:hover { border-color: rgba(0,255,135,0.2); }
  .lc-founder-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, var(--green), var(--cyan), var(--green));
    background-size: 200%;
  }
  .lc-founder-card::after {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse at 10% 50%, rgba(0,255,135,0.04) 0%, transparent 60%);
    pointer-events: none;
  }

  /* Photo */
  .lc-founder-photo-wrap {
    flex-shrink: 0; position: relative;
  }
  .lc-founder-photo {
    width: 130px; height: 130px; border-radius: 50%;
    object-fit: cover;
    border: 3px solid rgba(0,255,135,0.3);
    display: block;
    background: var(--surface2);
  }
  /* Placeholder avatar when no photo */
  .lc-founder-avatar {
    width: 130px; height: 130px; border-radius: 50%;
    background: linear-gradient(135deg, #0d2a1f, #0a1a2e);
    border: 3px solid rgba(0,255,135,0.3);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-mono); font-size: 36px; font-weight: 700;
    color: var(--green);
  }
  .lc-founder-photo-ring {
    position: absolute; inset: -6px; border-radius: 50%;
    border: 1px solid rgba(0,255,135,0.15);
  }
  .lc-founder-online {
    position: absolute; bottom: 6px; right: 6px;
    width: 18px; height: 18px; border-radius: 50%;
    background: var(--green); border: 3px solid var(--surface);
    animation: blink 2.5s infinite;
  }

  /* Text */
  .lc-founder-content { flex: 1; min-width: 0; }
  .lc-founder-tag {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 11px; font-family: var(--font-mono); color: var(--green);
    letter-spacing: 2px; text-transform: uppercase; margin-bottom: 14px;
  }
  .lc-founder-tag::before {
    content: ''; display: inline-block; width: 16px; height: 1px; background: var(--green);
  }
  .lc-founder-name {
    font-size: 32px; font-weight: 800; letter-spacing: -1.5px;
    margin-bottom: 6px; line-height: 1.1;
  }
  .lc-founder-name span { color: var(--green); }
  .lc-founder-role {
    font-family: var(--font-mono); font-size: 13px; color: var(--cyan);
    margin-bottom: 18px; display: flex; align-items: center; gap: 8px;
  }
  .lc-founder-role::before {
    content: '//'; color: var(--muted); font-size: 11px;
  }
  .lc-founder-bio {
    font-size: 15px; color: var(--muted); line-height: 1.75;
    margin-bottom: 24px; max-width: 560px;
  }
  .lc-founder-bio strong { color: var(--text); font-weight: 600; }

  /* Tech stack pills */
  .lc-founder-stack {
    display: flex; flex-wrap: wrap; gap: 8px;
  }
  .lc-stack-pill {
    padding: 4px 12px;
    background: rgba(0,255,135,0.05);
    border: 1px solid rgba(0,255,135,0.12);
    border-radius: 100px;
    font-family: var(--font-mono); font-size: 11px; color: var(--green);
    letter-spacing: 0.5px;
  }

  /* CTA BAND */
  .lc-cta-band {
    position: relative; z-index: 2; margin: 0 48px 100px;
    border-radius: 16px; padding: 72px 64px;
    background: linear-gradient(135deg, rgba(0,255,135,0.07) 0%, rgba(0,229,255,0.04) 100%);
    border: 1px solid rgba(0,255,135,0.15); text-align: center; overflow: hidden;
  }
  .lc-cta-band::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(ellipse at 50% 0%, rgba(0,255,135,0.08) 0%, transparent 70%);
  }
  .lc-cta-band h2 {
    position: relative; font-size: clamp(28px, 4vw, 48px);
    font-weight: 800; letter-spacing: -2px; margin-bottom: 16px;
  }
  .lc-cta-band p {
    position: relative; color: var(--muted); font-size: 16px; margin-bottom: 40px;
  }
  .lc-cta-band-actions {
    position: relative; display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;
  }

  /* FOOTER */
  .lc-footer {
    position: relative; z-index: 2; border-top: 1px solid var(--border);
    padding: 48px; display: flex; justify-content: space-between;
    align-items: center; flex-wrap: wrap; gap: 16px;
  }
  .lc-footer-left { display: flex; align-items: center; gap: 12px; }
  .lc-footer-brand { font-family: var(--font-mono); font-size: 16px; font-weight: 700; color: var(--green); }
  .lc-footer-copy { font-size: 13px; color: var(--muted); }
  .lc-footer-links { display: flex; gap: 28px; list-style: none; }
  .lc-footer-links a { font-size: 13px; color: var(--muted); text-decoration: none; transition: color 0.2s; }
  .lc-footer-links a:hover { color: var(--text); }

  /* RESPONSIVE */
  @media (max-width: 768px) {
    .lc-nav { padding: 16px 20px; }
    .lc-nav-links { display: none; }
    .lc-hero { padding: 60px 20px 40px; }
    .lc-preview-wrap { padding: 0 20px; }
    .lc-stats { margin: 0 20px 60px; }
    .lc-features, .lc-how, .lc-founder { padding: 0 20px 60px; }
    .lc-features-grid { grid-template-columns: 1fr; }
    .lc-steps { grid-template-columns: 1fr; }
    .lc-steps::before { display: none; }
    .lc-founder-card { flex-direction: column; align-items: flex-start; padding: 32px 28px; gap: 28px; }
    .lc-cta-band { margin: 0 20px 60px; padding: 48px 24px; }
    .lc-footer { padding: 32px 20px; flex-direction: column; align-items: flex-start; }
  }
`;

const features = [
  { icon: "⚡", title: "Real-Time Sync",       desc: "Every keystroke synced instantly across all connected developers. Zero lag, zero conflicts." },
  { icon: "👥", title: "Live Cursors",          desc: "See exactly where your teammates are working with color-coded cursor tracking." },
  { icon: "🌐", title: "Multi-Language",        desc: "JavaScript, Python, C++, Java and more. Switch languages on the fly without leaving the room." },
  { icon: "💬", title: "Built-in Chat",         desc: "Discuss code without switching tabs. Chat panel integrated right beside your editor." },
  { icon: "▶",  title: "Run & Execute",         desc: "Execute code directly in the browser. Get instant output without any local setup." },
  { icon: "🔒", title: "Private Rooms",         desc: "Secure, invite-only rooms. Share a link and start collaborating in seconds." },
];

const steps = [
  { num: "01", title: "Create a Room",   desc: "One click to spin up a private coding room. Get a shareable link instantly." },
  { num: "02", title: "Invite Your Team", desc: "Share the room ID. Your teammates join with no install required — just a browser." },
  { num: "03", title: "Code Together",   desc: "Write, run, and iterate in real time. Every change synced, every idea visible." },
];

const participants = [
  { name: "Arjun", color: "#00ff87", initial: "AK" },
  { name: "Priya", color: "#00e5ff", initial: "PS" },
  { name: "Ravi",  color: "#ff7b72", initial: "RD" },
];

const stack = ["React", "Node.js", "Socket.io", "MongoDB", "Express", "Monaco Editor"];

export default function Home() {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser]         = useState(null);
  const [typedLine, setTypedLine] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    const target = "  collaborate({ real: true, lag: 0 });";
    let i = 0;
    const iv = setInterval(() => {
      setTypedLine(target.slice(0, i));
      i++;
      if (i > target.length) clearInterval(iv);
    }, 60);
    return () => clearInterval(iv);
  }, []);

  const getInitials = (name) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styleSheet }} />
      <div className="lc-page">
        <div className="lc-grid-bg" />
        <div className="lc-scanline" />

        {/* NAVBAR */}
        <nav className="lc-nav">
          <a className="lc-logo" href="#">
            <span className="lc-logo-dot" /> LiveCode
          </a>
          <ul className="lc-nav-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#how">How It Works</a></li>
            <li><a href="#founder">Founder</a></li>
          </ul>
          <div className="lc-nav-actions">
            {user ? (
              <div className="lc-avatar" title="Click to logout"
                onClick={() => { localStorage.removeItem("user"); localStorage.removeItem("token"); setUser(null); }}>
                {getInitials(user.name)}
              </div>
            ) : (
              <>
                <button className="lc-btn-ghost" onClick={() => setShowAuth(true)}>Login</button>
                <button className="lc-btn-primary" onClick={() => setShowAuth(true)}>Get Started</button>
              </>
            )}
          </div>
        </nav>

        {/* HERO */}
        <section className="lc-hero">
          <div className="lc-orb lc-orb-1" />
          <div className="lc-orb lc-orb-2" />
          <div className="lc-hero-badge">
            <span className="lc-logo-dot" /> REAL-TIME COLLABORATION
          </div>
          <h1 className="lc-hero-title">
            Code Together.<br />
            <span className="green">Ship Faster.</span>
          </h1>
          <p className="lc-hero-sub">
            A collaborative code editor that syncs in real time. Invite your team,
            write code, run it instantly — no setup, no friction.
          </p>
          <div className="lc-hero-cta">
            <button className="lc-cta-primary" onClick={() => navigate("/create")}>＋ Create a Room</button>
            <button className="lc-cta-secondary" onClick={() => navigate("/join")}>→ Join a Room</button>
          </div>
          <p className="lc-hero-hint">No install required &nbsp;•&nbsp; Works in any browser &nbsp;•&nbsp; Free to use</p>
        </section>

        {/* CODE PREVIEW */}
        <div className="lc-preview-wrap">
          <div className="lc-window">
            <div className="lc-window-bar">
              <span className="lc-dot lc-dot-red" />
              <span className="lc-dot lc-dot-yell" />
              <span className="lc-dot lc-dot-green" />
              <span className="lc-window-title">livecode · room/xk9f2 · index.js</span>
              <div className="lc-window-users">
                {participants.map((p) => (
                  <div key={p.name} className="lc-user-dot" style={{ background: p.color }}>{p.initial}</div>
                ))}
              </div>
            </div>
            <div className="lc-window-body">
              <div className="lc-sidebar-mini">
                <h4>Online Now</h4>
                {participants.map((p) => (
                  <div key={p.name} className="lc-participant">
                    <div className="lc-participant-avatar" style={{ background: p.color }}>{p.initial}</div>
                    <span className="lc-participant-name">{p.name}</span>
                    <span className="lc-online-dot" />
                  </div>
                ))}
              </div>
              <div className="lc-code-area">
                <div className="lc-line"><span className="lc-ln">1</span><span><span className="lc-cm">// 🚀 livecode — real-time collab editor</span></span></div>
                <div className="lc-line"><span className="lc-ln">2</span><span>&nbsp;</span></div>
                <div className="lc-line"><span className="lc-ln">3</span><span><span className="lc-kw">const</span> <span className="lc-var">session</span> <span className="lc-op">=</span> <span className="lc-fn">createRoom</span><span className="lc-op">(</span><span className="lc-str">"xk9f2"</span><span className="lc-op">);</span></span></div>
                <div className="lc-line"><span className="lc-ln">4</span><span>&nbsp;</span></div>
                <div className="lc-line lc-highlight-line"><span className="lc-ln">5</span><span><span className="lc-fn">session</span><span className="lc-op">.</span><span className="lc-fn">onJoin</span><span className="lc-op">(</span><span className="lc-var">user</span><span className="lc-op"> =&gt; </span><span className="lc-op">{"{"}</span></span></div>
                <div className="lc-line"><span className="lc-ln">6</span><span><span className="lc-green-text">{typedLine}</span><span className="lc-cursor" /></span></div>
                <div className="lc-line"><span className="lc-ln">7</span><span><span className="lc-op">{"}"}</span><span className="lc-op">);</span></span></div>
                <div className="lc-line"><span className="lc-ln">8</span><span>&nbsp;</span></div>
                <div className="lc-line"><span className="lc-ln">9</span><span><span className="lc-cm">// Output: synced across {participants.length} devs ✓</span></span></div>
              </div>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="lc-stats">
          {[{ num: "< 50ms", label: "Sync Latency" }, { num: "4+", label: "Languages" }, { num: "∞", label: "Collaborators" }].map((s) => (
            <div key={s.label} className="lc-stat">
              <span className="lc-stat-num">{s.num}</span>
              <span className="lc-stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* FEATURES */}
        <section id="features" className="lc-features">
          <div className="lc-section-tag">What You Get</div>
          <h2 className="lc-section-title">Everything a dev team<br /><span className="acc">needs to move fast</span></h2>
          <div className="lc-features-grid">
            {features.map((f, i) => (
              <div key={f.title} className="lc-feature-card">
                <span className="lc-feature-num">0{i + 1}</span>
                <div className="lc-feature-icon">{f.icon}</div>
                <h3 className="lc-feature-title">{f.title}</h3>
                <p className="lc-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="lc-how">
          <div className="lc-section-tag">Simple Process</div>
          <h2 className="lc-section-title">Up and running in<br /><span className="acc">under 30 seconds</span></h2>
          <div className="lc-steps">
            {steps.map((s) => (
              <div key={s.num} className="lc-step">
                <div className="lc-step-num">{s.num}</div>
                <h3 className="lc-step-title">{s.title}</h3>
                <p className="lc-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FOUNDER SECTION ── */}
        <section id="founder" className="lc-founder">
          <div className="lc-section-tag">The Person Behind It</div>
          <h2 className="lc-section-title">Meet the<br /><span className="acc">Founder</span></h2>

          <div className="lc-founder-card">

            {/* PHOTO — replace src with your actual image path */}
            <div className="lc-founder-photo-wrap">
              {/* ↓↓ REPLACE THIS src WITH YOUR PHOTO PATH e.g. "/assets/anshul.jpg" ↓↓ */}
              {/* <img className="lc-founder-photo" src="/assets/anshul.jpg" alt="Anshul Sharma" /> */}

              {/* Avatar shown until you add a real photo — remove this div when you add the img above */}
              <div className="lc-founder-avatar">AS</div>

              <div className="lc-founder-photo-ring" />
              <div className="lc-founder-online" title="Building..." />
            </div>

            {/* INFO */}
            <div className="lc-founder-content">
              <div className="lc-founder-tag">Founder & Developer</div>
              <h3 className="lc-founder-name">Anshul <span>Sharma</span></h3>
              <div className="lc-founder-role">Full Stack Developer</div>
              <p className="lc-founder-bio">
                Hey, I'm Anshul — a passionate <strong>Full Stack Developer</strong> who loves
                building tools that make developers' lives easier. I created <strong>LiveCode</strong> to
                solve a real problem: collaborating on code remotely without the friction of screen sharing
                or copying code back and forth. Every feature in this platform comes from a developer's
                perspective — built by a dev, for devs.
              </p>
              <div className="lc-founder-stack">
                {stack.map((s) => (
                  <span key={s} className="lc-stack-pill">{s}</span>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* CTA BAND */}
        <div className="lc-cta-band">
          <h2>Ready to build<br /><span style={{ color: "var(--green)" }}>with your team?</span></h2>
          <p>Create a room in one click. Your teammates join instantly.</p>
          <div className="lc-cta-band-actions">
            <button className="lc-cta-primary" onClick={() => navigate("/create")}>＋ Create a Room</button>
            <button className="lc-cta-secondary" onClick={() => navigate("/join")}>→ Join a Room</button>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="lc-footer">
          <div className="lc-footer-left">
            <span className="lc-footer-brand">LiveCode</span>
            <span className="lc-footer-copy">© 2025 • Built by Anshul Sharma</span>
          </div>
          <ul className="lc-footer-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#how">How It Works</a></li>
            <li><a href="#founder">Founder</a></li>
          </ul>
        </footer>

        {showAuth && <AuthModal closeModal={() => setShowAuth(false)} setUser={setUser} />}
      </div>
    </>
  );
}