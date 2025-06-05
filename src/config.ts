import { GameConfig } from "./types";

export const GAME_CONFIG: GameConfig = {
  screen: {
    width: 160,
    height: 144,
  },
  tileSize: 8,
};

export const PHYSICS_CONFIG = {
  acceleration: 0.5,
  friction: 0.85,
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
  },
};

export const COLORS = {
  background: 0x000000,
  player: {
    normal: 0xff0000,
    charging: 0xffff00,
    maxCharge: 0xffffff,
  },
  platform: 0x00ff00,
  energy: {
    high: 0x00ff00,
    medium: 0xffff00,
    low: 0xff0000,
    background: 0x333333,
    border: 0xffffff,
  },
};
