const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);

const content = `<!-- BULLS RUSH FC - CLUB SPOTLIGHT -->
<style>
.ast-success-widget { font-family: Georgia, serif; line-height: 1.8; color: #1F4E79; max-width: 100%; margin: 0 auto; }
.ast-success-widget p { color: #1F4E79; margin-bottom: 30px; line-height: 1.9; }
.ast-success-widget h2 + p, .ast-success-widget h3 + p, .ast-success-widget h4 + p { margin-top: 20px; }
.ast-success-widget .action-box p, .ast-success-widget .highlight-box p, .ast-success-widget .warning-box p, .ast-success-widget .testimonial-box p { margin-bottom: 20px; }
.ast-success-widget h1, .ast-success-widget h2, .ast-success-widget h3, .ast-success-widget h4 { color: #1F4E79 !important; font-weight: bold; }
.ast-success-widget h1 { font-size: 2.5em; line-height: 1.3; margin-bottom: 20px; }
.ast-success-widget h2 { font-size: 1.8em; margin-top: 50px; margin-bottom: 25px; }
.ast-success-widget h3 { font-size: 1.4em; margin-top: 35px; margin-bottom: 20px; }
.ast-success-widget h4 { font-size: 1.2em; margin-top: 25px; margin-bottom: 15px; }
.ast-success-widget .category-tag { display: inline-block; background-color: #DC373E; color: white; padding: 8px 16px; font-size: 0.85em; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
.ast-success-widget table { width: 100%; border-collapse: collapse; margin: 30px 0; font-size: 0.95em; border: 1px solid #ddd; }
.ast-success-widget thead tr { background-color: #1F4E79; color: white; text-align: left; }
.ast-success-widget th { padding: 12px; text-align: left; font-weight: bold; color: white; }
.ast-success-widget td { padding: 12px; border-bottom: 1px solid #ddd; color: #1F4E79; }
.ast-success-widget tbody tr:nth-child(even) { background-color: #f9f9f9; }
.ast-success-widget .highlight-box { background-color: #fffbf0; border-left: 4px solid #DC373E; padding: 20px; margin: 30px 0; }
.ast-success-widget .action-box { background-color: #f0f8ff; border: 2px solid #1F4E79; padding: 20px; margin: 30px 0; border-radius: 5px; }
.ast-success-widget .testimonial-box { background-color: #f9f9f9; border-left: 4px solid #1F4E79; padding: 25px; margin: 30px 0; font-style: italic; }
.ast-success-widget .stat-highlight { font-weight: bold; color: #DC373E; font-size: 1.1em; }
.ast-success-widget ul, .ast-success-widget ol { margin: 15px 0 25px 0; padding-left: 30px; }
.ast-success-widget li { margin: 10px 0; color: #1F4E79; }
.ast-success-widget strong { color: #1F4E79; font-weight: bold; }
.ast-success-widget a { color: #DC373E; text-decoration: none; font-weight: bold; }
.ast-success-widget a:hover { text-decoration: underline; }
.ast-success-widget .quote-author { font-style: normal; font-weight: bold; color: #1F4E79; margin-top: 10px; margin-bottom: 0; }
</style>

<div class="ast-success-widget">

    <div class="category-tag">FEATURED CLUB SPOTLIGHT</div>

    <h1>Bulls Rush FC: How a Small-Town Georgia Club Became the Largest Competitive Soccer Program in the CSRA</h1>

    <div class="action-box" style="margin-top: 0;">
        <h4 style="margin-top: 0;">View Bulls Rush FC on Soccer Near Me</h4>
        <p style="margin-bottom: 0;"><a href="https://www.soccer-near-me.com/clubs/bulls-rush-fc" target="_blank">View the full Bulls Rush FC profile &rarr;</a></p>
    </div>

    <div class="action-box" style="margin-top: 20px;">
        <h4 style="margin-top: 0;">What does it take to build a 50-team soccer club from the ground up?</h4>
        <p style="margin-bottom: 0;">In the Augusta, Georgia metro area, the answer has been <strong>Bulls Rush FC</strong> &mdash; a club born from the merger of three local programs that has grown into the <strong>largest competitive soccer club in the Central Savannah River Area (CSRA)</strong>. With 50 teams spanning U7 through U19, a partnership with the globally recognized <strong>Rush Soccer</strong> network, and a coaching philosophy that puts <strong>player development and family first</strong>, Bulls Rush FC is rewriting what youth soccer looks like in the Southeast.</p>
    </div>

    <h2>The Origin Story: Three Clubs Become One</h2>

    <p><strong>Bulls Soccer Club</strong> was founded in <strong>2008</strong> through the combination of three local programs: <strong>Columbia County Patriots</strong>, <strong>Aiken SC</strong>, and <strong>North Augusta Kicks</strong>. The merger brought together the best coaching talent, player pools, and organizational resources from across the CSRA, creating a single club with the scale and ambition to compete at a regional and national level.</p>

    <p>From the beginning, the Bulls were built on a simple premise: every player in the region deserves access to high-quality coaching and competitive soccer, regardless of their starting point. That founding principle has never changed.</p>

    <p>In <strong>April 2025</strong>, the club took a transformative step forward by affiliating with <strong>Rush Soccer</strong>, officially becoming <strong>Bulls Rush FC</strong>. The Rush partnership brought global resources, proven development methodology, and a network that has produced <span class="stat-highlight">over 91 professional soccer players</span> in its 25-year history.</p>

    <div class="highlight-box">
        <h4 style="margin-top: 0;">From Local Roots to Global Network</h4>
        <p style="margin-bottom: 0;">The Bulls didn&rsquo;t abandon their identity when they joined Rush &mdash; they elevated it. The club retained its local leadership, community connections, and player-first culture while gaining access to Rush&rsquo;s <span class="stat-highlight">national-level programming, college advisory services, international travel experiences, and elite coaching curriculum</span>. It&rsquo;s the best of both worlds: a hometown club with a global platform.</p>
    </div>

    <h2>At a Glance: Bulls Rush FC</h2>

    <table>
        <thead>
            <tr><th>Category</th><th>Details</th></tr>
        </thead>
        <tbody>
            <tr><td><strong>Club Name</strong></td><td>Bulls Rush FC</td></tr>
            <tr><td><strong>Affiliation</strong></td><td>Rush Soccer (since April 2025)</td></tr>
            <tr><td><strong>Teams</strong></td><td>50</td></tr>
            <tr><td><strong>Age Groups</strong></td><td>U7 &ndash; U19</td></tr>
            <tr><td><strong>Gender</strong></td><td>Boys &amp; Girls</td></tr>
            <tr><td><strong>Level</strong></td><td>USYS National League / Piedmont Conference SCYS</td></tr>
            <tr><td><strong>Location</strong></td><td>3685 Riverwatch Parkway, Suite 145, Martinez, GA 30907</td></tr>
            <tr><td><strong>Founded</strong></td><td>2008</td></tr>
            <tr><td><strong>Website</strong></td><td><a href="https://www.ga-scbulls.com/" target="_blank">ga-scbulls.com</a></td></tr>
            <tr><td><strong>Director of Coaching</strong></td><td>Andrew Hammer (<a href="mailto:ahammer@bullsrushfc.com">ahammer@bullsrushfc.com</a>)</td></tr>
            <tr><td><strong>Director of Operations</strong></td><td>Kim Briggs (<a href="mailto:kbriggs@bullsrushfc.com">kbriggs@bullsrushfc.com</a>)</td></tr>
            <tr><td><strong>Phone</strong></td><td>706-550-2858</td></tr>
        </tbody>
    </table>

    <h2>The Vision: Soccer as the Ultimate Sports Activity</h2>

    <p>Bulls Rush FC&rsquo;s vision statement is bold and unapologetic: <strong>promote soccer as the ultimate sports activity</strong> by providing knowledge, services, and opportunities for everyone in the club to have fun and thrive in the beautiful game.</p>

    <p>This isn&rsquo;t a club that views soccer as just another youth sport to fill a season. The Bulls believe soccer is the <strong>most complete development tool</strong> available to young athletes &mdash; a sport that builds physical fitness, mental toughness, problem-solving ability, teamwork, and character in ways that few other activities can match.</p>

    <div class="testimonial-box">
        <p>&ldquo;Bulls Rush FC is committed to the pursuit of excellence for our families by providing the highest level of coaching. Our goal is to develop well-rounded people whose academic and playing abilities enable them to achieve their highest potential in life.&rdquo;</p>
        <p class="quote-author">&mdash; Bulls Rush FC Mission Statement</p>
    </div>

    <h2>The Mission: Start with the Individual Person</h2>

    <p>What separates Bulls Rush FC from many youth soccer clubs is where they start: <strong>with the individual person</strong>. Not the player. Not the position. Not the team. The <em>person</em>.</p>

    <p>This philosophy is more than a tagline. It&rsquo;s the operational framework for everything the club does. From the way coaches run training sessions to the way the organization communicates with families, the starting point is always the same: <strong>who is this young person, and how can we help them reach their highest potential &mdash; in soccer and in life?</strong></p>

    <p>The club&rsquo;s mission statement makes this explicit: programs are designed to assist every player to develop to their highest potential <strong>through soccer and as a person</strong>. The distinction matters. Soccer is the vehicle, not the destination. The destination is a well-rounded human being who happens to be really good at the beautiful game.</p>

    <h2>Seven Core Values That Drive Everything</h2>

    <p>Bulls Rush FC operates on seven core values that serve as the foundation for every decision, interaction, and program within the club:</p>

    <h3>1. Fun</h3>

    <p>It starts here. If players aren&rsquo;t enjoying themselves, nothing else matters. The Bulls believe that the love of the game is the most powerful development tool &mdash; and that fun and competitive excellence are not mutually exclusive. Players who love what they do train harder, stay longer, and develop faster.</p>

    <h3>2. Family</h3>

    <p>Youth soccer doesn&rsquo;t happen in a vacuum. It happens within families &mdash; families that drive to practice, sit in the rain on weekends, and navigate the emotional highs and lows of competitive sports. Bulls Rush FC is committed to supporting the <strong>entire family unit</strong>, not just the player on the field. When families feel valued and informed, players thrive.</p>

    <h3>3. Community</h3>

    <p>The club exists to improve not just its own players, but the broader <strong>community of the CSRA</strong>. That means investing in coaching education, supporting referees, and being a positive force in the Augusta metro area. Soccer clubs have an outsized impact on local communities &mdash; the Bulls take that responsibility seriously.</p>

    <h3>4. Inclusion</h3>

    <p>Every player who wants to play soccer should have a place. Bulls Rush FC offers programs from <strong>non-travel recreational teams to nationally competitive squads</strong>, ensuring that the club serves players at every level of ability and ambition. The pathway is open to all.</p>

    <h3>5. Loyalty</h3>

    <p>Building a great soccer club requires commitment &mdash; from players, from families, from coaches, and from the organization itself. The Bulls value loyalty as a two-way street: the club invests in its people, and its people invest in the club. This mutual commitment creates the stability that long-term development requires.</p>

    <h3>6. Perseverance</h3>

    <p>Soccer teaches perseverance like few other sports can. A 90-minute match is filled with setbacks, mistakes, and moments of frustration. Learning to push through adversity on the field directly translates to resilience in life. The Bulls don&rsquo;t shy away from difficult moments &mdash; they use them as teaching opportunities.</p>

    <h3>7. Integrity</h3>

    <p>Do the right thing, even when no one is watching. This applies to how the club operates, how coaches conduct themselves, and how players represent the Bulls Rush FC badge. Integrity isn&rsquo;t negotiable.</p>

    <div class="highlight-box">
        <h4 style="margin-top: 0;">Values in Action</h4>
        <p style="margin-bottom: 0;">These aren&rsquo;t poster words. Bulls Rush FC&rsquo;s core values &mdash; <span class="stat-highlight">Fun, Family, Community, Inclusion, Loyalty, Perseverance, and Integrity</span> &mdash; are actively reinforced in training sessions, team meetings, parent communications, and organizational decisions. They&rsquo;re the filter through which every choice is made.</p>
    </div>

    <h2>The Rush Soccer Advantage</h2>

    <p>When Bulls Rush FC affiliated with <strong>Rush Soccer</strong> in April 2025, the club gained access to one of the most powerful development platforms in American &mdash; and global &mdash; youth soccer. Rush Soccer&rsquo;s track record speaks for itself:</p>

    <ul>
        <li><span class="stat-highlight">25 years</span> of player development experience</li>
        <li><span class="stat-highlight">91+ professional players</span> produced across MLS, NWSL, international leagues, and the World Cup stage</li>
        <li>A global network of affiliated clubs across the United States and internationally</li>
        <li>A proven, player-centered methodology that prioritizes long-term development over short-term results</li>
    </ul>

    <h3>Rush Select</h3>

    <p>The <strong>Rush Select</strong> program forms All-Star teams from the top Rush players across all domestic and international branches in the U13&ndash;U19 age groups. For elite Bulls Rush FC players, this means the opportunity to compete nationally and internationally alongside the best talent in the Rush network &mdash; an experience that accelerates development and opens doors that local competition alone cannot.</p>

    <h3>College Advisory Program (CAP)</h3>

    <p>Rush&rsquo;s <strong>College Advisory Program</strong> is an in-depth resource that gives players support and guidance through the college recruitment process. Whether a player plans to play collegiate soccer or not, CAP helps families navigate academics, recruiting timelines, showcases, and the complex landscape of college athletics. For Bulls Rush FC families in the Augusta area, this is a game-changing resource.</p>

    <h3>Rush Travel</h3>

    <p><strong>Rush Travel</strong> organizes international soccer experiences across Europe and Central America. Each trip is custom-designed to create great value and meet specific development goals. For Bulls Rush FC players, this means the chance to experience soccer cultures abroad &mdash; training with international clubs, competing in overseas tournaments, and broadening their perspective on the global game.</p>

    <h3>Rush Fest</h3>

    <p><strong>Rush Fest</strong> is a five-day, Rush-specific soccer camp held in Colorado. Widely regarded as one of the best programs Rush offers for the U12 age group, Rush Fest combines elite training, competition, and the camaraderie of being part of a nationwide soccer community.</p>

    <div class="action-box">
        <h4 style="margin-top: 0;">The Rush Promise</h4>
        <p style="margin-bottom: 0;"><strong>Accountability. Advice. Empathy. Enjoyment. Humility. Leadership. Passion. Respect. Safety. Tenacity. Unity.</strong> &mdash; These are the principles that guide every Rush Soccer affiliate, including Bulls Rush FC. The partnership isn&rsquo;t just a logo on a jersey. It&rsquo;s a commitment to a standard of excellence that elevates every aspect of the club experience.</p>
    </div>

    <h2>50 Teams, One Philosophy: Player Development at Every Level</h2>

    <p>With <span class="stat-highlight">50 teams spanning U7 through U19</span>, Bulls Rush FC is one of the largest youth soccer organizations in Georgia. But size alone doesn&rsquo;t define the club &mdash; what defines it is the consistency of the development philosophy across every age group and competitive level.</p>

    <h3>Competitive Teams</h3>

    <p>Bulls Rush FC&rsquo;s competitive teams compete in the <strong>USYS National League</strong> and the <strong>Piedmont Conference (SCYS)</strong>. These teams are coached by licensed, trained staff who follow the Rush development curriculum, ensuring that players receive a progressive, age-appropriate training experience that builds technical ability, tactical understanding, and competitive mentality.</p>

    <h3>Non-Travel / Recreational Teams</h3>

    <p>Not every player is ready for &mdash; or interested in &mdash; competitive travel soccer. Bulls Rush FC&rsquo;s non-travel program provides a fun, supportive environment for players who want to learn the game, develop skills, and enjoy soccer without the commitment of a full travel schedule. This is where many Bulls players discover their love for the game before deciding whether to pursue the competitive pathway.</p>

    <h3>Training &amp; Camps</h3>

    <p>Beyond team programming, Bulls Rush FC offers training sessions and camps throughout the year. These programs supplement team training and provide additional development opportunities for players looking to accelerate their growth. The club also leverages Rush Soccer&rsquo;s extensive library of <strong>training plans, position-specific courses, and Train @ Home resources</strong>.</p>

    <h2>Coaching: The Bloodline of Bulls Rush FC</h2>

    <p>Director of Coaching <strong>Andrew Hammer</strong> has been vocal about the role coaches play in the club&rsquo;s culture and development model. In his own words, <strong>&ldquo;coaches are the bloodline of Bulls Rush FC.&rdquo;</strong></p>

    <p>This isn&rsquo;t empty rhetoric. The club invests heavily in coach education, development, and support. Rush Soccer&rsquo;s Development Program provides coaches with an ever-growing library of training plans, learning videos, and coaching resources. The expectation is that coaches are constantly improving alongside their players.</p>

    <p>The coaching philosophy at Bulls Rush FC centers on a few key principles:</p>

    <ul>
        <li><strong>Start with the person</strong> &mdash; understand each player as an individual before coaching them as an athlete</li>
        <li><strong>Prioritize development over results</strong> &mdash; especially at younger ages, learning takes precedence over winning</li>
        <li><strong>Be patient with the process</strong> &mdash; development is not linear, and results often lag behind growth</li>
        <li><strong>Create environments where players can fail safely</strong> &mdash; mistakes are learning opportunities, not punishable offenses</li>
        <li><strong>Educate families</strong> &mdash; when parents understand the development journey, everyone benefits</li>
    </ul>

    <div class="testimonial-box">
        <p>&ldquo;Development is rarely linear. Players don&rsquo;t improve in straight lines. Confidence, decision-making, awareness, and understanding often lag behind effort. There are moments where a player looks like they&rsquo;ve taken two steps forward, followed by a weekend where it feels like they&rsquo;ve taken three steps back. That doesn&rsquo;t mean development isn&rsquo;t happening. It means the process is doing what it&rsquo;s supposed to do &mdash; challenging the player.&rdquo;</p>
        <p class="quote-author">&mdash; Andrew Hammer, Director of Coaching, Bulls Rush FC</p>
    </div>

    <h2>When Development Doesn&rsquo;t Match the Scoreboard</h2>

    <p>One of the most powerful aspects of Bulls Rush FC&rsquo;s culture is its willingness to have honest conversations about the gap between development and results. Director of Coaching Andrew Hammer has addressed this directly in his weekly blog, and the message resonates deeply with families navigating the emotional rollercoaster of youth soccer.</p>

    <p>The reality is that <strong>development and winning don&rsquo;t always happen on the same timeline</strong>. A player on a third or fourth team facing bigger, faster opponents may be losing games while simultaneously making enormous developmental strides. The scoreboard doesn&rsquo;t capture the decision that was made a half-second faster, the positioning that was slightly better, or the confidence that&rsquo;s slowly building underneath the surface.</p>

    <p>At Bulls Rush FC, the coaching staff measures progress differently:</p>

    <ul>
        <li>Is the player more <strong>confident</strong> than they were last month?</li>
        <li>Are they making <strong>better decisions</strong>, even if mistakes still happen?</li>
        <li>Are they beginning to understand <strong>spacing, positioning, and roles</strong>?</li>
        <li>Are they showing <strong>resilience</strong> in tough moments?</li>
        <li>Are they willing to <strong>try, fail, and try again</strong>?</li>
    </ul>

    <div class="highlight-box">
        <h4 style="margin-top: 0;">The Long View</h4>
        <p style="margin-bottom: 0;">&ldquo;Youth soccer is not about being the best at 9, 11, or even 13 years old. It&rsquo;s about who is still developing, confident, and motivated at 16, 17, and 18.&rdquo; &mdash; This philosophy is central to how Bulls Rush FC approaches player development. <span class="stat-highlight">Struggle doesn&rsquo;t lower a player&rsquo;s ceiling. Avoiding struggle often does.</span></p>
    </div>

    <h2>The Player-First Manifesto</h2>

    <p>Bulls Rush FC has articulated what they call a <strong>&ldquo;Player-First Manifesto&rdquo;</strong> &mdash; a clear declaration that every decision, policy, and program within the club is evaluated through the lens of what&rsquo;s best for the player. Not what&rsquo;s most convenient for the organization. Not what generates the most revenue. Not what satisfies the loudest voices. <strong>What&rsquo;s best for the player.</strong></p>

    <p>This manifesto guides decisions on:</p>

    <ul>
        <li><strong>Team placement</strong> &mdash; players are placed where they&rsquo;ll develop best, not where it&rsquo;s easiest</li>
        <li><strong>Playing time</strong> &mdash; meaningful minutes are prioritized for development</li>
        <li><strong>Coaching decisions</strong> &mdash; learning takes precedence over short-term results</li>
        <li><strong>Club culture</strong> &mdash; the environment is built around what players need to thrive</li>
    </ul>

    <h2>Attention to Detail: The Rush Standard</h2>

    <p>One of the hallmarks of the Rush Soccer organization &mdash; and by extension, Bulls Rush FC &mdash; is an obsessive <strong>attention to detail</strong>. From tryouts to travel and everything in between, every aspect of the club is approached with meticulous care.</p>

    <p>This means:</p>

    <ul>
        <li>Tryout processes that are fair, transparent, and player-focused</li>
        <li>Training sessions that are planned with clear objectives and progressions</li>
        <li>Tournament logistics that are handled professionally so families can focus on the game</li>
        <li>Communication that is clear, timely, and respectful</li>
        <li>A proactive approach to potential challenges &mdash; having a plan before problems arise</li>
    </ul>

    <p>As Rush Soccer puts it: <strong>&ldquo;We refuse to settle for mediocrity. Our commitment to excellence provides an unparalleled soccer experience to everyone involved.&rdquo;</strong></p>

    <h2>Serving the CSRA: More Than Just Players</h2>

    <p>Bulls Rush FC&rsquo;s mission extends beyond the players on their rosters. The club is committed to improving <strong>players, families, coaches, referees, and the entire community of the CSRA</strong> through the game of soccer.</p>

    <p>This community-first approach manifests in several ways:</p>

    <ul>
        <li><strong>Hosting tournaments</strong> that bring economic activity and soccer culture to the Augusta metro area</li>
        <li><strong>Investing in coaching education</strong> that raises the standard of youth soccer instruction across the region</li>
        <li><strong>Supporting referee development</strong> &mdash; recognizing that the game needs quality officials to thrive</li>
        <li><strong>Providing inclusive programming</strong> from recreational to elite levels, ensuring no player is left behind</li>
    </ul>

    <h2>Leadership: The People Behind the Bulls</h2>

    <h3>Andrew Hammer &mdash; Executive Director &amp; Director of Coaching</h3>

    <p>Andrew Hammer serves as both the Executive Director and Director of Coaching for Bulls Rush FC. His weekly blog series has become a must-read for Bulls families, covering topics from development philosophy to the emotional realities of youth soccer parenting. Hammer&rsquo;s player-first approach and transparent communication style have helped build deep trust between the club and its community.</p>

    <h3>Kim Briggs &mdash; Director of Operations &amp; Club Registrar</h3>

    <p>Kim Briggs manages the operational backbone of Bulls Rush FC, ensuring that the club&rsquo;s 50 teams run smoothly across registrations, scheduling, communications, and logistics. Behind every well-organized practice and seamless tournament weekend is the operational infrastructure that Briggs has built.</p>

    <h2>Why Families in the CSRA Choose Bulls Rush FC</h2>

    <ol>
        <li><strong>The largest competitive club in the CSRA</strong> &mdash; 50 teams means the right level and environment for every player</li>
        <li><strong>Rush Soccer affiliation</strong> &mdash; access to a global network, proven methodology, and 91+ professional player alumni</li>
        <li><strong>Player-first philosophy</strong> &mdash; every decision is made through the lens of what&rsquo;s best for development</li>
        <li><strong>Programs for every level</strong> &mdash; from recreational non-travel to nationally competitive teams</li>
        <li><strong>College Advisory Program</strong> &mdash; expert guidance through the college recruitment process</li>
        <li><strong>Rush Select opportunities</strong> &mdash; elite players compete nationally and internationally</li>
        <li><strong>International travel experiences</strong> &mdash; custom trips to Europe and Central America</li>
        <li><strong>Core values that matter</strong> &mdash; Fun, Family, Community, Inclusion, Loyalty, Perseverance, Integrity</li>
        <li><strong>Transparent, communicative leadership</strong> &mdash; a Director of Coaching who publishes weekly insights for families</li>
        <li><strong>Community impact</strong> &mdash; committed to improving the entire CSRA soccer ecosystem</li>
    </ol>

    <div class="highlight-box">
        <h4 style="margin-top: 0;">The Bottom Line</h4>
        <p style="margin-bottom: 0;">Bulls Rush FC has spent nearly two decades building something special in the Augusta, Georgia metro area. From a merger of three small clubs to a <span class="stat-highlight">50-team organization affiliated with one of the most recognized brands in global soccer</span>, the Bulls have proven that world-class youth soccer development doesn&rsquo;t require a big-city address. What it requires is <strong>the right people, the right values, and an unwavering commitment to putting players first</strong>. Bulls Rush FC has all three.</p>
    </div>

    <h2>Find Bulls Rush FC on Soccer Near Me</h2>

    <div class="action-box">
        <p style="margin-bottom: 10px;"><strong><a href="https://www.soccer-near-me.com/clubs/bulls-rush-fc" target="_blank">View Bulls Rush FC on Soccer Near Me &rarr;</a></strong></p>
        <p style="margin-bottom: 10px;"><strong><a href="https://www.ga-scbulls.com/" target="_blank">Visit the Bulls Rush FC Website &rarr;</a></strong></p>
        <p style="margin-bottom: 10px;">Contact Director of Coaching Andrew Hammer: <a href="mailto:ahammer@bullsrushfc.com">ahammer@bullsrushfc.com</a></p>
        <p style="margin-bottom: 10px;">Contact Director of Operations Kim Briggs: <a href="mailto:kbriggs@bullsrushfc.com">kbriggs@bullsrushfc.com</a></p>
        <p style="margin-bottom: 0;">Phone: <strong>706-550-2858</strong> | 3685 Riverwatch Parkway, Suite 145, Martinez, GA 30907</p>
    </div>

</div>`;

(async () => {
  const existing = await sql`SELECT id FROM blog_posts WHERE slug = 'bulls-rush-fc-augusta-georgia-rush-soccer'`;
  if (existing.length > 0) {
    console.log('Already exists, updating...');
    await sql`UPDATE blog_posts SET content = ${content}, cover_image = 'https://media.anytime-soccer.com/wp-content/uploads/2026/02/bull_rush.jpg' WHERE slug = 'bulls-rush-fc-augusta-georgia-rush-soccer'`;
    console.log('Updated');
    return;
  }

  const result = await sql`INSERT INTO blog_posts (id, slug, title, excerpt, content, category, date, read_time, featured, cover_image)
    VALUES (
      'b15',
      'bulls-rush-fc-augusta-georgia-rush-soccer',
      'Bulls Rush FC: How a Small-Town Georgia Club Became the Largest Competitive Soccer Program in the CSRA',
      'From a 2008 merger of three local clubs to a 50-team Rush Soccer affiliate, Bulls Rush FC in Augusta, GA has built one of the most comprehensive youth soccer programs in the Southeast. Here is their story.',
      ${content},
      'Club Spotlight',
      'Feb 28, 2026',
      '16 min',
      false,
      'https://media.anytime-soccer.com/wp-content/uploads/2026/02/bull_rush.jpg'
    ) RETURNING id, slug, title`;
  console.log('Created:', JSON.stringify(result[0]));

  const update = await sql`UPDATE clubs SET blog_url = '/blog/bulls-rush-fc-augusta-georgia-rush-soccer' WHERE slug = 'bulls-rush-fc' RETURNING id, name, blog_url`;
  console.log('Club updated:', JSON.stringify(update[0]));
})();
