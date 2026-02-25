// ── Badge Component ──────────────────────────────────────────
export function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "green" | "orange" | "red" | "purple" | "blue" }) {
  const styles: Record<string, string> = {
    default: "bg-slate-100 text-slate-700",
    green: "bg-red-50 text-[#DC373E]",
    orange: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    purple: "bg-purple-50 text-purple-700",
    blue: "bg-blue-50 text-blue-700",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${styles[variant]}`}>
      {children}
    </span>
  );
}

// ── Listing Card ─────────────────────────────────────────────
export function ListingCard({
  href,
  title,
  subtitle,
  badges,
  details,
  featured,
  cta,
}: {
  href: string;
  title: string;
  subtitle: string;
  badges: { label: string; variant?: "default" | "green" | "orange" | "red" | "purple" | "blue" }[];
  details: { label: string; value: string }[];
  featured?: boolean;
  cta?: string;
}) {
  return (
    <a
      href={href}
      className="group block bg-white rounded-2xl border border-border p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 relative"
    >
      {featured && (
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
            ⭐ Featured
          </span>
        </div>
      )}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {badges.map((b, i) => (
          <Badge key={i} variant={b.variant}>{b.label}</Badge>
        ))}
      </div>
      <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-primary group-hover:text-accent-hover transition-colors mb-1">
        {title}
      </h3>
      <p className="text-muted text-sm mb-4">{subtitle}</p>
      <div className="grid grid-cols-2 gap-2">
        {details.map((d, i) => (
          <div key={i}>
            <p className="text-xs text-muted">{d.label}</p>
            <p className="text-sm font-medium">{d.value}</p>
          </div>
        ))}
      </div>
      {cta && (
        <div className="mt-4 pt-4 border-t border-border">
          <span className="text-sm font-semibold text-accent-hover group-hover:text-accent transition-colors">
            {cta} →
          </span>
        </div>
      )}
    </a>
  );
}

// ── Page Header ──────────────────────────────────────────────
export function PageHeader({
  title,
  description,
  listingCount,
}: {
  title: string;
  description: string;
  listingCount?: number;
}) {
  return (
    <div className="bg-primary text-white py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-3">
          {title}
        </h1>
        <p className="text-white/70 max-w-2xl text-lg">{description}</p>
        {listingCount !== undefined && (
          <p className="mt-3 text-sm text-accent font-medium">{listingCount} listings</p>
        )}
      </div>
    </div>
  );
}

// ── Filter Bar ───────────────────────────────────────────────
export function FilterBar({
  filters,
}: {
  filters: {
    label: string;
    options: string[];
    value: string;
    onChange: (val: string) => void;
  }[];
}) {
  return (
    <div className="flex flex-wrap gap-3 py-6">
      {filters.map((f) => (
        <select
          key={f.label}
          value={f.value}
          onChange={(e) => f.onChange(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-border bg-white text-sm font-medium text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent cursor-pointer"
        >
          <option value="">{f.label}</option>
          {f.options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      ))}
    </div>
  );
}

// ── Inline Anytime CTA (for use within listing pages) ───────
export function AnytimeInlineCTA() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-light p-6 md:p-8 text-white flex items-center gap-6">
      <div className="flex-1">
        <p className="text-accent text-xs font-semibold uppercase tracking-wider mb-1">Recommended Resource</p>
        <h3 className="font-[family-name:var(--font-display)] text-xl font-bold mb-2">
          Supplement Team Training with 5,000+ Videos
        </h3>
        <p className="text-white/70 text-sm mb-4">
          Anytime Soccer Training offers structured follow-along sessions your player can do at home, in the backyard, or at the park.
        </p>
        <a
          href="https://anytime-soccer.com?ref=soccerfinder"
          target="_blank"
          rel="noopener"
          className="inline-flex items-center px-5 py-2.5 rounded-lg bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors"
        >
          Try It Free →
        </a>
      </div>
      <img
        src="/ast-shield.png"
        alt="Anytime Soccer Training"
        className="hidden sm:block h-24 md:h-28 w-auto opacity-80 shrink-0"
      />
    </div>
  );
}

// ── Empty State ──────────────────────────────────────────────
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-16">
      <p className="text-4xl mb-4">🔍</p>
      <p className="text-muted text-lg">{message}</p>
    </div>
  );
}
