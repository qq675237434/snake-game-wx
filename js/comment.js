/**
 * 贪吃蛇微信小游戏 - 评论系统
 * 支持发表评论、点赞、翻页浏览
 * 数据存储在本地 wx.Storage（可扩展为云端）
 * @module comment
 */

const { COMMENT_CONFIG } = require('./config');

/**
 * 评论管理器
 */
class CommentManager {
  constructor() {
    /** @type {Array<Object>} 评论列表 */
    this.comments = [];
    /** @type {Set<string>} 当前用户已点赞的评论 ID */
    this.likedIds = new Set();
    /** @type {number} 当前页码（0-based） */
    this.page = 0;

    this._load();
  }

  /**
   * 添加评论
   * @param {string} text - 评论内容
   * @param {number} score - 发表时的游戏分数
   * @param {string} difficulty - 当前难度
   * @returns {Object|null} 新评论对象，或 null（内容为空）
   */
  addComment(text, score, difficulty) {
    const trimmed = (text || '').trim();
    if (!trimmed) return null;
    const content = trimmed.slice(0, COMMENT_CONFIG.MAX_LENGTH);

    const comment = {
      id: this._genId(),
      content: content,
      score: score,
      difficulty: difficulty,
      likes: 0,
      time: Date.now(),
      nickname: this._getNickname()
    };

    this.comments.unshift(comment);

    // 超出上限时删除最旧的
    if (this.comments.length > COMMENT_CONFIG.MAX_STORE) {
      this.comments = this.comments.slice(0, COMMENT_CONFIG.MAX_STORE);
    }

    this._save();
    return comment;
  }

  /**
   * 点赞/取消点赞
   * @param {string} commentId
   * @returns {boolean} 操作后的点赞状态
   */
  toggleLike(commentId) {
    const comment = this.comments.find(c => c.id === commentId);
    if (!comment) return false;

    if (this.likedIds.has(commentId)) {
      // 取消点赞
      this.likedIds.delete(commentId);
      comment.likes = Math.max(0, comment.likes - 1);
    } else {
      // 点赞
      this.likedIds.add(commentId);
      comment.likes++;
    }

    this._save();
    this._saveLikes();
    return this.likedIds.has(commentId);
  }

  /**
   * 是否已点赞
   * @param {string} commentId
   * @returns {boolean}
   */
  isLiked(commentId) {
    return this.likedIds.has(commentId);
  }

  /**
   * 获取当前页评论
   * @returns {Array<Object>}
   */
  getPageComments() {
    const start = this.page * COMMENT_CONFIG.PAGE_SIZE;
    return this.comments.slice(start, start + COMMENT_CONFIG.PAGE_SIZE);
  }

  /** 总页数 */
  get totalPages() {
    return Math.max(1, Math.ceil(this.comments.length / COMMENT_CONFIG.PAGE_SIZE));
  }

  /** 总评论数 */
  get totalCount() {
    return this.comments.length;
  }

  /** 上一页 */
  prevPage() {
    if (this.page > 0) this.page--;
  }

  /** 下一页 */
  nextPage() {
    if (this.page < this.totalPages - 1) this.page++;
  }

  /** 回到第一页 */
  resetPage() {
    this.page = 0;
  }

  // ========================================
  // 存储
  // ========================================

  /** @private 加载评论 */
  _load() {
    try {
      const saved = wx.getStorageSync(COMMENT_CONFIG.STORAGE_KEY);
      this.comments = saved ? JSON.parse(saved) : [];
    } catch (e) {
      this.comments = [];
    }
    this._loadLikes();
  }

  /** @private 保存评论 */
  _save() {
    try {
      wx.setStorageSync(COMMENT_CONFIG.STORAGE_KEY, JSON.stringify(this.comments));
    } catch (e) { /* ignore */ }
  }

  /** @private 加载点赞记录 */
  _loadLikes() {
    try {
      const saved = wx.getStorageSync(COMMENT_CONFIG.LIKES_KEY);
      this.likedIds = saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      this.likedIds = new Set();
    }
  }

  /** @private 保存点赞记录 */
  _saveLikes() {
    try {
      wx.setStorageSync(COMMENT_CONFIG.LIKES_KEY, JSON.stringify([...this.likedIds]));
    } catch (e) { /* ignore */ }
  }

  // ========================================
  // 工具
  // ========================================

  /** @private 生成评论 ID */
  _genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  /** @private 获取用户昵称 */
  _getNickname() {
    try {
      const saved = wx.getStorageSync('snakeNickname');
      return saved || '蛇友';
    } catch (e) {
      return '蛇友';
    }
  }

  /**
   * 设置用户昵称
   * @param {string} name
   */
  setNickname(name) {
    const trimmed = (name || '').trim().slice(0, 12) || '蛇友';
    try {
      wx.setStorageSync('snakeNickname', trimmed);
    } catch (e) { /* ignore */ }
  }

  /**
   * 格式化时间（相对时间）
   * @param {number} timestamp
   * @returns {string}
   */
  formatTime(timestamp) {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return minutes + '分钟前';
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + '小时前';
    const days = Math.floor(hours / 24);
    if (days < 30) return days + '天前';
    return new Date(timestamp).toLocaleDateString();
  }
}

module.exports = CommentManager;
