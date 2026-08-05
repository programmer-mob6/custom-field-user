import { useRef, useState } from "react";
import { AppSidebar } from "../../../shared/components/AppSidebar";
import { LicenseCounterCards } from "../components/LicenseCounterCards";
import { HealthCounterCards } from "../components/HealthCounterCards";
import { TagFilterPanel } from "../components/TagFilterPanel";
import { TagTableCard } from "../components/TagTableCard";
import { TagTabs } from "../components/TagTabs";
import { TagToolbar } from "../components/TagToolbar";
import { useTagCounters } from "../hooks/useTagCounters";
import { useTagRegistry } from "../hooks/useTagRegistry";
import { useTagStore } from "../store/tagStore";

export default function TagPage() {
  const tags = useTagStore((state) => state.tags);
  const quotas = useTagStore((state) => state.quotas);
  const {
    tab,
    setTab,
    search,
    setSearch,
    activeCategories,
    toggleCategory,
    source,
    setSource,
    status,
    setStatus,
    filtered,
    clearFilters,
  } = useTagRegistry(tags);
  const { license, health } = useTagCounters(tags, quotas);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const pageInputRef = useRef<HTMLInputElement>(null);

  return (
    <main className="app-shell">
      <AppSidebar />
      <section className="content">
        <div className="breadcrumb">
          TAG <span>/</span> All TAGs
        </div>
        <div className="page-title">
          <div>
            <h1>All TAGs</h1>
            <p>Central registry for every physical TAG activated on this platform.</p>
          </div>
        </div>
        <TagTabs tab={tab} setTab={setTab} />
        {tab === "all" && (
          <LicenseCounterCards
            cards={license}
            activeCategories={activeCategories}
            onToggle={toggleCategory}
          />
        )}
        {tab === "not-paired" && (
          <HealthCounterCards
            cards={health}
            activeCategories={activeCategories}
            onToggle={toggleCategory}
          />
        )}
        <TagToolbar
          search={search}
          setSearch={setSearch}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
        />
        {showFilters && (
          <TagFilterPanel
            source={source}
            setSource={setSource}
            status={status}
            setStatus={setStatus}
            onClear={clearFilters}
          />
        )}
        <TagTableCard
          rows={filtered}
          totalLength={tags.length}
          showStatus={tab !== "paired"}
          page={page}
          pageInputRef={pageInputRef}
          setPage={setPage}
        />
      </section>
    </main>
  );
}
