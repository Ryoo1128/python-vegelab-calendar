import type { Platform } from "./brands";

export type FunnelRole = "인지" | "관심·탐색" | "전환" | "리마인드" | "확인 필요";

export type CaptureResult = {
  id: string;
  brand: string;
  platform: Platform;
  capturedAt: string;
  sourceUrl: string;
  title: string;
  bodyText: string;
  screenshot: string;
  links: { text: string; href: string }[];
  role: FunnelRole;
  roleReason: string;
  status: "success" | "failed";
  error?: string;
};
