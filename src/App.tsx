import { useState, useRef, useEffect, useCallback } from "react";

// ─── Song Data ─────────────────────────────────────────────────
// Edit this array to add/remove songs.
// Place MP3s in /public/audio/ and cover art in /public/covers/

interface Song {
  title: string;
  artist: string;
  src: string;
  cover: string;
}

const songs: Song[] = [
  {
    title: "Tum Hi Ho",
    artist: "Arijit Singh",
    src: "/audio/tum-hi-ho.mp3",
    cover: "/covers/tum-hi-ho.jpg",
  },
  {
    title: "Tera Ban Jaunga",
    artist: "Akhil Sachdeva",
    src: "/audio/tera-ban-jaunga.mp3",
    cover: "/covers/tera-ban-jaunga.jpg",
  },
  {
    title: "Channa Mereya",
    artist: "Arijit Singh",
    src: "/audio/channa-mereya.mp3",
    cover: "/covers/channa-mereya.jpg",
  },
  {
    title: "Kabira",
    artist: "Arijit Singh & Tochi Raina",
    src: "/audio/kabira.mp3",
    cover: "/covers/kabira.jpg",
  },
  {
    title: "Raabta",
    artist: "Arijit Singh",
    src: "/audio/raabta.mp3",
    cover: "/covers/raabta.jpg",
  },
  {
    title: "Phir Le Aya Dil",
    artist: "Arijit Singh",
    src: "/audio/phir-le-aya-dil.mp3",
    cover: "/covers/phir-le-aya-dil.jpg",
  },
  {
    title: "Ilahi",
    artist: "Arijit Singh",
    src: "/audio/ilahi.mp3",
    cover: "/covers/ilahi.jpg",
  },
  {
    title: "Hawayein",
    artist: "Arijit Singh",
    src: "/audio/hawayein.mp3",
    cover: "/covers/hawayein.jpg",
  },
];

// ─── Bilingual Text ────────────────────────────────────────────

const text = {
  en: { headline: "MY NAME", tagline: "songs that take me back" },
  hi: { headline: "मेरा नाम", tagline: "वो गाने जो पुरानी यादें ताज़ा कर दें" },
};

// ─── Helpers ───────────────────────────────────────────────────

function formatTime(s: number): string {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

// ─── Icons (inline SVGs) ──────────────────────────────────────

function PlayIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon({ className = "w-6 h-6" }: { className?: string }) {
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

function MusicNoteIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" opacity={0.3}>
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
  );
}

// ─── App ───────────────────────────────────────────────────────

export default function App() {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [coverErrors, setCoverErrors] = useState<Record<number, boolean>>({});

  const currentSong = currentIndex >= 0 ? songs[currentIndex] : null;

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration);
    const onEnded = () => {
      setCurrentIndex((prev) => (prev + 1) % songs.length);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, []);

  // When currentIndex changes, load + play
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || currentIndex < 0) return;
    audio.src = songs[currentIndex].src;
    audio.play().catch(() => {});
  }, [currentIndex]);

  const playSong = useCallback((index: number) => {
    if (index === currentIndex) {
      togglePlayPause();
    } else {
      setCurrentIndex(index);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, []);

  const playPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? songs.length - 1 : prev - 1));
  }, []);

  const playNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % songs.length);
  }, []);

  const seek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Number(e.target.value);
  }, []);

  const t = text[lang];

  return (
    <div className="min-h-screen bg-warm-950 pb-28">
      {/* Hidden audio element */}
      <audio ref={audioRef} preload="metadata" />

      {/* ─── Hero Section ─────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero.jpg')" }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-warm-950/40 via-warm-950/60 to-warm-950" />

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-3xl">
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight text-warm-50 drop-shadow-lg mb-4">
            {t.headline}
          </h1>
          <p className="text-lg sm:text-2xl text-warm-200/80 font-light tracking-wide">
            {t.tagline}
          </p>

          {/* Language toggle */}
          <div className="mt-8 inline-flex rounded-full border border-warm-700/50 overflow-hidden">
            <button
              onClick={() => setLang("en")}
              className={`px-5 py-2 text-sm font-medium transition-all cursor-pointer ${
                lang === "en"
                  ? "bg-accent text-warm-950"
                  : "bg-warm-900/50 text-warm-300 hover:bg-warm-800/50"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLang("hi")}
              className={`px-5 py-2 text-sm font-medium transition-all cursor-pointer ${
                lang === "hi"
                  ? "bg-accent text-warm-950"
                  : "bg-warm-900/50 text-warm-300 hover:bg-warm-800/50"
              }`}
            >
              हिंदी
            </button>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 z-10 animate-bounce">
          <svg className="w-6 h-6 text-warm-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ─── Song Picker Section ──────────────────────────── */}
      <section className="px-4 sm:px-8 py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-warm-100 mb-8 tracking-tight">
          Pick a Song
        </h2>

        {/* Horizontal scroll on mobile, grid on larger */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:overflow-x-visible">
          {songs.map((song, index) => {
            const isActive = index === currentIndex;
            const hasError = coverErrors[index];
            return (
              <button
                key={index}
                onClick={() => playSong(index)}
                className={`group flex-shrink-0 w-44 sm:w-auto rounded-2xl p-3 transition-all duration-300 text-left cursor-pointer ${
                  isActive
                    ? "bg-accent/15 ring-2 ring-accent-glow shadow-lg shadow-accent/20"
                    : "bg-warm-900/40 hover:bg-warm-900/70 hover:shadow-md"
                }`}
              >
                {/* Cover art */}
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-warm-800">
                  {hasError ? (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-warm-800 to-warm-900">
                      <MusicNoteIcon className="w-12 h-12 text-warm-500" />
                    </div>
                  ) : (
                    <img
                      src={song.cover}
                      alt={song.title}
                      className={`w-full h-full object-cover transition-transform duration-500 ${
                        isActive ? "scale-105" : "group-hover:scale-105"
                      }`}
                      onError={() =>
                        setCoverErrors((prev) => ({ ...prev, [index]: true }))
                      }
                    />
                  )}
                  {isActive && isPlaying && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="flex items-end gap-[3px] h-5">
                        <span className="w-[3px] bg-accent-glow rounded-full animate-[bounce_0.6s_ease-in-out_infinite]" style={{ height: "60%" }} />
                        <span className="w-[3px] bg-accent-glow rounded-full animate-[bounce_0.6s_ease-in-out_0.15s_infinite]" style={{ height: "100%" }} />
                        <span className="w-[3px] bg-accent-glow rounded-full animate-[bounce_0.6s_ease-in-out_0.3s_infinite]" style={{ height: "40%" }} />
                        <span className="w-[3px] bg-accent-glow rounded-full animate-[bounce_0.6s_ease-in-out_0.45s_infinite]" style={{ height: "80%" }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Song info */}
                <h3
                  className={`font-semibold text-sm truncate ${
                    isActive ? "text-accent-glow" : "text-warm-100"
                  }`}
                >
                  {song.title}
                </h3>
                <p className="text-xs text-warm-400 truncate mt-0.5">
                  {song.artist}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* ─── Sticky Bottom Player Bar ─────────────────────── */}
      {currentSong && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-3xl z-50">
          <div className="rounded-[28px] bg-gradient-to-r from-warm-900/90 via-warm-800/85 to-warm-900/90 backdrop-blur-2xl border border-warm-700/30 shadow-[0_8px_40px_rgba(0,0,0,0.5),0_0_80px_rgba(232,131,58,0.08)] px-5 py-4">
            {/* Top row: album art, song info, controls */}
            <div className="flex items-center gap-4">
              {/* Album art — large circular */}
              <div
                className={`w-[60px] h-[60px] rounded-full overflow-hidden flex-shrink-0 ring-2 ring-accent/50 shadow-lg shadow-accent/20 ${
                  isPlaying ? "animate-spin-slow" : ""
                }`}
              >
                {coverErrors[currentIndex] ? (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-warm-800 to-warm-900">
                    <MusicNoteIcon className="w-7 h-7 text-warm-500" />
                  </div>
                ) : (
                  <img
                    src={currentSong.cover}
                    alt={currentSong.title}
                    className="w-full h-full object-cover"
                    onError={() =>
                      setCoverErrors((prev) => ({
                        ...prev,
                        [currentIndex]: true,
                      }))
                    }
                  />
                )}
              </div>

              {/* Song title + artist */}
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold text-white truncate leading-snug">
                  {currentSong.title}
                </p>
                <p className="text-[13px] text-accent truncate leading-snug mt-0.5">
                  {currentSong.artist}
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={playPrev}
                  className="p-2 text-warm-300 hover:text-white transition-colors cursor-pointer"
                  aria-label="Previous"
                >
                  <PrevIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={togglePlayPause}
                  className="w-12 h-12 flex items-center justify-center bg-accent rounded-full text-warm-950 hover:bg-accent-glow transition-colors cursor-pointer shadow-lg shadow-accent/40"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <PauseIcon className="w-6 h-6" />
                  ) : (
                    <PlayIcon className="w-6 h-6" />
                  )}
                </button>
                <button
                  onClick={playNext}
                  className="p-2 text-warm-300 hover:text-white transition-colors cursor-pointer"
                  aria-label="Next"
                >
                  <NextIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Bottom row: seekable progress bar */}
            <div className="flex items-center gap-3 mt-3">
              <span className="text-[11px] text-warm-400 tabular-nums w-9 text-right flex-shrink-0">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={seek}
                className="flex-1 min-w-0"
              />
              <span className="text-[11px] text-warm-400 tabular-nums w-9 flex-shrink-0">
                {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
