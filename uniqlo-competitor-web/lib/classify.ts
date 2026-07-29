import type { FunnelRole } from "./types";

const rules: Record<Exclude<FunnelRole, "확인 필요">, string[]> = {
  "전환": ["할인", "쿠폰", "특가", "세일", "sale", "구매", "shop now", "지금 구매", "최대", "%", "1+1"],
  "리마인드": ["마감", "종료", "마지막", "오늘까지", "재입고", "다시"],
  "관심·탐색": ["컬렉션", "추천", "비교", "자세히", "더 알아보기", "신상품", "new"],
  "인지": ["브랜드", "캠페인", "시즌", "summer", "winter", "룩북", "story"],
};

export function classifyRole(text: string): { role: FunnelRole; reason: string } {
  const normalized = text.toLowerCase();
  const entries = Object.entries(rules).map(([role, words]) => ({
    role: role as Exclude<FunnelRole, "확인 필요">,
    score: words.reduce((sum, word) => sum + (normalized.includes(word.toLowerCase()) ? 1 : 0), 0),
  }));
  entries.sort((a, b) => b.score - a.score);
  const winner = entries[0];
  if (!winner || winner.score === 0) {
    return { role: "확인 필요", reason: "명확한 가격·상품·시즌 소구를 추출하지 못해 원문 확인이 필요합니다." };
  }
  const reasons: Record<Exclude<FunnelRole, "확인 필요">, string> = {
    "전환": "가격·할인·쿠폰 또는 구매 CTA가 확인되어 직접 전환 유도 소재로 분류했습니다.",
    "리마인드": "종료·마감·재노출성 표현이 확인되어 사이트 복귀 유도 소재로 분류했습니다.",
    "관심·탐색": "컬렉션·추천·상품 비교 표현이 확인되어 상세 탐색 유도 소재로 분류했습니다.",
    "인지": "시즌·브랜드·캠페인 무드 중심 표현이 확인되어 인지 형성 소재로 분류했습니다.",
  };
  return { role: winner.role, reason: reasons[winner.role] };
}
