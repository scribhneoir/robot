import { Graphics } from "pixi.js";
import { COLORS, GAME_CONFIG } from "../config";
import type { Vector2 } from "../types";

export interface BulletPhysics {
  velocity: Vector2;
  speed: number;
}

export class Bullet {
  private graphics: Graphics;
  private position: Vector2;
  private physics: BulletPhysics;
  private size = 2;
  private active = true;

  constructor(x: number, y: number, direction: "left" | "right") {
    this.position = { x, y };

    this.physics = {
      velocity: { x: 0, y: 0 },
      speed: 3, // Bullet speed
    };

    // Set velocity based on direction
    this.physics.velocity.x =
      direction === "right" ? this.physics.speed : -this.physics.speed;
    this.physics.velocity.y = 0;

    this.graphics = new Graphics();
    this.updateVisual();
  }

  getGraphics(): Graphics {
    return this.graphics;
  }

  getPosition(): Vector2 {
    return { ...this.position };
  }

  getSize(): number {
    return this.size;
  }

  isActive(): boolean {
    return this.active;
  }

  destroy(): void {
    this.active = false;
  }

  update(deltaTime: number): void {
    if (!this.active) return;

    // Update position
    this.position.x += this.physics.velocity.x * deltaTime;
    this.position.y += this.physics.velocity.y * deltaTime;

    // Check screen boundaries
    if (
      this.position.x < -this.size ||
      this.position.x > GAME_CONFIG.screen.width ||
      this.position.y < -this.size ||
      this.position.y > GAME_CONFIG.screen.height
    ) {
      this.destroy();
    }

    // Update visual position
    this.graphics.x = this.position.x;
    this.graphics.y = this.position.y;
  }

  private updateVisual(): void {
    this.graphics.clear();
    this.graphics.rect(0, 0, this.size, this.size);
    this.graphics.fill(COLORS.bullet);
  }

  // Check collision with enemy
  checkCollisionWithEnemy(enemyPos: Vector2, enemySize: number): boolean {
    return (
      this.position.x < enemyPos.x + enemySize &&
      this.position.x + this.size > enemyPos.x &&
      this.position.y < enemyPos.y + enemySize &&
      this.position.y + this.size > enemyPos.y
    );
  }
}
