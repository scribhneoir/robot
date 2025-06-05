// Game types and interfaces
export interface Vector2 {
  x: number;
  y: number;
}

export interface Physics {
  velocity: Vector2;
  acceleration: number;
  friction: number;
  gravity: number;
  jumpPower: number;
  maxSpeed: number;
  onGround: boolean;
  chargeTime: number;
  maxChargeTime: number;
  isCharging: boolean;
}

export interface Energy {
  current: number;
  max: number;
  costs: {
    movement: number;
    charging: number;
  };
}

export interface GameConfig {
  screen: {
    width: number;
    height: number;
  };
  tileSize: number;
  enemyCollisionCooldown: number; // Cooldown in frames for enemy collisions
}

export type PlatformGrid = number[][];
