import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";
import { MIN_CHARITY_PCT } from "@/lib/config";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      intro="These terms govern your use of GolfGive. By creating an account or subscribing, you agree to them."
      sections={[
        {
          heading: "1. Eligibility",
          body: [
            "You must be 18 years or older and legally permitted to participate in prize draws in your jurisdiction to use GolfGive.",
            "You are responsible for ensuring that participation in subscription-based draws is lawful where you live.",
          ],
        },
        {
          heading: "2. Subscriptions & Billing",
          body: [
            "GolfGive is offered as a monthly or yearly subscription billed securely via Razorpay. Subscriptions grant access to score tracking, monthly draw entry and charity contribution features.",
            "You may cancel at any time from your dashboard; access continues until the end of the current billing period. Lapsed or cancelled subscriptions lose access to subscriber-only features.",
          ],
        },
        {
          heading: "3. Draws & Prizes",
          body: [
            "Each month a set of winning numbers is drawn (randomly or via the published algorithmic method). Prizes are split across the 5/4/3-match tiers and shared equally among winners in a tier.",
            "Winners must complete verification (proof upload + admin review) and provide valid payout details before any payout is issued. GolfGive reserves the right to withhold prizes where verification fails or fraud is suspected.",
          ],
        },
        {
          heading: "4. Charitable Contributions",
          body: [
            `A minimum of ${MIN_CHARITY_PCT}% of every subscription is directed to the charity you select. Contributions are forwarded to partner charities and are non-refundable.`,
          ],
        },
        {
          heading: "5. Acceptable Use",
          body: [
            "You agree to provide accurate score data, not to manipulate draws, and not to misuse the platform. Accounts found violating these terms may be suspended.",
          ],
        },
        {
          heading: "6. Changes",
          body: [
            "We may update these terms from time to time. Material changes will be communicated by email. Continued use after changes constitutes acceptance.",
          ],
        },
      ]}
    />
  );
}
