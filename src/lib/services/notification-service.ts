/**
 * Notification service — wraps Resend (SystemDesign §08).
 * Falls back to console logging when RESEND_API_KEY is absent, so flows work
 * end-to-end in the demo without an email provider. In production this would be
 * enqueued via Redis and dispatched by a worker.
 *
 * Emails use branded, email-client-safe HTML (tables + inline styles) in the
 * "Warm Impact" palette.
 */
import "server-only";
import { APP } from "@/lib/config";

interface EmailInput {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info(`[email:mock] → ${to} | ${subject}`);
    return;
  }

  // Default to Resend's shared sender, which needs no domain verification.
  // Set RESEND_FROM to "Name <you@your-verified-domain>" once you verify a domain.
  const from = process.env.RESEND_FROM || "GolfGive <onboarding@resend.dev>";

  // Without a verified domain, Resend only delivers to the account owner's email.
  // Set RESEND_TEST_REDIRECT to that address to receive every email while testing.
  const redirect = process.env.RESEND_TEST_REDIRECT;
  const recipient = redirect || to;
  const finalHtml = redirect
    ? `<p style="margin:0 0 8px;color:#9a8f82;font-size:12px">[test redirect — originally to ${to}]</p>${html}`
    : html;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: recipient, subject, html: finalHtml }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error(`[email] Resend rejected (${res.status}): ${detail}`);
      if (res.status === 403) {
        console.error(
          "[email] Tip: with no verified domain, Resend only delivers to your " +
            "own account email. Verify a domain at resend.com/domains and set RESEND_FROM.",
        );
      }
    }
  } catch (err) {
    console.error("[email] send failed", err);
  }
}

/* --------------------------------------------------------------------------
 * Branded HTML template
 * ------------------------------------------------------------------------ */

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://golfgive.app").replace(/\/$/, "");

const COLORS = {
  bg: "#faf6f1", // warm cream
  card: "#ffffff",
  text: "#211e1b", // warm charcoal
  muted: "#7a6f64",
  border: "#ece4da",
  primary: "#f2562a", // coral
  accent: "#1fb2a6", // teal
};


interface TemplateOpts {
  preheader: string;
  heading: string;
  intro: string;
  /** Optional emphasised box (e.g. amount, plan). */
  highlight?: { label: string; value: string };
  /** Optional call-to-action button. */
  cta?: { label: string; href: string };
  outro?: string;
}

function layout(o: TemplateOpts): string {
  const highlight = o.highlight
    ? `
      <tr><td style="padding:8px 0 24px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#fff3ee,#e9faf8);border:1px solid ${COLORS.border};border-radius:14px">
          <tr><td style="padding:20px 24px;text-align:center">
            <div style="font-size:13px;color:${COLORS.muted};text-transform:uppercase;letter-spacing:.05em">${o.highlight.label}</div>
            <div style="font-size:30px;font-weight:700;color:${COLORS.text};margin-top:4px">${o.highlight.value}</div>
          </td></tr>
        </table>
      </td></tr>`
    : "";

  const cta = o.cta
    ? `
      <tr><td style="padding:8px 0 8px">
        <a href="${o.cta.href}" style="display:inline-block;background:${COLORS.accent};color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:13px 26px;border-radius:999px">${o.cta.label}</a>
      </td></tr>`
    : "";

  const outro = o.outro
    ? `<tr><td style="padding:12px 0 0;font-size:14px;line-height:1.6;color:${COLORS.muted}">${o.outro}</td></tr>`
    : "";

  return `<!doctype html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${o.heading}</title></head>
<body style="margin:0;padding:0;background:${COLORS.bg}">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${o.preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.bg};padding:32px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:${COLORS.card};border:1px solid ${COLORS.border};border-radius:18px;overflow:hidden">
        <!-- header -->
        <tr><td style="padding:24px 32px;border-bottom:1px solid ${COLORS.border}">
          <span style="display:inline-block;width:28px;height:28px;line-height:28px;text-align:center;background:${COLORS.primary};color:#fff;border-radius:8px;font-size:15px;vertical-align:middle">♥</span>
          <span style="font-size:18px;font-weight:700;color:${COLORS.text};vertical-align:middle;margin-left:8px">${APP.name}</span>
        </td></tr>
        <!-- body -->
        <tr><td style="padding:32px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="font-size:22px;font-weight:700;color:${COLORS.text};padding-bottom:12px">${o.heading}</td></tr>
            <tr><td style="font-size:15px;line-height:1.65;color:${COLORS.text};padding-bottom:20px">${o.intro}</td></tr>
            ${highlight}
            ${cta}
            ${outro}
          </table>
        </td></tr>
        <!-- footer -->
        <tr><td style="padding:20px 32px;border-top:1px solid ${COLORS.border};font-size:12px;color:${COLORS.muted}">
          ${APP.name} · Play. Win. Give.<br>
          You're receiving this because you have a ${APP.name} account.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/* --------------------------------------------------------------------------
 * Email definitions
 * ------------------------------------------------------------------------ */

export const Emails = {
  welcome: (name: string) => ({
    subject: "Welcome to GolfGive 🏌️",
    html: layout({
      preheader: "Track your scores, enter the monthly draw, and make an impact.",
      heading: `Welcome aboard, ${name}!`,
      intro:
        "You're all set. Log your last 5 golf scores, pick your lucky numbers for the monthly draw, and choose a charity to support with every subscription.",
      cta: { label: "Go to your dashboard", href: `${SITE_URL}/dashboard` },
      outro: "Play with purpose — every round you log helps a good cause.",
    }),
  }),

  subscriptionActivated: (plan: string) => ({
    subject: "Your GolfGive subscription is active ✅",
    html: layout({
      preheader: `Your ${plan} plan is active. You're entered into this month's draw.`,
      heading: "Your subscription is active",
      intro:
        "Thanks for subscribing! Your plan is now active and you're automatically entered into this month's prize draw.",
      highlight: { label: "Active plan", value: `${plan[0].toUpperCase()}${plan.slice(1)}` },
      cta: { label: "Set your lucky numbers", href: `${SITE_URL}/dashboard/draws` },
    }),
  }),

  winnerAlert: (amount: string) => ({
    subject: "🎉 You won a GolfGive draw!",
    html: layout({
      preheader: `Congratulations! You won ${amount}.`,
      heading: "Congratulations — you won! 🎉",
      intro:
        "Your numbers came up in this month's draw. Add your payout details so we can send your winnings.",
      highlight: { label: "You won", value: amount },
      cta: { label: "Add payout details", href: `${SITE_URL}/dashboard/winnings` },
    }),
  }),

  payoutPaid: (amount: string) => ({
    subject: "Your GolfGive payout is on its way 💸",
    html: layout({
      preheader: `Your prize of ${amount} has been marked as paid.`,
      heading: "Your payout has been sent",
      intro:
        "Great news — your winnings have been marked as paid and are on their way to your account.",
      highlight: { label: "Amount paid", value: amount },
      outro: "Thank you for playing and giving. See you in the next draw!",
    }),
  }),

  termsAccepted: (name: string) => ({
    subject: "You accepted the GolfGive Terms & Conditions",
    html: layout({
      preheader: "Confirmation of your acceptance of our Terms & Conditions.",
      heading: "Thanks for accepting our terms",
      intro: `Hi ${name}, this confirms that you accepted the GolfGive Terms & Conditions and Privacy Policy when creating your account. Keep this email for your records.`,
      cta: { label: "Read the Terms", href: `${SITE_URL}/terms` },
      outro: "If this wasn't you, please contact support immediately.",
    }),
  }),

  subscriptionRenewed: (plan: string) => ({
    subject: "Your GolfGive subscription renewed 🔄",
    html: layout({
      preheader: `Your ${plan} plan renewed successfully. You're entered into this month's draw.`,
      heading: "Subscription renewed",
      intro:
        "Your payment went through and your subscription has been renewed. You're all set for this month's prize draw and your charity contribution continues.",
      highlight: { label: "Renewed plan", value: `${plan[0].toUpperCase()}${plan.slice(1)}` },
      cta: { label: "View your dashboard", href: `${SITE_URL}/dashboard` },
    }),
  }),

  subscriptionCancelled: (plan: string) => ({
    subject: "Your GolfGive subscription was cancelled",
    html: layout({
      preheader: "Your subscription has been cancelled.",
      heading: "Subscription cancelled",
      intro: `Your ${plan} plan has been cancelled. You'll keep access until the end of your current billing period, after which score tracking and draw entry will pause. We're sad to see you go!`,
      cta: { label: "Resubscribe anytime", href: `${SITE_URL}/subscribe` },
      outro: "Changed your mind? You can resubscribe in one click.",
    }),
  }),

  subscriptionLapsed: () => ({
    subject: "Your GolfGive subscription has lapsed ⚠️",
    html: layout({
      preheader: "We couldn't renew your subscription.",
      heading: "Your subscription lapsed",
      intro:
        "We couldn't process your latest payment, so your subscription has lapsed and you're no longer entered into the monthly draw. Resubscribe to pick up where you left off.",
      cta: { label: "Reactivate subscription", href: `${SITE_URL}/subscribe` },
      outro: "Need help? Reply to this email and we'll sort it out.",
    }),
  }),
};
