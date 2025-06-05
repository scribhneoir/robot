import { Container } from "pixi.js";
import { Bullet } from "./bullet";
import { Vector2 } from "./types";
import { Enemy } from "./enemy";

export class BulletSystem {
  private bullets: Bullet[] = [];
  private container: Container;

  constructor() {
    this.container = new Container();
  }

  getContainer(): Container {
    return this.container;
  }

  shoot(position: Vector2, direction: "left" | "right"): void {
    const bullet = new Bullet(position.x, position.y, direction);
    this.bullets.push(bullet);
    this.container.addChild(bullet.getGraphics());
  }

  update(deltaTime: number): void {
    // Update all bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.update(deltaTime);

      // Remove inactive bullets
      if (!bullet.isActive()) {
        this.container.removeChild(bullet.getGraphics());
        this.bullets.splice(i, 1);
      }
    }
  }

  checkEnemyCollisions(enemies: Enemy[]): Enemy[] {
    const hitEnemies: Enemy[] = [];

    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      if (!bullet.isActive()) continue;

      for (const enemy of enemies) {
        if (bullet.checkCollisionWithEnemy(enemy.getPosition(), 6)) {
          // Enemy size is 6
          // Mark bullet for removal
          bullet.destroy();
          this.container.removeChild(bullet.getGraphics());
          this.bullets.splice(i, 1);

          // Add enemy to hit list
          hitEnemies.push(enemy);
          break; // One bullet can only hit one enemy
        }
      }
    }

    return hitEnemies;
  }

  reset(): void {
    // Remove all bullets from container
    for (const bullet of this.bullets) {
      this.container.removeChild(bullet.getGraphics());
    }

    // Clear bullets array
    this.bullets = [];
  }

  getBullets(): Bullet[] {
    return [...this.bullets];
  }
}
