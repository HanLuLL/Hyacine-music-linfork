# 风堇音乐 · Hyacine Music

简体中文 · [English](README.md) · [日本語](README.ja-JP.md)

风堇音乐是使用 TypeScript、Expo Router 和 React Native 开发的移动音乐客户端，通过 [Hyacine Server](https://github.com/Ruoxi-TH/hyacine-server) 对接网易云音乐与哔哩哔哩音乐源。

## 当前功能

- TypeScript / Expo Router / React Native / NativeWind
- `expo-image` 封面渲染与 `expo-audio` 播放
- 原生、液态玻璃、MIUIX 三种 UI 风格
- 歌词流动、沉浸封面、极简封面、封面歌词四种播放器布局
- 网易云扫码登录、个人资料、每日推荐、推荐歌单、我的歌单、搜索、播放、歌词和只读评论
- 本地收藏与听歌历史
- 播放历史或收藏歌曲时重新获取播放地址，避免旧流地址失效
- 歌词自动定位，点击歌词跳转播放时间
- 只有底部导航栏响应左右滑动切页，内容区不接管切页手势
- 管理后台：查看当前设备用户摘要、历史/收藏数量、音乐源凭据是否存在、脱敏日志与后端健康状态

## 管理后台与隐私

入口：**设置 → 管理后台**。

该页面仅读取当前设备数据，不是远程多用户控制台。Cookie、Token、Authorization 等敏感值不会显示原文；日志在写入与展示前会自动脱敏。

## 开发运行

```bash
pnpm install
pnpm start
pnpm typecheck
```

原生模块需要 Expo Development Build。手机中填写的后端地址必须能从手机访问，不要错误使用电脑自身的 `localhost`。

## 仓库

- 移动端：<https://github.com/Ruoxi-TH/Hyacine-music>
- 后端：<https://github.com/Ruoxi-TH/hyacine-server>

## 状态说明

代码已提交、类型检查通过、构建成功、安装到设备、真机验收和后端部署是不同阶段，文档与提交记录不会把它们混为一谈。

## 许可证

参见 [LICENSE](LICENSE)。