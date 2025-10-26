export function HeroSkeleton() {
  return (
    <div className="hero-selector">
      <h2>Select Hero</h2>
      <div className="hero-grid">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="skeleton skeleton-hero-card">
            <div className="skeleton-shimmer"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ItemSkeleton() {
  return (
    <div className="item-selector">
      <h2>Select Items</h2>

      <div className="selected-items">
        <h3>Selected Items (0/12)</h3>
        <div className="selected-items-list">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="skeleton skeleton-item-slot">
              <div className="skeleton-shimmer"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="item-filters skeleton-filters">
        <div className="skeleton skeleton-filter-group">
          <div className="skeleton-shimmer"></div>
        </div>
        <div className="skeleton skeleton-filter-group">
          <div className="skeleton-shimmer"></div>
        </div>
      </div>

      <div className="available-items">
        <h3>Available Items</h3>
        <div className="items-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="skeleton skeleton-item-card">
              <div className="skeleton-shimmer"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LoadingScreen() {
  return (
    <div className="loading-screen-skeleton">
      <div className="app-content">
        <div className="left-panel">
          <div className="skeleton skeleton-build-manager">
            <div className="skeleton-shimmer"></div>
          </div>
          <HeroSkeleton />
        </div>
        <div className="right-panel">
          <ItemSkeleton />
        </div>
      </div>
    </div>
  );
}
