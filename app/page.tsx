// app/page.tsx

"use client"; // <--- Make this a Client Component

import { useState, useRef } from "react";
import { Container, Row, Col, Button } from "react-bootstrap"; // Using Bootstrap components

// --- Layout ---
import PageLayout from "@/components/PageLayout";

// --- Phaser Game Component & Types ---
// Use default import for PhaserGame now
import PhaserGame, { IRefPhaserGame } from "@/components/PhaserGame";
import * as Phaser from "phaser"; // Import Phaser if needed for types or static methods
import { MainMenu } from "@/game/scenes/MainMenu"; // Import specific scene type

export default function HomePage() {
  const [canMoveSprite, setCanMoveSprite] = useState(true);
  const phaserRef = useRef<IRefPhaserGame | null>(null);
  const [spritePosition, setSpritePosition] = useState({ x: 0, y: 0 });

  const changeScene = () => {
    if (phaserRef.current) {
      // Cast scene to specific type to access custom methods
      const scene = phaserRef.current.scene as MainMenu;
      if (scene) {
        scene.changeScene();
      }
    }
  };

  const moveSprite = () => {
    if (phaserRef.current) {
      const scene = phaserRef.current.scene as MainMenu;
      // Check if it's the correct scene and the method exists
      if (
        scene &&
        scene.scene.key === "MainMenu" &&
        typeof scene.moveLogo === "function"
      ) {
        scene.moveLogo(({ x, y }) => {
          setSpritePosition({ x, y });
        });
      }
    }
  };

  const addSprite = () => {
    if (phaserRef.current) {
      const scene = phaserRef.current.scene;
      if (scene) {
        const x = Phaser.Math.Between(64, scene.scale.width - 64);
        const y = Phaser.Math.Between(64, scene.scale.height - 64);
        const star = scene.add.sprite(x, y, "star");
        scene.add.tween({
          targets: star,
          duration: 500 + Math.random() * 1000,
          alpha: 0,
          yoyo: true,
          repeat: -1,
        });
      }
    }
  };

  // Event handler for scene changes from PhaserGame component
  const currentScene = (scene: Phaser.Scene) => {
    setCanMoveSprite(scene.scene.key !== "MainMenu");
  };

  return (
    <PageLayout>
      <Container className="mt-3 mb-3 text-center">
        <h3 className="my-3">SiloCityPhaser Interactive</h3>
        {/* Phaser Game Component */}
        <Row className="justify-content-center mb-3">
          <Col md={10} lg={10}>
            <div
              className="phaser-game-container"
              style={{
                aspectRatio: "16 / 9",
                /* Or set fixed height/width */ border: "1px solid #ccc",
              }}
            >
              <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
            </div>
          </Col>
        </Row>
        {/* UI Controls moved from src/App.tsx */}
        <Row className="justify-content-center gy-2">
          {" "}
          {/* Added gy-2 for vertical gap */}
          <Col xs="auto">
            <Button variant="primary" onClick={changeScene}>
              Change Scene
            </Button>
          </Col>
          <Col xs="auto">
            <Button
              variant="secondary"
              disabled={!canMoveSprite}
              onClick={moveSprite}
            >
              Toggle Movement
            </Button>
          </Col>
          <Col xs="auto">
            <Button variant="info" onClick={addSprite}>
              Add New Sprite
            </Button>
          </Col>
        </Row>
        {/* Display Sprite Position */}
        <Row className="justify-content-center mt-3">
          <Col md={6}>
            <div className="spritePosition bg-light p-2 rounded border">
              <strong>Sprite Position:</strong>
              <pre className="mb-0">{`{\n  x: ${spritePosition.x}\n  y: ${spritePosition.y}\n}`}</pre>
            </div>
          </Col>
        </Row>
      </Container>
    </PageLayout>
  );
}
