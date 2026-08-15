import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { generateSongs } from "./scripts/generate-songs.mjs";

function songsFromPublic(): Plugin {
  let root = process.cwd();
  const run = () => generateSongs(root);

  return {
    name: "songs-from-public",
    configResolved(config) {
      root = config.root;
    },
    buildStart() {
      run();
    },
    configureServer(server) {
      run();
      const audio = path.resolve(root, "public/audio");
      const covers = path.resolve(root, "public/covers");
      server.watcher.add([audio, covers]);
      const refresh = (file: string) => {
        const f = file.replaceAll("\\", "/");
        if (
          f.includes("/public/audio") ||
          f.includes("/public/covers")
        ) {
          run();
        }
      };
      server.watcher.on("add", refresh);
      server.watcher.on("unlink", refresh);
      server.watcher.on("change", refresh);
    },
  };
}

export default defineConfig({
  plugins: [songsFromPublic(), react(), tailwindcss()],
});
