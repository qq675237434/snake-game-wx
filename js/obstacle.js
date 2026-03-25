/**
 * 贪吃蛇微信小游戏 - 障碍物逻辑
 * 管理障碍物的生成和绘制（地狱难度使用）
 * @module obstacle
 */

const { GRID_SIZE, GRID_COLS, LAYOUT, COLORS, OBSTACLE_COUNT, OBSTACLE_SAFE_DISTANCE } = require('./config');

/**
 * 障碍物管理器
 */
class ObstacleManager {
  constructor() {
    /** @type {Array<{x: number, y: number}>} 障碍物位置列表 */
    this.obstacles = [];
  }

  /**
   * 生成障碍物（避开蛇身和安全区域）
   * @param {Snake} snake - 蛇对象
   */
  generate(snake) {
    const gridRows = LAYOUT.GRID_ROWS;
    this.obstacles = [];

    for (let n = 0; n < OBSTACLE_COUNT; n++) {
      let ox, oy, isValid;
      do {
        isValid = true;
        ox = Math.floor(Math.random() * GRID_COLS);
        oy = Math.floor(Math.random() * gridRows);

        // 不能与蛇重叠
        if (snake.occupies({ x: ox, y: oy })) {
          isValid = false;
          continue;
        }

        // 与蛇头保持安全距离
        const head = snake.head;
        if (head && Math.abs(head.x - ox) + Math.abs(head.y - oy) < OBSTACLE_SAFE_DISTANCE) {
          isValid = false;
          continue;
        }

        // 不能与已有障碍物重叠
        for (let i = 0; i < this.obstacles.length; i++) {
          if (this.obstacles[i].x === ox && this.obstacles[i].y === oy) {
            isValid = false;
            break;
          }
        }
      } while (!isValid);

      this.obstacles.push({ x: ox, y: oy });
    }
  }

  /**
   * 清空障碍物
   */
  clear() {
    this.obstacles = [];
  }

  /**
   * 检查位置是否碰到障碍物
   * @param {{x: number, y: number}} pos
   * @returns {boolean}
   */
  collides(pos) {
    for (let i = 0; i < this.obstacles.length; i++) {
      if (this.obstacles[i].x === pos.x && this.obstacles[i].y === pos.y) {
        return true;
      }
    }
    return false;
  }

  /**
   * 检查位置是否被障碍物占据（食物生成用）
   * @param {{x: number, y: number}} pos
   * @returns {boolean}
   */
  occupies(pos) {
    return this.collides(pos);
  }

  /**
   * 绘制所有障碍物
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    if (this.obstacles.length === 0) return;
    const gameAreaY = LAYOUT.GAME_AREA_Y;

    for (let i = 0; i < this.obstacles.length; i++) {
      const obs = this.obstacles[i];
      const px = obs.x * GRID_SIZE;
      const py = obs.y * GRID_SIZE + gameAreaY;

      // 描边
      ctx.strokeStyle = COLORS.OBSTACLE_STROKE;
      ctx.lineWidth = 2;
      ctx.strokeRect(px + 2, py + 2, GRID_SIZE - 4, GRID_SIZE - 4);

      // 填充
      ctx.fillStyle = COLORS.OBSTACLE_FILL;
      ctx.fillRect(px + 4, py + 4, GRID_SIZE - 8, GRID_SIZE - 8);
    }
  }
}

module.exports = ObstacleManager;
