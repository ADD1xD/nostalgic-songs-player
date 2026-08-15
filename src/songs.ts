import { songs as generated, type Song as GeneratedSong } from "./songs.generated";
import { songMeta, MOODS, type Mood } from "./songs.meta";

export type { Mood };
export { MOODS };

export interface Song extends GeneratedSong {
  mood: Mood;
}

export const songs: Song[] = generated.map((song) => {
  const meta = songMeta[song.src];
  return {
    ...song,
    mood: meta?.mood ?? "Nostalgic",
  };
});
