# KEY//BREAK — 鍵開けミニゲーム集

Ver.alpha.1 の初期実装です。GitHub Pagesで公開できる静的Webアプリです。

## 起動
`index.html` をブラウザで開くか、GitHub Pagesでリポジトリのルートを公開してください。

## 構成
- `js/core/`: 共通進行、タイマー、難易度、保存
- `js/modes/`: SINGLE / RANDOM のセッション生成
- `js/games/`: 個別ミニゲーム
- `js/ui/`: 画面遷移
- `css/`: 共通デザイン

## 現在の実装範囲
- SINGLE GAME / RANDOM GAME
- LT / TA / FR の基本進行
- ピッキング / 振り子ロック
- LocalStorageによる記録保存
- PC・スマートフォン向けレイアウト

## 注意
Ver.alpha.1 は初期プロトタイプです。TAの終了条件・スコア方式、FRの終了UI、ゲーム個別の難易度調整、ランダムゲームのCHOICE候補数などは今後の調整対象です。
