import { Container } from "pixi.js";
import { Bullet } from "../entities/bullet";
import type { Enemy } from "../entities/enemy";
import { type Tool, ToolType } from "../systems/tool.system";
import type { Vector2 } from "../types";

export class BlasterTool implements Tool {
  public readonly name = ToolType.Blaster;
  private bullets: Bullet[] = [];
  private container: Container;
  private cooldown = 0;

  constructor() {
    this.container = new Container();
  }

  getContainer(): Container {
    return this.container;
  }

  getCooldown(): number {
    return this.cooldown;
  }

  setCooldown(cooldown: number): void {
    this.cooldown = cooldown;
  }

  use(position: Vector2, direction: "left" | "right"): boolean {
    if (this.cooldown > 0) return false;

    const bullet = new Bullet(position.x, position.y, direction);
    this.bullets.push(bullet);
    this.container.addChild(bullet.getGraphics());
    this.cooldown = 10; // Shooting cooldown in frames

    return true;
  }

  update(deltaTime: number): void {
    // Update cooldown
    if (this.cooldown > 0) {
      this.cooldown -= deltaTime;
    }

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
    this.cooldown = 0;
  }

  getBullets(): Bullet[] {
    return [...this.bullets];
  }
}
