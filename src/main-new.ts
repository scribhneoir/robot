import { Game } from "./game";

// Initialize and start the game
(async () => {
  const game = new Game();
  await game.init();
})();
