var RiggieApp = RiggieApp || {};

(function (RiggieApp) {
  /**
   * アシカの表情とアニメーションを表示するコンポーネント
   */
  class SealionViewer {
    /**
     * コンストラクタ
     * @param {Object} props プロパティ
     */
    constructor(props) {
      this.container = document.getElementById(props.elementId);
      this.state = props.state;
      this.render();
    }

    /**
     * 状態を更新して再レンダリングする
     * @param {string} newState 新しい状態
     */
    updateState(newState) {
      if (this.state !== newState) {
        this.state = newState;
        this.render();
      }
    }

    /**
     * コンポーネントをレンダリングする
     */
    render() {
      try {
        if (!this.container) {
          throw new Error('Viewer container element not found.');
        }

        // 状態に応じたベース画像名 (日本語を優先)
        let baseName = '通常';
        let stateLabel = 'リギー (通常)';
        let animationClass = 'anim-idle';

        if (this.state === 'barking') {
          baseName = 'オッオッ';
          stateLabel = 'リギー (吠え声！)';
          animationClass = 'anim-barking';
        } else if (this.state === 'shushing') {
          baseName = 'シー';
          stateLabel = 'リギー (シーッ)';
          animationClass = 'anim-shushing';
        }

        // HTML構築 (動的Src設定)
        this.container.innerHTML = `
          <div class="sealion-display ${animationClass}">
            <img alt="${stateLabel}" class="sealion-image" id="sealion-img" />
            <div class="sealion-status-bubble">${stateLabel}</div>
          </div>
        `;

        // 画像のロードエラーハンドリング (日本語名 -> 旧英語名の順に、拡張子自動フォールバック)
        const img = document.getElementById('sealion-img');
        if (img) {
          let fileCandidates = [];
          if (baseName === '通常') {
            fileCandidates = ['通常', 'riggie_idle'];
          } else if (baseName === 'オッオッ') {
            fileCandidates = ['オッオッ', 'riggie_bark'];
          } else if (baseName === 'シー') {
            fileCandidates = ['シー', 'riggie_shush'];
          }

          const extensions = ['.png', '.jpg', '.jpeg', '.webp'];
          let candIndex = 0;
          let extIndex = 0;

          const loadNext = () => {
            if (candIndex < fileCandidates.length) {
              const fileBase = fileCandidates[candIndex];
              if (extIndex < extensions.length) {
                const ext = extensions[extIndex];
                extIndex++;
                img.src = `data/${fileBase}${ext}`;
              } else {
                candIndex++;
                extIndex = 0;
                loadNext();
              }
            } else {
              console.error(`Failed to load image: ${baseName}`);
              if (this.container) {
                this.container.innerHTML = `
                  <div class="error-container">
                    <p>画像の読み込みに失敗しました。</p>
                    <small>画像ファイル (data/通常.png または data/riggie_idle.png) などを配置してください。</small>
                  </div>
                `;
              }
            }
          };

          img.onerror = loadNext;
          loadNext();
        }
      } catch (error) {
        console.error('Failed to render SealionViewer:', error);
      }
    }
  }

  /**
   * ボタン操作パネルを制御するコンポーネント
   */
  class ControlPanel {
    /**
     * コンストラクタ
     * @param {Object} props プロパティ
     */
    constructor(props) {
      this.props = props;
      this.container = document.getElementById(props.elementId);
      this.render();
    }

    /**
     * コンポーネントをレンダリングする
     */
    render() {
      try {
        if (!this.container) {
          throw new Error('Control panel container element not found.');
        }

        this.container.innerHTML = `
          <div class="control-buttons">
            <button id="btn-bark" class="btn btn-primary" style="grid-column: span 2; font-size: 1.1rem; padding: 18px 24px;">
              <span class="btn-icon">🔊</span> 吠える (Bark / 長押し)
            </button>
            
            <button id="btn-shush" class="btn btn-secondary" style="grid-column: span 2; font-size: 1.1rem; padding: 18px 24px;">
              <span class="btn-icon">🔇</span> シーッ (Shush)
            </button>
          </div>
        `;

        this.bindEvents();
      } catch (error) {
        console.error('Failed to render ControlPanel:', error);
      }
    }

    /**
     * イベントハンドラの紐付け
     */
    bindEvents() {
      const btnBark = document.getElementById('btn-bark');
      const btnShush = document.getElementById('btn-shush');

      if (!btnBark || !btnShush) {
        return;
      }

      // 吠えるボタン: 長押しイベント（PC/モバイル両対応、重複防止フラグ）
      let isPointerActive = false;

      const startBark = (e) => {
        e.preventDefault();
        if (isPointerActive) return;
        isPointerActive = true;
        this.props.onBarkStart();
      };

      const endBark = (e) => {
        e.preventDefault();
        if (!isPointerActive) return;
        isPointerActive = false;
        this.props.onBarkEnd();
      };

      btnBark.addEventListener('mousedown', startBark);
      btnBark.addEventListener('mouseup', endBark);
      btnBark.addEventListener('mouseleave', endBark);

      btnBark.addEventListener('touchstart', startBark, { passive: false });
      btnBark.addEventListener('touchend', endBark, { passive: false });
      btnBark.addEventListener('touchcancel', endBark, { passive: false });

      // シーッボタン: clickイベントで確実なオーディオ再生許可を取得
      btnShush.addEventListener('click', (e) => {
        e.preventDefault();
        this.props.onShushStart();
        // シー音が終わった頃に自動的に通常顔に戻す (3秒後)
        setTimeout(() => {
          this.props.onShushEnd();
        }, 3000);
      });
    }
  }

  RiggieApp.SealionViewer = SealionViewer;
  RiggieApp.ControlPanel = ControlPanel;
})(RiggieApp);
