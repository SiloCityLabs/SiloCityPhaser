"use client";

import { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import { EventBus } from "@/game/EventBus";
import Phaser from "phaser";

export interface IRefPhaserGame {
  game: Phaser.Game | null;
  scene: Phaser.Scene | null;
}

interface IProps {
  currentActiveScene?: (scene_instance: Phaser.Scene) => void;
}

const PhaserGame = forwardRef<IRefPhaserGame, IProps>(function PhaserGame(
  { currentActiveScene },
  ref
) {
  const game = useRef<Phaser.Game | null>(null);
  const hasInitialized = useRef(false); // Add ref to prevent double initialization on StrictMode

  useLayoutEffect(() => {
    // Prevent re-initialization during development (React StrictMode mounts twice)
    if (game.current === null && !hasInitialized.current) {
      hasInitialized.current = true; // Mark as initialized

      // Dynamically import StartGame *only* on the client-side inside the hook
      import("@/game/main")
        .then((mainModule) => {
          // Check if StartGame is the default export or a named export in main.ts
          const StartGame = mainModule.default;

          // Ensure the component hasn't been unmounted while importing
          if (hasInitialized.current) {
            game.current = StartGame("game-container");

            if (typeof ref === "function") {
              ref({ game: game.current, scene: null });
            } else if (ref) {
              ref.current = { game: game.current, scene: null };
            }
          }
        })
        .catch((error) => {
          console.error("Failed to load StartGame dynamically:", error);
        });
    }

    // Cleanup function still runs normally
    return () => {
      // Only destroy if it was successfully created
      if (game.current) {
        game.current.destroy(true);
        game.current = null;
      }
      // Reset initialization flag on full unmount
      // Note: In StrictMode, this cleanup runs, then mounts again.
      // The hasInitialized ref prevents re-creating the game on the second mount.
      // If the component *truly* unmounts, hasInitialized should be reset conceptually,
      // but React handles creating a new component instance anyway.
    };
  }, [ref]); // Dependency array remains the same

  useEffect(() => {
    // --- EventBus logic remains the same ---
    const handleSceneReady = (scene_instance: Phaser.Scene) => {
      if (currentActiveScene && typeof currentActiveScene === "function") {
        currentActiveScene(scene_instance);
      }
      // Ensure ref.current exists before assigning, especially with dynamic loading
      if (typeof ref === "function") {
        ref({ game: game.current, scene: scene_instance });
      } else if (ref?.current) {
        ref.current = { game: game.current, scene: scene_instance };
      }
    };

    EventBus.on("current-scene-ready", handleSceneReady);
    return () => {
      EventBus.removeListener("current-scene-ready", handleSceneReady);
    };
  }, [currentActiveScene, ref]);

  return <div id="game-container"></div>;
});

PhaserGame.displayName = "PhaserGame";
export default PhaserGame;
