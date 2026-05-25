"use client";

import { useState, useEffect } from "react";

interface Post {
  week: number;
  pillar: string;
  type: string;
  title: string;
  leadMagnet: string;
}

const POSTS: Post[] = [
  { week: 1,   pillar: "Education & Awareness",      type: "Deep Dive",        title: "Why In-Home Soccer Training Is the Future of Youth Development",                 leadMagnet: "Ultimate At-Home Training Guide" },
  { week: 2,   pillar: "Home Training How-To",        type: "Deep Dive",        title: "The Ultimate Guide to At-Home Soccer Training",                                   leadMagnet: "7-Day Ball Mastery Plan" },
  { week: 3,   pillar: "Parent Support & Mindset",    type: "Deep Dive",        title: "Soccer Training Without Burnout: A Parent's Guide",                              leadMagnet: "Burnout Prevention Checklist" },
  { week: 4,   pillar: "Age & Skill Development",     type: "Deep Dive",        title: "Soccer Development Milestones by Age",                                           leadMagnet: "Age-Appropriate Skills Checklist" },
  { week: 5,   pillar: "Stories & Social Proof",      type: "Deep Dive",        title: "From Backyard to Club Team: A Home Training Story",                              leadMagnet: "Link to 7-Day Plan" },
  { week: 6,   pillar: "Education & Awareness",       type: "Quick Win",        title: "How Much Soccer Training Does Your Child Really Need?",                          leadMagnet: "Weekly Training Template" },
  { week: 7,   pillar: "Home Training How-To",        type: "Quick Win",        title: "15-Minute Daily Soccer Routine for Kids Aged 6–12",                             leadMagnet: "30-Day Training Calendar" },
  { week: 8,   pillar: "Parent Support & Mindset",    type: "Quick Win",        title: "How to Motivate Your Child to Practice Soccer at Home",                         leadMagnet: "Motivation Toolkit" },
  { week: 9,   pillar: "Age & Skill Development",     type: "Quick Win",        title: "Top 10 Skills Every Young Soccer Player Should Master",                          leadMagnet: "Skill Mastery Checklist" },
  { week: 10,  pillar: "Stories & Social Proof",      type: "Quick Win",        title: "How My Child Improved with Just 3 Months of In-Home Training",                  leadMagnet: "Link to App/Subscription" },
  { week: 11,  pillar: "Education & Awareness",       type: "Story-Based",      title: "What Parents Get Wrong About Youth Soccer Development",                          leadMagnet: "Reply with your biggest question" },
  { week: 12,  pillar: "Home Training How-To",        type: "Story-Based",      title: "How to Keep Soccer Training Fun at Home",                                        leadMagnet: "10 Game-Based Drills download" },
  { week: 13,  pillar: "Parent Support & Mindset",    type: "Story-Based",      title: "How to Talk to Your Child After a Bad Game",                                     leadMagnet: "Post-Game Conversation Scripts" },
  { week: 14,  pillar: "Age & Skill Development",     type: "Story-Based",      title: "What 8-Year-Olds Should Focus on in Soccer Training",                            leadMagnet: "U8-U10 Development Plan" },
  { week: 15,  pillar: "Stories & Social Proof",      type: "Story-Based",      title: "The Dad Who Never Played Soccer (But Trained His Son to the Academy)",           leadMagnet: "7-Day Plan CTA" },
  { week: 16,  pillar: "Education & Awareness",       type: "Lead Magnet",      title: "The Science Behind Skill Development in Young Athletes",                         leadMagnet: "Free eBook: Science of Soccer Development" },
  { week: 17,  pillar: "Home Training How-To",        type: "Lead Magnet",      title: "How to Set Up a Mini Soccer Field in Your Backyard or Basement",                leadMagnet: "Backyard Setup Guide + Equipment Checklist" },
  { week: 18,  pillar: "Parent Support & Mindset",    type: "Lead Magnet",      title: "Building Mental Toughness in Young Soccer Players",                              leadMagnet: "Mental Toughness Training Plan" },
  { week: 19,  pillar: "Age & Skill Development",     type: "Lead Magnet",      title: "Soccer Training for 5-Year-Olds: What's Appropriate?",                          leadMagnet: "5-Year-Old Training Starter Pack" },
  { week: 20,  pillar: "Stories & Social Proof",      type: "Lead Magnet",      title: "Parent Q&A: Your Most Common Youth Soccer Questions Answered",                   leadMagnet: "Link to Facebook Groups" },
  { week: 21,  pillar: "Education & Awareness",       type: "Seasonal/Timely",  title: "The Real Cost of Youth Soccer: A Parent's Breakdown",                           leadMagnet: "Youth Soccer Budget Template" },
  { week: 22,  pillar: "Home Training How-To",        type: "Seasonal/Timely",  title: "Summer Soccer Training Plan for Kids at Home",                                   leadMagnet: "Summer Training Calendar" },
  { week: 23,  pillar: "Parent Support & Mindset",    type: "Seasonal/Timely",  title: "Balancing School Life and Soccer: A Parent's Blueprint",                        leadMagnet: "Weekly Schedule Template" },
  { week: 24,  pillar: "Age & Skill Development",     type: "Seasonal/Timely",  title: "Preparing for Tryouts: Home Prep Tips That Work",                               leadMagnet: "Tryout Prep Checklist" },
  { week: 25,  pillar: "Stories & Social Proof",      type: "Seasonal/Timely",  title: "Before and After: A Year of Home Training Results",                             leadMagnet: "App/Subscription Pitch" },
  { week: 26,  pillar: "Education & Awareness",       type: "Deep Dive",        title: "Understanding Soccer Player Development Stages",                                  leadMagnet: "Player Development Roadmap" },
  { week: 27,  pillar: "Home Training How-To",        type: "Deep Dive",        title: "Ball Mastery Training: The Foundation of Everything",                            leadMagnet: "Ball Mastery Video Library" },
  { week: 28,  pillar: "Parent Support & Mindset",    type: "Deep Dive",        title: "The Complete Guide to Supporting Your Young Soccer Player",                      leadMagnet: "Complete Soccer Parent Handbook" },
  { week: 29,  pillar: "Age & Skill Development",     type: "Deep Dive",        title: "Age-Based Training: What Changes from U6 to U12",                               leadMagnet: "Age-Based Training Templates" },
  { week: 30,  pillar: "Stories & Social Proof",      type: "Deep Dive",        title: "The Parent Trainer's Journey: How We Got Here",                                 leadMagnet: "Your personal origin story" },
  { week: 31,  pillar: "Education & Awareness",       type: "Quick Win",        title: "What Age Should My Child Start Soccer Training?",                                leadMagnet: "Age-Readiness Assessment" },
  { week: 32,  pillar: "Home Training How-To",        type: "Quick Win",        title: "10 In-Home Soccer Drills to Keep Your Child Active",                            leadMagnet: "10 Drill Video Demonstrations" },
  { week: 33,  pillar: "Parent Support & Mindset",    type: "Quick Win",        title: "How to Build Soccer Confidence Through Repetition",                             leadMagnet: "Confidence Building Drills" },
  { week: 34,  pillar: "Age & Skill Development",     type: "Quick Win",        title: "First Touch Training: Drills That Work",                                         leadMagnet: "First Touch Video Series" },
  { week: 35,  pillar: "Stories & Social Proof",      type: "Quick Win",        title: "Before and After: 6 Months of Daily Training",                                  leadMagnet: "6-Month Training Plan" },
  { week: 36,  pillar: "Education & Awareness",       type: "Story-Based",      title: "The Hidden Cost of Not Training at Home",                                        leadMagnet: "Cost-Benefit Calculator" },
  { week: 37,  pillar: "Home Training How-To",        type: "Story-Based",      title: "The Day My Son Asked If We Could Train Instead of Watch TV",                    leadMagnet: "Training Motivation Guide" },
  { week: 38,  pillar: "Parent Support & Mindset",    type: "Story-Based",      title: "The Mistake I Made That Killed My Son's Motivation",                            leadMagnet: "Pressure vs Support Guide" },
  { week: 39,  pillar: "Age & Skill Development",     type: "Story-Based",      title: "How My 7-Year-Old Finally Learned to Dribble",                                  leadMagnet: "Dribbling Progression Plan" },
  { week: 40,  pillar: "Stories & Social Proof",      type: "Story-Based",      title: "From the Bench to Starting Lineup in 8 Weeks",                                  leadMagnet: "8-Week Intensive Plan" },
  { week: 41,  pillar: "Education & Awareness",       type: "Lead Magnet",      title: "Club Soccer vs Rec Soccer: Which Is Right for Your Child?",                     leadMagnet: "Club vs Rec Decision Guide" },
  { week: 42,  pillar: "Home Training How-To",        type: "Lead Magnet",      title: "The Best Home Training Equipment for Youth Soccer Players",                     leadMagnet: "Essential Equipment Checklist" },
  { week: 43,  pillar: "Parent Support & Mindset",    type: "Lead Magnet",      title: "Signs Your Child May Be Losing Interest in Soccer (and What to Do)",           leadMagnet: "Interest Assessment Quiz" },
  { week: 44,  pillar: "Age & Skill Development",     type: "Lead Magnet",      title: "High School Soccer Prep: What to Do in Middle School",                          leadMagnet: "Middle School to High School Roadmap" },
  { week: 45,  pillar: "Stories & Social Proof",      type: "Lead Magnet",      title: "Case Study: How Daily Training Changed Everything",                              leadMagnet: "Daily Training Template" },
  { week: 46,  pillar: "Education & Awareness",       type: "Seasonal/Timely",  title: "Back-to-School Soccer Routine",                                                  leadMagnet: "Back-to-School Schedule Template" },
  { week: 47,  pillar: "Home Training How-To",        type: "Seasonal/Timely",  title: "Winter Indoor Soccer Drills to Keep Your Child Moving",                         leadMagnet: "Indoor Training Guide" },
  { week: 48,  pillar: "Parent Support & Mindset",    type: "Seasonal/Timely",  title: "What to Do When Your Child Doesn't Get Playing Time",                          leadMagnet: "Playing Time Action Plan" },
  { week: 49,  pillar: "Age & Skill Development",     type: "Seasonal/Timely",  title: "Pre-Tryout Training: 4-Week Plan",                                               leadMagnet: "Tryout Countdown Plan" },
  { week: 50,  pillar: "Stories & Social Proof",      type: "Seasonal/Timely",  title: "End-of-Season Success Stories",                                                  leadMagnet: "Season Reflection Template" },
  { week: 51,  pillar: "Education & Awareness",       type: "Deep Dive",        title: "What the Research Says About Early Specialization in Soccer",                   leadMagnet: "Specialization Decision Framework" },
  { week: 52,  pillar: "Home Training How-To",        type: "Deep Dive",        title: "How to Structure a Weekly Home Training Plan",                                   leadMagnet: "Weekly Planning Template" },
  { week: 53,  pillar: "Parent Support & Mindset",    type: "Deep Dive",        title: "Growth Mindset in Youth Sports: A Parent's Role",                               leadMagnet: "Growth Mindset Parent Guide" },
  { week: 54,  pillar: "Age & Skill Development",     type: "Deep Dive",        title: "The Critical Ages for Soccer Skill Development",                                 leadMagnet: "Critical Period Training Guide" },
  { week: 55,  pillar: "Stories & Social Proof",      type: "Deep Dive",        title: "What Professional Players Did at Home as Kids",                                  leadMagnet: "Pro Player Home Training Habits" },
  { week: 56,  pillar: "Education & Awareness",       type: "Quick Win",        title: "The Top 5 Benefits of Soccer for Kids (Backed by Science)",                     leadMagnet: "Benefits Infographic" },
  { week: 57,  pillar: "Home Training How-To",        type: "Quick Win",        title: "Simple Drills That Deliver Big Results",                                         leadMagnet: "5 Essential Drills Guide" },
  { week: 58,  pillar: "Parent Support & Mindset",    type: "Quick Win",        title: "When to Push and When to Back Off",                                              leadMagnet: "Push-Pull Assessment Tool" },
  { week: 59,  pillar: "Age & Skill Development",     type: "Quick Win",        title: "How to Teach Dribbling at Home",                                                 leadMagnet: "Dribbling Teaching Guide" },
  { week: 60,  pillar: "Stories & Social Proof",      type: "Quick Win",        title: "What Parents Are Saying About At-Home Soccer Coaching",                         leadMagnet: "Testimonial Video Library" },
  { week: 61,  pillar: "Education & Awareness",       type: "Story-Based",      title: "My Biggest Regret as a Soccer Parent",                                           leadMagnet: "Regret Prevention Checklist" },
  { week: 62,  pillar: "Home Training How-To",        type: "Story-Based",      title: "Training Without Being a Pushy Soccer Parent",                                  leadMagnet: "Healthy Training Boundaries Guide" },
  { week: 63,  pillar: "Parent Support & Mindset",    type: "Story-Based",      title: "The Day I Realized I Was Adding Pressure Not Removing It",                     leadMagnet: "Pressure Audit Worksheet" },
  { week: 64,  pillar: "Age & Skill Development",     type: "Story-Based",      title: "Why I Wish I'd Started First Touch Training Earlier",                           leadMagnet: "First Touch Quick Start" },
  { week: 65,  pillar: "Stories & Social Proof",      type: "Story-Based",      title: "How a Busy Mom Found 15 Minutes a Day for Soccer Training",                    leadMagnet: "15-Minute Training Hacks" },
  { week: 66,  pillar: "Education & Awareness",       type: "Lead Magnet",      title: "How to Tell If Your Child's Club Is Actually Developing Them",                 leadMagnet: "Club Evaluation Scorecard" },
  { week: 67,  pillar: "Home Training How-To",        type: "Lead Magnet",      title: "How to Train for Soccer at Home on a Budget",                                   leadMagnet: "DIY Equipment Guide" },
  { week: 68,  pillar: "Parent Support & Mindset",    type: "Lead Magnet",      title: "5 Warning Signs of Soccer Burnout in Kids",                                     leadMagnet: "Burnout Prevention System" },
  { week: 69,  pillar: "Age & Skill Development",     type: "Lead Magnet",      title: "Off-Season Training for U10s and U12s",                                         leadMagnet: "Off-Season Training Plan" },
  { week: 70,  pillar: "Stories & Social Proof",      type: "Lead Magnet",      title: "Success Without Private Coaches: How They Did It",                              leadMagnet: "Self-Coached Success Blueprint" },
  { week: 71,  pillar: "Education & Awareness",       type: "Seasonal/Timely",  title: "New Year Soccer Goals for Kids",                                                 leadMagnet: "Goal-Setting Workbook" },
  { week: 72,  pillar: "Home Training How-To",        type: "Seasonal/Timely",  title: "Rainy Day Soccer Drills for Indoors",                                            leadMagnet: "Indoor Drill Library" },
  { week: 73,  pillar: "Parent Support & Mindset",    type: "Seasonal/Timely",  title: "How to Handle Tryout Rejection",                                                 leadMagnet: "Tryout Rejection Recovery Guide" },
  { week: 74,  pillar: "Age & Skill Development",     type: "Seasonal/Timely",  title: "Summer Skill Development: Close the Gap",                                       leadMagnet: "Summer Gap-Closing Plan" },
  { week: 75,  pillar: "Stories & Social Proof",      type: "Seasonal/Timely",  title: "Tryout Success: How Home Training Made the Difference",                         leadMagnet: "Tryout Success Formula" },
  { week: 76,  pillar: "Education & Awareness",       type: "Deep Dive",        title: "The Science Behind Skill Development in Young Athletes",                         leadMagnet: "Skill Development Science Guide" },
  { week: 77,  pillar: "Home Training How-To",        type: "Deep Dive",        title: "Building a Home Training System That Works",                                     leadMagnet: "Home Training System Blueprint" },
  { week: 78,  pillar: "Parent Support & Mindset",    type: "Deep Dive",        title: "Training Without Pressure: The Missing Piece in Youth Development",             leadMagnet: "Pressure-Free Training Guide" },
  { week: 79,  pillar: "Age & Skill Development",     type: "Deep Dive",        title: "How to Develop Soccer Vision at Home",                                           leadMagnet: "Soccer IQ Training Program" },
  { week: 80,  pillar: "Stories & Social Proof",      type: "Deep Dive",        title: "The Overlooked Benefits of Parent-Led Soccer Training",                         leadMagnet: "Parent-Led Training Manifesto" },
  { week: 81,  pillar: "Education & Awareness",       type: "Quick Win",        title: "The Difference Between Recreational and Competitive Soccer Explained",          leadMagnet: "Rec vs Competitive Comparison" },
  { week: 82,  pillar: "Home Training How-To",        type: "Quick Win",        title: "The 7-Day Soccer Training Plan (What to Do Each Day)",                          leadMagnet: "7-Day Ball Mastery Plan" },
  { week: 83,  pillar: "Parent Support & Mindset",    type: "Quick Win",        title: "How to Celebrate Effort Not Just Results",                                       leadMagnet: "Effort Celebration Ideas" },
  { week: 84,  pillar: "Age & Skill Development",     type: "Quick Win",        title: "Improving Weak Foot Training at Home",                                           leadMagnet: "Weak Foot Development Plan" },
  { week: 85,  pillar: "Stories & Social Proof",      type: "Quick Win",        title: "The Simple Change That Made All the Difference",                                 leadMagnet: "Simple Change Implementation" },
  { week: 86,  pillar: "Education & Awareness",       type: "Story-Based",      title: "What I Wish I'd Known Before My Son Started Club Soccer",                       leadMagnet: "Club Soccer Parent Prep Guide" },
  { week: 87,  pillar: "Home Training How-To",        type: "Story-Based",      title: "How 15 Minutes a Day Changed Everything for Us",                                leadMagnet: "15-Minute Habit Builder" },
  { week: 88,  pillar: "Parent Support & Mindset",    type: "Story-Based",      title: "How I Learned to Stop Being That Soccer Parent",                                leadMagnet: "Sideline Behavior Self-Assessment" },
  { week: 89,  pillar: "Age & Skill Development",     type: "Story-Based",      title: "The Skill That Made the Biggest Difference for My Son",                        leadMagnet: "Priority Skills Assessment" },
  { week: 90,  pillar: "Stories & Social Proof",      type: "Story-Based",      title: "The Garage That Became a Training Hub",                                          leadMagnet: "Space Optimization Guide" },
  { week: 91,  pillar: "Education & Awareness",       type: "Lead Magnet",      title: "Is Your Child Getting Enough Touches? The 10,000-Hour Truth",                  leadMagnet: "Touch Counter Tracker" },
  { week: 92,  pillar: "Home Training How-To",        type: "Lead Magnet",      title: "How to Track Your Child's Soccer Progress at Home",                            leadMagnet: "Progress Tracking System" },
  { week: 93,  pillar: "Parent Support & Mindset",    type: "Lead Magnet",      title: "Balancing School Life and Soccer: A Parent's Blueprint",                       leadMagnet: "Weekly Schedule Template" },
  { week: 94,  pillar: "Age & Skill Development",     type: "Lead Magnet",      title: "Best Practices for Training U10-U12 at Home",                                  leadMagnet: "U10-U12 Training Curriculum" },
  { week: 95,  pillar: "Stories & Social Proof",      type: "Lead Magnet",      title: "Testimonials: Why Parents Choose Home Training",                                 leadMagnet: "Full Testimonial Collection" },
  { week: 96,  pillar: "Education & Awareness",       type: "Seasonal/Timely",  title: "Off-Season Training: Don't Let Skills Slip",                                    leadMagnet: "Off-Season Maintenance Plan" },
  { week: 97,  pillar: "Home Training How-To",        type: "Seasonal/Timely",  title: "Holiday Soccer Training: Keeping Kids Active",                                  leadMagnet: "Holiday Training Calendar" },
  { week: 98,  pillar: "Parent Support & Mindset",    type: "Seasonal/Timely",  title: "Post-Season Reset: Reconnecting with Your Child",                              leadMagnet: "Post-Season Connection Activities" },
  { week: 99,  pillar: "Age & Skill Development",     type: "Seasonal/Timely",  title: "What to Work On During the Off-Season by Age",                                 leadMagnet: "Off-Season Focus by Age" },
  { week: 100, pillar: "Stories & Social Proof",      type: "Seasonal/Timely",  title: "New Year New Results: Parent Success Roundup",                                  leadMagnet: "New Year Success Stories" },
  { week: 101, pillar: "Education & Awareness",       type: "Deep Dive",        title: "Why Some Kids Improve Faster Than Others",                                       leadMagnet: "Individual Development Assessment" },
  { week: 102, pillar: "Home Training How-To",        type: "Deep Dive",        title: "The Only 5 Drills Your Child Needs to Master",                                  leadMagnet: "Essential 5 Drill System" },
  { week: 103, pillar: "Parent Support & Mindset",    type: "Deep Dive",        title: "Building Mental Toughness in Young Soccer Players",                              leadMagnet: "Mental Toughness Curriculum" },
  { week: 104, pillar: "Age & Skill Development",     type: "Deep Dive",        title: "Top 10 Skills Every Young Soccer Player Should Master",                          leadMagnet: "10 Skills Mastery Path" },
  { week: 105, pillar: "Stories & Social Proof",      type: "Deep Dive",        title: "When Home Training Pays Off: A Parent's Reflection",                           leadMagnet: "Long-Term Success Indicators" },
  { week: 106, pillar: "Education & Awareness",       type: "Quick Win",        title: "Youth Soccer Myths Debunked: What Actually Matters",                            leadMagnet: "Myth vs Reality Guide" },
  { week: 107, pillar: "Home Training How-To",        type: "Quick Win",        title: "How to Improve Your Child's First Touch at Home",                              leadMagnet: "First Touch Quick Wins" },
  { week: 108, pillar: "Parent Support & Mindset",    type: "Quick Win",        title: "How to Talk to Your Child After a Bad Game",                                    leadMagnet: "Post-Game Scripts" },
  { week: 109, pillar: "Age & Skill Development",     type: "Quick Win",        title: "How to Teach Passing at Home",                                                   leadMagnet: "Passing Progression Guide" },
  { week: 110, pillar: "Stories & Social Proof",      type: "Quick Win",        title: "Real Results: 90 Days of Consistency",                                           leadMagnet: "90-Day Challenge Results" },
  { week: 111, pillar: "Education & Awareness",       type: "Story-Based",      title: "The Day I Realized Team Practice Wasn't Enough",                               leadMagnet: "Practice Gap Calculator" },
  { week: 112, pillar: "Home Training How-To",        type: "Story-Based",      title: "What a Good Home Training Session Actually Looks Like",                        leadMagnet: "Session Template Examples" },
  { week: 113, pillar: "Parent Support & Mindset",    type: "Story-Based",      title: "What My Son Taught Me About Resilience",                                        leadMagnet: "Resilience Lessons Reflection" },
  { week: 114, pillar: "Age & Skill Development",     type: "Story-Based",      title: "Training 6-Year-Olds vs Training 10-Year-Olds: What I Learned",               leadMagnet: "Age Comparison Guide" },
  { week: 115, pillar: "Stories & Social Proof",      type: "Story-Based",      title: "How One Family Trained Through Every Season",                                    leadMagnet: "Year-Round Training Story" },
  { week: 116, pillar: "Education & Awareness",       type: "Lead Magnet",      title: "How Many Days a Week Should My Child Practice Soccer?",                         leadMagnet: "Weekly Practice Planner" },
  { week: 117, pillar: "Home Training How-To",        type: "Lead Magnet",      title: "Dribbling, Passing, Shooting: Weekly Drill Plan for Parents",                  leadMagnet: "4-Week Progressive Drill Plan" },
  { week: 118, pillar: "Parent Support & Mindset",    type: "Lead Magnet",      title: "How Visualization Can Improve Your Child's Soccer Game",                       leadMagnet: "Visualization Script Library" },
  { week: 119, pillar: "Age & Skill Development",     type: "Lead Magnet",      title: "1v1 Moves Every Kid Should Know",                                                leadMagnet: "1v1 Moves Video Library" },
  { week: 120, pillar: "Stories & Social Proof",      type: "Lead Magnet",      title: "How One Family Trained Through Every Season",                                    leadMagnet: "Year-Round Training Calendar" },
  { week: 121, pillar: "Education & Awareness",       type: "Seasonal/Timely",  title: "Pre-Season Training at Home",                                                    leadMagnet: "Pre-Season Prep Checklist" },
  { week: 122, pillar: "Home Training How-To",        type: "Seasonal/Timely",  title: "Soccer Training While Traveling",                                                leadMagnet: "Travel Training Guide" },
  { week: 123, pillar: "Parent Support & Mindset",    type: "Seasonal/Timely",  title: "Navigating Club Changes: When and How to Switch",                              leadMagnet: "Club Change Decision Tree" },
  { week: 124, pillar: "Age & Skill Development",     type: "Seasonal/Timely",  title: "Age-Specific Holiday Training Ideas",                                            leadMagnet: "Holiday Training by Age" },
  { week: 125, pillar: "Stories & Social Proof",      type: "Seasonal/Timely",  title: "Summer Transformation Stories",                                                  leadMagnet: "Summer Success Roundup" },
];

// Weeks 1–7 are already published
const INITIALLY_DONE = new Set([1, 2, 3, 4, 5, 6, 7]);

const PILLAR_COLOR: Record<string, string> = {
  "Education & Awareness":    "#0891b2",
  "Home Training How-To":     "#7c3aed",
  "Parent Support & Mindset": "#d97706",
  "Age & Skill Development":  "#16a34a",
  "Stories & Social Proof":   "#ea580c",
};

const TYPE_STYLE: Record<string, { bg: string; color: string }> = {
  "Deep Dive":       { bg: "#EFF6FF", color: "#1d4ed8" },
  "Quick Win":       { bg: "#F0FDF4", color: "#15803d" },
  "Story-Based":     { bg: "#FEF3C7", color: "#92400e" },
  "Lead Magnet":     { bg: "#FDF4FF", color: "#7e22ce" },
  "Seasonal/Timely": { bg: "#F0FDFA", color: "#0f766e" },
};

const ALL_PILLARS = [
  "Education & Awareness",
  "Home Training How-To",
  "Parent Support & Mindset",
  "Age & Skill Development",
  "Stories & Social Proof",
];

const ALL_TYPES = ["Deep Dive", "Quick Win", "Story-Based", "Lead Magnet", "Seasonal/Timely"];

export function BlogCalendar() {
  const [links, setLinks] = useState<Record<number, string>>({});
  const [done, setDone]   = useState<Record<number, boolean>>(() => {
    const init: Record<number, boolean> = {};
    INITIALLY_DONE.forEach(w => { init[w] = true; });
    return init;
  });
  const [filterPillar, setFilterPillar] = useState<string>("All");
  const [filterType,   setFilterType]   = useState<string>("All");

  useEffect(() => {
    try {
      const savedLinks = localStorage.getItem("focus_blog_links_v3");
      if (savedLinks) setLinks(JSON.parse(savedLinks));
      const savedDone = localStorage.getItem("focus_blog_done_v2");
      if (savedDone) setDone(prev => ({ ...prev, ...JSON.parse(savedDone) }));
    } catch {}
  }, []);

  const saveLink = (week: number, url: string) => {
    const next = { ...links, [week]: url };
    setLinks(next);
    try { localStorage.setItem("focus_blog_links_v3", JSON.stringify(next)); } catch {}
  };

  const toggleDone = (week: number) => {
    const next = { ...done, [week]: !done[week] };
    setDone(next);
    try { localStorage.setItem("focus_blog_done_v2", JSON.stringify(next)); } catch {}
  };

  const doneCount = Object.values(done).filter(Boolean).length;

  const visible = POSTS.filter(p => {
    if (filterPillar !== "All" && p.pillar !== filterPillar) return false;
    if (filterType   !== "All" && p.type  !== filterType)   return false;
    return true;
  });

  const chip = (label: string, active: boolean, color: string, onClick: () => void) => (
    <button key={label} onClick={onClick} style={{
      fontSize: 11, fontWeight: 600, padding: "4px 11px", borderRadius: 20,
      border: active ? `1.5px solid ${color}` : "1.5px solid transparent",
      cursor: "pointer", background: active ? color + "18" : "#F1F5F9",
      color: active ? color : "#64748b", fontFamily: "inherit", whiteSpace: "nowrap",
    }}>{label}</button>
  );

  return (
    <div style={{ maxWidth: 1160, margin: "0 auto", padding: "28px 20px" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#0F3154", fontFamily: "var(--font-display,'Outfit',sans-serif)" }}>
          Blog Content Calendar
        </div>
        <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 3 }}>
          <span style={{ color: "#16a34a", fontWeight: 700 }}>{doneCount}</span> published · {POSTS.length} total posts
        </div>
      </div>

      {/* Pillar filters */}
      <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginRight: 2 }}>Pillar</span>
        {chip("All", filterPillar === "All", "#0F3154", () => setFilterPillar("All"))}
        {ALL_PILLARS.map(p => chip(p, filterPillar === p, PILLAR_COLOR[p], () => setFilterPillar(p)))}
      </div>

      {/* Type filters */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginRight: 2 }}>Type</span>
        {chip("All", filterType === "All", "#0F3154", () => setFilterType("All"))}
        {ALL_TYPES.map(t => chip(t, filterType === t, TYPE_STYLE[t].color, () => setFilterType(t)))}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E1E8EF", boxShadow: "0 2px 8px rgba(15,49,84,0.05)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                <th style={th({ width: 36, textAlign: "center" })}>✓</th>
                <th style={th({ width: 36 })}>Wk</th>
                <th style={th({ width: 130 })}>Pillar</th>
                <th style={th({ width: 100 })}>Type</th>
                <th style={th({})}>Blog Post Title</th>
                <th style={th({ width: 220 })}>Post Link</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((post, i) => {
                const pc  = PILLAR_COLOR[post.pillar] ?? "#94a3b8";
                const ts  = TYPE_STYLE[post.type]     ?? TYPE_STYLE["Deep Dive"];
                const link     = links[post.week] ?? "";
                const isDone   = !!done[post.week];
                return (
                  <tr key={post.week} style={{
                    borderTop: i === 0 ? "none" : "1px solid #F1F5F9",
                    background: isDone ? "#F0FDF4" : "white",
                    transition: "background 0.12s",
                  }}>
                    {/* Checkbox */}
                    <td style={{ padding: "9px 10px", textAlign: "center", verticalAlign: "middle" }}>
                      <button onClick={() => toggleDone(post.week)} title={isDone ? "Unmark" : "Mark published"} style={{
                        width: 20, height: 20, borderRadius: 5,
                        border: `2px solid ${isDone ? "#16a34a" : "#CBD5E1"}`,
                        background: isDone ? "#16a34a" : "white",
                        cursor: "pointer", display: "inline-flex", alignItems: "center",
                        justifyContent: "center", fontSize: 12, color: "white", padding: 0,
                      }}>{isDone ? "✓" : ""}</button>
                    </td>
                    {/* Week */}
                    <td style={{ padding: "9px 10px", verticalAlign: "middle" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8" }}>{post.week}</span>
                    </td>
                    {/* Pillar */}
                    <td style={{ padding: "9px 10px", verticalAlign: "middle" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: pc, background: pc + "15", padding: "3px 8px", borderRadius: 10, whiteSpace: "nowrap" }}>
                        {post.pillar}
                      </span>
                    </td>
                    {/* Type */}
                    <td style={{ padding: "9px 10px", verticalAlign: "middle" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: ts.color, background: ts.bg, padding: "3px 8px", borderRadius: 10, whiteSpace: "nowrap" }}>
                        {post.type}
                      </span>
                    </td>
                    {/* Title + lead magnet */}
                    <td style={{ padding: "9px 12px", verticalAlign: "middle" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0F3154", lineHeight: 1.4 }}>
                        {isDone && link.trim() ? (
                          <a href={link} target="_blank" rel="noopener noreferrer"
                            style={{ color: "#0F3154", textDecoration: "none" }}
                            onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                            onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
                          >{post.title} ↗</a>
                        ) : post.title}
                      </div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{post.leadMagnet}</div>
                    </td>
                    {/* URL */}
                    <td style={{ padding: "7px 10px", verticalAlign: "middle" }}>
                      <input type="url" value={link} onChange={e => saveLink(post.week, e.target.value)}
                        placeholder="Paste URL when published…"
                        style={{
                          width: "100%", border: `1px solid ${isDone && link ? "#86EFAC" : "#E1E8EF"}`,
                          borderRadius: 7, padding: "6px 9px", fontSize: 12,
                          fontFamily: "inherit", color: "#0F3154", outline: "none",
                          background: isDone ? "#F0FDF4" : "#fff", boxSizing: "border-box",
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

function th(extra: React.CSSProperties): React.CSSProperties {
  return {
    padding: "10px 10px", textAlign: "left", fontSize: 10, fontWeight: 700,
    color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em",
    borderBottom: "1px solid #E1E8EF", whiteSpace: "nowrap", ...extra,
  };
}
