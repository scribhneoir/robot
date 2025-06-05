import { Graphics } from "pixi.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { COLORS, ENERGY_CONFIG } from "../../config";
import { EnergySystem } from "../energy.system";

// Mock PIXI.js Graphics
vi.mock("pixi.js", () => ({
  Graphics: vi.fn().mockImplementation(() => ({
    clear: vi.fn(),
    rect: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
  })),
}));

interface MockGraphics {
  clear: ReturnType<typeof vi.fn>;
  rect: ReturnType<typeof vi.fn>;
  fill: ReturnType<typeof vi.fn>;
  stroke: ReturnType<typeof vi.fn>;
}

describe("EnergySystem", () => {
  let energySystem: EnergySystem;
  let mockGraphics: MockGraphics;

  beforeEach(() => {
    vi.clearAllMocks();
    energySystem = new EnergySystem();
    mockGraphics = energySystem.getGraphics() as unknown as MockGraphics;
  });

  describe("constructor", () => {
    it("should initialize with max energy", () => {
      expect(energySystem.getCurrent()).toBe(ENERGY_CONFIG.max);
      expect(energySystem.getMax()).toBe(ENERGY_CONFIG.max);
    });

    it("should create graphics instance", () => {
      expect(Graphics).toHaveBeenCalled();
      expect(energySystem.getGraphics()).toBeDefined();
    });

    it("should call updateVisual on initialization", () => {
      // Create a new instance to test constructor behavior
      const newEnergySystem = new EnergySystem();
      const newGraphics =
        newEnergySystem.getGraphics() as unknown as MockGraphics;

      // Should have called graphics methods for initial visual update
      expect(newGraphics.clear).toHaveBeenCalled();
      expect(newGraphics.rect).toHaveBeenCalled();
      expect(newGraphics.fill).toHaveBeenCalled();
    });
  });

  describe("getters", () => {
    it("should return current energy", () => {
      expect(energySystem.getCurrent()).toBe(ENERGY_CONFIG.max);
    });

    it("should return max energy", () => {
      expect(energySystem.getMax()).toBe(ENERGY_CONFIG.max);
    });

    it("should return graphics instance", () => {
      expect(energySystem.getGraphics()).toBeDefined();
      expect(typeof energySystem.getGraphics()).toBe("object");
    });
  });

  describe("consumeMovement", () => {
    it("should consume movement energy based on deltaTime", () => {
      const deltaTime = 1;
      const expectedConsumption = ENERGY_CONFIG.costs.movement * deltaTime;
      const initialEnergy = energySystem.getCurrent();

      const result = energySystem.consumeMovement(deltaTime);

      expect(result).toBe(true);
      expect(energySystem.getCurrent()).toBe(
        initialEnergy - expectedConsumption,
      );
    });

    it("should return false when energy is zero", () => {
      // Drain energy to zero
      while (energySystem.getCurrent() > 0) {
        energySystem.consumeMovement(100);
      }

      const result = energySystem.consumeMovement(1);
      expect(result).toBe(false);
      expect(energySystem.getCurrent()).toBe(0);
    });

    it("should not consume energy when already at zero", () => {
      // Drain energy to zero
      while (energySystem.getCurrent() > 0) {
        energySystem.consumeMovement(100);
      }

      energySystem.consumeMovement(1);
      expect(energySystem.getCurrent()).toBe(0);
    });

    it("should handle different deltaTime values", () => {
      const deltaTime1 = 0.5;
      const deltaTime2 = 2;

      const initialEnergy = energySystem.getCurrent();
      energySystem.consumeMovement(deltaTime1);
      const energyAfterFirst = energySystem.getCurrent();

      energySystem.consumeMovement(deltaTime2);
      const energyAfterSecond = energySystem.getCurrent();

      const firstConsumption = ENERGY_CONFIG.costs.movement * deltaTime1;
      const secondConsumption = ENERGY_CONFIG.costs.movement * deltaTime2;

      expect(energyAfterFirst).toBe(initialEnergy - firstConsumption);
      expect(energyAfterSecond).toBe(
        initialEnergy - firstConsumption - secondConsumption,
      );
    });
  });

  describe("consumeCharging", () => {
    it("should consume charging energy based on deltaTime", () => {
      const deltaTime = 1;
      const expectedConsumption = ENERGY_CONFIG.costs.charging * deltaTime;
      const initialEnergy = energySystem.getCurrent();

      const result = energySystem.consumeCharging(deltaTime);

      expect(result).toBe(true);
      expect(energySystem.getCurrent()).toBe(
        initialEnergy - expectedConsumption,
      );
    });

    it("should return false when energy is zero", () => {
      // Drain energy to zero
      while (energySystem.getCurrent() > 0) {
        energySystem.consumeCharging(100);
      }

      const result = energySystem.consumeCharging(1);
      expect(result).toBe(false);
      expect(energySystem.getCurrent()).toBe(0);
    });

    it("should return false when energy becomes zero after consumption", () => {
      // Set energy to exactly the charging cost
      const chargingCost = ENERGY_CONFIG.costs.charging;
      while (energySystem.getCurrent() > chargingCost) {
        energySystem.consumeCharging(1);
      }

      // Now energy should be at or below charging cost
      const result = energySystem.consumeCharging(1);
      expect(result).toBe(false);
      expect(energySystem.getCurrent()).toBe(0);
    });
  });

  describe("consumeEnemyCollision", () => {
    it("should consume enemy collision energy", () => {
      const initialEnergy = energySystem.getCurrent();
      const result = energySystem.consumeEnemyCollision();

      expect(result).toBe(true);
      expect(energySystem.getCurrent()).toBe(
        initialEnergy - ENERGY_CONFIG.costs.enemyCollision,
      );
    });

    it("should return false when energy is zero", () => {
      // Drain energy to zero
      while (energySystem.getCurrent() > 0) {
        energySystem.consumeEnemyCollision();
      }

      const result = energySystem.consumeEnemyCollision();
      expect(result).toBe(false);
      expect(energySystem.getCurrent()).toBe(0);
    });

    it("should return false when energy becomes zero after consumption", () => {
      // Set energy to exactly the collision cost
      const collisionCost = ENERGY_CONFIG.costs.enemyCollision;
      while (energySystem.getCurrent() > collisionCost) {
        energySystem.consumeEnemyCollision();
      }

      // Energy should be at collision cost, consuming should set to 0 and return false
      const result = energySystem.consumeEnemyCollision();
      expect(result).toBe(false);
      expect(energySystem.getCurrent()).toBe(0);
    });

    it("should clamp energy to zero when consumption exceeds current energy", () => {
      // Set energy to a value less than collision cost
      const smallAmount = ENERGY_CONFIG.costs.enemyCollision - 1;
      while (energySystem.getCurrent() > smallAmount) {
        energySystem.consumeMovement(1);
      }

      energySystem.consumeEnemyCollision();
      expect(energySystem.getCurrent()).toBe(0);
    });
  });

  describe("consumeShooting", () => {
    it("should consume shooting energy when sufficient energy available", () => {
      const initialEnergy = energySystem.getCurrent();
      const result = energySystem.consumeShooting();

      expect(result).toBe(true);
      expect(energySystem.getCurrent()).toBe(
        initialEnergy - ENERGY_CONFIG.costs.shooting,
      );
    });

    it("should return false when energy is less than shooting cost", () => {
      // Drain energy to less than shooting cost
      const shootingCost = ENERGY_CONFIG.costs.shooting;
      while (energySystem.getCurrent() >= shootingCost) {
        energySystem.consumeShooting();
      }

      const result = energySystem.consumeShooting();
      expect(result).toBe(false);
    });

    it("should not consume energy when insufficient", () => {
      // Drain energy to less than shooting cost
      const shootingCost = ENERGY_CONFIG.costs.shooting;
      while (energySystem.getCurrent() >= shootingCost) {
        energySystem.consumeShooting();
      }

      const energyBeforeAttempt = energySystem.getCurrent();
      energySystem.consumeShooting();

      expect(energySystem.getCurrent()).toBe(energyBeforeAttempt);
    });

    it("should handle edge case when energy equals shooting cost", () => {
      // Set energy to exactly the shooting cost
      const shootingCost = ENERGY_CONFIG.costs.shooting;

      // Reset and manually set energy to shooting cost
      energySystem.reset();
      // Use consumeEnemyCollision to reduce energy in larger chunks, then fine-tune
      while (energySystem.getCurrent() > shootingCost + 10) {
        energySystem.consumeEnemyCollision();
      }
      // Then use movement to fine-tune to exactly the shooting cost
      while (energySystem.getCurrent() > shootingCost) {
        energySystem.consumeMovement(0.1);
      }

      // If we overshot, reset and try a different approach
      if (energySystem.getCurrent() < shootingCost) {
        energySystem.reset();
        // Calculate exact reduction needed
        const reductionNeeded = ENERGY_CONFIG.max - shootingCost;
        const movementTime = reductionNeeded / ENERGY_CONFIG.costs.movement;
        energySystem.consumeMovement(movementTime);
      }

      const result = energySystem.consumeShooting();
      expect(result).toBe(true);
      expect(energySystem.getCurrent()).toBe(0);
    });
  });

  describe("reset", () => {
    it("should reset energy to max value", () => {
      // Consume some energy first
      energySystem.consumeMovement(10);
      energySystem.consumeEnemyCollision();

      expect(energySystem.getCurrent()).toBeLessThan(ENERGY_CONFIG.max);

      energySystem.reset();
      expect(energySystem.getCurrent()).toBe(ENERGY_CONFIG.max);
    });

    it("should call updateVisual after reset", () => {
      // Consume some energy and reset graphics mock
      energySystem.consumeMovement(10);
      vi.clearAllMocks();

      energySystem.reset();

      expect(mockGraphics.clear).toHaveBeenCalled();
      expect(mockGraphics.rect).toHaveBeenCalled();
      expect(mockGraphics.fill).toHaveBeenCalled();
    });
  });

  describe("updateVisual", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should clear graphics before drawing", () => {
      energySystem.updateVisual();
      expect(mockGraphics.clear).toHaveBeenCalledOnce();
    });

    it("should draw background bar", () => {
      energySystem.updateVisual();

      expect(mockGraphics.rect).toHaveBeenCalledWith(5, 5, 100, 6);
      expect(mockGraphics.fill).toHaveBeenCalledWith(COLORS.energy.background);
    });

    it("should draw energy fill when energy is above zero", () => {
      // Consume some energy but keep it above zero
      energySystem.consumeMovement(5);
      vi.clearAllMocks();

      energySystem.updateVisual();

      const expectedFillWidth =
        (energySystem.getCurrent() / energySystem.getMax()) * 100;
      expect(mockGraphics.rect).toHaveBeenCalledWith(
        5,
        5,
        expectedFillWidth,
        6,
      );
    });

    it("should not draw energy fill when energy is zero", () => {
      // Drain all energy
      while (energySystem.getCurrent() > 0) {
        energySystem.consumeEnemyCollision();
      }
      vi.clearAllMocks();

      energySystem.updateVisual();

      // Should only have background rect and border rect calls
      expect(mockGraphics.rect).toHaveBeenCalledTimes(2);
      expect(mockGraphics.rect).toHaveBeenCalledWith(5, 5, 100, 6); // background
      expect(mockGraphics.rect).toHaveBeenCalledWith(4, 4, 102, 8); // border
    });

    it("should use high energy color when energy is above 60", () => {
      // Energy starts at max (100), so it should use high color
      energySystem.updateVisual();

      expect(mockGraphics.fill).toHaveBeenCalledWith(COLORS.energy.high);
    });

    it("should use medium energy color when energy is between 30 and 60", () => {
      // Reduce energy to medium level
      while (energySystem.getCurrent() >= 60) {
        energySystem.consumeMovement(1);
      }
      while (energySystem.getCurrent() < 30) {
        energySystem.reset();
        while (energySystem.getCurrent() >= 50) {
          energySystem.consumeMovement(1);
        }
        break;
      }
      vi.clearAllMocks();

      energySystem.updateVisual();

      expect(mockGraphics.fill).toHaveBeenCalledWith(COLORS.energy.medium);
    });

    it("should use low energy color when energy is below 30", () => {
      // Reduce energy to low level
      while (energySystem.getCurrent() >= 30) {
        energySystem.consumeMovement(10);
      }
      vi.clearAllMocks();

      energySystem.updateVisual();

      expect(mockGraphics.fill).toHaveBeenCalledWith(COLORS.energy.low);
    });

    it("should draw border", () => {
      energySystem.updateVisual();

      expect(mockGraphics.rect).toHaveBeenCalledWith(4, 4, 102, 8);
      expect(mockGraphics.stroke).toHaveBeenCalledWith({
        color: COLORS.energy.border,
        width: 1,
      });
    });

    it("should calculate correct fill width based on energy percentage", () => {
      // Test a specific case instead of multiple cases to avoid floating point issues
      energySystem.reset();

      // Reduce energy to exactly 50 by calculating the exact amount to consume
      const targetEnergy = 50;
      const reductionNeeded = ENERGY_CONFIG.max - targetEnergy;
      const movementTime = reductionNeeded / ENERGY_CONFIG.costs.movement;

      energySystem.consumeMovement(movementTime);

      vi.clearAllMocks();
      energySystem.updateVisual();

      // Check that one of the rect calls was made with the expected fill width
      const rectCalls = mockGraphics.rect.mock.calls;
      const fillCall = rectCalls.find(
        (call) =>
          call[0] === 5 &&
          call[1] === 5 &&
          call[3] === 6 &&
          call[2] > 0 &&
          call[2] < 100,
      );

      expect(fillCall).toBeDefined();
      if (fillCall) {
        expect(fillCall[2]).toBeCloseTo(50, 1); // Allow for floating point precision
      }
    });
  });

  describe("energy clamping", () => {
    it("should not allow energy to go below zero", () => {
      // Try to consume more energy than available
      while (energySystem.getCurrent() > 0) {
        energySystem.consumeEnemyCollision();
      }

      expect(energySystem.getCurrent()).toBe(0);

      // Try to consume more
      energySystem.consumeMovement(100);
      expect(energySystem.getCurrent()).toBe(0);
    });

    it("should not allow energy to exceed max", () => {
      // Energy should already be at max
      expect(energySystem.getCurrent()).toBe(ENERGY_CONFIG.max);

      // Reset should not exceed max
      energySystem.reset();
      expect(energySystem.getCurrent()).toBe(ENERGY_CONFIG.max);
    });
  });

  describe("integration tests", () => {
    it("should handle multiple consecutive operations", () => {
      const initialEnergy = energySystem.getCurrent();

      // Perform multiple operations
      energySystem.consumeMovement(2);
      const afterMovement = energySystem.getCurrent();

      energySystem.consumeCharging(1);
      const afterCharging = energySystem.getCurrent();

      energySystem.consumeShooting();
      const afterShooting = energySystem.getCurrent();

      energySystem.consumeEnemyCollision();
      const afterCollision = energySystem.getCurrent();

      // Verify expected energy consumption
      const expectedAfterMovement =
        initialEnergy - ENERGY_CONFIG.costs.movement * 2;
      const expectedAfterCharging =
        expectedAfterMovement - ENERGY_CONFIG.costs.charging * 1;
      const expectedAfterShooting =
        expectedAfterCharging - ENERGY_CONFIG.costs.shooting;
      const expectedAfterCollision =
        expectedAfterShooting - ENERGY_CONFIG.costs.enemyCollision;

      expect(afterMovement).toBeCloseTo(expectedAfterMovement, 5);
      expect(afterCharging).toBeCloseTo(expectedAfterCharging, 5);
      expect(afterShooting).toBe(expectedAfterShooting);
      expect(afterCollision).toBe(Math.max(0, expectedAfterCollision));
    });

    it("should maintain visual consistency with energy state", () => {
      // Test that visual updates are called appropriately
      vi.clearAllMocks();

      energySystem.consumeMovement(5);
      energySystem.updateVisual();

      const callsAfterMovement = mockGraphics.clear.mock.calls.length;

      energySystem.consumeEnemyCollision();
      energySystem.updateVisual();

      const callsAfterCollision = mockGraphics.clear.mock.calls.length;

      expect(callsAfterMovement).toBeGreaterThan(0);
      expect(callsAfterCollision).toBeGreaterThan(callsAfterMovement);
    });
  });
});
