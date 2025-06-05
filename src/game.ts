import { Application } from "pixi.js";
import { Player } from "./player";
import { PlatformSystem, platformGrid } from "./platform-system";
import { EnergySystem } from "./energy-system";
import { EnemySystem } from "./enemy-system";
import { CollisionSystem } from "./collision-system";
import { InputManager } from "./input-manager";
import { Renderer } from "./renderer";
import { GAME_CONFIG, COLORS } from "./config";

export class Game {
  private app: Application;
  private player: Player;
  private platformSystem: PlatformSystem;
  private energySystem: EnergySystem;
  private enemySystem: EnemySystem;
  private collisionSystem: CollisionSystem;
  private inputManager: InputManager;
  private renderer: Renderer;
  private enemyCollisionCooldown: number = 0; // Cooldown timer for enemy collisions

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

    // Setup DOM
    const container = document.getElementById("pixi-container")!;
    container.appendChild(this.app.canvas);

    // Setup scaling
    const setupScaling = this.renderer.setupIntegerScaling(this.app.canvas);
    window.addEventListener("resize", setupScaling);

    // Add graphics to stage
    this.app.stage.addChild(this.player.getGraphics());
    this.app.stage.addChild(this.renderer.getPlatformsContainer());
    this.app.stage.addChild(this.energySystem.getGraphics());
    this.app.stage.addChild(this.enemySystem.getContainer());

    // Render platforms
    this.renderer.renderPlatforms(this.platformSystem);

    // Setup input handlers
    this.setupInputHandlers();

    // Start game loop
    this.app.ticker.add((time) => this.gameLoop(time));
  }

  private setupInputHandlers(): void {
    // Reset game on Enter key
    this.inputManager.onKeyDown("Enter", () => this.resetGame());
  }

  private gameLoop(time: any): void {
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

    // Consume energy for movement
    if (isMoving && Math.abs(physics.velocity.x) > 0.1) {
      this.energySystem.consumeMovement(deltaTime);
    }

    // Update systems
    this.player.updatePhysics(deltaTime);
    this.collisionSystem.checkCollisions(this.player);
    this.enemySystem.update(deltaTime);

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
          this.enemyCollisionCooldown = 120; // Cooldown in frames (about 1 second at 60fps)
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
    this.enemyCollisionCooldown = 0; // Reset cooldown timer
  }

  getApp(): Application {
    return this.app;
  }
}
