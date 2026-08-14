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
    title: "Safar",
    artist: "Bayaan & Sherazam",
    src: "/audio/Bayaan & Sherazam - Safar.mp3",
    cover: "/covers/Surf cat.jpg",
  },
  {
    title: "hot girl bummer (sped up)",
    artist: "blackbear",
    src: "/audio/Blackbear - hot girl bummer  sped up  lyrics.mp3",
    cover: "/covers/Visit TikTok to discover profiles!.jpg",
  },
  {
    title: "Heat Waves",
    artist: "Glass Animals",
    src: "/audio/Glass Animals - Heat Waves (Official Video).mp3",
    cover: "/covers/ -6.jpg",
  },
  {
    title: "Kabira Encore",
    artist: "Yeh Jawaani Hai Deewani",
    src: "/audio/Kabira Encore - Yeh Jawaani Hai Deewani  Ranbir Kapoor, Deepika Padukone.mp3",
    cover: "/covers/1101763496397931579.jpg",
  },
  {
    title: "Kabira",
    artist: "Pritam",
    src: "/audio/Kabira Full Song Yeh Jawaani Hai Deewani  Pritam  Ranbir Kapoor, Deepika Padukone.mp3",
    cover: "/covers/1037939045389576829.jpg",
  },
  {
    title: "Line Without a Hook",
    artist: "Ricky Montgomery",
    src: "/audio/Ricky Montgomery - Line Without a Hook (Official Lyric Video).mp3",
    cover: "/covers/cat on sea.jpg",
  },
  {
    title: "Rough Days",
    artist: "Unknown",
    src: "/audio/Rough Days.mp3",
    cover: "/covers/642114859417697153.jpg",
  },
  {
    title: "I Thought I Saw Your Face Today",
    artist: "She & Him",
    src: "/audio/She & Him - I Thought I Saw Your Face Today (Official Lyric Video).mp3",
    cover: "/covers/cat on sea.jpg",
  },
  {
    title: "SugarCrash!",
    artist: "ElyOtto",
    src: "/audio/SugarCrash!.mp3",
    cover: "/covers/1075304848539893076.jpg",
  },
];

// ─── Bilingual Text ────────────────────────────────────────────

const text = {
  en: { headline: "Krishbuilds", tagline: "songs that take me back" },
  hi: { headline: "Krishbuilds", tagline: "वो गाने जो पुरानी यादें ताज़ा कर दें" },
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

function CatMascot({ className = "w-40 h-40" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" aria-hidden="true">
      <path d="M148 128c22 8 30-12 16-30" stroke="#e8a06a" strokeWidth="12" strokeLinecap="round" />
      <ellipse cx="100" cy="142" rx="46" ry="34" fill="#f2b88a" />
      <ellipse cx="100" cy="150" rx="26" ry="18" fill="#ffe8d6" />
      <circle cx="100" cy="84" r="42" fill="#f2b88a" />
      <path d="M64 68 58 36l32 22" fill="#f2b88a" />
      <path d="M136 68 142 36l-32 22" fill="#f2b88a" />
      <path d="M66 62 62 44l16 12" fill="#f7c4c8" />
      <path d="M134 62 138 44l-16 12" fill="#f7c4c8" />
      <path d="M58 80c0-28 84-28 84 0" stroke="#c9b6e8" strokeWidth="8" strokeLinecap="round" />
      <circle cx="54" cy="88" r="15" fill="#c9b6e8" />
      <circle cx="146" cy="88" r="15" fill="#c9b6e8" />
      <circle cx="54" cy="88" r="8" fill="#fff8f1" />
      <circle cx="146" cy="88" r="8" fill="#fff8f1" />
      <path d="M82 84c4 7 12 7 16 0" stroke="#5c4a42" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M102 84c4 7 12 7 16 0" stroke="#5c4a42" strokeWidth="3.2" strokeLinecap="round" />
      <ellipse cx="100" cy="97" rx="5" ry="3.4" fill="#f4a09a" />
      <path d="M100 100c-4 6-10 5-13 2" stroke="#5c4a42" strokeWidth="2" strokeLinecap="round" />
      <path d="M100 100c4 6 10 5 13 2" stroke="#5c4a42" strokeWidth="2" strokeLinecap="round" />
      <path d="M72 98H54" stroke="#5c4a42" strokeWidth="1.6" strokeLinecap="round" opacity=".45" />
      <path d="M72 104H56" stroke="#5c4a42" strokeWidth="1.6" strokeLinecap="round" opacity=".45" />
      <path d="M128 98h18" stroke="#5c4a42" strokeWidth="1.6" strokeLinecap="round" opacity=".45" />
      <path d="M128 104h16" stroke="#5c4a42" strokeWidth="1.6" strokeLinecap="round" opacity=".45" />
      <ellipse cx="80" cy="170" rx="11" ry="8" fill="#ffe8d6" />
      <ellipse cx="120" cy="170" rx="11" ry="8" fill="#ffe8d6" />
    </svg>
  );
}

function PawIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="16.2" r="4.4" />
      <circle cx="5.8" cy="9.2" r="2.3" />
      <circle cx="10" cy="6.2" r="2.3" />
      <circle cx="14.2" cy="6.2" r="2.3" />
      <circle cx="18.2" cy="9.2" r="2.3" />
    </svg>
  );
}

function CatFaceIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="18" r="10" fill="#f2b88a" />
      <path d="M8 16 7 7l8 6" fill="#f2b88a" />
      <path d="M24 16 25 7l-8 6" fill="#f2b88a" />
      <path d="M9 14.5 8.2 9.5 13 13" fill="#f7c4c8" />
      <path d="M23 14.5 23.8 9.5 19 13" fill="#f7c4c8" />
      <path d="M12.2 18c1.4 2 3.2 2 3.8 0" stroke="#5c4a42" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M16 18c1.4 2 3.2 2 3.8 0" stroke="#5c4a42" strokeWidth="1.4" strokeLinecap="round" />
      <ellipse cx="16" cy="21" rx="1.5" ry="1.1" fill="#f4a09a" />
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
    audio.src = encodeURI(songs[currentIndex].src);
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
    <div className="min-h-screen bg-cream pb-40 font-sans text-ink">
      <audio ref={audioRef} preload="metadata" />

      <section className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#fff8f1_0%,#ffe8d8_42%,#f3e4f7_100%)]" />
        <div className="absolute -top-24 -left-16 w-80 h-80 rounded-full bg-peach/70 blur-3xl pointer-events-none" />
        <div className="absolute top-24 -right-20 w-96 h-96 rounded-full bg-lavender/60 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-1/4 w-72 h-72 rounded-full bg-pink/50 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-3xl">
          <div className="hero-enter-cat mb-6">
            <div className="cat-bob">
              <CatMascot className="w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64" />
            </div>
          </div>

          <h1 className="font-display text-6xl sm:text-7xl md:text-8xl font-bold tracking-tight mb-2 leading-[1.05]">
            <span className="text-coral">
              {t.headline.slice(0, 5).split("").map((letter, i) => (
                <span
                  key={`krish-${i}`}
                  className="headline-letter"
                  style={{ animationDelay: `${0.35 + i * 0.05}s` }}
                >
                  {letter}
                </span>
              ))}
            </span>
            <span className="text-[#e59aaa]">
              {t.headline.slice(5).split("").map((letter, i) => (
                <span
                  key={`builds-${i}`}
                  className="headline-letter"
                  style={{ animationDelay: `${0.6 + i * 0.05}s` }}
                >
                  {letter}
                </span>
              ))}
            </span>
          </h1>

          <p className="hero-enter mt-6 sm:mt-8 text-lg sm:text-xl text-muted font-normal tracking-wide">
            {t.tagline}
          </p>

          <div className="hero-enter-late mt-7 inline-flex rounded-full bg-white/70 border border-peach overflow-hidden shadow-sm">
            <button
              onClick={() => setLang("en")}
              className={`px-5 py-2 text-sm font-semibold cursor-pointer transition-colors ${
                lang === "en" ? "bg-coral text-white" : "text-muted hover:bg-peach/50"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLang("hi")}
              className={`px-5 py-2 text-sm font-semibold cursor-pointer transition-colors ${
                lang === "hi" ? "bg-coral text-white" : "text-muted hover:bg-peach/50"
              }`}
            >
              हिंदी
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            document.getElementById("songs")?.scrollIntoView({ behavior: "smooth" })
          }
          className="hero-enter-last absolute bottom-8 z-10 cursor-pointer bg-transparent border-0 p-0"
          aria-label="Scroll to songs"
        >
          <span className="scroll-hint-motion inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-display text-base font-semibold text-coral shadow-[0_10px_24px_rgba(244,168,154,0.35)] border border-peach/70">
            <PawIcon className="w-4 h-4 text-coral" />
            songs
          </span>
        </button>
      </section>

      <section id="songs" className="px-4 sm:px-8 py-12 scroll-mt-6">
        <div className="mb-8 flex items-center gap-2">
          <PawIcon className="w-5 h-5 text-coral" />
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink">
            Pick a Song
          </h2>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:overflow-x-visible">
          {songs.map((song, index) => {
            const isActive = index === currentIndex;
            const hasError = coverErrors[index];
            const tints = ["bg-white", "bg-peach/35", "bg-lavender/40", "bg-pink/30"];
            return (
              <button
                key={index}
                onClick={() => playSong(index)}
                className={`song-card group relative flex-shrink-0 w-44 sm:w-auto rounded-3xl p-3 text-left cursor-pointer border transition-shadow duration-300 ${
                  tints[index % tints.length]
                } ${
                  isActive
                    ? "border-coral shadow-lg shadow-coral/20"
                    : "border-peach/80 shadow-sm hover:shadow-md"
                }`}
              >
                <span className="absolute top-2 right-2 text-coral/50">
                  <PawIcon className="w-3.5 h-3.5" />
                </span>

                <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 bg-peach">
                  {hasError ? (
                    <div className="w-full h-full flex items-center justify-center bg-peach">
                      <CatFaceIcon className="w-14 h-14" />
                    </div>
                  ) : (
                    <img
                      src={encodeURI(song.cover)}
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
                    <div className="absolute inset-0 bg-ink/20 flex items-center justify-center">
                      <div className="flex items-end gap-[3px] h-5">
                        <span className="w-[3px] bg-white rounded-full animate-[bounce_0.6s_ease-in-out_infinite]" style={{ height: "60%" }} />
                        <span className="w-[3px] bg-white rounded-full animate-[bounce_0.6s_ease-in-out_0.15s_infinite]" style={{ height: "100%" }} />
                        <span className="w-[3px] bg-white rounded-full animate-[bounce_0.6s_ease-in-out_0.3s_infinite]" style={{ height: "40%" }} />
                        <span className="w-[3px] bg-white rounded-full animate-[bounce_0.6s_ease-in-out_0.45s_infinite]" style={{ height: "80%" }} />
                      </div>
                    </div>
                  )}
                </div>

                <h3 className="font-display font-semibold text-sm truncate text-ink">
                  {song.title}
                </h3>
                <p className="text-xs text-muted truncate mt-0.5">
                  {song.artist}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {currentSong && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] sm:w-[calc(100%-3rem)] max-w-5xl z-50">
          <div className="rounded-[2.5rem] bg-white/85 backdrop-blur-xl border border-peach shadow-[0_10px_30px_rgba(244,168,154,0.25)] px-4 py-3 sm:px-5 sm:py-3.5">
            <div className="flex items-center gap-3 sm:gap-5">
              <div className="w-[60px] h-[60px] rounded-full overflow-hidden flex-shrink-0 ring-2 ring-peach shadow-sm">
                {coverErrors[currentIndex] ? (
                  <div className="w-full h-full flex items-center justify-center bg-peach">
                    <CatFaceIcon className="w-8 h-8" />
                  </div>
                ) : (
                  <img
                    src={encodeURI(currentSong.cover)}
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

              <div className="min-w-0 flex-1">
                <p className="text-base sm:text-lg font-display font-semibold text-ink truncate leading-tight">
                  {currentSong.title}
                </p>
                <p className="text-xs sm:text-sm text-muted truncate leading-snug mt-0.5">
                  {currentSong.artist}
                </p>
              </div>

              <div className="flex flex-col items-center gap-1.5 flex-shrink-0 w-[42%] sm:w-56">
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={playPrev}
                    className="p-1 text-muted hover:text-ink transition-colors cursor-pointer"
                    aria-label="Previous"
                  >
                    <PrevIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    onClick={togglePlayPause}
                    className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-coral rounded-full text-white hover:bg-pink transition-colors cursor-pointer shadow-md shadow-coral/30"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <PauseIcon className="w-5 h-5" />
                    ) : (
                      <PlayIcon className="w-5 h-5 ml-0.5" />
                    )}
                  </button>
                  <button
                    onClick={playNext}
                    className="p-1 text-muted hover:text-ink transition-colors cursor-pointer"
                    aria-label="Next"
                  >
                    <NextIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-2 w-full">
                  <span className="text-[10px] text-muted tabular-nums w-7 text-right flex-shrink-0">
                    {formatTime(currentTime)}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    value={currentTime}
                    onChange={seek}
                    className="player-seek flex-1 min-w-0"
                    style={{
                      ["--progress" as string]: duration
                        ? `${(currentTime / duration) * 100}%`
                        : "0%",
                    }}
                  />
                  <span className="text-[10px] text-muted tabular-nums w-7 flex-shrink-0">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
