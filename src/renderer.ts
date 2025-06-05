import { Graphics } from "pixi.js";
import { PlatformSystem } from "./platform-system";
import { GAME_CONFIG, COLORS } from "./config";

export class Renderer {
  private platformsContainer: Graphics;

  constructor() {
    this.platformsContainer = new Graphics();
  }

  getPlatformsContainer(): Graphics {
    return this.platformsContainer;
  }

  renderPlatforms(platformSystem: PlatformSystem): void {
    const grid = platformSystem.getGrid();
    const { tileSize } = GAME_CONFIG;

    this.platformsContainer.clear();

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[0].length; x++) {
        if (grid[y][x] === 1) {
          this.platformsContainer.rect(
            x * tileSize,
            y * tileSize,
            tileSize,
            tileSize
          );
          this.platformsContainer.fill(COLORS.platform);
        }
      }
    }
  }

  setupIntegerScaling(canvas: HTMLCanvasElement): () => void {
    const setupScaling = () => {
      const scaleX = Math.floor(window.innerWidth / GAME_CONFIG.screen.width);
      const scaleY = Math.floor(window.innerHeight / GAME_CONFIG.screen.height);
      const scale = Math.max(1, Math.min(scaleX, scaleY));

      canvas.style.transform = `scale(${scale})`;
      canvas.style.width = `${GAME_CONFIG.screen.width}px`;
      canvas.style.height = `${GAME_CONFIG.screen.height}px`;
    };

    // Apply initial scaling
    setupScaling();

    // Return the scaling function for resize events
    return setupScaling;
  }
}
