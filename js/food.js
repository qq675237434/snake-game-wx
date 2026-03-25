/**
 * 贪吃蛇微信小游戏 - 食物逻辑
 * 管理食物的生成和绘制
 * @module food
 */

const { GRID_SIZE, GRID_COLS, LAYOUT, COLORS } = require('./config');

/**
 * 食物类
 */
class Food {
  constructor() {
    /** @type {number} 网格 X 坐标 */
    this.x = 0;
    /** @type {number} 网格 Y 坐标 */
    this.y = 0;
  }

  /**
   * 在空闲位置生成食物
   * @param {Snake} snake - 蛇对象
   * @param {Obstacle[]} obstacles - ��碍物数组
   */
  generate(snake, obstacles) {
    const gridRows = LAYOUT.GRID_ROWS;
    let newX, newY, isValid;

    do {
      isValid = true;
      newX = Math.floor(Math.random() * GRID_COLS);
      newY = Math.floor(Math.random() * gridRows);

      // 不能与蛇重叠
      if (snake.occupies({ x: newX, y: newY })) {
        isValid = false;
        continue;
      }

      // 不能与障碍物重叠
      if (obstacles && obstacles.length > 0) {
        for (let i = 0; i < obstacles.length; i++) {
          if (obstacles[i].x === newX && obstacles[i].y === newY) {
            isValid = false;
            break;
          }
        }
      }
    } while (!isValid);

    this.x = newX;
    this.y = newY;
  }

  /**
   * 检查位置是否与食物重合
   * @param {{x: number, y: number}} pos
   * @returns {boolean}
   */
  isAt(pos) {
    return pos.x === this.x && pos.y === this.y;
  }

  /**
   * 绘制食物（圆形 + 高光）
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    const gameAreaY = LAYOUT.GAME_AREA_Y;
    const px = this.x * GRID_SIZE;
    const py = this.y * GRID_SIZE + gameAreaY;
    const centerX = px + GRID_SIZE / 2;
    const centerY = py + GRID_SIZE / 2;
    const radius = GRID_SIZE / 2 - 2;

    // 主体
    ctx.fillStyle = COLORS.FOOD;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // 高光
    ctx.fillStyle = COLORS.FOOD_HIGHLIGHT;
    ctx.beginPath();
    ctx.arc(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }
}

module.exports = Food;
