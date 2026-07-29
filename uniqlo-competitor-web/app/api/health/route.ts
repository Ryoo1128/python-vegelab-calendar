import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    browserlessConfigured: Boolean(process.env.BROWSERLESS_TOKEN),
    checkedAt: new Date().toISOString(),
  });
}
