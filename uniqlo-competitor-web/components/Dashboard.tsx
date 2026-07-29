"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Play, RefreshCw, Search, Trash2 } from "lucide-react";
import { brands, platforms, type Platform } from "@/lib/brands";
import type { CaptureResult, FunnelRole } from "@/lib/types";

const storageKey = "uniqlo-competitor-captures-v1";

function platformLabel(platform: Platform) {
  return platforms.find(item => item.key === platform)?.label ?? platform;
}

export default function Dashboard() {
  const [selectedBrand, setSelectedBrand] = useState(brands[0].name);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("official");
  const [captures, setCaptures] = useState<CaptureResult[]>([]);
  const [brandFilter, setBrandFilter] = useState("전체");
  const [platformFilter, setPlatformFilter] = useState("전체");
  const [roleFilter, setRoleFilter] = useState("전체");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [collectAllLoading, setCollectAllLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try { setCaptures(JSON.parse(saved)); } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(captures.slice(0, 80)));
  }, [captures]);

  const filtered = useMemo(() => {
    return captures.filter(item => {
      const text = `${item.brand} ${item.title} ${item.bodyText}`.toLowerCase();
      return (
        (brandFilter === "전체" || item.brand === brandFilter) &&
        (platformFilter === "전체" || item.platform === platformFilter) &&
        (roleFilter === "전체" || item.role === roleFilter) &&
        (!query || text.includes(query.toLowerCase()))
      );
    });
  }, [captures, brandFilter, platformFilter, roleFilter, query]);

  async function collect(brand: string, platform: Platform) {
    const response = await fetch("/api/collect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brand, platform }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "수집에 실패했습니다.");
    setCaptures(prev => [data, ...prev.filter(item => !(item.brand === brand && item.platform === platform))]);
    return data as CaptureResult;
  }

  async function handleCollect() {
    setLoading(true);
    setMessage("");
    try {
      await collect(selectedBrand, selectedPlatform);
      setMessage(`${selectedBrand} · ${platformLabel(selectedPlatform)} 수집이 완료되었습니다.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "수집에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCollectBrand() {
    setCollectAllLoading(true);
    setMessage("");
    let success = 0;
    const errors: string[] = [];
    for (const platform of platforms) {
      try {
        await collect(selectedBrand, platform.key);
        success += 1;
      } catch (error) {
        errors.push(`${platform.label}: ${error instanceof Error ? error.message : "실패"}`);
      }
    }
    setMessage(
      errors.length
        ? `${success}개 채널 수집 완료. 실패: ${errors.join(" / ")}`
        : `${selectedBrand}의 5개 채널 수집이 완료되었습니다.`
    );
    setCollectAllLoading(false);
  }

  const metrics = {
    brands: new Set(captures.map(item => item.brand)).size,
    total: captures.length,
    success: captures.filter(item => item.status === "success").length,
    conversion: captures.filter(item => item.role === "전환").length,
  };

  return (
    <main className="page-shell">
      <header className="header">
        <div>
          <p className="eyebrow">UNIQLO · COMPETITIVE INTELLIGENCE</p>
          <h1>경쟁사 광고 모니터링</h1>
          <p className="subcopy">
            공식 프로모션·네이버·Meta·Google·Instagram 공개 화면을 클라우드 브라우저로 수집합니다.
          </p>
        </div>
        <span className="status-pill">웹 수집형 MVP</span>
      </header>

      <section className="collect-panel">
        <div className="collect-controls">
          <label>
            브랜드
            <select value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)}>
              {brands.map(item => <option key={item.name}>{item.name}</option>)}
            </select>
          </label>
          <label>
            채널
            <select value={selectedPlatform} onChange={e => setSelectedPlatform(e.target.value as Platform)}>
              {platforms.map(item => <option key={item.key} value={item.key}>{item.label}</option>)}
            </select>
          </label>
          <button className="primary-button" onClick={handleCollect} disabled={loading || collectAllLoading}>
            {loading ? <RefreshCw className="spin" size={17}/> : <Play size={17}/>}
            선택 채널 수집
          </button>
          <button className="secondary-button" onClick={handleCollectBrand} disabled={loading || collectAllLoading}>
            {collectAllLoading ? <RefreshCw className="spin" size={17}/> : <RefreshCw size={17}/>}
            브랜드 전체 수집
          </button>
        </div>
        {message && <div className="message">{message}</div>}
      </section>

      <section className="metrics">
        <Metric label="수집 브랜드" value={metrics.brands} />
        <Metric label="수집 화면" value={metrics.total} />
        <Metric label="정상 수집" value={metrics.success} />
        <Metric label="전환 역할" value={metrics.conversion} />
      </section>

      <section className="filter-panel">
        <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)}>
          <option>전체</option>
          {brands.map(item => <option key={item.name}>{item.name}</option>)}
        </select>
        <select value={platformFilter} onChange={e => setPlatformFilter(e.target.value)}>
          <option>전체</option>
          {platforms.map(item => <option key={item.key} value={item.key}>{item.label}</option>)}
        </select>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          {["전체", "인지", "관심·탐색", "전환", "리마인드", "확인 필요"].map(role => <option key={role}>{role}</option>)}
        </select>
        <div className="search-box">
          <Search size={17}/>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="제목·카피 검색" />
        </div>
        <button className="icon-button" title="저장 데이터 삭제" onClick={() => setCaptures([])}>
          <Trash2 size={17}/>
        </button>
      </section>

      {filtered.length === 0 ? (
        <section className="empty-state">
          <h2>아직 수집된 화면이 없습니다.</h2>
          <p>위에서 브랜드와 채널을 선택한 뒤 수집 버튼을 누르세요.</p>
          <p className="small">배포 전에 Vercel 환경변수에 BROWSERLESS_TOKEN을 등록해야 합니다.</p>
        </section>
      ) : (
        <section className="card-grid">
          {filtered.map(item => <CaptureCard key={item.id} item={item} />)}
        </section>
      )}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <article className="metric-card"><span>{label}</span><strong>{value}</strong></article>;
}

function CaptureCard({ item }: { item: CaptureResult }) {
  return (
    <article className="capture-card">
      <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="capture-image-wrap">
        {item.screenshot ? (
          <img src={item.screenshot} alt={`${item.brand} ${platformLabel(item.platform)} 화면`} className="capture-image" />
        ) : (
          <div className="capture-placeholder">이미지 없음</div>
        )}
      </a>
      <div className="capture-body">
        <div className="capture-top">
          <div>
            <strong>{item.brand}</strong>
            <p>{platformLabel(item.platform)} · {new Date(item.capturedAt).toLocaleString("ko-KR")}</p>
          </div>
          <span className={`role-pill role-${item.role.replace("·", "-")}`}>{item.role}</span>
        </div>
        <h3>{item.title || "제목 미확인"}</h3>
        <div className="role-reason">
          <span>역할 해석</span>
          <p>{item.roleReason}</p>
        </div>
        <p className="body-preview">{item.bodyText || item.error || "텍스트를 추출하지 못했습니다."}</p>
        <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="source-link">
          원문 보기 <ExternalLink size={15}/>
        </a>
      </div>
    </article>
  );
}
