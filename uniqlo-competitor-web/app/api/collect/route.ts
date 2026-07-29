import { NextRequest, NextResponse } from "next/server";
import { brands, buildSourceUrl, type Platform } from "@/lib/brands";
import { classifyRole } from "@/lib/classify";
import type { CaptureResult } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const allowedPlatforms = new Set(["official", "naver", "meta", "google", "instagram"]);

const browserlessCode = String.raw`
export default async ({ page, context }) => {
  const result = {
    title: "",
    bodyText: "",
    screenshot: "",
    links: [],
    status: "success",
    error: ""
  };

  try {
    await page.setViewport({ width: 1440, height: 1050, deviceScaleFactor: 1 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    );

    await page.goto(context.url, {
      waitUntil: "domcontentloaded",
      timeout: 45000
    });

    await new Promise(resolve => setTimeout(resolve, context.waitMs || 7000));

    result.title = await page.title();
    result.bodyText = await page.evaluate(() =>
      (document.body?.innerText || "").replace(/\s+/g, " ").trim().slice(0, 10000)
    );
    result.links = await page.evaluate(() =>
      Array.from(document.querySelectorAll("a"))
        .slice(0, 40)
        .map(a => ({
          text: (a.innerText || a.getAttribute("aria-label") || "").trim().slice(0, 160),
          href: a.href || ""
        }))
        .filter(x => x.href)
    );
    result.screenshot = await page.screenshot({
      encoding: "base64",
      type: "jpeg",
      quality: 72,
      fullPage: false
    });
  } catch (error) {
    result.status = "failed";
    result.error = error instanceof Error ? error.message : String(error);
    try {
      result.screenshot = await page.screenshot({
        encoding: "base64",
        type: "jpeg",
        quality: 60,
        fullPage: false
      });
    } catch (_) {}
  }

  return { data: result, type: "application/json" };
};
`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const brandName = String(body.brand || "");
    const platform = String(body.platform || "") as Platform;

    const brand = brands.find(item => item.name === brandName);
    if (!brand) {
      return NextResponse.json({ error: "지원하지 않는 브랜드입니다." }, { status: 400 });
    }
    if (!allowedPlatforms.has(platform)) {
      return NextResponse.json({ error: "지원하지 않는 플랫폼입니다." }, { status: 400 });
    }

    const token = process.env.BROWSERLESS_TOKEN;
    const endpoint = process.env.BROWSERLESS_ENDPOINT || "https://production-sfo.browserless.io";
    if (!token) {
      return NextResponse.json(
        { error: "BROWSERLESS_TOKEN이 설정되지 않았습니다. Vercel 환경변수에 토큰을 등록하세요." },
        { status: 503 }
      );
    }

    const sourceUrl = buildSourceUrl(brand, platform);
    const response = await fetch(`${endpoint}/function?token=${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: browserlessCode,
        context: { url: sourceUrl, waitMs: platform === "meta" || platform === "google" ? 10000 : 7000 },
      }),
      cache: "no-store",
    });

    const raw = await response.text();
    if (!response.ok) {
      return NextResponse.json(
        { error: `Browserless 요청 실패 (${response.status}): ${raw.slice(0, 500)}` },
        { status: 502 }
      );
    }

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "Browserless 응답을 JSON으로 해석하지 못했습니다." }, { status: 502 });
    }

    const data = parsed.data ?? parsed;
    const classification = classifyRole(`${data.title || ""} ${data.bodyText || ""}`);

    const result: CaptureResult = {
      id: `${brand.name}-${platform}-${Date.now()}`,
      brand: brand.name,
      platform,
      capturedAt: new Date().toISOString(),
      sourceUrl,
      title: data.title || `${brand.name} ${platform}`,
      bodyText: data.bodyText || "",
      screenshot: data.screenshot ? `data:image/jpeg;base64,${data.screenshot}` : "",
      links: Array.isArray(data.links) ? data.links : [],
      role: classification.role,
      roleReason: classification.reason,
      status: data.status === "failed" ? "failed" : "success",
      error: data.error || undefined,
    };

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
