import type { GameConfig } from "./types";

export const GAME_CONFIG: GameConfig = {
  screen: {
    width: 160,
    height: 144,
  },
  tileSize: 8,
  enemyCollisionCooldown: 60, // Cooldown in frames for enemy collisions
};

export const PHYSICS_CONFIG = {
  acceleration: 0.5,
  friction: 0.5,
  gravity: 0.3,
  jumpPower: -2,
  maxSpeed: 2,
  maxChargeTime: 60,
  maxUpwardVelocity: -15,
  maxDownwardVelocity: 10,
};

export const ENERGY_CONFIG = {
  max: 100,
  costs: {
    movement: 0.05,
    charging: 0.1,
    enemyCollision: 10,
    shooting: 5, // Energy cost per bullet
  },
};

export const COLORS = {
  background: 0x222222,
  player: {
    normal: 0xff0000,
    charging: 0xffff00,
    maxCharge: 0xffffff,
  },
  platform: 0x00ff00,
  enemy: 0xff8800, // Orange color for enemies
  bullet: 0x00ffff, // Cyan color for bullets
  energy: {
    high: 0x00ff00,
    medium: 0xffff00,
    low: 0xff0000,
    background: 0x333333,
    border: 0xffffff,
  },
};
