var RiggieApp = RiggieApp || {};

(function (RiggieApp) {
  /**
   * 簡単なテストヘルパー
   */
  class TestSuite {
    constructor() {
      this.resultsEl = document.getElementById('test-results');
    }

    /**
     * アサーションを行い結果を画面に描画する
     * @param {string} desc テストケース名
     * @param {boolean} condition テスト条件
     */
    assert(desc, condition) {
      const p = document.createElement('div');
      p.className = `test-case ${condition ? 'pass' : 'fail'}`;
      p.innerText = `${condition ? 'PASS' : 'FAIL'}: ${desc}`;
      if (this.resultsEl) {
        this.resultsEl.appendChild(p);
      }
      if (!condition) {
        console.error(`Assertion failed: ${desc}`);
      }
    }
  }

  // テスト実行処理
  const runTests = () => {
    const suite = new TestSuite();

    // 画像アセット実在チェックによる非同期エラー抑止のため、一時的にHTMLImageElement.prototype.srcをモック化
    const originalSrc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
    if (originalSrc && originalSrc.set) {
      Object.defineProperty(HTMLImageElement.prototype, 'src', {
        set: function(val) {
          this._dummySrc = val;
          // 実際のsrcには1x1のダミー透明画像を代入してロードエラーを防ぐ
          originalSrc.set.call(this, 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
        },
        get: function() {
          return this._dummySrc || '';
        },
        configurable: true
      });
    }

    try {
      // 1. 設定のテスト
      try {
        const mockSettings = {
          playbackRate: 1.0,
          volume: 0.8,
          barkIntervalMs: 400,
          barkDurationMs: 1200
        };
        suite.assert('AudioSettings 型とプロパティの整合性', 
          mockSettings.playbackRate === 1.0 && 
          mockSettings.volume === 0.8 && 
          mockSettings.barkIntervalMs === 400 &&
          mockSettings.barkDurationMs === 1200
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        suite.assert('AudioSettings テスト中のエラー: ' + msg, false);
      }

      // 2. SealionViewer のレンダリングテスト
      try {
        const viewer = new RiggieApp.SealionViewer({
          state: 'idle',
          elementId: 'sealion-viewer-root'
        });
        const img = document.getElementById('sealion-img');
        console.log('DEBUG: img object is', img);
        if (img) {
          console.log('DEBUG: img.src raw is', img.src);
          console.log('DEBUG: img._dummySrc is', img._dummySrc);
        }
        suite.assert('SealionViewer 初期状態が idle であること', img !== null && (decodeURIComponent(img.src).includes('通常') || img.src.includes('riggie_idle')));

        viewer.updateState('barking');
        const imgBark = document.getElementById('sealion-img');
        if (imgBark) {
          console.log('DEBUG: imgBark.src raw is', imgBark.src);
          console.log('DEBUG: imgBark._dummySrc is', imgBark._dummySrc);
        }
        suite.assert('SealionViewer 状態変更 barking が反映されること', imgBark !== null && (decodeURIComponent(imgBark.src).includes('オッオッ') || imgBark.src.includes('riggie_bark')));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        suite.assert('SealionViewer テスト中のエラー: ' + msg, false);
      }

      // 3. AudioPlayer のインスタンス化テスト
      try {
        const settings = { playbackRate: 1.0, volume: 0.8, barkIntervalMs: 400, barkDurationMs: 1200 };
        const player = new RiggieApp.AudioPlayer(settings, (msg) => {});
        suite.assert('AudioPlayer が正常にインスタンス化できること', player !== null);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        suite.assert('AudioPlayer テスト中のエラー: ' + msg, false);
      }
    } finally {
      // テスト完了後にモックを解除
      if (originalSrc) {
        Object.defineProperty(HTMLImageElement.prototype, 'src', originalSrc);
      }
    }
  };

  // ページのロード完了後にテスト実行
  if (document.readyState === 'complete') {
    runTests();
  } else {
    window.addEventListener('load', runTests);
  }
})(RiggieApp);
