export class InputManager {
  private keys: { [key: string]: boolean } = {};
  private callbacks: { [event: string]: (() => void)[] } = {};
  private touchControls: { [control: string]: boolean } = {};

  constructor() {
    this.setupEventListeners();
    this.setupMobileControls();
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
    return (
      this.isKeyPressed("KeyA") ||
      this.isKeyPressed("ArrowLeft") ||
      this.touchControls.left
    );
  }

  isMovingRight(): boolean {
    return (
      this.isKeyPressed("KeyD") ||
      this.isKeyPressed("ArrowRight") ||
      this.touchControls.right
    );
  }

  isCharging(): boolean {
    return (
      this.isKeyPressed("KeyS") ||
      this.isKeyPressed("ArrowDown") ||
      this.touchControls.down
    );
  }

  isShooting(): boolean {
    return (
      this.isKeyPressed("KeyZ") ||
      this.isKeyPressed("KeyJ") ||
      this.touchControls.shoot
    );
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

  private setupMobileControls(): void {
    // Create mobile controls container
    const mobileControls = document.createElement("div");
    mobileControls.id = "mobile-controls";
    mobileControls.innerHTML = `
      <div class="dpad-container">
        <div class="dpad">
          <button class="dpad-btn dpad-up" data-control="up">↑</button>
          <button class="dpad-btn dpad-left" data-control="left">←</button>
          <button class="dpad-btn dpad-center"></button>
          <button class="dpad-btn dpad-right" data-control="right">→</button>
          <button class="dpad-btn dpad-down" data-control="down">↓</button>
        </div>
      </div>
      <div class="action-buttons">
        <button class="action-btn shoot-btn" data-control="shoot">A</button>
                <button class="action-btn shoot-btn" data-control="shoot">B</button>
      </div>
    `;

    document.body.appendChild(mobileControls);

    // Add touch event listeners
    const buttons = mobileControls.querySelectorAll("[data-control]");
    buttons.forEach((button) => {
      const control = button.getAttribute("data-control");
      if (!control) return;

      // Touch start
      button.addEventListener("touchstart", (e) => {
        e.preventDefault();
        this.touchControls[control] = true;
        button.classList.add("pressed");
      });

      // Touch end
      button.addEventListener("touchend", (e) => {
        e.preventDefault();
        this.touchControls[control] = false;
        button.classList.remove("pressed");
      });

      // Touch cancel (when finger moves off button)
      button.addEventListener("touchcancel", (e) => {
        e.preventDefault();
        this.touchControls[control] = false;
        button.classList.remove("pressed");
      });

      // Mouse events for desktop testing
      button.addEventListener("mousedown", (e) => {
        e.preventDefault();
        this.touchControls[control] = true;
        button.classList.add("pressed");
      });

      button.addEventListener("mouseup", (e) => {
        e.preventDefault();
        this.touchControls[control] = false;
        button.classList.remove("pressed");
      });

      button.addEventListener("mouseleave", (e) => {
        e.preventDefault();
        this.touchControls[control] = false;
        button.classList.remove("pressed");
      });
    });

    // Hide mobile controls on desktop
    this.checkIfMobile();
  }

  private checkIfMobile(): void {
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      ) || window.innerWidth < 768;

    const mobileControls = document.getElementById("mobile-controls");
    if (mobileControls) {
      mobileControls.style.display = isMobile ? "flex" : "none";
    }

    // Listen for window resize
    window.addEventListener("resize", () => {
      const isMobileNow = window.innerWidth < 768;
      if (mobileControls) {
        mobileControls.style.display = isMobileNow ? "flex" : "none";
      }
    });
  }
}
