import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Resources | Soccer Near Me",
  description: "Free soccer training plans, ebooks, age group calculator, and community groups. Everything you need to develop your player — completely free.",
};

const trainingPlans = [
  {
    title: "7-Day Training Plan",
    description: "See results in just one week. Short daily sessions your player can do in 10 minutes or less.",
    href: "https://anytime-soccer.com/free-soccer-drills-for-kids/",
    image: "https://anytime-soccer.com/wp-content/themes/anytime/images/about/new-chalange-image.png",
  },
  {
    title: "30-Day Training Plan",
    description: "A personalized training schedule based on your player's skill level. Step-by-step videos delivered daily.",
    href: "https://anytime-soccer.com/free-30-day-training-plan/",
    overlay: { big: "FREE 30-DAY", small: "Training Plan" },
  },
  {
    title: "100+ YouTube Video Library",
    description: "Curated YouTube drills organized by age group (U6\u2013Advanced). Just click and train!",
    href: "https://anytime-soccer.com/free-soccer-training-videos-100-youtube-drills-by-age-group/",
    overlay: { big: "100+", small: "YouTube Videos" },
  },
];

const ebooks = [
  {
    title: "The Most Important Skill Never Taught",
    description: "This powerful (yet simple) tip will change your child\u2019s game forever.",
    href: "https://anytime-soccer.com/the-most-important-skill-in-youth-soccer/",
    image: "https://anytime-soccer.com/wp-content/uploads/2021/01/ast_facebook_image_3.jpg",
  },
  {
    title: "Must-Have Guide to In-Home Training",
    description: "Everything you need to know to start training at home effectively.",
    href: "https://anytime-soccer.com/must-have-guide-for-serious-soccer-parents/",
    image: "https://anytime-soccer.com/wp-content/themes/anytime/images/home/bg-1.png",
  },
  {
    title: "20 Questions for Every Club",
    description: "Essential questions to ask before joining any youth soccer club.",
    href: "https://anytime-soccer.com/20-questions-every-parent-should-ask/",
    image: "https://anytime-soccer.com/wp-content/themes/anytime/images/ebook/ebook-1.png",
  },
  {
    title: "Become a Rec Coach SuperHero",
    description: "Transform your rec coaching with practical tips and strategies.",
    href: "https://anytime-soccer.com/become-a-rec-coach-superhero/",
    image: "https://anytime-soccer.com/wp-content/themes/anytime/images/ebook/ebook-2.png",
  },
  {
    title: "Everything About Guest Playing",
    description: "Navigate guest playing opportunities like a pro.",
    href: "https://anytime-soccer.com/everything-you-need-to-know-about-guest-playing/",
    image: "https://anytime-soccer.com/wp-content/themes/anytime/images/ebook/ebook-3.png",
  },
  {
    title: "Monopoly: Issues Facing US Youth Soccer",
    description: "A candid look at what\u2019s holding back American soccer from one parent\u2019s perspective.",
    href: "https://anytime-soccer.com/monopoly-addressing-issues-facing-youth-soccer-ebook/",
    image: "https://anytime-soccer.com/wp-content/uploads/2024/07/us_soccer-768x596.png",
  },
  {
    title: "The Parent Trainer\u2019s Playbook",
    description: "20 unconventional tips for raising a competitive soccer player from one soccer dad\u2019s journey.",
    href: "https://anytime-soccer.com/the-parent-trainers-playbook/",
    image: "https://anytime-soccer.com/wp-content/uploads/2024/08/the-playbook-20-unconventional-tips-for-raising-a-compeitive-soccer-player-thus-far-1024x789.png",
  },
  {
    title: "Player Cards Guide",
    description: "Stay informed about eligibility requirements and avoid missed tournament opportunities.",
    href: "https://anytime-soccer.com/everything-you-need-to-know-about-player-cards/",
    image: "https://anytime-soccer.com/wp-content/uploads/2024/11/pro-tips-for-college-showcases-1.png",
  },
];

const communities = [
  {
    title: "Anytime Soccer Training Group",
    description: "A safe space for soccer parents to ask questions, share wins, and support each other.",
    href: "https://www.facebook.com/groups/anytimesoccerparents",
    image: "https://anytime-soccer.com/wp-content/uploads/2021/04/anytime_facebook_group_770_445.jpg",
  },
  {
    title: "Youth Soccer Coach Group",
    description: "Tips, resources, and support for youth soccer coaches at every level.",
    href: "https://www.facebook.com/groups/youthsoccercoach",
    image: "https://anytime-soccer.com/wp-content/uploads/2021/04/youth_soccer_coach_770_445.jpg",
  },
  {
    title: "Guest Player Opportunities",
    description: "Find and post guest playing opportunities. Get your player on the field.",
    href: "https://www.facebook.com/groups/guestplayers",
    image: "https://anytime-soccer.com/wp-content/uploads/2021/04/youth_soccer_guest_players_770_445.jpg",
  },
];

export default function FreePage() {
  return (
    <>
      {/* Hero */}
      <div className="bg-primary text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold mb-3">
            Free Resources
          </h1>
          <p className="text-white/70 max-w-2xl text-lg">
            Training plans, ebooks, tools, and community — everything you need to develop your player, completely free.
          </p>
        </div>
      </div>

      {/* Training Plans */}
      <div className="bg-surface py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-accent block mb-3">Training Plans</span>
            <h2 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-bold mb-3">Free Training Plans</h2>
            <p className="text-muted text-lg max-w-xl mx-auto">
              Structured plans delivered to your inbox. Just press play and train.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {trainingPlans.map((plan) => (
              <div key={plan.title} className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                {plan.image ? (
                  <img src={plan.image} alt={plan.title} className="w-full aspect-[16/10] object-cover" />
                ) : (
                  <div className="w-full aspect-[16/10] bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                    <div className="text-center text-white p-5">
                      <div className="text-3xl font-extrabold leading-tight">{plan.overlay?.big.split(" ").map((w, i) => (
                        <span key={i}>{i > 0 && " "}<span className={w === "30-DAY" || w === "100+" ? "text-accent" : ""}>{w}</span></span>
                      ))}</div>
                      <div className="text-sm uppercase tracking-widest opacity-80 mt-1">{plan.overlay?.small}</div>
                    </div>
                  </div>
                )}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-[family-name:var(--font-display)] font-bold text-lg mb-2">{plan.title}</h3>
                  <p className="text-muted text-sm mb-5 flex-1">{plan.description}</p>
                  <a
                    href={plan.href}
                    target="_blank"
                    className="block w-full py-3 rounded-xl bg-accent text-white text-center font-semibold hover:bg-accent-hover transition-colors text-sm"
                  >
                    Get Free Plan &rarr;
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Age Group Calculator */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="grid md:grid-cols-[280px_1fr] gap-8 md:gap-12 p-8 md:p-12 items-center">
              <div className="bg-gradient-to-br from-primary to-primary-light rounded-2xl p-8 flex flex-col items-center justify-center aspect-square max-w-[280px] mx-auto w-full">
                <span className="text-7xl mb-3">&#9917;</span>
                <span className="text-white text-2xl font-bold text-center leading-tight">
                  Age Group<br /><span className="text-accent">Calculator</span>
                </span>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-accent block mb-3">Calculator</span>
                <h2 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-bold mb-4">Free Age Group Calculator</h2>
                <p className="text-muted text-lg mb-8 leading-relaxed">
                  Find the correct U6, U8, U10 age group for any season. Get instant results for all three formation cycles.
                </p>
                <a
                  href="https://anytime-soccer.com/calculator/"
                  target="_blank"
                  className="inline-block px-8 py-4 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors text-lg"
                >
                  Calculate Age Group &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ebooks */}
      <div className="bg-surface py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-accent block mb-3">Ebooks & Guides</span>
            <h2 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-bold mb-3">Free Ebooks for Parents & Coaches</h2>
            <p className="text-muted text-lg max-w-xl mx-auto">
              Practical guides packed with tips from a passionate soccer parent and coach.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ebooks.map((book) => (
              <div key={book.title} className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                <img src={book.image} alt={book.title} className="w-full aspect-[16/10] object-cover" />
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-[family-name:var(--font-display)] font-bold text-base mb-2">{book.title}</h3>
                  <p className="text-muted text-sm mb-4 flex-1">{book.description}</p>
                  <a
                    href={book.href}
                    target="_blank"
                    className="block w-full py-2.5 rounded-xl bg-accent text-white text-center font-semibold hover:bg-accent-hover transition-colors text-sm"
                  >
                    Download &rarr;
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Community */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-accent block mb-3">Community</span>
            <h2 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-bold mb-3">Join Our Free Communities</h2>
            <p className="text-muted text-lg max-w-xl mx-auto">
              Connect with thousands of parents and coaches navigating the youth soccer journey.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {communities.map((group) => (
              <div key={group.title} className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow">
                <img src={group.image} alt={group.title} className="w-full aspect-video object-cover" />
                <div className="p-6 text-center">
                  <h3 className="font-[family-name:var(--font-display)] font-bold text-lg mb-2">{group.title}</h3>
                  <p className="text-muted text-sm mb-4">{group.description}</p>
                  <a
                    href={group.href}
                    target="_blank"
                    className="inline-block px-6 py-2.5 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors text-sm"
                  >
                    Join Group &rarr;
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-primary py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-bold text-white mb-4">
            Ready for the Full Training Experience?
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Access 5,000+ follow-along training videos and take your player&apos;s development to the next level.
          </p>
          <a
            href="https://anytime-soccer.com/pricing/"
            target="_blank"
            className="inline-block px-8 py-4 rounded-xl bg-white text-primary font-semibold hover:bg-surface transition-colors text-lg"
          >
            Join for Free &rarr;
          </a>
        </div>
      </div>
    </>
  );
}
