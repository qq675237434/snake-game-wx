# 🐍 贪吃蛇微信小游戏

## 项目结构

```
snake-game-wx/
├── game.js              # 入口文件（wx.createCanvas + 启动游戏）
├── game.json            # 小游戏配置（竖屏）
├── project.config.json  # 项目配置
├── js/
│   ├── main.js          # 游戏主控制器（状态管理、循环、输入）
│   ├── snake.js         # 蛇逻辑（移动、碰撞、绘制、特效）
│   ├── food.js          # 食物（生成、碰撞检测、绘制）
│   ├── obstacle.js      # 障碍物（生成、绘制）
│   ├── skin.js          # 皮肤系统（7种皮肤 + 解锁机制）
│   ├── ui.js            # UI 渲染（菜单、HUD、方向键、结束界面）
│   ├── audio.js         # 音效管理（预留）
│   └── config.js        # 全局配置常量
└── README.md
```

## 功能特性

- ✅ 3 级难度（容易/困难/地狱）
- ✅ 7 种皮肤 + 解锁机制
- ✅ 滑动 + 虚拟方向键双操控
- ✅ 分数系统 + 按难度记录最高分
- ✅ 障碍物（地狱难度）
- ✅ 蛇眼睛、特效（火焰/闪光/发光/彩虹）
- ✅ 全屏自适应
- ✅ 广告位预留（激励视频复活 / 插屏 / Banner）
- ✅ 微信分享预留

## 开发指南

### 1. 安装微信开发者工具

下载：https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html

### 2. 导入项目

1. 打开微信开发者工具
2. 选择「小游戏」Tab
3. 点击「+」导入项目
4. 选择 `snake-game-wx` 目录
5. AppID 使用测试号或你的小游戏 AppID

### 3. 运行

导入后自动编译运行，在模拟器中即可预览游戏。

### 4. 上线前配置

1. **AppID**: 修改 `project.config.json` 中的 `appid`
2. **广告**: 在 `js/config.js` 的 `AD_CONFIG` 填入广告单元 ID
3. **分享图片**: 在 `js/main.js` 的 `_setupShare` 中设置 `imageUrl`

## 适配说明

| Web 版 | 微信小游戏版 |
|--------|-------------|
| DOM canvas | `wx.createCanvas()` |
| `document.addEventListener` | `wx.onTouchStart/End` |
| `localStorage` | `wx.setStorageSync` |
| HTML/CSS UI | 纯 Canvas 2D 绘制 |
| 键盘控制 | 滑动 + 虚拟方向键 |

## 商业化接口

### 激励视频（复活）
游戏结束时显示「看广告复活」按钮，观看完整广告后缩短蛇身继续游戏。

### 插屏广告
每 3 局游戏结束时自动弹出。

### Banner 广告
游戏结束界面底部展示。

### 分享
支持分享给好友和朋友圈，显示当前分数。
