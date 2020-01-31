import BaseController from '../base_controller';
import snakeFactory, {
  SnakeDirection,
  SnakeGameStatus,
} from '../factories/snake';
import { SnakeGame, SnakeGameState } from '../factories/snake';

const SNAKE_PART_SIZE = 10;
const SNAKE_CELLS = 30;

// Build the snake colours from the CSS properties.
const documentStyle = getComputedStyle(document.documentElement);

const BACKGROUND_COLOR = documentStyle.getPropertyValue('--background-color');
const SNAKE_HEAD_COLOR = documentStyle.getPropertyValue('--primary-color');
const SNAKE_BODY_COLOR = documentStyle.getPropertyValue('--font-color');
const FOOD_COLOR = documentStyle.getPropertyValue('--error-color');

const CANVAS_SIZE = SNAKE_PART_SIZE * SNAKE_CELLS;

interface DrawSnakePartOpts {
  x: number;
  y: number;
  size: number;
  isHead: boolean;
}

abstract class BaseSnakeController extends BaseController {
  public readonly canvasTarget!: HTMLCanvasElement;
  public readonly canvasMessageTarget!: HTMLSpanElement;
  public readonly scoreTarget!: HTMLSpanElement;
  public readonly instructionsTarget!: HTMLParagraphElement;
}

export default class SnakeController extends ((BaseController as unknown) as typeof BaseSnakeController) {
  private _ctx?: CanvasRenderingContext2D;
  private _snakeGame?: SnakeGame;

  public static targets = ['canvas', 'canvasMessage', 'score', 'instructions'];

  private get ctx(): CanvasRenderingContext2D {
    return this._ctx as CanvasRenderingContext2D;
  }

  private get snakeGame(): SnakeGame {
    return this._snakeGame as SnakeGame;
  }

  public connect(): void {
    this.canvasTarget.width = CANVAS_SIZE;
    this.canvasTarget.height = CANVAS_SIZE;

    // The snake game is drawn onto the canvas element.
    const ctx = this.canvasTarget.getContext('2d');
    if (ctx === null) {
      throw new Error('Could not get canvas rendering context');
    }

    this._ctx = ctx;

    this._snakeGame = snakeFactory({
      size: SNAKE_PART_SIZE,
      cells: SNAKE_CELLS,
      onFrame: this.draw.bind(this),
    });
  }

  public disconnect(): void {
    this.snakeGame.destroy();

    this._snakeGame = undefined;
    this._ctx = undefined;
  }

  public handleKeydown(e: KeyboardEvent): void {
    // Don't bubble the event up
    e.preventDefault();
    e.stopPropagation();

    // Handle the key that is pressed. If it's a valid key, carry out the associated action in the game.
    switch (e.key) {
      case 'ArrowUp':
        this.snakeGame.changeDirection(SnakeDirection.UP);
        break;
      case 'ArrowDown':
        this.snakeGame.changeDirection(SnakeDirection.DOWN);
        break;
      case 'ArrowLeft':
        this.snakeGame.changeDirection(SnakeDirection.LEFT);
        break;
      case 'ArrowRight':
        this.snakeGame.changeDirection(SnakeDirection.RIGHT);
        break;
      case ' ':
      case 'Spacebar':
        this.toggleGameStarted();
        break;
    }
  }

  public toggleGameStarted(): void {
    const status = this.snakeGame.status();

    this.playOrPauseGame(status);
  }

  private draw(state: SnakeGameState): void {
    // The game is redrawn on every frame using raf.
    requestAnimationFrame(() => {
      this.drawBackground(state);
      this.drawSnake(state);
      this.drawFood(state);
      this.updateScore(state.score);
      this.updateInstructions(state.status);
      this.updateCanvasMessage(state.status);
    });
  }

  private drawBackground({ bounds: { x, y } }: SnakeGameState): void {
    this.ctx.fillStyle = BACKGROUND_COLOR;
    this.ctx.fillRect(0, 0, x, y);
  }

  private drawSnake({ snake, grid }: SnakeGameState): void {
    // Render the head last, so that it appears above any part of the body it might have collided with
    for (let i = snake.length - 1; i >= 0; --i) {
      const { x, y } = snake[i];
      const isHead = i === 0;
      this.drawSnakePart({ x, y, size: grid, isHead });
    }
  }

  private drawSnakePart = ({ x, y, size, isHead }: DrawSnakePartOpts): void => {
    this.ctx.fillStyle = isHead ? SNAKE_HEAD_COLOR : SNAKE_BODY_COLOR;
    this.ctx.fillRect(x, y, size, size);
  };

  private drawFood({ food: { x, y }, grid: size }: SnakeGameState): void {
    const rd = size / 2;
    this.ctx.beginPath();
    this.ctx.fillStyle = FOOD_COLOR;
    this.ctx.arc(x + rd, y + rd, rd, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  private playOrPauseGame(status: SnakeGameStatus): void {
    switch (status) {
      case SnakeGameStatus.STARTED:
        this.snakeGame.pause();
        break;
      case SnakeGameStatus.STOPPED:
        this.snakeGame.start();
        break;
      case SnakeGameStatus.DIED:
        this.snakeGame.restart();
        break;
    }
  }

  private updateScore(score: number): void {
    this.scoreTarget.innerText = score.toString();
  }

  private updateInstructions(status: SnakeGameStatus): void {
    switch (status) {
      case SnakeGameStatus.STARTED:
        this.instructionsLabel = 'Press Spacebar to pause';
        break;
      case SnakeGameStatus.STOPPED:
        this.instructionsLabel = 'Press Spacebar to resume';
        break;
      case SnakeGameStatus.DIED:
        this.instructionsLabel = 'Press Spacebar to play again';
        break;
    }
  }

  private updateCanvasMessage(status: SnakeGameStatus): void {
    this.canvasMessage = status === SnakeGameStatus.DIED ? 'Game Over' : '';
  }

  private set instructionsLabel(label: string) {
    this.instructionsTarget.innerText = label;
  }

  private set canvasMessage(label: string) {
    this.canvasMessageTarget.innerText = label;
  }
}
