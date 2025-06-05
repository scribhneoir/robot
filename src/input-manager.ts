export class InputManager {
  private keys: { [key: string]: boolean } = {};
  private callbacks: { [event: string]: (() => void)[] } = {};

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    window.addEventListener("keydown", (event) => {
      this.keys[event.code] = true;
      this.triggerCallback(`keydown:${event.code}`);
    });

    window.addEventListener("keyup", (event) => {
      this.keys[event.code] = false;
      this.triggerCallback(`keyup:${event.code}`);
    });
  }

  isKeyPressed(keyCode: string): boolean {
    return this.keys[keyCode] || false;
  }

  isMovingLeft(): boolean {
    return this.isKeyPressed("KeyA") || this.isKeyPressed("ArrowLeft");
  }

  isMovingRight(): boolean {
    return this.isKeyPressed("KeyD") || this.isKeyPressed("ArrowRight");
  }

  isCharging(): boolean {
    return this.isKeyPressed("KeyS") || this.isKeyPressed("ArrowDown");
  }

  onKeyDown(keyCode: string, callback: () => void): void {
    const event = `keydown:${keyCode}`;
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }

  onKeyUp(keyCode: string, callback: () => void): void {
    const event = `keyup:${keyCode}`;
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }

  private triggerCallback(event: string): void {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach((callback) => callback());
    }
  }
}
