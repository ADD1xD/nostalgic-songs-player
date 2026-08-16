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
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.14v14l11-7z" />
    </svg>
  );
}

function PauseIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
    </svg>
  );
}

function PrevIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
    </svg>
  );
}

function NextIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16 18h2V6h-2zM6 18l8.5-6L6 6z" />
    </svg>
  );
}

function ShuffleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
    </svg>
  );
}

function RepeatIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
    </svg>
  );
}

function VolumeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  );
}

function VolumeOffIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z" />
    </svg>
  );
}

function MusicNoteIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
  );
}

function SearchIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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
  action,
}: {
  icon: ReactNode;
  title: string;
  hint: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="songs-empty" role="status">
      <span className="songs-empty-icon" aria-hidden="true">
        {icon}
      </span>
      <p className="text-fg font-semibold text-sm sm:text-base">{title}</p>
      <p className="text-muted text-sm max-w-sm">{hint}</p>
      {action && (
        <button type="button" onClick={action.onClick} className="empty-action">
          {action.label}
        </button>
      )}
    </div>
  );
}

function SongGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-6 py-1" aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="song-skeleton" style={{ animationDelay: `${i * 80}ms` }} />
      ))}
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
const RESUME_KEY = "kb-resume";
const PLAYS_KEY = "kb-plays";
const LISTEN_KEY = "kb-listen-sec";
const LISTEN_MAP_KEY = "kb-listen-map";

type ResumeState = { src: string; time: number };

function readResume(): ResumeState | null {
  try {
    const raw = localStorage.getItem(RESUME_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as ResumeState;
    if (typeof data.src !== "string" || typeof data.time !== "number" || !isFinite(data.time)) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function writeResume(src: string, time: number) {
  try {
    localStorage.setItem(RESUME_KEY, JSON.stringify({ src, time }));
  } catch {
    /* ignore */
  }
}

function clearResume() {
  try {
    localStorage.removeItem(RESUME_KEY);
  } catch {
    /* ignore */
  }
}

function readPlays(): Record<string, number> {
  try {
    const raw = localStorage.getItem(PLAYS_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw) as Record<string, number>;
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

function writePlays(plays: Record<string, number>) {
  try {
    localStorage.setItem(PLAYS_KEY, JSON.stringify(plays));
  } catch {
    /* ignore */
  }
}

function readListenSec(): number {
  try {
    const n = Number(localStorage.getItem(LISTEN_KEY));
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

function writeListenSec(sec: number) {
  try {
    localStorage.setItem(LISTEN_KEY, String(Math.max(0, Math.round(sec))));
  } catch {
    /* ignore */
  }
}

function readListenMap(): Record<string, number> {
  try {
    const raw = localStorage.getItem(LISTEN_MAP_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw) as Record<string, number>;
    if (!data || typeof data !== "object") return {};
    const out: Record<string, number> = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === "number" && isFinite(value) && value > 0) out[key] = value;
    }
    return out;
  } catch {
    return {};
  }
}

function writeListenMap(map: Record<string, number>) {
  try {
    const rounded: Record<string, number> = {};
    for (const [key, value] of Object.entries(map)) {
      const n = Math.round(value);
      if (n > 0) rounded[key] = n;
    }
    localStorage.setItem(LISTEN_MAP_KEY, JSON.stringify(rounded));
  } catch {
    /* ignore */
  }
}

function formatListen(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const rem = s % 60;
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  if (m > 0) return rem > 0 && m < 5 ? `${m} min ${rem}s` : `${m} min`;
  return `${s} sec`;
}

function pickRecommendations(
  currentIndex: number,
  playCounts: Record<string, number>,
): { seedIndex: number; indices: number[] } | null {
  let seedIndex = currentIndex;
  if (seedIndex < 0) {
    let best = -1;
    let bestCount = 0;
    songs.forEach((song, i) => {
      const n = playCounts[song.src] ?? 0;
      if (n > bestCount) {
        bestCount = n;
        best = i;
      }
    });
    seedIndex = best;
  }
  if (seedIndex < 0) return null;

  const mood = songs[seedIndex].mood;
  const same = songs
    .map((_, i) => i)
    .filter((i) => i !== seedIndex && songs[i].mood === mood)
    .sort((a, b) => {
      const pa = playCounts[songs[a].src] ?? 0;
      const pb = playCounts[songs[b].src] ?? 0;
      if (pa !== pb) return pa - pb;
      return a - b;
    });

  const picked = same.slice(0, 3);
  if (picked.length < 2) {
    const extras = songs
      .map((_, i) => i)
      .filter((i) => i !== seedIndex && !picked.includes(i));
    while (picked.length < 3 && extras.length > 0) picked.push(extras.shift()!);
  }
  if (picked.length < 2) return null;
  return { seedIndex, indices: picked.slice(0, 3) };
}

function initialResumeOffer(): { index: number; time: number } | null {
  const saved = readResume();
  if (!saved || saved.time < 5) return null;
  const index = songs.findIndex((song) => song.src === saved.src);
  if (index < 0) return null;
  return { index, time: saved.time };
}

function scrollSongIntoView(index: number, attempt = 0) {
  const el = document.getElementById(`song-card-${index}`);
  if (!el) {
    if (attempt < 10) window.setTimeout(() => scrollSongIntoView(index, attempt + 1), 50);
    return;
  }
  const rect = el.getBoundingClientRect();
  const topPad = 80;
  const bottomPad = 168;
  const visible = rect.top >= topPad && rect.bottom <= window.innerHeight - bottomPad;
  if (visible) return;
  el.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    block: "center",
  });
}

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
          resolve("#1ed760");
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
          : "#1ed760";
        colorCache.set(src, color);
        resolve(color);
      } catch {
        resolve("#1ed760");
      }
    };
    img.onerror = () => resolve("#1ed760");
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

function seededWave(seed: string, count: number): number[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  }
  const heights: number[] = [];
  for (let i = 0; i < count; i++) {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    const n = ((h >>> 0) % 1000) / 1000;
    const t = count <= 1 ? 0.5 : i / (count - 1);
    const env = Math.sin(t * Math.PI) ** 0.7;
    heights.push(0.22 + 0.78 * env * (0.4 + 0.6 * n));
  }
  return heights;
}

function SeekBar({
  audioRef,
  compact,
  seed,
  showTimes = true,
  onSeekCommit,
}: {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  compact: boolean;
  seed: string;
  showTimes?: boolean;
  onSeekCommit?: () => void;
}) {
  const count = compact ? 36 : 48;
  const bars = useMemo(() => seededWave(seed || "kb", count), [seed, count]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [hover, setHover] = useState<{ ratio: number; time: number } | null>(null);
  const progress = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const sync = () => {
      setCurrentTime(audio.currentTime);
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    };
    audio.addEventListener("timeupdate", sync);
    audio.addEventListener("durationchange", sync);
    audio.addEventListener("seeked", sync);
    audio.addEventListener("loadedmetadata", sync);
    sync();
    return () => {
      audio.removeEventListener("timeupdate", sync);
      audio.removeEventListener("durationchange", sync);
      audio.removeEventListener("seeked", sync);
      audio.removeEventListener("loadedmetadata", sync);
    };
  }, [audioRef, seed]);

  useEffect(() => {
    if (!dragging) return;
    const end = () => setDragging(false);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, [dragging]);

  const updateHover = (clientX: number, target: HTMLElement) => {
    const rect = target.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / Math.max(rect.width, 1)));
    setHover({ ratio, time: ratio * (duration > 0 ? duration : 0) });
  };

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
    const next = Math.min(audio.duration, Math.max(0, Number(e.target.value)));
    audio.currentTime = next;
    setCurrentTime(next);
    onSeekCommit?.();
  };

  const waveLayer = (className: string) => (
    <div className={className} aria-hidden="true">
      {bars.map((h, i) => (
        <span key={i} className="seek-wave-bar" style={{ height: `${Math.round(h * 100)}%` }} />
      ))}
    </div>
  );

  const control = (
    <div
      className={`seek-control${compact ? "" : " seek-control-lg"}${dragging ? " is-dragging" : ""}${hover ? " is-hovering" : ""}`}
      style={{
        ["--progress" as string]: `${progress * 100}%`,
        ["--hover" as string]: hover ? `${hover.ratio * 100}%` : "0%",
      }}
      onMouseMove={(e) => updateHover(e.clientX, e.currentTarget)}
      onMouseLeave={() => setHover(null)}
    >
      <div className="seek-wave" aria-hidden="true">
        {waveLayer("seek-wave-rest")}
        {waveLayer("seek-wave-played")}
      </div>
      <span className="seek-visual-thumb" />
      {hover && <span className="seek-tip">{formatTime(hover.time)}</span>}
      <input
        type="range"
        min={0}
        max={duration > 0 ? duration : 1}
        step="any"
        value={duration > 0 ? currentTime : 0}
        onChange={onSeek}
        onPointerDown={() => setDragging(true)}
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={Math.floor(duration)}
        aria-valuenow={Math.floor(currentTime)}
        aria-valuetext={formatTime(currentTime)}
        className="player-seek"
      />
    </div>
  );

  if (!showTimes) {
    return <div className="player-progress player-progress-bare">{control}</div>;
  }

  return (
    <div className={`player-progress${compact ? "" : " is-full"}`}>
      <span className="seek-time seek-time-current">{formatTime(currentTime)}</span>
      {control}
      <span className="seek-time seek-time-total">{formatTime(duration)}</span>
    </div>
  );
}

function Transport({
  size,
  audioRef,
  shuffle,
  repeat,
  isPlaying,
  waveSeed,
  onShuffle,
  onPrev,
  onToggle,
  onNext,
  onRepeat,
  onSeekCommit,
}: {
  size: "bar" | "full";
  audioRef: React.RefObject<HTMLAudioElement | null>;
  shuffle: boolean;
  repeat: RepeatMode;
  isPlaying: boolean;
  waveSeed: string;
  onShuffle: () => void;
  onPrev: () => void;
  onToggle: () => void;
  onNext: () => void;
  onRepeat: () => void;
  onSeekCommit?: () => void;
}) {
  const full = size === "full";
  const repeatLabel = repeat === "one" ? "Repeat one" : repeat === "all" ? "Repeat all" : "Repeat off";
  return (
    <div className={`flex flex-col items-center justify-center min-w-0 w-full ${full ? "max-w-xl gap-6" : "gap-3.5"}`}>
      <div className={`flex items-center ${full ? "gap-6" : "gap-5 sm:gap-6"}`}>
        <button
          type="button"
          onClick={onShuffle}
          className={`ctrl-btn cursor-pointer p-1.5 ${
            shuffle ? "text-green" : "text-muted hover:text-fg"
          }`}
          aria-label="Shuffle"
          aria-pressed={shuffle}
        >
          <ShuffleIcon className={full ? "w-5 h-5" : "w-[18px] h-[18px]"} />
        </button>
        <button
          type="button"
          onClick={onPrev}
          className="ctrl-btn text-muted hover:text-fg cursor-pointer p-1.5"
          aria-label="Previous"
        >
          <PrevIcon className={full ? "w-7 h-7" : "w-6 h-6"} />
        </button>
        <button
          type="button"
          onClick={onToggle}
          className={`ctrl-btn-play flex items-center justify-center rounded-full text-control-fg hover:scale-105 cursor-pointer flex-shrink-0 ${
            full ? "w-16 h-16" : "w-11 h-11 sm:w-12 sm:h-12"
          }`}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <PauseIcon className={full ? "w-7 h-7" : "w-5 h-5"} />
          ) : (
            <PlayIcon className={full ? "w-7 h-7 ml-0.5" : "w-5 h-5 ml-0.5"} />
          )}
        </button>
        <button
          type="button"
          onClick={onNext}
          className="ctrl-btn text-muted hover:text-fg cursor-pointer p-1.5"
          aria-label="Next"
        >
          <NextIcon className={full ? "w-7 h-7" : "w-6 h-6"} />
        </button>
        <button
          type="button"
          onClick={onRepeat}
          className={`ctrl-btn relative cursor-pointer p-1.5 ${
            repeat !== "off" ? "text-green" : "text-muted hover:text-fg"
          }`}
          aria-label={repeatLabel}
          aria-pressed={repeat !== "off"}
        >
          <RepeatIcon className={full ? "w-5 h-5" : "w-[18px] h-[18px]"} />
          {repeat === "one" && (
            <span className={`absolute left-1/2 -translate-x-1/2 font-semibold leading-none ${full ? "-bottom-0.5 text-[10px]" : "-bottom-0.5 text-[9px]"}`}>
              1
            </span>
          )}
        </button>
      </div>
      <SeekBar
        audioRef={audioRef}
        compact={!full}
        seed={waveSeed}
        onSeekCommit={onSeekCommit}
      />
    </div>
  );
}

export default function App() {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [coverErrors, setCoverErrors] = useState<Record<number, boolean>>({});
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [query, setQuery] = useState("");
  const [playCounts, setPlayCounts] = useState<Record<string, number>>(readPlays);
  const [resumeOffer, setResumeOffer] = useState<{ index: number; time: number } | null>(
    initialResumeOffer,
  );
  const [cardsVisible, setCardsVisible] = useState(false);
  const [shuffleOrder, setShuffleOrder] = useState<number[]>(() =>
    songs.map((_, i) => i),
  );
  const [buffering, setBuffering] = useState(false);
  const [glowColor, setGlowColor] = useState("#1ed760");
  const [toast, setToast] = useState<string | null>(null);
  const [queue, setQueue] = useState<number[]>([]);
  const [recent, setRecent] = useState<number[]>([]);
  const [nowPlayingOpen, setNowPlayingOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(readTheme);
  const [category, setCategory] = useState<Category>("All");
  const [statsOpen, setStatsOpen] = useState(false);
  const [listenSec, setListenSec] = useState(readListenSec);
  const [listenMap, setListenMap] = useState(readListenMap);

  const songsSectionRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const statsBtnRef = useRef<HTMLButtonElement>(null);
  const statsCloseRef = useRef<HTMLButtonElement>(null);
  const pendingSeekRef = useRef<number | null>(null);
  const lastResumeSave = useRef(0);
  const lastPlayBump = useRef({ index: -1, at: 0 });
  const listenSecRef = useRef(readListenSec());
  const listenMapRef = useRef(readListenMap());
  const playClockRef = useRef<number | null>(null);
  const listenSrcRef = useRef<string | null>(null);
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
      source.connect(ctx.destination);
      sourceNodeRef.current = source;
    }
  }, []);

  const persistResume = useCallback(() => {
    const audio = audioRef.current;
    const index = currentIndexRef.current;
    if (!audio || index < 0) return;
    const time = audio.currentTime;
    const dur = audio.duration;
    if (!isFinite(time) || time < 2) return;
    if (isFinite(dur) && dur > 0 && time >= dur - 4) {
      clearResume();
      return;
    }
    writeResume(songs[index].src, time);
  }, []);

  const flushListenClock = useCallback(() => {
    if (playClockRef.current == null) return;
    const now = performance.now();
    const dt = (now - playClockRef.current) / 1000;
    playClockRef.current = now;
    if (!(dt > 0) || dt > 300) return;
    listenSecRef.current += dt;
    const src = listenSrcRef.current;
    if (src) {
      listenMapRef.current[src] = (listenMapRef.current[src] ?? 0) + dt;
    }
  }, []);

  const persistListen = useCallback(() => {
    flushListenClock();
    writeListenSec(listenSecRef.current);
    writeListenMap(listenMapRef.current);
  }, [flushListenClock]);

  const syncStatsView = useCallback(() => {
    persistListen();
    setListenSec(listenSecRef.current);
    setListenMap({ ...listenMapRef.current });
  }, [persistListen]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#eef6f0" : "#070b08");
    try {
      localStorage.setItem("kb-theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      const now = Date.now();
      if (now - lastResumeSave.current > 2000) {
        lastResumeSave.current = now;
        persistResume();
        persistListen();
      }
    };
    const onEnded = () => {
      if (repeatRef.current !== "one") clearResume();
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
      const index = currentIndexRef.current;
      listenSrcRef.current = index >= 0 ? songs[index].src : null;
      if (playClockRef.current == null) playClockRef.current = performance.now();
      ensureAudioGraph();
    };
    const onPause = () => {
      setIsPlaying(false);
      persistResume();
      persistListen();
      playClockRef.current = null;
    };
    const onWaiting = () => setBuffering(true);
    const onPlaying = () => {
      setIsPlaying(true);
      setBuffering(false);
    };
    const onCanPlay = () => setBuffering(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("canplay", onCanPlay);

    const onLeave = () => {
      persistResume();
      persistListen();
    };
    window.addEventListener("pagehide", onLeave);
    document.addEventListener("visibilitychange", onLeave);

    return () => {
      persistResume();
      persistListen();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("canplay", onCanPlay);
      window.removeEventListener("pagehide", onLeave);
      document.removeEventListener("visibilitychange", onLeave);
    };
  }, [ensureAudioGraph, persistResume, persistListen]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || currentIndex < 0) return;
    persistListen();
    listenSrcRef.current = songs[currentIndex].src;
    setBuffering(true);
    ensureAudioGraph();
    audio.volume = 0;
    audio.src = encodeURI(songs[currentIndex].src);
    const seekTo = pendingSeekRef.current;
    pendingSeekRef.current = null;
    const target = mutedRef.current ? 0 : volumeRef.current;
    const start = () => {
      if (seekTo && seekTo > 0 && isFinite(audio.duration) && seekTo < audio.duration - 0.5) {
        audio.currentTime = seekTo;
      }
      audio
        .play()
        .then(() => fadeLinear(audio, target, FADE_MS, fadingRef))
        .catch(() => {
          fadingRef.current = false;
          setBuffering(false);
          audio.volume = target;
        });
    };
    if (audio.readyState >= 1) start();
    else audio.addEventListener("loadedmetadata", start, { once: true });

    const now = Date.now();
    if (
      lastPlayBump.current.index !== currentIndex ||
      now - lastPlayBump.current.at > 800
    ) {
      lastPlayBump.current = { index: currentIndex, at: now };
      const src = songs[currentIndex].src;
      setPlayCounts((prev) => {
        const next = { ...prev, [src]: (prev[src] ?? 0) + 1 };
        writePlays(next);
        return next;
      });
    }
    setResumeOffer(null);
    const scrollTimer = window.setTimeout(() => scrollSongIntoView(currentIndex), 80);
    return () => {
      window.clearTimeout(scrollTimer);
      audio.removeEventListener("loadedmetadata", start);
    };
  }, [currentIndex, ensureAudioGraph, persistListen]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || fadingRef.current) return;
    audio.volume = muted ? 0 : volume;
  }, [volume, muted]);

  useEffect(() => {
    if (!isPlaying) return;
    if (playClockRef.current == null) playClockRef.current = performance.now();
    const id = window.setInterval(() => persistListen(), 2000);
    return () => {
      persistListen();
      window.clearInterval(id);
    };
  }, [isPlaying, persistListen]);

  useEffect(() => {
    if (currentIndex < 0) return;
    setRecent((prev) => {
      const next = [currentIndex, ...prev.filter((i) => i !== currentIndex)];
      return next.slice(0, 5);
    });
  }, [currentIndex]);

  useEffect(() => {
    if (!currentSong?.cover) {
      setGlowColor("#1ed760");
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
    const fallback = window.setTimeout(() => setCardsVisible(true), 400);
    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    if (currentIndex < 0) setNowPlayingOpen(false);
  }, [currentIndex]);

  useEffect(() => {
    const lock = nowPlayingOpen || statsOpen;
    document.documentElement.style.overflow = lock ? "hidden" : "";
    document.body.style.overflow = lock ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [nowPlayingOpen, statsOpen]);

  useEffect(() => {
    if (!statsOpen) return;
    syncStatsView();
    const trigger = statsBtnRef.current;
    const id = window.setInterval(syncStatsView, 1000);
    const t = window.setTimeout(() => statsCloseRef.current?.focus(), 20);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(t);
      trigger?.focus();
    };
  }, [statsOpen, syncStatsView]);

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
      const inField = Boolean(
        target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.tagName === "SELECT" ||
            target.isContentEditable),
      );
      const searchEl = searchInputRef.current;
      const searchFocused = Boolean(searchEl && document.activeElement === searchEl);

      if (e.key === "Escape") {
        if (searchFocused) {
          e.preventDefault();
          setQuery("");
          searchEl?.blur();
          return;
        }
        if (statsOpen) {
          setStatsOpen(false);
          return;
        }
        if (nowPlayingOpen) {
          setNowPlayingOpen(false);
          return;
        }
      }

      if (e.key === "/" && !inField && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        searchEl?.focus();
        searchEl?.select();
        return;
      }

      if (inField) return;
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
  }, [togglePlayPause, playNext, playPrev, nowPlayingOpen, statsOpen]);

  const shareSong = useCallback(
    async (song: Song) => {
      const link = window.location.origin;
      const shareText = `Listening to ${song.title} by ${song.artist} on Krishbuilds — ${link}`;
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

  const seek = useCallback(() => {
    persistResume();
  }, [persistResume]);

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
      setQuery("");
      setCategory("All");
      pulseEl(trigger ?? null);
      void changeTrack(next);
      if (shuffle) {
        setShuffleOrder(shuffleList(songs.map((_, i) => i), next));
      }
      window.setTimeout(() => pulseSong(next), 80);
    },
    [currentIndex, shuffle, changeTrack],
  );

  const continueListening = useCallback(
    (trigger?: HTMLElement | null) => {
      if (!resumeOffer) return;
      const { index, time } = resumeOffer;
      pendingSeekRef.current = time;
      setResumeOffer(null);
      setQuery("");
      setCategory("All");
      pulseEl(trigger ?? null);
      if (index === currentIndex) {
        const audio = audioRef.current;
        if (audio) {
          audio.currentTime = time;
          audio.play().catch(() => {});
        }
        persistResume();
        window.setTimeout(() => {
          scrollSongIntoView(index);
          pulseSong(index);
        }, 40);
        return;
      }
      void changeTrack(index);
      if (shuffle) {
        setShuffleOrder(shuffleList(songs.map((_, i) => i), index));
      }
      window.setTimeout(() => pulseSong(index), 80);
    },
    [resumeOffer, currentIndex, shuffle, changeTrack, persistResume],
  );

  const t = text[lang];
  const queuedCount = useMemo(() => {
    const counts = new Map<number, number>();
    for (const i of queue) counts.set(i, (counts.get(i) ?? 0) + 1);
    return counts;
  }, [queue]);

  const recommendations = useMemo(
    () => pickRecommendations(currentIndex, playCounts),
    [currentIndex, playCounts],
  );

  const listeningStats = useMemo(() => {
    const ranked = songs
      .map((song, index) => ({
        index,
        plays: playCounts[song.src] ?? 0,
        time: listenMap[song.src] ?? 0,
      }))
      .filter((row) => row.plays > 0 || row.time >= 1)
      .sort((a, b) => (b.time !== a.time ? b.time - a.time : b.plays - a.plays));
    const totalPlays = Object.values(playCounts).reduce((sum, n) => sum + n, 0);
    return {
      top: ranked.slice(0, 5),
      most: ranked[0] ?? null,
      totalPlays,
    };
  }, [playCounts, listenMap]);

  const coverFor = useCallback((index: number, song: Song, extraClass = "") => {
    const hasError = coverErrors[index];
    if (hasError || !song.cover) {
      return (
        <div
          className={`w-full h-full flex items-center justify-center text-muted bg-spot-hover ${extraClass}`}
          role="img"
          aria-label={`${song.title} by ${song.artist}`}
        >
          <MusicNoteIcon className="w-1/2 h-1/2 max-w-12 max-h-12 opacity-40" />
        </div>
      );
    }
    return (
      <img
        src={encodeURI(song.cover)}
        alt={`${song.title} by ${song.artist}`}
        decoding="async"
        draggable={false}
        className={`w-full h-full object-cover ${extraClass}`}
        onError={() => setCoverErrors((prev) => ({ ...prev, [index]: true }))}
      />
    );
  }, [coverErrors]);

  const transportProps = {
    audioRef,
    shuffle,
    repeat,
    isPlaying,
    waveSeed: currentSong?.src ?? "",
    onShuffle: toggleShuffle,
    onPrev: playPrev,
    onToggle: togglePlayPause,
    onNext: playNext,
    onRepeat: cycleRepeat,
    onSeekCommit: seek,
  };

  return (
    <div className={`app-shell min-h-screen bg-spot font-sans text-fg ${currentIndex >= 0 ? "pb-36" : "pb-10"}`}>
      <audio ref={audioRef} preload="metadata" crossOrigin="anonymous" />

      <section className="relative flex flex-col items-center px-4 sm:px-8 pt-20 sm:pt-24 pb-8 sm:pb-10 overflow-hidden">
        <div className="hero-wash" />
        <div className="hero-grain" aria-hidden="true" />

        <div className="absolute top-5 right-4 sm:right-8 z-10 hero-in flex items-center gap-2.5" style={{ animationDelay: "0.05s" }}>
          <button
            ref={statsBtnRef}
            type="button"
            onClick={() => setStatsOpen(true)}
            className={`hero-vinyl-btn${isPlaying ? " is-playing" : ""}`}
            aria-label="Listening stats"
            aria-haspopup="dialog"
            aria-expanded={statsOpen}
          >
            <span className="hero-vinyl" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-1 rounded-2xl border border-spot-border bg-spot-raised/80 px-1.5 py-1 text-xs font-medium tracking-wide backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setTheme((mode) => (mode === "dark" ? "light" : "dark"))}
              className="ctrl-btn p-1.5 rounded-full text-muted hover:text-fg hover:bg-fg/10 cursor-pointer"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`ctrl-btn px-2 py-1 cursor-pointer rounded-lg ${
                lang === "en" ? "text-green" : "text-muted hover:text-fg"
              }`}
              aria-pressed={lang === "en"}
              aria-label="English"
            >
              EN
            </button>
            <span className="text-spot-border" aria-hidden="true">/</span>
            <button
              type="button"
              onClick={() => setLang("hi")}
              className={`ctrl-btn px-2 py-1 cursor-pointer rounded-lg ${
                lang === "hi" ? "text-green" : "text-muted hover:text-fg"
              }`}
              aria-pressed={lang === "hi"}
              aria-label="Hindi"
            >
              हिं
            </button>
          </div>
        </div>

        <div className="relative z-10 text-center w-full max-w-3xl">
          <h1 className="hero-mark hero-in text-[clamp(3.6rem,12vw,7.4rem)] font-semibold tracking-[-0.04em] text-fg leading-[0.9]">
            K<span className="hero-ital">ri</span>shbu<span className="hero-ital">i</span>lds
          </h1>
          <p className="hero-in mt-4 sm:mt-5 text-base sm:text-lg text-muted font-medium tracking-wide" style={{ animationDelay: "0.16s" }}>
            {t.tagline}
          </p>
          <button
            type="button"
            onClick={() => {
              document.getElementById("songs")?.scrollIntoView({ behavior: "smooth" });
              if (currentIndex < 0) playSong(0);
              else if (!isPlaying) togglePlayPause();
            }}
            className="hero-cta hero-in mt-7 sm:mt-8 inline-flex items-center justify-center rounded-2xl font-semibold text-base px-11 py-3.5 cursor-pointer"
            style={{ animationDelay: "0.3s" }}
          >
            Play
          </button>
        </div>

        <div className="hero-in relative z-10 mt-9 sm:mt-11 w-full" style={{ animationDelay: "0.46s" }}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="relative block w-full max-w-md">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
                <SearchIcon className="w-4 h-4" />
              </span>
              <input
                ref={searchInputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.preventDefault();
                    setQuery("");
                    e.currentTarget.blur();
                  }
                }}
                placeholder="Search songs, artists, or moods"
                className="search-input w-full rounded-2xl bg-search text-fg placeholder:text-muted text-sm py-3 pl-11 pr-10"
                aria-label="Search songs, artists, or moods"
                aria-keyshortcuts="/"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    searchInputRef.current?.focus();
                  }}
                  className="ctrl-btn absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-muted hover:text-fg hover:bg-fg/10 cursor-pointer"
                  aria-label="Clear search"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              )}
            </label>
            <button
              type="button"
              onClick={(e) => playSurprise(e.currentTarget)}
              className="relative inline-flex items-center gap-2 self-start rounded-2xl bg-spot-raised hover:bg-spot-hover border border-spot-border hover:border-green text-fg font-semibold text-sm px-4 py-3 cursor-pointer transition-colors"
              aria-label="Play a random song"
            >
              <SparkleIcon className="w-4 h-4 text-green" />
              Surprise Me
            </button>
          </div>
        </div>
      </section>

      <section
        id="songs"
        ref={songsSectionRef}
        className="px-4 sm:px-8 pt-2 sm:pt-3 pb-12 scroll-mt-4"
      >
        {resumeOffer && songs[resumeOffer.index] && (
          <div className="continue-banner relative mb-5 w-full max-w-xl rounded-[var(--radius-panel)] overflow-hidden bg-spot-raised border border-spot-border p-3 sm:p-3.5 flex items-center gap-2 sm:gap-3.5">
            <button
              type="button"
              onClick={(e) => continueListening(e.currentTarget)}
              className="relative min-w-0 flex-1 flex items-center gap-3.5 text-left cursor-pointer hover:opacity-95"
              aria-label={`Continue ${songs[resumeOffer.index].title}`}
            >
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-md ring-1 ring-fg/10">
                {coverFor(resumeOffer.index, songs[resumeOffer.index])}
              </div>
              <div className="relative min-w-0 flex-1">
                <p className="text-[11px] font-bold tracking-widest uppercase text-green">
                  Continue listening
                </p>
                <p className="mt-0.5 text-sm font-semibold text-fg truncate">
                  {songs[resumeOffer.index].title}
                </p>
                <p className="text-xs text-muted truncate">
                  {songs[resumeOffer.index].artist}
                  <span className="text-spot-border"> · </span>
                  {formatTime(resumeOffer.time)}
                </p>
              </div>
              <span className="relative flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-green text-control-fg flex items-center justify-center shadow-[0_0_16px_rgba(57,255,136,0.4)]">
                <PlayIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setResumeOffer(null);
                clearResume();
              }}
              className="relative flex-shrink-0 p-1.5 rounded-full text-muted hover:text-fg hover:bg-fg/10 cursor-pointer"
              aria-label="Dismiss continue listening"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {FEATURED_INDEX >= 0 && songs[FEATURED_INDEX] && (
          <button
            type="button"
            onClick={(e) => playFeatured(e.currentTarget)}
            className="rec-banner relative mb-7 w-full max-w-xl text-left rounded-[var(--radius-panel)] overflow-hidden bg-spot-raised border border-spot-border p-3 sm:p-3.5 flex items-center gap-3.5 cursor-pointer hover:bg-spot-hover transition-colors"
          >
            <span className="rec-banner-wash pointer-events-none absolute inset-0" aria-hidden="true" />
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-md ring-1 ring-fg/10">
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
            <span className="relative flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-green text-control-fg flex items-center justify-center shadow-[0_0_16px_rgba(57,255,136,0.4)]">
              <PlayIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />
            </span>
          </button>
        )}

        {recent.length > 0 && (
          <div className="mb-8">
            <p className="section-kicker mb-1">
              Listening history
            </p>
            <h2 className="section-title text-2xl sm:text-3xl mb-4">Recently Played</h2>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide py-2">
              {recent.map((index) => {
                const song = songs[index];
                const isActive = index === currentIndex;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={(e) => playSong(index, e.currentTarget)}
                    className={`song-card flex-shrink-0 w-[136px] sm:w-40 text-left p-2.5 cursor-pointer ${
                      isActive
                        ? "song-card-playing"
                        : "bg-spot-raised hover:bg-spot-hover"
                    }`}
                    aria-label={`${isActive && isPlaying ? "Pause" : "Play"} ${song.title} by ${song.artist}`}
                    aria-current={isActive ? "true" : undefined}
                  >
                    <div className="relative aspect-square rounded-[0.85rem] overflow-hidden mb-2 bg-spot-hover">
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

        {recommendations && (
          <div className="mb-8">
            <p className="section-kicker mb-1">For you</p>
            <h2 className="section-title text-2xl sm:text-3xl mb-4">
              Because you listened to{" "}
              <span className="text-green">{songs[recommendations.seedIndex].title}</span>
            </h2>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide py-2">
              {recommendations.indices.map((index) => {
                const song = songs[index];
                const isActive = index === currentIndex;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={(e) => playSong(index, e.currentTarget)}
                    className={`song-card flex-shrink-0 w-[136px] sm:w-40 text-left p-2.5 cursor-pointer ${
                      isActive
                        ? "song-card-playing"
                        : "bg-spot-raised hover:bg-spot-hover"
                    }`}
                    aria-label={`${isActive && isPlaying ? "Pause" : "Play"} ${song.title} by ${song.artist}`}
                    aria-current={isActive ? "true" : undefined}
                  >
                    <div className="relative aspect-square rounded-[0.85rem] overflow-hidden mb-2 bg-spot-hover">
                      {coverFor(index, song)}
                      {isActive && isPlaying && !buffering && (
                        <div className="absolute bottom-1.5 left-1.5">
                          <EqBars />
                        </div>
                      )}
                    </div>
                    <p className={`font-bold text-sm truncate ${isActive ? "text-green" : "text-fg"}`}>{song.title}</p>
                    <p className="text-xs text-muted truncate mt-0.5">{song.artist}</p>
                    <span className={`mood-pill mood-${song.mood.toLowerCase()} mt-1.5`}>
                      {song.mood}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <p className="section-kicker mb-1">
          Playlist
        </p>
        <div className="flex items-end justify-between gap-3 mb-3">
          <h2 className="section-title text-2xl sm:text-3xl">Made for You</h2>
          <span className="text-sm text-muted whitespace-nowrap pb-0.5">
            {filteredSongs.length} {filteredSongs.length === 1 ? "song" : "songs"}
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-5 pb-0.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`flex-shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-semibold tracking-wide cursor-pointer transition-colors ${
                category === cat
                  ? "bg-green text-control-fg"
                  : "bg-spot-hover text-muted hover:text-green"
              }`}
              aria-pressed={category === cat}
            >
              {cat}
            </button>
          ))}
        </div>

        {songs.length === 0 ? (
          <div>
            <p className="sr-only" role="status">Loading your songs</p>
            <SongGridSkeleton />
          </div>
        ) : filteredSongs.length === 0 ? (
          <EmptySongs
            icon={<SearchIcon className="w-6 h-6" />}
            title={query.trim() ? `No songs matching “${query.trim()}”` : `No ${category.toLowerCase()} songs`}
            hint={
              query.trim()
                ? "Try another search or pick a different mood — your library is still here."
                : "Nothing in this mood yet. Browse the full playlist or surprise yourself."
            }
            action={{
              label: query.trim() ? "Clear search" : "Show all songs",
              onClick: () => {
                setQuery("");
                setCategory("All");
              },
            }}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-6 py-1">
            {filteredSongs.map(({ song, index }, i) => {
              const isActive = index === currentIndex;
              const inQueue = queuedCount.get(index) ?? 0;
              const plays = playCounts[song.src] ?? 0;
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
                  className={`song-card group relative text-left p-3 sm:p-4 cursor-pointer min-w-0 scroll-mt-36 ${
                    isActive ? "song-card-playing" : "bg-spot-raised hover:bg-spot-hover"
                  }`}
                  aria-label={`${isActive && isPlaying ? "Pause" : "Play"} ${song.title} by ${song.artist}`}
                  aria-current={isActive ? "true" : undefined}
                >
                  <div
                    className={cardsVisible ? "song-card-enter" : "opacity-0"}
                    style={{ animationDelay: `${Math.min(i, 14) * 50}ms` }}
                  >
                  <div className="relative aspect-square rounded-[0.95rem] overflow-hidden mb-3 bg-spot-hover shadow-lg">
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
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full text-control-fg flex items-center justify-center shadow-[0_8px_24px_rgba(7,11,8,0.5)] hover:scale-105 cursor-pointer"
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
                      <p className="text-[11px] text-muted/80 mt-0.5">
                        {plays === 1 ? "1 play" : `${plays} plays`}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCategory(song.mood);
                          setQuery("");
                        }}
                        className={`mood-pill mood-${song.mood.toLowerCase()} mt-1.5 cursor-pointer`}
                        aria-label={`Filter by ${song.mood}`}
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
                        <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-0.5 rounded-full bg-green text-control-fg text-[9px] font-bold leading-[14px] text-center">
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
        <div className="mx-auto max-w-xl rounded-[var(--radius-panel)] bg-spot-raised border border-green/30 px-6 py-8 text-center">
          <p className="text-muted text-sm sm:text-base mb-5">
            Want to suggest a song? Contact me on WhatsApp
          </p>
          <a
            href="https://wa.me/919267939780"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl bg-green hover:bg-green-hover text-control-fg font-semibold text-sm px-6 py-3 transition-colors"
            aria-label="Suggest a song on WhatsApp (opens in a new tab)"
          >
            <WhatsAppIcon className="w-5 h-5" />
            WhatsApp
          </a>
        </div>
      </footer>

      {currentIndex >= 0 && (
      <div className={`player-dock fixed bottom-0 left-0 right-0 z-50 flex justify-center overflow-visible px-3 pb-3 sm:px-4 sm:pb-4 ${nowPlayingOpen ? "invisible pointer-events-none" : ""}`}>
        <div
          className="player-glow pointer-events-none absolute left-1/2 bottom-0 h-20 w-[min(32rem,80%)] -translate-x-1/2 rounded-full blur-3xl"
          style={{
            backgroundColor: glowColor,
            opacity: theme === "light" ? 0.18 : 0.28,
          }}
          aria-hidden="true"
        />
        <div className="player-card player-bar relative">
          <button
            type="button"
            onClick={() => setNowPlayingOpen(true)}
            className="player-now flex items-center gap-3 min-w-0 text-left cursor-pointer rounded-xl"
            aria-label={`Open now playing, ${nowCurrSong ? `${nowCurrSong.title} by ${nowCurrSong.artist}` : "current track"}`}
            aria-expanded={nowPlayingOpen}
          >
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden flex-shrink-0 bg-spot-hover shadow-md ring-1 ring-fg/10">
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
                  <p className="text-sm font-semibold text-fg truncate leading-snug">
                    {nowPrevSong.title}
                  </p>
                  <p className="text-xs text-muted truncate leading-snug mt-0.5">
                    {nowPrevSong.artist}
                  </p>
                </div>
              )}
              {nowCurrSong && (
                <div key={`txt-in-${nowCurr}`} className="player-now-in min-w-0">
                  <p className="text-sm font-semibold text-fg truncate leading-snug">
                    {nowCurrSong.title}
                  </p>
                  <p className="text-xs text-muted truncate leading-snug mt-0.5">
                    {nowCurrSong.artist}
                  </p>
                </div>
              )}
            </div>
          </button>

          <div className="player-transport">
            <div className="player-controls flex items-center justify-center">
              <button
                type="button"
                onClick={toggleShuffle}
                className={`ctrl-btn hidden sm:inline-flex cursor-pointer p-2 mr-1 rounded-full ${
                  shuffle ? "text-green" : "text-muted hover:text-fg"
                }`}
                aria-label="Shuffle"
                aria-pressed={shuffle}
              >
                <ShuffleIcon className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={playPrev}
                className="ctrl-btn text-muted hover:text-fg cursor-pointer p-2 rounded-full"
                aria-label="Previous"
              >
                <PrevIcon className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={togglePlayPause}
                className="ctrl-btn-play mx-1.5 w-11 h-11 rounded-full text-control-fg flex items-center justify-center hover:scale-105 cursor-pointer flex-shrink-0"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5 ml-0.5" />}
              </button>
              <button
                type="button"
                onClick={playNext}
                className="ctrl-btn text-muted hover:text-fg cursor-pointer p-2 rounded-full"
                aria-label="Next"
              >
                <NextIcon className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={cycleRepeat}
                className={`ctrl-btn relative hidden sm:inline-flex cursor-pointer p-2 ml-1 rounded-full ${
                  repeat !== "off" ? "text-green" : "text-muted hover:text-fg"
                }`}
                aria-label={repeat === "one" ? "Repeat one" : repeat === "all" ? "Repeat all" : "Repeat off"}
                aria-pressed={repeat !== "off"}
              >
                <RepeatIcon className="w-5 h-5" />
                {repeat === "one" && (
                  <span className="absolute left-1/2 -translate-x-1/2 -bottom-0.5 text-[10px] font-semibold leading-none">
                    1
                  </span>
                )}
              </button>
            </div>
            <SeekBar
              audioRef={audioRef}
              compact
              seed={currentSong?.src ?? ""}
              onSeekCommit={seek}
            />
          </div>

          <div className="player-vol">
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              className="ctrl-btn p-2 text-muted hover:text-fg cursor-pointer flex-shrink-0 rounded-full"
              aria-label={muted ? "Unmute" : "Mute"}
              aria-pressed={muted}
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
              className="volume-seek w-16 md:w-24 min-w-0"
              style={{ ["--progress" as string]: `${(muted ? 0 : volume) * 100}%` }}
              aria-label="Volume"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round((muted ? 0 : volume) * 100)}
            />
          </div>
        </div>
      </div>
      )}

      {nowPlayingOpen && currentSong && (
        <div
          className="now-playing-enter fixed inset-0 z-[70] bg-spot flex flex-col overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="now-playing-title"
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at 50% 28%, ${glowColor} 0%, transparent 58%)`,
              opacity: theme === "light" ? 0.2 : 0.38,
            }}
            aria-hidden="true"
          />
          <div className="relative z-10 flex items-center justify-between px-4 sm:px-8 pt-5 pb-2">
            <p className="section-kicker">Now playing</p>
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
            <div className="relative w-full max-w-sm sm:max-w-md aspect-square rounded-[1.75rem] overflow-hidden shadow-2xl bg-spot-hover mb-8">
              {coverFor(currentIndex, currentSong, buffering ? "opacity-70" : "")}
              {buffering && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                  <div className="art-spinner" aria-hidden="true" />
                </div>
              )}
            </div>
            <div className="w-full max-w-xl text-center mb-8">
              <h2 id="now-playing-title" className="section-title text-2xl sm:text-4xl text-fg truncate">{currentSong.title}</h2>
              <p className="mt-2 text-base sm:text-lg text-muted truncate">{currentSong.artist}</p>
              <div className="mt-3">
                <span className={`mood-pill mood-${currentSong.mood.toLowerCase()}`}>
                  {currentSong.mood}
                </span>
              </div>
            </div>
            <Transport size="full" {...transportProps} />
            <div className="flex items-center justify-center gap-3 mt-8 w-full max-w-xs">
              <button
                type="button"
                onClick={() => setMuted((m) => !m)}
                className="ctrl-btn p-1.5 rounded-full text-muted hover:text-fg cursor-pointer flex-shrink-0"
                aria-label={muted ? "Unmute" : "Mute"}
                aria-pressed={muted}
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
                aria-label="Volume"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round((muted ? 0 : volume) * 100)}
              />
            </div>
          </div>
        </div>
      )}

      {statsOpen && (
        <div
          className="stats-overlay"
          onClick={() => setStatsOpen(false)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="stats-title"
            className="stats-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="stats-dialog-head">
              <div>
                <p className="section-kicker mb-1">Your listening</p>
                <h2 id="stats-title" className="section-title text-2xl text-fg">
                  Stats
                </h2>
              </div>
              <button
                ref={statsCloseRef}
                type="button"
                onClick={() => setStatsOpen(false)}
                className="ctrl-btn p-2 rounded-full text-muted hover:text-fg hover:bg-fg/10 cursor-pointer flex-shrink-0"
                aria-label="Close stats"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="stats-dialog-body">
              {listeningStats.totalPlays === 0 && listenSec < 1 ? (
                <p className="stats-empty">
                  Play a few songs and your listening time and top tracks will show up here.
                </p>
              ) : (
                <>
                  <div className="stats-card">
                    <p className="stats-label">Total listening time</p>
                    <p className="stats-value">{formatListen(listenSec)}</p>
                  </div>
                  <div className="stats-card">
                    <p className="stats-label">Most played</p>
                    {listeningStats.most ? (
                      <>
                        <button
                          type="button"
                          className="stats-most"
                          onClick={() => {
                            const most = listeningStats.most;
                            if (!most) return;
                            setStatsOpen(false);
                            playSong(most.index);
                          }}
                          aria-label={`Play ${songs[listeningStats.most.index].title}, rank 1`}
                        >
                          <div className="stats-most-art">
                            {coverFor(listeningStats.most.index, songs[listeningStats.most.index])}
                            <span className="stats-art-badge">#1</span>
                          </div>
                          <div className="min-w-0">
                            <p className="stats-most-title">{songs[listeningStats.most.index].title}</p>
                            <p className="stats-most-meta">
                              {listeningStats.most.plays === 1 ? "1 play" : `${listeningStats.most.plays} plays`}
                              {listeningStats.most.time >= 1 ? ` · ${formatListen(listeningStats.most.time)}` : ""}
                            </p>
                          </div>
                        </button>
                        {listeningStats.top.length > 1 && (
                          <ol className="stats-rank-list">
                            {listeningStats.top.slice(1).map((row, i) => {
                              const song = songs[row.index];
                              const rank = i + 2;
                              const detail = [
                                row.plays === 1 ? "1 play" : `${row.plays} plays`,
                                row.time >= 1 ? formatListen(row.time) : null,
                              ]
                                .filter(Boolean)
                                .join(" · ");
                              return (
                                <li key={song.src}>
                                  <button
                                    type="button"
                                    className="stats-rank-row"
                                    onClick={() => {
                                      setStatsOpen(false);
                                      playSong(row.index);
                                    }}
                                    aria-label={`Play ${song.title}, rank ${rank}`}
                                  >
                                    <span className="stats-rank-num">#{rank}</span>
                                    <span className="stats-rank-title">{song.title}</span>
                                    <span className="stats-rank-meta">{detail}</span>
                                  </button>
                                </li>
                              );
                            })}
                          </ol>
                        )}
                      </>
                    ) : (
                      <p className="stats-most-meta mt-2">No plays yet</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className="copied-toast fixed bottom-36 left-1/2 z-[80] -translate-x-1/2 rounded-2xl bg-fg text-spot px-4 py-2 text-sm font-semibold shadow-lg"
          role="status"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
