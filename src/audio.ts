namespace RiggieApp {
  /**
   * 音声の再生を管理するクラス
   */
  export class AudioPlayer {
    private barkAudio: HTMLAudioElement | null = null;
    private shushAudio: HTMLAudioElement | null = null;
    private activeBarks: HTMLAudioElement[] = [];
    private settings: AudioSettings;
    private onErrorCallback: ((message: string) => void) | null = null;

    /**
     * コンストラクタ
     * @param settings 音声設定
     * @param onError エラー発生時のコールバック
     */
    constructor(settings: AudioSettings, onError: (message: string) => void) {
      this.settings = settings;
      this.onErrorCallback = onError;
      this.initAudios();
    }

    /**
     * 音声ファイルの初期化
     */
    private initAudios(): void {
      try {
        this.barkAudio = new Audio('data/オッオッ.m4a');
        this.shushAudio = new Audio('data/シー.m4a');

        // 音声のロードエラーハンドリング
        this.barkAudio.onerror = () => {
          this.handleError('吠える声の音声ファイル (data/オッオッ.m4a) の読み込みに失敗しました。');
        };
        this.shushAudio.onerror = () => {
          this.handleError('シーの音声ファイル (data/シー.m4a) の読み込みに失敗しました。');
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.handleError(`音声の初期化中にエラーが発生しました: ${errorMessage}`);
      }
    }

    /**
     * 吠える声を再生する（指定時間でトリミング）
     */
    public playBark(): void {
      try {
        if (!this.barkAudio) {
          throw new Error('音声プレイヤーが初期化されていません。');
        }
        // 連続再生（重複再生）を可能にするため、複製して再生する
        const clone = this.barkAudio.cloneNode(true) as HTMLAudioElement;
        clone.volume = this.settings.volume;
        clone.playbackRate = this.settings.playbackRate;
        
        this.activeBarks.push(clone);
        let trimTimer: number | null = null;

        // トリミング処理（1回だけ吠えるように途中で止める）
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
            // 再生開始後に指定された長さ（ミリ秒）で自動カット
            trimTimer = window.setTimeout(stopTrigger, this.settings.barkDurationMs);
          }).catch((error: unknown) => {
            this.activeBarks = this.activeBarks.filter(c => c !== clone);
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Audio playback failed:', errorMessage);
          });
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.handleError(`吠える声の再生中にエラーが発生しました: ${errorMessage}`);
      }
    }

    /**
     * 再生中のすべての吠える声を即座に停止する
     */
    public stopAllBarks(): void {
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
    public playShush(): void {
      try {
        if (!this.shushAudio) {
          throw new Error('音声プレイヤーが初期化されていません。');
        }
        const clone = this.shushAudio.cloneNode(true) as HTMLAudioElement;
        
        // Web Audio APIはローカル(file://)のCORSポリシー制限で無音になるため使用せず、
        // 音量を最大(1.0)にしたクローン再生のみで行う（新しい大きめの音源に対応）
        clone.volume = 1.0;
        clone.playbackRate = this.settings.playbackRate;

        clone.onended = () => {
          clone.remove();
        };

        const playPromise = clone.play();
        if (playPromise !== undefined) {
          playPromise.catch((error: unknown) => {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Audio playback failed:', errorMessage);
          });
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.handleError(`シーの再生中にエラーが発生しました: ${errorMessage}`);
      }
    }

    /**
     * シーの声を停止する（互換性のために残す）
     */
    public stopShush(): void {
      // 離しても途切れないようにするため、ここでは何もしない
    }

    /**
     * 設定を更新する
     * @param newSettings 新しい設定
     */
    public updateSettings(newSettings: Partial<AudioSettings>): void {
      this.settings = { ...this.settings, ...newSettings };
    }

    /**
     * エラーを処理し、コールバックを呼び出す
     * @param message エラーメッセージ
     */
    private handleError(message: string): void {
      console.error(message);
      if (this.onErrorCallback) {
        this.onErrorCallback(message);
      }
    }
  }
}
