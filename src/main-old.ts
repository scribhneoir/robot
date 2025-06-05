import { Application, Graphics } from "pixi.js";

// 2D array to store platform data (0 = empty, 1 = platform)
const platformGrid = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application with fixed dimensions and integer scaling
  await app.init({
    background: "#000000",
    width: 160,
    height: 144,
    resolution: 1,
    autoDensity: false,
  });

  // Append the application canvas to the document body
  const container = document.getElementById("pixi-container")!;
  container.appendChild(app.canvas);

  // Setup integer scaling
  const setupIntegerScaling = () => {
    const canvas = app.canvas;
    const scaleX = Math.floor(window.innerWidth / 160);
    const scaleY = Math.floor(window.innerHeight / 144);
    const scale = Math.max(1, Math.min(scaleX, scaleY));

    canvas.style.transform = `scale(${scale})`;
    canvas.style.width = "160px";
    canvas.style.height = "144px";
  };

  // Apply initial scaling
  setupIntegerScaling();

  // Reapply scaling on window resize
  window.addEventListener("resize", setupIntegerScaling);

  // Platform system constants
  const TILE_SIZE = 8;

  // Find spawn position from platform grid
  let spawnX = app.screen.width / 2 - 4; // Default center
  let spawnY = app.screen.height / 2 - 4;

  for (let y = 0; y < platformGrid.length; y++) {
    for (let x = 0; x < platformGrid[0].length; x++) {
      if (platformGrid[y][x] === -1) {
        spawnX = x * TILE_SIZE;
        spawnY = y * TILE_SIZE;
        break;
      }
    }
  }

  // Create a colored player rectangle using Graphics
  const player = new Graphics();
  player.rect(0, 0, 8, 8);
  player.fill(0xff0000); // Red color - you can change this to any hex color
  player.x = spawnX;
  player.y = spawnY;

  // Add the player to the stage
  app.stage.addChild(player);

  // Graphics container for all platforms
  const platformsContainer = new Graphics();
  app.stage.addChild(platformsContainer);

  // Function to check if there's a platform at grid position
  const isPlatformAt = (gridX: number, gridY: number): boolean => {
    if (
      gridX < 0 ||
      gridX >= platformGrid[0].length ||
      gridY < 0 ||
      gridY >= platformGrid.length
    ) {
      return false; // Out of bounds
    }
    return platformGrid[gridY][gridX] === 1;
  };

  platformsContainer.clear();
  for (let y = 0; y < platformGrid.length; y++) {
    for (let x = 0; x < platformGrid[0].length; x++) {
      if (platformGrid[y][x] === 1) {
        platformsContainer.rect(
          x * TILE_SIZE,
          y * TILE_SIZE,
          TILE_SIZE,
          TILE_SIZE
        );
        platformsContainer.fill(0x00ff00); // Green platforms
      }
    }
  }

  // Keyboard controls
  const keys: { [key: string]: boolean } = {};

  // Physics variables
  const physics = {
    velocity: { x: 0, y: 0 },
    acceleration: 0.5,
    friction: 0.85,
    gravity: 0.3,
    jumpPower: -2,
    maxSpeed: 2,
    onGround: false,
    chargeTime: 0,
    maxChargeTime: 60, // frames to reach max charge
    isCharging: false,
  };

  // Energy system
  const energy = {
    current: 100,
    max: 100,
    costs: {
      movement: 0.05, // Energy cost per frame while moving
      charging: 0.1, // Energy cost per frame while charging
    },
  };

  // Energy bar graphics
  const energyBar = new Graphics();
  app.stage.addChild(energyBar);

  // Function to update energy bar visual
  const updateEnergyBar = () => {
    energyBar.clear();

    // Background (empty bar)
    energyBar.rect(5, 5, 100, 6);
    energyBar.fill(0x333333);

    // Energy fill
    const fillWidth = (energy.current / energy.max) * 100;
    if (fillWidth > 0) {
      energyBar.rect(5, 5, fillWidth, 6);

      // Color based on energy level
      let barColor = 0x00ff00; // Green
      if (energy.current < 30) {
        barColor = 0xff0000; // Red
      } else if (energy.current < 60) {
        barColor = 0xffff00; // Yellow
      }
      energyBar.fill(barColor);
    }

    // Border
    energyBar.rect(4, 4, 102, 8);
    energyBar.stroke({ color: 0xffffff, width: 1 });
  };

  // Initialize energy bar
  updateEnergyBar();

  // Function to reset the game
  const resetGame = () => {
    // Reset player position to spawn location
    player.x = spawnX;
    player.y = spawnY;

    // Reset physics
    physics.velocity.x = 0;
    physics.velocity.y = 0;
    physics.onGround = false;
    physics.chargeTime = 0;
    physics.isCharging = false;

    // Reset energy
    energy.current = energy.max;
    updateEnergyBar();

    // Reset player visual
    player.clear();
    player.rect(0, 0, 8, 8);
    player.fill(0xff0000);
  };

  // Key event listeners
  window.addEventListener("keydown", (event) => {
    keys[event.code] = true;

    // Reset game on Enter key
    if (event.code === "Enter") {
      resetGame();
    }
  });

  window.addEventListener("keyup", (event) => {
    keys[event.code] = false;
  });

  // Listen for animate update
  app.ticker.add((time) => {
    // Track if player is moving for energy consumption
    let isMoving = false;

    // Handle input and apply forces
    if ((keys["KeyA"] || keys["ArrowLeft"]) && energy.current > 0) {
      physics.velocity.x -= physics.acceleration * time.deltaTime;
      isMoving = true;
    }
    if ((keys["KeyD"] || keys["ArrowRight"]) && energy.current > 0) {
      physics.velocity.x += physics.acceleration * time.deltaTime;
      isMoving = true;
    }

    // Handle charge jump with down key
    if (
      (keys["KeyS"] || keys["ArrowDown"]) &&
      physics.onGround &&
      energy.current > 0
    ) {
      physics.isCharging = true;
      physics.chargeTime = Math.min(
        physics.chargeTime + time.deltaTime,
        physics.maxChargeTime
      );
      // Consume energy while charging
      energy.current -= energy.costs.charging * time.deltaTime;
    } else if (physics.isCharging && physics.onGround) {
      // Release jump - calculate power based on charge time
      const chargeRatio = physics.chargeTime / physics.maxChargeTime;
      const jumpMultiplier = 1 + chargeRatio * 2; // 1x to 3x jump power
      physics.velocity.y = physics.jumpPower * jumpMultiplier;
      physics.onGround = false;
      physics.isCharging = false;
      physics.chargeTime = 0;
    } else if (physics.isCharging && energy.current <= 0) {
      // Stop charging if out of energy
      physics.isCharging = false;
      physics.chargeTime = 0;
    }

    // Reset charging if not on ground
    if (!physics.onGround) {
      physics.isCharging = false;
      physics.chargeTime = 0;
    }

    // Consume energy for movement
    if (isMoving && Math.abs(physics.velocity.x) > 0.1) {
      energy.current -= energy.costs.movement * time.deltaTime;
    }

    // Clamp energy to valid range
    energy.current = Math.max(0, Math.min(energy.max, energy.current));

    // Update energy bar
    updateEnergyBar();

    // Apply friction to horizontal movement
    physics.velocity.x *= physics.friction;

    // Apply gravity
    physics.velocity.y += physics.gravity * time.deltaTime;

    // Limit maximum speed
    physics.velocity.x = Math.max(
      -physics.maxSpeed,
      Math.min(physics.maxSpeed, physics.velocity.x)
    );
    physics.velocity.y = Math.max(-15, Math.min(10, physics.velocity.y)); // Increased max upward velocity

    // Update position based on velocity
    player.x += physics.velocity.x * time.deltaTime;
    player.y += physics.velocity.y * time.deltaTime;

    // Visual squashing effect
    const chargeRatio = physics.chargeTime / physics.maxChargeTime;
    const squashAmount = chargeRatio * 0.5; // Up to 80% squash
    player.clear();
    if (physics.isCharging) {
      // Squash: make wider and shorter
      const width = 8 * squashAmount + 8;
      const height = 8 - squashAmount * 8;
      player.rect(-squashAmount * 4, squashAmount * 8, width, height);
    } else {
      // Normal shape
      player.rect(0, 0, 8, 8);
    }

    // Color changes based on charge (red to yellow to white)
    let color = 0xff0000; // Red
    if (chargeRatio > 0.3) {
      color = 0xffff00; // Yellow
    }
    if (chargeRatio > 0.7) {
      color = 0xffffff; // White
    }
    player.fill(color);

    // Platform collision detection
    const playerGridX = Math.floor(player.x / TILE_SIZE);
    const playerGridY = Math.floor(player.y / TILE_SIZE);
    const playerRightGridX = Math.floor((player.x + 7) / TILE_SIZE);
    const playerBottomGridY = Math.floor((player.y + 7) / TILE_SIZE);

    // Check for platform collisions
    let platformCollision = false;

    // Check if player is landing on a platform (falling downward)
    if (physics.velocity.y > 0) {
      // Check bottom corners of player
      if (
        isPlatformAt(playerGridX, playerBottomGridY) ||
        isPlatformAt(playerRightGridX, playerBottomGridY)
      ) {
        const platformTop = playerBottomGridY * TILE_SIZE;
        if (player.y + 8 > platformTop && player.y < platformTop) {
          player.y = platformTop - 8;
          physics.velocity.y = 0;
          physics.onGround = true;
          platformCollision = true;
        }
      }
    }

    // Ground collision (bottom of screen) - only if no platform collision
    if (!platformCollision) {
      const groundY = app.screen.height - 8;
      if (player.y >= groundY) {
        player.y = groundY;
        physics.velocity.y = 0;
        physics.onGround = true;
      } else {
        // Check if player is in air and not on any platform
        const standingOnPlatform =
          isPlatformAt(playerGridX, playerBottomGridY + 1) ||
          isPlatformAt(playerRightGridX, playerBottomGridY + 1);
        if (!standingOnPlatform && player.y + 8 < app.screen.height - 8) {
          physics.onGround = false;
        }
      }
    }

    // Wall collisions with screen boundaries
    if (player.x <= 0) {
      player.x = 0;
      physics.velocity.x = 0;
    }
    if (player.x >= app.screen.width - 8) {
      player.x = app.screen.width - 8;
      physics.velocity.x = 0;
    }

    // Platform wall collisions (left/right)
    if (physics.velocity.x > 0) {
      // Moving right - check right side of player
      const rightGridX = Math.floor((player.x + 8) / TILE_SIZE);
      if (
        isPlatformAt(rightGridX, playerGridY) ||
        isPlatformAt(rightGridX, Math.floor((player.y + 7) / TILE_SIZE))
      ) {
        const platformLeft = rightGridX * TILE_SIZE;
        if (player.x + 8 > platformLeft && player.x < platformLeft) {
          player.x = platformLeft - 8;
          physics.velocity.x = 0;
        }
      }
    } else if (physics.velocity.x < 0) {
      // Moving left - check left side of player
      const leftGridX = Math.floor(player.x / TILE_SIZE);
      if (
        isPlatformAt(leftGridX, playerGridY) ||
        isPlatformAt(leftGridX, Math.floor((player.y + 7) / TILE_SIZE))
      ) {
        const platformRight = (leftGridX + 1) * TILE_SIZE;
        if (player.x < platformRight && player.x + 8 > platformRight) {
          player.x = platformRight;
          physics.velocity.x = 0;
        }
      }
    }

    // Ceiling collision with platforms
    if (physics.velocity.y < 0) {
      // Moving up - check top of player
      const topGridY = Math.floor(player.y / TILE_SIZE);
      if (
        isPlatformAt(playerGridX, topGridY) ||
        isPlatformAt(playerRightGridX, topGridY)
      ) {
        const platformBottom = (topGridY + 1) * TILE_SIZE;
        if (player.y < platformBottom && player.y + 8 > platformBottom) {
          player.y = platformBottom;
          physics.velocity.y = 0;
        }
      }
    }

    // Screen ceiling collision
    if (player.y <= 0) {
      player.y = 0;
      physics.velocity.y = 0;
    }
  });
})();
