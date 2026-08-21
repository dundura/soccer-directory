// Cold outreach to clubs — the copy, in one place.
//
// These go to people who never asked to hear from us, which is the whole
// difference from every other email this app sends. US commercial email has to
// carry a real postal address and a working opt-out, so SENDER_ADDRESS below is
// not decoration: the send route refuses to run while it is unset.

export const SENDER_ADDRESS = ""; // TODO: postal address, required before sending
export const SENDER_NAME = "Neil Crawford";

// Resend will only send from a verified domain, and soccer-near-me.com is the
// only one on the account — a From of neil@anytime-soccer.com is rejected
// outright. Replies still reach Neil there via REPLY_TO. Change SENDER_EMAIL
// once anytime-soccer.com is verified in Resend.
export const SENDER_EMAIL = "neil@soccer-near-me.com";
export const REPLY_TO = "neil@anytime-soccer.com";
export const BCC = "neil@anytime-soccer.com";

const SITE = "https://www.soccer-near-me.com";

function footer(clubEmail: string) {
  const optOut = `${SITE}/opt-out?email=${encodeURIComponent(clubEmail)}`;
  return `
  <p style="margin:28px 0 0;font-size:12px;color:#8a97a4;line-height:1.6;">
    You are receiving this because ${SENDER_NAME} is building a free directory of youth soccer clubs.
    <a href="${optOut}" style="color:#8a97a4;">Tell me not to write again</a> and I will not contact you.<br>
    ${SENDER_ADDRESS}
  </p>`;
}

const shell = (body: string, clubEmail: string) => `
<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;max-width:560px;">
${body}
${footer(clubEmail)}
</div>`;

export type ColdEmail = {
  n: number;
  name: string;
  timing: string;
  subject: (club: string) => string;
  html: (club: string, clubEmail: string) => string;
};

export const COLD_EMAILS: ColdEmail[] = [
  {
    n: 1,
    name: "SNM Cold 1 — Free club listing",
    timing: "Day 0",
    subject: (club) => `Listing ${club} on Soccer Near Me`,
    html: (club, clubEmail) =>
      shell(
        `
  <p style="margin:0 0 16px;">Hi,</p>

  <p style="margin:0 0 16px;">I run a Facebook group for youth soccer families that has grown past <strong>100,000 members</strong>. The question that comes up more than any other is where to find a good club &mdash; so I built <a href="${SITE}" style="color:#0F3154;">Soccer Near Me</a> to answer it.</p>

  <p style="margin:0 0 16px;">I&rsquo;d like to add <strong>${club}</strong>, free.</p>

  <p style="margin:0 0 16px;">Here is a finished one so you can see what it looks like: <a href="${SITE}/clubs/kc-legends" style="color:#0F3154;">KC Legends</a>.</p>

  <p style="margin:0 0 16px;">Send me your age groups and playing level and I&rsquo;ll build the page for you. You&rsquo;ll see it and approve it before it goes anywhere near the group.</p>

  <p style="margin:0;">Neil</p>`,
        clubEmail
      ),
  },
  {
    n: 2,
    name: "SNM Cold 2 — Blog write-up",
    timing: "4–5 days after email 1, non-repliers only",
    subject: (club) => `Re: Listing ${club} on Soccer Near Me`,
    html: (club, clubEmail) =>
      shell(
        `
  <p style="margin:0 0 16px;">Hi,</p>

  <p style="margin:0 0 16px;">Following up on the listing for <strong>${club}</strong>.</p>

  <p style="margin:0 0 16px;">One thing I didn&rsquo;t mention: alongside the listing I write the club up properly. Here is the one for KC Legends &mdash; <a href="${SITE}/blog/kc-legends-soccer-revolutionizing-player-development" style="color:#0F3154;">read it here</a>.</p>

  <p style="margin:0 0 16px;">Happy to do the same for you. Just reply with your age groups and playing level.</p>

  <p style="margin:0;">Neil</p>`,
        clubEmail
      ),
  },
];

export const getColdEmail = (n: number) => COLD_EMAILS.find((e) => e.n === n) || null;
