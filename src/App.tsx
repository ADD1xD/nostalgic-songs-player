import { useState, useRef, useEffect, useCallback, useMemo, type ReactNode } from "react";

import { songs, type Song, MOODS } from "./songs";

const text = {
  en: { headline: "Krishbuilds", tagline: "songs that take me back" },
  hi: { headline: "Krishbuilds", tagline: "वो गाने जो पुरानी यादें ताज़ा कर दें" },
};

function formatTime(s: number): string {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function PlayIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5.14v14l11-7z" />
    </svg>
  );
}

function PauseIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
    </svg>
  );
}

function PrevIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
    </svg>
  );
}

function NextIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 18h2V6h-2zM6 18l8.5-6L6 6z" />
    </svg>
  );
}

function ShuffleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
    </svg>
  );
}

function RepeatIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
    </svg>
  );
}

function VolumeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  );
}

function VolumeOffIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z" />
    </svg>
  );
}

function MusicNoteIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
  );
}

function SearchIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </svg>
  );
}

function SparkleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.5 13.4 8l5.6 1.4L13.4 11 12 16.5 10.6 11 5 9.4 10.6 8 12 2.5zm7.5 11.2 1 3.3 3.3 1-3.3 1-1 3.3-1-3.3-3.3-1 3.3-1 1-3.3zM4.2 13.5l.7 2.2 2.2.7-2.2.7-.7 2.2-.7-2.2-2.2-.7 2.2-.7.7-2.2z" />
    </svg>
  );
}

function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.15 6.4 2.15 11.86c0 1.74.46 3.44 1.32 4.94L2 22l5.35-1.4a10 10 0 0 0 4.69 1.2h.01c5.46 0 9.89-4.4 9.89-9.86C21.94 6.4 17.5 2 12.04 2zm5.76 14.15c-.24.67-1.4 1.24-1.94 1.32-.5.07-1.13.1-1.82-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.79-4.17-4.93-4.37-.14-.19-1.15-1.53-1.15-2.92 0-1.39.73-2.07.99-2.36.26-.29.57-.36.76-.36h.54c.17 0 .41-.07.64.49.24.58.82 2 .89 2.15.07.14.12.32.02.51-.1.19-.14.32-.29.49-.14.17-.3.38-.43.51-.14.14-.29.29-.12.56.17.28.74 1.22 1.59 1.98 1.09.97 2.01 1.27 2.29 1.41.28.14.45.12.61-.07.17-.19.7-.81.88-1.09.19-.28.37-.23.62-.14.26.1 1.63.77 1.91.91.28.14.47.21.54.32.07.12.07.67-.17 1.34z" />
    </svg>
  );
}

function ShareIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
    </svg>
  );
}

function QueueIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M14 10H3v2h11v-2zm0-4H3v2h11V6zm4 8v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM3 16h7v-2H3v2z" />
    </svg>
  );
}

function CloseIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  );
}

function SunIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 7a5 5 0 1 0 .001 10.001A5 5 0 0 0 12 7zm0-5c.55 0 1 .45 1 1v1c0 .55-.45 1-1 1s-1-.45-1-1V3c0-.55.45-1 1-1zm0 16c.55 0 1 .45 1 1v1c0 .55-.45 1-1 1s-1-.45-1-1v-1c0-.55.45-1 1-1zM3 11h1c.55 0 1 .45 1 1s-.45 1-1 1H3c-.55 0-1-.45-1-1s.45-1 1-1zm17 0h1c.55 0 1 .45 1 1s-.45 1-1 1h-1c-.55 0-1-.45-1-1s.45-1 1-1zM5.64 5.64c.39-.39 1.02-.39 1.41 0l.71.71c.39.39.39 1.02 0 1.41-.39.39-1.02.39-1.41 0l-.71-.71c-.39-.39-.39-1.02 0-1.41zm10.6 10.6c.39-.39 1.02-.39 1.41 0l.71.71c.39.39.39 1.02 0 1.41-.39.39-1.02.39-1.41 0l-.71-.71c-.39-.39-.39-1.02 0-1.41zM18.36 5.64c.39.39.39 1.02 0 1.41l-.71.71c-.39.39-1.02.39-1.41 0-.39-.39-.39-1.02 0-1.41l.71-.71c.39-.39 1.02-.39 1.41 0zM7.76 16.24c.39.39.39 1.02 0 1.41l-.71.71c-.39.39-1.02.39-1.41 0-.39-.39-.39-1.02 0-1.41l.71-.71c.39-.39 1.02-.39 1.41 0z" />
    </svg>
  );
}

function MoonIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.34 2.02C6.59 1.82 2 6.42 2 12.12 2 17.52 6.48 22 11.88 22c5.71 0 10.31-4.59 10.1-10.34-.08-2.13-.85-4.1-2.09-5.64-.31 3.23-2.92 5.81-6.19 6.13-3.52.35-6.57-2.28-6.92-5.7-.08-.78-.02-1.53.14-2.24 1.48-1.4 3.42-2.19 5.42-2.19z" />
    </svg>
  );
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function pulseEl(el: Element | null) {
  if (!el || prefersReducedMotion()) return;
  el.classList.remove("song-card-pop");
  el.querySelectorAll(":scope > .song-ripple").forEach((node) => node.remove());
  const ripple = document.createElement("span");
  ripple.className = "song-ripple";
  ripple.setAttribute("aria-hidden", "true");
  el.appendChild(ripple);
  void el.getBoundingClientRect();
  el.classList.add("song-card-pop");
  window.setTimeout(() => {
    el.classList.remove("song-card-pop");
    ripple.remove();
  }, 430);
}

function pulseSong(index: number, trigger?: HTMLElement | null) {
  const card = document.getElementById(`song-card-${index}`);
  pulseEl(card);
  if (trigger && trigger !== card && !card?.contains(trigger)) pulseEl(trigger);
}

function useCrossfadeIndex(index: number, ms = 280) {
  const [curr, setCurr] = useState(index);
  const [prev, setPrev] = useState<number | null>(null);

  useEffect(() => {
    if (index === curr) return;
    setPrev(curr);
    setCurr(index);
    const t = window.setTimeout(() => setPrev(null), ms);
    return () => window.clearTimeout(t);
  }, [index, curr, ms]);

  return { curr, prev };
}

function EmptySongs({
  icon,
  title,
  hint,
}: {
  icon: ReactNode;
  title: string;
  hint: string;
}) {
  return (
    <div className="songs-empty" role="status">
      <span className="songs-empty-icon" aria-hidden="true">
        {icon}
      </span>
      <p className="text-fg font-semibold text-sm sm:text-base">{title}</p>
      <p className="text-muted text-sm max-w-sm">{hint}</p>
    </div>
  );
}

function EqBars() {
  return (
    <div className="flex items-end gap-[3px] h-[14px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]" aria-hidden="true">
      <span className="eq-bar" style={{ animationDelay: "0ms" }} />
      <span className="eq-bar" style={{ animationDelay: "120ms" }} />
      <span className="eq-bar" style={{ animationDelay: "240ms" }} />
      <span className="eq-bar" style={{ animationDelay: "80ms" }} />
    </div>
  );
}

const CATEGORIES = ["All", ...MOODS] as const;
type Category = (typeof CATEGORIES)[number];
const FADE_MS = 240;

function fadeLinear(
  audio: HTMLAudioElement,
  to: number,
  ms: number,
  fadingRef: { current: boolean },
): Promise<void> {
  return new Promise((resolve) => {
    fadingRef.current = true;
    const from = audio.volume;
    if (ms <= 0 || Math.abs(from - to) < 0.02) {
      audio.volume = to;
      fadingRef.current = false;
      resolve();
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      audio.volume = from + (to - from) * t;
      if (t < 1) requestAnimationFrame(tick);
      else {
        audio.volume = to;
        fadingRef.current = false;
        resolve();
      }
    };
    requestAnimationFrame(tick);
  });
}

function WaveformVisualizer({
  analyserRef,
  active,
  bars = 24,
  className = "",
}: {
  analyserRef: React.RefObject<AnalyserNode | null>;
  active: boolean;
  bars?: number;
  className?: string;
}) {
  const spansRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    let raf = 0;
    let data: Uint8Array<ArrayBuffer> | null = null;
    const tick = () => {
      const analyser = analyserRef.current;
      const els = spansRef.current;
      if (analyser && active) {
        if (!data || data.length !== analyser.frequencyBinCount) {
          data = new Uint8Array(analyser.frequencyBinCount);
        }
        analyser.getByteFrequencyData(data);
        const step = Math.max(1, Math.floor(data.length / bars));
        for (let i = 0; i < bars; i++) {
          const v = data[Math.min(data.length - 1, i * step)] ?? 0;
          const h = Math.max(0.1, v / 255);
          const el = els[i];
          if (el) el.style.transform = `scaleY(${h})`;
        }
      } else {
        for (let i = 0; i < bars; i++) {
          const el = els[i];
          if (el) el.style.transform = "scaleY(0.12)";
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, bars, analyserRef]);

  return (
    <div className={`flex items-end justify-center gap-px ${className}`} aria-hidden="true">
      {Array.from({ length: bars }, (_, i) => (
        <span
          key={i}
          className="viz-bar"
          ref={(el) => {
            spansRef.current[i] = el;
          }}
        />
      ))}
    </div>
  );
}

const colorCache = new Map<string, string>();

function extractDominantColor(src: string): Promise<string> {
  const cached = colorCache.get(src);
  if (cached) return Promise.resolve(cached);

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const size = 24;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve("#1db954");
          return;
        }
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;
        let r = 0;
        let g = 0;
        let b = 0;
        let n = 0;
        for (let i = 0; i < data.length; i += 16) {
          const pr = data[i];
          const pg = data[i + 1];
          const pb = data[i + 2];
          const pa = data[i + 3];
          if (pa < 128) continue;
          const max = Math.max(pr, pg, pb);
          const min = Math.min(pr, pg, pb);
          if (max < 28 || min > 230) continue;
          r += pr;
          g += pg;
          b += pb;
          n += 1;
        }
        const color = n
          ? `rgb(${Math.round(r / n)}, ${Math.round(g / n)}, ${Math.round(b / n)})`
          : "#1db954";
        colorCache.set(src, color);
        resolve(color);
      } catch {
        resolve("#1db954");
      }
    };
    img.onerror = () => resolve("#1db954");
    img.src = encodeURI(src);
  });
}

type RepeatMode = "off" | "all" | "one";
type ThemeMode = "dark" | "light";

function readTheme(): ThemeMode {
  try {
    return localStorage.getItem("kb-theme") === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

function shuffleList(indices: number[], first?: number): number[] {
  const rest = indices.filter((i) => i !== first);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return first === undefined ? rest : [first, ...rest];
}

const FEATURED_INDEX = songs.findIndex((s) => s.title === "Kabira Encore");

const SPLASH_NOTES = [
  { char: "♪", left: "14%", top: "62%", delay: "0s", duration: "10s", tint: "white" },
  { char: "♫", left: "81%", top: "54%", delay: "1.6s", duration: "12s", tint: "green" },
  { char: "♪", left: "8%", top: "28%", delay: "3.2s", duration: "11s", tint: "white" },
  { char: "♫", left: "72%", top: "22%", delay: "0.8s", duration: "13s", tint: "green" },
  { char: "♪", left: "88%", top: "70%", delay: "4.4s", duration: "9.5s", tint: "white" },
];

const SPLASH_STARS = Array.from({ length: 96 }, (_, i) => {
  const s = (i * 7919 + 104729) % 10000;
  const t = (i * 104729 + 7919) % 10000;
  return {
    left: `${s / 100}%`,
    top: `${t / 100}%`,
    size: (i % 5 === 0 ? 2.4 : i % 3 === 0 ? 1.6 : 1.1),
    delay: `${(i % 17) * 0.22}s`,
    twinkle: i % 3 === 0,
    tint: i % 4 === 0 ? "green" : "white",
  };
});

function Transport({
  size,
  shuffle,
  repeat,
  isPlaying,
  currentTime,
  duration,
  onShuffle,
  onPrev,
  onToggle,
  onNext,
  onRepeat,
  onSeek,
}: {
  size: "bar" | "full";
  shuffle: boolean;
  repeat: RepeatMode;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onShuffle: () => void;
  onPrev: () => void;
  onToggle: () => void;
  onNext: () => void;
  onRepeat: () => void;
  onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const full = size === "full";
  return (
    <div className={`flex flex-col items-center justify-center min-w-0 ${full ? "w-full gap-5" : "flex-1 gap-1.5"}`}>
      <div className={`flex items-center ${full ? "gap-5" : "gap-2 sm:gap-4"}`}>
        <button
          type="button"
          onClick={onShuffle}
          className={`cursor-pointer ${full ? "p-2" : "p-1"} ${
            shuffle ? "text-green" : "text-muted hover:text-fg"
          }`}
          aria-label="Shuffle"
        >
          <ShuffleIcon className={full ? "w-6 h-6" : "w-4 h-4"} />
        </button>
        <button
          type="button"
          onClick={onPrev}
          className={`text-muted hover:text-fg cursor-pointer ${full ? "p-2" : "p-1"}`}
          aria-label="Previous"
        >
          <PrevIcon className={full ? "w-8 h-8" : "w-5 h-5"} />
        </button>
        <button
          type="button"
          onClick={onToggle}
          className={`flex items-center justify-center rounded-full bg-control text-control-fg hover:scale-105 cursor-pointer flex-shrink-0 ${
            full ? "w-16 h-16" : "w-8 h-8 sm:w-9 sm:h-9"
          }`}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <PauseIcon className={full ? "w-7 h-7" : "w-4 h-4"} />
          ) : (
            <PlayIcon className={full ? "w-7 h-7 ml-0.5" : "w-4 h-4 ml-0.5"} />
          )}
        </button>
        <button
          type="button"
          onClick={onNext}
          className={`text-muted hover:text-fg cursor-pointer ${full ? "p-2" : "p-1"}`}
          aria-label="Next"
        >
          <NextIcon className={full ? "w-8 h-8" : "w-5 h-5"} />
        </button>
        <button
          type="button"
          onClick={onRepeat}
          className={`relative cursor-pointer ${full ? "p-2" : "p-1"} ${
            repeat !== "off" ? "text-green" : "text-muted hover:text-fg"
          }`}
          aria-label="Repeat"
        >
          <RepeatIcon className={full ? "w-6 h-6" : "w-4 h-4"} />
          {repeat === "one" && (
            <span className={`absolute left-1/2 -translate-x-1/2 font-bold leading-none ${full ? "-bottom-0.5 text-[10px]" : "-bottom-0.5 text-[8px]"}`}>
              1
            </span>
          )}
        </button>
      </div>
      <div className={`flex items-center gap-1.5 sm:gap-2 min-w-0 ${full ? "w-full max-w-xl" : "w-full max-w-xl"}`}>
        <span className="text-[10px] sm:text-[11px] text-muted tabular-nums w-7 sm:w-8 text-right flex-shrink-0">
          {formatTime(currentTime)}
        </span>
        <div
          className="seek-control flex-1 min-w-0"
          style={{
            ["--progress" as string]: duration
              ? `${(currentTime / duration) * 100}%`
              : "0%",
          }}
        >
          <div className="seek-visual" aria-hidden="true">
            <span className="seek-visual-fill" />
            <span className="seek-visual-thumb" />
          </div>
          <input
            type="range"
            min={0}
            max={duration > 0 ? duration : 1}
            step="any"
            value={duration > 0 ? currentTime : 0}
            onChange={onSeek}
            aria-label="Seek"
            className="player-seek"
          />
        </div>
        <span className="text-[10px] sm:text-[11px] text-muted tabular-nums w-7 sm:w-8 flex-shrink-0">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}

export default function App() {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [coverErrors, setCoverErrors] = useState<Record<number, boolean>>({});
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [query, setQuery] = useState("");
  const [cardsVisible, setCardsVisible] = useState(false);
  const [shuffleOrder, setShuffleOrder] = useState<number[]>(() =>
    songs.map((_, i) => i),
  );
  const [buffering, setBuffering] = useState(false);
  const [glowColor, setGlowColor] = useState("#1db954");
  const [toast, setToast] = useState<string | null>(null);
  const [queue, setQueue] = useState<number[]>([]);
  const [recent, setRecent] = useState<number[]>([]);
  const [nowPlayingOpen, setNowPlayingOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(readTheme);
  const [category, setCategory] = useState<Category>("All");
  const [splash, setSplash] = useState(true);
  const [splashOut, setSplashOut] = useState(false);

  const songsSectionRef = useRef<HTMLElement>(null);
  const shuffleRef = useRef(shuffle);
  const repeatRef = useRef(repeat);
  const shuffleOrderRef = useRef(shuffleOrder);
  const queueRef = useRef(queue);
  const currentIndexRef = useRef(currentIndex);
  const toastTimer = useRef(0);
  const volumeRef = useRef(volume);
  const mutedRef = useRef(muted);
  const fadingRef = useRef(false);
  const fadeGen = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  shuffleRef.current = shuffle;
  repeatRef.current = repeat;
  shuffleOrderRef.current = shuffleOrder;
  queueRef.current = queue;
  currentIndexRef.current = currentIndex;
  volumeRef.current = volume;
  mutedRef.current = muted;

  const { curr: nowCurr, prev: nowPrev } = useCrossfadeIndex(currentIndex);
  const currentSong = currentIndex >= 0 ? songs[currentIndex] : null;
  const nowPrevSong = nowPrev != null && nowPrev >= 0 ? songs[nowPrev] : null;
  const nowCurrSong = nowCurr >= 0 ? songs[nowCurr] : null;

  const ensureAudioGraph = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AC();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    if (!sourceNodeRef.current) {
      const source = ctx.createMediaElementSource(audio);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.72;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      sourceNodeRef.current = source;
      analyserRef.current = analyser;
    }
  }, []);

  const enterSite = useCallback(() => {
    ensureAudioGraph();
    setSplashOut(true);
    window.setTimeout(() => setSplash(false), 620);
  }, [ensureAudioGraph]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("kb-theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration);
    const onEnded = () => {
      if (repeatRef.current === "one") {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }
      if (queueRef.current.length > 0) {
        const next = queueRef.current[0];
        setQueue((prev) => prev.slice(1));
        if (next === currentIndexRef.current) {
          audio.currentTime = 0;
          audio.play().catch(() => {});
        } else {
          setCurrentIndex(next);
        }
        return;
      }
      setCurrentIndex((prev) => {
        if (shuffleRef.current) {
          const order = shuffleOrderRef.current;
          const pos = order.indexOf(prev);
          const nextPos = pos >= 0 ? (pos + 1) % order.length : 0;
          if (repeatRef.current === "off" && pos === order.length - 1) {
            audio.pause();
            return prev;
          }
          return order[nextPos];
        }
        if (repeatRef.current === "off" && prev === songs.length - 1) {
          audio.pause();
          return prev;
        }
        return (prev + 1) % songs.length;
      });
    };
    const onPlay = () => {
      setIsPlaying(true);
      setBuffering(false);
      ensureAudioGraph();
    };
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setBuffering(true);
    const onPlaying = () => {
      setIsPlaying(true);
      setBuffering(false);
    };
    const onCanPlay = () => setBuffering(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("canplay", onCanPlay);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("canplay", onCanPlay);
    };
  }, [ensureAudioGraph]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || currentIndex < 0) return;
    setBuffering(true);
    ensureAudioGraph();
    audio.volume = 0;
    audio.src = encodeURI(songs[currentIndex].src);
    const target = mutedRef.current ? 0 : volumeRef.current;
    audio
      .play()
      .then(() => fadeLinear(audio, target, FADE_MS, fadingRef))
      .catch(() => {
        fadingRef.current = false;
        setBuffering(false);
        audio.volume = target;
      });
  }, [currentIndex, ensureAudioGraph]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || fadingRef.current) return;
    audio.volume = muted ? 0 : volume;
  }, [volume, muted]);

  useEffect(() => {
    if (currentIndex < 0) return;
    setRecent((prev) => {
      const next = [currentIndex, ...prev.filter((i) => i !== currentIndex)];
      return next.slice(0, 5);
    });
  }, [currentIndex]);

  useEffect(() => {
    if (!currentSong?.cover) {
      setGlowColor("#1db954");
      return;
    }
    let cancelled = false;
    extractDominantColor(currentSong.cover).then((color) => {
      if (!cancelled) setGlowColor(color);
    });
    return () => {
      cancelled = true;
    };
  }, [currentSong?.cover]);

  useEffect(() => {
    const el = songsSectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setCardsVisible(true);
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    const fallback = window.setTimeout(() => setCardsVisible(true), 900);
    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    if (currentIndex < 0) setNowPlayingOpen(false);
  }, [currentIndex]);

  useEffect(() => {
    const lock = splash || nowPlayingOpen;
    document.documentElement.style.overflow = lock ? "hidden" : "";
    document.body.style.overflow = lock ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [splash, nowPlayingOpen]);

  const filteredSongs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return songs
      .map((song, index) => ({ song, index }))
      .filter(({ song }) => {
        if (category !== "All" && song.mood !== category) return false;
        if (!q) return true;
        return (
          song.title.toLowerCase().includes(q) ||
          song.artist.toLowerCase().includes(q) ||
          song.mood.toLowerCase().includes(q)
        );
      });
  }, [query, category]);

  const changeTrack = useCallback(async (index: number) => {
    if (index === currentIndexRef.current) return;
    const audio = audioRef.current;
    const gen = ++fadeGen.current;
    if (audio && !audio.paused && audio.volume > 0.02) {
      await fadeLinear(audio, 0, FADE_MS, fadingRef);
      if (gen !== fadeGen.current) return;
    }
    setCurrentIndex(index);
  }, []);

  const playSong = useCallback(
    (index: number, trigger?: HTMLElement | null) => {
      pulseSong(index, trigger);
      if (index === currentIndex) {
        togglePlayPause();
      } else {
        void changeTrack(index);
        if (shuffle) {
          setShuffleOrder(shuffleList(songs.map((_, i) => i), index));
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentIndex, shuffle, changeTrack],
  );

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    ensureAudioGraph();
    if (currentIndex < 0) {
      pulseSong(0);
      setCurrentIndex(0);
      return;
    }
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [currentIndex, ensureAudioGraph]);

  const playPrev = useCallback(() => {
    if (currentIndex < 0) {
      setCurrentIndex(0);
      return;
    }
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    if (shuffle) {
      const pos = shuffleOrder.indexOf(currentIndex);
      const prevPos = pos <= 0 ? shuffleOrder.length - 1 : pos - 1;
      void changeTrack(shuffleOrder[prevPos] ?? 0);
    } else {
      void changeTrack(currentIndex <= 0 ? songs.length - 1 : currentIndex - 1);
    }
  }, [currentIndex, shuffle, shuffleOrder, changeTrack]);

  const playNext = useCallback(() => {
    if (queue.length > 0) {
      const next = queue[0];
      setQueue((prev) => prev.slice(1));
      if (next === currentIndex) {
        const audio = audioRef.current;
        if (audio) {
          audio.currentTime = 0;
          audio.play().catch(() => {});
        }
      } else {
        void changeTrack(next);
      }
      return;
    }
    if (shuffle) {
      const pos = shuffleOrder.indexOf(currentIndex);
      const nextPos = pos >= 0 ? (pos + 1) % shuffleOrder.length : 0;
      void changeTrack(shuffleOrder[nextPos] ?? 0);
    } else {
      void changeTrack(currentIndex < 0 ? 0 : (currentIndex + 1) % songs.length);
    }
  }, [currentIndex, shuffle, shuffleOrder, queue, changeTrack]);

  const toggleShuffle = useCallback(() => {
    setShuffle((on) => {
      const next = !on;
      if (next) {
        const start = currentIndex >= 0 ? currentIndex : 0;
        setShuffleOrder(shuffleList(songs.map((_, i) => i), start));
      }
      return next;
    });
  }, [currentIndex]);

  const cycleRepeat = useCallback(() => {
    setRepeat((mode) => (mode === "off" ? "all" : mode === "all" ? "one" : "off"));
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 1600);
  }, []);

  const addToQueue = useCallback(
    (index: number) => {
      setQueue((prev) => [...prev, index]);
      showToast("Added to queue");
    },
    [showToast],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === "Escape") {
        setNowPlayingOpen(false);
        return;
      }
      if (e.key === " " || e.code === "Space") {
        if (target?.closest("button, [role='button'], a")) return;
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        playNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        playPrev();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [togglePlayPause, playNext, playPrev]);

  const shareSong = useCallback(
    async (song: Song) => {
      const link = window.location.origin;
      const shareText = `${song.title} — ${song.artist}\n${link}`;
      try {
        await navigator.clipboard.writeText(shareText);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = shareText;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      showToast("Copied!");
    },
    [showToast],
  );

  const seek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
    const next = Math.min(audio.duration, Math.max(0, Number(e.target.value)));
    audio.currentTime = next;
    setCurrentTime(next);
  }, []);

  const playFeatured = useCallback(
    (trigger?: HTMLElement | null) => {
      if (FEATURED_INDEX < 0) return;
      const needsRerender = query.trim().length > 0 || category !== "All";
      setQuery("");
      setCategory("All");
      pulseEl(trigger ?? null);
      if (FEATURED_INDEX === currentIndex) {
        const audio = audioRef.current;
        if (audio?.paused) audio.play().catch(() => {});
      } else {
        void changeTrack(FEATURED_INDEX);
        if (shuffle) {
          setShuffleOrder(shuffleList(songs.map((_, i) => i), FEATURED_INDEX));
        }
      }
      const scrollToCard = () => {
        document
          .getElementById(`song-card-${FEATURED_INDEX}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
        pulseSong(FEATURED_INDEX);
      };
      window.setTimeout(scrollToCard, needsRerender ? 160 : 40);
    },
    [currentIndex, query, shuffle, changeTrack, category],
  );

  const playSurprise = useCallback(
    (trigger?: HTMLElement | null) => {
      if (songs.length === 0) return;
      const options = songs.map((_, i) => i).filter((i) => i !== currentIndex);
      const pool = options.length > 0 ? options : [0];
      const next = pool[Math.floor(Math.random() * pool.length)] ?? 0;
      pulseEl(trigger ?? null);
      void changeTrack(next);
      if (shuffle) {
        setShuffleOrder(shuffleList(songs.map((_, i) => i), next));
      }
      window.setTimeout(() => {
        document
          .getElementById(`song-card-${next}`)
          ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        pulseSong(next);
      }, 40);
    },
    [currentIndex, shuffle, changeTrack],
  );

  const t = text[lang];
  const queuedCount = useMemo(() => {
    const counts = new Map<number, number>();
    for (const i of queue) counts.set(i, (counts.get(i) ?? 0) + 1);
    return counts;
  }, [queue]);

  const coverFor = (index: number, song: Song, extraClass = "") => {
    const hasError = coverErrors[index];
    if (hasError || !song.cover) {
      return (
        <div className={`w-full h-full flex items-center justify-center text-muted bg-spot-hover ${extraClass}`}>
          <MusicNoteIcon className="w-1/2 h-1/2 max-w-12 max-h-12 opacity-40" />
        </div>
      );
    }
    return (
      <img
        src={encodeURI(song.cover)}
        alt={song.title}
        className={`w-full h-full object-cover ${extraClass}`}
        onError={() => setCoverErrors((prev) => ({ ...prev, [index]: true }))}
      />
    );
  };

  const transportProps = {
    shuffle,
    repeat,
    isPlaying,
    currentTime,
    duration,
    onShuffle: toggleShuffle,
    onPrev: playPrev,
    onToggle: togglePlayPause,
    onNext: playNext,
    onRepeat: cycleRepeat,
    onSeek: seek,
  };

  return (
    <div className={`app-shell min-h-screen bg-spot font-sans text-fg ${currentIndex >= 0 ? "pb-40" : "pb-10"}`}>
      <div className={splashOut ? "site-reveal" : undefined}>
      <audio ref={audioRef} preload="metadata" crossOrigin="anonymous" />

      <section className="relative flex flex-col items-center px-6 pt-24 pb-8 sm:pt-28 sm:pb-10 overflow-hidden">
        <div className="hero-wash absolute inset-0" />

        <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden="true">
          <span className="hero-note absolute left-[12%] top-[42%] text-green/25">
            <MusicNoteIcon className="w-7 h-7 sm:w-8 sm:h-8" />
          </span>
          <span className="hero-note hero-note-b absolute right-[14%] top-[58%] text-muted/30">
            <MusicNoteIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </span>
        </div>

        <div className="absolute top-6 right-6 z-10">
          <div className="flex items-center gap-2 text-xs font-medium tracking-wide">
            <button
              type="button"
              onClick={() => setTheme((mode) => (mode === "dark" ? "light" : "dark"))}
              className="p-1.5 rounded-full text-muted hover:text-fg hover:bg-fg/10 cursor-pointer"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-2 py-1 cursor-pointer ${
                lang === "en" ? "text-green" : "text-muted hover:text-fg"
              }`}
            >
              EN
            </button>
            <span className="text-spot-border">/</span>
            <button
              onClick={() => setLang("hi")}
              className={`px-2 py-1 cursor-pointer ${
                lang === "hi" ? "text-green" : "text-muted hover:text-fg"
              }`}
            >
              हिं
            </button>
          </div>
        </div>

        <div className="relative z-10 text-center max-w-3xl">
          <h1 className="text-[clamp(2.6rem,9vw,5.25rem)] font-extrabold tracking-tight text-fg leading-[1.08]">
            {t.headline}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted font-medium">
            {t.tagline}
          </p>
          <button
            type="button"
            onClick={() => {
              document.getElementById("songs")?.scrollIntoView({ behavior: "smooth" });
              if (currentIndex < 0) playSong(0);
              else if (!isPlaying) togglePlayPause();
            }}
            className="mt-7 inline-flex items-center justify-center rounded-full bg-green hover:bg-green-hover hover:scale-105 text-black font-bold text-base px-10 py-3.5 cursor-pointer transition-all"
          >
            Play
          </button>
        </div>
      </section>

      <section
        id="songs"
        ref={songsSectionRef}
        className="px-4 sm:px-8 pb-10 scroll-mt-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8">
          <label className="relative block w-full max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              <SearchIcon className="w-4 h-4" />
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search songs, artists, or moods"
              className="search-input w-full rounded-full bg-search text-fg placeholder:text-muted text-sm py-2.5 pl-10 pr-4 border-0"
            />
          </label>
          <button
            type="button"
            onClick={(e) => playSurprise(e.currentTarget)}
            className="relative inline-flex items-center gap-2 self-start rounded-full bg-spot-raised hover:bg-spot-hover border border-spot-border text-fg font-bold text-sm px-4 py-2.5 cursor-pointer transition-colors"
          >
            <SparkleIcon className="w-4 h-4 text-green" />
            Surprise Me
          </button>
        </div>

        {FEATURED_INDEX >= 0 && songs[FEATURED_INDEX] && (
          <button
            type="button"
            onClick={(e) => playFeatured(e.currentTarget)}
            className="rec-banner relative mb-8 w-full max-w-xl text-left rounded-2xl overflow-hidden bg-spot-raised border border-spot-border p-3 sm:p-3.5 flex items-center gap-3.5 cursor-pointer hover:bg-spot-hover transition-colors"
          >
            <span className="rec-banner-wash pointer-events-none absolute inset-0" aria-hidden="true" />
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 shadow-md ring-1 ring-white/10">
              {coverFor(FEATURED_INDEX, songs[FEATURED_INDEX])}
            </div>
            <div className="relative min-w-0 flex-1">
              <p className="text-sm sm:text-[15px] font-medium text-fg leading-snug">
                Feeling sad? Listen to this — you won&apos;t forget it 💙
              </p>
              <p className="mt-1 text-xs sm:text-sm text-muted truncate">
                {songs[FEATURED_INDEX].title}
                <span className="text-spot-border"> · </span>
                {songs[FEATURED_INDEX].artist}
              </p>
            </div>
            <span className="relative flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-green text-black flex items-center justify-center shadow-[0_0_16px_rgba(29,185,84,0.45)]">
              <PlayIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />
            </span>
          </button>
        )}

        {recent.length > 0 && (
          <div className="mb-10">
            <p className="text-xs font-bold tracking-widest uppercase text-muted mb-1">
              Listening history
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-5">Recently Played</h2>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide py-2">
              {recent.map((index) => {
                const song = songs[index];
                const isActive = index === currentIndex;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={(e) => playSong(index, e.currentTarget)}
                    className={`song-card flex-shrink-0 w-[136px] sm:w-40 text-left rounded-lg p-2.5 cursor-pointer ${
                      isActive
                        ? "song-card-playing"
                        : "bg-spot-raised hover:bg-spot-hover"
                    }`}
                  >
                    <div className="relative aspect-square rounded-md overflow-hidden mb-2 bg-spot-hover">
                      {coverFor(index, song)}
                      {isActive && isPlaying && !buffering && (
                        <div className="absolute bottom-1.5 left-1.5">
                          <EqBars />
                        </div>
                      )}
                    </div>
                    <p className={`font-bold text-sm truncate ${isActive ? "text-green" : "text-fg"}`}>{song.title}</p>
                    <p className="text-xs text-muted truncate mt-0.5">{song.artist}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <p className="text-xs font-bold tracking-widest uppercase text-muted mb-1">
          Playlist
        </p>
        <div className="flex items-end justify-between gap-3 mb-4">
          <h2 className="text-2xl sm:text-3xl font-bold">Made for You</h2>
          <span className="text-sm text-muted whitespace-nowrap pb-0.5">
            {filteredSongs.length} {filteredSongs.length === 1 ? "song" : "songs"}
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 pb-0.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold cursor-pointer transition-colors ${
                category === cat
                  ? "bg-green text-black"
                  : "bg-spot-hover text-muted hover:text-fg"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {songs.length === 0 ? (
          <EmptySongs
            icon={<MusicNoteIcon className="w-6 h-6" />}
            title="Loading your songs"
            hint="Tracks will show up here as soon as they’re ready."
          />
        ) : filteredSongs.length === 0 ? (
          <EmptySongs
            icon={<SearchIcon className="w-6 h-6" />}
            title="No matching songs"
            hint="Try another search or pick a different mood — your library is still here."
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-6 py-1">
            {filteredSongs.map(({ song, index }, i) => {
              const isActive = index === currentIndex;
              const inQueue = queuedCount.get(index) ?? 0;
              return (
                <div
                  key={index}
                  id={`song-card-${index}`}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => playSong(index, e.currentTarget)}
                  onKeyDown={(e) => {
                    if (e.target !== e.currentTarget) return;
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      playSong(index, e.currentTarget);
                    }
                  }}
                  className={`song-card group relative text-left rounded-lg p-3 sm:p-4 cursor-pointer min-w-0 scroll-mt-28 ${
                    isActive ? "song-card-playing" : "bg-spot-raised hover:bg-spot-hover"
                  }`}
                >
                  <div
                    className={cardsVisible ? "song-card-enter" : "opacity-0"}
                    style={{ animationDelay: `${Math.min(i, 14) * 50}ms` }}
                  >
                  <div className="relative aspect-square rounded-md overflow-hidden mb-3 bg-spot-hover shadow-lg">
                    {coverFor(
                      index,
                      song,
                      isActive && buffering ? "opacity-70" : "",
                    )}
                    <div className="song-art-veil" aria-hidden="true" />
                    {isActive && buffering && (
                      <div className="absolute inset-0 z-[3] flex items-center justify-center bg-black/35">
                        <div className="art-spinner" aria-hidden="true" />
                      </div>
                    )}
                    {isActive && isPlaying && !buffering && (
                      <div className="absolute bottom-2 left-2 z-[2]">
                        <EqBars />
                      </div>
                    )}
                    <div className="song-play-pop z-[2]">
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={(e) => {
                          e.stopPropagation();
                          playSong(index, e.currentTarget.closest(".song-card") as HTMLElement | null);
                        }}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-green text-black flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.45)] hover:scale-105 cursor-pointer"
                        aria-label={
                          isActive && isPlaying ? `Pause ${song.title}` : `Play ${song.title}`
                        }
                      >
                        {isActive && isPlaying ? (
                          <PauseIcon className="w-6 h-6" />
                        ) : (
                          <PlayIcon className="w-6 h-6 ml-0.5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-start gap-1 min-w-0">
                    <div className="min-w-0 flex-1">
                      <h3 className={`font-bold text-sm truncate ${isActive ? "text-green" : "text-fg"}`}>
                        {song.title}
                      </h3>
                      <p className="text-sm text-muted truncate mt-0.5">{song.artist}</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCategory(song.mood);
                          setQuery("");
                        }}
                        className={`mood-pill mood-${song.mood.toLowerCase()} mt-1.5 cursor-pointer`}
                      >
                        {song.mood}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToQueue(index);
                      }}
                      className={`relative flex-shrink-0 p-1.5 rounded-full hover:bg-fg/10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100 transition-opacity cursor-pointer ${
                        inQueue ? "text-green opacity-100" : "text-muted hover:text-fg"
                      }`}
                      aria-label={`Add ${song.title} to queue`}
                    >
                      <QueueIcon className="w-4 h-4" />
                      {inQueue > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-0.5 rounded-full bg-green text-black text-[9px] font-bold leading-[14px] text-center">
                          {inQueue}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void shareSong(song);
                      }}
                      className="flex-shrink-0 p-1.5 rounded-full text-muted hover:text-fg hover:bg-fg/10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100 transition-opacity cursor-pointer"
                      aria-label={`Share ${song.title}`}
                    >
                      <ShareIcon className="w-4 h-4" />
                    </button>
                  </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <footer className="px-4 sm:px-8 pb-10">
        <div className="mx-auto max-w-xl rounded-2xl bg-spot-raised border border-spot-border px-6 py-8 text-center">
          <p className="text-muted text-sm sm:text-base mb-5">
            Want to suggest a song? Contact me on WhatsApp
          </p>
          <a
            href="https://wa.me/919267939780"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-green hover:bg-green-hover text-black font-bold text-sm px-6 py-3 transition-colors"
          >
            <WhatsAppIcon className="w-5 h-5" />
            WhatsApp
          </a>
        </div>
      </footer>

      {currentIndex >= 0 && (
      <div className={`player-dock fixed bottom-0 left-0 right-0 z-50 overflow-visible px-3 sm:px-4 pb-3 sm:pb-4 ${nowPlayingOpen ? "invisible pointer-events-none" : ""}`}>
        <div
          className="player-glow pointer-events-none absolute left-1/2 -top-12 h-28 w-[80%] max-w-3xl -translate-x-1/2 rounded-full blur-3xl"
          style={{
            backgroundColor: glowColor,
            opacity: theme === "light" ? 0.22 : 0.35,
          }}
          aria-hidden="true"
        />
        <div className="relative min-h-[88px] rounded-2xl bg-player border border-spot-border px-3 sm:px-4 shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
          <div className="h-[18px] pt-1.5 px-2 sm:px-1">
            <WaveformVisualizer
              analyserRef={analyserRef}
              active={isPlaying && !buffering}
              bars={40}
              className="h-full w-full max-w-xl mx-auto"
            />
          </div>
          <div className="h-full flex items-center gap-2 sm:gap-3 py-2 min-h-[70px]">
            <button
              type="button"
              onClick={() => setNowPlayingOpen(true)}
              className="flex items-center gap-2 sm:gap-3 min-w-0 w-[32%] sm:w-[28%] text-left cursor-pointer"
              aria-label="Open now playing"
            >
              <div className="relative w-11 h-11 sm:w-14 sm:h-14 rounded overflow-hidden flex-shrink-0 bg-spot-hover">
                {nowPrevSong && nowPrev != null && (
                  <div key={`art-out-${nowPrev}`} className="player-now-out absolute inset-0">
                    {coverFor(nowPrev, nowPrevSong)}
                  </div>
                )}
                {nowCurrSong && (
                  <div key={`art-in-${nowCurr}`} className="player-now-in absolute inset-0">
                    {coverFor(nowCurr, nowCurrSong, buffering ? "opacity-70" : "")}
                    {buffering && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                        <div className="art-spinner" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="relative min-w-0 h-10 flex-1">
                {nowPrevSong && nowPrev != null && (
                  <div key={`txt-out-${nowPrev}`} className="player-now-out absolute inset-0 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-fg truncate">
                      {nowPrevSong.title}
                    </p>
                    <p className="text-[11px] sm:text-xs text-muted truncate">
                      {nowPrevSong.artist}
                    </p>
                  </div>
                )}
                {nowCurrSong && (
                  <div key={`txt-in-${nowCurr}`} className="player-now-in min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-fg truncate">
                      {nowCurrSong.title}
                    </p>
                    <p className="text-[11px] sm:text-xs text-muted truncate">
                      {nowCurrSong.artist}
                    </p>
                  </div>
                )}
              </div>
            </button>

            <Transport size="bar" {...transportProps} />

            <div className="flex items-center justify-end gap-1 sm:gap-2 w-[22%] sm:w-[28%] min-w-0">
              <button
                type="button"
                onClick={() => setMuted((m) => !m)}
                className="p-1 text-muted hover:text-fg cursor-pointer flex-shrink-0"
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted || volume === 0 ? <VolumeOffIcon /> : <VolumeIcon />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={muted ? 0 : volume}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setVolume(v);
                  if (v > 0) setMuted(false);
                }}
                className="volume-seek w-14 sm:w-24 min-w-0"
                style={{ ["--progress" as string]: `${(muted ? 0 : volume) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      )}

      {nowPlayingOpen && currentSong && (
        <div className="now-playing-enter fixed inset-0 z-[70] bg-spot flex flex-col overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at 50% 28%, ${glowColor} 0%, transparent 58%)`,
              opacity: theme === "light" ? 0.2 : 0.38,
            }}
            aria-hidden="true"
          />
          <div className="relative z-10 flex items-center justify-between px-4 sm:px-8 pt-5 pb-2">
            <p className="text-xs font-bold tracking-widest uppercase text-muted">Now playing</p>
            <button
              type="button"
              onClick={() => setNowPlayingOpen(false)}
              className="p-2 rounded-full text-fg hover:bg-fg/10 cursor-pointer"
              aria-label="Close now playing"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-10 min-h-0">
            <div className="relative w-full max-w-sm sm:max-w-md aspect-square rounded-xl overflow-hidden shadow-2xl bg-spot-hover mb-8">
              {coverFor(currentIndex, currentSong, buffering ? "opacity-70" : "")}
              {buffering && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                  <div className="art-spinner" aria-hidden="true" />
                </div>
              )}
            </div>
            <div className="w-full max-w-xl text-center mb-8">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-fg truncate">{currentSong.title}</h2>
              <p className="mt-2 text-base sm:text-lg text-muted truncate">{currentSong.artist}</p>
              <div className="mt-3">
                <span className={`mood-pill mood-${currentSong.mood.toLowerCase()}`}>
                  {currentSong.mood}
                </span>
              </div>
            </div>
            <WaveformVisualizer
              analyserRef={analyserRef}
              active={isPlaying && !buffering}
              bars={32}
              className="h-12 w-full max-w-md mb-6"
            />
            <Transport size="full" {...transportProps} />
            <div className="flex items-center justify-center gap-3 mt-8 w-full max-w-xs">
              <button
                type="button"
                onClick={() => setMuted((m) => !m)}
                className="p-1 text-muted hover:text-fg cursor-pointer flex-shrink-0"
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted || volume === 0 ? <VolumeOffIcon className="w-5 h-5" /> : <VolumeIcon className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={muted ? 0 : volume}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setVolume(v);
                  if (v > 0) setMuted(false);
                }}
                className="volume-seek flex-1 min-w-0"
                style={{ ["--progress" as string]: `${(muted ? 0 : volume) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className="copied-toast fixed bottom-28 left-1/2 z-[80] -translate-x-1/2 rounded-full bg-fg text-spot px-4 py-2 text-sm font-semibold shadow-lg"
          role="status"
        >
          {toast}
        </div>
      )}

      </div>

      {splash && (
        <div className={`splash-screen ${splashOut ? "splash-out" : ""}`}>
          <div className="splash-nebula" aria-hidden="true" />
          <div className="splash-stars" aria-hidden="true">
            {SPLASH_STARS.map((star, i) => (
              <span
                key={i}
                className={`splash-star${star.twinkle ? " splash-star-twinkle" : ""}${star.tint === "green" ? " splash-star-green" : ""}`}
                style={{
                  left: star.left,
                  top: star.top,
                  width: star.size,
                  height: star.size,
                  animationDelay: star.delay,
                }}
              />
            ))}
          </div>
          {SPLASH_NOTES.map((note, i) => (
            <span
              key={`note-${i}`}
              className={`splash-note${note.tint === "green" ? " splash-note-green" : ""}`}
              aria-hidden="true"
              style={{
                left: note.left,
                top: note.top,
                animationDelay: note.delay,
                animationDuration: note.duration,
              }}
            >
              {note.char}
            </span>
          ))}
          <span className="splash-orb splash-orb-a" aria-hidden="true" />
          <span className="splash-orb splash-orb-b" aria-hidden="true" />
          <span className="splash-orb splash-orb-c" aria-hidden="true" />
          <div className="splash-inner">
            <div className="splash-title-wrap">
              <span className="splash-halo" aria-hidden="true" />
              <h1 className="splash-mark">Krishbuilds</h1>
            </div>
            <p className="splash-tagline">songs that take me back</p>
            <div className="splash-wave" aria-hidden="true">
              <span style={{ animationDelay: "0ms" }} />
              <span style={{ animationDelay: "120ms" }} />
              <span style={{ animationDelay: "240ms" }} />
              <span style={{ animationDelay: "80ms" }} />
              <span style={{ animationDelay: "200ms" }} />
              <span style={{ animationDelay: "40ms" }} />
              <span style={{ animationDelay: "160ms" }} />
            </div>
            <button type="button" className="splash-enter" onClick={enterSite}>
              Enter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
