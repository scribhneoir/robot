import { Container } from "pixi.js";
import type { Enemy } from "../entities/enemy";
import { type Tool, ToolType } from "../systems/tool.system";
import type { Vector2 } from "../types";

export class NoneTool implements Tool {
  public readonly name = ToolType.None;
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

  use(_position: Vector2, _direction: "left" | "right"): boolean {
    // No-op tool does nothing
    return false;
  }

  update(deltaTime: number): void {
    // Update cooldown
    if (this.cooldown > 0) {
      this.cooldown -= deltaTime;
    }
  }

  checkEnemyCollisions(_enemies: Enemy[]): Enemy[] {
    // No-op tool has no collisions
    return [];
  }

  reset(): void {
    this.cooldown = 0;
  }
}
