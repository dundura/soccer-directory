// ── Badge Component ──────────────────────────────────────────
export function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "green" | "orange" | "red" | "purple" | "blue" }) {
  const styles: Record<string, string> = {
    default: "bg-slate-100 text-slate-700",
    green: "bg-red-50 text-[#DC373E]",
    orange: "bg-amber-50 text-amber-700 animate-pulse",
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
  image,
  imagePosition,
  description,
}: {
  href: string;
  title: string;
  subtitle: string;
  badges: { label: string; variant?: "default" | "green" | "orange" | "red" | "purple" | "blue" }[];
  details: { label: string; value: string }[];
  featured?: boolean;
  cta?: string;
  image?: string;
  imagePosition?: number;
  description?: string;
}) {
  return (
    <a
      href={href}
      className={`group flex flex-col bg-white rounded-2xl border overflow-hidden hover:-translate-y-0.5 transition-all duration-200 relative h-full ${featured ? "border-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:shadow-[0_0_30px_rgba(59,130,246,0.25)] ring-1 ring-blue-200/50" : "border-border hover:shadow-lg"}`}
    >
      {image && (
        <div className="w-full h-[200px] overflow-hidden bg-surface flex items-center justify-center flex-shrink-0">
          <img src={image} alt={title} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300" />
        </div>
      )}
      <div className="p-6 flex flex-col flex-1">
        {featured && (
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
              ⭐ Featured
            </span>
          </div>
        )}
        <div className="flex flex-wrap gap-1.5 mb-3 min-h-[52px]">
          {badges.map((b, i) => (
            <Badge key={i} variant={b.variant}>{b.label}</Badge>
          ))}
        </div>
        <h3 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-extrabold text-primary uppercase tracking-tight group-hover:text-accent-hover transition-colors mb-1 min-h-[3.5rem]">
          {title}
        </h3>
        <p className="text-muted text-sm mb-2">{subtitle}</p>
        {description && (
          <p className="text-sm text-primary/70 line-clamp-2 mb-3 leading-relaxed">{description}</p>
        )}
        <div className="grid grid-cols-2 gap-2 flex-1">
          {details.map((d, i) => (
            <div key={i}>
              <p className="text-xs text-muted">{d.label}</p>
              <p className="text-sm font-medium line-clamp-2">{d.value}</p>
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
      </div>
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
const CTA_VARIANTS = [
  { label: "Free Training Plan", title: "Free 7-Day Training Plan", desc: "Get 5,000+ quality touches per day in less than 10 minutes. Just press play.", cta: "Start My Free Plan →", href: "https://www.anytime-soccer.com/free-soccer-drills-for-kids", img: "https://d2vm0l3c6tu9qp.cloudfront.net/Anytime-soccer-camp.webp" },
  { label: "Recommended Resource", title: "5,000+ Follow-Along Training Videos", desc: "Structured sessions your player can do at home, in the backyard, or at the park.", cta: "Try It Free →", href: "https://anytime-soccer.com?ref=soccernearme", img: "/ast-shield.png" },
  { label: "Free Ebook", title: "The Most Important Skill Never Taught", desc: "This powerful (yet simple) tip will change your child's game forever.", cta: "Download Free →", href: "https://anytime-soccer.com/the-most-important-skill-in-youth-soccer/", img: "https://media.anytime-soccer.com/wp-content/uploads/2021/01/ast_facebook_image_3.jpg" },
  { label: "Free Ebook", title: "Must-Have Guide to In-Home Training", desc: "Everything you need to know to start training at home effectively.", cta: "Get the Guide →", href: "https://anytime-soccer.com/must-have-guide-for-serious-soccer-parents/", img: "https://media.anytime-soccer.com/wp-content/themes/anytime/images/home/bg-1.png" },
  { label: "Free Ebook", title: "The Parent Trainer's Playbook", desc: "20 unconventional tips for raising a competitive soccer player.", cta: "Get the Playbook →", href: "https://anytime-soccer.com/the-parent-trainers-playbook/", img: "https://media.anytime-soccer.com/wp-content/uploads/2024/08/the-playbook-20-unconventional-tips-for-raising-a-compeitive-soccer-player-thus-far-1024x789.png" },
  { label: "Free Ebook", title: "20 Questions for Every Club", desc: "Essential questions to ask before joining any youth soccer club.", cta: "Download Free →", href: "https://anytime-soccer.com/20-questions-every-parent-should-ask/", img: "https://media.anytime-soccer.com/wp-content/themes/anytime/images/ebook/ebook-1.png" },
];

export function AnytimeInlineCTA() {
  const v = CTA_VARIANTS[Math.floor(Math.random() * CTA_VARIANTS.length)];

  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-light p-6 md:p-8 text-white flex items-center gap-6">
      <div className="flex-1">
        <p className="text-accent text-xs font-semibold uppercase tracking-wider mb-1">{v.label}</p>
        <h3 className="font-[family-name:var(--font-display)] text-xl font-bold mb-2">{v.title}</h3>
        <p className="text-white/70 text-sm mb-4">{v.desc}</p>
        <a href={v.href} target="_blank" rel="noopener" className="inline-flex items-center px-5 py-2.5 rounded-lg bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors">
          {v.cta}
        </a>
      </div>
      <img src={v.img} alt={v.title} className="hidden sm:block w-32 h-32 md:w-40 md:h-40 rounded-xl object-cover flex-shrink-0" />
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
