import { Graphics } from "pixi.js";
import { COLORS, ENERGY_CONFIG } from "../config";
import type { Energy } from "../types";

export class EnergySystem {
  private energy: Energy;
  private graphics: Graphics;

  constructor() {
    this.energy = {
      current: ENERGY_CONFIG.max,
      max: ENERGY_CONFIG.max,
      costs: { ...ENERGY_CONFIG.costs },
    };

    this.graphics = new Graphics();
    this.updateVisual();
  }

  getGraphics(): Graphics {
    return this.graphics;
  }

  getCurrent(): number {
    return this.energy.current;
  }

  getMax(): number {
    return this.energy.max;
  }

  consumeMovement(deltaTime: number): boolean {
    if (this.energy.current <= 0) return false;
    this.energy.current -= this.energy.costs.movement * deltaTime;
    this.clampEnergy();
    return true;
  }

  consumeCharging(deltaTime: number): boolean {
    if (this.energy.current <= 0) return false;
    this.energy.current -= this.energy.costs.charging * deltaTime;
    this.clampEnergy();
    return this.energy.current > 0;
  }

  consumeEnemyCollision(): boolean {
    if (this.energy.current <= 0) return false;
    this.energy.current -= ENERGY_CONFIG.costs.enemyCollision;
    this.clampEnergy();
    return this.energy.current > 0;
  }

  consumeShooting(): boolean {
    if (this.energy.current < ENERGY_CONFIG.costs.shooting) return false;
    this.energy.current -= ENERGY_CONFIG.costs.shooting;
    this.clampEnergy();
    return true;
  }

  reset(): void {
    this.energy.current = this.energy.max;
    this.updateVisual();
  }

  private clampEnergy(): void {
    this.energy.current = Math.max(
      0,
      Math.min(this.energy.max, this.energy.current),
    );
  }

  updateVisual(): void {
    this.graphics.clear();

    // Background (empty bar)
    const barWidth = 160 - 50;

    // Energy fill
    const fillWidth = (this.energy.current / this.energy.max) * barWidth;
    if (fillWidth > 0) {
      this.graphics.rect(5, 5, fillWidth, 8);

      // Color based on energy level
      let barColor = COLORS.energy.high;
      if (this.energy.current < 30) {
        barColor = COLORS.energy.low;
      } else if (this.energy.current < 60) {
        barColor = COLORS.energy.medium;
      }
      this.graphics.fill(barColor);
    }

    // Border
    this.graphics.rect(5, 5, barWidth, 8);
    this.graphics.stroke({ color: COLORS.energy.border, width: 1 });
  }
}
