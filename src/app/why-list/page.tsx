import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Why List Your Program on Soccer Near Me? | Free Exposure for Soccer Clubs, Camps & Trainers",
  description: "List your soccer club, camp, training program, or tournament on Soccer Near Me for free. Get Facebook shoutouts, blog posts, backlinks, newsletter features, and more.",
};

export default function WhyListPage() {
  return (
    <div className="bg-surface">
      {/* Hero */}
      <section className="bg-primary text-white py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-bold mb-6 leading-tight">
            Why List Your Program on <span className="text-accent">Soccer Near Me</span>?
          </h1>
          <p className="text-white/80 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Stop posting in Facebook groups hoping someone sees it. Get a permanent listing that works for you 24/7 — plus free marketing you can&apos;t get anywhere else.
          </p>
          <a
            href="/dashboard"
            className="inline-block mt-8 bg-accent hover:bg-accent/90 text-white font-semibold px-8 py-3.5 rounded-lg text-lg transition-colors"
          >
            List Your Program — It&apos;s Free
          </a>
        </div>
      </section>

      {/* The Problem */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-border">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-primary mb-4">
            Your Facebook Post Disappears in 24 Hours
          </h2>
          <p className="text-muted leading-relaxed">
            You spend time writing a great post about your camp, tryout, or training program. You share it in a Facebook group. It gets a few likes, maybe a comment or two — and then it&apos;s gone. Buried under dozens of other posts. No one can find it again. That&apos;s the problem with social media: <strong className="text-primary">it&apos;s temporary</strong>.
          </p>
          <p className="text-muted leading-relaxed mt-4">
            A listing on Soccer Near Me is <strong className="text-primary">permanent</strong>. It shows up in Google searches. It&apos;s always there when parents are looking. And it comes with benefits that no Facebook post can offer.
          </p>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-primary text-center mb-12">
          What You Get — Completely Free
        </h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <BenefitCard
            icon="📣"
            title="Facebook Shoutouts"
            description="We promote your listing across our network of youth soccer Facebook groups with thousands of engaged parents and coaches. Real exposure to the people you want to reach."
          />
          <BenefitCard
            icon="✍️"
            title="Create Your Own Posts"
            description="Announce tryouts, share camp details, promote events — post directly on Soccer Near Me whenever you want. Your posts live on your listing page permanently, not lost in a feed."
          />
          <BenefitCard
            icon="📝"
            title="Blog Posts Written For You"
            description="Our team writes blog posts featuring your program. We highlight what makes you unique and publish it on our blog — giving you content you didn't have to create yourself."
          />
          <BenefitCard
            icon="📰"
            title="Newsletter Features"
            description="Your blog posts and listings get included in our email newsletter, reaching parents and coaches who are actively looking for soccer programs for their kids."
          />
          <BenefitCard
            icon="🔗"
            title="Backlinks That Build Authority"
            description="Every listing and blog post links back to your website. These backlinks from our growing domain help improve your site's search engine rankings — the kind of SEO boost that normally costs hundreds per month."
          />
          <BenefitCard
            icon="🔍"
            title="Found on Google — Not Just Facebook"
            description="Your listing is indexed by Google. When parents search for soccer programs in your area, your listing can show up in results — bringing you traffic without spending a dime on ads."
          />
          <BenefitCard
            icon="⭐"
            title="Collect Reviews"
            description="Parents can leave reviews on your listing. Positive reviews build trust and help new families choose your program with confidence."
          />
          <BenefitCard
            icon="📸"
            title="Photos, Videos & Full Profile"
            description="Showcase your program with photos, videos, social media links, and detailed information. Give parents everything they need to know in one place."
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white border-y border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-primary text-center mb-12">
            How It Works
          </h2>
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-12 h-12 bg-accent/10 text-accent font-bold text-xl rounded-full flex items-center justify-center mx-auto mb-4">1</div>
              <h3 className="font-[family-name:var(--font-display)] font-semibold text-primary mb-2">Create Your Account</h3>
              <p className="text-muted text-sm">Sign up for free — it takes less than a minute.</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-accent/10 text-accent font-bold text-xl rounded-full flex items-center justify-center mx-auto mb-4">2</div>
              <h3 className="font-[family-name:var(--font-display)] font-semibold text-primary mb-2">Add Your Listing</h3>
              <p className="text-muted text-sm">Fill in your details — name, location, programs, photos, website, and social links.</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-accent/10 text-accent font-bold text-xl rounded-full flex items-center justify-center mx-auto mb-4">3</div>
              <h3 className="font-[family-name:var(--font-display)] font-semibold text-primary mb-2">Get Discovered</h3>
              <p className="text-muted text-sm">Your listing goes live immediately. We handle the rest — shoutouts, blog posts, and newsletter features.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Who Should List */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-primary text-center mb-8">
          Who Should List?
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            "Soccer Clubs & Academies",
            "Youth & Travel Teams",
            "Soccer Camps & Clinics",
            "Private Trainers & Coaches",
            "Tournament Organizers",
            "Futsal Programs",
            "College Showcases & ID Camps",
            "Soccer Products & Services",
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 bg-white rounded-lg px-5 py-4 border border-border">
              <span className="text-accent text-lg">✓</span>
              <span className="text-primary font-medium">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold mb-4">
            Ready to Get More Visibility?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Join hundreds of soccer programs already listed on Soccer Near Me. It&apos;s free, it&apos;s fast, and it works.
          </p>
          <a
            href="/dashboard"
            className="inline-block bg-accent hover:bg-accent/90 text-white font-semibold px-8 py-3.5 rounded-lg text-lg transition-colors"
          >
            Create Your Free Listing Now
          </a>
          <p className="text-white/50 text-sm mt-4">No credit card required. No catch. Just free exposure for your program.</p>
        </div>
      </section>
    </div>
  );
}

function BenefitCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-primary mb-2">{title}</h3>
      <p className="text-muted text-sm leading-relaxed">{description}</p>
    </div>
  );
}
