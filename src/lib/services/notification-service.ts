/**
 * Notification service — wraps Resend (SystemDesign §08).
 * Falls back to console logging when RESEND_API_KEY is absent, so flows work
 * end-to-end in the demo without an email provider. In production this would be
 * enqueued via Redis and dispatched by a worker.
 */
import "server-only";

interface EmailInput {
  to: string;
  subject: string;
  body: string;
}

export async function sendEmail({ to, subject, body }: EmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info(`[email:mock] → ${to} | ${subject}\n${body}`);
    return;
  }
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "GolfGive <noreply@golfgive.app>",
        to,
        subject,
        html: `<div style="font-family:sans-serif">${body}</div>`,
      }),
    });
  } catch (err) {
    console.error("[email] send failed", err);
  }
}

export const Emails = {
  welcome: (name: string) => ({
    subject: "Welcome to GolfGive 🏌️",
    body: `Hi ${name}, welcome aboard! Track your scores, enter the monthly draw, and make an impact.`,
  }),
  subscriptionActivated: (plan: string) => ({
    subject: "Your GolfGive subscription is active",
    body: `Your ${plan} plan is now active. You're entered into this month's draw.`,
  }),
  winnerAlert: (amount: string) => ({
    subject: "🎉 You won a GolfGive draw!",
    body: `Congratulations! You won ${amount}. Upload your score proof to claim your prize.`,
  }),
  payoutPaid: (amount: string) => ({
    subject: "Your GolfGive payout is on its way",
    body: `Your prize of ${amount} has been marked as paid. Thank you for playing and giving!`,
  }),
};
