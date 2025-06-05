import { Application } from "pixi.js";
import { COLORS, GAME_CONFIG } from "./config";
import { Player } from "./entities/player";
import { InputManager } from "./input.manager";
import { Renderer } from "./renderer";
import { CollisionSystem } from "./systems/collision.system";
import { EnemySystem } from "./systems/enemy.system";
import { EnergySystem } from "./systems/energy.system";
import { PlatformSystem, platformGrid } from "./systems/platform.system";
import { ToolSystem } from "./systems/tool.system";

export class Game {
  private app: Application;
  private player: Player;
  private platformSystem: PlatformSystem;
  private energySystem: EnergySystem;
  private enemySystem: EnemySystem;
  private toolSystem: ToolSystem;
  private collisionSystem: CollisionSystem;
  private inputManager: InputManager;
  private renderer: Renderer;
  private enemyCollisionCooldown = 0; // Cooldown timer for enemy collisions
  private toolConfigElement: HTMLElement | null = null;

  constructor() {
    this.app = new Application();
    this.platformSystem = new PlatformSystem(platformGrid);
    this.renderer = new Renderer();
    this.inputManager = new InputManager();

    // Find spawn position and create player
    const spawnPos = this.platformSystem.findSpawnPosition();
    this.player = new Player(spawnPos.x, spawnPos.y);

    this.energySystem = new EnergySystem();
    this.enemySystem = new EnemySystem(this.platformSystem);
    this.collisionSystem = new CollisionSystem(this.platformSystem);
    this.toolSystem = new ToolSystem();
  }

  async init(): Promise<void> {
    // Initialize the application
    await this.app.init({
      background: COLORS.background,
      width: GAME_CONFIG.screen.width,
      height: GAME_CONFIG.screen.height,
      resolution: 1,
      autoDensity: false,
    });
    this.app.ticker.maxFPS = 30; // Set max FPS to 60

    // Setup DOM
    const container = document.getElementById("pixi-container");
    if (!container) {
      throw new Error("pixi-container element not found");
    }
    container.appendChild(this.app.canvas);

    // Setup scaling
    const setupScaling = this.renderer.setupIntegerScaling(this.app.canvas);
    window.addEventListener("resize", setupScaling);

    // Add graphics to stage
    this.app.stage.addChild(this.player.getGraphics());
    this.app.stage.addChild(this.renderer.getPlatformsContainer());
    this.app.stage.addChild(this.energySystem.getGraphics());
    this.app.stage.addChild(this.enemySystem.getContainer());
    this.app.stage.addChild(this.toolSystem.getContainer());

    // Render platforms
    this.renderer.renderPlatforms(this.platformSystem);

    // Setup input handlers
    this.setupInputHandlers();

    // Setup tool configuration display
    this.setupToolConfigDisplay();

    // Start game loop
    this.app.ticker.add((time) => this.gameLoop(time));
  }

  private setupInputHandlers(): void {
    // Reset game on Enter key
    this.inputManager.onKeyDown("Enter", () => this.resetGame());

    // Tool configuration shortcuts
    this.inputManager.onKeyDown("Digit1", () => {
      const config = this.toolSystem.getConfig();
      config.jButton = "blaster";
      this.toolSystem.setConfig(config);
      this.updateToolConfigDisplay();
    });

    this.inputManager.onKeyDown("Digit2", () => {
      const config = this.toolSystem.getConfig();
      config.jButton = "none";
      this.toolSystem.setConfig(config);
      this.updateToolConfigDisplay();
    });

    this.inputManager.onKeyDown("Digit3", () => {
      const config = this.toolSystem.getConfig();
      config.kButton = "blaster";
      this.toolSystem.setConfig(config);
      this.updateToolConfigDisplay();
    });

    this.inputManager.onKeyDown("Digit4", () => {
      const config = this.toolSystem.getConfig();
      config.kButton = "none";
      this.toolSystem.setConfig(config);
      this.updateToolConfigDisplay();
    });
  }

  private setupToolConfigDisplay(): void {
    this.toolConfigElement = document.createElement("div");
    this.toolConfigElement.id = "tool-config";
    this.toolConfigElement.style.cssText = `
      position: absolute;
      top: 10px;
      left: 10px;
      color: white;
      font-family: monospace;
      font-size: 12px;
      background: rgba(0, 0, 0, 0.5);
      padding: 5px 10px;
      border-radius: 3px;
      z-index: 1000;
    `;
    this.updateToolConfigDisplay();
    document.body.appendChild(this.toolConfigElement);
  }

  private updateToolConfigDisplay(): void {
    if (this.toolConfigElement) {
      this.toolConfigElement.textContent =
        this.toolSystem.getToolConfigDisplay();
    }
  }

  private gameLoop(time: { deltaTime: number }): void {
    const deltaTime = time.deltaTime;
    let isMoving = false;

    // Handle movement input
    if (
      this.inputManager.isMovingLeft() &&
      this.energySystem.getCurrent() > 0
    ) {
      this.player.move("left", deltaTime);
      isMoving = true;
    }
    if (
      this.inputManager.isMovingRight() &&
      this.energySystem.getCurrent() > 0
    ) {
      this.player.move("right", deltaTime);
      isMoving = true;
    }

    // Handle charging input
    const physics = this.player.getPhysics();
    if (
      this.inputManager.isCharging() &&
      physics.onGround &&
      this.energySystem.getCurrent() > 0
    ) {
      this.player.startCharging(deltaTime);
      if (!this.player.isFullyCharged()) {
        this.energySystem.consumeCharging(deltaTime);
      }
      if (this.energySystem.getCurrent() === 0) {
        this.player.stopCharging();
      }
    } else if (physics.isCharging && physics.onGround) {
      // Release jump
      this.player.releaseJump();
    } else if (physics.isCharging && this.energySystem.getCurrent() <= 0) {
      // Stop charging if out of energy
      this.player.stopCharging();
    }

    // Handle tool input (J and K buttons)
    if (
      this.inputManager.isJToolPressed() &&
      this.energySystem.getCurrent() > 0
    ) {
      const toolPos = this.player.getBulletSpawnPosition();
      const direction = this.player.getFacingDirection();
      if (this.toolSystem.useJTool(toolPos, direction)) {
        this.energySystem.consumeTool(this.toolSystem.getJToolName());
      }
    }

    if (
      this.inputManager.isKToolPressed() &&
      this.energySystem.getCurrent() > 0
    ) {
      const toolPos = this.player.getBulletSpawnPosition();
      const direction = this.player.getFacingDirection();
      if (this.toolSystem.useKTool(toolPos, direction)) {
        this.energySystem.consumeTool(this.toolSystem.getKToolName());
      }
    }

    // Consume energy for movement
    if (isMoving && Math.abs(physics.velocity.x) > 0.1) {
      this.energySystem.consumeMovement(deltaTime);
    }

    // Update systems
    this.player.updatePhysics(deltaTime);
    this.collisionSystem.checkCollisions(this.player);
    this.enemySystem.update(deltaTime);
    this.toolSystem.update(deltaTime);

    // Check tool-enemy collisions
    const hitEnemies = this.toolSystem.checkEnemyCollisions(
      this.enemySystem.getEnemies(),
    );
    if (hitEnemies.length > 0) {
      this.enemySystem.removeEnemies(hitEnemies);
    }

    // Update enemy collision cooldown
    if (this.enemyCollisionCooldown > 0) {
      this.enemyCollisionCooldown -= deltaTime; // Approximate milliseconds per frame
    }

    // Set player blinking state based on cooldown
    this.player.setBlinking(this.enemyCollisionCooldown > 0);

    // Check player-enemy collisions
    if (this.enemySystem.checkPlayerCollisions(this.player.getPosition())) {
      if (this.enemyCollisionCooldown <= 0) {
        if (this.energySystem.consumeEnemyCollision()) {
          // Energy consumed successfully, set cooldown to prevent rapid energy loss
          this.enemyCollisionCooldown = GAME_CONFIG.enemyCollisionCooldown; // Cooldown in frames (about 1 second at 60fps)
        } else {
          // No energy left, reset the game
          this.resetGame();
        }
      }
    }

    this.player.updateVisual();
    this.energySystem.updateVisual();
  }

  private resetGame(): void {
    this.player.reset();
    this.energySystem.reset();
    this.enemySystem.reset();
    this.toolSystem.reset();
    this.enemyCollisionCooldown = 0; // Reset cooldown timer
  }

  getApp(): Application {
    return this.app;
  }
}
