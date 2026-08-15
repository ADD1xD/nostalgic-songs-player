export const MOODS = ["Nostalgic", "Happy", "Sad", "Energetic"] as const;
export type Mood = (typeof MOODS)[number];

export interface SongMeta {
  mood: Mood;
}

/** Mood tags persist when audio files are regenerated. */
export const songMeta: Record<string, SongMeta> = {
  "/audio/Bayaan & Sherazam - Safar.mp3": { mood: "Nostalgic" },
  "/audio/Blackbear - hot girl bummer  sped up  lyrics.mp3": { mood: "Sad" },
  "/audio/Ed Sheeran - Perfect.mp3": { mood: "Happy" },
  "/audio/Glass Animals - Heat Waves (Official Video).mp3": { mood: "Nostalgic" },
  "/audio/Gym Class Heroes_ Stereo Hearts ft. Adam Levine [OFFICIAL VIDEO].mp3": {
    mood: "Energetic",
  },
  "/audio/HALKA HALKA Full Audio Song  Rahat Fateh Ali Khan Feat. Ayushmann Khurrana & Amy Jackson  T-Series.mp3": {
    mood: "Happy",
  },
  "/audio/Kabira Encore - Yeh Jawaani Hai Deewani  Ranbir Kapoor, Deepika Padukone.mp3": {
    mood: "Sad",
  },
  "/audio/Kabira Full Song Yeh Jawaani Hai Deewani  Pritam  Ranbir Kapoor, Deepika Padukone.mp3": {
    mood: "Nostalgic",
  },
  "/audio/One Direction - Night Changes.mp3": { mood: "Nostalgic" },
  "/audio/Rain (Long Version).mp3": { mood: "Sad" },
  "/audio/Ricky Montgomery - Line Without a Hook (Official Lyric Video).mp3": {
    mood: "Sad",
  },
  "/audio/Rough Days.mp3": { mood: "Sad" },
  "/audio/She & Him - I Thought I Saw Your Face Today (Official Lyric Video).mp3": {
    mood: "Nostalgic",
  },
  "/audio/SugarCrash!.mp3": { mood: "Energetic" },
};
