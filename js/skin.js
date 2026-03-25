/**
 * 贪吃蛇微信小游戏 - 皮肤系统
 * 管理皮肤配置、解锁、选择和持久化
 * @module skin
 */

// ========================================
// 皮肤配置数据
// ========================================

/** 所有皮肤定义 */
const SKINS = {
  classic: {
    id: 'classic',
    name: '经典绿',
    icon: '🟢',
    headColor: '#22c55e',
    bodyColor: '#16a34a',
    shape: 'square',
    effect: 'none',
    unlockType: 'free',
    unlockCondition: null,
    description: '默认皮肤，经典回忆'
  },
  blue: {
    id: 'blue',
    name: '深海蓝',
    icon: '🔵',
    headColor: '#3b82f6',
    bodyColor: '#2563eb',
    shape: 'square',
    effect: 'none',
    unlockType: 'free',
    unlockCondition: null,
    description: '沉静的蓝色海洋'
  },
  red: {
    id: 'red',
    name: '火焰红',
    icon: '🔴',
    headColor: '#ef4444',
    bodyColor: '#dc2626',
    shape: 'square',
    effect: 'flame',
    unlockType: 'score',
    unlockCondition: 500,
    description: '燃烧吧！我的小宇宙'
  },
  purple: {
    id: 'purple',
    name: '神秘紫',
    icon: '🟣',
    headColor: '#a855f7',
    bodyColor: '#9333ea',
    shape: 'circle',
    effect: 'none',
    unlockType: 'score',
    unlockCondition: 300,
    description: '神秘而优雅'
  },
  gold: {
    id: 'gold',
    name: '黄金传说',
    icon: '🟡',
    headColor: '#eab308',
    bodyColor: '#ca8a04',
    shape: 'diamond',
    effect: 'sparkle',
    unlockType: 'score',
    unlockCondition: 1000,
    description: '传奇般的金色'
  },
  rainbow: {
    id: 'rainbow',
    name: '彩虹',
    icon: '🌈',
    headColor: '#ff0000',
    bodyColor: '#gradient',
    shape: 'circle',
    effect: 'rainbow',
    unlockType: 'achievement',
    unlockCondition: 'win_all_difficulties',
    description: '通关所有难度解锁'
  },
  neon: {
    id: 'neon',
    name: '霓虹灯',
    icon: '💡',
    headColor: '#06b6d4',
    bodyColor: '#3b82f6',
    shape: 'square',
    effect: 'glow',
    unlockType: 'achievement',
    unlockCondition: 'score_2000',
    description: '单次得分超过 2000 解锁'
  },
  arrow: {
    id: 'arrow',
    name: '箭头',
    icon: '➡️',
    headColor: '#f97316',
    bodyColor: '#ea580c',
    shape: 'arrow',
    effect: 'none',
    unlockType: 'score',
    unlockCondition: 800,
    description: '锐利的前锋'
  }
};

/** 形状类型常量 */
const SHAPE_TYPES = {
  SQUARE: 'square',
  CIRCLE: 'circle',
  DIAMOND: 'diamond',
  ARROW: 'arrow'
};

/** 特效类型常量 */
const EFFECT_TYPES = {
  NONE: 'none',
  FLAME: 'flame',
  SPARKLE: 'sparkle',
  RAINBOW: 'rainbow',
  GLOW: 'glow'
};

// ========================================
// 皮肤管理器
// ========================================

/**
 * 皮肤管理器，负责皮肤的解锁、选择和存储
 */
class SkinManager {
  constructor() {
    /** @type {string[]} 已解锁的皮肤 ID 列表 */
    this.unlockedSkins = this._loadUnlockedSkins();
    /** @type {string} 当前选中的皮肤 ID */
    this.selectedSkinId = this._loadSelectedSkin();
    /** @type {string[]} 已获得的成就列表 */
    this.achievements = this._loadAchievements();
    /** @type {Object<string, number>} 各难度最高分记录 */
    this.scores = this._loadScores();

    // 启动时检查解锁
    this.checkUnlocks();
  }

  /**
   * 获取所有皮肤配置
   * @returns {Object} 皮肤字典
   */
  getAllSkins() {
    return SKINS;
  }

  /**
   * 获取指定皮肤
   * @param {string} skinId
   * @returns {Object|null}
   */
  getSkin(skinId) {
    return SKINS[skinId] || null;
  }

  /**
   * 获取当前选中的皮肤对象
   * @returns {Object}
   */
  getCurrentSkin() {
    return this.getSkin(this.selectedSkinId) || SKINS.classic;
  }

  /**
   * 判断皮肤是否已解锁
   * @param {string} skinId
   * @returns {boolean}
   */
  isUnlocked(skinId) {
    const skin = this.getSkin(skinId);
    if (!skin) return false;
    if (skin.unlockType === 'free') return true;
    return this.unlockedSkins.includes(skinId);
  }

  /**
   * 解锁指定皮肤
   * @param {string} skinId
   */
  unlockSkin(skinId) {
    if (!this.isUnlocked(skinId)) {
      this.unlockedSkins.push(skinId);
      this._saveUnlockedSkins();
    }
  }

  /**
   * 选择皮肤（必须已解锁）
   * @param {string} skinId
   * @returns {boolean} 是否选择成功
   */
  selectSkin(skinId) {
    if (!this.isUnlocked(skinId)) return false;
    this.selectedSkinId = skinId;
    this._saveSelectedSkin();
    return true;
  }

  /**
   * 根据当前分数和成就检查是否有新皮肤可解锁
   */
  checkUnlocks() {
    const allSkins = Object.values(SKINS);
    for (let i = 0; i < allSkins.length; i++) {
      const skin = allSkins[i];
      if (this.isUnlocked(skin.id)) continue;

      if (skin.unlockType === 'score') {
        const bestScore = Math.max(
          this.scores.easy || 0,
          this.scores.hard || 0,
          this.scores.hell || 0
        );
        if (bestScore >= skin.unlockCondition) {
          this.unlockSkin(skin.id);
        }
      }

      if (skin.unlockType === 'achievement') {
        if (this.achievements.includes(skin.unlockCondition)) {
          this.unlockSkin(skin.id);
        }
      }
    }
  }

  /**
   * 记录一次游戏分数（用于解锁检查）
   * @param {string} difficulty - 难度 key
   * @param {number} score - 本局分数
   */
  recordScore(difficulty, score) {
    if (!this.scores[difficulty] || score > this.scores[difficulty]) {
      this.scores[difficulty] = score;
      this._saveScores();
      this.checkUnlocks();
    }
  }

  /**
   * 记录成就
   * @param {string} achievement - 成就 ID
   */
  recordAchievement(achievement) {
    if (!this.achievements.includes(achievement)) {
      this.achievements.push(achievement);
      this._saveAchievements();
      this.checkUnlocks();
    }
  }

  /**
   * 获取皮肤解锁进度
   * @param {string} skinId
   * @returns {Object} { unlocked, progress, current?, required? }
   */
  getUnlockProgress(skinId) {
    const skin = this.getSkin(skinId);
    if (!skin) return null;

    if (skin.unlockType === 'free') {
      return { unlocked: true, progress: 100 };
    }

    if (skin.unlockType === 'score') {
      const bestScore = Math.max(
        this.scores.easy || 0,
        this.scores.hard || 0,
        this.scores.hell || 0
      );
      const progress = Math.min(100, Math.floor((bestScore / skin.unlockCondition) * 100));
      return {
        unlocked: this.isUnlocked(skinId),
        progress: progress,
        current: bestScore,
        required: skin.unlockCondition
      };
    }

    if (skin.unlockType === 'achievement') {
      return {
        unlocked: this.isUnlocked(skinId),
        progress: this.achievements.includes(skin.unlockCondition) ? 100 : 0
      };
    }

    return { unlocked: false, progress: 0 };
  }

  /**
   * 获取皮肤解锁描述文本
   * @param {Object} skin - 皮肤配置对象
   * @returns {string}
   */
  getUnlockDescription(skin) {
    if (skin.unlockType === 'score') return `得分达到 ${skin.unlockCondition}`;
    if (skin.unlockType === 'achievement') {
      if (skin.unlockCondition === 'win_all_difficulties') return '通关所有难度';
      if (skin.unlockCondition === 'score_2000') return '单次得分 2000+';
    }
    return '';
  }

  // ========================================
  // 存储操作（wx.setStorageSync / getStorageSync）
  // ========================================

  /** @private */
  _loadUnlockedSkins() {
    try {
      const saved = wx.getStorageSync('snakeUnlockedSkins');
      if (saved) return JSON.parse(saved);
    } catch (e) { /* 首次启动无数据 */ }
    // 默认解锁免费皮肤
    return Object.values(SKINS)
      .filter(function (s) { return s.unlockType === 'free'; })
      .map(function (s) { return s.id; });
  }

  /** @private */
  _saveUnlockedSkins() {
    wx.setStorageSync('snakeUnlockedSkins', JSON.stringify(this.unlockedSkins));
  }

  /** @private */
  _loadSelectedSkin() {
    try {
      const saved = wx.getStorageSync('snakeSelectedSkin');
      return saved || 'classic';
    } catch (e) { return 'classic'; }
  }

  /** @private */
  _saveSelectedSkin() {
    wx.setStorageSync('snakeSelectedSkin', this.selectedSkinId);
  }

  /** @private */
  _loadAchievements() {
    try {
      const saved = wx.getStorageSync('snakeAchievements');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  }

  /** @private */
  _saveAchievements() {
    wx.setStorageSync('snakeAchievements', JSON.stringify(this.achievements));
  }

  /** @private */
  _loadScores() {
    try {
      const saved = wx.getStorageSync('snakeScores');
      return saved ? JSON.parse(saved) : {};
    } catch (e) { return {}; }
  }

  /** @private */
  _saveScores() {
    wx.setStorageSync('snakeScores', JSON.stringify(this.scores));
  }
}

module.exports = {
  SKINS,
  SHAPE_TYPES,
  EFFECT_TYPES,
  SkinManager
};
