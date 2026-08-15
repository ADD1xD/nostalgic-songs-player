import { useState, useRef, useEffect, useCallback, useMemo } from "react";

import { songs, type Song } from "./songs";

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
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={onSeek}
          className="player-seek flex-1 min-w-0"
          style={{
            ["--progress" as string]: duration
              ? `${(currentTime / duration) * 100}%`
              : "0%",
          }}
        />
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

  const songsSectionRef = useRef<HTMLElement>(null);
  const shuffleRef = useRef(shuffle);
  const repeatRef = useRef(repeat);
  const shuffleOrderRef = useRef(shuffleOrder);
  const queueRef = useRef(queue);
  const currentIndexRef = useRef(currentIndex);
  const toastTimer = useRef(0);
  shuffleRef.current = shuffle;
  repeatRef.current = repeat;
  shuffleOrderRef.current = shuffleOrder;
  queueRef.current = queue;
  currentIndexRef.current = currentIndex;

  const currentSong = currentIndex >= 0 ? songs[currentIndex] : null;

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
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || currentIndex < 0) return;
    setBuffering(true);
    audio.src = encodeURI(songs[currentIndex].src);
    audio.play().catch(() => setBuffering(false));
  }, [currentIndex]);

  useEffect(() => {
    if (currentIndex < 0) return;
    setRecent((prev) => {
      const next = [currentIndex, ...prev.filter((i) => i !== currentIndex)];
      return next.slice(0, 5);
    });
  }, [currentIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = muted ? 0 : volume;
  }, [volume, muted]);

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
    document.body.style.overflow = nowPlayingOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [nowPlayingOpen]);

  const filteredSongs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return songs
      .map((song, index) => ({ song, index }))
      .filter(
        ({ song }) =>
          !q ||
          song.title.toLowerCase().includes(q) ||
          song.artist.toLowerCase().includes(q) ||
          song.mood.toLowerCase().includes(q),
      );
  }, [query]);

  const playSong = useCallback(
    (index: number) => {
      if (index === currentIndex) {
        togglePlayPause();
      } else {
        setCurrentIndex(index);
        if (shuffle) {
          setShuffleOrder(shuffleList(songs.map((_, i) => i), index));
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentIndex, shuffle],
  );

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (currentIndex < 0) {
      setCurrentIndex(0);
      return;
    }
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [currentIndex]);

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
      setCurrentIndex(shuffleOrder[prevPos] ?? 0);
    } else {
      setCurrentIndex((prev) => (prev <= 0 ? songs.length - 1 : prev - 1));
    }
  }, [currentIndex, shuffle, shuffleOrder]);

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
        setCurrentIndex(next);
      }
      return;
    }
    if (shuffle) {
      const pos = shuffleOrder.indexOf(currentIndex);
      const nextPos = pos >= 0 ? (pos + 1) % shuffleOrder.length : 0;
      setCurrentIndex(shuffleOrder[nextPos] ?? 0);
    } else {
      setCurrentIndex((prev) => (prev < 0 ? 0 : (prev + 1) % songs.length));
    }
  }, [currentIndex, shuffle, shuffleOrder, queue]);

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
    if (!audio) return;
    audio.currentTime = Number(e.target.value);
  }, []);

  const playFeatured = useCallback(() => {
    if (FEATURED_INDEX < 0) return;
    const needsRerender = query.trim().length > 0;
    setQuery("");
    if (FEATURED_INDEX === currentIndex) {
      const audio = audioRef.current;
      if (audio?.paused) audio.play().catch(() => {});
    } else {
      setCurrentIndex(FEATURED_INDEX);
      if (shuffle) {
        setShuffleOrder(shuffleList(songs.map((_, i) => i), FEATURED_INDEX));
      }
    }
    const scrollToCard = () => {
      document
        .getElementById(`song-card-${FEATURED_INDEX}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    window.setTimeout(scrollToCard, needsRerender ? 80 : 0);
  }, [currentIndex, query, shuffle]);

  const playSurprise = useCallback(() => {
    if (songs.length === 0) return;
    const options = songs.map((_, i) => i).filter((i) => i !== currentIndex);
    const pool = options.length > 0 ? options : [0];
    const next = pool[Math.floor(Math.random() * pool.length)] ?? 0;
    setCurrentIndex(next);
    if (shuffle) {
      setShuffleOrder(shuffleList(songs.map((_, i) => i), next));
    }
  }, [currentIndex, shuffle]);

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
    <div className="min-h-screen bg-spot pb-36 font-sans text-fg">
      <audio ref={audioRef} preload="metadata" />

      <section className="relative flex flex-col items-center justify-center min-h-[70vh] px-6 overflow-hidden">
        <div className="hero-wash absolute inset-0" />

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
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight text-fg leading-none">
            {t.headline}
          </h1>
          <p className="mt-5 text-base sm:text-lg text-muted font-medium">
            {t.tagline}
          </p>
          <button
            type="button"
            onClick={() => {
              document.getElementById("songs")?.scrollIntoView({ behavior: "smooth" });
              if (currentIndex < 0) setCurrentIndex(0);
            }}
            className="mt-10 inline-flex items-center justify-center rounded-full bg-green hover:bg-green-hover hover:scale-105 text-black font-bold text-base px-10 py-3.5 cursor-pointer transition-all"
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
            onClick={playSurprise}
            className="inline-flex items-center gap-2 self-start rounded-full bg-spot-raised hover:bg-spot-hover border border-spot-border text-fg font-bold text-sm px-4 py-2.5 cursor-pointer transition-colors"
          >
            <SparkleIcon className="w-4 h-4 text-green" />
            Surprise Me
          </button>
        </div>

        {FEATURED_INDEX >= 0 && songs[FEATURED_INDEX] && (
          <button
            type="button"
            onClick={playFeatured}
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
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              {recent.map((index) => {
                const song = songs[index];
                const isActive = index === currentIndex;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => playSong(index)}
                    className={`flex-shrink-0 w-[136px] sm:w-40 text-left rounded-lg p-2.5 cursor-pointer transition-colors ${
                      isActive
                        ? "bg-spot-hover ring-2 ring-green"
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
                    <p className="font-bold text-sm text-fg truncate">{song.title}</p>
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
        <div className="flex items-end justify-between gap-3 mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold">Made for You</h2>
          <span className="text-sm text-muted whitespace-nowrap pb-0.5">
            {filteredSongs.length} {filteredSongs.length === 1 ? "song" : "songs"}
          </span>
        </div>

        {filteredSongs.length === 0 ? (
          <p className="text-muted text-sm py-8">No songs found</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {filteredSongs.map(({ song, index }, i) => {
              const isActive = index === currentIndex;
              const inQueue = queuedCount.get(index) ?? 0;
              return (
                <div
                  key={index}
                  id={`song-card-${index}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => playSong(index)}
                  onKeyDown={(e) => {
                    if (e.target !== e.currentTarget) return;
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      playSong(index);
                    }
                  }}
                  className={`group relative text-left rounded-lg p-3 cursor-pointer transition-colors min-w-0 scroll-mt-28 ${
                    cardsVisible ? "song-card-enter" : "opacity-0"
                  } ${
                    isActive
                      ? "bg-spot-hover ring-2 ring-green shadow-[0_0_24px_rgba(29,185,84,0.28)]"
                      : "bg-spot-raised hover:bg-spot-hover"
                  }`}
                  style={{ animationDelay: `${i * 55}ms` }}
                >
                  <div className="relative aspect-square rounded-md overflow-hidden mb-3 bg-spot-hover shadow-lg">
                    {coverFor(
                      index,
                      song,
                      isActive && buffering ? "opacity-70" : "",
                    )}
                    {isActive && buffering && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                        <div className="art-spinner" aria-hidden="true" />
                      </div>
                    )}
                    {isActive && isPlaying && !buffering && (
                      <div className="absolute bottom-2 left-2">
                        <EqBars />
                      </div>
                    )}
                    <div
                      className={`absolute bottom-2 right-2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green text-black flex items-center justify-center shadow-lg transition-all duration-200 ${
                        isActive && isPlaying
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
                      }`}
                    >
                      {isActive && isPlaying ? (
                        <PauseIcon className="w-5 h-5" />
                      ) : (
                        <PlayIcon className="w-5 h-5 ml-0.5" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-1 min-w-0">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-sm text-fg truncate">
                        {song.title}
                      </h3>
                      <p className="text-sm text-muted truncate mt-0.5">{song.artist}</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuery(song.mood);
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

      <div className={`fixed bottom-0 left-0 right-0 z-50 min-h-[88px] overflow-visible ${nowPlayingOpen ? "invisible pointer-events-none" : ""}`}>
        <div
          className="player-glow pointer-events-none absolute left-1/2 -top-16 h-32 w-[80%] max-w-3xl -translate-x-1/2 rounded-full blur-3xl"
          style={{
            backgroundColor: glowColor,
            opacity: currentIndex >= 0 ? (theme === "light" ? 0.22 : 0.35) : 0,
          }}
          aria-hidden="true"
        />
        <div className="relative min-h-[88px] bg-player border-t border-spot-border px-2 sm:px-4">
          <div className="h-full min-h-[88px] flex items-center gap-2 sm:gap-3 py-2">
            <button
              type="button"
              disabled={!currentSong}
              onClick={() => currentSong && setNowPlayingOpen(true)}
              className="flex items-center gap-2 sm:gap-3 min-w-0 w-[32%] sm:w-[28%] text-left cursor-pointer disabled:cursor-default"
              aria-label={currentSong ? "Open now playing" : undefined}
            >
              <div className="relative w-11 h-11 sm:w-14 sm:h-14 rounded overflow-hidden flex-shrink-0 bg-spot-hover">
                {currentSong ? coverFor(currentIndex, currentSong, buffering ? "opacity-70" : "") : (
                  <div className="w-full h-full flex items-center justify-center text-muted">
                    <MusicNoteIcon className="w-6 h-6 opacity-40" />
                  </div>
                )}
                {buffering && currentIndex >= 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                    <div className="art-spinner" aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-fg truncate">
                  {currentSong?.title ?? "Not playing"}
                </p>
                <p className="text-[11px] sm:text-xs text-muted truncate">
                  {currentSong?.artist ?? "Pick a song"}
                </p>
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
          className="copied-toast fixed bottom-24 left-1/2 z-[80] -translate-x-1/2 rounded-full bg-fg text-spot px-4 py-2 text-sm font-semibold shadow-lg"
          role="status"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
