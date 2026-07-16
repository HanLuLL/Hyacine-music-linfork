# 风堇音乐

[English](README.md) · [日本語](README.ja-JP.md)

风堇音乐是连接独立 NestJS 音乐后端的 React Native / Expo 移动端音乐播放器。

## 已实现功能

- 音频播放、暂停、上一首、下一首与播放队列
- 全局迷你播放器与全屏播放器
- 后台播放、通知栏与锁屏媒体控制
- Expo Router、NativeWind、Zustand 状态管理
- JWT 安全存储与独立 NestJS API 地址配置
- Android ARM64 独立 Release APK 构建
- 简体中文、英语、日语界面切换，语言偏好本地持久化
- 默认、毛玻璃、液态玻璃、MIUI 四套 UI 风格；午夜、纯黑、日光、极光四种视觉预设
- 黑胶、沉浸、极简三种播放器布局
- 主题风格、预设、布局、字体缩放、列表密度和任意六位 HEX 强调色本地持久化
- 毛玻璃使用稳定半透明材质；液态玻璃额外使用动态折射高光和动态色场
> iOS 上的毛玻璃使用 `expo-blur` 的 `BlurView` 进行背景模糊。Android 的实时背景模糊受 Expo 原生实现、系统版本和设备能力影响；项目提供透明染色兼容表现，液态玻璃会叠加动态折射与光泽效果，不保证与 iOS 在所有设备上的原生实时模糊完全一致。
>
> `react-native-track-player` 属于原生模块，不支持 Expo Go。请使用 Development Build、Debug APK 或 Release APK。

## 后端地址

复制环境变量模板：

```bash
cp .env.example .env
```

填写独立后端的 API 地址：

```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api/v1
```

真机与后端设备必须位于同一局域网；NestJS 应监听 `0.0.0.0`，不要只监听 `localhost`。

Android 模拟器访问本机后端时使用：

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api/v1
```

不要提交真实 `.env` 文件。

## 本地开发

```bash
pnpm install
pnpm typecheck
pnpm start
```

生成并运行 Android Development Build：

```bash
pnpm android
```

## GitHub Actions Release APK

推送到 `master`、`main` 或 `develop` 会触发 Android Release APK 构建。

构建流程会：

1. 安装并缓存 pnpm 依赖；
2. 缓存 Gradle 依赖与构建输出；
3. 执行 TypeScript 检查；
4. 生成 Android 原生工程；
5. 构建仅支持现代真机的 `arm64-v8a` Release APK；
6. 将 JavaScript bundle 与资源内置到 APK，因此安装后不需要 Metro `8081`；
7. 上传 `hyacine-music-release-apk-arm64` Artifact。

如需在打包时设置后端地址，请在 GitHub 的 **Actions → Android Release APK → Run workflow** 中填写 `Backend API URL`，例如：

```text
http://192.168.1.100:3000/api/v1
```

该值会以内置环境变量 `EXPO_PUBLIC_API_URL` 写入该次 Release APK。

## Track Player 兼容补丁

`react-native-track-player@4.1.2` 与 React Native 0.86 存在 Kotlin 空安全兼容问题。项目通过 pnpm 原生补丁自动修复：

```text
patches/react-native-track-player@4.1.2.patch
```

请保留 `pnpm-workspace.yaml` 中的 `patchedDependencies` 配置与锁文件中的对应补丁哈希，直到升级到官方兼容 React Native 0.86 的 Track Player 版本。
