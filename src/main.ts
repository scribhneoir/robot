import { Application, Graphics } from "pixi.js";

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

  // Create a colored player rectangle using Graphics
  const player = new Graphics();
  player.rect(0, 0, 8, 8);
  player.fill(0xff0000); // Red color - you can change this to any hex color
  player.x = app.screen.width / 2 - 4; // Center horizontally
  player.y = app.screen.height / 2 - 4; // Center vertically

  // Add the player to the stage
  app.stage.addChild(player);

  // Keyboard controls
  const keys: { [key: string]: boolean } = {};

  // Physics variables
  const physics = {
    velocity: { x: 0, y: 0 },
    acceleration: 0.5,
    friction: 0.85,
    gravity: 0.3,
    jumpPower: -2,
    maxSpeed: 3,
    onGround: false,
    chargeTime: 0,
    maxChargeTime: 60, // frames to reach max charge
    isCharging: false,
  };

  // Key event listeners
  window.addEventListener("keydown", (event) => {
    keys[event.code] = true;
  });

  window.addEventListener("keyup", (event) => {
    keys[event.code] = false;
  });

  // Listen for animate update
  app.ticker.add((time) => {
    // Handle input and apply forces
    if (keys["KeyA"] || keys["ArrowLeft"]) {
      physics.velocity.x -= physics.acceleration * time.deltaTime;
    }
    if (keys["KeyD"] || keys["ArrowRight"]) {
      physics.velocity.x += physics.acceleration * time.deltaTime;
    }

    // Handle charge jump with down key
    if ((keys["KeyS"] || keys["ArrowDown"]) && physics.onGround) {
      physics.isCharging = true;
      physics.chargeTime = Math.min(
        physics.chargeTime + time.deltaTime,
        physics.maxChargeTime
      );
    } else if (physics.isCharging && physics.onGround) {
      // Release jump - calculate power based on charge time
      const chargeRatio = physics.chargeTime / physics.maxChargeTime;
      const jumpMultiplier = 1 + chargeRatio * 2; // 1x to 3x jump power
      physics.velocity.y = physics.jumpPower * jumpMultiplier;
      physics.onGround = false;
      physics.isCharging = false;
      physics.chargeTime = 0;
    }

    // Reset charging if not on ground
    if (!physics.onGround) {
      physics.isCharging = false;
      physics.chargeTime = 0;
    }

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

    // Ground collision (bottom of screen)
    const groundY = app.screen.height - 8;
    if (player.y >= groundY) {
      player.y = groundY;
      physics.velocity.y = 0;
      physics.onGround = true;
    }

    // Wall collisions
    if (player.x <= 0) {
      player.x = 0;
      physics.velocity.x = 0;
    }
    if (player.x >= app.screen.width - 8) {
      player.x = app.screen.width - 8;
      physics.velocity.x = 0;
    }

    // Ceiling collision
    if (player.y <= 0) {
      player.y = 0;
      physics.velocity.y = 0;
    }
  });
})();
