import { Player } from "./player";
import { PlatformSystem } from "./platform-system";
import { GAME_CONFIG } from "./config";
import { Vector2 } from "./types";

interface CollisionResult {
  position: Vector2;
  velocity: Vector2;
  onGround: boolean;
}

export class CollisionSystem {
  private platformSystem: PlatformSystem;

  constructor(platformSystem: PlatformSystem) {
    this.platformSystem = platformSystem;
  }

  checkCollisions(player: Player): void {
    const initialPosition = player.getPosition();
    const initialPhysics = player.getPhysics();
    const { tileSize } = GAME_CONFIG;

    // Create a temporary collision result object
    const result: CollisionResult = {
      position: { x: initialPosition.x, y: initialPosition.y },
      velocity: { x: initialPhysics.velocity.x, y: initialPhysics.velocity.y },
      onGround: initialPhysics.onGround,
    };

    // Calculate grid positions based on the current position
    const playerGridX = Math.floor(result.position.x / tileSize);
    const playerGridY = Math.floor(result.position.y / tileSize);
    const playerRightGridX = Math.floor((result.position.x + 7) / tileSize);
    const playerBottomGridY = Math.floor((result.position.y + 7) / tileSize);

    let platformCollision = false;

    // Platform collision - landing on top
    if (result.velocity.y > 0) {
      if (
        this.platformSystem.isPlatformAt(playerGridX, playerBottomGridY) ||
        this.platformSystem.isPlatformAt(playerRightGridX, playerBottomGridY)
      ) {
        const platformTop = playerBottomGridY * tileSize;
        if (
          result.position.y + 8 > platformTop &&
          result.position.y < platformTop
        ) {
          result.position.y = platformTop - 8;
          result.velocity.y = 0;
          result.onGround = true;
          platformCollision = true;
        }
      }
    }

    // Ground collision (bottom of screen)
    if (!platformCollision) {
      const groundY = GAME_CONFIG.screen.height - 8;
      if (result.position.y >= groundY) {
        result.position.y = groundY;
        result.velocity.y = 0;
        result.onGround = true;
      } else {
        // Check if player is standing on any platform (check one pixel below player's bottom)
        const checkY = Math.floor((result.position.y + 8) / tileSize);
        const standingOnPlatform =
          this.platformSystem.isPlatformAt(playerGridX, checkY) ||
          this.platformSystem.isPlatformAt(playerRightGridX, checkY);

        if (
          !standingOnPlatform &&
          result.position.y + 8 < GAME_CONFIG.screen.height - 8
        ) {
          result.onGround = false;
        } else if (standingOnPlatform) {
          // Snap to platform top if we're close enough
          const platformTop = checkY * tileSize;
          if (Math.abs(result.position.y + 8 - platformTop) < 2) {
            result.position.y = platformTop - 8;
            result.onGround = true;
          }
        }
      }
    }

    // Wall collisions with screen boundaries
    if (result.position.x <= 0) {
      result.position.x = 0;
      result.velocity.x = 0;
    }
    if (result.position.x >= GAME_CONFIG.screen.width - 8) {
      result.position.x = GAME_CONFIG.screen.width - 8;
      result.velocity.x = 0;
    }

    // Platform wall collisions (left/right)
    if (result.velocity.x > 0) {
      // Moving right
      const rightGridX = Math.floor((result.position.x + 8) / tileSize);
      if (
        this.platformSystem.isPlatformAt(rightGridX, playerGridY) ||
        this.platformSystem.isPlatformAt(
          rightGridX,
          Math.floor((result.position.y + 7) / tileSize)
        )
      ) {
        const platformLeft = rightGridX * tileSize;
        if (
          result.position.x + 8 > platformLeft &&
          result.position.x < platformLeft
        ) {
          result.position.x = platformLeft - 8;
          result.velocity.x = 0;
        }
      }
    } else if (result.velocity.x < 0) {
      // Moving left
      const leftGridX = Math.floor(result.position.x / tileSize);
      if (
        this.platformSystem.isPlatformAt(leftGridX, playerGridY) ||
        this.platformSystem.isPlatformAt(
          leftGridX,
          Math.floor((result.position.y + 7) / tileSize)
        )
      ) {
        const platformRight = (leftGridX + 1) * tileSize;
        if (
          result.position.x < platformRight &&
          result.position.x + 8 > platformRight
        ) {
          result.position.x = platformRight;
          result.velocity.x = 0;
        }
      }
    }

    // Ceiling collision with platforms
    if (result.velocity.y < 0) {
      const topGridY = Math.floor(result.position.y / tileSize);
      if (
        this.platformSystem.isPlatformAt(playerGridX, topGridY) ||
        this.platformSystem.isPlatformAt(playerRightGridX, topGridY)
      ) {
        const platformBottom = (topGridY + 1) * tileSize;
        if (
          result.position.y < platformBottom &&
          result.position.y + 8 > platformBottom
        ) {
          result.position.y = platformBottom;
          result.velocity.y = 0;
        }
      }
    }

    // Screen ceiling collision
    if (result.position.y <= 0) {
      result.position.y = 0;
      result.velocity.y = 0;
    }

    // Apply all collision results to the player at once
    player.setPosition(result.position.x, result.position.y);
    player.setVelocity(result.velocity.x, result.velocity.y);
    player.setOnGround(result.onGround);
  }
}
