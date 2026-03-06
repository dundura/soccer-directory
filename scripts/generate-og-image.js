const sharp = require("sharp");
const path = require("path");

async function main() {
  const width = 1200;
  const height = 630;

  // Create SVG with the text overlay
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0F3154;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1a4a7a;stop-opacity:1" />
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="${width}" height="${height}" fill="url(#bg)" />

      <!-- Right side: semi-transparent photo overlay area -->
      <rect x="550" y="0" width="650" height="${height}" fill="#0F3154" opacity="0.3" rx="0" />

      <!-- Decorative circles -->
      <circle cx="900" cy="200" r="180" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="2" />
      <circle cx="1000" cy="400" r="120" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="2" />
      <circle cx="750" cy="500" r="80" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="2" />

      <!-- Card mockups on right -->
      <g transform="translate(680, 80)">
        <rect width="280" height="120" rx="16" fill="white" filter="drop-shadow(0 4px 12px rgba(0,0,0,0.15))" />
        <text x="20" y="35" font-family="Arial, sans-serif" font-weight="bold" font-size="16" fill="#1a365d">Charlotte FC 2012</text>
        <rect x="20" y="50" width="48" height="22" rx="11" fill="#dbeafe" />
        <text x="30" y="65" font-family="Arial, sans-serif" font-size="11" font-weight="600" fill="#2563eb">Boys</text>
        <rect x="76" y="50" width="76" height="22" rx="11" fill="#fef3c7" />
        <text x="86" y="65" font-family="Arial, sans-serif" font-size="11" font-weight="600" fill="#d97706">Recruiting</text>
        <text x="20" y="100" font-family="Arial, sans-serif" font-size="13" fill="#6b7280">Charlotte, NC</text>
        <rect x="220" y="15" width="42" height="42" rx="8" fill="#f0f9ff" />
        <text x="228" y="42" font-family="Arial, sans-serif" font-weight="bold" font-size="14" fill="#2563eb">2012</text>
      </g>

      <g transform="translate(780, 360)">
        <rect width="280" height="120" rx="16" fill="white" filter="drop-shadow(0 4px 12px rgba(0,0,0,0.15))" />
        <text x="20" y="35" font-family="Arial, sans-serif" font-weight="bold" font-size="16" fill="#1a365d">NC Fusion ECNL</text>
        <rect x="20" y="50" width="48" height="22" rx="11" fill="#fce7f3" />
        <text x="30" y="65" font-family="Arial, sans-serif" font-size="11" font-weight="600" fill="#db2777">Girls</text>
        <rect x="76" y="50" width="52" height="22" rx="11" fill="#f3f4f6" />
        <text x="86" y="65" font-family="Arial, sans-serif" font-size="11" font-weight="600" fill="#374151">ECNL</text>
        <text x="20" y="100" font-family="Arial, sans-serif" font-size="13" fill="#6b7280">Greensboro, NC</text>
        <rect x="220" y="15" width="42" height="42" rx="8" fill="#f0f9ff" />
        <text x="228" y="42" font-family="Arial, sans-serif" font-weight="bold" font-size="14" fill="#2563eb">2011</text>
      </g>

      <!-- Soccer ball icon -->
      <circle cx="680" cy="280" r="25" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2" />
      <circle cx="680" cy="280" r="8" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" />

      <!-- Main title: "Soccer" in white, "Near Me" in red, no gap -->
      <text x="80" y="260" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="72" fill="white">Soccer<tspan fill="#DC373E">Near Me</tspan></text>

      <!-- Subtitle -->
      <text x="80" y="320" font-family="Arial, sans-serif" font-size="22" fill="rgba(255,255,255,0.7)">Find Youth Soccer Teams, Clubs,</text>
      <text x="80" y="352" font-family="Arial, sans-serif" font-size="22" fill="rgba(255,255,255,0.7)">Camps &amp; Trainers Near You</text>
    </svg>
  `;

  const outputPath = path.join(__dirname, "..", "public", "og-image.png");

  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);

  console.log(`Generated OG image at: ${outputPath}`);
}

main().catch(console.error);
