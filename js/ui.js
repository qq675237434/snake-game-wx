/**
 * 贪吃蛇微信小游戏 - UI 渲染
 * 纯 Canvas 绘制所有界面：菜单、HUD、暂停、游戏结束、皮肤选择
 * @module ui
 */

const {
  SCREEN_WIDTH, SCREEN_HEIGHT, GRID_SIZE,
  LAYOUT, COLORS, DIFFICULTY_NAMES, GameState, COMMENT_CONFIG
} = require('./config');

/**
 * UI 管理器
 */
class UI {
  constructor() {
    /** @type {Array<{id: string, x: number, y: number, w: number, h: number}>} 当前屏幕上的可点击区域 */
    this.buttons = [];
  }

  /**
   * 清空按钮列表（每帧绘制前调用）
   */
  clearButtons() {
    this.buttons = [];
  }

  /**
   * 注册一个可点击按钮区域
   * @private
   */
  _addButton(id, x, y, w, h) {
    this.buttons.push({ id, x, y, w, h });
  }

  /**
   * 点击检测
   * @param {number} tx - 触摸 X
   * @param {number} ty - 触摸 Y
   * @returns {string|null} 命中的按钮 id
   */
  hitTest(tx, ty) {
    for (let i = this.buttons.length - 1; i >= 0; i--) {
      const b = this.buttons[i];
      if (tx >= b.x && tx <= b.x + b.w && ty >= b.y && ty <= b.y + b.h) {
        return b.id;
      }
    }
    return null;
  }

  // ========================================
  // 主菜单
  // ========================================

  /**
   * 绘制主菜单
   * @param {CanvasRenderingContext2D} ctx
   * @param {string} selectedDifficulty
   * @param {Object} skinManager
   */
  drawMenu(ctx, selectedDifficulty, skinManager) {
    // 背景
    ctx.fillStyle = COLORS.BACKGROUND;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    const centerX = SCREEN_WIDTH / 2;
    let y = SCREEN_HEIGHT * 0.08;

    // 标题
    ctx.fillStyle = COLORS.UI.TITLE;
    ctx.font = 'bold ' + Math.floor(SCREEN_WIDTH * 0.1) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🐍 贪吃蛇', centerX, y + SCREEN_WIDTH * 0.1);
    y += SCREEN_WIDTH * 0.13;

    ctx.fillStyle = COLORS.UI.SUBTITLE;
    ctx.font = Math.floor(SCREEN_WIDTH * 0.04) + 'px sans-serif';
    ctx.fillText('Snake Game', centerX, y + SCREEN_WIDTH * 0.04);
    y += SCREEN_WIDTH * 0.1;

    // 难度选择标题
    ctx.fillStyle = COLORS.UI.TITLE;
    ctx.font = 'bold ' + Math.floor(SCREEN_WIDTH * 0.05) + 'px sans-serif';
    ctx.fillText('🎯 选择难度', centerX, y);
    y += SCREEN_WIDTH * 0.06;

    // 难度按钮
    const btnW = SCREEN_WIDTH * 0.75;
    const btnH = SCREEN_WIDTH * 0.12;
    const btnX = (SCREEN_WIDTH - btnW) / 2;
    const gap = SCREEN_WIDTH * 0.03;

    ['easy', 'hard', 'hell'].forEach(diff => {
      const info = DIFFICULTY_NAMES[diff];
      const isSelected = diff === selectedDifficulty;

      // 按钮背景
      ctx.fillStyle = isSelected ? info.color : 'rgba(255,255,255,0.08)';
      this._roundRect(ctx, btnX, y, btnW, btnH, 8);

      // 按钮边框
      ctx.strokeStyle = isSelected ? info.color : 'rgba(255,255,255,0.2)';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.stroke();

      // 按钮文字
      ctx.fillStyle = COLORS.UI.TITLE;
      ctx.font = 'bold ' + Math.floor(SCREEN_WIDTH * 0.045) + 'px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(info.icon + ' ' + info.text, btnX + btnW * 0.08, y + btnH * 0.65);

      this._addButton('difficulty_' + diff, btnX, y, btnW, btnH);
      y += btnH + gap;
    });

    y += SCREEN_WIDTH * 0.04;

    // 皮肤选择按钮
    const skinBtnH = SCREEN_WIDTH * 0.13;
    ctx.fillStyle = 'rgba(255, 152, 0, 0.2)';
    this._roundRect(ctx, btnX, y, btnW, skinBtnH, 8);
    ctx.strokeStyle = '#FF9800';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = COLORS.UI.TITLE;
    ctx.font = 'bold ' + Math.floor(SCREEN_WIDTH * 0.045) + 'px sans-serif';
    ctx.textAlign = 'center';
    const currentSkin = skinManager.getCurrentSkin();
    ctx.fillText('🎨 皮肤: ' + currentSkin.icon + ' ' + currentSkin.name, centerX, y + skinBtnH * 0.62);
    this._addButton('skin_select', btnX, y, btnW, skinBtnH);
    y += skinBtnH + SCREEN_WIDTH * 0.08;

    // 开始按钮
    const startBtnH = SCREEN_WIDTH * 0.15;
    ctx.fillStyle = COLORS.UI.BTN_BG;
    this._roundRect(ctx, btnX, y, btnW, startBtnH, 12);

    ctx.fillStyle = COLORS.UI.BTN_TEXT;
    ctx.font = 'bold ' + Math.floor(SCREEN_WIDTH * 0.065) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('开始游戏', centerX, y + startBtnH * 0.65);
    this._addButton('start', btnX, y, btnW, startBtnH);
  }

  // ========================================
  // 皮肤选择界面
  // ========================================

  /**
   * 绘制皮肤选择界面
   * @param {CanvasRenderingContext2D} ctx
   * @param {Object} skinManager
   */
  drawSkinSelect(ctx, skinManager) {
    ctx.fillStyle = COLORS.BACKGROUND;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    const centerX = SCREEN_WIDTH / 2;
    let y = SCREEN_HEIGHT * 0.06;

    // 标题
    ctx.fillStyle = COLORS.UI.TITLE;
    ctx.font = 'bold ' + Math.floor(SCREEN_WIDTH * 0.07) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎨 选择皮肤', centerX, y + SCREEN_WIDTH * 0.07);
    y += SCREEN_WIDTH * 0.14;

    // 皮肤网格
    const skins = skinManager.getAllSkins();
    const skinIds = Object.keys(skins);
    const cols = 3;
    const cellW = SCREEN_WIDTH * 0.28;
    const cellH = SCREEN_WIDTH * 0.32;
    const gapX = (SCREEN_WIDTH - cols * cellW) / (cols + 1);
    const gapY = SCREEN_WIDTH * 0.03;

    skinIds.forEach((skinId, idx) => {
      const skin = skins[skinId];
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const cx = gapX + col * (cellW + gapX);
      const cy = y + row * (cellH + gapY);

      const isUnlocked = skinManager.isUnlocked(skinId);
      const isSelected = skinManager.selectedSkinId === skinId;

      // 卡片背景
      ctx.fillStyle = isSelected ? 'rgba(76,175,80,0.2)' : 'rgba(255,255,255,0.05)';
      this._roundRect(ctx, cx, cy, cellW, cellH, 8);
      ctx.strokeStyle = isSelected ? '#4CAF50' : 'rgba(255,255,255,0.15)';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.stroke();

      // 图标
      ctx.font = Math.floor(SCREEN_WIDTH * 0.08) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = isUnlocked ? COLORS.UI.TITLE : 'rgba(255,255,255,0.3)';
      ctx.fillText(skin.icon, cx + cellW / 2, cy + cellH * 0.4);

      // 名称
      ctx.font = Math.floor(SCREEN_WIDTH * 0.033) + 'px sans-serif';
      ctx.fillText(skin.name, cx + cellW / 2, cy + cellH * 0.65);

      // 锁/描述
      ctx.font = Math.floor(SCREEN_WIDTH * 0.025) + 'px sans-serif';
      ctx.fillStyle = COLORS.UI.SUBTITLE;
      if (!isUnlocked) {
        ctx.fillText('🔒 未解锁', cx + cellW / 2, cy + cellH * 0.85);
      } else {
        ctx.fillText(skin.description, cx + cellW / 2, cy + cellH * 0.85);
      }

      if (isUnlocked) {
        this._addButton('skin_' + skinId, cx, cy, cellW, cellH);
      }
    });

    // 返回按钮
    const backY = SCREEN_HEIGHT - SCREEN_WIDTH * 0.2;
    const backW = SCREEN_WIDTH * 0.5;
    const backH = SCREEN_WIDTH * 0.12;
    const backX = (SCREEN_WIDTH - backW) / 2;
    ctx.fillStyle = COLORS.UI.BTN_SELECTED;
    this._roundRect(ctx, backX, backY, backW, backH, 8);
    ctx.fillStyle = COLORS.UI.BTN_TEXT;
    ctx.font = 'bold ' + Math.floor(SCREEN_WIDTH * 0.045) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('返回', centerX, backY + backH * 0.65);
    this._addButton('skin_back', backX, backY, backW, backH);
  }

  // ========================================
  // 游戏 HUD（分数栏 + 暂停按钮）
  // ========================================

  /**
   * 绘制游戏 HUD
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} score
   * @param {number} highScore
   * @param {string} difficulty
   */
  drawHUD(ctx, score, highScore, difficulty) {
    const h = LAYOUT.HEADER_HEIGHT;
    const diffInfo = DIFFICULTY_NAMES[difficulty];

    // 头部栏背景
    ctx.fillStyle = COLORS.UI.HEADER_BG;
    ctx.fillRect(0, 0, SCREEN_WIDTH, h);

    const fontSize = Math.floor(h * 0.4);
    ctx.font = 'bold ' + fontSize + 'px sans-serif';
    ctx.textAlign = 'left';

    // 得分
    ctx.fillStyle = COLORS.UI.SCORE;
    ctx.fillText('得分: ' + score, SCREEN_WIDTH * 0.04, h * 0.65);

    // 最高分
    ctx.fillStyle = COLORS.UI.SUBTITLE;
    ctx.font = Math.floor(h * 0.3) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('最高: ' + highScore, SCREEN_WIDTH * 0.5, h * 0.65);

    // 难度
    ctx.textAlign = 'right';
    ctx.fillStyle = diffInfo.color;
    ctx.font = 'bold ' + Math.floor(h * 0.35) + 'px sans-serif';
    ctx.fillText(diffInfo.icon + diffInfo.text, SCREEN_WIDTH * 0.82, h * 0.65);

    // 暂停按钮
    const pauseSize = h * 0.6;
    const pauseX = SCREEN_WIDTH - pauseSize - SCREEN_WIDTH * 0.03;
    const pauseY = (h - pauseSize) / 2;
    ctx.fillStyle = COLORS.UI.PAUSE_BTN;
    this._roundRect(ctx, pauseX, pauseY, pauseSize, pauseSize, 4);
    ctx.fillStyle = COLORS.UI.TITLE;
    ctx.font = Math.floor(pauseSize * 0.6) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⏸', pauseX + pauseSize / 2, pauseY + pauseSize * 0.72);
    this._addButton('pause', pauseX, pauseY, pauseSize, pauseSize);
  }

  // ========================================
  // 虚拟方向键
  // ========================================

  /**
   * 绘制虚拟方向键
   * @param {CanvasRenderingContext2D} ctx
   */
  drawDPad(ctx) {
    const footerY = LAYOUT.FOOTER_Y;
    const footerH = LAYOUT.FOOTER_HEIGHT;
    const centerX = SCREEN_WIDTH / 2;
    const centerY = footerY + footerH / 2;
    const btnSize = Math.min(SCREEN_WIDTH * 0.16, footerH * 0.32);
    const gap = btnSize * 0.15;

    // 上
    const upX = centerX - btnSize / 2;
    const upY = centerY - btnSize - gap - btnSize / 2;
    this._drawDPadButton(ctx, upX, upY, btnSize, '▲');
    this._addButton('dpad_up', upX, upY, btnSize, btnSize);

    // 下
    const downX = centerX - btnSize / 2;
    const downY = centerY + gap - btnSize / 2;
    this._drawDPadButton(ctx, downX, downY, btnSize, '▼');
    this._addButton('dpad_down', downX, downY, btnSize, btnSize);

    // 左
    const leftX = centerX - btnSize - gap - btnSize / 2;
    const leftY = centerY - btnSize / 2 - btnSize / 2;
    this._drawDPadButton(ctx, leftX, leftY, btnSize, '◀');
    this._addButton('dpad_left', leftX, leftY, btnSize, btnSize);

    // 右
    const rightX = centerX + gap + btnSize / 2;
    const rightY = centerY - btnSize / 2 - btnSize / 2;
    this._drawDPadButton(ctx, rightX, rightY, btnSize, '▶');
    this._addButton('dpad_right', rightX, rightY, btnSize, btnSize);
  }

  /** @private 绘制单个方向键 */
  _drawDPadButton(ctx, x, y, size, arrow) {
    ctx.fillStyle = COLORS.UI.DPAD_BG;
    this._roundRect(ctx, x, y, size, size, 10);

    ctx.fillStyle = COLORS.UI.DPAD_ARROW;
    ctx.font = Math.floor(size * 0.5) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(arrow, x + size / 2, y + size * 0.65);
  }

  // ========================================
  // 暂停界面
  // ========================================

  /**
   * 绘制暂停覆盖层
   * @param {CanvasRenderingContext2D} ctx
   */
  drawPaused(ctx) {
    // 半透明遮罩
    ctx.fillStyle = COLORS.UI.OVERLAY;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    const centerX = SCREEN_WIDTH / 2;
    const centerY = SCREEN_HEIGHT * 0.4;

    ctx.fillStyle = COLORS.UI.TITLE;
    ctx.font = 'bold ' + Math.floor(SCREEN_WIDTH * 0.08) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('游戏暂停', centerX, centerY);

    // 继续按钮
    const btnW = SCREEN_WIDTH * 0.55;
    const btnH = SCREEN_WIDTH * 0.13;
    const btnX = (SCREEN_WIDTH - btnW) / 2;
    let btnY = centerY + SCREEN_WIDTH * 0.08;

    ctx.fillStyle = COLORS.UI.BTN_BG;
    this._roundRect(ctx, btnX, btnY, btnW, btnH, 10);
    ctx.fillStyle = COLORS.UI.BTN_TEXT;
    ctx.font = 'bold ' + Math.floor(SCREEN_WIDTH * 0.05) + 'px sans-serif';
    ctx.fillText('继续游戏', centerX, btnY + btnH * 0.65);
    this._addButton('resume', btnX, btnY, btnW, btnH);

    // 返回菜单
    btnY += btnH + SCREEN_WIDTH * 0.04;
    ctx.fillStyle = COLORS.UI.BTN_SELECTED;
    this._roundRect(ctx, btnX, btnY, btnW, btnH, 10);
    ctx.fillStyle = COLORS.UI.BTN_TEXT;
    ctx.fillText('返回菜单', centerX, btnY + btnH * 0.65);
    this._addButton('menu', btnX, btnY, btnW, btnH);
  }

  // ========================================
  // 游戏结束界面
  // ========================================

  /**
   * 绘制游戏结束界面
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} score
   * @param {number} highScore
   * @param {boolean} isNewRecord
   * @param {boolean} canRevive - 是否可以复活（广告）
   * @param {string} difficulty
   */
  drawGameOver(ctx, score, highScore, isNewRecord, canRevive, difficulty) {
    // 半透明遮罩
    ctx.fillStyle = COLORS.UI.OVERLAY;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    const centerX = SCREEN_WIDTH / 2;
    let y = SCREEN_HEIGHT * 0.25;

    // 标题
    ctx.fillStyle = COLORS.UI.TITLE;
    ctx.font = 'bold ' + Math.floor(SCREEN_WIDTH * 0.08) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束', centerX, y);
    y += SCREEN_WIDTH * 0.12;

    // 分数
    ctx.fillStyle = COLORS.UI.SCORE;
    ctx.font = 'bold ' + Math.floor(SCREEN_WIDTH * 0.12) + 'px sans-serif';
    ctx.fillText(score, centerX, y);
    y += SCREEN_WIDTH * 0.06;

    // 新纪录标识
    if (isNewRecord) {
      ctx.fillStyle = '#FF5252';
      ctx.font = Math.floor(SCREEN_WIDTH * 0.045) + 'px sans-serif';
      ctx.fillText('🎉 新纪录！', centerX, y);
      y += SCREEN_WIDTH * 0.06;
    }

    // 最高分和难度
    ctx.fillStyle = COLORS.UI.SUBTITLE;
    ctx.font = Math.floor(SCREEN_WIDTH * 0.04) + 'px sans-serif';
    const diffInfo = DIFFICULTY_NAMES[difficulty];
    ctx.fillText('最高分: ' + highScore + '  |  难度: ' + diffInfo.text, centerX, y);
    y += SCREEN_WIDTH * 0.1;

    const btnW = SCREEN_WIDTH * 0.6;
    const btnH = SCREEN_WIDTH * 0.13;
    const btnX = (SCREEN_WIDTH - btnW) / 2;

    // 【广告预留】激励视频复活按钮
    if (canRevive) {
      ctx.fillStyle = '#FF9800';
      this._roundRect(ctx, btnX, y, btnW, btnH, 10);
      ctx.fillStyle = COLORS.UI.BTN_TEXT;
      ctx.font = 'bold ' + Math.floor(SCREEN_WIDTH * 0.045) + 'px sans-serif';
      ctx.fillText('📺 看广告复活', centerX, y + btnH * 0.65);
      this._addButton('revive', btnX, y, btnW, btnH);
      y += btnH + SCREEN_WIDTH * 0.04;
    }

    // 重新开始
    ctx.fillStyle = COLORS.UI.BTN_BG;
    this._roundRect(ctx, btnX, y, btnW, btnH, 10);
    ctx.fillStyle = COLORS.UI.BTN_TEXT;
    ctx.font = 'bold ' + Math.floor(SCREEN_WIDTH * 0.05) + 'px sans-serif';
    ctx.fillText('重新开始', centerX, y + btnH * 0.65);
    this._addButton('restart', btnX, y, btnW, btnH);

    // 返回菜单
    y += btnH + SCREEN_WIDTH * 0.04;
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    this._roundRect(ctx, btnX, y, btnW, btnH, 10);
    ctx.fillStyle = COLORS.UI.SUBTITLE;
    ctx.font = Math.floor(SCREEN_WIDTH * 0.045) + 'px sans-serif';
    ctx.fillText('返回菜单', centerX, y + btnH * 0.65);
    this._addButton('menu', btnX, y, btnW, btnH);

    // 【广告预留】分享按钮
    y += btnH + SCREEN_WIDTH * 0.04;
    ctx.fillStyle = 'rgba(76,175,80,0.15)';
    this._roundRect(ctx, btnX, y, btnW, btnH, 10);
    ctx.fillStyle = '#4CAF50';
    ctx.font = Math.floor(SCREEN_WIDTH * 0.045) + 'px sans-serif';
    ctx.fillText('📤 分享给好友', centerX, y + btnH * 0.65);
    this._addButton('share', btnX, y, btnW, btnH);

    // 查看评论按钮
    y += btnH + SCREEN_WIDTH * 0.04;
    ctx.fillStyle = 'rgba(255, 152, 0, 0.15)';
    this._roundRect(ctx, btnX, y, btnW, btnH, 10);
    ctx.fillStyle = '#FF9800';
    ctx.font = Math.floor(SCREEN_WIDTH * 0.045) + 'px sans-serif';
    ctx.fillText('💬 查看评论', centerX, y + btnH * 0.65);
    this._addButton('comments', btnX, y, btnW, btnH);

    // 【广告预留】Banner 广告位置标记
    // TODO: 上线后在此区域下方展示 Banner 广告
    // wx.createBannerAd({ adUnitId: AD_CONFIG.BANNER_AD_UNIT_ID, ... })
  }

  // ========================================
  // 游戏区域背景（网格线）
  // ========================================

  /**
   * 绘制游戏区域背景和网格
   * @param {CanvasRenderingContext2D} ctx
   */
  drawGameBackground(ctx) {
    const areaY = LAYOUT.GAME_AREA_Y;
    const areaH = LAYOUT.GAME_AREA_HEIGHT;

    // 游戏区域背景
    ctx.fillStyle = COLORS.GAME_BG;
    ctx.fillRect(0, areaY, SCREEN_WIDTH, areaH);

    // 网格线
    ctx.strokeStyle = COLORS.GRID_LINE;
    ctx.lineWidth = 1;

    // 垂直线
    for (let x = 0; x <= SCREEN_WIDTH; x += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, areaY);
      ctx.lineTo(x, areaY + areaH);
      ctx.stroke();
    }
    // 水平线
    for (let y = areaY; y <= areaY + areaH; y += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(SCREEN_WIDTH, y);
      ctx.stroke();
    }

    // 底部控制区域背景
    ctx.fillStyle = COLORS.BACKGROUND;
    ctx.fillRect(0, LAYOUT.FOOTER_Y, SCREEN_WIDTH, LAYOUT.FOOTER_HEIGHT);
  }

  // ========================================
  // 工具方法
  // ========================================

  /**
   * 绘制圆角矩形（填充 + 预备描边路径）
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

  // ========================================
  // 评论列表界面
  // ========================================

  /**
   * 绘制评论列表页
   * @param {CanvasRenderingContext2D} ctx
   * @param {CommentManager} commentManager
   */
  drawComments(ctx, commentManager) {
    ctx.fillStyle = COLORS.BACKGROUND;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    const centerX = SCREEN_WIDTH / 2;
    const margin = SCREEN_WIDTH * 0.05;
    let y = SCREEN_HEIGHT * 0.04;

    // 标题栏
    ctx.fillStyle = COLORS.UI.TITLE;
    ctx.font = 'bold ' + Math.floor(SCREEN_WIDTH * 0.06) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('💬 玩家评论 (' + commentManager.totalCount + ')', centerX, y + SCREEN_WIDTH * 0.06);
    y += SCREEN_WIDTH * 0.1;

    // 写评论按钮
    const writeBtnW = SCREEN_WIDTH * 0.4;
    const writeBtnH = SCREEN_WIDTH * 0.1;
    const writeBtnX = SCREEN_WIDTH - margin - writeBtnW;
    ctx.fillStyle = '#4CAF50';
    this._roundRect(ctx, writeBtnX, y, writeBtnW, writeBtnH, 6);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold ' + Math.floor(SCREEN_WIDTH * 0.035) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✏️ 写评论', writeBtnX + writeBtnW / 2, y + writeBtnH * 0.65);
    this._addButton('write_comment', writeBtnX, y, writeBtnW, writeBtnH);
    y += writeBtnH + SCREEN_WIDTH * 0.04;

    // 评论列表
    const comments = commentManager.getPageComments();
    const itemH = SCREEN_WIDTH * 0.2;
    const listW = SCREEN_WIDTH - margin * 2;

    if (comments.length === 0) {
      ctx.fillStyle = COLORS.UI.SUBTITLE;
      ctx.font = Math.floor(SCREEN_WIDTH * 0.04) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('暂无评论，快来发第一条吧！', centerX, y + SCREEN_WIDTH * 0.15);
    } else {
      comments.forEach((comment, idx) => {
        const itemY = y + idx * (itemH + SCREEN_WIDTH * 0.02);
        if (itemY + itemH > SCREEN_HEIGHT - SCREEN_WIDTH * 0.2) return; // 超出屏幕不绘制

        // 卡片背景
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        this._roundRect(ctx, margin, itemY, listW, itemH, 8);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();

        const textX = margin + SCREEN_WIDTH * 0.04;
        const isLiked = commentManager.isLiked(comment.id);

        // 昵称 + 分数
        ctx.fillStyle = '#FF9800';
        ctx.font = 'bold ' + Math.floor(SCREEN_WIDTH * 0.033) + 'px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(comment.nickname, textX, itemY + itemH * 0.25);

        // 分数徽章
        const scoreText = comment.score + '分 · ' + (DIFFICULTY_NAMES[comment.difficulty] || {}).text;
        ctx.fillStyle = COLORS.UI.SUBTITLE;
        ctx.font = Math.floor(SCREEN_WIDTH * 0.025) + 'px sans-serif';
        ctx.fillText(scoreText, textX + SCREEN_WIDTH * 0.3, itemY + itemH * 0.25);

        // 评论内容
        ctx.fillStyle = COLORS.UI.TITLE;
        ctx.font = Math.floor(SCREEN_WIDTH * 0.035) + 'px sans-serif';
        ctx.fillText(comment.content, textX, itemY + itemH * 0.55);

        // 时间
        ctx.fillStyle = COLORS.UI.SUBTITLE;
        ctx.font = Math.floor(SCREEN_WIDTH * 0.023) + 'px sans-serif';
        ctx.fillText(commentManager.formatTime(comment.time), textX, itemY + itemH * 0.8);

        // 点赞按钮
        const likeX = margin + listW - SCREEN_WIDTH * 0.18;
        const likeY = itemY + itemH * 0.55;
        const likeW = SCREEN_WIDTH * 0.15;
        const likeH = SCREEN_WIDTH * 0.08;

        ctx.fillStyle = isLiked ? 'rgba(244,67,54,0.2)' : 'rgba(255,255,255,0.08)';
        this._roundRect(ctx, likeX, likeY, likeW, likeH, 4);

        ctx.fillStyle = isLiked ? '#F44336' : COLORS.UI.SUBTITLE;
        ctx.font = Math.floor(SCREEN_WIDTH * 0.028) + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText((isLiked ? '❤️ ' : '🤍 ') + comment.likes, likeX + likeW / 2, likeY + likeH * 0.68);
        this._addButton('like_' + comment.id, likeX, likeY, likeW, likeH);
      });
    }

    // 底部导航栏
    const navY = SCREEN_HEIGHT - SCREEN_WIDTH * 0.16;
    const navH = SCREEN_WIDTH * 0.1;
    const navBtnW = SCREEN_WIDTH * 0.22;

    // 上一页
    if (commentManager.page > 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      this._roundRect(ctx, margin, navY, navBtnW, navH, 6);
      ctx.fillStyle = COLORS.UI.TITLE;
      ctx.font = Math.floor(SCREEN_WIDTH * 0.035) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('◀ 上一页', margin + navBtnW / 2, navY + navH * 0.65);
      this._addButton('comment_prev', margin, navY, navBtnW, navH);
    }

    // 页码
    ctx.fillStyle = COLORS.UI.SUBTITLE;
    ctx.font = Math.floor(SCREEN_WIDTH * 0.03) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText((commentManager.page + 1) + '/' + commentManager.totalPages, centerX, navY + navH * 0.65);

    // 下一页
    if (commentManager.page < commentManager.totalPages - 1) {
      const nextX = SCREEN_WIDTH - margin - navBtnW;
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      this._roundRect(ctx, nextX, navY, navBtnW, navH, 6);
      ctx.fillStyle = COLORS.UI.TITLE;
      ctx.font = Math.floor(SCREEN_WIDTH * 0.035) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('下一页 ▶', nextX + navBtnW / 2, navY + navH * 0.65);
      this._addButton('comment_next', nextX, navY, navBtnW, navH);
    }

    // 返回按钮
    const backY = SCREEN_HEIGHT - SCREEN_WIDTH * 0.05 - navH;
    const backW = SCREEN_WIDTH * 0.35;
    const backX = (SCREEN_WIDTH - backW) / 2;
    ctx.fillStyle = '#FF9800';
    this._roundRect(ctx, backX, navY + navH + SCREEN_WIDTH * 0.02, backW, navH, 6);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold ' + Math.floor(SCREEN_WIDTH * 0.035) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('返回', centerX, navY + navH + SCREEN_WIDTH * 0.02 + navH * 0.65);
    this._addButton('comment_back', backX, navY + navH + SCREEN_WIDTH * 0.02, backW, navH);
  }

  // ========================================
  // 评论输入界面（引导弹出键盘）
  // ========================================

  /**
   * 绘制写评论提示界面
   * @param {CanvasRenderingContext2D} ctx
   * @param {string} inputText - 当前输入文字
   */
  drawWritingComment(ctx, inputText) {
    // 半透明遮罩
    ctx.fillStyle = COLORS.UI.OVERLAY;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    const centerX = SCREEN_WIDTH / 2;
    const boxW = SCREEN_WIDTH * 0.85;
    const boxH = SCREEN_WIDTH * 0.55;
    const boxX = (SCREEN_WIDTH - boxW) / 2;
    const boxY = SCREEN_HEIGHT * 0.2;

    // 弹框背景
    ctx.fillStyle = '#1a1a2e';
    this._roundRect(ctx, boxX, boxY, boxW, boxH, 12);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 标题
    ctx.fillStyle = COLORS.UI.TITLE;
    ctx.font = 'bold ' + Math.floor(SCREEN_WIDTH * 0.05) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✏️ 写评论', centerX, boxY + boxW * 0.1);

    // 输入框显示区域
    const inputX = boxX + SCREEN_WIDTH * 0.04;
    const inputY = boxY + boxW * 0.15;
    const inputW = boxW - SCREEN_WIDTH * 0.08;
    const inputH = SCREEN_WIDTH * 0.12;

    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    this._roundRect(ctx, inputX, inputY, inputW, inputH, 6);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 输入内容或提示
    ctx.font = Math.floor(SCREEN_WIDTH * 0.035) + 'px sans-serif';
    ctx.textAlign = 'left';
    if (inputText) {
      ctx.fillStyle = COLORS.UI.TITLE;
      ctx.fillText(inputText, inputX + 10, inputY + inputH * 0.62);
    } else {
      ctx.fillStyle = COLORS.UI.SUBTITLE;
      ctx.fillText('点击输入你的评论...', inputX + 10, inputY + inputH * 0.62);
    }

    // 字数提示
    const charCount = (inputText || '').length;
    ctx.fillStyle = charCount > COMMENT_CONFIG.MAX_LENGTH * 0.8 ? '#F44336' : COLORS.UI.SUBTITLE;
    ctx.font = Math.floor(SCREEN_WIDTH * 0.025) + 'px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(charCount + '/' + COMMENT_CONFIG.MAX_LENGTH, inputX + inputW, inputY + inputH + SCREEN_WIDTH * 0.04);

    // 点击输入区域弹出键盘
    this._addButton('comment_input', inputX, inputY, inputW, inputH);

    // 发布按钮
    const btnY = inputY + inputH + SCREEN_WIDTH * 0.08;
    const btnW = boxW * 0.4;
    const btnH = SCREEN_WIDTH * 0.1;
    const gap = SCREEN_WIDTH * 0.03;

    // 取消
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    this._roundRect(ctx, boxX + boxW * 0.08, btnY, btnW, btnH, 6);
    ctx.fillStyle = COLORS.UI.SUBTITLE;
    ctx.font = 'bold ' + Math.floor(SCREEN_WIDTH * 0.04) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('取消', boxX + boxW * 0.08 + btnW / 2, btnY + btnH * 0.65);
    this._addButton('comment_cancel', boxX + boxW * 0.08, btnY, btnW, btnH);

    // 发布
    const publishX = boxX + boxW - boxW * 0.08 - btnW;
    ctx.fillStyle = inputText ? '#4CAF50' : COLORS.UI.BTN_DISABLED;
    this._roundRect(ctx, publishX, btnY, btnW, btnH, 6);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('发布', publishX + btnW / 2, btnY + btnH * 0.65);
    if (inputText) {
      this._addButton('comment_publish', publishX, btnY, btnW, btnH);
    }
  }
}

module.exports = UI;
