export type Platform = "official" | "naver" | "meta" | "google" | "instagram";

export type Brand = {
  name: string;
  officialUrl: string;
  instagram: string;
};

export const brands: Brand[] = [
  { name: "무신사", officialUrl: "https://www.musinsa.com/", instagram: "musinsa.official" },
  { name: "나이키", officialUrl: "https://www.nike.com/kr/", instagram: "nike" },
  { name: "탑텐", officialUrl: "https://topten10mall.com/", instagram: "topten10_kr" },
  { name: "뉴발란스", officialUrl: "https://www.nbkorea.com/", instagram: "newbalance_kr" },
  { name: "H&M", officialUrl: "https://www2.hm.com/ko_kr/index.html", instagram: "hm" },
  { name: "Verish", officialUrl: "https://verish.co.kr/", instagram: "verish_official" },
  { name: "huit8", officialUrl: "https://huit8.com/", instagram: "huit8_official" },
  { name: "Konny", officialUrl: "https://konny.co.kr/", instagram: "konnybaby" },
];

export const platforms: { key: Platform; label: string }[] = [
  { key: "official", label: "공식 프로모션" },
  { key: "naver", label: "네이버 검색" },
  { key: "meta", label: "Meta 광고" },
  { key: "google", label: "Google 광고" },
  { key: "instagram", label: "Instagram" },
];

export function buildSourceUrl(brand: Brand, platform: Platform) {
  const q = encodeURIComponent(brand.name);
  if (platform === "official") return brand.officialUrl;
  if (platform === "naver") return `https://search.naver.com/search.naver?query=${q}`;
  if (platform === "meta") {
    return `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=KR&q=${q}&search_type=keyword_unordered`;
  }
  if (platform === "google") {
    return `https://adstransparency.google.com/?region=KR&query=${q}`;
  }
  return `https://www.instagram.com/${brand.instagram}/`;
}
