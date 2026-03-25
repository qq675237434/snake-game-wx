/**
 * 贪吃蛇微信小游戏 - 游戏主控制器
 * 管理游戏状态、循环、输入处理
 * @module main
 */

const {
  SCREEN_WIDTH, SCREEN_HEIGHT, GRID_SIZE, GRID_COLS,
  LAYOUT, COLORS, DIFFICULTY_SETTINGS, DIFFICULTY_NAMES,
  GameState, Direction, MIN_SPEED, AD_CONFIG
} = require('./config');
const Snake = require('./snake');
const Food = require('./food');
const ObstacleManager = require('./obstacle');
const { SkinManager } = require('./skin');
const UI = require('./ui');
const AudioManager = require('./audio');
const CommentManager = require('./comment');

/**
 * 游戏主类
 */
class Game {
  /**
   * @param {HTMLCanvasElement} canvas - 主屏画布
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;

    /** @type {string} 游戏状态 */
    this.state = GameState.MENU;
    /** @type {string} 当前难度 */
    this.currentDifficulty = 'easy';
    /** @type {number} 当前分数 */
    this.score = 0;
    /** @type {number} 当前速度（毫秒/帧） */
    this.speed = 125;

    /** @type {Snake} 蛇 */
    this.snake = null;
    /** @type {Food} 食物 */
    this.food = null;
    /** @type {ObstacleManager} 障碍物管理器 */
    this.obstacleManager = new ObstacleManager();

    /** @type {number|null} 游戏循环定时器 */
    this.gameTimer = null;
    /** @type {number} 已完成局数（用于广告间隔） */
    this.roundCount = 0;
    /** @type {boolean} 本局是否已使用复活 */
    this.revived = false;

    // 管理器
    this.skinManager = new SkinManager();
    this.ui = new UI();
    this.audio = new AudioManager();
    this.commentManager = new CommentManager();

    /** @type {string} 当前评论输入文字 */
    this._commentInput = '';

    // 触摸状态
    this._touchStartX = 0;
    this._touchStartY = 0;
    this._touchStartTime = 0;

    this._bindInput();
    this._setupShare();
    this._render();
  }

  // ========================================
  // 输入处理
  // ========================================

  /** @private 绑定触摸事件 */
  _bindInput() {
    wx.onTouchStart(res => {
      const touch = res.touches[0];
      this._touchStartX = touch.clientX;
      this._touchStartY = touch.clientY;
      this._touchStartTime = Date.now();
      this._handleTap(touch.clientX, touch.clientY);
    });

    wx.onTouchEnd(res => {
      const touch = res.changedTouches[0];
      const dx = touch.clientX - this._touchStartX;
      const dy = touch.clientY - this._touchStartY;
      const dt = Date.now() - this._touchStartTime;

      // 滑动识别：位移 > 30px 且时间 < 300ms
      if (this.state === GameState.PLAYING && Math.max(Math.abs(dx), Math.abs(dy)) > 30 && dt < 300) {
        this._handleSwipe(dx, dy);
      }
    });
  }

  /** @private 处理点击 */
  _handleTap(x, y) {
    const btnId = this.ui.hitTest(x, y);
    if (!btnId) return;

    switch (this.state) {
      case GameState.MENU:
        if (btnId.startsWith('difficulty_')) {
          this.currentDifficulty = btnId.replace('difficulty_', '');
          this._render();
        } else if (btnId === 'skin_select') {
          this.state = GameState.SKIN_SELECT;
          this._render();
        } else if (btnId === 'start') {
          this._startGame();
        }
        break;

      case GameState.SKIN_SELECT:
        if (btnId.startsWith('skin_') && btnId !== 'skin_back' && btnId !== 'skin_select') {
          this.skinManager.selectSkin(btnId.replace('skin_', ''));
          this._render();
        } else if (btnId === 'skin_back') {
          this.state = GameState.MENU;
          this._render();
        }
        break;

      case GameState.PLAYING:
        if (btnId === 'pause') {
          this._pause();
        } else if (btnId === 'dpad_up') {
          this.snake.changeDirection(Direction.UP);
        } else if (btnId === 'dpad_down') {
          this.snake.changeDirection(Direction.DOWN);
        } else if (btnId === 'dpad_left') {
          this.snake.changeDirection(Direction.LEFT);
        } else if (btnId === 'dpad_right') {
          this.snake.changeDirection(Direction.RIGHT);
        }
        break;

      case GameState.PAUSED:
        if (btnId === 'resume') this._resume();
        else if (btnId === 'menu') this._returnToMenu();
        break;

      case GameState.GAME_OVER:
        if (btnId === 'restart') this._startGame();
        else if (btnId === 'menu') this._returnToMenu();
        else if (btnId === 'share') this._shareResult();
        else if (btnId === 'revive') this._tryRevive();
        else if (btnId === 'comments') {
          this.commentManager.resetPage();
          this.state = GameState.COMMENTS;
          this._render();
        }
        break;

      case GameState.COMMENTS:
        if (btnId === 'comment_back') {
          this.state = GameState.GAME_OVER;
          this._render();
        } else if (btnId === 'comment_prev') {
          this.commentManager.prevPage();
          this._render();
        } else if (btnId === 'comment_next') {
          this.commentManager.nextPage();
          this._render();
        } else if (btnId === 'write_comment') {
          this._commentInput = '';
          this.state = GameState.WRITING_COMMENT;
          this._render();
          this._showKeyboard();
        } else if (btnId.startsWith('like_')) {
          this.commentManager.toggleLike(btnId.replace('like_', ''));
          this._render();
        }
        break;

      case GameState.WRITING_COMMENT:
        if (btnId === 'comment_cancel') {
          this._commentInput = '';
          this.state = GameState.COMMENTS;
          this._render();
        } else if (btnId === 'comment_publish') {
          this.commentManager.addComment(this._commentInput, this.score, this.currentDifficulty);
          this._commentInput = '';
          this.commentManager.resetPage();
          this.state = GameState.COMMENTS;
          this._render();
        } else if (btnId === 'comment_input') {
          this._showKeyboard();
        }
        break;
    }
  }

  /** @private 处理滑动方向 */
  _handleSwipe(dx, dy) {
    if (!this.snake) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      this.snake.changeDirection(dx > 0 ? Direction.RIGHT : Direction.LEFT);
    } else {
      this.snake.changeDirection(dy > 0 ? Direction.DOWN : Direction.UP);
    }
  }

  // ========================================
  // 游戏流程
  // ========================================

  /** @private 开始游戏 */
  _startGame() {
    const settings = DIFFICULTY_SETTINGS[this.currentDifficulty];

    // 初始化蛇
    const startX = Math.floor(GRID_COLS / 2);
    const startY = Math.floor(LAYOUT.GRID_ROWS / 2);
    this.snake = new Snake(startX, startY);

    // 初始化食物
    this.food = new Food();

    // 初始化障碍物
    this.obstacleManager = new ObstacleManager();
    if (settings.obstacles) {
      this.obstacleManager.generate(this.snake);
    }

    // 生成食物（避开蛇和障碍物）
    this.food.generate(this.snake, this.obstacleManager.obstacles);

    // 重置状态
    this.score = 0;
    this.speed = Math.floor(1000 / settings.initialSpeed);
    this.revived = false;
    this.state = GameState.PLAYING;

    this._startLoop();
  }

  /** @private 启动游戏循环 */
  _startLoop() {
    if (this.gameTimer) clearInterval(this.gameTimer);
    this.gameTimer = setInterval(() => this._update(), this.speed);
  }

  /** @private 暂停 */
  _pause() {
    this.state = GameState.PAUSED;
    if (this.gameTimer) { clearInterval(this.gameTimer); this.gameTimer = null; }
    this._render();
  }

  /** @private 继续 */
  _resume() {
    this.state = GameState.PLAYING;
    this._startLoop();
  }

  /** @private 返回主菜单 */
  _returnToMenu() {
    if (this.gameTimer) { clearInterval(this.gameTimer); this.gameTimer = null; }
    this.state = GameState.MENU;
    this._render();
  }

  /** @private 游戏结束 */
  _gameOver() {
    if (this.gameTimer) { clearInterval(this.gameTimer); this.gameTimer = null; }
    this.state = GameState.GAME_OVER;
    this.roundCount++;

    // 更新最高分
    const key = 'snakeHighScore_' + this.currentDifficulty;
    const prevHigh = wx.getStorageSync(key) || 0;
    if (this.score > prevHigh) {
      wx.setStorageSync(key, this.score);
    }

    // 皮肤解锁进度
    this.skinManager.recordScore(this.currentDifficulty, this.score);
    this._checkAchievements();

    // 【广告预留】插屏广告（每 N 局）
    // if (this.roundCount % AD_CONFIG.INTERSTITIAL_INTERVAL === 0) {
    //   const ad = wx.createInterstitialAd({ adUnitId: AD_CONFIG.INTERSTITIAL_AD_UNIT_ID });
    //   ad.show().catch(() => {});
    // }

    this._render();
  }

  /** @private 检查成就解锁 */
  _checkAchievements() {
    const easyHigh = wx.getStorageSync('snakeHighScore_easy') || 0;
    const hardHigh = wx.getStorageSync('snakeHighScore_hard') || 0;
    const hellHigh = wx.getStorageSync('snakeHighScore_hell') || 0;
    if (easyHigh > 0 && hardHigh > 0 && hellHigh > 0) {
      this.skinManager.recordAchievement('win_all_difficulties');
    }
    if (this.score >= 2000) {
      this.skinManager.recordAchievement('score_2000');
    }
  }

  // ========================================
  // 广告与分享
  // ========================================

  /** @private 尝试看广告复活 */
  _tryRevive() {
    // 【广告预留】上线后取消注释
    // const rewardedAd = wx.createRewardedVideoAd({ adUnitId: AD_CONFIG.REWARD_AD_UNIT_ID });
    // rewardedAd.show().catch(() => rewardedAd.load().then(() => rewardedAd.show()));
    // rewardedAd.onClose(res => { if (res && res.isEnded) this._doRevive(); });

    // 开发阶段直接复活
    this._doRevive();
  }

  /** @private 执行复活 */
  _doRevive() {
    if (!this.snake || this.snake.length <= 3) return;
    this.snake.segments.splice(-Math.floor(this.snake.length / 3));
    this.revived = true;
    this.state = GameState.PLAYING;
    this._startLoop();
  }

  /** @private 设置微信分享 */
  _setupShare() {
    wx.showShareMenu({ withShareTicket: true, menus: ['shareAppMessage', 'shareTimeline'] });
    wx.onShareAppMessage(() => ({
      title: '🐍 我在贪吃蛇拿了 ' + this.score + ' 分，来挑战我！'
    }));
  }

  /** @private 主动分享 */
  _shareResult() {
    wx.shareAppMessage({
      title: '🐍 我在贪吃蛇拿了 ' + this.score + ' 分，来挑战我！'
    });
  }

  /** @private 弹出微信键盘输入评论 */
  _showKeyboard() {
    wx.showKeyboard({
      defaultValue: this._commentInput || '',
      maxLength: 50,
      multiple: false,
      confirmHold: false,
      confirmType: 'done'
    });

    wx.onKeyboardInput(res => {
      this._commentInput = res.value || '';
      this._render();
    });

    wx.onKeyboardConfirm(res => {
      this._commentInput = res.value || '';
      this._render();
    });

    wx.onKeyboardComplete(res => {
      this._commentInput = res.value || '';
      this._render();
    });
  }

  // ========================================
  // 游戏循环
  // ========================================

  /** @private 每帧更新 */
  _update() {
    if (this.state !== GameState.PLAYING) return;

    // 预判是否吃到食物
    const nextX = this.snake.head.x + this.snake.direction.x;
    const nextY = this.snake.head.y + this.snake.direction.y;
    const willEat = this.food && nextX === this.food.x && nextY === this.food.y;

    // 移动蛇
    const newHead = this.snake.move(willEat);

    // 墙壁碰撞
    if (newHead.x < 0 || newHead.x >= GRID_COLS ||
        newHead.y < 0 || newHead.y >= LAYOUT.GRID_ROWS) {
      this._gameOver();
      return;
    }

    // 自身碰撞（从 index 1 开始）
    for (let i = 1; i < this.snake.segments.length; i++) {
      if (newHead.x === this.snake.segments[i].x && newHead.y === this.snake.segments[i].y) {
        this._gameOver();
        return;
      }
    }

    // 障碍物碰撞
    if (this.obstacleManager.collides(newHead)) {
      this._gameOver();
      return;
    }

    // 吃到食物
    if (willEat) {
      const settings = DIFFICULTY_SETTINGS[this.currentDifficulty];
      this.score += 10 * settings.scoreMultiplier;

      // 加速
      const newSpeed = 1000 / (1000 / this.speed + settings.speedIncrease);
      if (newSpeed > 0 && this.speed > MIN_SPEED) {
        this.speed = Math.max(MIN_SPEED, Math.floor(newSpeed));
        this._startLoop();
      }

      this.food.generate(this.snake, this.obstacleManager.obstacles);
    }

    this._render();
  }

  // ========================================
  // 渲染
  // ========================================

  /** @private 渲染当前帧 */
  _render() {
    const ctx = this.ctx;
    this.ui.clearButtons();

    switch (this.state) {
      case GameState.MENU:
        this.ui.drawMenu(ctx, this.currentDifficulty, this.skinManager);
        break;

      case GameState.SKIN_SELECT:
        this.ui.drawSkinSelect(ctx, this.skinManager);
        break;

      case GameState.COMMENTS:
        this.ui.drawComments(ctx, this.commentManager);
        break;

      case GameState.WRITING_COMMENT:
        this.ui.drawComments(ctx, this.commentManager);
        this.ui.drawWritingComment(ctx, this._commentInput);
        break;

      case GameState.PLAYING:
        this._drawGameFrame(ctx);
        break;

      case GameState.PAUSED:
        this._drawGameFrame(ctx);
        this.ui.drawPaused(ctx);
        break;

      case GameState.GAME_OVER: {
        this._drawGameFrame(ctx);
        const key = 'snakeHighScore_' + this.currentDifficulty;
        const highScore = wx.getStorageSync(key) || 0;
        const isNewRecord = this.score >= highScore && this.score > 0;
        const canRevive = !this.revived && this.snake && this.snake.length > 3;
        this.ui.drawGameOver(ctx, this.score, highScore, isNewRecord, canRevive, this.currentDifficulty);
        break;
      }
    }
  }

  /** @private 绘制完整游戏画面 */
  _drawGameFrame(ctx) {
    // 全屏背景
    ctx.fillStyle = COLORS.BACKGROUND;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // 游戏区域（网格）
    this.ui.drawGameBackground(ctx);

    // 障碍物
    this.obstacleManager.draw(ctx);

    // 食物
    if (this.food) this.food.draw(ctx);

    // 蛇
    if (this.snake) {
      this.snake.draw(ctx, this.skinManager.getCurrentSkin());
    }

    // HUD（分数栏）
    const key = 'snakeHighScore_' + this.currentDifficulty;
    const highScore = wx.getStorageSync(key) || 0;
    this.ui.drawHUD(ctx, this.score, highScore, this.currentDifficulty);

    // 虚拟方向键
    this.ui.drawDPad(ctx);
  }
}

module.exports = Game;
