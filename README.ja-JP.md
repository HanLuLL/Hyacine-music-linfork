# Hyacine Music · 風菫音楽

[English](README.md) · [简体中文](README.zh-CN.md)

Hyacine Music は TypeScript、Expo Router、React Native で実装されたモバイル音楽クライアントです。[Hyacine Server](https://github.com/Ruoxi-TH/hyacine-server) を介して NetEase Cloud Music と Bilibili の音楽ソースを利用します。

## 実装済み

- TypeScript / Expo Router / React Native / NativeWind
- `expo-image` によるカバーレンダリング、`expo-audio` による再生
- Native / Liquid Glass / MIUIX の 3 種 UI スタイル
- 中央歌詞、フルアートワーク、コンパクトカバー、カバーと歌詞の 4 種類のプレイヤーレイアウト
- NetEase QR ログイン、プロフィール、デイリー曲、おすすめプレイリスト、マイプレイリスト、検索、再生、同期歌詞、閲覧専用コメント
- 端末内のお気に入りと再生履歴
- お気に入りは NetEase 専用プレイリスト「收藏风堇音乐」に同期、未ログインや同期失敗時も本地優先
- 保存曲の再生前に URL を再取得し、期限切れストリームを回避
- 歌詞の自動追従とタップシーク
- NetEase のストリーミング音質、サウンドプリセット、保存可能な 10 バンド EQ 設定
- タブ切り替えスワイプは下部ナビゲーションだけで有効
- 端末内ユーザーサマリー、履歴/お気に入り件数、認証情報の有無、匿名化ログ、バックエンドヘルスを表示する管理画面
- 再生キューは順序・リストループ・ランダムの 3 モード（1 ボタンで循環切り替え）
- 再生完了時に自動で次の曲へ（画面に依存しない）
- ロック画面メディア操作：タイトル・アーティスト・カバーアート・前後シーク
- 管理画面とキュー画面では MiniPlayer を非表示にして浏览をすっきり
- デイリーおすすめカードのネイティブスワイプ操作
- おすすめプレイリストのページネーション読み込み
- バックエンドヘルス監視、非 JSON レスポンスの自動保護
- デスクトップ歌詞浮窓サポート
- シングルリピートモードは次曲へ進まず現在の曲を再再生
- OPPO/realme 端末の Fluid Cloud 再生中カードにカバー・タイトル・アーティスト・歌詞・リアルタイム進捗・再生/一時停止/前/次/シーク操作を表示

## 管理画面とプライバシー

**設定 → 管理画面** から開きます。Cookie、Token、Authorization の生データは表示しません。ログは保存・表示前に自動的に匿名化されます。これは端末内診断画面であり、リモートの複数ユーザー管理コンソールではありません。

## 開発

```bash
pnpm install
pnpm start
pnpm typecheck
```

ネイティブモジュールには Expo Development Build が必要です。スマートフォンで入力するバックエンドアドレスはスマートフォンから到達可能である必要があります。PC 自身の `localhost` を誤って使用しないでください。

## リポジトリ

- Mobile: <https://github.com/Ruoxi-TH/Hyacine-music>
- Backend: <https://github.com/Ruoxi-TH/hyacine-server>

## 状態に関する注記

ソースのコミット、TypeScript チェック通過、ビルド成功、デバイスへのインストール、実機検証、バックエンドデプロイはそれぞれ別の段階です。本ドキュメントとコミット記録はそれらを混同しません。

## ライセンス

MIT ライセンス — 詳しくは [LICENSE](LICENSE) をご覧ください。