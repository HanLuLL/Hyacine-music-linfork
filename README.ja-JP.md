# Hyacine.music Mobile

[English](README.md) · [简体中文](README.zh-CN.md)

Hyacine.music は、独立してデプロイされる NestJS 音楽バックエンドに接続する React Native / Expo モバイル音楽プレーヤーです。

## 実装済み機能

- 音楽の再生・一時停止・前の曲・次の曲・再生キュー
- グローバルミニプレーヤーとフルスクリーンプレーヤー
- バックグラウンド再生、通知バー、ロック画面のメディア操作
- Expo Router、NativeWind、Zustand による状態管理
- JWT の安全な保存と独立 NestJS API の設定
- ARM64 Android 端末向けスタンドアロン Release APK のビルド
- 簡体字中国語、英語、日本語の UI 切り替えと、言語設定のローカル保存
- Default、Frosted、Liquid、MIUI の 4 種類の UI スタイルと、Midnight、Black、Daylight、Aurora の 4 種類のビジュアルプリセット
- Vinyl、Immersive、Minimal の 3 種類のプレーヤーレイアウト
- テーマ、プリセット、レイアウト、文字サイズ、リスト密度、任意の 6 桁 HEX アクセントカラーのローカル保存
- Frosted は安定した半透明マテリアル、Liquid は動く屈折ハイライトとダイナミックなカラーフィールドを使用
> iOS の Frosted は `expo-blur` の `BlurView` を用いて背景をぼかします。Android のリアルタイム背景ぼかしは Expo のネイティブ実装、OS バージョン、端末性能に依存します。Android では半透明の色付けによる互換表現を提供し、Liquid には動的な屈折と光沢を重ねますが、すべての端末で iOS と同一のネイティブなリアルタイムぼかしを保証するものではありません。
>
> `react-native-track-player` はネイティブモジュールです。Expo Go では利用できません。Development Build、Debug APK、または Release APK を使用してください。

## バックエンド API アドレス

環境変数テンプレートをコピーします。

```bash
cp .env.example .env
```

独立バックエンドの API アドレスを設定します。

```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api/v1
```

実機とバックエンドは同じローカルネットワークに接続する必要があります。NestJS は `localhost` のみではなく、`0.0.0.0` で待ち受けてください。

Android Emulator からホスト上のバックエンドへ接続する場合：

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api/v1
```

実際の `.env` はコミットしないでください。

## ローカル開発

```bash
pnpm install
pnpm typecheck
pnpm start
```

Android Development Build を生成して実行します。

```bash
pnpm android
```

## GitHub Actions Release APK

`master`、`main`、`develop` への push で Android Release APK ビルドが開始されます。

ワークフローでは以下を実行します。

1. pnpm 依存関係のインストールとキャッシュ
2. Gradle 依存関係およびビルド出力のキャッシュ
3. TypeScript チェック
4. Android ネイティブプロジェクトの生成
5. 最新の実機向け `arm64-v8a` Release APK のビルド
6. JavaScript bundle とアセットの APK への埋め込み。Metro `8081` は不要です
7. `hyacine-music-release-apk-arm64` Artifact のアップロード

ビルド時にバックエンド API を指定するには、GitHub の **Actions → Android Release APK → Run workflow** で `Backend API URL` を入力してください。

```text
http://192.168.1.100:3000/api/v1
```

指定値は `EXPO_PUBLIC_API_URL` としてその Release APK に埋め込まれます。

## Track Player 互換性パッチ

`react-native-track-player@4.1.2` には React Native 0.86 との Kotlin nullability 互換性問題があります。本プロジェクトでは pnpm のネイティブパッチで修正しています。

```text
patches/react-native-track-player@4.1.2.patch
```

React Native 0.86 を公式にサポートする Track Player バージョンへ更新するまで、`pnpm-workspace.yaml` の `patchedDependencies` と lockfile 内のパッチハッシュを維持してください。
