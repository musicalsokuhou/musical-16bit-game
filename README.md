# Overture — 16bit Musical Platformer

ミュージカルの舞台裏を走り抜けるレトロ風プラットフォーマーのプロトタイプ。
音符（♪）を集めながらステージを横断し、フィナーレのスポットライトを目指す。

## 操作

- `←` `→` : 移動
- `Space` / `↑` : ジャンプ
- `R` : リスタート
- スマホ: 画面下のタッチボタンで移動・ジャンプ

## 開発

```bash
npm install
npm run dev
```

ブラウザで http://localhost:5173 を開く。

## ビルド

```bash
npm run build
npm run preview
```

## デプロイ

Vercel にこのリポジトリをインポートするだけでデプロイできる（ビルドコマンド: `npm run build`、出力ディレクトリ: `dist`）。
