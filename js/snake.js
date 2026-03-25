/**
 * 贪吃蛇微信小游戏 - 蛇逻辑
 * 管理蛇的移动、碰撞检测、绘制
 * @module snake
 */

const { GRID_SIZE, GRID_COLS, LAYOUT, COLORS, Direction } = require('./config');

/**
 * 蛇类
 */
class Snake {
  /**
   * @param {number} startX - 起始网格 X
   * @param {number} startY - 起始网格 Y
   */
  constructor(startX, startY) {
    /** @type {Array<{x: number, y: number}>} 蛇身段列表，[0] 为头 */
    this.segments = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY }
    ];
    /** @type {Object} 当前方向 */
    this.direction = Direction.RIGHT;
    /** @type {Object} 下一帧方向（防止同帧反转） */
    this.nextDirection = Direction.RIGHT;
    /** @type {number} 特效帧计数器 */
    this.effectFrame = 0;
  }

  /** 获取蛇头位置 */
  get head() {
    return this.segments[0];
  }

  /** 获取蛇身长度 */
  get length() {
    return this.segments.length;
  }

  /**
   * 改变方向（不允许 180° 反转）
   * @param {Object} newDir - Direction 枚举值
   */
  changeDirection(newDir) {
    const isOpposite =
      (newDir === Direction.UP && this.direction === Direction.DOWN) ||
      (newDir === Direction.DOWN && this.direction === Direction.UP) ||
      (newDir === Direction.LEFT && this.direction === Direction.RIGHT) ||
      (newDir === Direction.RIGHT && this.direction === Direction.LEFT);
    if (!isOpposite) {
      this.nextDirection = newDir;
    }
  }

  /**
   * 移动一步，返回新蛇头位置
   * @param {boolean} grow - 是否生长（吃到食物时不移除尾巴）
   * @returns {{x: number, y: number}} 新头部位置
   */
  move(grow) {
    this.direction = this.nextDirection;
    const newHead = {
      x: this.head.x + this.direction.x,
      y: this.head.y + this.direction.y
    };
    this.segments.unshift(newHead);
    if (!grow) {
      this.segments.pop();
    }
    return newHead;
  }

  /**
   * 检查位置是否与蛇身碰撞
   * @param {{x: number, y: number}} pos
   * @returns {boolean}
   */
  collidesWithSelf(pos) {
    for (let i = 0; i < this.segments.length; i++) {
      if (pos.x === this.segments[i].x && pos.y === this.segments[i].y) {
        return true;
      }
    }
    return false;
  }

  /**
   * 检查位置是否与蛇身任意部分重叠（用于食物/障碍物生成）
   * @param {{x: number, y: number}} pos
   * @returns {boolean}
   */
  occupies(pos) {
    for (let i = 0; i < this.segments.length; i++) {
      if (pos.x === this.segments[i].x && pos.y === this.segments[i].y) {
        return true;
      }
    }
    return false;
  }

  /**
   * 绘制蛇
   * @param {CanvasRenderingContext2D} ctx
   * @param {Object} skin - 当前皮肤对象
   */
  draw(ctx, skin) {
    this.effectFrame++;
    const gameAreaY = LAYOUT.GAME_AREA_Y;

    for (let i = 0; i < this.segments.length; i++) {
      const seg = this.segments[i];
      const px = seg.x * GRID_SIZE;
      const py = seg.y * GRID_SIZE + gameAreaY;
      const isHead = (i === 0);

      // 计算颜色
      let color;
      if (isHead) {
        color = this._getHeadColor(skin);
      } else {
        color = this._getBodyColor(skin, i);
      }

      // 绘制身段
      this._drawSegment(ctx, px, py, skin.shape, color, isHead);

      // 绘制特效
      if (skin.effect !== 'none') {
        this._drawEffect(ctx, px, py, skin, i, isHead);
      }

      // 绘制蛇头眼睛
      if (isHead) {
        this._drawEyes(ctx, px, py);
      }
    }
  }

  // ========================================
  // 颜色计算
  // ========================================

  /**
   * 获取蛇头颜色
   * @private
   */
  _getHeadColor(skin) {
    if (skin.effect === 'rainbow') {
      return 'hsl(' + ((this.effectFrame * 5) % 360) + ', 100%, 50%)';
    }
    return skin.headColor;
  }

  /**
   * 获取蛇身颜色
   * @private
   */
  _getBodyColor(skin, index) {
    if (skin.effect === 'rainbow') {
      return 'hsl(' + ((this.effectFrame * 5 + index * 10) % 360) + ', 100%, 50%)';
    }
    if (skin.bodyColor === 'gradient' || skin.bodyColor === '#gradient') {
      return this._interpolateColor(skin.headColor, '#000000', index / this.segments.length);
    }
    return skin.bodyColor;
  }

  // ========================================
  // 绘制身段
  // ========================================

  /**
   * 绘制单个蛇身段
   * @private
   */
  _drawSegment(ctx, x, y, shape, color, isHead) {
    ctx.fillStyle = color;
    const size = GRID_SIZE - 2;
    const centerX = x + GRID_SIZE / 2;
    const centerY = y + GRID_SIZE / 2;

    switch (shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'diamond':
        ctx.beginPath();
        ctx.moveTo(centerX, y + 1);
        ctx.lineTo(x + size, centerY);
        ctx.lineTo(centerX, y + size);
        ctx.lineTo(x + 1, centerY);
        ctx.closePath();
        ctx.fill();
        break;

      case 'arrow':
        if (isHead) {
          this._drawArrowHead(ctx, x, y, size, centerX, centerY);
        } else {
          this._roundRect(ctx, x + 1, y + 1, size, size, 2);
        }
        break;

      case 'square':
      default:
        this._roundRect(ctx, x + 1, y + 1, size, size, 4);
        break;
    }
  }

  /**
   * 绘制箭头形蛇头
   * @private
   */
  _drawArrowHead(ctx, x, y, size, centerX, centerY) {
    ctx.beginPath();
    const dir = this.direction;
    if (dir === Direction.RIGHT) {
      ctx.moveTo(x + size, centerY);
      ctx.lineTo(x + 2, y + 2);
      ctx.lineTo(x + 2, y + size);
    } else if (dir === Direction.LEFT) {
      ctx.moveTo(x + 2, centerY);
      ctx.lineTo(x + size - 2, y + 2);
      ctx.lineTo(x + size - 2, y + size);
    } else if (dir === Direction.UP) {
      ctx.moveTo(centerX, y + 2);
      ctx.lineTo(x + 2, y + size - 2);
      ctx.lineTo(x + size - 2, y + size - 2);
    } else {
      ctx.moveTo(centerX, y + size - 2);
      ctx.lineTo(x + 2, y + 2);
      ctx.lineTo(x + size - 2, y + 2);
    }
    ctx.closePath();
    ctx.fill();
  }

  // ========================================
  // 特效绘制
  // ========================================

  /**
   * 绘制特效
   * @private
   */
  _drawEffect(ctx, x, y, skin, index, isHead) {
    const centerX = x + GRID_SIZE / 2;
    const centerY = y + GRID_SIZE / 2;

    switch (skin.effect) {
      case 'flame':
        this._drawFlame(ctx, centerX, centerY, index);
        break;
      case 'sparkle':
        if (isHead && this.effectFrame % 20 < 10) {
          this._drawSparkle(ctx, centerX, centerY);
        }
        break;
      case 'glow':
        this._drawGlow(ctx, x, y, skin, index);
        break;
      // rainbow 效果已在颜色中处理
    }
  }

  /** @private 火焰特效 */
  _drawFlame(ctx, x, y, index) {
    const flicker = Math.sin(this.effectFrame * 0.5 + index) * 3;
    const alpha = Math.max(0, 0.6 - index * 0.05);
    ctx.fillStyle = 'rgba(255, ' + Math.floor(100 + flicker * 10) + ', 0, ' + alpha + ')';
    ctx.beginPath();
    ctx.arc(x, y - 5 + flicker, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  /** @private 闪光特效 */
  _drawSparkle(ctx, x, y) {
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(
        x + (Math.random() - 0.5) * 20,
        y + (Math.random() - 0.5) * 20,
        1.5, 0, Math.PI * 2
      );
      ctx.fill();
    }
  }

  /** @private 发光特效 */
  _drawGlow(ctx, x, y, skin, index) {
    const glowSize = GRID_SIZE + 4 - index * 0.1;
    ctx.save();
    ctx.shadowColor = skin.headColor;
    ctx.shadowBlur = 10;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(x - 2, y - 2, glowSize, glowSize);
    ctx.restore();
  }

  // ========================================
  // 眼睛绘制
  // ========================================

  /**
   * 绘制蛇头眼睛
   * @private
   */
  _drawEyes(ctx, x, y) {
    ctx.fillStyle = COLORS.EYE;
    const eyeSize = Math.max(2, GRID_SIZE * 0.15);
    const eyeOffset = GRID_SIZE * 0.25;
    let eye1X, eye1Y, eye2X, eye2Y;

    if (this.direction === Direction.RIGHT) {
      eye1X = x + GRID_SIZE - eyeOffset;
      eye1Y = y + eyeOffset;
      eye2X = x + GRID_SIZE - eyeOffset;
      eye2Y = y + GRID_SIZE - eyeOffset - eyeSize;
    } else if (this.direction === Direction.LEFT) {
      eye1X = x + eyeOffset - eyeSize;
      eye1Y = y + eyeOffset;
      eye2X = x + eyeOffset - eyeSize;
      eye2Y = y + GRID_SIZE - eyeOffset - eyeSize;
    } else if (this.direction === Direction.UP) {
      eye1X = x + eyeOffset;
      eye1Y = y + eyeOffset - eyeSize;
      eye2X = x + GRID_SIZE - eyeOffset - eyeSize;
      eye2Y = y + eyeOffset - eyeSize;
    } else {
      eye1X = x + eyeOffset;
      eye1Y = y + GRID_SIZE - eyeOffset;
      eye2X = x + GRID_SIZE - eyeOffset - eyeSize;
      eye2Y = y + GRID_SIZE - eyeOffset;
    }

    ctx.beginPath();
    ctx.arc(eye1X + eyeSize / 2, eye1Y + eyeSize / 2, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eye2X + eyeSize / 2, eye2Y + eyeSize / 2, eyeSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // ========================================
  // 工具方法
  // ========================================

  /**
   * 绘制圆角矩形
   * @private
   */
  _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * 颜色插值（用于渐变蛇身）
   * @private
   */
  _interpolateColor(color1, color2, ratio) {
    const hex1 = this._hexToRgb(color1);
    const hex2 = this._hexToRgb(color2);
    if (!hex1 || !hex2) return color1;
    const r = Math.round(hex1.r + (hex2.r - hex1.r) * ratio);
    const g = Math.round(hex1.g + (hex2.g - hex1.g) * ratio);
    const b = Math.round(hex1.b + (hex2.b - hex1.b) * ratio);
    return 'rgb(' + r + ', ' + g + ', ' + b + ')';
  }

  /**
   * HEX 转 RGB
   * @private
   */
  _hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
}

module.exports = Snake;
