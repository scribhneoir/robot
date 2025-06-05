import { Container } from "pixi.js";
import { GAME_CONFIG } from "../config";
import { Enemy } from "../entities/enemy";
import type { Vector2 } from "../types";
import { type PlatformSystem, platformGrid } from "./platform.system";

export class EnemySystem {
  private enemies: Enemy[] = [];
  private container: Container;
  private platformSystem: PlatformSystem;

  constructor(platformSystem: PlatformSystem) {
    this.platformSystem = platformSystem;
    this.container = new Container();
    this.spawnEnemies();
  }

  private spawnEnemies(): void {
    const { tileSize } = GAME_CONFIG;

    // Look for enemy spawn markers (-2) in the platform grid
    for (let y = 0; y < platformGrid.length; y++) {
      for (let x = 0; x < platformGrid[y].length; x++) {
        if (platformGrid[y][x] === -2) {
          const spawnX = x * tileSize;
          const spawnY = y * tileSize;

          console.log(
            `Spawning enemy at (${spawnX}, ${spawnY}) at grid position (${x}, ${y})`,
          );
          const enemy = new Enemy(spawnX, spawnY, this.platformSystem);
          this.enemies.push(enemy);
          this.container.addChild(enemy.getGraphics());
        }
      }
    }
    console.log(`Total enemies spawned: ${this.enemies.length}`);
  }

  getContainer(): Container {
    return this.container;
  }

  update(deltaTime: number): void {
    for (const enemy of this.enemies) {
      enemy.update(deltaTime);
    }
  }

  checkPlayerCollisions(playerPos: Vector2, playerSize = 8): boolean {
    for (const enemy of this.enemies) {
      if (enemy.checkCollisionWithPlayer(playerPos, playerSize)) {
        return true;
      }
    }
    return false;
  }

  reset(): void {
    // Remove all enemies from container
    for (const enemy of this.enemies) {
      this.container.removeChild(enemy.getGraphics());
    }

    // Clear enemies array
    this.enemies = [];

    // Respawn enemies
    this.spawnEnemies();
  }

  getEnemies(): Enemy[] {
    return [...this.enemies];
  }

  removeEnemies(enemiesToRemove: Enemy[]): void {
    for (const enemyToRemove of enemiesToRemove) {
      const index = this.enemies.indexOf(enemyToRemove);
      if (index !== -1) {
        this.container.removeChild(enemyToRemove.getGraphics());
        this.enemies.splice(index, 1);
      }
    }
  }
}
