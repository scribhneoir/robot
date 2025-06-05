import { Container } from "pixi.js";
import type { Enemy } from "../entities/enemy";
import { BlasterTool } from "../tools/blaster.tool";
import { NoneTool } from "../tools/none.tool";
import type { Vector2 } from "../types";

export const ToolType = {
  Blaster: "blaster",
  None: "none",
} as const;
export type ToolType = (typeof ToolType)[keyof typeof ToolType];

export interface ToolConfig {
  jButton: ToolType;
  kButton: ToolType;
}

export interface Tool {
  name: ToolType;
  use(position: Vector2, direction: "left" | "right"): boolean;
  update(deltaTime: number): void;
  checkEnemyCollisions(enemies: Enemy[]): Enemy[];
  reset(): void;
  getContainer(): Container;
  getCooldown(): number;
  setCooldown(cooldown: number): void;
}

export class ToolSystem {
  private tools: Map<ToolType, Tool> = new Map();
  private config: ToolConfig;
  private container: Container;

  constructor(config: ToolConfig = { jButton: "blaster", kButton: "none" }) {
    this.config = config;
    this.container = new Container();
    this.initializeTools();
  }

  private initializeTools(): void {
    // Register available tools
    this.tools.set("blaster", new BlasterTool());
    this.tools.set("none", new NoneTool());

    // Add tool containers to main container
    for (const tool of this.tools.values()) {
      this.container.addChild(tool.getContainer());
    }
  }

  getContainer(): Container {
    return this.container;
  }

  getConfig(): ToolConfig {
    return { ...this.config };
  }

  setConfig(config: ToolConfig): void {
    this.config = config;
  }

  useJTool(position: Vector2, direction: "left" | "right"): boolean {
    const tool = this.tools.get(this.config.jButton);
    if (!tool || tool.getCooldown() > 0) return false;
    return tool.use(position, direction);
  }

  useKTool(position: Vector2, direction: "left" | "right"): boolean {
    const tool = this.tools.get(this.config.kButton);
    if (!tool || tool.getCooldown() > 0) return false;
    return tool.use(position, direction);
  }

  update(deltaTime: number): void {
    for (const tool of this.tools.values()) {
      tool.update(deltaTime);
    }
  }

  checkEnemyCollisions(enemies: Enemy[]): Enemy[] {
    const hitEnemies: Enemy[] = [];

    for (const tool of this.tools.values()) {
      const toolHits = tool.checkEnemyCollisions(enemies);
      hitEnemies.push(...toolHits);
    }

    return hitEnemies;
  }

  reset(): void {
    for (const tool of this.tools.values()) {
      tool.reset();
    }
  }

  getJToolName(): ToolType {
    const tool = this.tools.get(this.config.jButton);
    return tool?.name || ToolType.None;
  }

  getKToolName(): ToolType {
    const tool = this.tools.get(this.config.kButton);
    return tool?.name || ToolType.None;
  }

  getToolConfigDisplay(): string {
    return `J: ${this.getJToolName()} | K: ${this.getKToolName()}`;
  }
}
