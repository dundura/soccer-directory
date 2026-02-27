"use client";

import { useState } from "react";
import type { ListingType } from "@/lib/types";

// ── Constants ──────────────────────────────────────────────────

const DEFAULT_HERO_IMAGE = "https://anytime-soccer.com/wp-content/uploads/2026/02/news_soccer08_16-9-ratio.webp";
const DEFAULT_SIDEBAR_IMAGE = "http://anytime-soccer.com/wp-content/uploads/2026/01/idf.webp";

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming", "Washington D.C.", "International",
];

const COUNTRIES = [
  "United States", "Afghanistan", "Albania", "Algeria", "Andorra", "Angola",
  "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize",
  "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil",
  "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China",
  "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus",
  "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia",
  "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia",
  "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
  "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran",
  "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan",
  "Kenya", "Kiribati", "Korea North", "Korea South", "Kosovo", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein",
  "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali",
  "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia",
  "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger",
  "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine",
  "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
  "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe",
  "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore",
  "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan",
  "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan",
  "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga",
  "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda",
  "Ukraine", "United Arab Emirates", "United Kingdom", "Uruguay", "Uzbekistan",
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe",
];

const AGE_GROUPS = ["All", "U7", "U8", "U9", "U10", "U11", "U12", "U13", "U14", "U15", "U16", "U17", "U18", "U19"];

const SOCCER_POSITIONS = [
  "All Positions", "Goalkeeper", "Right Back", "Left Back", "Center Back",
  "Defensive Midfielder", "Central Midfielder", "Attacking Midfielder",
  "Right Winger", "Left Winger", "Striker", "Forward",
];

const DEFAULT_DESCRIPTIONS: Record<ListingType, string> = {
  club: "We are a youth soccer club committed to developing players of all levels. Our experienced coaching staff focuses on technical skills, tactical awareness, and a love for the game.",
  team: "Our team competes at a competitive level and we're looking for dedicated players who want to improve and compete. Join us for a great season!",
  trainer: "I am a certified soccer trainer with years of experience developing players of all ages. My sessions focus on technical skills, game IQ, and building confidence on the ball.",
  camp: "Join us for an exciting soccer camp experience! Players will enjoy skill-building sessions, small-sided games, and a fun environment designed to help every player improve.",
  guest: "We're looking for guest players to join our team for an upcoming tournament. This is a great opportunity to compete at a high level and showcase your skills.",
  tournament: "Join teams from across the region for this exciting tournament. Competitive divisions, professional fields, and great competition for all age groups.",
  futsal: "Our futsal team competes in a fast-paced indoor environment that develops quick thinking, close control, and sharp passing. All skill levels welcome.",
  trip: "Join us for an unforgettable international soccer experience! Players will train with local coaches, compete against international teams, and immerse themselves in a new soccer culture.",
  marketplace: "Quality soccer equipment available for purchase. Great condition and ready for the next player!",
  equipment: "Quality soccer equipment available for purchase. Great condition and ready for the next player!",
  books: "Quality soccer equipment available for purchase. Great condition and ready for the next player!",
  showcase: "Join us for a competitive college showcase event! Get exposure in front of college coaches and recruiters.",
  player: "A dedicated soccer player looking for new opportunities to compete and grow. Open to guest play, tryouts, and showcase events.",
  podcast: "A soccer podcast covering youth development, coaching insights, and the beautiful game.",
};

// ── Field definitions ──────────────────────────────────────────

type FieldDef = {
  name: string;
  label: string;
  required?: boolean;
  type?: string;
  options?: string[];
};

const FIELDS: Record<ListingType, FieldDef[]> = {
  club: [
    { name: "name", label: "Club Name", required: true },
    { name: "city", label: "City", required: true },
    { name: "country", label: "Country", required: true, type: "country" },
    { name: "state", label: "State", required: true, type: "state-select" },
    { name: "level", label: "Level", required: true, options: ["MLS Next Pro Pathway", "MLS NEXT", "MLS NEXT 2", "Girls Academy", "ECNL", "ECNL Regional League (ECRL)", "Elite 64", "USL Academy", "Aspire", "NPL", "USYS National League", "DPL", "EDP", "SCCL", "State League", "Regional League", "Club Travel", "Rec Select", "Recreational / Grassroots", "Other"] },
    { name: "league", label: "League Name" },
    { name: "leagueUrl", label: "League Website URL" },
    { name: "ageGroups", label: "Age", required: true, type: "age-multi" },
    { name: "gender", label: "Gender", required: true, options: ["Boys & Girls", "Boys", "Girls"] },
    { name: "teamCount", label: "Number of Teams", type: "number" },
    { name: "description", label: "Description", required: true, type: "textarea" },
    { name: "website", label: "Website" },
    { name: "email", label: "Contact Email", type: "email" },
    { name: "phone", label: "Phone" },
    { name: "_socials", label: "Social Media", type: "heading" },
    { name: "facebook", label: "Facebook URL" },
    { name: "instagram", label: "Instagram URL" },
    { name: "youtube", label: "YouTube URL" },
    { name: "_profile", label: "Images & Media", type: "heading" },
    { name: "teamPhoto", label: "Sidebar Image", type: "image" },
    { name: "logo", label: "Logo URL" },
    { name: "imageUrl", label: "Hero Banner Image", type: "image" },
    { name: "address", label: "Practice Address" },
    { name: "practiceSchedule", label: "Practice Days", type: "schedule" },
    { name: "photos", label: "Photos (up to 5 URLs)", type: "photos" },
    { name: "videoUrl", label: "Video URL (YouTube/Vimeo)" },
    { name: "_media", label: "Media Coverage", type: "heading" },
    { name: "mediaLinks", label: "Media Links (up to 5 URLs)", type: "media-links" },
  ],
  team: [
    { name: "name", label: "Team Name", required: true },
    { name: "clubName", label: "Club Name" },
    { name: "city", label: "City", required: true },
    { name: "country", label: "Country", required: true, type: "country" },
    { name: "state", label: "State", required: true, type: "state-select" },
    { name: "level", label: "Level", required: true, options: ["MLS Next Pro Pathway", "MLS NEXT", "MLS NEXT 2", "Girls Academy", "ECNL", "ECNL Regional League (ECRL)", "Elite 64", "USL Academy", "Aspire", "NPL", "USYS National League", "DPL", "EDP", "SCCL", "State League", "Regional League", "Club Travel", "Rec Select", "Recreational / Grassroots", "Other"] },
    { name: "ageGroup", label: "Age Group", required: true, type: "age-select" },
    { name: "gender", label: "Gender", required: true, options: ["Boys", "Girls", "Coed"] },
    { name: "coach", label: "Head Coach", required: true },
    { name: "lookingForPlayers", label: "Looking for Players?", options: ["true", "false"] },
    { name: "positionsNeeded", label: "Positions Needed", type: "positions" },
    { name: "season", label: "Season", required: true, options: ["2025-2026", "2026-2027", "Year-Round"] },
    { name: "description", label: "Description", type: "textarea" },
    { name: "_events", label: "Upcoming Events", type: "heading" },
    { name: "events", label: "Events (up to 5)", type: "events" },
    { name: "_tournaments", label: "Annual Tournaments", type: "heading" },
    { name: "annualTournaments", label: "Tournaments (up to 10)", type: "tournament-list" },
    { name: "phone", label: "Phone" },
    { name: "_socials", label: "Social Media", type: "heading" },
    { name: "facebook", label: "Facebook URL" },
    { name: "instagram", label: "Instagram URL" },
    { name: "youtube", label: "YouTube URL" },
    { name: "_profile", label: "Images & Media", type: "heading" },
    { name: "teamPhoto", label: "Sidebar Image", type: "image" },
    { name: "logo", label: "Logo URL" },
    { name: "imageUrl", label: "Hero Banner Image", type: "image" },
    { name: "address", label: "Practice Address" },
    { name: "practiceSchedule", label: "Practice Days", type: "schedule" },
    { name: "photos", label: "Photos (up to 5 URLs)", type: "photos" },
    { name: "videoUrl", label: "Video URL (YouTube/Vimeo)" },
    { name: "_media", label: "Media Coverage", type: "heading" },
    { name: "mediaLinks", label: "Media Links (up to 5 URLs)", type: "media-links" },
  ],
  trainer: [
    { name: "name", label: "Your Name", required: true },
    { name: "city", label: "City", required: true },
    { name: "country", label: "Country", required: true, type: "country" },
    { name: "state", label: "State", required: true, type: "state-select" },
    { name: "specialty", label: "Specialty", required: true, options: ["Shooting & Finishing", "Technical Skills", "Goalkeeping", "Speed & Agility", "Tactical Development", "Position-Specific", "Mental Training", "General"] },
    { name: "experience", label: "Experience (e.g. 10+ years)", required: true },
    { name: "credentials", label: "Credentials / Licenses", required: true },
    { name: "priceRange", label: "Price Range (e.g. $60-80/session)", required: true },
    { name: "serviceArea", label: "Service Area", required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "website", label: "Website" },
    { name: "email", label: "Contact Email", type: "email" },
    { name: "phone", label: "Phone" },
    { name: "_socials", label: "Social Media", type: "heading" },
    { name: "facebook", label: "Facebook URL" },
    { name: "instagram", label: "Instagram URL" },
    { name: "youtube", label: "YouTube URL" },
    { name: "_profile", label: "Images & Media", type: "heading" },
    { name: "teamPhoto", label: "Sidebar Image", type: "image" },
    { name: "logo", label: "Logo URL" },
    { name: "imageUrl", label: "Hero Banner Image", type: "image" },
    { name: "address", label: "Training Location Address" },
    { name: "practiceSchedule", label: "Availability", type: "schedule" },
    { name: "photos", label: "Photos (up to 5 URLs)", type: "photos" },
    { name: "videoUrl", label: "Video URL (YouTube/Vimeo)" },
  ],
  camp: [
    { name: "name", label: "Camp Name", required: true },
    { name: "organizerName", label: "Organizer Name", required: true },
    { name: "city", label: "City", required: true },
    { name: "country", label: "Country", required: true, type: "country" },
    { name: "state", label: "State", required: true, type: "state-select" },
    { name: "campType", label: "Camp Type", required: true, options: ["Elite ID Camp", "Recreational Camp", "Position-Specific Clinic", "College Showcase", "Specialty Clinic", "Day Camp"] },
    { name: "ageRange", label: "Age Range", required: true, type: "age-multi" },
    { name: "dates", label: "Dates (e.g. June 15-18, 2026)", required: true },
    { name: "price", label: "Price (e.g. $299)", required: true },
    { name: "gender", label: "Gender", required: true, options: ["Boys & Girls", "Boys", "Girls"] },
    { name: "location", label: "Location / Venue" },
    { name: "description", label: "Description", required: true, type: "textarea" },
    { name: "registrationUrl", label: "Registration URL" },
    { name: "email", label: "Contact Email", type: "email" },
    { name: "phone", label: "Phone" },
    { name: "_socials", label: "Social Media", type: "heading" },
    { name: "facebook", label: "Facebook URL" },
    { name: "instagram", label: "Instagram URL" },
    { name: "youtube", label: "YouTube URL" },
    { name: "_profile", label: "Images & Media", type: "heading" },
    { name: "teamPhoto", label: "Sidebar Image", type: "image" },
    { name: "logo", label: "Logo URL" },
    { name: "imageUrl", label: "Hero Banner Image", type: "image" },
    { name: "photos", label: "Photos (up to 5 URLs)", type: "photos" },
    { name: "videoUrl", label: "Video URL (YouTube/Vimeo)" },
  ],
  guest: [
    { name: "teamName", label: "Team Name", required: true },
    { name: "city", label: "City", required: true },
    { name: "country", label: "Country", required: true, type: "country" },
    { name: "state", label: "State", required: true, type: "state-select" },
    { name: "level", label: "Level", required: true, options: ["MLS Next Pro Pathway", "MLS NEXT", "MLS NEXT 2", "Girls Academy", "ECNL", "ECNL Regional League (ECRL)", "Elite 64", "USL Academy", "Aspire", "NPL", "USYS National League", "DPL", "EDP", "SCCL", "State League", "Regional League", "Club Travel", "Rec Select", "Recreational / Grassroots", "Other"] },
    { name: "ageGroup", label: "Age Group", required: true, type: "age-select" },
    { name: "gender", label: "Gender", required: true, options: ["Boys", "Girls", "Coed"] },
    { name: "dates", label: "Dates", required: true },
    { name: "tournament", label: "Tournament Name", required: true },
    { name: "positionsNeeded", label: "Positions Needed", required: true, type: "positions" },
    { name: "contactEmail", label: "Contact Email", required: true, type: "email" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "phone", label: "Phone" },
    { name: "_socials", label: "Social Media", type: "heading" },
    { name: "facebook", label: "Facebook URL" },
    { name: "instagram", label: "Instagram URL" },
    { name: "youtube", label: "YouTube URL" },
    { name: "_profile", label: "Images & Media", type: "heading" },
    { name: "teamPhoto", label: "Sidebar Image", type: "image" },
    { name: "logo", label: "Logo URL" },
    { name: "imageUrl", label: "Hero Banner Image", type: "image" },
    { name: "photos", label: "Photos (up to 5 URLs)", type: "photos" },
    { name: "videoUrl", label: "Video URL (YouTube/Vimeo)" },
  ],
  tournament: [
    { name: "name", label: "Tournament Name", required: true },
    { name: "organizer", label: "Organizer", required: true },
    { name: "city", label: "City", required: true },
    { name: "country", label: "Country", required: true, type: "country" },
    { name: "state", label: "State", required: true, type: "state-select" },
    { name: "dates", label: "Dates (e.g. March 15-17, 2026)", required: true },
    { name: "ageGroups", label: "Age", required: true, type: "age-multi" },
    { name: "gender", label: "Gender", required: true, options: ["Boys & Girls", "Boys", "Girls"] },
    { name: "level", label: "Level", required: true, options: ["Recreational", "Competitive", "ECNL", "MLS Next", "Open", "Other"] },
    { name: "entryFee", label: "Entry Fee (e.g. $750/team)", required: true },
    { name: "format", label: "Format", required: true, options: ["7v7", "9v9", "11v11", "Mixed"] },
    { name: "region", label: "Region", required: true, options: ["US", "International"] },
    { name: "description", label: "Description", required: true, type: "textarea" },
    { name: "registrationUrl", label: "Registration URL" },
    { name: "email", label: "Contact Email", type: "email" },
    { name: "phone", label: "Phone" },
    { name: "_socials", label: "Social Media", type: "heading" },
    { name: "facebook", label: "Facebook URL" },
    { name: "instagram", label: "Instagram URL" },
    { name: "youtube", label: "YouTube URL" },
    { name: "_profile", label: "Images & Media", type: "heading" },
    { name: "teamPhoto", label: "Sidebar Image", type: "image" },
    { name: "logo", label: "Logo URL" },
    { name: "imageUrl", label: "Hero Banner Image", type: "image" },
    { name: "photos", label: "Photos (up to 5 URLs)", type: "photos" },
    { name: "videoUrl", label: "Video URL (YouTube/Vimeo)" },
  ],
  futsal: [
    { name: "name", label: "Team Name", required: true },
    { name: "clubName", label: "Club Name" },
    { name: "city", label: "City", required: true },
    { name: "country", label: "Country", required: true, type: "country" },
    { name: "state", label: "State", required: true, type: "state-select" },
    { name: "level", label: "Level", required: true, options: ["Recreational", "Competitive", "Premier", "Semi-Pro", "Other"] },
    { name: "ageGroup", label: "Age Group", required: true, type: "age-select" },
    { name: "gender", label: "Gender", required: true, options: ["Boys", "Girls", "Coed", "Men", "Women"] },
    { name: "coach", label: "Head Coach", required: true },
    { name: "lookingForPlayers", label: "Looking for Players?", options: ["true", "false"] },
    { name: "positionsNeeded", label: "Positions Needed", type: "positions" },
    { name: "season", label: "Season", required: true, options: ["2025-2026", "2026-2027", "Year-Round"] },
    { name: "format", label: "Format", required: true, options: ["5v5", "6v6", "4v4"] },
    { name: "description", label: "Description", type: "textarea" },
    { name: "phone", label: "Phone" },
    { name: "_socials", label: "Social Media", type: "heading" },
    { name: "facebook", label: "Facebook URL" },
    { name: "instagram", label: "Instagram URL" },
    { name: "youtube", label: "YouTube URL" },
    { name: "_profile", label: "Images & Media", type: "heading" },
    { name: "teamPhoto", label: "Sidebar Image", type: "image" },
    { name: "logo", label: "Logo URL" },
    { name: "imageUrl", label: "Hero Banner Image", type: "image" },
    { name: "address", label: "Practice Address" },
    { name: "practiceSchedule", label: "Practice Days", type: "schedule" },
    { name: "photos", label: "Photos (up to 5 URLs)", type: "photos" },
    { name: "videoUrl", label: "Video URL (YouTube/Vimeo)" },
  ],
  trip: [
    { name: "tripName", label: "Trip Name", required: true },
    { name: "organizer", label: "Organizer / Company", required: true },
    { name: "destination", label: "Destination (e.g. Barcelona, Spain)", required: true },
    { name: "city", label: "City", required: true },
    { name: "country", label: "Country", required: true, type: "country" },
    { name: "state", label: "State (if US-based organizer)" },
    { name: "dates", label: "Travel Dates", required: true },
    { name: "ageGroup", label: "Age Group", required: true, type: "age-select" },
    { name: "gender", label: "Gender", required: true, options: ["Boys", "Girls", "Coed"] },
    { name: "level", label: "Level", required: true, options: ["Recreational", "Competitive", "Elite", "All Levels"] },
    { name: "price", label: "Price (e.g. $3,500/player)" },
    { name: "spotsAvailable", label: "Spots Available" },
    { name: "contactEmail", label: "Contact Email", required: true, type: "email" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "phone", label: "Phone" },
    { name: "_socials", label: "Social Media", type: "heading" },
    { name: "facebook", label: "Facebook URL" },
    { name: "instagram", label: "Instagram URL" },
    { name: "youtube", label: "YouTube URL" },
    { name: "_profile", label: "Images & Media", type: "heading" },
    { name: "teamPhoto", label: "Sidebar Image", type: "image" },
    { name: "logo", label: "Logo URL" },
    { name: "imageUrl", label: "Hero Banner Image", type: "image" },
    { name: "photos", label: "Photos (up to 5 URLs)", type: "photos" },
    { name: "videoUrl", label: "Video URL (YouTube/Vimeo)" },
  ],
  marketplace: [
    { name: "name", label: "Item Name", required: true },
    { name: "category", label: "Category", required: true, options: ["Equipment"] },
    { name: "description", label: "Description", required: true, type: "textarea" },
    { name: "price", label: "Price (e.g. $25)", required: true },
    { name: "condition", label: "Condition", required: true, options: ["New", "Like New", "Used"] },
    { name: "city", label: "City", required: true },
    { name: "country", label: "Country", required: true, type: "country" },
    { name: "state", label: "State", required: true, type: "state-select" },
    { name: "contactEmail", label: "Contact Email", required: true, type: "email" },
    { name: "phone", label: "Phone" },
    { name: "_profile", label: "Photos", type: "heading" },
    { name: "imageUrl", label: "Main Photo", type: "image" },
    { name: "photos", label: "Additional Photos (up to 5 URLs)", type: "photos" },
  ],
  equipment: [
    { name: "name", label: "Item Name", required: true },
    { name: "description", label: "Description", required: true, type: "textarea" },
    { name: "price", label: "Price (e.g. $25)", required: true },
    { name: "condition", label: "Condition", required: true, options: ["New", "Like New", "Used"] },
    { name: "city", label: "City", required: true },
    { name: "country", label: "Country", required: true, type: "country" },
    { name: "state", label: "State", required: true, type: "state-select" },
    { name: "contactEmail", label: "Contact Email", required: true, type: "email" },
    { name: "phone", label: "Phone" },
    { name: "_profile", label: "Photos", type: "heading" },
    { name: "imageUrl", label: "Main Photo", type: "image" },
    { name: "photos", label: "Additional Photos (up to 5 URLs)", type: "photos" },
  ],
  books: [
    { name: "name", label: "Item Name", required: true },
    { name: "description", label: "Description", required: true, type: "textarea" },
    { name: "price", label: "Price (e.g. $25)", required: true },
    { name: "condition", label: "Condition", required: true, options: ["New", "Like New", "Used"] },
    { name: "city", label: "City", required: true },
    { name: "country", label: "Country", required: true, type: "country" },
    { name: "state", label: "State", required: true, type: "state-select" },
    { name: "contactEmail", label: "Contact Email", required: true, type: "email" },
    { name: "phone", label: "Phone" },
    { name: "_profile", label: "Photos", type: "heading" },
    { name: "imageUrl", label: "Main Photo", type: "image" },
    { name: "photos", label: "Additional Photos (up to 5 URLs)", type: "photos" },
  ],
  showcase: [
    { name: "name", label: "Showcase Name", required: true },
    { name: "organizerName", label: "Organizer Name", required: true },
    { name: "city", label: "City", required: true },
    { name: "country", label: "Country", required: true, type: "country" },
    { name: "state", label: "State", required: true, type: "state-select" },
    { name: "ageRange", label: "Age Range", required: true, type: "age-multi" },
    { name: "dates", label: "Dates (e.g. June 15-18, 2026)", required: true },
    { name: "price", label: "Price (e.g. $299)", required: true },
    { name: "gender", label: "Gender", required: true, options: ["Boys & Girls", "Boys", "Girls"] },
    { name: "location", label: "Location / Venue" },
    { name: "description", label: "Description", required: true, type: "textarea" },
    { name: "registrationUrl", label: "Registration URL" },
    { name: "email", label: "Contact Email", type: "email" },
    { name: "phone", label: "Phone" },
    { name: "_socials", label: "Social Media", type: "heading" },
    { name: "facebook", label: "Facebook URL" },
    { name: "instagram", label: "Instagram URL" },
    { name: "youtube", label: "YouTube URL" },
    { name: "_profile", label: "Images & Media", type: "heading" },
    { name: "teamPhoto", label: "Sidebar Image", type: "image" },
    { name: "logo", label: "Logo URL" },
    { name: "imageUrl", label: "Hero Banner Image", type: "image" },
    { name: "photos", label: "Photos (up to 5 URLs)", type: "photos" },
    { name: "videoUrl", label: "Video URL (YouTube/Vimeo)" },
  ],
  player: [
    { name: "playerName", label: "Player Name", required: true },
    { name: "position", label: "Primary Position", required: true, options: ["GK", "CB", "FB/WB", "CDM", "CM", "CAM", "Winger", "ST"] },
    { name: "secondaryPosition", label: "Secondary Position", options: ["GK", "CB", "FB/WB", "CDM", "CM", "CAM", "Winger", "ST"] },
    { name: "birthYear", label: "Birth Year", required: true, options: ["2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015", "2016"] },
    { name: "height", label: "Height (e.g. 5'8\")" },
    { name: "preferredFoot", label: "Preferred Foot", options: ["Right", "Left", "Both"] },
    { name: "currentClub", label: "Current Club" },
    { name: "city", label: "City", required: true },
    { name: "country", label: "Country", required: true, type: "country" },
    { name: "state", label: "State", required: true, type: "state-select" },
    { name: "level", label: "Level", required: true, options: ["MLS Next Pro Pathway", "MLS NEXT", "MLS NEXT 2", "Girls Academy", "ECNL", "ECNL Regional League (ECRL)", "Elite 64", "USL Academy", "Aspire", "NPL", "USYS National League", "DPL", "EDP", "SCCL", "State League", "Regional League", "Club Travel", "Rec Select", "Recreational / Grassroots", "Other"] },
    { name: "gender", label: "Gender", required: true, options: ["Boys", "Girls"] },
    { name: "gpa", label: "GPA (optional)" },
    { name: "description", label: "About the Player", type: "textarea" },
    { name: "lookingFor", label: "What opportunities are you looking for?", required: true, type: "textarea" },
    { name: "contactEmail", label: "Contact Email", required: true, type: "email" },
    { name: "phone", label: "Phone" },
    { name: "_socials", label: "Social Media", type: "heading" },
    { name: "facebook", label: "Facebook URL" },
    { name: "instagram", label: "Instagram URL" },
    { name: "youtube", label: "YouTube / Highlight Reel URL" },
    { name: "_profile", label: "Images & Media", type: "heading" },
    { name: "teamPhoto", label: "Player Photo", type: "image" },
    { name: "logo", label: "Club Logo URL" },
    { name: "imageUrl", label: "Hero Banner Image", type: "image" },
    { name: "photos", label: "Action Photos (up to 5 URLs)", type: "photos" },
    { name: "videoUrl", label: "Highlight Video 1 (YouTube/Vimeo)" },
    { name: "videoUrl2", label: "Highlight Video 2 (YouTube/Vimeo)" },
    { name: "videoUrl3", label: "Highlight Video 3 (YouTube/Vimeo)" },
  ],
  podcast: [
    { name: "name", label: "Podcast Name", required: true },
    { name: "description", label: "Description", required: true, type: "textarea" },
    { name: "website", label: "Website" },
  ],
};

const TYPE_LABELS: Record<ListingType, string> = {
  club: "Club",
  team: "Team",
  trainer: "Trainer",
  camp: "Camp",
  showcase: "College Showcase",
  guest: "Guest Play Opportunity",
  tournament: "Tournament",
  futsal: "Futsal Team",
  trip: "International Trip",
  equipment: "Equipment",
  books: "Equipment",
  marketplace: "Equipment",
  player: "Player Profile",
  podcast: "Podcast",
};

// ── Shared styles ──────────────────────────────────────────────

const inputClass = "w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent";
const selectClass = inputClass + " bg-white";

// ── Image Field ──────────────────────────────────────────────────

function ImageField({ value, defaultImage, onChange }: { value: string; defaultImage: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Image URL"
        className={inputClass}
      />
      <div className="flex items-center gap-2">
        {value && value !== defaultImage && (
          <button type="button" onClick={() => onChange(defaultImage)} className="text-xs text-accent hover:underline">
            Reset to Default
          </button>
        )}
        {!value && (
          <button type="button" onClick={() => onChange(defaultImage)} className="text-xs text-accent hover:underline">
            Use Default Image
          </button>
        )}
      </div>
      {value && (
        <img src={value} alt="Preview" className="rounded-lg max-h-40 object-cover border border-border" />
      )}
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────

interface ListingFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  mode?: "create" | "edit";
  defaultType?: ListingType;
  editType?: ListingType;
  editId?: string;
  initialData?: Record<string, string>;
  isAdmin?: boolean;
}

export function ListingForm({ onSuccess, onCancel, mode = "create", defaultType, editType, editId, initialData, isAdmin }: ListingFormProps) {
  const isEdit = mode === "edit";
  const startType = editType || defaultType || "club";
  const [type, setType] = useState<ListingType>(startType);
  const [formData, setFormData] = useState<Record<string, string>>(
    initialData || { description: DEFAULT_DESCRIPTIONS[startType], imageUrl: DEFAULT_HERO_IMAGE, teamPhoto: DEFAULT_SIDEBAR_IMAGE, country: "United States" }
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fields = FIELDS[type];

  function handleChange(name: string, value: string) {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleTypeSwitch(t: ListingType) {
    setType(t);
    setFormData({ description: DEFAULT_DESCRIPTIONS[t], imageUrl: DEFAULT_HERO_IMAGE, teamPhoto: DEFAULT_SIDEBAR_IMAGE, country: "United States" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const url = isAdmin && isEdit ? "/api/admin" : "/api/listings";
      const method = isEdit ? "PUT" : "POST";
      const body = isAdmin && isEdit
        ? JSON.stringify({ action: "updateListing", type, id: editId, data: formData })
        : isEdit
        ? JSON.stringify({ type, id: editId, data: formData })
        : JSON.stringify({ type, data: formData });

      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save listing");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Listing type selector (hidden in edit mode) */}
      {!isEdit && (
        <div>
          <label className="block text-sm font-medium mb-2">Listing Type</label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(TYPE_LABELS) as ListingType[]).filter((t) => t !== "marketplace" && t !== "books").map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTypeSwitch(t)}
                className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                  type === t
                    ? "bg-primary text-white border-primary"
                    : "bg-white border-border text-muted hover:border-primary/30"
                }`}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic fields */}
      {fields.map((field) => {
        // Section heading
        if (field.type === "heading") {
          return (
            <div key={field.name} className="pt-2 pb-1 border-b border-border">
              <h3 className="text-sm font-bold text-primary">{field.label}</h3>
            </div>
          );
        }

        return (
          <div key={field.name}>
            <label className="block text-sm font-medium mb-1">
              {field.label} {field.required && <span className="text-accent">*</span>}
            </label>

            {/* Select with options */}
            {field.options ? (
              <select
                value={formData[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
                className={selectClass}
              >
                <option value="">Select...</option>
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>{opt === "true" ? "Yes" : opt === "false" ? "No" : opt}</option>
                ))}
              </select>

            /* Country with searchable datalist */
            ) : field.type === "country" ? (
              <>
                <input
                  list="countries-list"
                  value={formData[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                  placeholder="Start typing a country..."
                  className={inputClass}
                />
                <datalist id="countries-list">
                  {COUNTRIES.map((c) => <option key={c} value={c} />)}
                </datalist>
              </>

            /* State dropdown */
            ) : field.type === "state-select" ? (
              <select
                value={formData[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
                className={selectClass}
              >
                <option value="">Select state...</option>
                {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>

            /* Single age select */
            ) : field.type === "age-select" ? (
              <select
                value={formData[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
                className={selectClass}
              >
                <option value="">Select age group...</option>
                {AGE_GROUPS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>

            /* Age range (min–max) */
            ) : field.type === "age-multi" ? (
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={(formData[field.name] || "").split("–")[0] || ""}
                  onChange={(e) => {
                    const max = (formData[field.name] || "").split("–")[1] || "";
                    handleChange(field.name, max ? `${e.target.value}–${max}` : e.target.value);
                  }}
                  required={field.required}
                  className={selectClass}
                >
                  <option value="">From...</option>
                  {AGE_GROUPS.filter((a) => a !== "All").map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
                <select
                  value={(formData[field.name] || "").split("–")[1] || ""}
                  onChange={(e) => {
                    const min = (formData[field.name] || "").split("–")[0] || "";
                    handleChange(field.name, min ? `${min}–${e.target.value}` : e.target.value);
                  }}
                  required={field.required}
                  className={selectClass}
                >
                  <option value="">To...</option>
                  {AGE_GROUPS.filter((a) => a !== "All").map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

            /* Image with default + reset */
            ) : field.type === "image" ? (
              <ImageField
                value={formData[field.name] || ""}
                defaultImage={field.name === "teamPhoto" ? DEFAULT_SIDEBAR_IMAGE : DEFAULT_HERO_IMAGE}
                onChange={(v) => handleChange(field.name, v)}
              />

            /* Photos (up to 5 URLs) */
            ) : field.type === "photos" ? (
              <div className="space-y-2">
                {Array.from({ length: Math.min(5, ((() => { try { return JSON.parse(formData[field.name] || "[]").length; } catch { return 0; } })()) + 1) }).map((_, i) => {
                  let arr: string[] = [];
                  try { arr = JSON.parse(formData[field.name] || "[]"); } catch { /* */ }
                  return (
                    <div key={i} className="flex gap-2">
                      <input
                        type="url"
                        value={arr[i] || ""}
                        onChange={(e) => {
                          const updated = [...arr];
                          updated[i] = e.target.value;
                          handleChange(field.name, JSON.stringify(updated.filter(Boolean)));
                        }}
                        placeholder={`Photo URL ${i + 1}`}
                        className={inputClass}
                      />
                      {arr[i] && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = arr.filter((_, j) => j !== i);
                            handleChange(field.name, JSON.stringify(updated));
                          }}
                          className="px-2 text-red-500 hover:text-red-700 text-lg shrink-0"
                        >
                          x
                        </button>
                      )}
                    </div>
                  );
                })}
                <p className="text-xs text-muted">Add up to 5 photo URLs</p>
              </div>

            /* Media Links (up to 5 — title + URL) */
            ) : field.type === "media-links" ? (
              <div className="space-y-3">
                {Array.from({ length: Math.min(5, ((() => { try { return JSON.parse(formData[field.name] || "[]").length; } catch { return 0; } })()) + 1) }).map((_, i) => {
                  let arr: { url: string; title?: string }[] = [];
                  try { arr = JSON.parse(formData[field.name] || "[]"); } catch { /* */ }
                  const link = arr[i] || { url: "", title: "" };
                  const updateLink = (key: string, val: string) => {
                    const updated = [...arr];
                    if (!updated[i]) updated[i] = { url: "", title: "" };
                    (updated[i] as Record<string, string>)[key] = val;
                    const filtered = updated.filter((l) => l.url || l.title);
                    handleChange(field.name, JSON.stringify(filtered));
                  };
                  return (
                    <div key={i} className="flex gap-2 items-start">
                      <div className="flex-1 space-y-1.5">
                        <input
                          type="text"
                          value={link.title || ""}
                          onChange={(e) => updateLink("title", e.target.value)}
                          placeholder="Link title (e.g. WRAL Feature Story)"
                          className={inputClass}
                        />
                        <input
                          type="url"
                          value={link.url || ""}
                          onChange={(e) => updateLink("url", e.target.value)}
                          placeholder="https://example.com/article"
                          className={inputClass}
                        />
                      </div>
                      {(link.url || link.title) && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = arr.filter((_, j) => j !== i);
                            handleChange(field.name, JSON.stringify(updated));
                          }}
                          className="px-2 text-red-500 hover:text-red-700 text-lg shrink-0 mt-2"
                        >
                          x
                        </button>
                      )}
                    </div>
                  );
                })}
                <p className="text-xs text-muted">Add a title and URL for each media link</p>
              </div>

            /* Events (up to 5) */
            ) : field.type === "events" ? (
              <div className="space-y-3">
                {Array.from({ length: Math.min(5, ((() => { try { return JSON.parse(formData[field.name] || "[]").length; } catch { return 0; } })()) + 1) }).map((_, i) => {
                  let arr: { name: string; date: string; location: string; type: string }[] = [];
                  try { arr = JSON.parse(formData[field.name] || "[]"); } catch { /* */ }
                  const ev = arr[i] || { name: "", date: "", location: "", type: "" };
                  const updateEvent = (key: string, val: string) => {
                    const updated = [...arr];
                    if (!updated[i]) updated[i] = { name: "", date: "", location: "", type: "" };
                    (updated[i] as Record<string, string>)[key] = val;
                    const filtered = updated.filter((e) => e.name || e.date || e.location || e.type);
                    handleChange(field.name, JSON.stringify(filtered));
                  };
                  return (
                    <div key={i} className="grid grid-cols-2 gap-2 p-3 rounded-xl border border-border bg-surface">
                      <input type="text" value={ev.name} onChange={(e) => updateEvent("name", e.target.value)} placeholder="Event Name" className={inputClass} />
                      <input type="text" value={ev.date} onChange={(e) => updateEvent("date", e.target.value)} placeholder="Date (e.g. March 15, 2026)" className={inputClass} />
                      <input type="text" value={ev.location} onChange={(e) => updateEvent("location", e.target.value)} placeholder="Location" className={inputClass} />
                      <select value={ev.type} onChange={(e) => updateEvent("type", e.target.value)} className={inputClass + " bg-white"}>
                        <option value="">Event Type...</option>
                        <option value="Tryout">Tryout</option>
                        <option value="Tournament">Tournament</option>
                        <option value="Showcase">Showcase</option>
                        <option value="Training Session">Training Session</option>
                      </select>
                    </div>
                  );
                })}
                <p className="text-xs text-muted">Add up to 5 upcoming events</p>
              </div>

            /* Tournament list (up to 10 names) */
            ) : field.type === "tournament-list" ? (
              <div className="space-y-2">
                {Array.from({ length: Math.min(10, ((() => { try { return JSON.parse(formData[field.name] || "[]").length; } catch { return 0; } })()) + 1) }).map((_, i) => {
                  let arr: string[] = [];
                  try { arr = JSON.parse(formData[field.name] || "[]"); } catch { /* */ }
                  return (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={arr[i] || ""}
                        onChange={(e) => {
                          const updated = [...arr];
                          updated[i] = e.target.value;
                          handleChange(field.name, JSON.stringify(updated.filter(Boolean)));
                        }}
                        placeholder={`Tournament name ${i + 1}`}
                        className={inputClass}
                      />
                      {arr[i] && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = arr.filter((_, j) => j !== i);
                            handleChange(field.name, JSON.stringify(updated));
                          }}
                          className="px-2 text-red-500 hover:text-red-700 text-lg shrink-0"
                        >
                          x
                        </button>
                      )}
                    </div>
                  );
                })}
                <p className="text-xs text-muted">Add tournament names your team competes in annually</p>
              </div>

            /* Practice schedule checkboxes */
            ) : field.type === "schedule" ? (
              <div className="flex flex-wrap gap-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                  let days: string[] = [];
                  try { days = JSON.parse(formData[field.name] || "[]"); } catch { /* */ }
                  const active = days.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        const updated = active ? days.filter((d) => d !== day) : [...days, day];
                        handleChange(field.name, JSON.stringify(updated));
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        active
                          ? "bg-accent text-white border-accent"
                          : "bg-white border-border text-muted hover:border-accent/30"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

            /* Positions selector */
            ) : field.type === "positions" ? (
              <div className="flex flex-wrap gap-2">
                {SOCCER_POSITIONS.map((pos) => {
                  const current = formData[field.name] || "";
                  const isAll = current === "All Positions";
                  const selected = isAll ? pos === "All Positions" : current.split(", ").includes(pos);
                  return (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => {
                        if (pos === "All Positions") {
                          handleChange(field.name, isAll ? "" : "All Positions");
                        } else {
                          const parts = current === "All Positions" ? [] : current.split(", ").filter(Boolean);
                          const updated = selected ? parts.filter((p) => p !== pos) : [...parts, pos];
                          handleChange(field.name, updated.join(", "));
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                        selected
                          ? "bg-accent text-white border-accent"
                          : "bg-white border-border text-muted hover:border-accent/30"
                      }`}
                    >
                      {pos}
                    </button>
                  );
                })}
              </div>

            /* Textarea */
            ) : field.type === "textarea" ? (
              <textarea
                value={formData[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
                rows={4}
                className={inputClass + " resize-none"}
              />

            /* Logo URL with preview */
            ) : field.name === "logo" ? (
              <div className="space-y-2">
                <input
                  type="url"
                  value={formData[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className={inputClass}
                />
                {formData[field.name] && (
                  <img
                    src={formData[field.name]}
                    alt="Logo preview"
                    className="h-16 w-16 rounded-lg object-contain border border-border"
                  />
                )}
              </div>

            /* Default text/email/number input */
            ) : (
              <input
                type={field.type || "text"}
                value={formData[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.required}
                className={inputClass}
              />
            )}
          </div>
        );
      })}

      {error && <p className="text-accent text-sm">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {submitting ? "Saving..." : isEdit ? "Save Changes" : `Create ${TYPE_LABELS[type]}`}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 rounded-xl border border-border font-semibold text-muted hover:bg-surface transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
