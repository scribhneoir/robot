import { Graphics } from "pixi.js";
import { Vector2 } from "./types";
import { GAME_CONFIG, COLORS } from "./config";
import { PlatformSystem } from "./platform-system";

export interface EnemyPhysics {
  velocity: Vector2;
  direction: 1 | -1; // 1 for right, -1 for left
  speed: number;
  onGround: boolean;
}

export class Enemy {
  private graphics: Graphics;
  private position: Vector2;
  private physics: EnemyPhysics;
  private platformSystem: PlatformSystem;
  private size: number = 6; // Enemy size

  constructor(x: number, y: number, platformSystem: PlatformSystem) {
    this.position = { x, y };
    this.platformSystem = platformSystem;

    this.physics = {
      velocity: { x: 0, y: 0 },
      direction: Math.random() > 0.5 ? 1 : -1, // Random initial direction
      speed: 0.1, // Enemy movement speed
      onGround: false,
    };

    this.graphics = new Graphics();
    this.updateVisual();
  }

  getGraphics(): Graphics {
    return this.graphics;
  }

  getPosition(): Vector2 {
    return { ...this.position };
  }

  getPhysics(): EnemyPhysics {
    return { ...this.physics };
  }

  setPosition(x: number, y: number): void {
    this.position.x = x;
    this.position.y = y;
    this.graphics.x = x;
    this.graphics.y = y;
  }

  update(deltaTime: number): void {
    // Apply horizontal movement
    this.physics.velocity.x = this.physics.direction * this.physics.speed;

    // Apply gravity
    if (!this.physics.onGround) {
      this.physics.velocity.y += 0.3; // Gravity
    }

    // Update position
    this.position.x += this.physics.velocity.x * deltaTime;
    this.position.y += this.physics.velocity.y * deltaTime;

    // Check for edge detection and platform collisions
    this.checkEdgeDetection();
    this.checkPlatformCollisions();

    // Update visual position
    this.setPosition(this.position.x, this.position.y);
  }

  private checkEdgeDetection(): void {
    const { tileSize } = GAME_CONFIG;

    // Only check for edges when we're on the ground
    if (!this.physics.onGround) {
      return;
    }

    // Calculate the next position we would move to
    const nextX = this.position.x + this.physics.velocity.x * 2; // Look ahead a bit more

    // Check screen boundaries first
    if (nextX <= 0 || nextX + this.size >= GAME_CONFIG.screen.width) {
      this.physics.direction *= -1;
      return;
    }

    // Check the ground tile beneath where we would be
    let checkGridX: number;
    if (this.physics.direction === 1) {
      // Moving right - check the right edge of where we'll be
      checkGridX = Math.floor((nextX + this.size - 1) / tileSize);
    } else {
      // Moving left - check the left edge of where we'll be
      checkGridX = Math.floor(nextX / tileSize);
    }

    // Get the current ground level
    const currentGroundY = Math.floor((this.position.y + this.size) / tileSize);

    // Check if there's still ground beneath the next position
    const hasGroundAhead = this.platformSystem.isPlatformAt(
      checkGridX,
      currentGroundY
    );

    // Check if there's a wall ahead at the same level
    const hasWallAhead = this.platformSystem.isPlatformAt(
      checkGridX,
      currentGroundY - 1
    );

    // Special case: if we're on the screen bottom (ground level), don't fall off
    const isOnScreenBottom =
      this.position.y + this.size >= GAME_CONFIG.screen.height - 1;

    if (isOnScreenBottom) {
      // On screen bottom - only check for walls, not ground beneath
      if (hasWallAhead) {
        this.physics.direction *= -1;
      }
    } else {
      // On a platform - check for both ground ahead and walls
      if (!hasGroundAhead || hasWallAhead) {
        this.physics.direction *= -1;
      }
    }
  }

  private checkPlatformCollisions(): void {
    const { tileSize } = GAME_CONFIG;

    // Get grid positions
    const leftGridX = Math.floor(this.position.x / tileSize);
    const rightGridX = Math.floor((this.position.x + this.size - 1) / tileSize);
    const bottomGridY = Math.floor((this.position.y + this.size) / tileSize);

    // Check for platform collision (landing on top)
    if (this.physics.velocity.y > 0) {
      if (
        this.platformSystem.isPlatformAt(leftGridX, bottomGridY) ||
        this.platformSystem.isPlatformAt(rightGridX, bottomGridY)
      ) {
        const platformTop = bottomGridY * tileSize;
        if (
          this.position.y + this.size > platformTop &&
          this.position.y < platformTop
        ) {
          this.position.y = platformTop - this.size;
          this.physics.velocity.y = 0;
          this.physics.onGround = true;
        }
      }
    }

    // Ground collision (bottom of screen)
    const groundY = GAME_CONFIG.screen.height - this.size;
    if (this.position.y >= groundY) {
      this.position.y = groundY;
      this.physics.velocity.y = 0;
      this.physics.onGround = true;
    } else {
      // Check if enemy is still on ground
      const checkY = Math.floor((this.position.y + this.size + 1) / tileSize);
      const onPlatform =
        this.platformSystem.isPlatformAt(leftGridX, checkY) ||
        this.platformSystem.isPlatformAt(rightGridX, checkY);

      if (
        !onPlatform &&
        this.position.y + this.size < GAME_CONFIG.screen.height
      ) {
        this.physics.onGround = false;
      }
    }
  }

  private updateVisual(): void {
    this.graphics.clear();
    this.graphics.rect(0, 0, this.size, this.size);
    this.graphics.fill(COLORS.enemy);
  }

  // Check collision with player (for game over logic)
  checkCollisionWithPlayer(
    playerPos: Vector2,
    playerSize: number = 8
  ): boolean {
    return (
      this.position.x < playerPos.x + playerSize &&
      this.position.x + this.size > playerPos.x &&
      this.position.y < playerPos.y + playerSize &&
      this.position.y + this.size > playerPos.y
    );
  }
}
