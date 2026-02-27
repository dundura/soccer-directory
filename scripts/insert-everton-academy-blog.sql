INSERT INTO blog_posts (id, slug, title, excerpt, content, category, date, featured, read_time, cover_image, created_at, updated_at)
VALUES (
  'b11',
  'everton-academy-experience-pike-county-georgia',
  'Everton Academy Experience: World-Class Soccer Training Comes to Pike County, Georgia',
  'The world-renowned Everton Soccer Academy is hosting an intensive ID camp in Williamson, Georgia from April 27–May 1. Here is everything you need to know about this incredible opportunity for U10–U19 players.',
  $body$
<!-- EVERTON ACADEMY EXPERIENCE - CAMP SPOTLIGHT -->
<style>
.ast-success-widget {
    font-family: Georgia, serif;
    line-height: 1.8;
    color: #1F4E79;
    max-width: 100%;
    margin: 0 auto;
}

.ast-success-widget p {
    color: #1F4E79;
    margin-bottom: 30px;
    line-height: 1.9;
}

.ast-success-widget h2 + p,
.ast-success-widget h3 + p,
.ast-success-widget h4 + p {
    margin-top: 20px;
}

.ast-success-widget .action-box p,
.ast-success-widget .highlight-box p,
.ast-success-widget .warning-box p,
.ast-success-widget .testimonial-box p {
    margin-bottom: 20px;
}

.ast-success-widget h1,
.ast-success-widget h2,
.ast-success-widget h3,
.ast-success-widget h4 {
    color: #1F4E79 !important;
    font-weight: bold;
}

.ast-success-widget h1 {
    font-size: 2.5em;
    line-height: 1.3;
    margin-bottom: 20px;
}

.ast-success-widget h2 {
    font-size: 1.8em;
    margin-top: 50px;
    margin-bottom: 25px;
}

.ast-success-widget h3 {
    font-size: 1.4em;
    margin-top: 35px;
    margin-bottom: 20px;
}

.ast-success-widget h4 {
    font-size: 1.2em;
    margin-top: 25px;
    margin-bottom: 15px;
}

.ast-success-widget .category-tag {
    display: inline-block;
    background-color: #DC373E;
    color: white;
    padding: 8px 16px;
    font-size: 0.85em;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 20px;
}

.ast-success-widget .timeline-number {
    display: inline-block;
    background-color: #DC373E;
    color: white;
    width: 45px;
    height: 45px;
    border-radius: 50%;
    text-align: center;
    line-height: 45px;
    font-size: 1.4em;
    font-weight: bold;
    margin-right: 15px;
    float: left;
}

.ast-success-widget .timeline-title {
    overflow: hidden;
    margin-bottom: 20px;
}

.ast-success-widget table {
    width: 100%;
    border-collapse: collapse;
    margin: 30px 0;
    font-size: 0.95em;
    border: 1px solid #ddd;
}

.ast-success-widget thead tr {
    background-color: #1F4E79;
    color: white;
    text-align: left;
}

.ast-success-widget th {
    padding: 12px;
    text-align: left;
    font-weight: bold;
    color: white;
}

.ast-success-widget td {
    padding: 12px;
    border-bottom: 1px solid #ddd;
    color: #1F4E79;
}

.ast-success-widget tbody tr:nth-child(even) {
    background-color: #f9f9f9;
}

.ast-success-widget tbody tr:hover {
    background-color: #f5f5f5;
}

.ast-success-widget .highlight-box {
    background-color: #fffbf0;
    border-left: 4px solid #DC373E;
    padding: 20px;
    margin: 30px 0;
}

.ast-success-widget .action-box {
    background-color: #f0f8ff;
    border: 2px solid #1F4E79;
    padding: 20px;
    margin: 30px 0;
    border-radius: 5px;
}

.ast-success-widget .testimonial-box {
    background-color: #f9f9f9;
    border-left: 4px solid #1F4E79;
    padding: 25px;
    margin: 30px 0;
    font-style: italic;
}

.ast-success-widget .warning-box {
    background-color: #fff3cd;
    border-left: 4px solid #DC373E;
    padding: 20px;
    margin: 30px 0;
}

.ast-success-widget .cta-button {
    display: inline-block;
    background-color: #DC373E;
    color: white !important;
    padding: 15px 30px;
    text-decoration: none;
    font-weight: bold;
    font-size: 1.1em;
    border-radius: 5px;
    margin: 10px 5px;
    transition: background-color 0.3s;
}

.ast-success-widget .cta-button:hover {
    background-color: #b52d33;
}

.ast-success-widget .cta-button.secondary {
    background-color: #1F4E79;
}

.ast-success-widget .cta-button.secondary:hover {
    background-color: #163a5c;
}

.ast-success-widget .stat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin: 30px 0;
}

.ast-success-widget .stat-card {
    background: white;
    border: 2px solid #1F4E79;
    border-radius: 10px;
    padding: 20px;
    text-align: center;
}

.ast-success-widget .stat-card .stat-number {
    font-size: 2.2em;
    font-weight: bold;
    color: #DC373E;
    display: block;
}

.ast-success-widget .stat-card .stat-label {
    font-size: 0.9em;
    color: #666;
    margin-top: 5px;
}

.ast-success-widget .hero-image {
    width: 100%;
    max-height: 450px;
    object-fit: cover;
    border-radius: 10px;
    margin: 30px 0;
}

.ast-success-widget .side-image {
    width: 100%;
    max-height: 350px;
    object-fit: cover;
    border-radius: 8px;
    margin: 20px 0;
}

.ast-success-widget ul, .ast-success-widget ol {
    margin: 15px 0 25px 20px;
    color: #1F4E79;
}

.ast-success-widget li {
    margin-bottom: 10px;
    line-height: 1.7;
}

@media (max-width: 768px) {
    .ast-success-widget h1 { font-size: 1.8em; }
    .ast-success-widget h2 { font-size: 1.4em; }
    .ast-success-widget h3 { font-size: 1.2em; }
    .ast-success-widget .stat-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>

<div class="ast-success-widget">

<span class="category-tag">Camp Spotlight</span>

<h1>Everton Academy Experience: World-Class Soccer Training Comes to Pike County, Georgia</h1>

<img src="https://scontent-atl3-1.xx.fbcdn.net/v/t39.30808-6/534455645_1322981336291262_1609676285769106761_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=2a1932&_nc_ohc=ZVegg_xbd38Q7kNvwFleLh_&_nc_oc=Admei0Sw0e_yiczjrO76Uk-cxDVPCgmHqyZ7nEIUQwXAjLmJt15aclVJGsAkrZRAnbE&_nc_zt=23&_nc_ht=scontent-atl3-1.xx&_nc_gid=8aGZMzpo3o7vRWe9h5uEZQ&oh=00_Afts5P_0oYiZjjTgKoVOZESS7o4rcy_BbvbEyGozOBPnIg&oe=69A77BEB" alt="Everton Academy Experience at Pike Soccer Complex" class="hero-image" />

<p>For youth soccer players in Georgia and the surrounding region, an extraordinary opportunity is about to land in their backyard. The <strong>Everton Academy Experience</strong>, powered by one of the most iconic clubs in English football, is coming to <strong>Pike County, Georgia</strong> from <strong>April 27th through May 1st, 2026</strong>.</p>

<p>Organized by <strong>Pike Soccer Inc</strong> in partnership with <strong>Fury FC</strong>, this intensive ID camp brings Everton FC&rsquo;s globally recognized coaching methodology to the Pike Soccer Complex in Williamson, Georgia. Whether your child is a competitive travel player or an aspiring academy-level athlete, this is one of the most unique training experiences available in the Southeast this spring.</p>

<div class="highlight-box">
<h4>Why This Camp Matters</h4>
<p>Everton FC is one of the founding members of the English Football League and has one of the most respected youth academies in world soccer. Their coaching curriculum emphasizes technical excellence, tactical intelligence, and creative decision-making &mdash; the same development philosophy that has produced Premier League stars for over a century. Having access to this level of instruction without traveling overseas is a rare and valuable opportunity.</p>
</div>

<h2>Camp Details at a Glance</h2>

<table>
<thead>
<tr>
<th>Detail</th>
<th>Information</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Camp Name</strong></td>
<td>Everton Academy Experience</td>
</tr>
<tr>
<td><strong>Organizer</strong></td>
<td>Pike Soccer Inc &amp; Fury FC</td>
</tr>
<tr>
<td><strong>Location</strong></td>
<td>Pike Soccer Complex, Williamson, Georgia</td>
</tr>
<tr>
<td><strong>Dates</strong></td>
<td>April 27th &ndash; May 1st, 2026</td>
</tr>
<tr>
<td><strong>Age Groups</strong></td>
<td>U10 &ndash; U19 (Boys &amp; Girls)</td>
</tr>
<tr>
<td><strong>U10&ndash;U14 Session</strong></td>
<td>5:00 PM &ndash; 7:00 PM</td>
</tr>
<tr>
<td><strong>U15&ndash;U19 Session</strong></td>
<td>7:00 PM &ndash; 9:00 PM</td>
</tr>
<tr>
<td><strong>Cost (Fury Club Players)</strong></td>
<td>$230</td>
</tr>
<tr>
<td><strong>Cost (Non-Fury Players)</strong></td>
<td>$245</td>
</tr>
<tr>
<td><strong>Camp Type</strong></td>
<td>Specialty Clinic / ID Camp</td>
</tr>
<tr>
<td><strong>Contact</strong></td>
<td>doc@pikesoccer.org &bull; (770) 314-5866</td>
</tr>
</tbody>
</table>

<h2>What Is the Everton Academy Experience?</h2>

<p>The Everton Academy Experience is a multi-day intensive camp that brings the training methods, coaching philosophy, and player development standards of <strong>Everton Football Club</strong> directly to local communities. Everton&rsquo;s international academy program operates in over 40 countries, delivering the same curriculum used at their Finch Farm training complex in Liverpool, England.</p>

<p>Players who attend can expect:</p>

<ul>
<li><strong>Professional-level coaching</strong> from Everton-certified instructors who travel internationally to deliver the program</li>
<li><strong>Technical sessions</strong> focused on ball mastery, first touch, passing accuracy, and finishing</li>
<li><strong>Tactical training</strong> covering positional play, movement off the ball, and game intelligence</li>
<li><strong>Small-sided games</strong> designed to develop quick thinking and creativity under pressure</li>
<li><strong>Individual player evaluations</strong> with personalized feedback on strengths and areas for development</li>
</ul>

<img src="https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/641561221_1476900194232708_8821427812355753159_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=7b2446&_nc_ohc=BoGPFTZI-p0Q7kNvwF5Uqw0&_nc_oc=AdlMkLoQQmMvdg3mCIKRI6uonZ7Qvbw0jQ12bUFJMoxqYRK7U1t23htSTxlPZtrolgo&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_gid=OQ5F-RhtbynNclNFYjUl_w&oh=00_AfsQYUp2EGnbTpdYLc22lPPHjvq0W4kK-kDDhCWrCw8ukQ&oe=69A766AE" alt="Pike Soccer and Everton Academy training" class="side-image" />

<h2>Who Should Attend?</h2>

<p>This camp is designed for <strong>competitive players aged U10 through U19</strong>, both boys and girls. Whether your player is currently on a travel team, a club team, or simply passionate about taking their skills to the next level, the Everton Academy Experience meets players where they are and challenges them to grow.</p>

<p>This is an especially strong fit for:</p>

<ul>
<li><strong>Travel and club players</strong> who want exposure to international coaching methods</li>
<li><strong>Aspiring elite players</strong> looking to be identified by top-level programs</li>
<li><strong>Players preparing for tryout season</strong> who want to sharpen their technical skills and tactical awareness</li>
<li><strong>Any competitive youth player</strong> in the Georgia, Alabama, or broader Southeast region looking for a unique training experience close to home</li>
</ul>

<div class="action-box">
<h4>Two Age-Specific Sessions Each Day</h4>
<p>The camp runs two dedicated sessions daily to ensure age-appropriate training intensity and curriculum:</p>
<p><strong>U10 &ndash; U14:</strong> 5:00 PM &ndash; 7:00 PM &mdash; Focus on technical foundations, ball mastery, creativity, and love for the game.</p>
<p><strong>U15 &ndash; U19:</strong> 7:00 PM &ndash; 9:00 PM &mdash; Advanced tactical concepts, positional play, high-intensity competitive exercises, and ID-level evaluation.</p>
</div>

<h2>What Makes Everton&rsquo;s Approach Different?</h2>

<p>Everton FC has been developing youth talent since the club&rsquo;s founding in 1878. Their academy program is built on several core principles that set it apart from typical camp experiences:</p>

<h3>1. The &ldquo;Everton Way&rdquo; Coaching Philosophy</h3>
<p>Everton&rsquo;s academy is built around developing the <strong>complete player</strong> &mdash; not just athletes who can run fast or kick hard, but thinkers who understand the game. Sessions emphasize decision-making speed, spatial awareness, and the ability to play under pressure. Every drill is designed with game-realistic scenarios so players learn skills they can immediately transfer to match situations.</p>

<h3>2. Individual Player Development Focus</h3>
<p>Unlike many large-group camps where players get lost in the crowd, the Everton Academy Experience is structured to provide <strong>individualized attention</strong>. Coaches assess each player&rsquo;s technical ability, tactical understanding, physical attributes, and mental approach, then provide targeted feedback.</p>

<h3>3. Global Curriculum, Local Delivery</h3>
<p>The same training methodology used at Everton&rsquo;s elite Finch Farm academy in England is adapted and delivered at every Everton Academy Experience worldwide. Your child receives the same quality of instruction that developing professionals receive &mdash; just tailored for their age and level.</p>

<div class="stat-grid">
<div class="stat-card">
<span class="stat-number">5</span>
<span class="stat-label">Days of Intensive Training</span>
</div>
<div class="stat-card">
<span class="stat-number">U10&ndash;U19</span>
<span class="stat-label">Age Range</span>
</div>
<div class="stat-card">
<span class="stat-number">40+</span>
<span class="stat-label">Countries with Everton Academies</span>
</div>
<div class="stat-card">
<span class="stat-number">1878</span>
<span class="stat-label">Year Everton FC Founded</span>
</div>
</div>

<h2>About Pike Soccer Inc &amp; Fury FC</h2>

<p><strong>Pike Soccer Inc</strong> has been a pillar of the youth soccer community in Pike County, Georgia, providing players of all ages with opportunities to develop their skills and compete. Their partnership with <strong>Fury FC</strong> to bring the Everton Academy Experience to the region reflects their commitment to providing world-class development opportunities to players who might otherwise have to travel hours to access elite-level training.</p>

<p>The camp will be held at the <strong>Pike Soccer Complex</strong> in Williamson, Georgia &mdash; a facility well-suited to host this caliber of event.</p>

<div class="highlight-box">
<h4>Bonus: Win an Autographed Everton FC Jersey!</h4>
<p>$5 from every registration fee goes toward a raffle drawing for an <strong>autographed Everton FC jersey</strong>. Train like a Toffee, and you might just take home a piece of Everton history.</p>
</div>

<h2>Pricing &amp; Registration</h2>

<table>
<thead>
<tr>
<th>Player Type</th>
<th>Cost</th>
</tr>
</thead>
<tbody>
<tr>
<td>Fury FC Club Players</td>
<td><strong>$230</strong></td>
</tr>
<tr>
<td>Non-Fury Club Players</td>
<td><strong>$245</strong></td>
</tr>
</tbody>
</table>

<p><strong>Space is limited.</strong> This is an ID camp format, which means roster spots are intentionally kept small to ensure quality coaching and individual attention. Do not wait until the last minute &mdash; secure your player&rsquo;s spot as soon as possible.</p>

<div style="text-align: center; margin: 40px 0;">
<a href="https://system.gotsport.com/programs/16046039B?reg_role=player" target="_blank" class="cta-button">Register Now on GotSport</a>
<a href="/camps/everton-academy-experience" class="cta-button secondary">View Full Camp Listing</a>
</div>

<h2>How to Prepare Your Player</h2>

<p>To get the most out of the Everton Academy Experience, here are some tips for the week leading up to camp:</p>

<ul>
<li><strong>Stay active and rested.</strong> Make sure your player is getting enough sleep and staying hydrated in the days before camp begins.</li>
<li><strong>Bring the right gear.</strong> Cleats, shin guards, a water bottle, and a positive attitude. The rest is provided by the coaching staff.</li>
<li><strong>Set goals.</strong> Talk with your player about what they want to improve. Having specific focus areas helps them get more from every session.</li>
<li><strong>Keep an open mind.</strong> Everton&rsquo;s coaching style may be different from what your player is used to. Encourage them to embrace new ideas and techniques.</li>
<li><strong>Practice at home.</strong> Supplement camp training with daily ball work at home &mdash; even 15 minutes of touches a day makes a difference. <a href="/blog/15-minute-daily-soccer-routine-for-kids">Check out our 15-Minute Daily Soccer Routine</a>.</li>
</ul>

<h2>Why Attending Matters Beyond the Field</h2>

<p>Camps like the Everton Academy Experience do more than improve technical skills. They expose young players to <strong>different coaching perspectives</strong>, build confidence, and help them understand what elite-level development looks like. For players dreaming of college soccer, academy pathways, or even professional careers, experiencing an international club&rsquo;s methodology firsthand is an invaluable step.</p>

<p>Even for players who simply love the game and want to get better, five days of focused, high-quality training in a structured environment can produce breakthroughs that months of regular practice alone cannot.</p>

<div class="action-box">
<h4>Don&rsquo;t Miss This Opportunity</h4>
<p>The Everton Academy Experience at Pike Soccer Complex is a rare chance to train the Everton way &mdash; right here in Georgia. With limited spots available, families are encouraged to register early.</p>
<p><strong>Dates:</strong> April 27th &ndash; May 1st, 2026</p>
<p><strong>Location:</strong> Pike Soccer Complex, Williamson, Georgia</p>
<p><strong>Ages:</strong> U10 &ndash; U19 (Boys &amp; Girls)</p>
<p><strong>Contact:</strong> <a href="mailto:doc@pikesoccer.org">doc@pikesoccer.org</a> &bull; (770) 314-5866</p>
<p><strong>Facebook:</strong> <a href="https://www.facebook.com/PikeSoccerGA/" target="_blank">Pike Soccer GA</a></p>
<div style="text-align: center; margin-top: 20px;">
<a href="https://system.gotsport.com/programs/16046039B?reg_role=player" target="_blank" class="cta-button">Register Now &rarr;</a>
</div>
</div>

<hr style="margin: 50px 0; border: none; border-top: 2px solid #ddd;" />

<div style="text-align: center; padding: 30px 0;">
<p style="font-size: 0.95em;">Looking for more soccer camps, clubs, and training opportunities near you?</p>
<a href="/camps" class="cta-button secondary">Browse All Camps</a>
<a href="/clubs" class="cta-button secondary">Find Clubs Near You</a>
<a href="/trainers" class="cta-button secondary">Find a Private Trainer</a>
<br/><br/>
<p style="font-size: 0.85em; color: #999;">Powered by <a href="https://anytime-soccer.com" target="_blank" style="color: #DC373E; text-decoration: none;">Anytime Soccer Training</a> &mdash; The #1 app for youth soccer development</p>
</div>

</div>
$body$,
  'Camps',
  'February 27, 2026',
  true,
  '12 min',
  'https://scontent-atl3-1.xx.fbcdn.net/v/t39.30808-6/534455645_1322981336291262_1609676285769106761_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=2a1932&_nc_ohc=ZVegg_xbd38Q7kNvwFleLh_&_nc_oc=Admei0Sw0e_yiczjrO76Uk-cxDVPCgmHqyZ7nEIUQwXAjLmJt15aclVJGsAkrZRAnbE&_nc_zt=23&_nc_ht=scontent-atl3-1.xx&_nc_gid=8aGZMzpo3o7vRWe9h5uEZQ&oh=00_Afts5P_0oYiZjjTgKoVOZESS7o4rcy_BbvbEyGozOBPnIg&oe=69A77BEB',
  NOW(),
  NOW()
);
