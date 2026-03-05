import type { Sponsor } from "@/lib/types";

export function SponsorsSection({ sponsors }: { sponsors: Sponsor[] }) {
  if (!sponsors || sponsors.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
      <h3 className="text-[15px] font-bold text-primary mb-4">Our Sponsors</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {sponsors.slice(0, 3).map((sponsor, i) => (
          <div
            key={i}
            className="border border-border rounded-xl overflow-hidden flex flex-col hover:border-primary/30 hover:shadow-md transition-all"
          >
            {sponsor.image && (
              <img
                src={sponsor.image}
                alt={sponsor.title}
                className="w-full h-32 object-contain bg-surface p-2"
              />
            )}
            <div className="p-3.5 flex flex-col flex-1">
              <h4 className="text-sm font-bold text-primary leading-snug">
                {sponsor.title}
              </h4>
              {sponsor.description && (
                <p className="text-xs text-muted mt-1.5 leading-relaxed line-clamp-3">
                  {sponsor.description}
                </p>
              )}
              {sponsor.link && (
                <a
                  href={sponsor.link.startsWith("http") ? sponsor.link : `https://${sponsor.link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-accent text-white text-xs font-bold hover:bg-accent-hover transition-colors self-start"
                >
                  {sponsor.ctaText || "Visit Sponsor"}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
