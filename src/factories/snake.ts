import random from 'lodash/random';

// Opposite directions are intentionally the inverse of one another.
// This is to make it easy to detect an invalid direction change:
// add the two numbers together, and if the result is non-zero, the direction change is allowed.
export enum SnakeDirection {
  UP = -1,
  DOWN = 1,
  LEFT = -2,
  RIGHT = 2,
}

export enum SnakeGameStatus {
  STOPPED,
  STARTED,
  DIED,
  DESTROYED,
}

type SnakeGameStopStatus =
  | SnakeGameStatus.STOPPED
  | SnakeGameStatus.DIED
  | SnakeGameStatus.DESTROYED;

export interface SnakeGame {
  start: () => void;
  pause: () => void;
  restart: () => void;
  status: () => SnakeGameStatus;
  changeDirection: (direction: SnakeDirection) => void;
  destroy: () => void;
}

export interface SnakeGameState {
  grid: number;
  bounds: Coords;
  status: SnakeGameStatus;
  direction: SnakeDirection;
  snake: SnakePart[];
  food: Coords;
  score: number;
}

interface Coords {
  x: number;
  y: number;
}

interface SnakePart extends Coords {
  direction: SnakeDirection;
}

interface SnakeFactoryOptions {
  size: number;
  cells: number;
  onFrame?: (state: SnakeGameState) => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (): void => {};

export default function snakeFactory({
  size: snakeSize,
  cells,
  onFrame = noop,
}: SnakeFactoryOptions): SnakeGame {
  const canvasSize = snakeSize * cells;

  let state = generateGameState();

  return {
    start,
    pause: stop,
    restart,
    status,
    changeDirection,
    destroy,
  };

  function start(): void {
    if (
      state.status === SnakeGameStatus.STARTED ||
      state.status === SnakeGameStatus.DESTROYED
    ) {
      return;
    }

    state.status = SnakeGameStatus.STARTED;
    gameLoop();
  }

  function stop(status: SnakeGameStopStatus = SnakeGameStatus.STOPPED): void {
    state.status = status;
  }

  function destroy(): void {
    stop();

    // Clear up event listener to release memory
    onFrame = noop;
  }

  function restart(): void {
    stop();
    state = generateGameState();
    start();
  }

  function status(): SnakeGameStatus {
    return state.status;
  }

  function changeDirection(direction: SnakeDirection): void {
    if (state.status !== SnakeGameStatus.STARTED) {
      // Only allow a direction change if the game is in progress
      return;
    }

    if (direction + state.direction === 0) {
      // Only allow 90 degree direction change
      return;
    }

    // Update the direction
    state.direction = direction;
  }

  // Modifications to the UI will only happen in a gameLoop.
  function gameLoop(): void {
    if (isStarted()) {
      // Calculate the next position of the snake
      moveSnake();

      // Checking if the snake eats the food
      eatFoodIfNeeded();
    }

    // Emit the state of the game
    onFrame(state);

    if (isGameOver()) {
      stop(SnakeGameStatus.DIED);
    }

    // Check again, because if game is over, status will have been changed
    if (isStarted()) {
      setTimeout(gameLoop, 100);
    }
  }

  function isStarted(): boolean {
    return state.status === SnakeGameStatus.STARTED;
  }

  function generateGameState(): SnakeGameState {
    const initialDirection = SnakeDirection.RIGHT;
    const initialSnake = [
      {
        x: 0,
        y: 0,
        direction: initialDirection,
      },
    ];

    return {
      grid: snakeSize,
      bounds: { x: canvasSize, y: canvasSize },
      status: SnakeGameStatus.STOPPED,
      direction: initialDirection,
      snake: initialSnake,
      food: newFoodCoords(initialSnake),
      score: 0,
    };
  }

  function isGameOver(): boolean {
    // The game is over if the snake's head has collided with any other part of its body.
    const [head, ...body] = state.snake;
    return body.some(part => head.x === part.x && head.y === part.y);
  }

  function moveSnake(): void {
    // Figure out where the head should go next
    const { direction, snake } = state;
    let { x, y } = snake[0];

    switch (direction) {
      case SnakeDirection.UP:
        // Move one box up
        y = mod(canvasSize, y - snakeSize);
        break;
      case SnakeDirection.DOWN:
        // Move one box down
        y = mod(canvasSize, y + snakeSize);
        break;
      case SnakeDirection.LEFT:
        // Move one box to the left
        x = mod(canvasSize, x - snakeSize);
        break;
      case SnakeDirection.RIGHT:
        // Move one box to the right
        x = mod(canvasSize, x + snakeSize);
        break;
      default:
        break;
    }

    // Make a new copy of the snake, attaching the new head
    const newSnake = [{ x, y, direction }];
    //   Now we change the value of a part with the part ahead of it.
    for (let i = 1; i < snake.length; ++i) {
      newSnake.push({ ...snake[i - 1] });
    }
    state.snake = newSnake;
  }

  function eatFoodIfNeeded(): void {
    const { snake, food } = state;
    const [head] = snake;

    if (head.x === food.x && head.y === food.y) {
      // Snake has eaten the food.
      state.score++;
      addSnakePart();
      moveFood();
    }
  }

  function addSnakePart(): void {
    const { snake } = state;
    // Retrieve the snake's tail
    const tail = snake[snake.length - 1];

    // Figure out the co-ords of the new part to be added after the tail
    const { direction } = tail;
    let { x, y } = tail;

    switch (direction) {
      case SnakeDirection.UP:
        // Generate new tail below the existing tail
        y = mod(canvasSize, y + snakeSize);
        break;
      case SnakeDirection.DOWN:
        // Generate new tail above the existing tail
        y = mod(canvasSize, y - snakeSize);
        break;
      case SnakeDirection.LEFT:
        // Generate new tail to the right of the existing tail
        x = mod(canvasSize, x + snakeSize);
        break;
      case SnakeDirection.RIGHT:
        // Generate new tail to the left of the existing tail
        x = mod(canvasSize, x - snakeSize);
        break;
      default:
        break;
    }

    // Add the new part to the snake
    snake.push({ x, y, direction });
  }

  function moveFood(): void {
    state.food = newFoodCoords(state.snake);
  }

  function newFoodCoords(snake: SnakePart[]): Coords {
    let x: number, y: number;

    do {
      // Generate food coordinates that don't clash with the snake's body
      x = randomCoord();
      y = randomCoord();
    } while (snake.some(part => part.x === x && part.y === y));

    return { x, y };
  }

  function randomCoord(): number {
    return random(0, cells - 1) * snakeSize;
  }

  function mod(m: number, val: number): number {
    while (val < 0) {
      val += m;
    }
    return val % m;
  }
}
