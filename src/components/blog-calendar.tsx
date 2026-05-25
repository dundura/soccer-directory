"use client";

import { useState, useEffect } from "react";

interface Post {
  week: number;
  pillar: string;
  title: string;
  leadMagnet: string;
  priority: string;
}

const POSTS: Post[] = [
  { week: 1, pillar: "Education", title: "Why In-Home Soccer Training Is the Future of Youth Development", leadMagnet: "Ultimate At-Home Training Guide", priority: "HIGH" },
  { week: 2, pillar: "How-To", title: "The Ultimate Guide to At-Home Soccer Training", leadMagnet: "7-Day Ball Mastery Plan", priority: "PILLAR" },
  { week: 3, pillar: "Mindset", title: "Soccer Training Without Burnout: A Parent's Guide", leadMagnet: "Burnout Prevention Checklist", priority: "HIGH" },
  { week: 4, pillar: "Skills", title: "Soccer Development Milestones by Age", leadMagnet: "Age-Appropriate Skills Checklist", priority: "HIGH" },
  { week: 5, pillar: "Stories", title: "From Backyard to Club Team: A Home Training Story", leadMagnet: "Link to 7-Day Plan", priority: "MEDIUM" },
  { week: 6, pillar: "Education", title: "How Much Soccer Training Does Your Child Really Need?", leadMagnet: "Weekly Training Template", priority: "HIGH" },
  { week: 7, pillar: "How-To", title: "15-Minute Daily Soccer Routine for Kids Aged 6–12", leadMagnet: "30-Day Training Calendar", priority: "HIGH" },
  { week: 8, pillar: "Mindset", title: "How to Motivate Your Child to Practice Soccer at Home", leadMagnet: "Motivation Toolkit", priority: "HIGH" },
  { week: 9, pillar: "Skills", title: "Top 10 Skills Every Young Soccer Player Should Master", leadMagnet: "Skill Mastery Checklist", priority: "HIGH" },
  { week: 10, pillar: "Stories", title: "How My Child Improved with Just 3 Months of In-Home Training", leadMagnet: "Link to App/Subscription", priority: "MEDIUM" },
  { week: 11, pillar: "Education", title: "What Parents Get Wrong About Youth Soccer Development", leadMagnet: "Reply with your biggest question", priority: "MEDIUM" },
  { week: 12, pillar: "How-To", title: "How to Keep Soccer Training Fun at Home", leadMagnet: "10 Game-Based Drills download", priority: "HIGH" },
  { week: 13, pillar: "Mindset", title: "How to Talk to Your Child After a Bad Game", leadMagnet: "Post-Game Conversation Scripts", priority: "HIGH" },
  { week: 14, pillar: "Skills", title: "What 8-Year-Olds Should Focus on in Soccer Training", leadMagnet: "U8-U10 Development Plan", priority: "MEDIUM" },
  { week: 15, pillar: "Stories", title: "The Dad Who Never Played Soccer (But Trained His Son to the Academy)", leadMagnet: "7-Day Plan CTA", priority: "HIGH" },
  { week: 16, pillar: "Education", title: "The Science Behind Skill Development in Young Athletes", leadMagnet: "Free eBook: Science of Soccer Development", priority: "MEDIUM" },
  { week: 17, pillar: "How-To", title: "How to Set Up a Mini Soccer Field in Your Backyard or Basement", leadMagnet: "Backyard Setup Guide + Equipment Checklist", priority: "HIGH" },
  { week: 18, pillar: "Mindset", title: "Building Mental Toughness in Young Soccer Players", leadMagnet: "Mental Toughness Training Plan", priority: "MEDIUM" },
  { week: 19, pillar: "Skills", title: "Soccer Training for 5-Year-Olds: What's Appropriate?", leadMagnet: "5-Year-Old Training Starter Pack", priority: "HIGH" },
  { week: 20, pillar: "Stories", title: "Parent Q&A: Your Most Common Youth Soccer Questions Answered", leadMagnet: "Link to Facebook Groups", priority: "MEDIUM" },
  { week: 21, pillar: "Education", title: "The Real Cost of Youth Soccer: A Parent's Breakdown", leadMagnet: "Youth Soccer Budget Template", priority: "MEDIUM" },
  { week: 22, pillar: "How-To", title: "Summer Soccer Training Plan for Kids at Home", leadMagnet: "Summer Training Calendar", priority: "SEASONAL" },
  { week: 23, pillar: "Mindset", title: "Balancing School Life and Soccer: A Parent's Blueprint", leadMagnet: "Weekly Schedule Template", priority: "SEASONAL" },
  { week: 24, pillar: "Skills", title: "Preparing for Tryouts: Home Prep Tips That Work", leadMagnet: "Tryout Prep Checklist", priority: "SEASONAL" },
  { week: 25, pillar: "Stories", title: "Before and After: A Year of Home Training Results", leadMagnet: "App/Subscription Pitch", priority: "HIGH" },
  { week: 26, pillar: "Education", title: "Understanding Soccer Player Development Stages", leadMagnet: "Player Development Roadmap", priority: "MEDIUM" },
  { week: 27, pillar: "How-To", title: "Ball Mastery Training: The Foundation of Everything", leadMagnet: "Ball Mastery Video Library", priority: "PILLAR" },
  { week: 28, pillar: "Mindset", title: "The Complete Guide to Supporting Your Young Soccer Player", leadMagnet: "Complete Soccer Parent Handbook", priority: "PILLAR" },
  { week: 29, pillar: "Skills", title: "Age-Based Training: What Changes from U6 to U12", leadMagnet: "Age-Based Training Templates", priority: "HIGH" },
  { week: 30, pillar: "Stories", title: "The Parent Trainer's Journey: How We Got Here", leadMagnet: "Your personal origin story", priority: "MEDIUM" },
  { week: 31, pillar: "Education", title: "What Age Should My Child Start Soccer Training?", leadMagnet: "Age-Readiness Assessment", priority: "HIGH" },
  { week: 32, pillar: "How-To", title: "10 In-Home Soccer Drills to Keep Your Child Active", leadMagnet: "10 Drill Video Demonstrations", priority: "HIGH" },
  { week: 33, pillar: "Mindset", title: "How to Build Soccer Confidence Through Repetition", leadMagnet: "Confidence Building Drills", priority: "MEDIUM" },
  { week: 34, pillar: "Skills", title: "First Touch Training: Drills That Work", leadMagnet: "First Touch Video Series", priority: "HIGH" },
  { week: 35, pillar: "Stories", title: "Before and After: 6 Months of Daily Training", leadMagnet: "6-Month Training Plan", priority: "MEDIUM" },
  { week: 36, pillar: "Education", title: "The Hidden Cost of Not Training at Home", leadMagnet: "Cost-Benefit Calculator", priority: "MEDIUM" },
  { week: 37, pillar: "How-To", title: "The Day My Son Asked If We Could Train Instead of Watch TV", leadMagnet: "Training Motivation Guide", priority: "MEDIUM" },
  { week: 38, pillar: "Mindset", title: "The Mistake I Made That Killed My Son's Motivation", leadMagnet: "Pressure vs Support Guide", priority: "HIGH" },
  { week: 39, pillar: "Skills", title: "How My 7-Year-Old Finally Learned to Dribble", leadMagnet: "Dribbling Progression Plan", priority: "MEDIUM" },
  { week: 40, pillar: "Stories", title: "From the Bench to Starting Lineup in 8 Weeks", leadMagnet: "8-Week Intensive Plan", priority: "HIGH" },
  { week: 41, pillar: "Education", title: "Club Soccer vs Rec Soccer: Which Is Right for Your Child?", leadMagnet: "Club vs Rec Decision Guide", priority: "HIGH" },
  { week: 42, pillar: "How-To", title: "The Best Home Training Equipment for Youth Soccer Players", leadMagnet: "Essential Equipment Checklist", priority: "HIGH" },
  { week: 43, pillar: "Mindset", title: "Signs Your Child May Be Losing Interest in Soccer (and What to Do)", leadMagnet: "Interest Assessment Quiz", priority: "MEDIUM" },
  { week: 44, pillar: "Skills", title: "High School Soccer Prep: What to Do in Middle School", leadMagnet: "Middle School to High School Roadmap", priority: "MEDIUM" },
  { week: 45, pillar: "Stories", title: "Case Study: How Daily Training Changed Everything", leadMagnet: "Daily Training Template", priority: "HIGH" },
  { week: 46, pillar: "Education", title: "Back-to-School Soccer Routine", leadMagnet: "Back-to-School Schedule Template", priority: "SEASONAL" },
  { week: 47, pillar: "How-To", title: "Winter Indoor Soccer Drills to Keep Your Child Moving", leadMagnet: "Indoor Training Guide", priority: "SEASONAL" },
  { week: 48, pillar: "Mindset", title: "What to Do When Your Child Doesn't Get Playing Time", leadMagnet: "Playing Time Action Plan", priority: "MEDIUM" },
  { week: 49, pillar: "Skills", title: "Pre-Tryout Training: 4-Week Plan", leadMagnet: "Tryout Countdown Plan", priority: "SEASONAL" },
  { week: 50, pillar: "Stories", title: "End-of-Season Success Stories", leadMagnet: "Season Reflection Template", priority: "SEASONAL" },
  { week: 51, pillar: "Education", title: "What Makes a Good Youth Soccer Coach?", leadMagnet: "Coach Evaluation Checklist", priority: "MEDIUM" },
  { week: 52, pillar: "How-To", title: "Cone Drills Every Kid Should Know", leadMagnet: "Cone Drill Library", priority: "HIGH" },
  { week: 53, pillar: "Mindset", title: "How to Handle Sibling Rivalry in Sports", leadMagnet: "Sibling Sports Management Guide", priority: "LOW" },
  { week: 54, pillar: "Skills", title: "Training for Speed and Agility at Home", leadMagnet: "Speed & Agility Plan", priority: "MEDIUM" },
  { week: 55, pillar: "Stories", title: "The Quiet Kid Who Became Team Captain", leadMagnet: "Leadership Development Plan", priority: "MEDIUM" },
  { week: 56, pillar: "Education", title: "Understanding Soccer Positions: A Parent's Guide", leadMagnet: "Position Guide for Parents", priority: "MEDIUM" },
  { week: 57, pillar: "How-To", title: "How to Improve Your Child's Weak Foot", leadMagnet: "Weak Foot Training Plan", priority: "HIGH" },
  { week: 58, pillar: "Mindset", title: "Teaching Resilience Through Soccer", leadMagnet: "Resilience Building Activities", priority: "MEDIUM" },
  { week: 59, pillar: "Skills", title: "Juggling Progression for Beginners", leadMagnet: "Juggling Challenge Tracker", priority: "MEDIUM" },
  { week: 60, pillar: "Stories", title: "How We Made Soccer Fun Again", leadMagnet: "Fun Factor Assessment", priority: "MEDIUM" },
  { week: 61, pillar: "Education", title: "The Truth About Early Specialization in Soccer", leadMagnet: "Specialization Decision Guide", priority: "MEDIUM" },
  { week: 62, pillar: "How-To", title: "Wall Ball Training: The Ultimate Practice Partner", leadMagnet: "Wall Ball Workout Plan", priority: "HIGH" },
  { week: 63, pillar: "Mindset", title: "Managing Soccer Parent Stress", leadMagnet: "Parent Self-Care Checklist", priority: "LOW" },
  { week: 64, pillar: "Skills", title: "Shooting Technique for Young Players", leadMagnet: "Shooting Progression Guide", priority: "HIGH" },
  { week: 65, pillar: "Stories", title: "The Comeback Story: Injury to Stronger Than Ever", leadMagnet: "Injury Recovery Roadmap", priority: "MEDIUM" },
  { week: 66, pillar: "Education", title: "Youth Soccer Nutrition Basics for Parents", leadMagnet: "Youth Athlete Nutrition Guide", priority: "MEDIUM" },
  { week: 67, pillar: "How-To", title: "Small Space Training Solutions", leadMagnet: "Space Optimization Guide", priority: "MEDIUM" },
  { week: 68, pillar: "Mindset", title: "When to Push and When to Pull Back", leadMagnet: "Parent Pressure Assessment", priority: "HIGH" },
  { week: 69, pillar: "Skills", title: "Defensive Skills Training at Home", leadMagnet: "Defensive Drills Library", priority: "MEDIUM" },
  { week: 70, pillar: "Stories", title: "Multiple Kids Multiple Sports: How We Manage It All", leadMagnet: "Multi-Child Schedule Template", priority: "LOW" },
  { week: 71, pillar: "Education", title: "How Soccer Can Teach Life Skills", leadMagnet: "Life Skills Tracker", priority: "LOW" },
  { week: 72, pillar: "How-To", title: "Finishing Drills for the Backyard", leadMagnet: "Finishing Circuit Plan", priority: "MEDIUM" },
  { week: 73, pillar: "Mindset", title: "Dealing with Coaching Conflicts", leadMagnet: "Coach Communication Scripts", priority: "MEDIUM" },
  { week: 74, pillar: "Skills", title: "1v1 Training at Home", leadMagnet: "1v1 Moves Library", priority: "HIGH" },
  { week: 75, pillar: "Stories", title: "The Scholarship Story: How Home Training Helped", leadMagnet: "Scholarship Prep Timeline", priority: "MEDIUM" },
  { week: 76, pillar: "Education", title: "The Science Behind Skill Development in Young Athletes", leadMagnet: "Skill Development Science Guide", priority: "MEDIUM" },
  { week: 77, pillar: "How-To", title: "Building a Home Training System That Works", leadMagnet: "Home Training System Blueprint", priority: "PILLAR" },
  { week: 78, pillar: "Mindset", title: "Training Without Pressure: The Missing Piece in Youth Development", leadMagnet: "Pressure-Free Training Guide", priority: "HIGH" },
  { week: 79, pillar: "Skills", title: "How to Develop Soccer Vision at Home", leadMagnet: "Soccer IQ Training Program", priority: "MEDIUM" },
  { week: 80, pillar: "Stories", title: "The Overlooked Benefits of Parent-Led Soccer Training", leadMagnet: "Parent-Led Training Manifesto", priority: "HIGH" },
  { week: 81, pillar: "Education", title: "The Difference Between Recreational and Competitive Soccer Explained", leadMagnet: "Rec vs Competitive Comparison", priority: "HIGH" },
  { week: 82, pillar: "How-To", title: "The 7-Day Soccer Training Plan (What to Do Each Day)", leadMagnet: "7-Day Ball Mastery Plan", priority: "PILLAR" },
  { week: 83, pillar: "Mindset", title: "How to Celebrate Effort Not Just Results", leadMagnet: "Effort Celebration Ideas", priority: "MEDIUM" },
  { week: 84, pillar: "Skills", title: "Improving Weak Foot Training at Home", leadMagnet: "Weak Foot Development Plan", priority: "HIGH" },
  { week: 85, pillar: "Stories", title: "The Simple Change That Made All the Difference", leadMagnet: "Simple Change Implementation", priority: "MEDIUM" },
  { week: 86, pillar: "Education", title: "What I Wish I'd Known Before My Son Started Club Soccer", leadMagnet: "Club Soccer Parent Prep Guide", priority: "MEDIUM" },
  { week: 87, pillar: "How-To", title: "How 15 Minutes a Day Changed Everything for Us", leadMagnet: "15-Minute Habit Builder", priority: "HIGH" },
  { week: 88, pillar: "Mindset", title: "How I Learned to Stop Being That Soccer Parent", leadMagnet: "Sideline Behavior Self-Assessment", priority: "MEDIUM" },
  { week: 89, pillar: "Skills", title: "The Skill That Made the Biggest Difference for My Son", leadMagnet: "Priority Skills Assessment", priority: "MEDIUM" },
  { week: 90, pillar: "Stories", title: "The Garage That Became a Training Hub", leadMagnet: "Space Optimization Guide", priority: "MEDIUM" },
  { week: 91, pillar: "Education", title: "Is Your Child Getting Enough Touches? The 10,000-Hour Truth", leadMagnet: "Touch Counter Tracker", priority: "MEDIUM" },
  { week: 92, pillar: "How-To", title: "How to Track Your Child's Soccer Progress at Home", leadMagnet: "Progress Tracking System", priority: "HIGH" },
  { week: 93, pillar: "Mindset", title: "Balancing School Life and Soccer: A Parent's Blueprint", leadMagnet: "Weekly Schedule Template", priority: "HIGH" },
  { week: 94, pillar: "Skills", title: "Best Practices for Training U10-U12 at Home", leadMagnet: "U10-U12 Training Curriculum", priority: "HIGH" },
  { week: 95, pillar: "Stories", title: "Testimonials: Why Parents Choose Home Training", leadMagnet: "Full Testimonial Collection", priority: "HIGH" },
  { week: 96, pillar: "Education", title: "Off-Season Training: Don't Let Skills Slip", leadMagnet: "Off-Season Maintenance Plan", priority: "SEASONAL" },
  { week: 97, pillar: "How-To", title: "Holiday Soccer Training: Keeping Kids Active", leadMagnet: "Holiday Training Calendar", priority: "SEASONAL" },
  { week: 98, pillar: "Mindset", title: "Post-Season Reset: Reconnecting with Your Child", leadMagnet: "Post-Season Connection Activities", priority: "SEASONAL" },
  { week: 99, pillar: "Skills", title: "What to Work On During the Off-Season by Age", leadMagnet: "Off-Season Focus by Age", priority: "SEASONAL" },
  { week: 100, pillar: "Stories", title: "New Year New Results: Parent Success Roundup", leadMagnet: "New Year Success Stories", priority: "SEASONAL" },
  { week: 101, pillar: "Education", title: "Why Some Kids Improve Faster Than Others", leadMagnet: "Individual Development Assessment", priority: "MEDIUM" },
  { week: 102, pillar: "How-To", title: "The Only 5 Drills Your Child Needs to Master", leadMagnet: "Essential 5 Drill System", priority: "PILLAR" },
  { week: 103, pillar: "Mindset", title: "Building Mental Toughness in Young Soccer Players", leadMagnet: "Mental Toughness Curriculum", priority: "HIGH" },
  { week: 104, pillar: "Skills", title: "Top 10 Skills Every Young Soccer Player Should Master", leadMagnet: "10 Skills Mastery Path", priority: "PILLAR" },
  { week: 105, pillar: "Stories", title: "When Home Training Pays Off: A Parent's Reflection", leadMagnet: "Long-Term Success Indicators", priority: "MEDIUM" },
  { week: 106, pillar: "Education", title: "Youth Soccer Myths Debunked: What Actually Matters", leadMagnet: "Myth vs Reality Guide", priority: "MEDIUM" },
  { week: 107, pillar: "How-To", title: "How to Improve Your Child's First Touch at Home", leadMagnet: "First Touch Quick Wins", priority: "HIGH" },
  { week: 108, pillar: "Mindset", title: "How to Talk to Your Child After a Bad Game", leadMagnet: "Post-Game Scripts", priority: "HIGH" },
  { week: 109, pillar: "Skills", title: "How to Teach Passing at Home", leadMagnet: "Passing Progression Guide", priority: "HIGH" },
  { week: 110, pillar: "Stories", title: "Real Results: 90 Days of Consistency", leadMagnet: "90-Day Challenge Results", priority: "HIGH" },
  { week: 111, pillar: "Education", title: "The Day I Realized Team Practice Wasn't Enough", leadMagnet: "Practice Gap Calculator", priority: "MEDIUM" },
  { week: 112, pillar: "How-To", title: "What a Good Home Training Session Actually Looks Like", leadMagnet: "Session Template Examples", priority: "HIGH" },
  { week: 113, pillar: "Mindset", title: "What My Son Taught Me About Resilience", leadMagnet: "Resilience Lessons Reflection", priority: "MEDIUM" },
  { week: 114, pillar: "Skills", title: "Training 6-Year-Olds vs Training 10-Year-Olds: What I Learned", leadMagnet: "Age Comparison Guide", priority: "MEDIUM" },
  { week: 115, pillar: "Stories", title: "How One Family Trained Through Every Season", leadMagnet: "Year-Round Training Story", priority: "MEDIUM" },
  { week: 116, pillar: "Education", title: "How Many Days a Week Should My Child Practice Soccer?", leadMagnet: "Weekly Practice Planner", priority: "HIGH" },
  { week: 117, pillar: "How-To", title: "Dribbling Passing Shooting: Weekly Drill Plan for Parents", leadMagnet: "4-Week Progressive Drill Plan", priority: "HIGH" },
  { week: 118, pillar: "Mindset", title: "How Visualization Can Improve Your Child's Soccer Game", leadMagnet: "Visualization Script Library", priority: "MEDIUM" },
  { week: 119, pillar: "Skills", title: "1v1 Moves Every Kid Should Know", leadMagnet: "1v1 Moves Video Library", priority: "HIGH" },
  { week: 120, pillar: "Stories", title: "How One Family Trained Through Every Season", leadMagnet: "Year-Round Training Calendar", priority: "MEDIUM" },
  { week: 121, pillar: "Education", title: "Pre-Season Training at Home", leadMagnet: "Pre-Season Prep Checklist", priority: "SEASONAL" },
  { week: 122, pillar: "How-To", title: "Soccer Training While Traveling", leadMagnet: "Travel Training Guide", priority: "MEDIUM" },
  { week: 123, pillar: "Mindset", title: "Navigating Club Changes: When and How to Switch", leadMagnet: "Club Change Decision Tree", priority: "MEDIUM" },
  { week: 124, pillar: "Skills", title: "Age-Specific Holiday Training Ideas", leadMagnet: "Holiday Training by Age", priority: "SEASONAL" },
  { week: 125, pillar: "Stories", title: "Summer Transformation Stories", leadMagnet: "Summer Success Roundup", priority: "SEASONAL" },
];

const PRIORITY_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  PILLAR:   { bg: "#0F3154", color: "#fff",     label: "Pillar" },
  HIGH:     { bg: "#FEE2E2", color: "#B91C1C",  label: "High" },
  MEDIUM:   { bg: "#FEF3C7", color: "#92400E",  label: "Medium" },
  LOW:      { bg: "#F1F5F9", color: "#64748b",  label: "Low" },
  SEASONAL: { bg: "#D1FAE5", color: "#065F46",  label: "Seasonal" },
};

const PILLAR_COLOR: Record<string, string> = {
  Education: "#0891b2",
  "How-To":  "#7c3aed",
  Mindset:   "#d97706",
  Skills:    "#16a34a",
  Stories:   "#ea580c",
};

const ALL_PILLARS = ["Education", "How-To", "Mindset", "Skills", "Stories"];

export function BlogCalendar() {
  const [links, setLinks] = useState<Record<number, string>>({});
  const [filterPillar, setFilterPillar] = useState<string>("All");
  const [filterPriority, setFilterPriority] = useState<string>("All");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("focus_blog_links");
      if (saved) setLinks(JSON.parse(saved));
    } catch {}
  }, []);

  const saveLink = (week: number, url: string) => {
    const next = { ...links, [week]: url };
    setLinks(next);
    try { localStorage.setItem("focus_blog_links", JSON.stringify(next)); } catch {}
  };

  const published = Object.values(links).filter(v => v.trim()).length;

  const visible = POSTS.filter(p => {
    if (filterPillar !== "All" && p.pillar !== filterPillar) return false;
    if (filterPriority !== "All" && p.priority !== filterPriority) return false;
    return true;
  });

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#0F3154", fontFamily: "var(--font-display,'Outfit',sans-serif)" }}>Blog Content Calendar</div>
          <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>
            <span style={{ color: "#16a34a", fontWeight: 700 }}>{published}</span> published · {POSTS.length} total posts
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Pillar:</span>
        {["All", ...ALL_PILLARS].map(p => (
          <button key={p} onClick={() => setFilterPillar(p)} style={{
            fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, border: "none", cursor: "pointer",
            background: filterPillar === p ? "#0F3154" : "#F1F5F9",
            color: filterPillar === p ? "#fff" : "#64748b",
            fontFamily: "inherit",
          }}>{p}</button>
        ))}
        <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginLeft: 8 }}>Priority:</span>
        {["All", "PILLAR", "HIGH", "MEDIUM", "SEASONAL", "LOW"].map(p => {
          const s = PRIORITY_STYLE[p];
          return (
            <button key={p} onClick={() => setFilterPriority(p)} style={{
              fontSize: 11, fontWeight: 700, padding: "4px 11px", borderRadius: 20, border: "none", cursor: "pointer",
              background: filterPriority === p ? (s?.bg ?? "#0F3154") : "#F1F5F9",
              color: filterPriority === p ? (s?.color ?? "#fff") : "#64748b",
              fontFamily: "inherit",
              outline: filterPriority === p ? `2px solid ${s?.color ?? "#0F3154"}` : "none",
            }}>{p === "All" ? "All" : (s?.label ?? p)}</button>
          );
        })}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E1E8EF", boxShadow: "0 2px 8px rgba(15,49,84,0.05)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid #E1E8EF", whiteSpace: "nowrap", width: 48 }}>#</th>
                <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid #E1E8EF", whiteSpace: "nowrap", width: 90 }}>Pillar</th>
                <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid #E1E8EF" }}>Blog Post Title</th>
                <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid #E1E8EF", whiteSpace: "nowrap", width: 72 }}>Priority</th>
                <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid #E1E8EF", width: 240 }}>Post Link</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((post, i) => {
                const ps = PRIORITY_STYLE[post.priority] ?? PRIORITY_STYLE.MEDIUM;
                const pc = PILLAR_COLOR[post.pillar] ?? "#94a3b8";
                const link = links[post.week] ?? "";
                const isPublished = link.trim().length > 0;
                return (
                  <tr key={post.week} style={{
                    borderTop: i === 0 ? "none" : "1px solid #F1F5F9",
                    background: isPublished ? "#F0FDF4" : "white",
                  }}>
                    {/* Week # */}
                    <td style={{ padding: "10px 14px", verticalAlign: "middle" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8" }}>{post.week}</span>
                    </td>
                    {/* Pillar */}
                    <td style={{ padding: "10px 14px", verticalAlign: "middle" }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: pc,
                        background: pc + "18", padding: "3px 8px", borderRadius: 10,
                        whiteSpace: "nowrap",
                      }}>{post.pillar}</span>
                    </td>
                    {/* Title */}
                    <td style={{ padding: "10px 14px", verticalAlign: "middle" }}>
                      <div style={{ fontSize: 13, color: "#0F3154", fontWeight: 600, lineHeight: 1.4 }}>
                        {isPublished ? (
                          <a href={link} target="_blank" rel="noopener noreferrer"
                            style={{ color: "#0F3154", textDecoration: "none" }}
                            onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                            onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
                          >{post.title} ↗</a>
                        ) : post.title}
                      </div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{post.leadMagnet}</div>
                    </td>
                    {/* Priority */}
                    <td style={{ padding: "10px 14px", verticalAlign: "middle" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, background: ps.bg, color: ps.color, padding: "3px 8px", borderRadius: 10, whiteSpace: "nowrap" }}>
                        {ps.label}
                      </span>
                    </td>
                    {/* Link input */}
                    <td style={{ padding: "8px 14px", verticalAlign: "middle" }}>
                      <input
                        type="url"
                        value={link}
                        onChange={e => saveLink(post.week, e.target.value)}
                        placeholder="Paste URL when published…"
                        style={{
                          width: "100%", border: `1px solid ${isPublished ? "#86EFAC" : "#E1E8EF"}`,
                          borderRadius: 7, padding: "6px 10px", fontSize: 12,
                          fontFamily: "inherit", color: "#0F3154", outline: "none",
                          background: isPublished ? "#F0FDF4" : "#fff",
                          boxSizing: "border-box",
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", marginTop: 14 }}>
        {visible.length} of {POSTS.length} posts shown · Links auto-save to your browser
      </div>
    </div>
  );
}
