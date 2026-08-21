// Cold outreach to clubs — the copy, in one place.
//
// Ported from the GHL templates. The merge fields become arguments:
//   {{contact.first_name}}   -> contactName, falling back to "there"
//   {{contact.company_name}} -> the club name

export const SENDER_NAME = "Neil Crawford";

// Resend will only send from a verified domain, and soccer-near-me.com is the
// only one on the account — a From of neil@anytime-soccer.com is rejected
// outright. Replies still reach Neil there via REPLY_TO. Change SENDER_EMAIL
// once anytime-soccer.com is verified in Resend.
export const SENDER_EMAIL = "neil@soccer-near-me.com";
export const REPLY_TO = "neil@anytime-soccer.com";
export const BCC = "neil@anytime-soccer.com";

const SITE = "https://www.soccer-near-me.com";
const GROUP = "https://www.facebook.com/groups/guestplayers";

// First name when we have one, "there" when we do not — "Hi ," reads like an
// unfinished mail merge.
const greeting = (contactName?: string | null) => {
  const first = String(contactName || "").trim().split(/\s+/)[0];
  return `Hi ${first || "there"},`;
};

// A one-line opt-out. Nothing else in this app emails people who did not ask
// for it, and an unsubscribe path is what keeps that defensible.
const footer = (clubEmail: string) => `
            <p style="margin:24px 0 0 0; font-size:12px; color:#8a97a4;">
              <a href="${SITE}/opt-out?email=${encodeURIComponent(clubEmail)}" style="color:#8a97a4;">Tell me not to write again</a>
            </p>`;

const shell = (body: string, clubEmail: string) => `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#ffffff;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff; padding:24px 0;">
  <tr>
    <td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:4px;">
        <tr>
          <td style="padding:32px 32px 24px 32px; font-family:Arial, Helvetica, sans-serif; font-size:15px; line-height:1.6; color:#222222;">
${body}
${footer(clubEmail)}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

// Outlook renders link text in the body colour without the conditional font tag.
const link = (href: string, text: string) =>
  `<a href="${href}" style="color:#1a73e8;; mso-style-textfill-fill-color: #1a73e8;"><!--[if mso]><font color="#1a73e8"><![endif]-->${text}<!--[if mso]></font><![endif]--></a>`;

export type ColdEmail = {
  n: number;
  name: string;
  timing: string;
  subject: (club: string) => string;
  html: (club: string, clubEmail: string, contactName?: string | null) => string;
};

export const COLD_EMAILS: ColdEmail[] = [
  {
    n: 1,
    name: "SNM Cold 1 — Free club listing",
    timing: "Day 0",
    subject: (club) => `Listing ${club} on Soccer Near Me`,
    html: (club, clubEmail, contactName) =>
      shell(
        `
            <p style="margin:0 0 16px 0;">${greeting(contactName)}</p>

            <p style="margin:0 0 16px 0;">
              A few years back I started a ${link(GROUP, "Facebook group")} for parents like me looking for clubs - it's grown to 100,000 members, so I built Soccer Near Me to make it easy for members to search and compare clubs.
            </p>

            <p style="margin:0 0 16px 0;">
              I didn't want to leave ${club} off the list. It's completely free - once your listing is live, I'll share it with the group.
            </p>

            <p style="margin:0 0 16px 0;">
              Here's what a finished one looks like:<br>
              ${link(`${SITE}/clubs/kc-legends`, `${SITE}/clubs/kc-legends`)}
            </p>

            <p style="margin:0 0 16px 0;">
              Just reply back with your age groups and playing level, and I'll create the first draft.
            </p>

            <p style="margin:0 0 16px 0;">
              I'll share it with you for editing and approval. Then I'll share it with the group.
            </p>

            <p style="margin:24px 0 0 0;">
              Best,<br>
              Neil
            </p>`,
        clubEmail
      ),
  },
  {
    n: 2,
    name: "SNM Cold 2 — Blog write-up",
    timing: "4–5 days after email 1, non-repliers only",
    subject: (club) => `Re: Listing ${club} on Soccer Near Me`,
    html: (club, clubEmail, contactName) =>
      shell(
        `
            <p style="margin:0 0 16px 0;">${greeting(contactName)}</p>

            <p style="margin:0 0 16px 0;">
              Following up on the listing for ${club}.
            </p>

            <p style="margin:0 0 16px 0;">
              One thing I didn't mention: alongside the listing I write the club up properly. Here's the one for KC Legends:<br>
              ${link(`${SITE}/blog/kc-legends-soccer-revolutionizing-player-development`, "Read it here")}
            </p>

            <p style="margin:0 0 16px 0;">
              Happy to do the same for you. Just reply with your age groups and playing level.
            </p>

            <p style="margin:24px 0 0 0;">
              Best,<br>
              Neil
            </p>`,
        clubEmail
      ),
  },
];

export const getColdEmail = (n: number) => COLD_EMAILS.find((e) => e.n === n) || null;
