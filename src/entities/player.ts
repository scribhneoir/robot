import { Graphics } from "pixi.js";
import { COLORS, PHYSICS_CONFIG } from "../config";
import type { Physics, Vector2 } from "../types";

export class Player {
  private graphics: Graphics;
  private position: Vector2;
  private physics: Physics;
  private spawnPosition: Vector2;
  private isBlinking = false;
  private facingDirection: "left" | "right" = "right"; // Track facing direction

  constructor(spawnX: number, spawnY: number) {
    this.spawnPosition = { x: spawnX, y: spawnY };
    this.position = { x: spawnX, y: spawnY };

    this.physics = {
      velocity: { x: 0, y: 0 },
      acceleration: PHYSICS_CONFIG.acceleration,
      friction: PHYSICS_CONFIG.friction,
      gravity: PHYSICS_CONFIG.gravity,
      jumpPower: PHYSICS_CONFIG.jumpPower,
      maxSpeed: PHYSICS_CONFIG.maxSpeed,
      onGround: false,
      chargeTime: 0,
      maxChargeTime: PHYSICS_CONFIG.maxChargeTime,
      isCharging: false,
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

  getPhysics(): Physics {
    return { ...this.physics };
  }

  getFacingDirection(): "left" | "right" {
    return this.facingDirection;
  }

  getBulletSpawnPosition(): Vector2 {
    // Spawn bullet from the center-front of the player
    const offset = this.facingDirection === "right" ? 8 : -2;
    return {
      x: this.position.x + offset,
      y: this.position.y + 4, // Center vertically
    };
  }

  setPosition(x: number, y: number): void {
    this.position.x = x;
    this.position.y = y;
    this.graphics.x = x;
    this.graphics.y = y;
  }

  updatePhysics(deltaTime: number): void {
    // Apply friction to horizontal movement
    this.physics.velocity.x *= this.physics.friction;

    // Apply gravity
    this.physics.velocity.y += this.physics.gravity * deltaTime;

    // Limit maximum speed
    this.physics.velocity.x = Math.max(
      -this.physics.maxSpeed,
      Math.min(this.physics.maxSpeed, this.physics.velocity.x),
    );
    this.physics.velocity.y = Math.max(
      PHYSICS_CONFIG.maxUpwardVelocity,
      Math.min(PHYSICS_CONFIG.maxDownwardVelocity, this.physics.velocity.y),
    );

    // Update position based on velocity
    this.position.x += this.physics.velocity.x * deltaTime;
    this.position.y += this.physics.velocity.y * deltaTime;

    // Update graphics position
    this.graphics.x = this.position.x;
    this.graphics.y = this.position.y;
  }

  move(direction: "left" | "right", deltaTime: number): void {
    const acceleration =
      direction === "left"
        ? -this.physics.acceleration
        : this.physics.acceleration;
    this.physics.velocity.x += acceleration * deltaTime;
    this.facingDirection = direction; // Update facing direction
  }

  startCharging(deltaTime: number): void {
    if (this.physics.onGround) {
      this.physics.isCharging = true;
      this.physics.chargeTime = Math.min(
        this.physics.chargeTime + deltaTime,
        this.physics.maxChargeTime,
      );
    }
  }

  releaseJump(): void {
    if (this.physics.isCharging && this.physics.onGround) {
      const chargeRatio = this.physics.chargeTime / this.physics.maxChargeTime;
      const jumpMultiplier = 1 + chargeRatio * 2; // 1x to 3x jump power
      this.physics.velocity.y = this.physics.jumpPower * jumpMultiplier;
      this.physics.onGround = false;
      this.physics.isCharging = false;
      this.physics.chargeTime = 0;
    }
  }

  stopCharging(): void {
    this.physics.isCharging = false;
    this.physics.chargeTime = 0;
  }

  isFullyCharged(): boolean {
    return (
      this.physics.isCharging &&
      this.physics.chargeTime === this.physics.maxChargeTime
    );
  }

  setOnGround(onGround: boolean): void {
    this.physics.onGround = onGround;
    if (!onGround) {
      this.physics.isCharging = false;
      this.physics.chargeTime = 0;
    }
  }

  setVelocity(x: number, y: number): void {
    this.physics.velocity.x = x;
    this.physics.velocity.y = y;
  }

  setBlinking(isBlinking: boolean): void {
    this.isBlinking = isBlinking;
  }

  reset(): void {
    this.position = { ...this.spawnPosition };
    this.physics.velocity = { x: 0, y: 0 };
    this.physics.onGround = false;
    this.physics.chargeTime = 0;
    this.physics.isCharging = false;
    this.isBlinking = false;
    this.setPosition(this.spawnPosition.x, this.spawnPosition.y);
    this.updateVisual();
  }

  updateVisual(): void {
    const chargeRatio = this.physics.chargeTime / this.physics.maxChargeTime;

    this.graphics.clear();

    if (this.physics.isCharging) {
      // Squash effect: make wider and shorter
      const squashAmount = chargeRatio * 0.5;
      const width = 8 + 8 * squashAmount;
      const height = 8 - 8 * squashAmount;
      this.graphics.rect(-squashAmount * 4, squashAmount * 8, width, height);
    } else {
      // Normal shape
      this.graphics.rect(0, 0, 8, 8);
    }

    // Color changes based on charge level
    let color = COLORS.player.normal;
    if (chargeRatio > 0.3) {
      color = COLORS.player.charging;
    }
    if (chargeRatio > 0.7) {
      color = COLORS.player.maxCharge;
    }

    this.graphics.fill(color);

    // Apply blinking effect by changing alpha
    if (this.isBlinking) {
      // Use sin wave to create smooth blinking effect
      const blinkFrequency = 8; // Blinks per second
      const time = Date.now() / 1000; // Current time in seconds
      const alpha =
        0.3 + (0.7 * (Math.sin(time * Math.PI * blinkFrequency) + 1)) / 2;
      this.graphics.alpha = alpha;
    } else {
      this.graphics.alpha = 1.0;
    }
  }
}
