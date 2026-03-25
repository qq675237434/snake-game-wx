/**
 * 贪吃蛇微信小游戏 - 入口文件
 * 首次调用 wx.createCanvas() 创建主屏画布
 * 然后初始化游戏主控制器
 */

const Game = require('./js/main');

// 创建主屏画布（首次调用为上屏画布）
const canvas = wx.createCanvas();

// 启动游戏
const game = new Game(canvas);
