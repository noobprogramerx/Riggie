var RiggieApp = RiggieApp || {};

(function (RiggieApp) {
  /**
   * アプリケーションのメインコントローラー
   */
  class App {
    constructor() {
      this.viewer = null;
      this.controlPanel = null;
      this.audioPlayer = null;
      this.settings = {
        playbackRate: 1.0,
        volume: 0.8,
        barkIntervalMs: 300,
        barkDurationMs: 400
      };
      this.barkIntervalId = null;
      this.barkStartTime = 0;
    }

    /**
     * アプリケーションの初期化
     */
    async init() {
      try {
        this.showLoading(true);

        // 設定ファイルの読み込み
        await this.loadSettings();

        // 各コンポーネントの初期化
        this.viewer = new RiggieApp.SealionViewer({
          state: 'idle',
          elementId: 'sealion-viewer-root'
        });

        this.audioPlayer = new RiggieApp.AudioPlayer(this.settings, (msg) => this.showErrorMessage(msg));

        this.controlPanel = new RiggieApp.ControlPanel({
          elementId: 'control-panel-root',
          onBarkStart: () => this.handleBarkStart(),
          onBarkEnd: () => this.handleBarkEnd(),
          onShushStart: () => this.handleShushStart(),
          onShushEnd: () => this.handleShushEnd()
        });

        this.showLoading(false);
      } catch (error) {
        this.showLoading(false);
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.showErrorMessage(`アプリケーションの初期化に失敗しました: ${errorMessage}`);
      }
    }

    /**
     * 設定JSONファイルの読み込み
     */
    async loadSettings() {
      if (window.location.protocol === 'file:') {
        console.log('Running on file:// protocol. Skipping settings fetch.');
        return;
      }
      try {
        const response = await fetch('data/mock_settings.json');
        if (!response.ok) {
          throw new Error(`Settings response status: ${response.status}`);
        }
        const data = await response.json();
        this.settings = { ...this.settings, ...data };
      } catch (error) {
        console.warn('Failed to load settings from JSON. Using default settings.', error);
      }
    }

    /**
     * 吠えるアクションの開始
     */
    handleBarkStart() {
      try {
        if (this.barkIntervalId !== null) {
          return;
        }

        this.barkStartTime = Date.now();

        if (this.viewer) {
          this.viewer.updateState('barking');
        }
        if (this.audioPlayer) {
          this.audioPlayer.playBark();
        }

        this.barkIntervalId = window.setInterval(() => {
          if (this.audioPlayer) {
            this.audioPlayer.playBark();
          }
          // 長押し中は通常顔に戻さず、吠える画像を維持する（画像リフレッシュ処理を削除）
        }, this.settings.barkIntervalMs);
      } catch (error) {
        console.error('Error during bark start:', error);
      }
    }

    /**
     * 吠えるアクションの終了
     */
    handleBarkEnd() {
      try {
        const elapsed = Date.now() - this.barkStartTime;
        const isLongPress = elapsed >= 200; // 200ms以上押されていたら長押しとみなす

        if (this.barkIntervalId !== null) {
          clearInterval(this.barkIntervalId);
          this.barkIntervalId = null;
        }

        if (isLongPress) {
          // 長押しの場合は即時すべての吠え声を停止し、通常顔に戻す
          if (this.audioPlayer) {
            this.audioPlayer.stopAllBarks();
          }
          if (this.viewer) {
            this.viewer.updateState('idle');
          }
        } else {
          // 1クリック（短押し）の場合は音声を即時停止せず、自然に最後まで再生させる
          // 表情は音声が終了する頃（barkDurationMs後）に自動で通常顔に戻す
          const currentStartTime = this.barkStartTime;
          setTimeout(() => {
            // 新たな長押しやアクションが始まっていない場合のみidleに戻す
            if (this.barkIntervalId === null && this.barkStartTime === currentStartTime) {
              if (this.viewer) {
                this.viewer.updateState('idle');
              }
            }
          }, this.settings.barkDurationMs);
        }
      } catch (error) {
        console.error('Error during bark end:', error);
      }
    }

    /**
     * シーアクションの開始
     */
    handleShushStart() {
      try {
        // 吠え動作中の場合は強制終了
        this.handleBarkEnd();

        if (this.viewer) {
          this.viewer.updateState('shushing');
        }
        if (this.audioPlayer) {
          this.audioPlayer.playShush();
        }
      } catch (error) {
        console.error('Error during shush start:', error);
      }
    }

    /**
     * シーアクションの終了
     */
    handleShushEnd() {
      try {
        if (this.audioPlayer) {
          this.audioPlayer.stopShush();
        }
        if (this.barkIntervalId === null) {
          if (this.viewer) {
            this.viewer.updateState('idle');
          }
        }
      } catch (error) {
        console.error('Error during shush end:', error);
      }
    }

    /**
     * ローディング表示の制御
     * @param {boolean} show 表示フラグ
     */
    showLoading(show) {
      const loader = document.getElementById('loading-indicator');
      if (loader) {
        loader.style.display = show ? 'flex' : 'none';
      }
    }

    /**
     * エラーメッセージを画面上部に表示する
     * @param {string} message 表示するメッセージ
     */
    showErrorMessage(message) {
      const errEl = document.getElementById('error-display');
      if (errEl) {
        errEl.innerText = message;
        errEl.style.display = 'block';
        setTimeout(() => {
          errEl.style.display = 'none';
        }, 5000);
      }
    }
  }

  RiggieApp.App = App;
})(RiggieApp);

// アプリ起動処理
const bootstrapApp = () => {
  try {
    const app = new RiggieApp.App();
    app.init().catch((err) => {
      console.error('Application bootstrap failed:', err);
    });
  } catch (err) {
    console.error('Failed to create App instance:', err);
  }
};

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootstrapApp);
} else {
  bootstrapApp();
}
