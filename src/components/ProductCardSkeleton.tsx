export default function ProductCardSkeleton() {
  return (
    <article className="pcard">
      <div className="pcard__media" style={{ padding: 0 }}>
        <span className="skel" style={{ display: "block", height: 164, borderRadius: 0 }} />
      </div>
      <div className="pcard__body">
        <span className="skel skel--md" />
        <span className="skel skel--sm" style={{ width: "60%" }} />
        <div className="pcard__meta">
          <span className="skel skel--badge" />
          <span className="skel skel--sm" style={{ width: 50 }} />
        </div>
        <span className="skel skel--lg" style={{ borderRadius: "var(--radius)" }} />
      </div>
    </article>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="pgrid">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
