/**
 * 贪吃蛇微信小游戏 - 配置常量
 * 所有颜色、尺寸、难度参数集中管理
 * @module config
 */

// 获取系统信息，用于屏幕自适应
const systemInfo = wx.getSystemInfoSync();

/** 屏幕宽度（像素） */
const SCREEN_WIDTH = systemInfo.screenWidth;
/** 屏幕高度（像素） */
const SCREEN_HEIGHT = systemInfo.screenHeight;
/** 设备像素比 */
const PIXEL_RATIO = systemInfo.pixelRatio;

/**
 * 根据屏幕宽度计算网格大小
 * 竖屏模式下，以屏幕宽度为基准，分成 15 列
 */
const GRID_COLS = 15;
const GRID_SIZE = Math.floor(SCREEN_WIDTH / GRID_COLS);

/**
 * 游戏区域布局（竖屏模式）
 * 顶部：分数栏
 * 中间：游戏画布
 * 底部：虚拟方向键
 */
const LAYOUT = {
  /** 顶部信息栏高度 */
  HEADER_HEIGHT: Math.floor(SCREEN_HEIGHT * 0.08),
  /** 底部控制区高度 */
  FOOTER_HEIGHT: Math.floor(SCREEN_HEIGHT * 0.25),
  /** 游戏区域起始 Y */
  get GAME_AREA_Y() {
    return this.HEADER_HEIGHT;
  },
  /** 游戏区域高度 */
  get GAME_AREA_HEIGHT() {
    return SCREEN_HEIGHT - this.HEADER_HEIGHT - this.FOOTER_HEIGHT;
  },
  /** 游戏区域网格行数 */
  get GRID_ROWS() {
    return Math.floor(this.GAME_AREA_HEIGHT / GRID_SIZE);
  },
  /** 控制区域起始 Y */
  get FOOTER_Y() {
    return SCREEN_HEIGHT - this.FOOTER_HEIGHT;
  }
};

/** 颜色配置 */
const COLORS = {
  /** 全局背景 */
  BACKGROUND: '#0f0f23',
  /** 游戏区域背景 */
  GAME_BG: '#1a1a2e',
  /** 网格线 */
  GRID_LINE: 'rgba(255, 255, 255, 0.05)',
  /** 食物 */
  FOOD: '#FF5252',
  /** 食物高光 */
  FOOD_HIGHLIGHT: 'rgba(255, 255, 255, 0.3)',
  /** 障碍物填充 */
  OBSTACLE_FILL: '#6B7280',
  /** 障碍物描边 */
  OBSTACLE_STROKE: '#4B5563',
  /** 蛇眼睛 */
  EYE: '#000000',

  /** UI 颜色 */
  UI: {
    /** 标题文字 */
    TITLE: '#FFFFFF',
    /** 副标题文字 */
    SUBTITLE: '#AAAAAA',
    /** 分数文字 */
    SCORE: '#FFD700',
    /** 普通按钮背景 */
    BTN_BG: '#4CAF50',
    /** 按钮文字 */
    BTN_TEXT: '#FFFFFF',
    /** 选中按钮背景 */
    BTN_SELECTED: '#FF9800',
    /** 禁用按钮背景 */
    BTN_DISABLED: '#555555',
    /** 遮罩层 */
    OVERLAY: 'rgba(0, 0, 0, 0.7)',
    /** 方向键背景 */
    DPAD_BG: 'rgba(255, 255, 255, 0.15)',
    /** 方向键按下 */
    DPAD_ACTIVE: 'rgba(255, 255, 255, 0.35)',
    /** 方向键箭头 */
    DPAD_ARROW: 'rgba(255, 255, 255, 0.8)',
    /** 头部信息栏背景 */
    HEADER_BG: 'rgba(0, 0, 0, 0.5)',
    /** 暂停按钮 */
    PAUSE_BTN: 'rgba(255, 255, 255, 0.3)',
    /** 难度-容易 */
    DIFFICULTY_EASY: '#4CAF50',
    /** 难度-困难 */
    DIFFICULTY_HARD: '#FF9800',
    /** 难度-地狱 */
    DIFFICULTY_HELL: '#F44336',
    /** 锁定皮肤 */
    SKIN_LOCKED: 'rgba(255, 255, 255, 0.2)',
    /** 进度条背景 */
    PROGRESS_BG: 'rgba(255, 255, 255, 0.1)',
    /** 进度条填充 */
    PROGRESS_FILL: '#4CAF50'
  }
};

/** 难度设置 */
const DIFFICULTY_SETTINGS = {
  easy: {
    initialSpeed: 8,
    speedIncrease: 0.3,
    scoreMultiplier: 1,
    obstacles: false
  },
  hard: {
    initialSpeed: 12,
    speedIncrease: 0.6,
    scoreMultiplier: 2,
    obstacles: false
  },
  hell: {
    initialSpeed: 18,
    speedIncrease: 1.0,
    scoreMultiplier: 3,
    obstacles: true
  }
};

/** 难度显示名称 */
const DIFFICULTY_NAMES = {
  easy: { text: '容易', icon: '🟢', color: COLORS.UI.DIFFICULTY_EASY },
  hard: { text: '困难', icon: '🟡', color: COLORS.UI.DIFFICULTY_HARD },
  hell: { text: '地狱', icon: '🔴', color: COLORS.UI.DIFFICULTY_HELL }
};

/** 游戏状态枚举 */
const GameState = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'gameOver',
  SKIN_SELECT: 'skinSelect',
  COMMENTS: 'comments',
  WRITING_COMMENT: 'writingComment'
};

/** 评论配置 */
const COMMENT_CONFIG = {
  /** 单条评论最大字数 */
  MAX_LENGTH: 50,
  /** 评论列表每页显示数 */
  PAGE_SIZE: 10,
  /** 最多保存评论数 */
  MAX_STORE: 200,
  /** 存储 Key */
  STORAGE_KEY: 'snakeComments',
  /** 点赞存储 Key */
  LIKES_KEY: 'snakeCommentLikes'
};

/** 方向枚举 */
const Direction = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
};

/** 最小游戏速度（毫秒/帧，越小越快） */
const MIN_SPEED = 50;

/** 障碍物数量（地狱模式） */
const OBSTACLE_COUNT = 10;

/** 安全距离（障碍物与蛇头的最小曼哈顿距离） */
const OBSTACLE_SAFE_DISTANCE = 5;

/** 广告相关常量 */
const AD_CONFIG = {
  /** 插屏广告触发间隔（每 N 局） */
  INTERSTITIAL_INTERVAL: 3,
  /** 激励视频广告单元 ID（上线前替换） */
  REWARD_AD_UNIT_ID: '',
  /** 插屏广告单元 ID（上线前替换） */
  INTERSTITIAL_AD_UNIT_ID: '',
  /** Banner 广告单元 ID（上线前替换） */
  BANNER_AD_UNIT_ID: ''
};

module.exports = {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  PIXEL_RATIO,
  GRID_SIZE,
  GRID_COLS,
  LAYOUT,
  COLORS,
  DIFFICULTY_SETTINGS,
  DIFFICULTY_NAMES,
  GameState,
  Direction,
  MIN_SPEED,
  OBSTACLE_COUNT,
  OBSTACLE_SAFE_DISTANCE,
  AD_CONFIG,
  COMMENT_CONFIG
};
