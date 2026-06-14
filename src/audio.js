var RiggieApp = RiggieApp || {};

(function (RiggieApp) {
  /**
   * 音声の再生を管理するクラス
   */
  class AudioPlayer {
    /**
     * コンストラクタ
     * @param {Object} settings 音声設定
     * @param {Function} onError エラー発生時のコールバック
     */
    constructor(settings, onError) {
      this.barkAudio = null;
      this.shushAudio = null;
      this.activeBarks = [];
      this.settings = settings;
      this.onErrorCallback = onError;
      this.initAudios();
    }

    /**
     * 音声ファイルの初期化
     */
    initAudios() {
      try {
        this.barkAudio = new Audio('data/オッオッ.m4a');
        this.shushAudio = new Audio('data/シー.m4a');

        // 音声のロードエラーハンドリング
        this.barkAudio.onerror = () => {
          const code = this.barkAudio.error ? this.barkAudio.error.code : 'unknown';
          const msg = this.barkAudio.error ? this.barkAudio.error.message : 'no message';
          alert('【デバッグ】吠える声ロードエラー\nコード: ' + code + '\nメッセージ: ' + msg);
          this.handleError('吠える声の音声ファイル (data/オッオッ.m4a) の読み込みに失敗しました。');
        };
        this.shushAudio.onerror = () => {
          const code = this.shushAudio.error ? this.shushAudio.error.code : 'unknown';
          const msg = this.shushAudio.error ? this.shushAudio.error.message : 'no message';
          alert('【デバッグ】シー音ロードエラー\nコード: ' + code + '\nメッセージ: ' + msg);
          this.handleError('シーの音声ファイル (data/シー.m4a) の読み込みに失敗しました。');
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.handleError(`音声の初期化中にエラーが発生しました: ${errorMessage}`);
      }
    }

    /**
     * 吠える声を再生する（指定時間でトリミング）
     */
    playBark() {
      try {
        if (!this.barkAudio) {
          throw new Error('音声プレイヤーが初期化されていません。');
        }
        const clone = this.barkAudio.cloneNode(true);
        clone.volume = this.settings.volume;
        clone.playbackRate = this.settings.playbackRate;

        this.activeBarks.push(clone);
        let trimTimer = null;

        const stopTrigger = () => {
          try {
            clone.pause();
            clone.remove();
            this.activeBarks = this.activeBarks.filter(c => c !== clone);
            if (trimTimer !== null) {
              clearTimeout(trimTimer);
            }
          } catch (e) {
            console.error('Failed to stop bark clone:', e);
          }
        };

        clone.onended = stopTrigger;

        const playPromise = clone.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            const duration = this.settings.barkDurationMs || 1200;
            trimTimer = window.setTimeout(stopTrigger, duration);
          }).catch((error) => {
            this.activeBarks = this.activeBarks.filter(c => c !== clone);
            alert('【デバッグ】吠える声再生失敗: ' + error.message);
            console.error('Audio playback failed:', error);
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        alert('【デバッグ】吠える声実行例外: ' + errorMessage);
        this.handleError(`吠える声の再生中にエラーが発生しました: ${errorMessage}`);
      }
    }

    /**
     * 再生中のすべての吠える声を即座に停止する
     */
    stopAllBarks() {
      this.activeBarks.forEach(clone => {
        try {
          clone.pause();
          clone.remove();
        } catch (e) {
          console.error('Failed to stop active bark clone:', e);
        }
      });
      this.activeBarks = [];
    }

    /**
     * シーの声を最後まで1回再生する（クローン方式・音量最大）
     */
    playShush() {
      try {
        if (!this.shushAudio) {
          throw new Error('音声プレイヤーが初期化されていません。');
        }
        const clone = this.shushAudio.cloneNode(true);
        clone.volume = 1.0;
        clone.playbackRate = this.settings.playbackRate;

        clone.onended = () => {
          clone.remove();
        };

        const playPromise = clone.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            alert('【デバッグ】シー音再生失敗: ' + error.message);
            console.error('Audio playback failed:', error);
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        alert('【デバッグ】シー音実行例外: ' + errorMessage);
        this.handleError(`シーの再生中にエラーが発生しました: ${errorMessage}`);
      }
    }

    /**
     * シーの声を停止する（互換性のために残す）
     */
    stopShush() {
    }

    /**
     * 設定を更新する
     * @param {Object} newSettings 新しい設定
     */
    updateSettings(newSettings) {
      this.settings = { ...this.settings, ...newSettings };
    }

    /**
     * エラーを処理し、コールバックを呼び出す
     * @param {string} message エラーメッセージ
     */
    handleError(message) {
      console.error(message);
      if (this.onErrorCallback) {
        this.onErrorCallback(message);
      }
    }
  }

  RiggieApp.AudioPlayer = AudioPlayer;
})(RiggieApp);
