import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="We respect your privacy. This policy explains what we collect, why, and how we protect it."
      sections={[
        {
          heading: "Information we collect",
          body: [
            "Account details (name, email), your golf scores and lucky numbers, your selected charity and contribution percentage, subscription status, and payout details you provide to claim winnings.",
            "Payment data is processed by Razorpay; we never store your full card details.",
          ],
        },
        {
          heading: "How we use it",
          body: [
            "To operate your account, run monthly draws, process subscriptions and payouts, route charitable contributions, and send you transactional emails (welcome, subscription, draw and winner alerts).",
          ],
        },
        {
          heading: "Storage & security",
          body: [
            "Data is stored in Supabase (Postgres) with row-level security, and files (winner proofs, avatars) in Supabase Storage. Access is restricted and protected by authentication and encrypted role checks.",
          ],
        },
        {
          heading: "Third parties",
          body: [
            "We share data only with the providers needed to deliver the service: Razorpay (payments), Resend (email), and Supabase (database/storage). We do not sell your data.",
          ],
        },
        {
          heading: "Your rights",
          body: [
            "You can update your profile, change your charity, cancel your subscription, or request account deletion at any time by contacting support.",
          ],
        },
      ]}
    />
  );
}
