/**
 * SpinLab – Slot Machine Mini-Game
 *
 * A 3-reel, 3-row slot machine inspired by Loudmouth Spin Lab.
 * Features:
 *   • 8 symbols (Wild/Lightning, 7, BAR, Bell, Cherry, Watermelon, Orange, Lemon)
 *   • Single centre payline with wild substitution
 *   • Animated reel cycling with staggered stops
 *   • Lightning Bonus: every ~15 spins a bolt flashes, thunder cracks, and the
 *     reels light up electric – plus a guaranteed decent win
 *   • Web Audio API sound synthesis (no audio files required)
 *   • Coin balance, configurable bet sizes, and spin history
 */

import React, { useState, useRef, useCallback, useEffect } from "react";

/* ─── Symbol definitions ──────────────────────────────────────────────────── */
const SYMBOLS = [
  { id: "wild",       emoji: "⚡",  name: "WILD",       color: "#FFD700", glow: "#FFD700" },
  { id: "seven",      emoji: "7",   name: "SEVEN",      color: "#FF4455", glow: "#FF2233" },
  { id: "bar",        emoji: "BAR", name: "BAR",        color: "#66AAFF", glow: "#4488FF" },
  { id: "bell",       emoji: "🔔",  name: "BELL",       color: "#FFD700", glow: "#FFD700" },
  { id: "cherry",     emoji: "🍒",  name: "CHERRY",     color: "#FF2266", glow: "#FF0044" },
  { id: "watermelon", emoji: "🍉",  name: "MELON",      color: "#44CC44", glow: "#22AA22" },
  { id: "orange",     emoji: "🍊",  name: "ORANGE",     color: "#FF8800", glow: "#FF6600" },
  { id: "lemon",      emoji: "🍋",  name: "LEMON",      color: "#FFFF44", glow: "#DDDD00" },
];

/* Weighted symbol pool – commons appear more often */
const POOL = [
  "lemon","lemon","lemon","lemon","lemon",
  "orange","orange","orange","orange",
  "watermelon","watermelon","watermelon",
  "cherry","cherry","cherry",
  "bell","bell","bell",
  "bar","bar",
  "seven","seven",
  "wild",
];

/* Pay table – evaluated highest → lowest */
const PAY_TABLE = [
  { sym: "wild",       mult: 500, label: "⚡ ⚡ ⚡",         three: true },
  { sym: "seven",      mult: 200, label: "7  7  7",          three: true },
  { sym: "bar",        mult: 100, label: "BAR BAR BAR",      three: true },
  { sym: "bell",       mult: 50,  label: "🔔 🔔 🔔",         three: true },
  { sym: "cherry",     mult: 30,  label: "🍒 🍒 🍒",         three: true },
  { sym: "watermelon", mult: 20,  label: "🍉 🍉 🍉",         three: true },
  { sym: "orange",     mult: 15,  label: "🍊 🍊 🍊",         three: true },
  { sym: "lemon",      mult: 10,  label: "🍋 🍋 🍋",         three: true },
  { sym: "cherry",     mult: 5,   label: "🍒 🍒 + any",      three: false, partial2: true },
  { sym: "cherry",     mult: 2,   label: "🍒 + any",         three: false, partial1: true },
];

const BET_SIZES = [10, 25, 50, 100, 250];
const STARTING_COINS = 1000;
const LIGHTNING_BASE = 15; // base spins between lightning bonuses

/* Symbols keyed by id for quick lookup */
const SYM_MAP = Object.fromEntries(SYMBOLS.map((s) => [s.id, s]));

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function rndSym() {
  return POOL[Math.floor(Math.random() * POOL.length)];
}

function evaluate(results, bet) {
  const [a, b, c] = results;
  const nonWild = results.filter((s) => s !== "wild");

  /* Three-of-a-kind (wild substitutes for any symbol) */
  if (nonWild.length === 0 || nonWild.every((s) => s === nonWild[0])) {
    const sym = nonWild[0] || "wild";
    const entry = PAY_TABLE.find((e) => e.sym === sym && e.three);
    if (entry) return { win: bet * entry.mult, mult: entry.mult, label: entry.label };
  }

  /* Cherry partial matches (no wild substitution) */
  if (a === "cherry" && b === "cherry") {
    return { win: bet * 5, mult: 5, label: "🍒 🍒 + any" };
  }
  if (a === "cherry") {
    return { win: bet * 2, mult: 2, label: "🍒 + any" };
  }

  return { win: 0, mult: 0, label: null };
}

/* ─── Web Audio helpers ───────────────────────────────────────────────────── */
function getOrCreateCtx(ref) {
  if (!ref.current) {
    try {
      ref.current = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null;
    }
  }
  if (ref.current.state === "suspended") ref.current.resume();
  return ref.current;
}

function playThunder(ctx) {
  if (!ctx) return;
  const rate = ctx.sampleRate;
  const len = Math.floor(rate * 2.5);
  const buf = ctx.createBuffer(1, len, rate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (rate * 0.45)) * 0.7;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
  src.connect(gain);
  gain.connect(ctx.destination);
  src.start();
}

function playCrack(ctx) {
  if (!ctx) return;
  const rate = ctx.sampleRate;
  const len = Math.floor(rate * 0.12);
  const buf = ctx.createBuffer(1, len, rate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filt = ctx.createBiquadFilter();
  filt.type = "bandpass";
  filt.frequency.value = 2500;
  filt.Q.value = 0.4;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.9, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
  src.connect(filt);
  filt.connect(gain);
  gain.connect(ctx.destination);
  src.start();
}

function playWin(ctx, mult) {
  if (!ctx) return;
  const notes =
    mult >= 200 ? [523, 659, 784, 1047, 1319] :
    mult >= 50  ? [523, 659, 784, 1047] :
    mult >= 10  ? [523, 659, 784] :
                  [523, 659];
  notes.forEach((freq, i) => {
    const t = ctx.currentTime + i * 0.1;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.3);
  });
}

function playClick(ctx) {
  if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.value = 180;
  gain.gain.setValueAtTime(0.08, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.07);
}

/* ─── Symbol Cell ─────────────────────────────────────────────────────────── */
function SymCell({ symId, center, lightning }) {
  const s = SYM_MAP[symId] || SYM_MAP.lemon;
  const isWild = symId === "wild";
  const glow = lightning && (isWild || center)
    ? `0 0 18px 6px ${s.glow}, 0 0 32px 10px rgba(255,255,100,0.5)`
    : center
    ? `0 0 10px 2px ${s.glow}44`
    : "none";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: 72,
        fontSize: symId === "bar" || symId === "seven" ? 28 : 40,
        fontWeight: "900",
        color: s.color,
        textShadow: lightning ? `0 0 12px ${s.glow}, 0 0 24px ${s.glow}` : `0 0 6px ${s.glow}44`,
        boxShadow: glow,
        borderRadius: 8,
        transition: "box-shadow 0.15s, text-shadow 0.15s",
        background: center ? "rgba(255,255,255,0.04)" : "transparent",
        letterSpacing: symId === "bar" ? 1 : undefined,
        userSelect: "none",
      }}
    >
      {s.emoji}
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────────────────── */
export default function SpinLab() {
  const [coins, setCoins] = useState(STARTING_COINS);
  const [bet, setBet] = useState(BET_SIZES[0]);
  const [spinning, setSpinning] = useState(false);
  /* reelRows[r][row] = symId; row 1 is the payline */
  const [reelRows, setReelRows] = useState(() => [
    [rndSym(), rndSym(), rndSym()],
    [rndSym(), rndSym(), rndSym()],
    [rndSym(), rndSym(), rndSym()],
  ]);
  const [reelStopped, setReelStopped] = useState([true, true, true]);
  const [winInfo, setWinInfo] = useState(null);
  const [message, setMessage] = useState("Pull the lever and try your luck!");
  const [lightning, setLightning] = useState(false);
  const [lightningMsg, setLightningMsg] = useState("");
  const [spinCount, setSpinCount] = useState(0);
  const [nextLightning, setNextLightning] = useState(
    LIGHTNING_BASE + Math.floor(Math.random() * 8)
  );
  const [history, setHistory] = useState([]);
  const [showPayTable, setShowPayTable] = useState(false);

  const audioRef = useRef(null);
  const intervalRefs = useRef([null, null, null]);
  const timeoutRefs = useRef([]);

  /* Clear all pending timers */
  function clearTimers() {
    intervalRefs.current.forEach((id) => id && clearInterval(id));
    intervalRefs.current = [null, null, null];
    timeoutRefs.current.forEach((id) => clearTimeout(id));
    timeoutRefs.current = [];
  }

  /* Trigger lightning bonus visual + audio */
  const triggerLightningBonus = useCallback((bonusLabel) => {
    const ctx = getOrCreateCtx(audioRef);
    setLightning(true);
    setLightningMsg(bonusLabel || "⚡ LIGHTNING BONUS ⚡");
    playCrack(ctx);
    const t1 = setTimeout(() => playThunder(ctx), 90);
    const t2 = setTimeout(() => setLightning(false), 2400);
    timeoutRefs.current.push(t1, t2);
  }, []);

  const spin = useCallback(() => {
    if (spinning || coins < bet) return;
    const ctx = getOrCreateCtx(audioRef);
    playClick(ctx);

    clearTimers();
    setCoins((c) => c - bet);
    setSpinning(true);
    setReelStopped([false, false, false]);
    setWinInfo(null);
    setMessage("");

    const newCount = spinCount + 1;
    setSpinCount(newCount);

    const isLightningRound = newCount >= nextLightning;

    /* Determine final payline results */
    let finalResults = [rndSym(), rndSym(), rndSym()];
    if (isLightningRound) {
      /* Guarantee a solid win on lightning rounds */
      const bonusSyms = ["seven", "bar", "bell", "cherry", "watermelon", "orange"];
      const sym = bonusSyms[Math.floor(Math.random() * bonusSyms.length)];
      finalResults = [sym, sym, sym];
    }

    /* Start rapid cycling on each reel */
    [0, 1, 2].forEach((r) => {
      intervalRefs.current[r] = setInterval(() => {
        setReelRows((prev) => {
          const next = prev.map((col) => [...col]);
          next[r] = [rndSym(), rndSym(), rndSym()];
          return next;
        });
      }, 70);
    });

    /* Stop reels one by one with staggered delays */
    const stopDelays = [1100, 2000, 2900];
    finalResults.forEach((sym, r) => {
      const tid = setTimeout(() => {
        clearInterval(intervalRefs.current[r]);
        intervalRefs.current[r] = null;
        setReelRows((prev) => {
          const next = prev.map((col) => [...col]);
          next[r] = [rndSym(), sym, rndSym()];
          return next;
        });
        setReelStopped((prev) => {
          const next = [...prev];
          next[r] = true;
          return next;
        });

        /* After last reel stops, evaluate and finalize */
        if (r === 2) {
          const evalTid = setTimeout(() => {
            const ev = evaluate(finalResults, bet);
            if (isLightningRound) {
              triggerLightningBonus(ev.label ? `⚡ LIGHTNING BONUS! ${ev.label}` : "⚡ LIGHTNING BONUS ⚡");
              if (nextLightning === newCount) {
                setNextLightning(newCount + LIGHTNING_BASE + Math.floor(Math.random() * 10));
              }
            }
            if (ev.win > 0) {
              setCoins((c) => c + ev.win);
              setWinInfo(ev);
              playWin(ctx, ev.mult);
              setMessage(`🎉 ${ev.label} — +${ev.win} coins  (${ev.mult}×)`);
            } else {
              setMessage("No win this time. Spin again!");
            }
            setHistory((h) => [
              { results: finalResults, win: ev.win, mult: ev.mult, lightning: isLightningRound },
              ...h.slice(0, 14),
            ]);
            setSpinning(false);
          }, 200);
          timeoutRefs.current.push(evalTid);
        }
      }, stopDelays[r]);
      timeoutRefs.current.push(tid);
    });
  }, [spinning, coins, bet, spinCount, nextLightning, triggerLightningBonus]);

  /* Cleanup on unmount */
  useEffect(() => () => clearTimers(), []);

  /* ── Render ── */
  const canSpin = !spinning && coins >= bet;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #0a0a1a 0%, #0f0f2a 50%, #0a1218 100%)",
        color: "#fff",
        fontFamily: "'Inter', system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── CSS keyframe animations ── */}
      <style>{`
        @keyframes spinlab-flash {
          0%   { opacity: 0; }
          10%  { opacity: 0.85; }
          20%  { opacity: 0.2; }
          35%  { opacity: 0.9; }
          55%  { opacity: 0.1; }
          70%  { opacity: 0.75; }
          85%  { opacity: 0.05; }
          100% { opacity: 0; }
        }
        @keyframes spinlab-bolt {
          0%   { opacity: 0; transform: scaleY(0.6) scaleX(0.8); }
          15%  { opacity: 1; transform: scaleY(1) scaleX(1); }
          40%  { opacity: 0.7; }
          60%  { opacity: 1; }
          80%  { opacity: 0.3; }
          100% { opacity: 0; transform: scaleY(1.1) scaleX(0.9); }
        }
        @keyframes spinlab-pulse {
          0%,100% { box-shadow: 0 0 12px 4px #ffd70088; }
          50%      { box-shadow: 0 0 32px 12px #ffd700cc, 0 0 60px 20px #ff880055; }
        }
        @keyframes spinlab-win-pop {
          0%   { transform: scale(0.8); opacity: 0; }
          60%  { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes spinlab-reel-glow {
          0%,100% { box-shadow: 0 0 8px 2px #4488ff44; }
          50%      { box-shadow: 0 0 28px 8px #66bbffaa; }
        }
        .spinlab-spinning-reel {
          animation: spinlab-reel-glow 0.3s linear infinite;
        }
        .spinlab-btn-spin {
          background: linear-gradient(135deg, #1a45c4 0%, #0f2d80 100%);
          border: 2px solid #3366ff;
          color: #fff;
          font-weight: 900;
          font-size: 1.1rem;
          letter-spacing: 0.05em;
          padding: 14px 40px;
          border-radius: 12px;
          cursor: pointer;
          transition: transform 0.1s, box-shadow 0.15s, filter 0.15s;
          box-shadow: 0 4px 20px #1a45c466;
          text-transform: uppercase;
        }
        .spinlab-btn-spin:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px #3366ffaa;
          filter: brightness(1.15);
        }
        .spinlab-btn-spin:active:not(:disabled) {
          transform: translateY(1px);
        }
        .spinlab-btn-spin:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .spinlab-bet-btn {
          background: transparent;
          border: 1px solid #334;
          color: #aab;
          padding: 6px 14px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.8rem;
          transition: background 0.1s, color 0.1s, border-color 0.1s;
        }
        .spinlab-bet-btn.active {
          background: #1a45c4;
          border-color: #3366ff;
          color: #fff;
        }
        .spinlab-bet-btn:hover:not(.active):not(:disabled) {
          background: #1a2240;
          border-color: #4466cc;
          color: #ccd;
        }
        .spinlab-bet-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>

      {/* ── Lightning overlay ── */}
      {lightning && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            pointerEvents: "none",
          }}
        >
          {/* White flash */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(220,240,255,0.6)",
              animation: "spinlab-flash 2.2s ease-out forwards",
            }}
          />
          {/* Lightning bolt SVG centred */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "spinlab-bolt 2.2s ease-out forwards",
            }}
          >
            <svg width="120" height="220" viewBox="0 0 120 220" fill="none">
              <defs>
                <filter id="lglow">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <path
                d="M72 4 L20 110 L56 110 L28 216 L100 88 L62 88 Z"
                fill="#FFE44D"
                stroke="#FFF"
                strokeWidth="2"
                filter="url(#lglow)"
                style={{ filter: "drop-shadow(0 0 16px #FFD700) drop-shadow(0 0 32px #FFF)" }}
              />
            </svg>
          </div>
          {/* Lightning bonus message */}
          <div
            style={{
              position: "absolute",
              top: "22%",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "2rem",
              fontWeight: 900,
              color: "#FFD700",
              textShadow: "0 0 20px #FFD700, 0 0 40px #FF8800",
              letterSpacing: "0.04em",
              textAlign: "center",
              animation: "spinlab-win-pop 0.4s ease-out forwards",
              whiteSpace: "nowrap",
            }}
          >
            {lightningMsg}
          </div>
        </div>
      )}

      {/* ── Page content ── */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 16px 48px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h1 style={{
            fontSize: "2.4rem",
            fontWeight: 900,
            background: "linear-gradient(90deg, #FFD700, #FF8800, #FFD700)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "0.04em",
            marginBottom: 4,
          }}>
            ⚡ SPIN LAB ⚡
          </h1>
          <p style={{ color: "#667", fontSize: "0.85rem" }}>
            3 Reels · Lightning Bonus every ~{LIGHTNING_BASE} spins · Wild substitution active
          </p>
        </div>

        {/* Coin display */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid #223",
          borderRadius: 12,
          padding: "12px 20px",
          marginBottom: 20,
        }}>
          <div>
            <div style={{ fontSize: "0.7rem", color: "#778", textTransform: "uppercase", letterSpacing: "0.08em" }}>Balance</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: coins < bet ? "#FF4455" : "#FFD700" }}>
              🪙 {coins.toLocaleString()}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.7rem", color: "#778", textTransform: "uppercase", letterSpacing: "0.08em" }}>Next ⚡ in</div>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: "#66BBFF" }}>
              ~{Math.max(1, nextLightning - spinCount)} spins
            </div>
          </div>
        </div>

        {/* ── Slot machine cabinet ── */}
        <div style={{
          background: "linear-gradient(180deg, #111830 0%, #0c1020 100%)",
          border: "2px solid #223355",
          borderRadius: 20,
          padding: "24px 20px",
          boxShadow: "0 8px 40px rgba(0,80,200,0.25), inset 0 1px 0 rgba(255,255,255,0.06)",
          marginBottom: 20,
        }}>
          {/* Reels */}
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            {[0, 1, 2].map((r) => (
              <div
                key={r}
                className={!reelStopped[r] ? "spinlab-spinning-reel" : ""}
                style={{
                  flex: 1,
                  background: "rgba(0,0,0,0.6)",
                  border: `2px solid ${lightning ? "#FFD700" : "#1a2a4a"}`,
                  borderRadius: 12,
                  overflow: "hidden",
                  transition: "border-color 0.2s",
                  boxShadow: lightning
                    ? "0 0 20px 4px #FFD70088, 0 0 40px 8px #FF880044"
                    : "inset 0 2px 8px rgba(0,0,0,0.5)",
                  animation: lightning ? "spinlab-pulse 0.4s ease-in-out infinite" : "none",
                  position: "relative",
                }}
              >
                {/* Reel rows */}
                {reelRows[r].map((sym, row) => (
                  <SymCell
                    key={row}
                    symId={sym}
                    center={row === 1}
                    lightning={lightning}
                  />
                ))}

                {/* Payline marker lines */}
                <div style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 71,
                  height: 1,
                  background: "rgba(255,50,50,0.5)",
                  pointerEvents: "none",
                }} />
                <div style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 145,
                  height: 1,
                  background: "rgba(255,50,50,0.5)",
                  pointerEvents: "none",
                }} />
              </div>
            ))}
          </div>

          {/* Payline label */}
          <div style={{
            textAlign: "center",
            fontSize: "0.7rem",
            color: "#FF5566",
            letterSpacing: "0.1em",
            marginBottom: 12,
          }}>
            ── PAYLINE ──
          </div>

          {/* Win message */}
          <div style={{ minHeight: 40, textAlign: "center" }}>
            {winInfo && (
              <div style={{
                fontSize: "1.15rem",
                fontWeight: 800,
                color: winInfo.mult >= 100 ? "#FFD700" : winInfo.mult >= 30 ? "#FF8800" : "#44EE88",
                textShadow: `0 0 12px ${winInfo.mult >= 100 ? "#FFD700" : "#44EE88"}`,
                animation: "spinlab-win-pop 0.35s ease-out",
              }}>
                {message}
              </div>
            )}
            {!winInfo && message && (
              <div style={{ fontSize: "0.9rem", color: "#778", fontStyle: "italic" }}>
                {message}
              </div>
            )}
          </div>
        </div>

        {/* ── Bet selector ── */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid #1a2a3a",
          borderRadius: 12,
          padding: "14px 16px",
          marginBottom: 16,
        }}>
          <div style={{ fontSize: "0.7rem", color: "#778", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Bet per spin
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {BET_SIZES.map((size) => (
              <button
                key={size}
                className={`spinlab-bet-btn${bet === size ? " active" : ""}`}
                onClick={() => setBet(size)}
                disabled={spinning || coins < size}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* ── Spin button ── */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <button
            className="spinlab-btn-spin"
            onClick={spin}
            disabled={!canSpin}
          >
            {spinning ? "⟳  SPINNING…" : coins < bet ? "💸 OUT OF COINS" : "🎰  SPIN"}
          </button>
          {coins < BET_SIZES[0] && !spinning && (
            <div style={{ marginTop: 12 }}>
              <button
                onClick={() => {
                  setCoins(STARTING_COINS);
                  setMessage("🪙 Coins topped up — good luck!");
                }}
                style={{
                  background: "none",
                  border: "1px dashed #446",
                  color: "#88aacc",
                  padding: "6px 18px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: "0.8rem",
                }}
              >
                🔄 Top up coins ({STARTING_COINS.toLocaleString()})
              </button>
            </div>
          )}
        </div>

        {/* ── Pay table toggle ── */}
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={() => setShowPayTable((v) => !v)}
            style={{
              background: "none",
              border: "1px solid #223",
              color: "#88aacc",
              padding: "7px 18px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: "0.8rem",
              width: "100%",
            }}
          >
            {showPayTable ? "▲ Hide Pay Table" : "▼ Show Pay Table"}
          </button>
          {showPayTable && (
            <div style={{
              marginTop: 10,
              background: "rgba(0,0,0,0.4)",
              border: "1px solid #1a2a4a",
              borderRadius: 12,
              overflow: "hidden",
            }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ background: "#0f1830" }}>
                    <th style={{ padding: "8px 14px", textAlign: "left", color: "#778", fontWeight: 600 }}>Combination</th>
                    <th style={{ padding: "8px 14px", textAlign: "right", color: "#778", fontWeight: 600 }}>Multiplier</th>
                    <th style={{ padding: "8px 14px", textAlign: "right", color: "#778", fontWeight: 600 }}>Payout (×{bet})</th>
                  </tr>
                </thead>
                <tbody>
                  {PAY_TABLE.map((row, i) => (
                    <tr
                      key={i}
                      style={{
                        borderTop: "1px solid #1a2a3a",
                        background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
                      }}
                    >
                      <td style={{ padding: "7px 14px", color: "#ccd" }}>{row.label}</td>
                      <td style={{ padding: "7px 14px", textAlign: "right", color: "#FFD700", fontWeight: 700 }}>{row.mult}×</td>
                      <td style={{ padding: "7px 14px", textAlign: "right", color: "#88aacc" }}>{(row.mult * bet).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ padding: "8px 14px", fontSize: "0.72rem", color: "#556", borderTop: "1px solid #1a2a3a" }}>
                ⚡ Wild substitutes for any symbol in three-of-a-kind combinations.
                Lightning Bonus triggers every ~{LIGHTNING_BASE} spins and guarantees a win.
              </div>
            </div>
          )}
        </div>

        {/* ── Spin history ── */}
        {history.length > 0 && (
          <div>
            <div style={{ fontSize: "0.7rem", color: "#556", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Recent spins
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {history.map((h, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "6px 12px",
                    background: "rgba(255,255,255,0.02)",
                    border: `1px solid ${h.win > 0 ? "#1a3a1a" : "#1a1a2a"}`,
                    borderRadius: 8,
                    fontSize: "0.78rem",
                  }}
                >
                  {h.lightning && <span title="Lightning Bonus">⚡</span>}
                  <span style={{ color: "#667", flex: 1 }}>
                    {h.results.map((s) => SYM_MAP[s]?.emoji || s).join(" ")}
                  </span>
                  <span style={{ color: h.win > 0 ? "#44EE88" : "#445", fontWeight: 700 }}>
                    {h.win > 0 ? `+${h.win}` : "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
