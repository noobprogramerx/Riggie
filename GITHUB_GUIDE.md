# Riggie Sealion Voice - GitHub アップロード＆公開ガイド

このプロジェクト（riggievoice）は、ビルドツール（Node.js / Vite 等）を必要としないシンプルなHTML/CSS/JS構成で作成されています。
そのため、**ファイルをそのままGitHubにアップロードするだけで、即座にWeb上に公開して動作させることが可能**です。

以下に、GitHubへアップロードしてWeb公開（GitHub Pages）するための2つの手順を解説します。

---

## 方法1：ブラウザからドラッグ＆ドロップでアップロードする（最も簡単）

Gitコマンドやターミナル操作を一切使わず、ブラウザの操作だけで完了する方法です。

### ステップ 1: GitHubで新しいリポジトリを作成する
1. ブラウザで [GitHub](https://github.com/) にサインインします。
2. 画面右上または左上の **「New」**（または「Create repository」）ボタンをクリックします。
3. 以下の項目を設定します：
   - **Repository name**: `riggievoice` など（任意の名前）
   - **Public / Private**: **Public（公開）** に設定してください（※GitHub Pagesで無料公開するために必須です）。
   - **Initialize this repository with**: 何もチェックを入れずに空白のままにします。
4. 下部にある **「Create repository」** ボタンをクリックします。

### ステップ 2: ファイルをアップロードする
1. リポジトリ作成直後の画面の中央付近にある、**「uploading an existing file」** という青いリンクをクリックします。
2. エクスプローラーで、お使いのPCの `c:\Users\r0912\Desktop\AntiGravity_develop\riggievoice` フォルダを開きます。
3. フォルダ内の以下のファイル・フォルダを**すべて選択**し、ブラウザのドラッグ＆ドロップエリアへ引き渡します：
   - `data` (フォルダごと)
   - `src` (フォルダごと)
   - `index.html`
   - `style.css`
   - (※ `.antigravity_context.md` などの管理ファイルはアップロードしなくても動作に影響ありません)
4. アップロード完了後、画面下部にある緑色の **「Commit changes」** ボタンをクリックします。

### ステップ 3: GitHub Pagesを有効にしてWeb公開する
1. GitHubのリポジトリ画面上部にある **「Settings」**（歯車マーク）タブをクリックします。
2. 左メニューの「Code and automation」カテゴリの中にある **「Pages」** をクリックします。
3. 「Build and deployment」の項目にある **「Branch」** 設定を：
   - `None` ➡️ **`main`** (または `master`) に変更。
   - フォルダ指定は `/ (root)` のままにします。
4. 右側にある **「Save」** ボタンをクリックします。
5. 数十秒〜1分ほど待ってからページをリロードすると、画面上部に **「Your site is live at...」** と公開URLが表示されます。そのURLにアクセスすればWeb上でリギーが動きます！

---

## 方法2：Gitコマンド（VS CodeやGit Bash）を使ってアップロードする

ファイルの変更があった際に、コマンド一発で差分だけをアップデートしたい場合に便利な開発者向けの方法です。

### 初回設定（リポジトリの紐付けと送信）
お使いのPCのターミナル（PowerShell等）で、`riggievoice` フォルダに移動して以下を実行します。

```bash
# 1. Gitの初期化
git init

# 2. すべてのファイルをステージングに追加
git add .

# 3. 最初のコミットを作成
git commit -m "Initial commit of riggie voice app"

# 4. メインブランチ名を main に設定
git branch -M main

# 5. GitHub上のリモートリポジトリURLを登録 (※URLは作成したリポジトリのものに書き換えてください)
git remote add origin https://github.com/ユーザー名/riggievoice.git

# 6. GitHubへプッシュ
git push -u origin main
```

### 2回目以降の更新手順
コードや音声を変更してGitHubに反映させたい場合は、以下を実行するだけです。

```bash
git add .
git commit -m "Update assets and fix bug"
git push
```
プッシュすると、自動的にGitHub Pages上のWebサイトも最新版に更新されます。
