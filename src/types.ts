namespace RiggieApp {
  /**
   * アシカの表情の状態を表す型
   */
  export type SealionState = 'idle' | 'barking' | 'shushing';

  /**
   * 音声再生の設定を表すインターフェース
   */
  export interface AudioSettings {
    playbackRate: number;
    volume: number;
    barkIntervalMs: number;
    barkDurationMs: number;
  }

  /**
   * SealionViewerコンポーネントのプロパティ定義
   */
  export type SealionViewerProps = {
    state: SealionState;
    elementId: string;
  };

  /**
   * ControlPanelコンポーネントのプロパティ定義
   */
  export type ControlPanelProps = {
    onBarkStart: () => void;
    onBarkEnd: () => void;
    onShushStart: () => void;
    onShushEnd: () => void;
    elementId: string;
  };
}
