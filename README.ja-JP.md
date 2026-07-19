# Hyacine Music · 風菫音楽

[简体中文](README.zh-CN.md) · [English](README.md)

Hyacine Music は TypeScript、Expo Router、React Native で実装されたモバイル音楽クライアントです。[Hyacine Server](https://github.com/Ruoxi-TH/hyacine-server) を介して NetEase Cloud Music と Bilibili の音楽ソースを利用します。

## 実装済み

- Native / Liquid Glass / MIUIX の UI スタイル
- 中央歌詞、フルアートワーク、コンパクトカバー、カバーと歌詞の 4 種類のプレイヤーレイアウト
- NetEase QR ログイン、デイリー曲、プレイリスト、検索、再生、同期歌詞、閲覧専用コメント
- 端末内のお気に入りと再生履歴
- 保存曲の再生前に URL を再取得し、期限切れストリームを回避
- 歌詞の自動追従とタップシーク
- NetEase のストリーミング音質、サウンドプリセット、保存可能な 10 バンド EQ 設定
- タブ切り替えスワイプは下部ナビゲーションだけで有効
- 端末内ユーザーデータ、匿名化ログ、バックエンド状態を表示する管理画面

## 管理画面とプライバシー

**設定 → 管理画面** から開きます。Cookie、Token、Authorization の生データは表示しません。これは端末内診断画面であり、リモートの複数ユーザー管理コンソールではありません。

## 開発

```bash
pnpm install
pnpm start
pnpm typecheck
```

ネイティブモジュールには Expo Development Build が必要です。

## リポジトリ

- Mobile: <https://github.com/Ruoxi-TH/Hyacine-music>
- Backend: <https://github.com/Ruoxi-TH/hyacine-server>

## ライセンス

本プロジェクトは [MIT License](LICENSE) で公開されています。ライセンス条件に従い、利用、複製、変更、統合、公開、配布、再許諾、販売が可能です。本ソフトウェアに保証はありません。