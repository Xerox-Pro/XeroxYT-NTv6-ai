import { Video } from "../types";

/**
 * 独自アルゴリズムによる推薦エンジン
 * 外部API（Gemini等）を使用せず、ローカルの統計ロジックのみでユーザーの嗜好を予測します。
 */

// 無視する一般的な助詞や単語
const STOP_WORDS = new Set([
  "の", "は", "を", "に", "が", "で", "と", "も", "な", "い", "し", "た", "から", "まで",
  "と", "や", "など", "、", "。", "！", "？", " ", "【", "】", "|", "-", "!", "?",
  "www", "com", "http", "https", "チャンネル", "公式", "配信", "実況", "動画", "Video", "Official"
]);

export function getCustomAIInterests(history: Video[]): string {
  if (history.length === 0) return "日本 人気";

  const wordScores: Record<string, number> = {};

  // 1. 履歴からキーワードを抽出してスコアリング
  history.forEach((video, index) => {
    // 最近見た動画ほど重みを高くする（時間減衰）
    const timeWeight = (history.length - index) / history.length;
    
    // タイトルをトークン化（簡易分割）
    const tokens = video.title.toLowerCase().split(/[\s　|【】!！?？、。・-]+/);
    
    tokens.forEach(token => {
      if (token.length < 2 || STOP_WORDS.has(token)) return;
      
      // 出現頻度 × 新鮮さ でスコアを計算
      wordScores[token] = (wordScores[token] || 0) + (1 * timeWeight);
    });
  });

  // 2. スコアが高い順にソートし、上位3〜5つのキーワードを選出
  const sortedKeywords = Object.entries(wordScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(entry => entry[0]);

  // キーワードが少なすぎる場合はデフォルトを追加
  if (sortedKeywords.length < 2) {
    return [...sortedKeywords, "トレンド", "おすすめ"].join(" ");
  }

  return sortedKeywords.join(" ");
}

/**
 * 取得した動画リストを、ユーザーの嗜好ベクトルとの類似度で再ソートする
 */
export function rankVideosByPreference(videos: Video[], history: Video[]): Video[] {
  if (history.length === 0) return videos;

  // ユーザーの嗜好プロファイル（頻出単語）を作成
  const profile: Record<string, number> = {};
  history.forEach(v => {
    v.title.toLowerCase().split(/[\s　]+/).forEach(t => {
      if (t.length >= 2 && !STOP_WORDS.has(t)) {
        profile[t] = (profile[t] || 0) + 1;
      }
    });
  });

  return [...videos].sort((a, b) => {
    const scoreA = calculateSimilarity(a, profile);
    const scoreB = calculateSimilarity(b, profile);
    return scoreB - scoreA;
  });
}

function calculateSimilarity(video: Video, profile: Record<string, number>): number {
  let score = 0;
  const title = video.title.toLowerCase();
  
  Object.entries(profile).forEach(([word, weight]) => {
    if (title.includes(word)) {
      score += weight;
    }
  });
  
  return score;
}
