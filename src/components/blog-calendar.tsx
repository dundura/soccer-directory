"use client";

import { useState, useEffect } from "react";

interface Post {
  id: number;
  category: string;
  title: string;
  keyTopics: string;
  priority: string;
}

const POSTS: Post[] = [
  { id: 1,  category: "Ball Mastery",   title: "10 Ball Mastery Drills Your Child Can Do in 10 Minutes",                       keyTopics: "Toe taps, rolls, foundations, inside-outside touches, daily routine",                    priority: "High" },
  { id: 2,  category: "Ball Mastery",   title: "Why Ball Mastery Is the Foundation of Every Great Player",                     keyTopics: "Close control, confidence on ball, muscle memory, 1000 touch concept",                   priority: "High" },
  { id: 3,  category: "Ball Mastery",   title: "The 5-Minute Ball Mastery Warm-Up Every Player Should Use",                    keyTopics: "Pre-practice routine, dynamic touches, activation exercises",                             priority: "Medium" },
  { id: 4,  category: "Dribbling",      title: "How to Teach Your Child to Dribble with Every Step",                          keyTopics: "Touch frequency, speed control, acceleration/deceleration, game transfer",                priority: "High" },
  { id: 5,  category: "Dribbling",      title: "5 Dribbling Moves Every Young Player Should Master First",                    keyTopics: "Inside cut, outside cut, pull-back, step-over, scissors",                                priority: "High" },
  { id: 6,  category: "Dribbling",      title: "Cone Drills vs. Game Situations: How to Train Dribbling That Actually Works", keyTopics: "Opposed vs unopposed, decision making, pressure training",                               priority: "Medium" },
  { id: 7,  category: "First Touch",    title: "The Secret to a Killer First Touch (And How to Train It at Home)",            keyTopics: "Cushioning, body positioning, receiving on back foot, rebounder drills",                  priority: "High" },
  { id: 8,  category: "First Touch",    title: "Why Your Child's First Touch Is Holding Them Back",                           keyTopics: "Common mistakes, heavy touches, awareness before receiving",                             priority: "Medium" },
  { id: 9,  category: "First Touch",    title: "3 First Touch Drills You Can Do Against Any Wall",                            keyTopics: "Wall passing, one-touch control, directional first touch",                               priority: "Medium" },
  { id: 10, category: "Finishing",      title: "How to Improve Your Child's Shooting Accuracy at Home",                       keyTopics: "Technique breakdown, target practice, placement vs power",                               priority: "High" },
  { id: 11, category: "Finishing",      title: "The Finishing Drill That Helped My Son Score More Goals",                     keyTopics: "Repetition, game-like scenarios, confidence building",                                   priority: "Medium" },
  { id: 12, category: "Finishing",      title: "Weak Foot Training: How to Make Both Feet Dangerous",                         keyTopics: "Non-dominant foot drills, progressive difficulty, daily practice",                        priority: "High" },
  { id: 13, category: "Passing",        title: "Teaching Passing Accuracy: Drills for Parent and Child",                      keyTopics: "Weight of pass, inside foot technique, target focus",                                    priority: "Medium" },
  { id: 14, category: "Passing",        title: "How to Practice Passing When You're Training Alone",                          keyTopics: "Wall work, rebounder, target passing, self-serve drills",                                priority: "Medium" },
  { id: 15, category: "Aerial Control", title: "The Complete Guide to Teaching Your Child to Juggle",                         keyTopics: "Progression system, thigh-foot combo, goal setting, perimeter training",                  priority: "High" },
  { id: 16, category: "Aerial Control", title: "Beyond Juggling: Aerial Control Drills That Transfer to Games",               keyTopics: "Chest control, thigh traps, headers, game scenarios",                                    priority: "Medium" },
  { id: 17, category: "Speed & Agility", title: "Soccer-Specific Speed Training for Youth Players",                           keyTopics: "Acceleration, change of direction, agility ladder, cone work",                            priority: "Medium" },
  { id: 18, category: "Speed & Agility", title: "Quick Feet Drills That Actually Improve Game Speed",                         keyTopics: "Ladder patterns, reaction training, explosive movements",                                priority: "Medium" },
  { id: 19, category: "Mental Game",    title: "How to Build Your Child's Confidence Before Game Day",                        keyTopics: "Pre-game routine, visualization, positive self-talk, preparation",                        priority: "Medium" },
  { id: 20, category: "Mental Game",    title: "Teaching Soccer IQ: How to Help Your Child Read the Game",                    keyTopics: "Awareness, positioning, anticipation, watching film",                                    priority: "Low" },
];

const PRIORITY_STYLE: Record<string, { bg: string; color: string }> = {
  High:   { bg: "#FEE2E2", color: "#B91C1C" },
  Medium: { bg: "#FEF3C7", color: "#92400E" },
  Low:    { bg: "#F1F5F9", color: "#64748b" },
};

const CATEGORY_COLOR: Record<string, string> = {
  "Ball Mastery":   "#0891b2",
  "Dribbling":      "#7c3aed",
  "First Touch":    "#d97706",
  "Finishing":      "#DC373E",
  "Passing":        "#16a34a",
  "Aerial Control": "#ea580c",
  "Speed & Agility":"#0F3154",
  "Mental Game":    "#be185d",
};

const ALL_CATEGORIES = ["Ball Mastery", "Dribbling", "First Touch", "Finishing", "Passing", "Aerial Control", "Speed & Agility", "Mental Game"];
const INITIALLY_DONE = new Set([1, 2]);

export function BlogCalendar() {
  const [links, setLinks]   = useState<Record<number, string>>({});
  const [done, setDone]     = useState<Record<number, boolean>>(() => {
    const init: Record<number, boolean> = {};
    INITIALLY_DONE.forEach(id => { init[id] = true; });
    return init;
  });
  const [filterCat, setFilterCat]       = useState<string>("All");
  const [filterPriority, setFilterPriority] = useState<string>("All");

  useEffect(() => {
    try {
      const savedLinks = localStorage.getItem("focus_blog_links_v2");
      if (savedLinks) setLinks(JSON.parse(savedLinks));
      const savedDone = localStorage.getItem("focus_blog_done");
      if (savedDone) {
        setDone(prev => ({ ...prev, ...JSON.parse(savedDone) }));
      }
    } catch {}
  }, []);

  const saveLink = (id: number, url: string) => {
    const next = { ...links, [id]: url };
    setLinks(next);
    try { localStorage.setItem("focus_blog_links_v2", JSON.stringify(next)); } catch {}
  };

  const toggleDone = (id: number) => {
    const next = { ...done, [id]: !done[id] };
    setDone(next);
    try { localStorage.setItem("focus_blog_done", JSON.stringify(next)); } catch {}
  };

  const doneCount = Object.values(done).filter(Boolean).length;

  const visible = POSTS.filter(p => {
    if (filterCat !== "All" && p.category !== filterCat) return false;
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
            <span style={{ color: "#16a34a", fontWeight: 700 }}>{doneCount}</span> published · {POSTS.length} total posts
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Category:</span>
        {["All", ...ALL_CATEGORIES].map(c => (
          <button key={c} onClick={() => setFilterCat(c)} style={{
            fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, border: "none", cursor: "pointer",
            background: filterCat === c ? "#0F3154" : "#F1F5F9",
            color: filterCat === c ? "#fff" : "#64748b",
            fontFamily: "inherit",
          }}>{c}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Priority:</span>
        {["All", "High", "Medium", "Low"].map(p => {
          const s = PRIORITY_STYLE[p];
          return (
            <button key={p} onClick={() => setFilterPriority(p)} style={{
              fontSize: 11, fontWeight: 700, padding: "4px 11px", borderRadius: 20, border: "none", cursor: "pointer",
              background: filterPriority === p ? (s?.bg ?? "#0F3154") : "#F1F5F9",
              color: filterPriority === p ? (s?.color ?? "#fff") : "#64748b",
              fontFamily: "inherit",
              outline: filterPriority === p && s ? `2px solid ${s.color}` : "none",
            }}>{p}</button>
          );
        })}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E1E8EF", boxShadow: "0 2px 8px rgba(15,49,84,0.05)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                <th style={{ padding: "10px 14px", textAlign: "center", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid #E1E8EF", width: 40 }}>✓</th>
                <th style={{ padding: "10px 14px", textAlign: "left",   fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid #E1E8EF", width: 32 }}>#</th>
                <th style={{ padding: "10px 14px", textAlign: "left",   fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid #E1E8EF", width: 110 }}>Category</th>
                <th style={{ padding: "10px 14px", textAlign: "left",   fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid #E1E8EF" }}>Blog Post Title</th>
                <th style={{ padding: "10px 14px", textAlign: "left",   fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid #E1E8EF", width: 68 }}>Priority</th>
                <th style={{ padding: "10px 14px", textAlign: "left",   fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid #E1E8EF", width: 230 }}>Post Link</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((post, i) => {
                const ps = PRIORITY_STYLE[post.priority] ?? PRIORITY_STYLE.Medium;
                const cc = CATEGORY_COLOR[post.category] ?? "#94a3b8";
                const link = links[post.id] ?? "";
                const isDone = !!done[post.id];
                return (
                  <tr key={post.id} style={{
                    borderTop: i === 0 ? "none" : "1px solid #F1F5F9",
                    background: isDone ? "#F0FDF4" : "white",
                    transition: "background 0.15s",
                  }}>
                    {/* Done checkbox */}
                    <td style={{ padding: "10px 14px", verticalAlign: "middle", textAlign: "center" }}>
                      <button
                        onClick={() => toggleDone(post.id)}
                        title={isDone ? "Mark as not published" : "Mark as published"}
                        style={{
                          width: 22, height: 22, borderRadius: 6,
                          border: `2px solid ${isDone ? "#16a34a" : "#CBD5E1"}`,
                          background: isDone ? "#16a34a" : "white",
                          cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center",
                          fontSize: 13, color: "white", lineHeight: 1, padding: 0,
                        }}
                      >
                        {isDone ? "✓" : ""}
                      </button>
                    </td>
                    {/* # */}
                    <td style={{ padding: "10px 14px", verticalAlign: "middle" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8" }}>{post.id}</span>
                    </td>
                    {/* Category */}
                    <td style={{ padding: "10px 14px", verticalAlign: "middle" }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: cc,
                        background: cc + "18", padding: "3px 8px", borderRadius: 10,
                        whiteSpace: "nowrap",
                      }}>{post.category}</span>
                    </td>
                    {/* Title + key topics */}
                    <td style={{ padding: "10px 14px", verticalAlign: "middle" }}>
                      <div style={{ fontSize: 13, color: "#0F3154", fontWeight: 600, lineHeight: 1.4,
                        textDecoration: isDone ? "none" : "none",
                      }}>
                        {isDone && link.trim() ? (
                          <a href={link} target="_blank" rel="noopener noreferrer"
                            style={{ color: "#0F3154", textDecoration: "none" }}
                            onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                            onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
                          >{post.title} ↗</a>
                        ) : post.title}
                      </div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{post.keyTopics}</div>
                    </td>
                    {/* Priority */}
                    <td style={{ padding: "10px 14px", verticalAlign: "middle" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, background: ps.bg, color: ps.color, padding: "3px 8px", borderRadius: 10, whiteSpace: "nowrap" }}>
                        {post.priority}
                      </span>
                    </td>
                    {/* Link input */}
                    <td style={{ padding: "8px 14px", verticalAlign: "middle" }}>
                      <input
                        type="url"
                        value={link}
                        onChange={e => saveLink(post.id, e.target.value)}
                        placeholder="Paste URL when published…"
                        style={{
                          width: "100%", border: `1px solid ${isDone && link ? "#86EFAC" : "#E1E8EF"}`,
                          borderRadius: 7, padding: "6px 10px", fontSize: 12,
                          fontFamily: "inherit", color: "#0F3154", outline: "none",
                          background: isDone ? "#F0FDF4" : "#fff",
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
        {visible.length} of {POSTS.length} posts shown · Checkmarks and links auto-save to your browser
      </div>
    </div>
  );
}
